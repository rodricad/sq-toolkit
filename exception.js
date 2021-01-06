'use strict';

const util = require('util');

const ExceptionConst = require('./lib/constants/exception');

class Exception extends Error {

    /**
     * @param {String} code     Code
     * @param {String} tpl      Message template, accepts wildcards for formatting. Example: %s %d. Uses util.format(...)
     * @param {...*}   tplArgs
     */
    constructor() {
        let code    = arguments[0];
        let tplArgs = [];

        for (var i = 1; i < arguments.length; i++) {
            tplArgs.push(arguments[i]);
        }

        let message = util.format.apply(util, tplArgs);

        super(message);

        this.name    = this.constructor.name;
        this.message = message;
        this.code    = code != null ? code : null;

        Error.captureStackTrace(this, this.constructor);
    }

    /**
     * @param {Exception|Error} err
     * @return {String|*}
     */
    static getMessage(err) {
        if (err == null || (err instanceof Error) === false) {
            return err;
        }
        if (err._message) {
            return err._message;
        }
        err._message = `code::${err.code || null} msg::${JSON.stringify(err.message || null)} stack::${JSON.stringify(err.stack || null)}`;
        return err._message;
    }
}

Exception.ErrorCode = ExceptionConst.ErrorCode;

module.exports = Exception;
