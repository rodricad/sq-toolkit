'use strict';

const _ = require('lodash');
const parseISO = require('date-fns/parseISO/index.js');
const ObjectId = require('bson/lib/bson/objectid');
const sanitizeHtml = require('sanitize-html');
const Exception = require('./exception');
const EncodedObjectId = require('./encoded-object-id');

const SanitizerConst = require('./lib/constants/sanitizer');

const EMAIL_REGEX = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
const EMAIL_PLUS_REGEX = / /g;

class Sanitizer {

    /**
     * @param value
     * @return {Boolean}
     */
    static isNullOrEmpty(value) {
        return value == null || value === '';
    }

    /**
     * @param value
     * @return {Boolean}
     */
    static isNullOrEmptyTrimmed(value) {
        if (value == null || value === '') {
            return true;
        }
        if (Sanitizer.isString(value) === true && value.trim() === '') {
            return true;
        }
        return false;
    }

    /**
     * @param value
     * @return {Boolean}
     */
    static isBoolean(value) {
        return value === true || value === false;
    }

    /**
     * @param value
     * @return {Boolean|null}
     */
    static toBoolean(value) {
        if (Sanitizer.isNullOrEmpty(value) === true) {
            return null;
        }
        if (Sanitizer.isBoolean(value) === true) {
            return value;
        }

        let str = (value + '').trim();

        if (str === 'true') {
            return true;
        }
        if (str === 'false') {
            return false;
        }
        return null;
    }

    /**
     * @param value
     * @return {Boolean}
     */
    static isNumber(value) {
        return Number.isFinite(value);
    }

    /**
     * @param value
     * @return {Number|null}
     */
    static toNumber(value) {
        if (Sanitizer.isNullOrEmpty(value) === true) {
            return null;
        }
        if (Sanitizer.isNumber(value) === true) {
            return value;
        }

        let str = (value + '').trim();

        if (Sanitizer.isNullOrEmpty(str) === true) {
            return null;
        }

        let converted = Number(str);

        if (Sanitizer.isNumber(converted) === true) {
            return converted;
        }
        else {
            return null;
        }
    }

    /**
     * @param value
     * @return {Boolean}
     */
    static isInteger(value) {
        return Sanitizer.isNumber(value) === true && value % 1 === 0;
    }

    /**
     * @param value
     * @return {Number|null}
     */
    static toInteger(value) {
        let converted = Sanitizer.toNumber(value);

        if (Sanitizer.isInteger(converted) === false) {
            return null;
        }

        return converted;
    }

    /**
     * @param value
     * @return {Boolean}
     */
    static isDate(value) {
        if (!(value instanceof Date)) {
            return false;
        }
        return Sanitizer.isDateValid(value);
    }

    /**
     * @param value
     * @return {Boolean}
     */
    static isDateValid(value) {
        return Sanitizer.isNumber(value.getTime()) === true;
    }

    /**
     * Only accepts the following ISO 8601 formats:
     *
     * "2022-01-01T00:00:00.000Z"
     * "2022-01-01T00:00:00Z"
     *
     * "2019-10-10T17:16:00.000-03:00"
     * "2019-10-10T17:16:00-03:00"
     *
     *
     * @param value
     * @return {Date|null}
     */
    static toDate(value) {
        if (Sanitizer.isNullOrEmpty(value) === true) {
            return null;
        }
        if (Sanitizer.isDate(value) === true) {
            return value;
        }

        let str  = (value + '').trim();

        if (str.length === 20 || str.length === 24) {
            if (str[str.length - 1] !== 'Z') {
                return null;
            }
        }
        else if (str.length === 25 || str.length === 29) {
            if (str[str.length - 6] !== '-' || str[str.length - 3] !== ':') {
                return null;
            }
        }
        else {
            return null;
        }

        let converted = parseISO(str);

        if (Sanitizer.isDateValid(converted) === true) {
            return converted;
        }

        return null;
    }

    /**
     * @param value
     * @return {Boolean}
     */
    static isString(value) {
        return typeof value === 'string';
    }

    /**
     * @param value
     * @return {String|null}
     */
    static toString(value) {
        if (Sanitizer.isNullOrEmpty(value) === true) {
            return null;
        }
        if (Sanitizer.isDate(value) === true) {
            return value.toISOString();
        }

        let converted = (value + '').trim();

        if (converted === '') {
            return null;
        }

        return converted;
    }

    /**
     * @param value
     * @return {Boolean}
     */
    static isArray(value) {
        return Array.isArray(value);
    }

    /**
     * @param value
     * @return {Array|null}
     */
    static toArray(value) {
        if (Sanitizer.isNullOrEmpty(value) === true) {
            return null;
        }
        if (Sanitizer.isArray(value) === true) {
            return value;
        }
        return [value];
    }

