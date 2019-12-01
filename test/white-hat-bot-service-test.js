'use strict';

describe('WhiteHatBotService Test', function () {

    let sinon  = require('sinon');
    let chai   = require('chai');
    let expect = chai.expect;
    let assert = chai.assert;

    let WhiteHatBotService = require('../white-hat-bot-service');

    let _whiteHatBotService = null;

    before(() => {
        _whiteHatBotService = WhiteHatBotService.getInstance();
        return _whiteHatBotService.init();
    });

    it('1. Test Chrome user agents. Expect to return false', function () {

        // Chrome Windows
        let ua    = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36';
        let value = _whiteHatBotService.validate(ua);
        expect(value).to.equals(false);

        // Chrome macOS
        ua    = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36';
        value = _whiteHatBotService.validate(ua);
        expect(value).to.equals(false);

        // Chrome Linux
        ua    = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36';
        value = _whiteHatBotService.validate(ua);
        expect(value).to.equals(false);

        // Chrome Android
        ua    = 'Mozilla/5.0 (Linux; Android 8.0.0;) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.116 Mobile Safari/537.36';
        value = _whiteHatBotService.validate(ua);
        expect(value).to.equals(false);

        // Chrome iOS
        ua    = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/77.0.3865.103 Mobile/15E148 Safari/605.1';
        value = _whiteHatBotService.validate(ua);
        expect(value).to.equals(false);
    });

    it('2. Test Firefox user agents. Expect to return false', function () {

        // Firefox Windows
        let ua    = 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:54.0) Gecko/20100101 Firefox/69.0';
        let value = _whiteHatBotService.validate(ua);
        expect(value).to.equals(false);

        // Firefox macOS
        ua    = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:61.0) Gecko/20100101 Firefox/69.0';
        value = _whiteHatBotService.validate(ua);
        expect(value).to.equals(false);

        // Firefox Linux
        ua    = 'Mozilla/5.0 (X11; Linux i586; rv:31.0) Gecko/20100101 Firefox/69.0';
        value = _whiteHatBotService.validate(ua);
        expect(value).to.equals(false);

        // Firefox Android
        ua    = 'Mozilla/5.0 (Android 8.0.0; Mobile; rv:61.0) Gecko/61.0 Firefox/68.0';
        value = _whiteHatBotService.validate(ua);
        expect(value).to.equals(false);

        // Firefox iOS
        ua    = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/20.0 Mobile/16B92 Safari/605.1.15';
        value = _whiteHatBotService.validate(ua);
        expect(value).to.equals(false);
    });

    it('3. Test Safari user agents. Expect to return false', function () {

        // Firefox macOS
        let ua    = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13 Safari/605.1.15';
        let value = _whiteHatBotService.validate(ua);
        expect(value).to.equals(false);

        // Firefox iPhone
        ua    = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13 Mobile/15E148 Safari/604.1';
        value = _whiteHatBotService.validate(ua);
        expect(value).to.equals(false);

        // Firefox iPad
        ua    = 'Mozilla/5.0 (iPad; CPU OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13 Mobile/15E148 Safari/604.1';
        value = _whiteHatBotService.validate(ua);
        expect(value).to.equals(false);

        // Firefox iPod Touch
        ua    = 'Mozilla/5.0 (iPod Touch; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13 Mobile/15E148 Safari/604.1';
        value = _whiteHatBotService.validate(ua);
        expect(value).to.equals(false);
    });

    it('4. Test known bot user agents. Expect to return true', function () {

        // Google

        let ua    = 'APIs-Google (+https://developers.google.com/webmasters/APIs-Google.html)';
        let value = _whiteHatBotService.validate(ua);
        expect(value).to.equals(true);

        ua    = 'Mediapartners-Google';
        value = _whiteHatBotService.validate(ua);
        expect(value).to.equals(true);

        ua    = 'Mozilla/5.0 (Linux; Android 5.0; SM-G920A) AppleWebKit (KHTML, like Gecko) Chrome Mobile Safari (compatible; AdsBot-Google-Mobile; +http://www.google.com/mobile/adsbot.html)';
        value = _whiteHatBotService.validate(ua);
        expect(value).to.equals(true);

        ua    = 'Googlebot-Image/1.0';
        value = _whiteHatBotService.validate(ua);
        expect(value).to.equals(true);

        ua    = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
        value = _whiteHatBotService.validate(ua);
        expect(value).to.equals(true);

        // Pingdom

        ua    = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/59.0.3071.109 Chrome/59.0.3071.109 Safari/537.36 PingdomPageSpeed/1.0 (pingbot/2.0; +http://www.pingdom.com/)';
        value = _whiteHatBotService.validate(ua);
        expect(value).to.equals(true);

        ua    = 'Mozilla/5.0 (compatible; pingbot/2.0; +http://www.pingdom.com/)';
        value = _whiteHatBotService.validate(ua);
        expect(value).to.equals(true);
    });

    it('5. Test specific pingdom method. Expect to return true', function () {

        // Google

        let ua    = 'APIs-Google (+https://developers.google.com/webmasters/APIs-Google.html)';
        let value = _whiteHatBotService.isPingdom(ua);
        expect(value).to.equals(false);

        // Pingdom

        ua    = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/59.0.3071.109 Chrome/59.0.3071.109 Safari/537.36 PingdomPageSpeed/1.0 (pingbot/2.0; +http://www.pingdom.com/)';
        value = _whiteHatBotService.isPingdom(ua);
        expect(value).to.equals(true);

        ua    = 'Mozilla/5.0 (compatible; pingbot/2.0; +http://www.pingdom.com/)';
        value = _whiteHatBotService.isPingdom(ua);
        expect(value).to.equals(true);
    });
});
