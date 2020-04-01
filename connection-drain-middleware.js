'use strict';
const util = require('util');
const LRU = require('lru-cache');
const PromiseTool = require('./promise-native-tool');
const Exception = require('./exception');

const INIT_ERROR_CODE = 'INIT_ERROR_CODE';

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
 *
 *  - on app.start():
 *      ...
 *      this._server = this.app.listen(port);
 *      this.app.locals.connectionDrainHelper.setHttpServer(this._server);
 */
class ConnectionDrainMiddleware {
    /**
     * Setup health check and connection draining mechanism to work with kubernetes/load balancing infrastructure
     * @param anExpressApp The express application
     * @param logger A logger instance
     * @param {Object=} options
     * @param {number=40} options.keepAliveBreakSeconds
     * @param {number=5} options.keepAliveBreakDeltaSeconds
     * @param {number=10} options.httpServerCloseTimeoutSeconds
     * @param {string='connection-drain-helper'} options.logPrefix
     * @param {string='/_health'} options.healthCheckEndpoint
     */
    constructor(anExpressApp, logger, options = {}) {
        if(anExpressApp == null){
            throw new Exception(INIT_ERROR_CODE, 'A express app must be provided.');
        }
        if(logger == null){
            throw new Exception(INIT_ERROR_CODE, 'A sq-logger instance must be provided.');
        }
        this.expressApp = anExpressApp;
        this.fdMap = new LRU({ max: 10000 });
        this.logger = logger;
        this.keepAliveBreakSeconds = options.keepAliveBreakSeconds || 40;
        this.keepAliveBreakDeltaSeconds = options.keepAliveBreakDeltaSeconds || 5;
        this.httpServerCloseTimeoutSeconds = options.httpServerCloseTimeoutSeconds || 10;
        this.logPrefix = options.logPrefix || 'connection-drain-helper';

        anExpressApp.locals.isDraining = false;
        anExpressApp.use(this._keepAliveBreakMiddleware.bind(this));
        anExpressApp.get(options.healthCheckEndpoint || '/_health', this._healthCheckMiddleware.bind(this));
        this._setupSIGTERMHandler();
    }

    setHttpServer(httpServer) {
        this.httpServer = httpServer;
        let self = this;
        httpServer.on('connection', (socket) => {
            self.fdMap.del(socket._handle.fd);
        });
    }

    /**
     * Generate an expiration timestamp within keepAliveBreakSeconds +/- keepAliveBreakDeltaSeconds
     * @returns {number}
     */
    _generateExpirationTs(){
        return new Date().getTime() + 1000 * (this.keepAliveBreakSeconds - this.keepAliveBreakDeltaSeconds + 2 * this.keepAliveBreakDeltaSeconds * Math.random());
    }

    _isExpired(connectionInfo){
        return connectionInfo.expiresAt < new Date().getTime();
    }

    _keepAliveBreakMiddleware(req, res, next) {
        if(this.httpServer == null){
            this.logger.notify(this.logPrefix + ' httpServer NOT SET!').steps(0, 1000).msg('Must call setHttpServer() with httpServer instance returned by app.listen(()');
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
            this.logger.debug('%s NEW CONNECTION: fd:%s expiresAt:%s ip:%s ci:%s path:%s debug:%s seq:%s', this.logPrefix, fd, new Date(expiresAt), ip, ci, req.path, debug, debugSeq);
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
    async _delayedExit(exitValue, delay) {
        delay = delay || 500;
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
        let self = this;
        process.on('SIGTERM', async () => {
            self.logger.info('%s: SIGTERM received - Starting graceful shutdown...', self.logPrefix);
            self.expressApp.locals.isDraining = true;
            try {
                if (self.httpServer) {
                    // do not wait on purpose
                    self._closeHttpServer();
                    await PromiseTool.delay(self.httpServerCloseTimeoutSeconds * 1000);
                    self.logger.info('%s: Not all pending connections were closed. Forcing process exit', self.logPrefix);
                    self._delayedExit(-1);
                } else {
                    self.logger.info('%s: Server was not set. Exiting process', self.logPrefix);
                    self._delayedExit(0);
                }
            } catch (err) {
                self.logger.error('%s: Exception during SIGTERM handling - Error:', self.logPrefix, err);
                self._delayedExit(-2);
            }
        });
    }
}

module.exports = ConnectionDrainMiddleware;