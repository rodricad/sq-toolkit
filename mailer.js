const nodemailer = require('nodemailer');

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
     * @param from
     * @param to
     * @param subject
     * @param text
     * @param html
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
            throw new Error('mailer.js::createInstance:: ERROR: Instance already created, use getInstance() instead.');
        }
        _instance = new Mailer(options);
    }

    /**
     * @return {Mailer}
     */
    static getInstance() {
        if(_instance == null) {
            throw new Error('mailer.js::getInstance:: ERROR: Must call createInstace() before using.');
        }
        return _instance;
    }

    static clearInstance() {
        _instance = null;
    }
}

module.exports = Mailer;