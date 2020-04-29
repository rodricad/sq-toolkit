'use strict';

let crypto = require('crypto');
let base64url = require('base64-url');

let Exception = require('./exception');

const CRYPTO_CIPHER          = 'bf-ecb';
const CRYPTO_INPUT_ENCODING  = 'utf-8';
const CRYPTO_OUTPUT_ENCODING = 'base64';

const CRYPTO_MD5_HASH     = 'md5';
const CRYPTO_MD5_ENCODING = 'utf8';
const CRYPTO_MD5_DIGEST   = 'hex';

const ErrorCode = {
    INVALID_PARAMETER: 'ERROR_CRYPTO_URL_INVALID_PARAMETER',
    INVALID_CHECKSUM: 'ERROR_CRYPTO_URL_INVALID_CHECKSUM',
    INVALID_BLOCK_LENGTH: 'ERROR_CRYPTO_URL_INVALID_BLOCK_LENGTH',
    BAD_DECRYPT: 'ERROR_CRYPTO_URL_BAD_DECRYPT'
};

class CryptoURL {

    /**
     * @param {Object} options
     * @param {String} options.key
     */
    constructor(options) {
        this.key       = options.key;
        this.keyBuffer = Buffer.from(this.key);
        this.iv        = '';
    }

    /**
     * @param {Object}     options
     * @param {MapperURL=} mapperURL
     * @return {String}
     */
    encrypt(options, mapperURL) {
        //
        // TODO: Improve JSON serialize
        // TODO: - Use fast json stringify with schema's
        // TODO: - Avoid using quotes on properties
        //

        // 1. Map if needed
        let opts = mapperURL != null ? mapperURL.map(options) : options;

        // 2. Serialize
        let str = JSON.stringify(opts);

        // 3. Add MD5 Sentinel checksum
        let strMD5   = CryptoURL.md5(str);
        let sentinel = strMD5.substr(strMD5.length - 3);
        str = str + sentinel;

        // 4. Encrypt with Blowfish to Base64
        let cipher = crypto.createCipheriv(CRYPTO_CIPHER, this.keyBuffer, this.iv);

        let encrypted = null;

        encrypted =  cipher.update(str, CRYPTO_INPUT_ENCODING, CRYPTO_OUTPUT_ENCODING);
        encrypted += cipher.final(CRYPTO_OUTPUT_ENCODING);

        // 5. Encode Base64 non url safe characters (/+=)
        encrypted = CryptoURL.escapeBase64(encrypted);

        return encrypted;
    }

    /**
     * @param {String}     str
     * @param {MapperURL=} mapperURL
     * @return {Object}
     */
    decrypt(str, mapperURL) {
        // 1. Decode Base64 non url safe characters
        let decoded = CryptoURL.unescapeBase64(str);

        // 2. Decrypt Blowfish
        let decipher  = crypto.createDecipheriv(CRYPTO_CIPHER, this.keyBuffer, this.iv);
        let decrypted = null;

        try {
            decrypted =  decipher.update(decoded, CRYPTO_OUTPUT_ENCODING, CRYPTO_INPUT_ENCODING);
            decrypted += decipher.final(CRYPTO_INPUT_ENCODING);
        }
        catch(err) {
            if (err.code === 'ERR_OSSL_EVP_BAD_DECRYPT') {
                throw new Exception(ErrorCode.BAD_DECRYPT);
            }
            else if (err.code === 'ERR_OSSL_EVP_WRONG_FINAL_BLOCK_LENGTH') {
                throw new Exception(ErrorCode.INVALID_BLOCK_LENGTH);
            }
            throw err;
        }

        // 3. Split payload and sentinel and make checksum
        let payload  = decrypted.substr(0, decrypted.length - 3);
        let sentinel = decrypted.substr(decrypted.length - 3);
        let checksum = CryptoURL.md5(payload);
        checksum     = checksum.substr(checksum.length - 3);

        if (sentinel !== checksum) {
            throw new Exception(ErrorCode.INVALID_CHECKSUM, 'Invalid checksum. The string has been tampered. str:%s', str);
        }

        // 4. Deserialize
        let opts = JSON.parse(payload);

        // 5. Unmap if needed
        return mapperURL != null ? mapperURL.unmap(opts) : opts;
    }

    /**
     * Make base64 url safe
     * @param {String} str
     * @return {String}
     */
    static escapeBase64(str) {
        return base64url.escape(str);
    }

    /**
     * @param {String} str
     * @return {String}
     */
    static unescapeBase64(str) {
        return base64url.unescape(str);
    }

    /**
     * @param {String} str
     * @param {String=} encoding
     * @return {String}
     */
    static encodeBase64(str, encoding) {
        return base64url.encode(str, encoding);
    }

    /**
     * @param {String} str
     * @param {String=} encoding
     * @return {String}
     */
    static decodeBase64(str, encoding) {
        return base64url.decode(str, encoding);
    }

    /**
     * @param {String} str
     * @return {String}
     */
    static md5(str) {
        /* istanbul ignore next */
        if (str == null || typeof str !== 'string') {
            throw new Exception(ErrorCode.INVALID_PARAMETER, 'Parameter must be a valid String');
        }
        return crypto.createHash(CRYPTO_MD5_HASH).update(str, CRYPTO_MD5_ENCODING).digest(CRYPTO_MD5_DIGEST);
    }
}

CryptoURL.ErrorCode = ErrorCode;

module.exports = CryptoURL;
