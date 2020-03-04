'use strict';

let async = require('neo-async');

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
     * @param {Number}   concurrency
     * @param {Function} iterator
     * @return {Promise}
     */
    static eachLimit(items, concurrency, iterator) {

        let deferred = PromiseNativeTool.createDeferred();

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
}

module.exports = PromiseNativeTool;
