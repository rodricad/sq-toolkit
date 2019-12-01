'use strict';

describe('Mapper URL Test', function () {

    let chai   = require('chai');
    let expect = chai.expect;

    let MapperURL = require('../mapper-url');
    let mapperURL = null;

    before(function () {

        let shortByLongMapping = {
            siteId: 's',
            emailId: 'ei',
            email: 'e',
            ts: 'ts',
            deliveryTs: 'dt',
            type: 't',
            campaign: 'c',
            partner: 'p',

            q: 'q',
            l: 'l',
            o: 'o'
        };

        mapperURL = new MapperURL(shortByLongMapping);
    });

    it('1. .getShort()', function () {

        let short = mapperURL.getShort('siteId');
        expect(short).to.equals('s');

        short = mapperURL.getShort('deliveryTs');
        expect(short).to.equals('dt');

        short = mapperURL.getShort('extraField');
        expect(short).to.equals('extraField');
    });

    it('2. .getLong()', function () {

        let short = mapperURL.getLong('s');
        expect(short).to.equals('siteId');

        short = mapperURL.getLong('dt');
        expect(short).to.equals('deliveryTs');

        short = mapperURL.getLong('extraField');
        expect(short).to.equals('extraField');
    });

    it('3. .map()', function () {

        let longOptions = {
            siteId: 12345,
            email: 'example@example.com',
            extraField: 'extraValue'
        };

        let shortOptions = mapperURL.map(longOptions);

        expect(shortOptions).to.eql({
            s: 12345,
            e: 'example@example.com',
            extraField: 'extraValue'
        });
    });

    it('4. .unmap()', function () {

        let shortOptions = {
            s: 12345,
            e: 'example@example.com',
            extraField: 'extraValue'
        };

        let longOptions = mapperURL.unmap(shortOptions);

        expect(longOptions).to.eql({
            siteId: 12345,
            email: 'example@example.com',
            extraField: 'extraValue'
        });
    });
});
