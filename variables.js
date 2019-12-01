'use strict';

const MODE_DEVELOPMENT = 'development';
const MODE_TESTING     = 'testing';
const MODE_PRODUCTION  = 'production';

class Variables {

    /**
     * @returns {Boolean}
     */
    /* istanbul ignore next */
    static isDevelopmentMode() {
        return process.env.NODE_ENV === MODE_DEVELOPMENT;
    }

    /**
     * @returns {Boolean}
     */
    /* istanbul ignore next */
    static isTestingMode() {
        return process.env.NODE_ENV === MODE_TESTING;
    }

    /**
     * @returns {Boolean}
     */
    /* istanbul ignore next */
    static isProductionMode() {
        return process.env.NODE_ENV === MODE_PRODUCTION;
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
