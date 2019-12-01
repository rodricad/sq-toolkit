'use strict';

let sinon       = require('sinon');
let PromiseTool = require('../../promise-tool');

class NotifyUtil {

    /**
     * @param {Function} Class
     * @param {Number=}  times
     * @return {Object}
     */
    static getNotify(Class, times) {
        let count = times == null ? 1 : times;
        let deferred = PromiseTool.createDeferred();

        let stub = sinon.stub(Class.prototype, 'notify').callsFake(function () {
            count--;
            if (count === 0) {
                deferred.forceResolve();
            }
        });

        return { deferred: deferred, stub: stub };
    }

    /**
     * @param {Object}  notify
     * @param {Promise} notify.deferred
     * @param {*}       notify.stub
     */
    static restore(notify) {
        notify.stub.restore();
    }
}

module.exports = NotifyUtil;
