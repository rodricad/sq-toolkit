'use strict';

const ObjectId = require('bson/lib/bson/objectid');

const CryptoURL = require('./crypto-url');
const Exception = require('./exception');

const ENCODED_OBJECT_ID_REGEX = /^[0-9a-fA-F_-]{16}$/;
const ENCODED_OBJECT_ID_ENCODING = 'hex';
const OBJECT_ID_HEX_REGEX = /^[0-9a-fA-F]{24}$/;

class EncodedObjectId {

    /**
     * @param {ObjectId|ObjectID|String} objectId
     * @return {String}
     */
    static encode(objectId) {
        if (this.isObjectId(objectId) === false && this.isObjectIdString(objectId) === false) {
            throw new Exception(Exception.ErrorCode.ERROR_INVALID_PARAMETER, 'Parameter objectId must be valid ObjectId');
        }
        return CryptoURL.encodeBase64(objectId.toString(), ENCODED_OBJECT_ID_ENCODING);
    }

    /**
     * @param {String} encodedObjectId
     * @return {ObjectId|ObjectID}
     */
    static decode(encodedObjectId) {
        if (EncodedObjectId.isValid(encodedObjectId) === false) {
            throw new Exception(Exception.ErrorCode.ERROR_INVALID_PARAMETER, 'Parameter encodedObjectId must be valid EncodedObjectId string');
        }
        const str = CryptoURL.decodeBase64(encodedObjectId, ENCODED_OBJECT_ID_ENCODING);
        return new ObjectId(str);
    }

    /**
     * @param value
     * @return {Boolean}
     */
    static isValid(value) {
        return typeof value === 'string'
            && value.length === 16
            && ENCODED_OBJECT_ID_REGEX.test(value) === true;
    }

    /**
     * @param value
     * @return {Boolean}
     */
    static isObjectId(value) {
        return value instanceof ObjectId;
    }

    /**
     * @param value
     * @return {Boolean}
     */
    static isObjectIdString(value) {
        return typeof value === 'string'
            && value.length === 24
            && OBJECT_ID_HEX_REGEX.test(value) === true;
    }
}

module.exports = EncodedObjectId;