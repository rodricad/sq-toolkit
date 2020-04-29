'use strict';

describe('EncodedObjectId Tests', () => {

    const chai = require('chai');
    const expect = chai.expect;

    const ObjectId = require('bson/lib/bson/objectid');
    const EncodedObjectId = require('../encoded-object-id');

    it('1. isValid()', () => {
        // Test 64 characters of alphabet [ A-Z a-z 0-9 -_ ] 26 + 26 + 10 + 2 = 64
        _testValid('abcdefghijklmnop', true);
        _testValid('qrstuvwxyz012345', true);
        _testValid('qrstuvwxyz6789-_', true);
        _testValid('ABCDEFGHIJKLMNOP', true);
        _testValid('QRSTUVWXYZ012345', true);
        _testValid('QRSTUVWXYZ6789-_', true);

        // Test with spaces and invalid chars outside alphabet
        _testValid(' abcdefghijklmnop ', false);
        _testValid('XoeBCAea1GTGA2X~', false);
        _testValid('XoeBCAea1GTGA2X!', false);
    });

    function _testValid(value, expected) {
        expect(EncodedObjectId.isValid(value)).to.equals(expected);
    }

    describe('2. encode()', () => {

        it('1. Test encoding. Expect to encode correctly', () => {
            // Test with string
            _testEncode('000000006cf1c966eb2be244', 'AAAAAGzxyWbrK-JE');
            _testEncode('5e878a026cf1c966eb2be245', 'XoeKAmzxyWbrK-JF');
            // Test with ObjectId
            _testEncode(new ObjectId('000000006cf1c966eb2be244'), 'AAAAAGzxyWbrK-JE');
            _testEncode(new ObjectId('5e878a026cf1c966eb2be245'), 'XoeKAmzxyWbrK-JF');
        });

        it('2. Test encoding with invalid values. Expect to throw error', () => {
            _testEncodeError(undefined);
            _testEncodeError('');
            _testEncodeError(null);
            _testEncodeError(123);
            _testEncodeError('000000006cf1c966eb2be24~');
        });

        function _testEncode(objectId, expected) {
            const value = EncodedObjectId.encode(objectId);
            expect(value).to.equals(expected);
        }

        function _testEncodeError(objectId) {
            try {
                EncodedObjectId.encode(objectId);
                expect.fail('code should not be reached');
            }
            catch(err) {
                expect(err.code).to.equals('ERROR_INVALID_PARAMETER');
                expect(err.message).to.equals('Parameter objectId must be valid ObjectId');
            }
        }
    });

    describe('2. decode()', () => {

        it('1. Test decoding. Expect to decode correctly', () => {
            _testDecode('AAAAAGzxyWbrK-JE', new ObjectId('000000006cf1c966eb2be244'));
            _testDecode('XoeKAmzxyWbrK-JF', new ObjectId('5e878a026cf1c966eb2be245'));
        });

        it('2. Test decoding with invalid values. Expect to throw error', () => {
            _testDecodeError(undefined);
            _testDecodeError('');
            _testDecodeError(null);
            _testDecodeError(123);
            _testDecodeError('XoeKAmzxyWbrK-J~');
        });

        function _testDecode(encodedObjectId, expected) {
            const value = EncodedObjectId.decode(encodedObjectId);
            expect(value).to.eql(expected);
        }

        function _testDecodeError(encodedObjectId) {
            try {
                const value = EncodedObjectId.decode(encodedObjectId);
                expect.fail('code should not be reached');
            }
            catch(err) {
                expect(err.code).to.equals('ERROR_INVALID_PARAMETER');
                expect(err.message).to.equals('Parameter encodedObjectId must be valid EncodedObjectId string');
            }
        }
    });
});