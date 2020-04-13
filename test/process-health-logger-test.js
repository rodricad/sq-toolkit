'use strict';

describe('Process Health Logger Tests', function () {

    const chai = require('chai');
    const expect = chai.expect;
    const sinon = require('sinon');
    const PromiseTools = require('../promise-native-tool');
    const ProcessHealthLogger = require('../process-health-logger');
    const DummyLogger = require('./utils/dummy-logger');
    
    let dummyLogger = new DummyLogger();
    let processHealthLogger;

    const OPTIONS = {
        processLabel: 'test',
        intervalInSeconds: 0.1,
        logger: dummyLogger
    };

    after(() => {
        if(processHealthLogger != null) {
            processHealthLogger.stop();
        }
    });

    it('1. Should instantiate process-health-logger and start/stop logging process info correctly', async () => {

        let infoStub = sinon.stub(dummyLogger, 'info').returns();

        processHealthLogger = new ProcessHealthLogger(OPTIONS);
        processHealthLogger.start();
        await PromiseTools.delay(110);
        expect(infoStub.callCount).to.eql(2);
        expect(infoStub.args[0][0]).to.eql('process-health.js process:%s rss:%s mb external:%s mb heapUsed:%s mb heapTotal:%s mb (%s%) uptime:%s min');
        expect(infoStub.args[1][0]).to.eql('process-health.js process:%s rss:%s mb external:%s mb heapUsed:%s mb heapTotal:%s mb (%s%) uptime:%s min');
        processHealthLogger.stop();
        await PromiseTools.delay(100);
        expect(infoStub.callCount).to.eql(2);
        infoStub.restore();
    });

    it('2. Should not create a new interval if processHealthLogger is already running', async () => {
        processHealthLogger = new ProcessHealthLogger(OPTIONS);
        processHealthLogger.start();
        let intervalId = processHealthLogger._intervalId;
        processHealthLogger.start();
        expect(processHealthLogger._intervalId).to.eql(intervalId);
        processHealthLogger.stop();
    });

});
