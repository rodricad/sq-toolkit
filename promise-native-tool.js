'use strict';

let async = require('neo-async');
let Exception = require('./exception');

class PromiseNativeTool {

    /**
     * @param {Number} ms
     * @return {Promise}
     */
    static delay(ms) {
        const deferred = PromiseNativeTool.createDeferred();
        setTimeout(() => { deferred.forceResolve() }, ms);
        return deferred;
    }

    /**
     * http://bluebirdjs.com/docs/api/deferred-migration.html
     * Bluebird ditched and deprecated the Deferred API
     * @returns {Promise}
     */
    /* istanbul ignore next */
    static createDeferred() {
        let resolve = null;
        let reject  = null;
        var promise = new Promise((_resolve, _reject) => {
            resolve = _resolve;
            reject  = _reject;
        });
        promise.forceResolve = resolve;
        promise.forceReject  = reject;
        return promise;
    }

    /**
     * Bluebird has some limitations with iterators. These helpers wraps
     * the functions of https://github.com/suguru03/neo-async in promise
     * based static functions.
     */

    /**
     *
     * @param {Array}    items
     * @param {Function} iterator
     * @param {Object}   options
     * @param {Number=1} options.concurrency
     * @return {Promise}
     */
    static each(items, iterator, options) {

        let deferred = PromiseNativeTool.createDeferred();
        let concurrency = options.concurrency || 1;

        function _iterator(item, callback) {

            Promise.resolve()
            .then(() => {
                return iterator(item);
            })
            .then(() => {
                callback();
                return null;
            })
            .catch((err) => {
                callback(err);
            });
        }

        function _callback(err) {
            if (err) {
                deferred.forceReject(err);
            }
            else {
                deferred.forceResolve();
            }
        }

        async.eachLimit(items, concurrency, _iterator, _callback);

        return deferred;
    }

    /**
     * @param {Function} iterator
     * @param {Function} condition
     * @return {Promise}
     */
    static doWhilst(iterator, condition) {

        let deferred = PromiseNativeTool.createDeferred();

        function _iterator(callback) {
            Promise.resolve()
            .then(() => {
                return iterator();
            })
            .then((response) => {
                callback(null, response);
                return null;
            })
            .catch((err) => {
                callback(err);
            });
        }

        function _callback(err) {
            if (err) {
                deferred.forceReject(err);
            }
            else {
                deferred.forceResolve();
            }
        }

        async.doWhilst(_iterator, condition, _callback);

        return deferred;
    }

    /**
     * Iterate over a cursor
     * @param cursor
     * @param {Function} iterator
     * @return {Promise}
     */
    static eachCursor(cursor, iterator) {

        let deferred = PromiseNativeTool.createDeferred();
        let current  = null;
        let index    = 0;

        function _iterator(callback) {

            Promise.resolve()
            .then(() => {
                return cursor.next();
            })
            .then((response) => {
                current = response;

                if (current == null) {
                    callback(null);
                    return null;
                }

                return Promise.resolve()
                .then(() => {
                    return iterator(current, index);
                })
                .then(() => {
                    index++;
                    callback(null);
                    return null;
                });
            })
            .catch(function (err) {
                callback(err);
            });
        }

        function _condition() {
            return current != null;
        }

        function _callback(err) {
            if (err) {
                deferred.forceReject(err);
            }
            else {
                deferred.forceResolve();
            }
        }

        async.doWhilst(_iterator, _condition, _callback);

        return deferred;
    }

    /**
     * Iterate over all the values in the Iterable into an array and map the array to another using the given mapper function.
     * Promises returned by the mapper function are awaited for and the returned promise doesn't fulfill until all mapped promises have fulfilled as well.
     * If any promise in the array is rejected, or any promise returned by the mapper function is rejected, the returned promise is rejected as well.
     * @param {Object|Array} data - an array or object to iterate over
     * @param {Function}     iterator - iterator function. Function arguments: (element/value, idx/key)
     * @param {Object}       options
     * @param {Number=1}     options.concurrency - concurrency must be >= 1
     */
    static map(data, iterator, options) {

        let deferred = PromiseNativeTool.createDeferred();
        let concurrency = options.concurrency != null ? options.concurrency : 1;

        function _callback(err, res) {
            if (err) {
                deferred.forceReject(err);
            }
            else {
                deferred.forceResolve(res);
            }
        }

        function _iterator(arg, idx, callback) {
            Promise.resolve()
            .then(() => {
                return iterator(arg, idx);
            })
            .then((response) => {
                callback(null, response);
            })
            .catch((err) => {
                callback(err);
            });
        }

        if(concurrency < 1) {
            deferred.forceReject(new Exception(Exception.ErrorCode.ERROR_INVALID_PARAMETER, 'Concurrency must be >= 1'));
        }

        async.mapLimit(data, concurrency, _iterator, _callback);

        return deferred;
    }
}

module.exports = PromiseNativeTool;
