'use strict';

describe('UA Parser Test', function () {

    let sinon  = require('sinon');
    let chai   = require('chai');
    let expect = chai.expect;
    let assert = chai.assert;

    let UAParser = require('../ua-parser');

    describe('1. Test .getDevice()', function () {

        it('1. Test for desktop user agents. Expect to return "desktop"', function () {
            let ua = null;

            // Chrome
            ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36';
            _testDevice(ua, 'desktop');

            // Firefox
            ua = 'Mozilla/5.0 (X11; Linux x86_64; rv:10.0) Gecko/20100101 Firefox/10.0';
            _testDevice(ua, 'desktop');

            // Safari
            ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13 Safari/605.1.15';
            _testDevice(ua, 'desktop');
        });

        it('2. Test for mobile user agents. Expect to return "mobile"', function () {
            let ua = null;

            // Chrome
            ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/77.0.3865.103 Mobile/15E148 Safari/605.1';
            _testDevice(ua, 'mobile');

            // Firefox
            ua = 'Mozilla/5.0 (Android 4.4; Mobile; rv:41.0) Gecko/41.0 Firefox/41.0';
            _testDevice(ua, 'mobile');

            // Safari
            ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13 Mobile/15E148 Safari/604.1';
            _testDevice(ua, 'mobile');
        });

        it('3. Test for mobile user agents. Expect to return "tablet"', function () {
            let ua = null;

            // Chrome
            ua = 'Mozilla/5.0 (Linux; Android 7.0; SM-T827R4 Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.116 Safari/537.36';
            _testDevice(ua, 'tablet');

            // Firefox
            ua = 'Mozilla/5.0 (Android 4.4; Tablet; rv:41.0) Gecko/41.0 Firefox/41.0';
            _testDevice(ua, 'tablet');

            // Safari
            ua = 'Mozilla/5.0 (iPad; CPU OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148';
            _testDevice(ua, 'tablet');
        });

        it('4. Test for other user agents (smart tv, console, wearable or embedded). Expect to return "tablet"', function () {
            let ua = null;

            // Console
            ua = 'Mozilla/5.0 (PLAYSTATION 3; 1.00)';
            _testDevice(ua, 'other');
        });

        /**
         * @param {String} ua
         * @param {String} expected
         * @private
         */
        function _testDevice(ua, expected) {
            let value = UAParser.getDevice(ua);
            expect(value).to.equals(expected);
        }
    });
});
