'use strict';

describe('UA Parser Test', function () {

    const mocha = require('mocha');
    const describe = mocha.describe;
    const it = mocha.it;
    const afterEach = mocha.afterEach;
    const sinon  = require('sinon');
    const chai   = require('chai');
    const expect = chai.expect;
    const assert = chai.assert;

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

    describe('2. Test .getUAData()', () => {

        afterEach(() => {
            UAParser._clearCacheForTest();
        });

        it('1. Test for desktop user agents.', () =>{
            let ua = null;

            // Chrome
            ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36';
            _testUserAgent(ua, {
                deviceType: "desktop",
                deviceModel: null,
                isMobile: false,
                browserName: "Chrome",
                browserVersion: "77.0.3865.120"
            });

            // Firefox
            ua = 'Mozilla/5.0 (X11; Linux x86_64; rv:10.0) Gecko/20100101 Firefox/10.0';
            _testUserAgent(ua, {
                deviceType: "desktop",
                deviceModel: null,
                isMobile: false,
                browserName: "Firefox",
                browserVersion: "10.0"
            });

            // Safari
            ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13 Safari/605.1.15';
            _testUserAgent(ua, {
                deviceType: "desktop",
                deviceModel: null,
                isMobile: false,
                browserName: "Safari",
                browserVersion: "13"
            });
        });


        it('2. Test for mobile user agents.', () =>{
            let ua = null;

            // Chrome
            ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/77.0.3865.103 Mobile/15E148 Safari/605.1';
            _testUserAgent(ua, {
                browserName: "Chrome",
                browserVersion: "77.0.3865.103",
                deviceModel: "iPhone",
                deviceType: "mobile",
                isMobile: true
            });

            // Firefox
            ua = 'Mozilla/5.0 (Android 4.4; Mobile; rv:41.0) Gecko/41.0 Firefox/41.0';
            _testUserAgent(ua, {
                browserName: "Firefox",
                browserVersion: "41.0",
                deviceModel: null,
                deviceType: "mobile",
                isMobile: true
            });

            // Safari
            ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13 Mobile/15E148 Safari/604.1';
            _testUserAgent(ua, {
                browserName: "Mobile Safari",
                browserVersion: "13",
                deviceModel: "iPhone",
                deviceType: "mobile",
                isMobile: true
            });
        });

        it('3. Test for tablet user agents.', () =>{
            let ua = null;

            // Chrome
            ua = 'Mozilla/5.0 (Linux; Android 7.0; SM-T827R4 Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.116 Safari/537.36';
            _testUserAgent(ua, {
                browserName: "Chrome",
                browserVersion: "60.0.3112.116",
                deviceModel: "SM-T827R4",
                deviceType: "tablet",
                isMobile: true
            });

            // Firefox
            ua = 'Mozilla/5.0 (Android 4.4; Tablet; rv:41.0) Gecko/41.0 Firefox/41.0';
            _testUserAgent(ua, {
                browserName: "Firefox",
                browserVersion: "41.0",
                deviceModel: null,
                deviceType: "tablet",
                isMobile: true
            });

            // Safari
            ua = 'Mozilla/5.0 (iPad; CPU OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148';
            _testUserAgent(ua, {
                browserName: "WebKit",
                browserVersion: "605.1.15",
                deviceModel: "iPad",
                deviceType: "tablet",
                isMobile: true
            });
        });

        it('4. Test for other user agents (smart tv, console, wearable or embedded). Expect to return "tablet"', () =>{
            let ua = null;

            // Console
            ua = 'Mozilla/5.0 (PLAYSTATION 3; 1.00)';
            _testUserAgent(ua, {
                browserName: null,
                browserVersion: null,
                deviceModel: "PLAYSTATION 3",
                deviceType: "other",
                isMobile: false
            });
        });

        it('5. Test data retrieved from cache for user agents that have already been resolved (_parser.setUA should only be called once)', () => {
            let ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/77.0.3865.103 Mobile/15E148 Safari/605.1';

            let setUaSpy = sinon.spy(UAParser._getParserForTest(), 'setUA');

            _testUserAgent(ua, {
                browserName: "Chrome",
                browserVersion: "77.0.3865.103",
                deviceModel: "iPhone",
                deviceType: "mobile",
                isMobile: true
            });
            expect(setUaSpy.calledOnce).to.eql(true);

            _testUserAgent(ua, {
                browserName: "Chrome",
                browserVersion: "77.0.3865.103",
                deviceModel: "iPhone",
                deviceType: "mobile",
                isMobile: true
            });
            expect(setUaSpy.calledOnce).to.eql(true);
            setUaSpy.restore();
        });

        it('6. Test data retrieved from cache for user agents that have already been resolved (_parser.setUA should only be called twice when ignoreCache == true)', () => {
            let ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/77.0.3865.103 Mobile/15E148 Safari/605.1';

            let setUaSpy = sinon.spy(UAParser._getParserForTest(), 'setUA');

            _testUserAgent(ua, {
                browserName: "Chrome",
                browserVersion: "77.0.3865.103",
                deviceModel: "iPhone",
                deviceType: "mobile",
                isMobile: true
            }, true);
            expect(setUaSpy.calledOnce).to.eql(true);

            _testUserAgent(ua, {
                browserName: "Chrome",
                browserVersion: "77.0.3865.103",
                deviceModel: "iPhone",
                deviceType: "mobile",
                isMobile: true
            }, true);
            expect(setUaSpy.calledTwice).to.eql(true);
            setUaSpy.restore();
        });

        /**
         * @param {String} ua
         * @param {Object} expected
         * @param {Boolean=} ignoreCache
         * @private
         */
        function _testUserAgent(ua, expected, ignoreCache) {
            let value = UAParser.getData(ua, ignoreCache);
            expect(value).to.eql(expected);
        }
    });
});
