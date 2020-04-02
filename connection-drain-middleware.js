'use strict';
const util = require('util');
const LRU = require('lru-cache');
const PromiseTool = require('./promise-native-tool');
const Exception = require('./exception');

/**
 * This is to provide a smooth mechanism for server shutdown and connection draining by:
 *      * Add "Connection: close" every X seconds to prevent infinite keep-alive connections
 *      * Handle SIGTERM signal marking the app as draining and shutting down the http server when received
 *      * Provide a health-check endpoint (by default in /_health) that returns HTTP 200 normally or HTTP 500 when the app is draining
 *
 * Usage:
 *
 *      const ConnectionDrainMiddlewarw = require('sq-toolkit/connection-drain-middleware');
 *
 *  - on app.init():
 *      ...
 *      this.app = express();
 *      this.app.use(requestMiddleware);  // this is optional
 *      this.app.locals.connectionDrainHelper = new ConnectionDrainingHelper(app, logger);
 */
class ConnectionDrainMiddleware {
    /**
     * Setup health check and connection draining mechanism to work with kubernetes/load balancing infrastructure
     * @param anExpressApp - The express application instance
     * @param logger - A sq-logger instance
     * @param {Object=} options
     * @param {number=40} options.keepAliveBreakSeconds - Interval after which keep-alive connections will be break
     * @param {number=5} options.keepAliveBreakDeltaSeconds - Limit for random secs added/subtracted to the break interval of each connection to prevent breaking every connection at the same moment
     * @param {number=10} options.httpServerCloseTimeoutSeconds - Timeout to wait the http server for graceful shutdown once SIGTERM is received. After that the process will exit
     * @param {string='connection-drain-helper'} options.logPrefix - Prefix to add to every log line within this middleware
     * @param {string='/_health'} options.healthCheckEndpoint - Endpoint for the health-check controller
     */
    constructor(anExpressApp, logger, options = {}) {
        if(anExpressApp == null){
            throw new Exception(Exception.ErrorCode.ERROR_INVALID_PARAMETER, 'A express app must be provided.');
        }
        if(logger == null){
            throw new Exception(Exception.ErrorCode.ERROR_INVALID_PARAMETER, 'A sq-logger instance must be provided.');
        }
        this.expressApp = anExpressApp;
        this.fdMap = new LRU({ max: 10000 });
        this.logger = logger;
        this.keepAliveBreakSeconds = options.keepAliveBreakSeconds || 40;
        this.keepAliveBreakDeltaSeconds = options.keepAliveBreakDeltaSeconds || 5;
        this.httpServerCloseTimeoutSeconds = options.httpServerCloseTimeoutSeconds != null ? options.httpServerCloseTimeoutSeconds : 10;
        this.logPrefix = options.logPrefix || 'connection-drain-helper';

        anExpressApp.locals.isDraining = false;
        anExpressApp.use(this._keepAliveBreakMiddleware.bind(this));
        anExpressApp.get(options.healthCheckEndpoint || '/_health', this._healthCheckMiddleware.bind(this));
        this._setupSIGTERMHandler();
    }

    _setupHttpServer(httpServer) {
        this.httpServer = httpServer;
        httpServer.on('connection', (socket) => {
            this.fdMap.del(socket._handle.fd);
        });
    }

    /**
     * Generate an expiration timestamp within keepAliveBreakSeconds +/- keepAliveBreakDeltaSeconds
     * @returns {number}
     */
    _generateExpirationTs(){
        return new Date(new Date().getTime() + 1000 * (this.keepAliveBreakSeconds - this.keepAliveBreakDeltaSeconds + 2 * this.keepAliveBreakDeltaSeconds * Math.random()));
    }

    _isExpired(connectionInfo){
        return connectionInfo.expiresAt < new Date();
    }

    _keepAliveBreakMiddleware(req, res, next) {
        if(this.httpServer == null){
            this._setupHttpServer(req.connection.server);
        }
        let connectionExpired = false;
        let fd = req.socket._handle.fd;
        let connectionInfo = this.fdMap.get(fd);
        let ip = req.locals && req.locals.ip;
        let qs = req.query || {};
        let ci = qs.ci || (req.body && req.body.ci);
        let debug = qs.debug;
        let debugSeq = qs.debugSeq;
        if (connectionInfo == null) {
            let expiresAt = this._generateExpirationTs();
            this.fdMap.set(fd, { expiresAt: expiresAt, count: 1 });
            this.logger.debug('%s NEW CONNECTION: fd:%s expiresAt:%s ip:%s ci:%s path:%s debug:%s seq:%s', this.logPrefix, fd, expiresAt, ip, ci, req.path, debug, debugSeq);
        } else {
            let expiresAt = new Date(connectionInfo.expiresAt);
            if (this._isExpired(connectionInfo)) {
                connectionExpired = true;
                this.logger.debug('%s CONNECTION EXPIRED: fd:%s expiresAt:%s ip:%s ci:%s path:%s debug:%s seq:%s', this.logPrefix, fd, expiresAt, ip, ci, req.path, debug, debugSeq);
            } else {
                let nextCount = connectionInfo.count + 1;
                if (nextCount % 100 === 0) {
                    this.logger.debug('%s EXISTENT CONNECTION: fd:%s expiresAt:%s reqCount:%s ip:%s ci:%s path:%s debug:%s seq:%s', this.logPrefix, fd, expiresAt, nextCount, ip, ci, req.path, debug, debugSeq);
                }
                connectionInfo.count = nextCount;
            }
        }

        if (connectionExpired || req.app.locals.isDraining) {
            res.set('Connection', 'close');
        }

        next();
    }

    _healthCheckMiddleware(req, res, next) {
        let status = 200;
        if (req.app.locals.isDraining) {
            status = 500;
        }
        res.status(status).end();
    }

    // Call process.exit after passed delay to allow log calls reach destination
    async _delayedExit(exitValue, delay = 500) {
        await PromiseTool.delay(delay);
        process.exit(exitValue);
    }

    async _closeHttpServer() {
        let closeServerAsync = util.promisify(this.httpServer.close.bind(this.httpServer));
        this.logger.info('%s: Stopping server. No new connections will be accepted', this.logPrefix);
        await closeServerAsync();
        this.logger.info('%s: All pending connections finished. Exiting process', this.logPrefix);
        return this._delayedExit(0);
    }

    _setupSIGTERMHandler() {
        process.on('SIGTERM', async () => {
            this.logger.info('%s: SIGTERM received - Starting graceful shutdown...', this.logPrefix);
            this.expressApp.locals.isDraining = true;
            try {
                if (this.httpServer) {
                    // do not wait on purpose
                    this._closeHttpServer();
                    await PromiseTool.delay(this.httpServerCloseTimeoutSeconds * 1000);
                    this.logger.info('%s: Not all pending connections were closed. Forcing process exit', this.logPrefix);
                    this._delayedExit(-1);
                } else {
                    this.logger.info('%s: Server was not set. Exiting process', this.logPrefix);
                    this._delayedExit(0);
                }
            } catch (err) {
                this.logger.error('%s: Exception during SIGTERM handling - Error:', this.logPrefix, err);
                this._delayedExit(-2);
            }
        });
    }
}

module.exports = ConnectionDrainMiddleware;