'use strict';

describe('Sanitizer Test', function () {

    let _ = require('lodash');
    let util = require('util');
    let chai = require('chai');
    let expect = chai.expect;
    let assert = chai.assert;
    let ObjectId = require('bson/lib/bson/objectid');

    let Sanitizer = require('../sanitizer');

    const TEST_DATA = _getTestData();

    describe('1. Boolean', function () {

        it('1. Test .toBoolean() method', function () {

            let expected = [
                // Null or undefined
                null,
                null,

                // String
                null,
                null,
                null,
                null,
                null,
                null,

                // Zero
                null,
                null,
                null,
                null,
                null,
                null,

                // Int
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,

                // Float
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,

                // NaN
                null,
                null,
                null,

                // Infinity
                null,
                null,
                null,
                null,
                null,
                null,

                // Boolean
                true,
                false,
                true,
                false,
                true,
                false,
                null,
                null,
                null,
                null,

                // Date valid
                null,
                null,
                null,
                null,
                null,

                // Date valid but not accepted
                null,
                null,
                null,
                null,
                null,
                null,

                // Date invalid
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,

                // Array
                null,
                null,
                null,

                // Function
                null,
                null,

                // ObjectId
                null,
                null,
                null,
                null,

                // Email
                null,
                null,
                null,
                null,
                null,

                // EncodedObjectId
                null,
                null,
                null,
                null,
                null
            ];

            _testTo(Sanitizer.toBoolean, TEST_DATA, expected);
        });

        it('2. Test .boolean() sanitize method with mandatory=true', function () {

            let mandatoryMsg = 'Mandatory field';
            let invalidMsg   = 'Invalid field';

            let expected = [
                // Null or undefined
                mandatoryMsg,
                mandatoryMsg,

                // String
                mandatoryMsg,
                mandatoryMsg,
                mandatoryMsg,
                mandatoryMsg,
                invalidMsg,
                invalidMsg,

                // Zero
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Int
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Float
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // NaN
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Infinity
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Boolean
                true,
                false,
                true,
                false,
                true,
                false,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Date valid
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Date valid but not accepted
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Date invalid
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Array
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Function
                invalidMsg,
                invalidMsg,

                // ObjectId
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Email
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // EncodedObjectId
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg
            ];

            _testSanitize(Sanitizer.boolean, TEST_DATA, true, expected);
        });

        it('3. Test .boolean() sanitize method with mandatory=false', function () {

            let invalidMsg = 'Invalid field';

            let expected = [
                // Null or undefined
                '_DEFAULT_',
                '_DEFAULT_',

                // String
                '_DEFAULT_',
                '_DEFAULT_',
                '_DEFAULT_',
                '_DEFAULT_',
                invalidMsg,
                invalidMsg,

                // Zero
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Int
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Float
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // NaN
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Infinity
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Boolean
                true,
                false,
                true,
                false,
                true,
                false,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Date valid
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Date valid but not accepted
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Date invalid
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Array
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Function
                invalidMsg,
                invalidMsg,

                // ObjectId
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Email
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // EncodedObjectId
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg
            ];

            _testSanitize(Sanitizer.boolean, TEST_DATA, false, expected);
        });
    });

    describe('2. Number: Integer or Float', function () {

        it('1. Test .toNumber() method', function () {

            let expected = [
                // Null or undefined
                null,
                null,

                // String
                null,
                null,
                null,
                null,
                null,
                null,

                // Zero
                0,
                0,
                0,
                0,
                null,
                null,

                // Int
                1,
                -1,
                1,
                -1,
                1,
                -1,
                null,
                null,

                // Float
                1.5,
                -1.5,
                1.5,
                -1.5,
                1.5,
                -1.5,
                null,
                null,

                // NaN
                null,
                null,
                null,

                // Infinity
                null,
                null,
                null,
                null,
                null,
                null,

                // Boolean
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,

                // Date valid
                null,
                null,
                null,
                null,
                null,

                // Date valid but not accepted
                null,
                null,
                null,
                null,
                null,
                null,

                // Date invalid
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,

                // Array
                null,
                null,
                null,

                // Function
                null,
                null,

                // ObjectId
                null,
                null,
                null,
                null,

                // Email
                null,
                null,
                null,
                null,
                null,

                // EncodedObjectId
                null,
                null,
                null,
                null,
                null
            ];

            _testTo(Sanitizer.toNumber, TEST_DATA, expected);
        });

        it('2. Test .number() sanitize method with mandatory=true', function () {

            let mandatoryMsg = 'Mandatory field';
            let invalidMsg   = 'Invalid field';

            let expected = [
                // Null or undefined
                mandatoryMsg,
                mandatoryMsg,

                // String
                mandatoryMsg,
                mandatoryMsg,
                mandatoryMsg,
                mandatoryMsg,
                invalidMsg,
                invalidMsg,

                // Zero
                0,
                0,
                0,
                0,
                invalidMsg,
                invalidMsg,

                // Int
                1,
                -1,
                1,
                -1,
                1,
                -1,
                invalidMsg,
                invalidMsg,

                // Float
                1.5,
                -1.5,
                1.5,
                -1.5,
                1.5,
                -1.5,
                invalidMsg,
                invalidMsg,

                // NaN
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Infinity
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Boolean
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Date valid
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Date valid but not accepted
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Date invalid
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Array
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Function
                invalidMsg,
                invalidMsg,

                // ObjectId
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Email
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // EncodedObjectId
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg
            ];

            _testSanitize(Sanitizer.number, TEST_DATA, true, expected);
        });

        it('3. Test .number() sanitize method with mandatory=false', function () {

            let invalidMsg = 'Invalid field';

            let expected = [
                // Null or undefined
                '_DEFAULT_',
                '_DEFAULT_',

                // String
                '_DEFAULT_',
                '_DEFAULT_',
                '_DEFAULT_',
                '_DEFAULT_',
                invalidMsg,
                invalidMsg,

                // Zero
                0,
                0,
                0,
                0,
                invalidMsg,
                invalidMsg,

                // Int
                1,
                -1,
                1,
                -1,
                1,
                -1,
                invalidMsg,
                invalidMsg,

                // Float
                1.5,
                -1.5,
                1.5,
                -1.5,
                1.5,
                -1.5,
                invalidMsg,
                invalidMsg,

                // NaN
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Infinity
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Boolean
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Date valid
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Date valid but not accepted
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Date invalid
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Array
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Function
                invalidMsg,
                invalidMsg,

                // ObjectId
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Email
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // EncodedObjectId
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg
            ];

            _testSanitize(Sanitizer.number, TEST_DATA, false, expected);
        });

        it('4. Test .number() sanitize method with intervals', function () {

            // Optional with default null
            let value = Sanitizer.number('testField', null, false, 5.1, 0, 5, '[]');
            expect(value).to.equals(5.1);

            // Invalid {}
            _testSanitizeInterval(Sanitizer.number, 1, 0, 5, '{}', null, 'Invalid interval');

            // Open - Open ()
            _testSanitizeInterval(Sanitizer.number, 0,   0, 5, '()', null, 'Out of interval');
            _testSanitizeInterval(Sanitizer.number, 5,   0, 5, '()', null, 'Out of interval');
            _testSanitizeInterval(Sanitizer.number, 0.1, 0, 5, '()', 0.1);
            _testSanitizeInterval(Sanitizer.number, 4.9, 0, 5, '()', 4.9);

            // Open - Closed (]
            _testSanitizeInterval(Sanitizer.number, 0,   0, 5, '(]', null, 'Out of interval');
            _testSanitizeInterval(Sanitizer.number, 5,   0, 5, '(]', 5);
            _testSanitizeInterval(Sanitizer.number, 0.1, 0, 5, '(]', 0.1);
            _testSanitizeInterval(Sanitizer.number, 4.9, 0, 5, '(]', 4.9);

            // Closed - Open [)
            _testSanitizeInterval(Sanitizer.number, 0,   0, 5, '[)', 0);
            _testSanitizeInterval(Sanitizer.number, 5,   0, 5, '[)', null, 'Out of interval');
            _testSanitizeInterval(Sanitizer.number, 0.1, 0, 5, '[)', 0.1);
            _testSanitizeInterval(Sanitizer.number, 4.9, 0, 5, '[)', 4.9);

            // Closed - Closed []
            _testSanitizeInterval(Sanitizer.number, -0.1, 0, 5, '[]', null, 'Out of interval');
            _testSanitizeInterval(Sanitizer.number,  5.1, 0, 5, '[]', null, 'Out of interval');
            _testSanitizeInterval(Sanitizer.number,   0,   0, 5, '[]', 0);
            _testSanitizeInterval(Sanitizer.number,   5,   0, 5, '[]', 5);
            _testSanitizeInterval(Sanitizer.number,   0.1, 0, 5, '[]', 0.1);
            _testSanitizeInterval(Sanitizer.number,   4.9, 0, 5, '[]', 4.9);
        });
    });

    describe('3. Number: Integer', function () {

        it('1. Test .toInteger() method', function () {

            let expected = [
                // Null or undefined
                null,
                null,

                // String
                null,
                null,
                null,
                null,
                null,
                null,

                // Zero
                0,
                0,
                0,
                0,
                null,
                null,

                // Int
                1,
                -1,
                1,
                -1,
                1,
                -1,
                null,
                null,

                // Float
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,

                // NaN
                null,
                null,
                null,

                // Infinity
                null,
                null,
                null,
                null,
                null,
                null,

                // Boolean
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,

                // Date valid
                null,
                null,
                null,
                null,
                null,

                // Date valid but not accepted
                null,
                null,
                null,
                null,
                null,
                null,

                // Date invalid
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,

                // Array
                null,
                null,
                null,

                // Function
                null,
                null,

                // ObjectId
                null,
                null,
                null,
                null,

                // Email
                null,
                null,
                null,
                null,
                null,

                // EncodedObjectId
                null,
                null,
                null,
                null,
                null
            ];

            _testTo(Sanitizer.toInteger, TEST_DATA, expected);
        });

        it('2. Test .integer() sanitize method with mandatory=true', function () {

            let mandatoryMsg = 'Mandatory field';
            let invalidMsg   = 'Invalid field';

            let expected = [
                // Null or undefined
                mandatoryMsg,
                mandatoryMsg,

                // String
                mandatoryMsg,
                mandatoryMsg,
                mandatoryMsg,
                mandatoryMsg,
                invalidMsg,
                invalidMsg,

                // Zero
                0,
                0,
                0,
                0,
                invalidMsg,
                invalidMsg,

                // Int
                1,
                -1,
                1,
                -1,
                1,
                -1,
                invalidMsg,
                invalidMsg,

                // Float
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // NaN
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Infinity
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Boolean
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Date valid
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Date valid but not accepted
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Date invalid
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Array
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Function
                invalidMsg,
                invalidMsg,

                // ObjectId
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Email
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // EncodedObjectId
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg
            ];

            _testSanitize(Sanitizer.integer, TEST_DATA, true, expected);
        });

        it('3. Test .integer() sanitize method with mandatory=false', function () {

            let invalidMsg = 'Invalid field';

            let expected = [
                // Null or undefined
                '_DEFAULT_',
                '_DEFAULT_',

                // String
                '_DEFAULT_',
                '_DEFAULT_',
                '_DEFAULT_',
                '_DEFAULT_',
                invalidMsg,
                invalidMsg,

                // Zero
                0,
                0,
                0,
                0,
                invalidMsg,
                invalidMsg,

                // Int
                1,
                -1,
                1,
                -1,
                1,
                -1,
                invalidMsg,
                invalidMsg,

                // Float
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // NaN
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Infinity
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Boolean
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Date valid
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Date valid but not accepted
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Date invalid
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Array
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Function
                invalidMsg,
                invalidMsg,

                // ObjectId
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Email
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // EncodedObjectId
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg
            ];

            _testSanitize(Sanitizer.integer, TEST_DATA, false, expected);
        });

        it('4. Test .integer() sanitize method with intervals', function () {

            // Optional with default out of interval
            let value = Sanitizer.number('testField', null, false, 6, 0, 5, '[]');
            expect(value).to.equals(6);

            // Invalid {}
            _testSanitizeInterval(Sanitizer.integer, 1, 0, 5, '{}', null, 'Invalid interval');

            // Open - Open ()
            _testSanitizeInterval(Sanitizer.integer, 0, 0, 5, '()', null, 'Out of interval');
            _testSanitizeInterval(Sanitizer.integer, 5, 0, 5, '()', null, 'Out of interval');
            _testSanitizeInterval(Sanitizer.integer, 1, 0, 5, '()', 1);
            _testSanitizeInterval(Sanitizer.integer, 4, 0, 5, '()', 4);

            // Open - Closed (]
            _testSanitizeInterval(Sanitizer.integer, 0, 0, 5, '(]', null, 'Out of interval');
            _testSanitizeInterval(Sanitizer.integer, 5, 0, 5, '(]', 5);
            _testSanitizeInterval(Sanitizer.integer, 1, 0, 5, '(]', 1);
            _testSanitizeInterval(Sanitizer.integer, 4, 0, 5, '(]', 4);

            // Closed - Open [)
            _testSanitizeInterval(Sanitizer.integer, 0, 0, 5, '[)', 0);
            _testSanitizeInterval(Sanitizer.integer, 5, 0, 5, '[)', null, 'Out of interval');
            _testSanitizeInterval(Sanitizer.integer, 1, 0, 5, '[)', 1);
            _testSanitizeInterval(Sanitizer.integer, 4, 0, 5, '[)', 4);

            // Closed - Closed []
            _testSanitizeInterval(Sanitizer.integer, -1, 0, 5, '[]', null, 'Out of interval');
            _testSanitizeInterval(Sanitizer.integer, 6,  0, 5, '[]', null, 'Out of interval');
            _testSanitizeInterval(Sanitizer.integer, 0,  0, 5, '[]', 0);
            _testSanitizeInterval(Sanitizer.integer, 5,  0, 5, '[]', 5);
            _testSanitizeInterval(Sanitizer.integer, 1,  0, 5, '[]', 1);
            _testSanitizeInterval(Sanitizer.integer, 4,  0, 5, '[]', 4);
        });
    });

    describe('4. Date', function () {

        it('1. Test .toDate() method', function () {

            let expected = [
                // Null or undefined
                null,
                null,

                // String
                null,
                null,
                null,
                null,
                null,
                null,

                // Zero
                null,
                null,
                null,
                null,
                null,
                null,

                // Int
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,

                // Float
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,

                // NaN
                null,
                null,
                null,

                // Infinity
                null,
                null,
                null,
                null,
                null,
                null,

                // Boolean
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,

                // Date valid
                new Date('2022-01-01T08:00:00.000Z'),
                new Date('2022-01-01T08:00:00.000Z'),
                new Date('2022-01-01T08:00:00.000Z'),
                new Date('2022-01-01T08:00:00.000Z'),
                new Date('2022-01-01T08:00:00.000Z'),

                // Date valid but not accepted
                null,
                null,
                null,
                null,
                null,
                null,

                // Date invalid
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,

                // Array
                null,
                null,
                null,

                // Function
                null,
                null,

                // ObjectId
                null,
                null,
                null,
                null,

                // Email
                null,
                null,
                null,
                null,
                null,

                // EncodedObjectId
                null,
                null,
                null,
                null,
                null
            ];

            _testTo(Sanitizer.toDate, TEST_DATA, expected);
        });

        it('2. Test .date() sanitize method with mandatory=true', function () {

            let mandatoryMsg = 'Mandatory field';
            let invalidMsg   = 'Invalid field';

            let expected = [
                // Null or undefined
                mandatoryMsg,
                mandatoryMsg,

                // String
                mandatoryMsg,
                mandatoryMsg,
                mandatoryMsg,
                mandatoryMsg,
                invalidMsg,
                invalidMsg,

                // Zero
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Int
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Float
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // NaN
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Infinity
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Boolean
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Date valid
                new Date('2022-01-01T08:00:00.000Z'),
                new Date('2022-01-01T08:00:00.000Z'),
                new Date('2022-01-01T08:00:00.000Z'),
                new Date('2022-01-01T08:00:00.000Z'),
                new Date('2022-01-01T08:00:00.000Z'),

                // Date valid but not accepted
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Date invalid
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Array
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Function
                invalidMsg,
                invalidMsg,

                // ObjectId
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Email
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // EncodedObjectId
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg
            ];

            _testSanitize(Sanitizer.date, TEST_DATA, true, expected);
        });

        it('3. Test .date() sanitize method with mandatory=false', function () {

            let invalidMsg = 'Invalid field';

            let expected = [
                // Null or undefined
                '_DEFAULT_',
                '_DEFAULT_',

                // String
                '_DEFAULT_',
                '_DEFAULT_',
                '_DEFAULT_',
                '_DEFAULT_',
                invalidMsg,
                invalidMsg,

                // Zero
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Int
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Float
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // NaN
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Infinity
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Boolean
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Date valid
                new Date('2022-01-01T08:00:00.000Z'),
                new Date('2022-01-01T08:00:00.000Z'),
                new Date('2022-01-01T08:00:00.000Z'),
                new Date('2022-01-01T08:00:00.000Z'),
                new Date('2022-01-01T08:00:00.000Z'),

                // Date valid but not accepted
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Date invalid
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Array
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Function
                invalidMsg,
                invalidMsg,

                // ObjectId
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Email
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // EncodedObjectId
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg
            ];

            _testSanitize(Sanitizer.date, TEST_DATA, false, expected);
        });
    });

    describe('5. String', function () {

        it('1. Test .toString() method', function () {

            let expected = [
                // Null or undefined
                null,
                null,

                // String
                null,
                null,
                null,
                null,
                'string',
                'string',

                // Zero
                '0',
                '0',
                '0',
                '0',
                '0asd',
                'asd0',

                // Int
                '1',
                '-1',
                '1',
                '-1',
                '1',
                '-1',
                '1asd',
                'asd1',

                // Float
                '1.5',
                '-1.5',
                '1.5',
                '-1.5',
                '1.5',
                '-1.5',
                '1.5asd',
                'asd1.5',

                // NaN
                'NaN',
                'NaN',
                'NaN',

                // Infinity
                'Infinity',
                '-Infinity',
                'Infinity',
                '-Infinity',
                'Infinity',
                '-Infinity',

                // Boolean
                'true',
                'false',
                'true',
                'false',
                'true',
                'false',
                'TRUE',
                'FALSE',
                '0true',
                '0false',

                // Date valid
                '2022-01-01T00:00:00-08:00',
                '2022-01-01T00:00:00.000-08:00',
                '2022-01-01T08:00:00Z',
                '2022-01-01T08:00:00.000Z',
                '2022-01-01T08:00:00.000Z',

                // Date valid but not accepted
                '2022-01-01',
                '2022-01-01T',
                '2022-01-01T00',
                '2022-01-01T00:00',
                '2022-01-01T00:00:00',
                '2022-01-01T00:00:00.000',

                // Date invalid
                '2022-',
                '2022-01-',
                '2022-01-01T00:',
                '2022-01-01T00:00:',
                '2022-01-01T00:00:00.',
                '2022-01-32T00:00:00.000Z',
                '2022-13-01T00:00:00.000Z',
                '2022-01-01T00:00:00X08:00',
                '2022-01-01T00:00:00-08X00',
                '2022-01-01T00:00:00.000X08:00',
                '2022-01-01T00:00:00.000-08X00',
                'Invalid Date',

                // Array
                null,
                '[]',
                '[]',

                // Function
                'function dummy() {}',
                'function dummy() {}',

                // ObjectId
                '507f191e810c19729de860ea',
                '507f191e810c19729de860ea',
                '507f191e810c19729de860e',
                '07f191e810c19729de860ea',

                // Email
                'Example@Example.com',
                'Example@Example.com',
                'Example Tag@Example.com',
                'Example+Tag@Example.com',
                'Example Tag Other@Example.com',

                // EncodedObjectId
                'XoeBCAea1GTGA2XC',
                'XoeBCAea1GTGA2X-',
                'XoeBCAea1GTGA2X_',
                'XoeBCAea1GTGA2XCa',
                'XoeBCAea1GTGA2X~'
            ];

            _testTo(Sanitizer.toString, TEST_DATA, expected);
        });

        it('2. Test .string() sanitize method with mandatory=true', function () {

            let mandatoryMsg = 'Mandatory field';

            let expected = [
                // Null or undefined
                mandatoryMsg,
                mandatoryMsg,

                // String
                mandatoryMsg,
                mandatoryMsg,
                mandatoryMsg,
                mandatoryMsg,
                'string',
                'string',

                // Zero
                '0',
                '0',
                '0',
                '0',
                '0asd',
                'asd0',

                // Int
                '1',
                '-1',
                '1',
                '-1',
                '1',
                '-1',
                '1asd',
                'asd1',

                // Float
                '1.5',
                '-1.5',
                '1.5',
                '-1.5',
                '1.5',
                '-1.5',
                '1.5asd',
                'asd1.5',

                // NaN
                'NaN',
                'NaN',
                'NaN',

                // Infinity
                'Infinity',
                '-Infinity',
                'Infinity',
                '-Infinity',
                'Infinity',
                '-Infinity',

                // Boolean
                'true',
                'false',
                'true',
                'false',
                'true',
                'false',
                'TRUE',
                'FALSE',
                '0true',
                '0false',

                // Date valid
                '2022-01-01T00:00:00-08:00',
                '2022-01-01T00:00:00.000-08:00',
                '2022-01-01T08:00:00Z',
                '2022-01-01T08:00:00.000Z',
                '2022-01-01T08:00:00.000Z',

                // Date valid but not accepted
                '2022-01-01',
                '2022-01-01T',
                '2022-01-01T00',
                '2022-01-01T00:00',
                '2022-01-01T00:00:00',
                '2022-01-01T00:00:00.000',

                // Date invalid
                '2022-',
                '2022-01-',
                '2022-01-01T00:',
                '2022-01-01T00:00:',
                '2022-01-01T00:00:00.',
                '2022-01-32T00:00:00.000Z',
                '2022-13-01T00:00:00.000Z',
                '2022-01-01T00:00:00X08:00',
                '2022-01-01T00:00:00-08X00',
                '2022-01-01T00:00:00.000X08:00',
                '2022-01-01T00:00:00.000-08X00',
                'Invalid Date',

                // Array
                '',
                '[]',
                '[]',

                // Function
                'function dummy() {}',
                'function dummy() {}',

                // ObjectId
                '507f191e810c19729de860ea',
                '507f191e810c19729de860ea',
                '507f191e810c19729de860e',
                '07f191e810c19729de860ea',

                // Email
                'Example@Example.com',
                'Example@Example.com',
                'Example Tag@Example.com',
                'Example+Tag@Example.com',
                'Example Tag Other@Example.com',

                // EncodedObjectId
                'XoeBCAea1GTGA2XC',
                'XoeBCAea1GTGA2X-',
                'XoeBCAea1GTGA2X_',
                'XoeBCAea1GTGA2XCa',
                'XoeBCAea1GTGA2X~'
            ];

            _testSanitize(Sanitizer.string, TEST_DATA, true, expected);
        });

        it('3. Test .string() sanitize method with mandatory=false', function () {

            let expected = [
                // Null or undefined
                '_DEFAULT_',
                '_DEFAULT_',

                // String
                '_DEFAULT_',
                '_DEFAULT_',
                '_DEFAULT_',
                '_DEFAULT_',
                'string',
                'string',

                // Zero
                '0',
                '0',
                '0',
                '0',
                '0asd',
                'asd0',

                // Int
                '1',
                '-1',
                '1',
                '-1',
                '1',
                '-1',
                '1asd',
                'asd1',

                // Float
                '1.5',
                '-1.5',
                '1.5',
                '-1.5',
                '1.5',
                '-1.5',
                '1.5asd',
                'asd1.5',

                // NaN
                'NaN',
                'NaN',
                'NaN',

                // Infinity
                'Infinity',
                '-Infinity',
                'Infinity',
                '-Infinity',
                'Infinity',
                '-Infinity',

                // Boolean
                'true',
                'false',
                'true',
                'false',
                'true',
                'false',
                'TRUE',
                'FALSE',
                '0true',
                '0false',

                // Date valid
                '2022-01-01T00:00:00-08:00',
                '2022-01-01T00:00:00.000-08:00',
                '2022-01-01T08:00:00Z',
                '2022-01-01T08:00:00.000Z',
                '2022-01-01T08:00:00.000Z',

                // Date valid but not accepted
                '2022-01-01',
                '2022-01-01T',
                '2022-01-01T00',
                '2022-01-01T00:00',
                '2022-01-01T00:00:00',
                '2022-01-01T00:00:00.000',

                // Date invalid
                '2022-',
                '2022-01-',
                '2022-01-01T00:',
                '2022-01-01T00:00:',
                '2022-01-01T00:00:00.',
                '2022-01-32T00:00:00.000Z',
                '2022-13-01T00:00:00.000Z',
                '2022-01-01T00:00:00X08:00',
                '2022-01-01T00:00:00-08X00',
                '2022-01-01T00:00:00.000X08:00',
                '2022-01-01T00:00:00.000-08X00',
                'Invalid Date',

                // Array
                '',
                '[]',
                '[]',

                // Function
                'function dummy() {}',
                'function dummy() {}',

                // ObjectId
                '507f191e810c19729de860ea',
                '507f191e810c19729de860ea',
                '507f191e810c19729de860e',
                '07f191e810c19729de860ea',

                // Email
                'Example@Example.com',
                'Example@Example.com',
                'Example Tag@Example.com',
                'Example+Tag@Example.com',
                'Example Tag Other@Example.com',

                // EncodedObjectId
                'XoeBCAea1GTGA2XC',
                'XoeBCAea1GTGA2X-',
                'XoeBCAea1GTGA2X_',
                'XoeBCAea1GTGA2XCa',
                'XoeBCAea1GTGA2X~'
            ];

            _testSanitize(Sanitizer.string, TEST_DATA, false, expected);
        });

        it('4. Test .string() sanitize method with intervals', function () {

            // Invalid {}
            _testSanitizeInterval(Sanitizer.string, '12',    1, 5, '{}', null, 'Invalid interval');

            // Open - Open ()
            _testSanitizeInterval(Sanitizer.string, '1',     1, 5, '()', null, 'Out of interval');
            _testSanitizeInterval(Sanitizer.string, '12345', 1, 5, '()', null, 'Out of interval');
            _testSanitizeInterval(Sanitizer.string, '12',    1, 5, '()', '12');
            _testSanitizeInterval(Sanitizer.string, '1234',  1, 5, '()', '1234');

            // Open - Closed (]
            _testSanitizeInterval(Sanitizer.string, '1',     1, 5, '(]', null, 'Out of interval');
            _testSanitizeInterval(Sanitizer.string, '12345', 1, 5, '(]', '12345');
            _testSanitizeInterval(Sanitizer.string, '12'   , 1, 5, '(]', '12');
            _testSanitizeInterval(Sanitizer.string, '1234' , 1, 5, '(]', '1234');

            // Closed - Open [)
            _testSanitizeInterval(Sanitizer.string, '1',     1, 5, '[)', '1');
            _testSanitizeInterval(Sanitizer.string, '12345', 1, 5, '[)', null, 'Out of interval');
            _testSanitizeInterval(Sanitizer.string, '1',     1, 5, '[)', '1');
            _testSanitizeInterval(Sanitizer.string, '1234',  1, 5, '[)', '1234');

            // Closed - Closed []
            _testSanitizeInterval(Sanitizer.string, '1',      2, 5, '[]', null, 'Out of interval');
            _testSanitizeInterval(Sanitizer.string, '123456', 2, 5, '[]', null, 'Out of interval');
            _testSanitizeInterval(Sanitizer.string, '12345',  1, 5, '[]', '12345');
            _testSanitizeInterval(Sanitizer.string, '1',      1, 5, '[]', '1');
            _testSanitizeInterval(Sanitizer.string, '12345',  1, 5, '[]', '12345');
            _testSanitizeInterval(Sanitizer.string, '1',      1, 5, '[]', '1');
            _testSanitizeInterval(Sanitizer.string, '1234',   1, 5, '[]', '1234');
        });
    });

    describe('6. Array: Items', function () {

        it('1. Test .toArray() method', function () {

            let expected = [
                // Null or undefined
                null,
                null,

                // String
                null,
                ['\t'],
                ['\n'],
                [' '],
                ['string'],
                ['  string  '],

                // Zero
                [0],
                [0n],
                ['0'],
                ['  0  '],
                ['0asd'],
                ['asd0'],

                // Int
                [1],
                [-1],
                ['1'],
                ['-1'],
                ['  1  '],
                ['  -1  '],
                ['1asd'],
                ['asd1'],

                // Float
                [1.5],
                [-1.5],
                ['1.5'],
                ['-1.5'],
                ['  1.5  '],
                ['  -1.5  '],
                ['1.5asd'],
                ['asd1.5'],

                // NaN
                [NaN],
                ['NaN'],
                ['  NaN  '],

                // Infinity
                [Infinity],
                [-Infinity],
                ['Infinity'],
                ['-Infinity'],
                ['  Infinity  '],
                ['  -Infinity  '],

                // Boolean
                [true],
                [false],
                ['true'],
                ['false'],
                ['  true  '],
                ['  false  '],
                ['TRUE'],
                ['FALSE'],
                ['0true'],
                ['0false'],

                // Date valid
                ['2022-01-01T00:00:00-08:00'],
                ['2022-01-01T00:00:00.000-08:00'],
                ['2022-01-01T08:00:00Z'],
                ['2022-01-01T08:00:00.000Z'],
                [new Date('2022-01-01T08:00:00.000Z')],

                // Date valid but not accepted
                ['2022-01-01'],
                ['2022-01-01T'],
                ['2022-01-01T00'],
                ['2022-01-01T00:00'],
                ['2022-01-01T00:00:00'],
                ['2022-01-01T00:00:00.000'],

                // Date invalid
                ['2022-'],
                ['2022-01-'],
                ['2022-01-01T00:'],
                ['2022-01-01T00:00:'],
                ['2022-01-01T00:00:00.'],
                ['2022-01-32T00:00:00.000Z'],
                ['2022-13-01T00:00:00.000Z'],
                ['2022-01-01T00:00:00X08:00'],
                ['2022-01-01T00:00:00-08X00'],
                ['2022-01-01T00:00:00.000X08:00'],
                ['2022-01-01T00:00:00.000-08X00'],
                [new Date('INVALID')],

                // Array
                [],
                ['[]'],
                ['  []  '],

                // ObjectId
                [new ObjectId('507f191e810c19729de860ea')],
                ['507f191e810c19729de860ea'],
                ['507f191e810c19729de860e'],
                ['07f191e810c19729de860ea'],

                // Email
                ['Example@Example.com'],
                ['   Example@Example.com   '],
                ['   Example Tag@Example.com   '],
                ['   Example+Tag@Example.com   '],
                ['   Example Tag Other@Example.com   '],

                // EncodedObjectId
                ['  XoeBCAea1GTGA2XC  '],
                ['XoeBCAea1GTGA2X-'],
                ['XoeBCAea1GTGA2X_'],
                ['XoeBCAea1GTGA2XCa'],
                ['XoeBCAea1GTGA2X~']
            ];

            // Remove fn params, cannot be tested with equal
            let testData = TEST_DATA.slice(0);
            testData.splice(testData.length - 16, 2);

            _testTo(Sanitizer.toArray, testData, expected);
        });

        it('2. Test .arrayItems() sanitize method with mandatory=true and .string()', function () {

            let mandatoryMsg = 'Mandatory field';

            let expected = [
                // Null or undefined
                mandatoryMsg,
                mandatoryMsg,

                // String
                mandatoryMsg,
                mandatoryMsg,
                mandatoryMsg,
                mandatoryMsg,
                ['string'],
                ['string'],

                // Zero
                ['0'],
                ['0'],
                ['0'],
                ['0'],
                ['0asd'],
                ['asd0'],

                // Int
                ['1'],
                ['-1'],
                ['1'],
                ['-1'],
                ['1'],
                ['-1'],
                ['1asd'],
                ['asd1'],

                // Float
                ['1.5'],
                ['-1.5'],
                ['1.5'],
                ['-1.5'],
                ['1.5'],
                ['-1.5'],
                ['1.5asd'],
                ['asd1.5'],

                // NaN
                ['NaN'],
                ['NaN'],
                ['NaN'],

                // Infinity
                ['Infinity'],
                ['-Infinity'],
                ['Infinity'],
                ['-Infinity'],
                ['Infinity'],
                ['-Infinity'],

                // Boolean
                ['true'],
                ['false'],
                ['true'],
                ['false'],
                ['true'],
                ['false'],
                ['TRUE'],
                ['FALSE'],
                ['0true'],
                ['0false'],

                // Date valid
                ['2022-01-01T00:00:00-08:00'],
                ['2022-01-01T00:00:00.000-08:00'],
                ['2022-01-01T08:00:00Z'],
                ['2022-01-01T08:00:00.000Z'],
                ['2022-01-01T08:00:00.000Z'],

                // Date valid but not accepted
                ['2022-01-01'],
                ['2022-01-01T'],
                ['2022-01-01T00'],
                ['2022-01-01T00:00'],
                ['2022-01-01T00:00:00'],
                ['2022-01-01T00:00:00.000'],

                // Date invalid
                ['2022-'],
                ['2022-01-'],
                ['2022-01-01T00:'],
                ['2022-01-01T00:00:'],
                ['2022-01-01T00:00:00.'],
                ['2022-01-32T00:00:00.000Z'],
                ['2022-13-01T00:00:00.000Z'],
                ['2022-01-01T00:00:00X08:00'],
                ['2022-01-01T00:00:00-08X00'],
                ['2022-01-01T00:00:00.000X08:00'],
                ['2022-01-01T00:00:00.000-08X00'],
                ['Invalid Date'],

                // Array
                [],
                ['[]'],
                ['[]'],

                // ObjectId
                ['507f191e810c19729de860ea'],
                ['507f191e810c19729de860ea'],
                ['507f191e810c19729de860e'],
                ['07f191e810c19729de860ea'],

                // Email
                ['Example@Example.com'],
                ['Example@Example.com'],
                ['Example Tag@Example.com'],
                ['Example+Tag@Example.com'],
                ['Example Tag Other@Example.com'],

                // EncodedObjectId
                ['XoeBCAea1GTGA2XC'],
                ['XoeBCAea1GTGA2X-'],
                ['XoeBCAea1GTGA2X_'],
                ['XoeBCAea1GTGA2XCa'],
                ['XoeBCAea1GTGA2X~']
            ];

            // Remove fn params, cannot be tested with equal
            let testData = TEST_DATA.slice(0);
            testData.splice(testData.length - 16, 2);

            _testSanitize(Sanitizer.arrayItems, testData, true, expected, Sanitizer.string);
        });

        it('3. Test .arrayItems() sanitize method with mandatory=false and .string()', function () {

            let expected = [
                // Null or undefined
                '_DEFAULT_',
                '_DEFAULT_',

                // String
                '_DEFAULT_',
                '_DEFAULT_',
                '_DEFAULT_',
                '_DEFAULT_',
                ['string'],
                ['string'],

                // Zero
                ['0'],
                ['0'],
                ['0'],
                ['0'],
                ['0asd'],
                ['asd0'],

                // Int
                ['1'],
                ['-1'],
                ['1'],
                ['-1'],
                ['1'],
                ['-1'],
                ['1asd'],
                ['asd1'],

                // Float
                ['1.5'],
                ['-1.5'],
                ['1.5'],
                ['-1.5'],
                ['1.5'],
                ['-1.5'],
                ['1.5asd'],
                ['asd1.5'],

                // NaN
                ['NaN'],
                ['NaN'],
                ['NaN'],

                // Infinity
                ['Infinity'],
                ['-Infinity'],
                ['Infinity'],
                ['-Infinity'],
                ['Infinity'],
                ['-Infinity'],

                // Boolean
                ['true'],
                ['false'],
                ['true'],
                ['false'],
                ['true'],
                ['false'],
                ['TRUE'],
                ['FALSE'],
                ['0true'],
                ['0false'],

                // Date valid
                ['2022-01-01T00:00:00-08:00'],
                ['2022-01-01T00:00:00.000-08:00'],
                ['2022-01-01T08:00:00Z'],
                ['2022-01-01T08:00:00.000Z'],
                ['2022-01-01T08:00:00.000Z'],

                // Date valid but not accepted
                ['2022-01-01'],
                ['2022-01-01T'],
                ['2022-01-01T00'],
                ['2022-01-01T00:00'],
                ['2022-01-01T00:00:00'],
                ['2022-01-01T00:00:00.000'],

                // Date invalid
                ['2022-'],
                ['2022-01-'],
                ['2022-01-01T00:'],
                ['2022-01-01T00:00:'],
                ['2022-01-01T00:00:00.'],
                ['2022-01-32T00:00:00.000Z'],
                ['2022-13-01T00:00:00.000Z'],
                ['2022-01-01T00:00:00X08:00'],
                ['2022-01-01T00:00:00-08X00'],
                ['2022-01-01T00:00:00.000X08:00'],
                ['2022-01-01T00:00:00.000-08X00'],
                ['Invalid Date'],

                // Array
                [],
                ['[]'],
                ['[]'],

                // ObjectId
                ['507f191e810c19729de860ea'],
                ['507f191e810c19729de860ea'],
                ['507f191e810c19729de860e'],
                ['07f191e810c19729de860ea'],

                ['Example@Example.com'],
                ['Example@Example.com'],
                ['Example Tag@Example.com'],
                ['Example+Tag@Example.com'],
                ['Example Tag Other@Example.com'],

                // EncodedObjectId
                ['XoeBCAea1GTGA2XC'],
                ['XoeBCAea1GTGA2X-'],
                ['XoeBCAea1GTGA2X_'],
                ['XoeBCAea1GTGA2XCa'],
                ['XoeBCAea1GTGA2X~']
            ];

            // Remove fn params, cannot be tested with equal
            let testData = TEST_DATA.slice(0);
            testData.splice(testData.length - 16, 2);

            _testSanitize(Sanitizer.arrayItems, testData, false, expected, Sanitizer.string);
        });
    });

    describe('7. Accepted Value', function () {

        it('1. Test .acceptedValue() sanitize method with mandatory=true', function () {

            let mandatoryMsg = 'Mandatory field';
            let invalidMsg   = 'Invalid field';

            let acceptedValues = ['string', 0, 1, -1, 1.5, -1.5, Infinity, -Infinity, true, false];

            let expected = [
                // Null or undefined
                mandatoryMsg,
                mandatoryMsg,

                // String
                mandatoryMsg,
                mandatoryMsg,
                mandatoryMsg,
                mandatoryMsg,
                'string',
                invalidMsg,

                // Zero
                0,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Int
                1,
                -1,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Float
                1.5,
                -1.5,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // NaN
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Infinity
                Infinity,
                -Infinity,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Boolean
                true,
                false,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Date valid
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Date valid but not accepted
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Date invalid
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Array
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Function
                invalidMsg,
                invalidMsg,

                // ObjectId
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Email
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // EncodedObjectId
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg
            ];

            _testSanitize(Sanitizer.acceptedValue, TEST_DATA, true, expected, acceptedValues);
        });

        it('2. Test .acceptedValue() sanitize method with mandatory=false', function () {

            let invalidMsg = 'Invalid field';

            let acceptedValues = ['string', 0, 1, -1, 1.5, -1.5, Infinity, -Infinity, true, false];

            let expected = [
                // Null or undefined
                '_DEFAULT_',
                '_DEFAULT_',

                // String
                '_DEFAULT_',
                '_DEFAULT_',
                '_DEFAULT_',
                '_DEFAULT_',
                'string',
                invalidMsg,

                // Zero
                0,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Int
                1,
                -1,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Float
                1.5,
                -1.5,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // NaN
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Infinity
                Infinity,
                -Infinity,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Boolean
                true,
                false,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Date valid
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Date valid but not accepted
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Date invalid
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Array
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Function
                invalidMsg,
                invalidMsg,

                // ObjectId
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Email
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // EncodedObjectId
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg
            ];

            _testSanitize(Sanitizer.acceptedValue, TEST_DATA, false, expected, acceptedValues);
        });
    });

    describe('8. ObjectId', function () {

        it('1. Test .toObjectId() method', function () {

            let expected = [
                // Null or undefined
                null,
                null,

                // String
                null,
                null,
                null,
                null,
                null,
                null,

                // Zero
                null,
                null,
                null,
                null,
                null,
                null,

                // Int
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,

                // Float
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,

                // NaN
                null,
                null,
                null,

                // Infinity
                null,
                null,
                null,
                null,
                null,
                null,

                // Boolean
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,

                // Date valid
                null,
                null,
                null,
                null,
                null,

                // Date valid but not accepted
                null,
                null,
                null,
                null,
                null,
                null,

                // Date invalid
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,

                // Array
                null,
                null,
                null,

                // Function
                null,
                null,

                // ObjectId valid
                new ObjectId('507f191e810c19729de860ea'),
                new ObjectId('507f191e810c19729de860ea'),
                null,
                null,

                // Email
                null,
                null,
                null,
                null,
                null,

                // EncodedObjectId
                null,
                null,
                null,
                null,
                null
            ];

            _testTo(Sanitizer.toObjectId, TEST_DATA.slice(37), expected.slice(37));
        });

        it('2. Test .objectId() sanitize method with mandatory=true', function () {

            let mandatoryMsg = 'Mandatory field';
            let invalidMsg   = 'Invalid field';

            let expected = [
                // Null or undefined
                mandatoryMsg,
                mandatoryMsg,

                // String
                mandatoryMsg,
                mandatoryMsg,
                mandatoryMsg,
                mandatoryMsg,
                invalidMsg,
                invalidMsg,

                // Zero
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Int
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Float
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // NaN
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Infinity
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Boolean
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Date valid
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Date valid but not accepted
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Date invalid
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Array
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Function
                invalidMsg,
                invalidMsg,

                // ObjectId
                new ObjectId('507f191e810c19729de860ea'),
                new ObjectId('507f191e810c19729de860ea'),
                invalidMsg,
                invalidMsg,

                // Email
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // EncodedObjectId
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg
            ];

            _testSanitize(Sanitizer.objectId, TEST_DATA, true, expected);
        });

        it('3. Test .objectId() sanitize method with mandatory=false', function () {

            let invalidMsg = 'Invalid field';

            let expected = [
                // Null or undefined
                '_DEFAULT_',
                '_DEFAULT_',

                // String
                '_DEFAULT_',
                '_DEFAULT_',
                '_DEFAULT_',
                '_DEFAULT_',
                invalidMsg,
                invalidMsg,

                // Zero
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Int
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Float
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // NaN
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Infinity
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Boolean
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Date valid
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Date valid but not accepted
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Date invalid
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Array
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Function
                invalidMsg,
                invalidMsg,

                // ObjectId
                new ObjectId('507f191e810c19729de860ea'),
                new ObjectId('507f191e810c19729de860ea'),
                invalidMsg,
                invalidMsg,

                // Email
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // EncodedObjectId
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg
            ];

            _testSanitize(Sanitizer.objectId, TEST_DATA, false, expected);
        });
    });

    describe('9. Email', function () {

        it('1. Test .toEmail() method with many email (taken from manishsaraan/email-validator package)', function () {

            // Give some coverage to isEmail. Inner isString is already tested
            expect(Sanitizer.isEmail(null)).to.equals(false);
            expect(Sanitizer.isEmail(0)).to.equals(false);
            expect(Sanitizer.isEmail(1)).to.equals(false);
            expect(Sanitizer.isEmail(true)).to.equals(false);
            expect(Sanitizer.isEmail(false)).to.equals(false);

            const EmailTestData = _getEmailTestData();

            // Valid supported
            for (let i = 0; i < EmailTestData.VALID_SUPPORTED.length; i++) {
                let value = EmailTestData.VALID_SUPPORTED[i];
                expect(Sanitizer.toEmail(value)).to.equals(value.toLowerCase());
            }

            // Valid NOT supported
            for (let i = 0; i < EmailTestData.VALID_UNSUPPORTED.length; i++) {
                let value = EmailTestData.VALID_UNSUPPORTED[i];
                expect(Sanitizer.toEmail(value)).to.equals(null);
            }

            // Invalid supported
            for (let i = 0; i < EmailTestData.INVALID_SUPPORTED.length; i++) {
                let value = EmailTestData.INVALID_SUPPORTED[i];
                expect(Sanitizer.toEmail(value)).to.equals(null);
            }

            // ATTENTION: Invalid NOT supported (Due to reduced functionality, some use case validations were lost)
            for (let i = 0; i < EmailTestData.INVALID_UNSUPPORTED.length; i++) {
                let value = EmailTestData.INVALID_UNSUPPORTED[i];
                expect(Sanitizer.toEmail(value)).to.equals(value);
            }
        });

        it('2. Test .toEmail() method with global values', function () {

            let expected = [
                // Null or undefined
                null,
                null,

                // String
                null,
                null,
                null,
                null,
                null,
                null,

                // Zero
                null,
                null,
                null,
                null,
                null,
                null,

                // Int
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,

                // Float
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,

                // NaN
                null,
                null,
                null,

                // Infinity
                null,
                null,
                null,
                null,
                null,
                null,

                // Boolean
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,

                // Date valid
                null,
                null,
                null,
                null,
                null,

                // Date valid but not accepted
                null,
                null,
                null,
                null,
                null,
                null,

                // Date invalid
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,

                // Array
                null,
                null,
                null,

                // Function
                null,
                null,

                // ObjectId
                null,
                null,
                null,
                null,

                // Email
                'example@example.com',
                'example@example.com',
                'example+tag@example.com',
                'example+tag@example.com',
                'example+tag+other@example.com',

                // EncodedObjectId
                null,
                null,
                null,
                null,
                null
            ];

            _testTo(Sanitizer.toEmail, TEST_DATA, expected);
        });

        it('2. Test .email() sanitize method with mandatory=true', function () {

            let mandatoryMsg = 'Mandatory field';
            let invalidMsg   = 'Invalid field';

            let expected = [
                // Null or undefined
                mandatoryMsg,
                mandatoryMsg,

                // String
                mandatoryMsg,
                mandatoryMsg,
                mandatoryMsg,
                mandatoryMsg,
                invalidMsg,
                invalidMsg,

                // Zero
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Int
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Float
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // NaN
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Infinity
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Boolean
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Date valid
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Date valid but not accepted
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Date invalid
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Array
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Function
                invalidMsg,
                invalidMsg,

                // ObjectId
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Email
                'example@example.com',
                'example@example.com',
                'example+tag@example.com',
                'example+tag@example.com',
                'example+tag+other@example.com',

                // EncodedObjectId
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg
            ];

            _testSanitize(Sanitizer.email, TEST_DATA, true, expected);
        });

        it('3. Test .email() sanitize method with mandatory=false', function () {

            let invalidMsg = 'Invalid field';

            let expected = [
                // Null or undefined
                '_DEFAULT_',
                '_DEFAULT_',

                // String
                '_DEFAULT_',
                '_DEFAULT_',
                '_DEFAULT_',
                '_DEFAULT_',
                invalidMsg,
                invalidMsg,

                // Zero
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Int
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Float
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // NaN
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Infinity
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Boolean
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Date valid
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Date valid but not accepted
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Date invalid
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Array
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Function
                invalidMsg,
                invalidMsg,

                // ObjectId
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Email
                'example@example.com',
                'example@example.com',
                'example+tag@example.com',
                'example+tag@example.com',
                'example+tag+other@example.com',

                // EncodedObjectId
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg
            ];

            _testSanitize(Sanitizer.email, TEST_DATA, false, expected);
        });
    });

    describe('8. EncodedObjectId', function () {

        it('1. Test .toEncodedObjectId() method', function () {

            let expected = [
                // Null or undefined
                null,
                null,

                // String
                null,
                null,
                null,
                null,
                null,
                null,

                // Zero
                null,
                null,
                null,
                null,
                null,
                null,

                // Int
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,

                // Float
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,

                // NaN
                null,
                null,
                null,

                // Infinity
                null,
                null,
                null,
                null,
                null,
                null,

                // Boolean
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,

                // Date valid
                null,
                null,
                null,
                null,
                null,

                // Date valid but not accepted
                null,
                null,
                null,
                null,
                null,
                null,

                // Date invalid
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,

                // Array
                null,
                null,
                null,

                // Function
                null,
                null,

                // ObjectId valid
                null,
                null,
                null,
                null,

                // Email
                null,
                null,
                null,
                null,
                null,

                // Encoded ObjectId
                'XoeBCAea1GTGA2XC',
                'XoeBCAea1GTGA2X-',
                'XoeBCAea1GTGA2X_',
                null,
                null
            ];

            _testTo(Sanitizer.toEncodedObjectId, TEST_DATA, expected);
        });

        it('2. Test .encodedObjectId() sanitize method with mandatory=true', function () {

            let mandatoryMsg = 'Mandatory field';
            let invalidMsg   = 'Invalid field';

            let expected = [
                // Null or undefined
                mandatoryMsg,
                mandatoryMsg,

                // String
                mandatoryMsg,
                mandatoryMsg,
                mandatoryMsg,
                mandatoryMsg,
                invalidMsg,
                invalidMsg,

                // Zero
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Int
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Float
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // NaN
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Infinity
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Boolean
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Date valid
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Date valid but not accepted
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Date invalid
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Array
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Function
                invalidMsg,
                invalidMsg,

                // ObjectId
                new ObjectId('507f191e810c19729de860ea'),
                new ObjectId('507f191e810c19729de860ea'),
                invalidMsg,
                invalidMsg,

                // Email
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Encoded ObjectId
                'XoeBCAea1GTGA2XC',
                'XoeBCAea1GTGA2X-',
                'XoeBCAea1GTGA2X_',
                invalidMsg,
                invalidMsg
            ];

            _testSanitize(Sanitizer.encodedObjectId, TEST_DATA, true, expected);
        });

        it('3. Test .encodedObjectId() sanitize method with mandatory=false', function () {

            let invalidMsg = 'Invalid field';

            let expected = [
                // Null or undefined
                '_DEFAULT_',
                '_DEFAULT_',

                // String
                '_DEFAULT_',
                '_DEFAULT_',
                '_DEFAULT_',
                '_DEFAULT_',
                invalidMsg,
                invalidMsg,

                // Zero
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Int
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Float
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // NaN
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Infinity
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Boolean
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Date valid
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Date valid but not accepted
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Date invalid
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Array
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Function
                invalidMsg,
                invalidMsg,

                // ObjectId
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Email
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,
                invalidMsg,

                // Encoded ObjectId
                'XoeBCAea1GTGA2XC',
                'XoeBCAea1GTGA2X-',
                'XoeBCAea1GTGA2X_',
                invalidMsg,
                invalidMsg
            ];

            _testSanitize(Sanitizer.encodedObjectId, TEST_DATA, false, expected);
        });
    });

    /**
     * @param {Function} method
     * @param {Array}    values
     * @param {Array}    expected
     * @private
     */
    function _testTo(method, values, expected) {
        expect(values.length).to.equals(expected.length);

        for (let i = 0; i < values.length; i++) {
            let value = values[i];
            expect(method(value)).to.eql(expected[i], util.format('Converted invalid. i:%s value:%s expected:%s', i, Sanitizer.toString(value), expected[i]));
        }
    }

    /**
     * @param {Function}  method
     * @param {Array}     values
     * @param {Boolean}   mandatory
     * @param {Array}     expected
     * @param {Function|Array=} sanitizerOrAcceptedValues
     * @private
     */
    function _testSanitize(method, values, mandatory, expected, sanitizerOrAcceptedValues) {
        expect(values.length).to.equals(expected.length);

        for (let i = 0; i < values.length; i++) {
            let value     = values[i];
            let result    = null;
            let exception = false;

            try {
                result = method('testField', value, mandatory, '_DEFAULT_', sanitizerOrAcceptedValues);
            }
            catch(err) {
                exception = true;
                expect(err.message).to.includes(expected[i], util.format('Sanitized invalid. i:%s err.message:%s expected:%s', i, err.message, expected[i]));
            }

            if (exception === false) {
                expect(result).to.eql(expected[i], util.format('Sanitized invalid. i:%s result:%s expected:%s', i, result, expected[i]));
            }
        }
    }

    /**
     * @param method
     * @param value
     * @param min
     * @param max
     * @param interval
     * @param expected
     * @param expectedError
     * @private
     */
    function _testSanitizeInterval(method, value, min, max, interval, expected, expectedError) {
        let result    = null;
        let exception = false;

        try {
            result = method('testField', value, true, null, min, max, interval);
        }
        catch(err) {
            exception = true;
            if (expectedError == null) {
                assert.fail('Sanitize thrown exception and expected error is null. Message: ' + err.message);
            }
            expect(err.message).to.includes(expectedError, util.format('Sanitized invalid. err.message:%s expected:%s', err.message, expectedError));
        }

        if (exception === false) {
            expect(result).to.eql(expected, util.format('Sanitized invalid. result:%s expected:%s', result, expected));
        }
    }

    function _getTestData() {
        return [
            // Null or undefined
            undefined,
            null,

            // String
            '',
            '\t',
            '\n',
            ' ',
            'string',
            '  string  ',

            // Zero
            0,
            0n,
            '0',
            '  0  ',
            '0asd',
            'asd0',

            // Int
            1,
            -1,
            '1',
            '-1',
            '  1  ',
            '  -1  ',
            '1asd',
            'asd1',

            // Float
            1.5,
            -1.5,
            '1.5',
            '-1.5',
            '  1.5  ',
            '  -1.5  ',
            '1.5asd',
            'asd1.5',

            // NaN
            NaN,
            'NaN',
            '  NaN  ',

            // Infinity
            Infinity,
            -Infinity,
            'Infinity',
            '-Infinity',
            '  Infinity  ',
            '  -Infinity  ',

            // Boolean
            true,
            false,
            'true',
            'false',
            '  true  ',
            '  false  ',
            'TRUE',
            'FALSE',
            '0true',
            '0false',

            // Date valid
            '2022-01-01T00:00:00-08:00',
            '2022-01-01T00:00:00.000-08:00',
            '2022-01-01T08:00:00Z',
            '2022-01-01T08:00:00.000Z',
            new Date('2022-01-01T08:00:00.000Z'),

            // Date valid but not accepted
            '2022-01-01',
            '2022-01-01T',
            '2022-01-01T00',
            '2022-01-01T00:00',
            '2022-01-01T00:00:00',
            '2022-01-01T00:00:00.000',

            // Date invalid
            '2022-',
            '2022-01-',
            '2022-01-01T00:',
            '2022-01-01T00:00:',
            '2022-01-01T00:00:00.',
            '2022-01-32T00:00:00.000Z',
            '2022-13-01T00:00:00.000Z',
            '2022-01-01T00:00:00X08:00',
            '2022-01-01T00:00:00-08X00',
            '2022-01-01T00:00:00.000X08:00',
            '2022-01-01T00:00:00.000-08X00',
            new Date('INVALID'),

            // Array
            [],
            '[]',
            '  []  ',

            // Function
            function dummy() {},
            'function dummy() {}',

            // ObjectId
            new ObjectId('507f191e810c19729de860ea'),
            '507f191e810c19729de860ea',
            '507f191e810c19729de860e',
            '07f191e810c19729de860ea',

            // Email
            'Example@Example.com',
            '   Example@Example.com   ',
            '   Example Tag@Example.com   ',
            '   Example+Tag@Example.com   ',
            '   Example Tag Other@Example.com   ',

            // EncodedObjectId
            '  XoeBCAea1GTGA2XC  ',
            'XoeBCAea1GTGA2X-',
            'XoeBCAea1GTGA2X_',
            'XoeBCAea1GTGA2XCa',
            'XoeBCAea1GTGA2X~'
        ];
    }

    function _getEmailTestData() {
        let EMAIL_TEST_DATA = require('./data/email-test-data');
        return _.cloneDeep(EMAIL_TEST_DATA);
    }
});
