
class ExpressApp {

    /**
     * @param {Object=} opts
     * @param {Object=} opts.locals
     */
    constructor(opts) {
        this.locals = opts.locals || {};
    }

    use(fn) {
        // Do nothing, it is created just to not break the tests.
    }

    get(fn) {
        // Do nothing, it is created just to not break the tests.
    }
}

module.exports = ExpressApp;