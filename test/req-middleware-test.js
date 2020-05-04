'use strict';

describe('Req Middleware Test', function () {

    const chai = require('chai');
    const expect = chai.expect;

    const { _getIP } = require('../req-middleware');

    describe('1. _getIP()', () => {

        it('1. Get IP from request without x-forwarded-for header (null value). Expect to return IP from connection', function () {
            const req = _getReq({ headers: {} });
            const ip = _getIP(req);
            expect(ip).to.equals('5.5.5.5');
        });

        it('2. Get IP from request without x-forwarded-for header (empty string). Expect to return IP from connection', function () {
            const req = _getReq({ headers: { 'x-forwarded-for': '' } });
            const ip = _getIP(req);
            expect(ip).to.equals('5.5.5.5');
        });

        it('3. Get IP from request with invalid x-forwarded-for header. Expect to return IP from connection', function () {
            const req = _getReq({ headers: { 'x-forwarded-for': 'unknown' } });
            const ip = _getIP(req);
            expect(ip).to.equals('5.5.5.5');
        });

        it('4. Get IP from request with multiple invalid x-forwarded-for header. Expect to return IP from connection', function () {
            const req = _getReq({ headers: { 'x-forwarded-for': 'unknown, unknown, unknown' } });
            const ip = _getIP(req);
            expect(ip).to.equals('5.5.5.5');
        });

        it('5. Get IP from request with x-forwarded-for with one IP v4. Expect to return IP from header', function () {
            const req = _getReq({ headers: { 'x-forwarded-for': '1.1.1.1' } });
            const ip = _getIP(req);
            expect(ip).to.equals('1.1.1.1');
        });

        it('6. Get IP from request with x-forwarded-for with one IP v6. Expect to return IP from header', function () {
            const req = _getReq({ headers: { 'x-forwarded-for': '1:1:1:1:1:1:1:1' } });
            const ip = _getIP(req);
            expect(ip).to.equals('1:1:1:1:1:1:1:1');
        });

        it('7. Get IP from request with x-forwarded-for with multiple IP v4. Expect to return first IP from header', function () {
            const req = _getReq({ headers: { 'x-forwarded-for': '2.2.2.2, 1.1.1.1, 0.0.0.0' } });
            const ip = _getIP(req);
            expect(ip).to.equals('2.2.2.2');
        });

        it('8. Get IP from request with x-forwarded-for with multiple IP v6. Expect to return first IP from header', function () {
            const req = _getReq({ headers: { 'x-forwarded-for': '2:2:2:2:2:2:2:2, 1:1:1:1:1:1:1:1, 0:0:0:0:0:0:0:0' } });
            const ip = _getIP(req);
            expect(ip).to.equals('2:2:2:2:2:2:2:2');
        });

        it('9. Get IP from request with x-forwarded-for with multiple IP v4 (first invalid). Expect to return first valid IP from header', function () {
            const req = _getReq({ headers: { 'x-forwarded-for': 'unknown, 1.1.1.1, 0.0.0.0' } });
            const ip = _getIP(req);
            expect(ip).to.equals('1.1.1.1');
        });

        it('10. Get IP from request with x-forwarded-for with multiple IP v6 (first invalid). Expect to return first valid IP from header', function () {
            const req = _getReq({ headers: { 'x-forwarded-for': 'unknown, 1:1:1:1:1:1:1:1, 0:0:0:0:0:0:0:0' } });
            const ip = _getIP(req);
            expect(ip).to.equals('1:1:1:1:1:1:1:1');
        });


        /**
         * @param {Object=} opts
         * @return {Object}
         * @private
         */
        function _getReq(opts = {}) {
            return {
                headers: {
                    'x-forwarded-for': 'unknown, unknown, 3.3.3.3'
                },
                connection: {
                    remoteAddress: '5.5.5.5'
                },
                ...opts
            };
        }

        // 1:2:3:4:5:6:7:8
    });
});
