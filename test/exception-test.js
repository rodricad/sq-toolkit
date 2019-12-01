'use strict';

describe('Exception Test', function () {

    let chai = require('chai');
    let expect = chai.expect;

    let Exception = require('../exception');

    it('1. Instance an Exception using code and template. Expect to be created with message and stack', function () {

        let code = 'ERROR_CODE';
        let tpl  = 'Templating like sprintf using constructor %d %s';
        let err = new Exception(code, tpl, 123, 'VALID_STRING');

        expect(err.name).to.equals('Exception');
        expect(err.code).to.equals('ERROR_CODE');
        expect(err.message).to.equals('Templating like sprintf using constructor 123 VALID_STRING');

        expect(err.stack).to.contains('Exception: Templating like sprintf using constructor 123 VALID_STRING');
        expect(err.stack).to.contains('at Context.<anonymous>');
        expect(err.stack).to.contains('/test/exception-test.js:');
    });

    it('2. Instance an Exception using only code. Expect to be created with only code and empty message', function () {

        let code = 'ERROR_CODE';
        let err = new Exception(code);

        expect(err.name).to.equals('Exception');
        expect(err.code).to.equals('ERROR_CODE');
        expect(err.message).to.equals('');

        expect(err.stack).to.contains('Exception');
        expect(err.stack).to.contains('at Context.<anonymous>');
        expect(err.stack).to.contains('/test/exception-test.js:');
    });

    it('3. Instance an Exception. Missing code and message. Expect message to be empty and code to be null', function () {

        let err = new Exception();

        expect(err.name).to.equals('Exception');
        expect(err.code).to.equals(null);
        expect(err.message).to.equals('');

        expect(err.stack).to.contains('Exception');
        expect(err.stack).to.contains('at Context.<anonymous>');
        expect(err.stack).to.contains('/test/exception-test.js:');
    });
});
