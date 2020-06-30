'use strict';

const PromiseTool = require('../../promise-tool');

const ExpressApp = require('./express-app');
const ExpressRequest = require('./express-request');
const ExpressResponse = require('./express-response');

/**
 * @param {Object=} opts
 * @param {Object=} opts.query
 * @param {Object=} opts.body
 * @param {Object=} opts.params
 * @param {Object=} opts.locals
 * @param {Object=} opts.meta
 * @returns {{req: ExpressRequest, res: ExpressResponse, app: ExpressApp}}
 */
function create(opts = {}) {

    let app = new ExpressApp({ locals: opts.locals });
    let req = new ExpressRequest({ app, ...opts });
    let res = new ExpressResponse({ req, locals: opts.locals });

    next.deferred = PromiseTool.createDeferred();

    function next(err) {
        if (err) {
            next.deferred.forceReject(err);
            return;
        }
        next.deferred.forceResolve();
    }

    return { req, res, app, next };
}

function restoreNext(fn) {
    fn.deferred = PromiseTool.createDeferred();
}

module.exports = {
    ExpressApp,
    ExpressRequest,
    ExpressResponse,
    create,
    restoreNext
};