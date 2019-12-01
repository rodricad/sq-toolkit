'use strict';

describe('Crypto URL Test', function () {

    let chai   = require('chai');
    let expect = chai.expect;

    let MapperURL = require('../mapper-url');
    let CryptoURL = require('../crypto-url');
    let cryptoURL = null;

    before(function () {
        cryptoURL = new CryptoURL({ key: 'test' });
    });

    it('1. Encrypt and decrypt object. Expect string to be URL safe and Object to be deserialized (Dates are not parsed and undefined values are missing)', function () {

        let object = {
            string: 'value',
            zero: 0,
            int: 10,
            float: 10.14,
            nullValue: null,
            undefinedValue: undefined,
            emptyString: '',
            date: new Date('2018-01-01T08:00:00Z')
        };

        let encryptedString = cryptoURL.encrypt(object);
        expect(encryptedString).to.equals('OlNSdskIasVtNQV5fU6DLfJxxQ8xJVHWMgUUUUM_UWVlKZ_9VHRPecs6qLV5uPx0qyB2eDFmUSqYdVZPY9GRf85CSIqu33R5vkQv37nwCJi1Ra95A-MjxfkOmhvxI0lTWFbkKZQ7kQgjyDQqk2hJuTMkmnW4Bezr60afCOV6J-Y');

        let decryptedObject = cryptoURL.decrypt(encryptedString);

        expect(decryptedObject).to.eql({
            string: 'value',
            zero: 0,
            int: 10,
            float: 10.14,
            nullValue: null,
            emptyString: '',
            date: '2018-01-01T08:00:00.000Z'
        });
    });

    it('2. Encrypt, tamper encrypted string by appending and try to decrypt. Expect string to be URL and raise exception on decrypt block length', function () {

        let object = {
            string: 'value',
            zero: 0,
            int: 10,
            float: 10.14,
            nullValue: null,
            undefinedValue: undefined,
            emptyString: '',
            date: new Date('2018-01-01T08:00:00Z')
        };

        let encryptedString = cryptoURL.encrypt(object);
        expect(encryptedString).to.equals('OlNSdskIasVtNQV5fU6DLfJxxQ8xJVHWMgUUUUM_UWVlKZ_9VHRPecs6qLV5uPx0qyB2eDFmUSqYdVZPY9GRf85CSIqu33R5vkQv37nwCJi1Ra95A-MjxfkOmhvxI0lTWFbkKZQ7kQgjyDQqk2hJuTMkmnW4Bezr60afCOV6J-Y');

        try {
            let tamperedString = encryptedString + '_INVALID_APPEND_';
            cryptoURL.decrypt(tamperedString);
            chai.assert();
        }
        catch(err) {
            expect(err.code).to.equals('ERROR_CRYPTO_URL_INVALID_BLOCK_LENGTH');
        }
    });

    it('3. Encrypt, tamper encrypted string by prepending and try to decrypt. Expect string to be URL and raise exception on decrypt because of block length', function () {

        let object = {
            string: 'value',
            zero: 0,
            int: 10,
            float: 10.14,
            nullValue: null,
            undefinedValue: undefined,
            emptyString: '',
            date: new Date('2018-01-01T08:00:00Z')
        };

        let encryptedString = cryptoURL.encrypt(object);
        expect(encryptedString).to.equals('OlNSdskIasVtNQV5fU6DLfJxxQ8xJVHWMgUUUUM_UWVlKZ_9VHRPecs6qLV5uPx0qyB2eDFmUSqYdVZPY9GRf85CSIqu33R5vkQv37nwCJi1Ra95A-MjxfkOmhvxI0lTWFbkKZQ7kQgjyDQqk2hJuTMkmnW4Bezr60afCOV6J-Y');


        try {
            let tamperedString = '_INVALID_PREPEND_' + encryptedString;
            cryptoURL.decrypt(tamperedString);
            chai.assert();
        }
        catch(err) {
            expect(err.code).to.equals('ERROR_CRYPTO_URL_INVALID_BLOCK_LENGTH');
        }
    });

    it('4. Encrypt, tamper encrypted string by changing one char and try to decrypt. Expect string to be URL and raise exception on decrypt because of checksum', function () {

        let object = {
            string: 'value',
            zero: 0,
            int: 10,
            float: 10.14,
            nullValue: null,
            undefinedValue: undefined,
            emptyString: '',
            date: new Date('2018-01-01T08:00:00Z')
        };

        let encryptedString = cryptoURL.encrypt(object);
        expect(encryptedString).to.equals('OlNSdskIasVtNQV5fU6DLfJxxQ8xJVHWMgUUUUM_UWVlKZ_9VHRPecs6qLV5uPx0qyB2eDFmUSqYdVZPY9GRf85CSIqu33R5vkQv37nwCJi1Ra95A-MjxfkOmhvxI0lTWFbkKZQ7kQgjyDQqk2hJuTMkmnW4Bezr60afCOV6J-Y');

        try {
            let tamperedString = encryptedString.substring(0, encryptedString.length - 1) + 'A';
            cryptoURL.decrypt(tamperedString);
            chai.assert();
        }
        catch(err) {
            expect(err.code).to.equals('ERROR_CRYPTO_URL_BAD_DECRYPT');
        }
    });

    it('5. Encrypt, tamper encrypted string by changing one char and try to decrypt. Expect string to be URL and raise exception on decrypt because of checksum', function () {

        let object = {
            string: 'value',
            zero: 0,
            int: 10,
            float: 10.14,
            nullValue: null,
            undefinedValue: undefined,
            emptyString: '',
            date: new Date('2018-01-01T08:00:00Z')
        };

        let encryptedString = cryptoURL.encrypt(object);
        expect(encryptedString).to.equals('OlNSdskIasVtNQV5fU6DLfJxxQ8xJVHWMgUUUUM_UWVlKZ_9VHRPecs6qLV5uPx0qyB2eDFmUSqYdVZPY9GRf85CSIqu33R5vkQv37nwCJi1Ra95A-MjxfkOmhvxI0lTWFbkKZQ7kQgjyDQqk2hJuTMkmnW4Bezr60afCOV6J-Y');

        try {
            let tamperedString = '1' + encryptedString.substring(1);
            cryptoURL.decrypt(tamperedString);
            chai.assert();
        }
        catch(err) {
            expect(err.code).to.equals('ERROR_CRYPTO_URL_INVALID_CHECKSUM');
        }
    });

    it('6. Encrypt URL with and without mapper URL. Expect encrypted URL with mapper to be shorter', function () {

        let shortByLongMapping = {
            string: 's',
            zero: 'z',
            int: 'i',
            float: 'f',
            nullValue: 'n',
            undefinedValue: 'u',
            date: 'd'
        };

        let mapperURL = new MapperURL(shortByLongMapping);

        let object = {
            string: 'value',
            zero: 0,
            int: 10,
            float: 10.14,
            nullValue: null,
            undefinedValue: undefined,
            date: new Date('2018-01-01T08:00:00Z'),

            emptyString: ''
        };

        let encryptedLongString = cryptoURL.encrypt(object);
        expect(encryptedLongString).to.equals('OlNSdskIasVtNQV5fU6DLfJxxQ8xJVHWMgUUUUM_UWVlKZ_9VHRPecs6qLV5uPx0qyB2eDFmUSqYdVZPY9GRf1GeypsYGVrNJG1mpSpYJkgoGZXMlxYRwV4l1SxGLzJxRdR1ZXj_MuhYza3dk2ZbaRrUdMuDzne0H_0v3tnfVKU');
        expect(encryptedLongString).to.length(171);

        let encryptedShortString = cryptoURL.encrypt(object, mapperURL);
        expect(encryptedShortString).to.equals('AZjbtQKupoYXz-KBZAQ_XCbxqRQy7zrVsSy3sYPbeAYMqgY3xvHx0QI10Tx0AyYW5g1-ZuqJeXFVbqczUOk3QTROl9FJE7Ic-HPwNEJjBdespr_7rEH0Hau8QsO7w_ejBPyLq7fDo6Q');
        expect(encryptedShortString).to.length(139);

        let decryptedFromShort = cryptoURL.decrypt(encryptedShortString, mapperURL);
        expect(decryptedFromShort).to.eql({
            string: 'value',
            zero: 0,
            int: 10,
            float: 10.14,
            nullValue: null,
            date: '2018-01-01T08:00:00.000Z',
            emptyString: ''
        });
    });
});
