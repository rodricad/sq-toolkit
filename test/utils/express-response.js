
class ExpressResponse {

    /**
     * @param {Object=}        opts
     * @param {ExpressRequest} opts.req
     * @param {Object=}        opts.locals
     */
    constructor(opts) {
        this.req = opts.req;
        this.locals = opts.locals || {};
    }

    /**
     * @param {Number} statusCode
     * @param {Object=} headers
     */
    writeHead(statusCode, headers) {

    }

    /**
     * @param {String=} value
     */
    end(value) {

    }
}

module.exports = ExpressResponse;