    /**
     * @param value
     * @return {Boolean}
     */
    static isObjectId(value) {
        return EncodedObjectId.isObjectId(value);
    }

    /**
     * @param value
     * @return {Boolean}
     */
    static isObjectIdString(value) {
        return EncodedObjectId.isObjectIdString(value);
    }

    /**
     * This method is a limited validation from the original ObjectId method. We validate only for 24 chars hex strings
     * because this method is intended to be used only as a controller sanitizer.
     * @reference https://github.com/mongodb/js-bson/blob/master/lib/objectid.js#L321
     * @param value
     * @returns {ObjectId|ObjectID|null}
     */
    static toObjectId(value) {
        if (Sanitizer.isObjectId(value) === true) {
            return value;
        }
        if (Sanitizer.isObjectIdString(value) === true) {
            return new ObjectId(value);
        }
        return null;
    }

    /**
     * @param value
     * @return {Boolean}
     */
    static isEncodedObjectId(value) {
        return EncodedObjectId.isValid(value);
    }

    /**
     * @param value
     * @return {Object}
     */
    static toEncodedObjectId(value) {
        let str = Sanitizer.toString(value);
        if (str == null) {
            return null;
        }
        if (Sanitizer.isEncodedObjectId(str) === true) {
            return str;
        }
        return null;
    }

    /**
     * Due to performance concerns, we do not validate RFC account and domain tld lengths.
     * This is based on manishsaraan/email-validator package.
     *
     * @reference https://github.com/manishsaraan/email-validator
     * @reference http://fightingforalostcause.net/misc/2006/compare-email-regex.php
     * @reference http://thedailywtf.com/Articles/Validating_Email_Addresses.aspx
     * @reference http://stackoverflow.com/questions/201323/what-is-the-best-regular-expression-for-validating-email-addresses/201378#201378
     *
     * @param value
     * @return {Boolean}
     */
    static isEmail(value) {
        if (Sanitizer.isString(value) === false) {
            return false;
        }
        if (value.length > 254) {
            return false;
        }
        return EMAIL_REGEX.test(value);
    }

    /**
     * @param value
     * @returns {String|null}
     */
    static toEmail(value) {
        let str = Sanitizer.toString(value);

        if (str == null) {
            return null;
        }

        // Lower and fix plus "+" encoding issue
        str = str.toLowerCase();
        str = str.replace(EMAIL_PLUS_REGEX, '+');

        if (Sanitizer.isEmail(str) === true) {
            return str;
        }
        return null;
    }

    /**
     * @param {String} value
     * @param {Object=} sanitizeHtmlOptions - {@link https://www.npmjs.com/package/sanitize-html}
     * @returns {String|null}
     */
    static toHTML(value, sanitizeHtmlOptions = null) {
        const converted = Sanitizer.toString(value);

        if (converted === null) {
            return null;
        }

        const html = sanitizeHtml(converted, sanitizeHtmlOptions);

        if (Sanitizer.isNullOrEmpty(html) === true) {
            return null;
        }

        return html;
    }

    /**
     * @param value
     * @return {Boolean}
     */
    static isObject(value) {
        return _.isPlainObject(value);
    };

    /**
     * @param value
     * @returns {Object|null}
     */
    static toObject(value) {
        if (Sanitizer.isNullOrEmptyTrimmed(value) === true) {
            return null;
        }

        if (Sanitizer.isObject(value) === true) {
            return value;
        }

        if (Sanitizer.isString(value) === false) {
            return null;
        }

        const { parsedObject = null } = Sanitizer._jsonParseSafe(value);

        if (parsedObject !== null && Sanitizer.isObject(parsedObject) === true) {
            return parsedObject;
        }

        return null;
    }

    /**
     * @param {String}   field
     * @param {*}        value
     * @param {Boolean=} mandatory
     * @param {*=}       def
     * @return {Boolean|null}
     */
    static boolean(field, value, mandatory = false, def = null) {
        return Sanitizer._sanitizeValue(field, value, mandatory, def, 'Boolean', Sanitizer.toBoolean);
    }

    /**
     * @param {String}   field
     * @param {*}        value
     * @param {Boolean}  mandatory
     * @param {*=}       def
     * @param {Number=}  min
     * @param {Number=}  max
     * @param {String=}  interval
     * @return {Number|null}
     */
    static number(field, value, mandatory = false, def = null, min = -Infinity, max = Infinity, interval = SanitizerConst.Interval.CLOSED_CLOSED) {
        let sanitized = Sanitizer._sanitizeValue(field, value, mandatory, def, 'Number', Sanitizer.toNumber);

        // If it is default, no need
        if (sanitized === def) {
            return sanitized;
        }

        return Sanitizer._sanitizeInterval(field, sanitized, min, max, interval);
    }

