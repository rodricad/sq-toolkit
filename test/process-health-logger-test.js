'use strict';

describe('Process Health Logger Tests', function () {

    const chai = require('chai');
    const expect = chai.expect;
    const sinon = require('sinon');
    const PromiseTools = require('../promise-native-tool');
    const ProcessHealthLogger = require('../process-health-logger');
    const DummyLogger = require('./utils/dummy-logger');


    it('1. Should instantiate process-health-logger and start logging process info', async () => {
        let dummyLogger = new DummyLogger();
        let infoStub = sinon.stub(dummyLogger, 'info').returns();
        let options = {
            processLabel: 'test',
            interval: 1,
            logger: dummyLogger
        };
        let processHealthLogger = new ProcessHealthLogger(options);
        processHealthLogger.start();
        await PromiseTools.delay(1100);
        expect(infoStub.callCount).to.eql(2);
        expect(infoStub.args[0][0]).to.eql('process-health.js process:%s rss:%s mb external:%s mb heapUsed:%s mb heapTotal:%s mb (%s%) uptime:%s min');
        expect(infoStub.args[1][0]).to.eql('process-health.js process:%s rss:%s mb external:%s mb heapUsed:%s mb heapTotal:%s mb (%s%) uptime:%s min');
    });

});
