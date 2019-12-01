'use strict';

let Promise = require('bluebird');
let PromiseTool = require('./promise-tool');
let Exception = require('./exception');

const BufferQueueConst = require('./lib/constants/buffer-queue');

const MAX_ITEMS_DEFAULT     = 2500;
const MAX_TIME_DEFAULT      = null;
const LOGGER_START_DEFAULT  = 10;
const LOGGER_EACH_DEFAULT   = 100;
const ITEM_PROMISES_DEFAULT = true;

class BufferQueue {

    /**
     * @param {Object}         opts
     * @param {String}         opts.name         Name to be used on alerter
     * @param {Function}       opts.iterator     Function to be iterated
     * @param {Number=}        opts.maxItems     Max count of items that can have until flush
     * @param {Number=}        opts.maxTime      Max time in ms that items can live in the buffer until flush
     * @param {Boolean=}       opts.itemPromises
     * @param {WinstonLogger=} opts.logger
     * @param {Number=}        opts.loggerStart
     * @param {Number=}        opts.loggerEach
     */
    constructor(opts) {
        this.name         = opts.name;
        this.iterator     = opts.iterator;
        this.maxItems     = opts.maxItems     != null ? opts.maxItems : MAX_ITEMS_DEFAULT;
        this.maxTime      = opts.maxTime      != null ? opts.maxTime  : MAX_TIME_DEFAULT;
        this.logger       = opts.logger       || null;
        this.loggerStart  = opts.loggerStart  != null ? opts.loggerStart  : LOGGER_START_DEFAULT;
        this.loggerEach   = opts.loggerEach   != null ? opts.loggerEach   : LOGGER_EACH_DEFAULT;
        this.itemPromises = opts.itemPromises != null ? opts.itemPromises : ITEM_PROMISES_DEFAULT;

        this.queue           = [];
        this.flushIntervalId = null;
    }

    /* istanbul ignore next */
    start() {
        this.createFlushInterval();
    }

    stop() {
        this.clearFlushInterval();
    }

    createFlushInterval() {
        if (this.maxTime == null || this.flushIntervalId != null) {
            return;
        }
        this.flushIntervalId = setInterval(this.flush.bind(this), this.maxTime);
    }

    clearFlushInterval() {
        if (this.flushIntervalId != null) {
            clearInterval(this.flushIntervalId);
            this.flushIntervalId = null;
        }
    }

    /**
     * @param {Object[]} items
     * @return {null}
     */
    addMany(items) {
        //
        // ATTENTION: This method is only supported when a promise is not expected. Handling bucket segmentation for many
        // ATTENTION: items is a complex feature that is not worth it at the time.
        //
        if (this.itemPromises === true) {
            throw new Exception(BufferQueueConst.ErrorCode.ERROR_ADD_MANY_NOT_SUPPORTED, 'Method .addMany() is not supported when item promises is enabled');
        }

        this.createFlushInterval();
        this.queue = this.queue.concat(items);

        if (this.queue.length >= this.maxItems) {
            this.flush()
            .then(() => {
                return null;
            });
        }

        return null;
    }

    /**
     * @param {Object} item
     * @return {Promise|null}
     */
    add(item) {
        let deferred = null;

        this.createFlushInterval();

        if (this.itemPromises === true) {
            deferred = PromiseTool.createDeferred();
            this.queue.push([item, deferred]);
        }
        else {
            this.queue.push(item);
        }

        if (this.queue.length >= this.maxItems) {
            this.flush()
            .then(() => {
                return null;
            });
        }

        return deferred;
    }

    /* istanbul ignore next */
    notify() {

    }

    /**
     * @return {Promise}
     */
    flush() {
        let pairs = this.queue.splice(0, this.maxItems);
        let items = null;

        if (this.itemPromises === true) {
            items = new Array(pairs.length);

            for (let i = 0; i < pairs.length; i++) {
                items[i] = pairs[i][0];
            }
        }
        else {
            items = pairs;
        }

        var promise = this.iterator(items);

        if (this.itemPromises !== true) {
            return promise
            .catch(err => {
                if (this.logger != null) {
                    this.logger.notify(this.name + ' | BufferQueue Error').steps(this.loggerStart, this.loggerEach).msg('buffer-queue.js:: Error at %s Buffer. Error: ', this.name, err);
                }
            })
            .finally(() => {
                this.notify();
            });
        }

        return promise
        .then(() => {
            for (var i = 0; i < pairs.length; i++) {
                pairs[i][1].forceResolve();
            }
        })
        .catch(err => {
            for (var i = 0; i < pairs.length; i++) {
                pairs[i][1].forceReject(err);
            }
        });
    }
}

module.exports = BufferQueue;