    /**
     * @param {String}   field
     * @param {*}        value
     * @param {Boolean}  mandatory
     * @param {*=}       def
     * @param {Number=}  min
     * @param {Number=}  max
     * @param {String=}  interval
     * @return {Number|null}
     */
    static integer(field, value, mandatory = false, def = null, min = -Infinity, max = Infinity, interval = SanitizerConst.Interval.CLOSED_CLOSED) {
        let sanitized = Sanitizer._sanitizeValue(field, value, mandatory, def, 'Integer', Sanitizer.toInteger);

        // If it is default, no need
        if (sanitized === def) {
            return sanitized;
        }

        return Sanitizer._sanitizeInterval(field, sanitized, min, max, interval);
    }

    /**
     * @param {String}  field
     * @param {*}       value
     * @param {Boolean} mandatory
     * @param {*=}      def
     * @return {Date|null}
     */
    static date(field, value, mandatory = false, def = null) {
        return Sanitizer._sanitizeValue(field, value, mandatory, def, 'Date', Sanitizer.toDate);
    }

    /**
     * @param {String}   field
     * @param {*}        value
     * @param {Boolean}  mandatory
     * @param {*=}       def
     * @param {Number=}  min
     * @param {Number=}  max
     * @param {String=}  interval
     * @return {String|null}
     */
    static string(field, value, mandatory = false, def = null, min = -Infinity, max = Infinity, interval = SanitizerConst.Interval.CLOSED_CLOSED) {
        let sanitized = Sanitizer._sanitizeValue(field, value, mandatory, def, 'String', Sanitizer.toString);

        // If it is default, no need
        if (sanitized === def) {
            return sanitized;
        }

        Sanitizer._sanitizeInterval(field, sanitized.length, min, max, interval);
        return sanitized;
    }

    /**
     * @param {String}   field
     * @param {*}        value
     * @param {Boolean}  mandatory
     * @param {*=}       def
     * @param {Function} sanitizer
     * @param {...*}     sanitizerArgs
     * @return {*}
     */
    static arrayItems(field, value, mandatory = false, def = null, sanitizer, ...sanitizerArgs) {
        let sanitized = Sanitizer._sanitizeValue(field, value, mandatory, def, 'Array', Sanitizer.toArray);

        // If it is default, no need
        if (sanitized === def) {
            return sanitized;
        }

        for (let i = 0; i < sanitized.length; i++) {
            let item = sanitized[i];
            let args = [field + '[' + i + ']', item, true, null].concat(sanitizerArgs);
            sanitized[i] = sanitizer.apply(Sanitizer, args);
        }

        return sanitized;
    }

    /**
     * @param {String}  field
     * @param {*}       value
     * @param {Boolean} mandatory
     * @param {*=}      def
     * @param {Array}   acceptedValues
     * @return {*}
     */
    static acceptedValue(field, value, mandatory = false, def = null, acceptedValues) {
        let empty = Sanitizer.isNullOrEmptyTrimmed(value);

        if (empty === true) {
            if (mandatory === true) {
                _throwMandatoryException(field, value, 'Accepted Value');
            }
            else {
                return def;
            }
        }

        if (acceptedValues.includes(value) === true) {
            return value;
        }
        else {
            _throwAcceptedValueException(field, value, acceptedValues);
        }
    }

    /**
     * @param {String}  field
     * @param {*}       value
     * @param {Boolean} mandatory
     * @param {*=}      def
     * @return {ObjectId|ObjectID|null}
     */
    static objectId(field, value, mandatory = false, def = null) {
        return Sanitizer._sanitizeValue(field, value, mandatory, def, 'ObjectId', Sanitizer.toObjectId);
    }

    /**
     * @param {String}  field
     * @param {*}       value
     * @param {Boolean} mandatory
     * @param {*=}      def
     * @return {String|null}
     */
    static encodedObjectId(field, value, mandatory = false, def = null) {
        return Sanitizer._sanitizeValue(field, value, mandatory, def, 'EncodedObjectId', Sanitizer.toEncodedObjectId);
    }

    /**
     * @param {String}  field
     * @param {*}       value
     * @param {Boolean} mandatory
     * @param {*=}      def
     * @return {String|null}
     */
    static email(field, value, mandatory = false, def = null) {
        return Sanitizer._sanitizeValue(field, value, mandatory, def, 'email', Sanitizer.toEmail);
    }

