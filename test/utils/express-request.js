
class ExpressRequest {

    /**
     * @param {Object}         opts
     * @param {ExpressApp}     opts.app
     * @param {Object=}        opts.query
     * @param {Object=}        opts.body
     * @param {Object=}        opts.params
     * @param {Object=}        opts.locals
     * @param {Object=}        opts.meta
     */
    constructor(opts) {
        this.app = opts.app || {};
        this.query = opts.query || {};
        this.body = opts.body || {};
        this.params = opts.params || {};
        this.locals = opts.locals || {};
        this.meta = opts.meta || {};
    }
}

module.exports = ExpressRequest;