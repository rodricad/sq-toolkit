"use strict";

const nodemailer = require('nodemailer');
const Exception = require('./exception');
const ErrorCode = require('./lib/constants/exception').ErrorCode;

let _instance = null;

class Mailer {

    /**
     * @param {Object}  options
     * @param {String}  options.host
     * @param {Number}  options.port
     * @param {Boolean} options.secure
     * @param {Object}  options.auth
     * @param {String}  options.auth.user
     * @param {String}  options.auth.password
     */
    constructor(options) {
        this._transporter = nodemailer.createTransport({
            host: options.host,
            port: options.port,
            secure: options.secure,
            auth: {
                user: options.auth.user,
                password: options.auth.password,
            }
        });
    }

    /**
     * @param {String} from     Email address to use as sender
     * @param {String} to       Recipient email address
     * @param {String} subject  Email subject
     * @param {String} text     Email body, in plain text
     * @param {String} html     Email body, in html
     * @return {*}
     */
    sendEmail(from, to, subject, text, html) {
        return this._transporter.sendMail({ from, subject, to, text, html });
    }

    /**
     * @param {Object}  options
     * @param {String}  options.host
     * @param {Number}  options.port
     * @param {Boolean} options.secure
     * @param {Object}  options.auth
     * @param {String}  options.auth.user
     * @param {String}  options.auth.password
     */
    static createInstance(options) {
        if(_instance != null) {
            throw new Exception(ErrorCode.ERROR_INSTANCE_ALREADY_CREATED, 'Mailer instance is already created and initialized. Use .getInstance() instead.');
        }
        _instance = new Mailer(options);
    }

    /**
     * @return {Mailer}
     */
    static getInstance() {
        if(_instance == null) {
            throw new Exception(ErrorCode.ERROR_NOT_INITIALIZED, 'Must call createInstace() before using.');
        }
        return _instance;
    }

    static clearInstance() {
        _instance = null;
    }
}

module.exports = Mailer;