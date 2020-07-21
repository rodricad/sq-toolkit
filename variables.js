'use strict';

const MODE_DEVELOPMENT = 'development';
const MODE_TESTING     = 'testing';
const MODE_PRODUCTION  = 'production';

let _NODE_ENV = process.env.NODE_ENV;
let _NODE_APP_INSTANCE = process.env.NODE_APP_INSTANCE;

class Variables {

    /**
     * @returns {Boolean}
     */
    /* istanbul ignore next */
    static isDevelopmentMode() {
        return _NODE_ENV === MODE_DEVELOPMENT;
    }

    /**
     * @returns {Boolean}
     */
    /* istanbul ignore next */
    static isTestingMode() {
        return _NODE_ENV === MODE_TESTING || _NODE_APP_INSTANCE === MODE_TESTING;
    }

    /**
     * @returns {Boolean}
     */
    /* istanbul ignore next */
    static isProductionMode() {
        return _NODE_ENV === MODE_PRODUCTION;
    }

    /**
     * @returns {Boolean}
     */
    /* istanbul ignore next */
    static returnErrorCode() {
        return Variables.isTestingMode() === true || Variables.isDevelopmentMode() === true;
    }
}

module.exports = Variables;