    /**
     * ATTENTION: This function doesn't throw exception if HTML string contains not allowed tags.
     * ATTENTION: The disallowed tags are discarded of escaped (according to disallowedTagsMode option).
     * @param {String}   field
     * @param {*}        value
     * @param {Boolean}  mandatory
     * @param {*}        [def = null]
     * @param {Number}   [min = -Infinity]
     * @param {Number}   [max = Infinity]
     * @param {String}   [interval = '[]']
     * @param {Object}   [sanitizeHtmlOptions = null]
     * @return {String|null}
     */
    static html(field, value, mandatory = false, def = null, min = -Infinity, max = Infinity, interval = SanitizerConst.Interval.CLOSED_CLOSED, sanitizeHtmlOptions = null) {
        const toHTMLSanitizer = (value) => Sanitizer.toHTML(value, sanitizeHtmlOptions);
        const sanitizedHTML = Sanitizer._sanitizeValue(field, value, mandatory, def, 'HTML', toHTMLSanitizer);

        // If it is default, sanitize is not needed
        if (sanitizedHTML === def) {
            return sanitizedHTML;
        }

        Sanitizer._sanitizeInterval(field, sanitizedHTML.length, min, max, interval);

        return sanitizedHTML;
    }

    /**
     * @param {String}   field
     * @param {*}        value
     * @param {Boolean}  mandatory
     * @param {*}        [def = null]
     * @return {Object|null}
     */
    static object(field, value, mandatory = false, def = null) {
        return Sanitizer._sanitizeValue(field, value, mandatory, def, 'Object', Sanitizer.toObject);
    }

    /**
     * @param {String}   field
     * @param {*}        value
     * @param {Boolean}  mandatory
     * @param {*}        def
     * @param {String}   type
     * @param {Function} toFn
     * @return {*}
     * @private
     */
    static _sanitizeValue(field, value, mandatory, def, type, toFn) {
        let empty = Sanitizer.isNullOrEmptyTrimmed(value);

        if (empty === true) {
            if (mandatory === true) {
                _throwMandatoryException(field, value, type);
            }
            else {
                return def;
            }
        }

        let sanitized = toFn(value);

        if (sanitized == null) {
            _throwInvalidException(field, value, type);
        }

        return sanitized;
    }

    /**
     * @param {String} field
     * @param {*}      value
     * @param {Number} min
     * @param {Number} max
     * @param {String} interval
     * @return {*}
     * @private
     */
    static _sanitizeInterval(field, value, min, max, interval) {

        if (min === -Infinity && max === Infinity) {
            return value;
        }

        if (interval === SanitizerConst.Interval.OPEN_OPEN) {
            if (value <= min ||  max <= value) {
                _throwIntervalException(field, value, min, max, interval)
            }
        }
        else if (interval === SanitizerConst.Interval.OPEN_CLOSED) {
            if (value <= min ||  max < value) {
                _throwIntervalException(field, value, min, max, interval)
            }
        }
        else if (interval === SanitizerConst.Interval.CLOSED_OPEN) {
            if (value < min ||  max <= value) {
                _throwIntervalException(field, value, min, max, interval)
            }
        }
        else if (interval === SanitizerConst.Interval.CLOSED_CLOSED) {
            if (value < min ||  max < value) {
                _throwIntervalException(field, value, min, max, interval)
            }
        }
        else {
            throw new Exception(SanitizerConst.ErrorCode.ERROR_SANITIZER, 'Invalid interval. field [%s] value [%s] interval %s', field, value, interval);
        }

        return value;
    }

    /**
     * @param value
     * @returns {{parsedObject:Object}|{error: Object}}
     * @private
     */
    static _jsonParseSafe(value) {
        try {
            const parsedObject = JSON.parse(value)
            return { parsedObject };
        }
        catch (error) {
            return { error };
        }
    }
}

Sanitizer.ErrorCode = SanitizerConst.ErrorCode;
Sanitizer.Interval  = SanitizerConst.Interval;

function _throwMandatoryException(field, value, type) {
    throw new Exception(SanitizerConst.ErrorCode.ERROR_SANITIZER, 'Mandatory field [%s] value [%s]. Must be valid %s', field, value, type);
}

function _throwInvalidException(field, value, type) {
    throw new Exception(SanitizerConst.ErrorCode.ERROR_SANITIZER, 'Invalid field [%s] value [%s]. Must be valid %s', field, value, type);
}

function _throwIntervalException(field, value, min, max, interval) {
    throw new Exception(SanitizerConst.ErrorCode.ERROR_SANITIZER, 'Out of interval. field [%s] value [%s]. Must be between %s%s,%s%s', field, value, interval[0], min, max, interval[1]);
}

function _throwAcceptedValueException(field, value, acceptedValues) {
    throw new Exception(SanitizerConst.ErrorCode.ERROR_SANITIZER, 'Invalid field [%s] value [%s]. Must be accepted value %s', field, value, JSON.stringify(acceptedValues));
}

module.exports = Sanitizer;
