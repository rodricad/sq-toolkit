'use strict';

const chai      = require('chai');
const expect    = chai.expect;
const sinon     = require('sinon');
const Mailer    = require('../mailer');

const TEST_OPTIONS = {
    host: '127.0.0.1',
    port: 99999,
    secure: false,
    auth: {
        user: 'dummyUser',
        password: 'dummyPassword'
    }
};

describe('Mailer Tests', function () {

    afterEach(() => {
        Mailer.clearInstance();
    });

    it('1. Calling getInstance without having called createInstance should throw error', () => {
        let mailer;
        try {
            mailer = Mailer.getInstance();
            expect.fail('Should not get here');
        } catch (e) {
            expect(e.message).to.eql('mailer.js::getInstance:: ERROR: Must call createInstace() before using.');
        }
    });

    it('2. Calling createInstance twice should throw error', () => {
        Mailer.createInstance(TEST_OPTIONS);
        try {
            Mailer.createInstance(TEST_OPTIONS);
            expect.fail('Should not get here');
        } catch (e) {
            expect(e.message).to.eql('mailer.js::createInstance:: ERROR: Instance already created, use getInstance() instead.');
        }
    });

    it('3. Calling sendMail should call nodemailer.sendMail() correctly', async () => {
        let from = 'dummyFrom';
        let to = 'dummyTo';
        let subject = 'dummySubject';
        let html = 'dummyHtml';
        let text = 'dummyText';

        Mailer.createInstance(TEST_OPTIONS);
        let mailer = Mailer.getInstance();
        let sendMailStub = sinon.stub(mailer._transporter, 'sendMail').resolves();
        await mailer.sendEmail(from, to, subject, text, html);
        expect(sendMailStub.calledOnce).to.eql(true);
        expect(sendMailStub.firstCall.args).to.eql([{
            from, to, subject, html, text
        }]);
    });

});
