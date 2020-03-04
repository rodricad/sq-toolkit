'use strict';

describe.only('ConsumerQueue Test', function() {

    const chai = require('chai');
    const expect = chai.expect;

    const Shuffler = require('../shuffler');
    const DummyLogger = require('./utils/dummy-logger');

    const PromiseNativeTool = require('../promise-native-tool');
    const ConsumerQueue = require('../consumer-queue');

    it('1. Add 10 items with maxConsumers=1 and maxElements=5. Hold until finish and result expect to be ordered' +
        ' because just one consumer was used and processed in series', async () => {

        let executionOrder = [];
        let resultOrder = [];

        function consumerProcess(item) {
            executionOrder.push(item);
            return _randomDelay()
            .then(() => {
                resultOrder.push(item);
            });
        }

        const opts = _getOptions({ maxConsumers: 1, maxElements: 5, consumerProcess });
        const consumerQueue = new ConsumerQueue(opts);

        expect(consumerQueue.isAnyConsumerRunning()).to.equals(false);
        expect(consumerQueue.areConsumersFull()).to.equals(false);
        expect(consumerQueue.isMainQueueEmpty()).to.equals(true);

        for (let i = 0; i < 10; i++) {
            if (i === 1) {
                expect(consumerQueue.isAnyConsumerRunning()).to.equals(true);
                expect(consumerQueue.areConsumersFull()).to.equals(true);
                expect(consumerQueue.isMainQueueEmpty()).to.equals(true);
            }

            await consumerQueue.add(i);

            if (i === 1) {
                expect(consumerQueue.isMainQueueEmpty()).to.equals(false);
            }
        }

        expect(consumerQueue.hasFinished()).to.equals(false);
        consumerQueue.producerFinished();
        expect(consumerQueue.hasFinished()).to.equals(false);

        await consumerQueue.holdOn();
        expect(consumerQueue.hasFinished()).to.equals(true);

        expect(executionOrder).to.length(10);
        expect(executionOrder).to.eql([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

        expect(resultOrder).to.length(10);
        expect(resultOrder).to.eql([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('2. Add 10 items with maxConsumer=5 and maxElements=5. Hold until finish and result expect to be unordered' +
        ' because multiple consumers were used', async () => {

        let executionOrder = [];
        let resultOrder = [];

        function consumerProcess(item) {
            executionOrder.push(item);
            return _randomDelay()
            .then(() => {
                resultOrder.push(item);
            });
        }

        const opts = _getOptions({ maxConsumers: 5, maxElements: 5, consumerProcess });
        const consumerQueue = new ConsumerQueue(opts);

        for (let i = 0; i < 10; i++) {
            await consumerQueue.add(i);
        }

        consumerQueue.producerFinished();
        await consumerQueue.holdOn();

        expect(executionOrder).to.length(10);
        expect(executionOrder).to.eql([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

        expect(resultOrder).to.length(10);
        expect(resultOrder).to.not.eql([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('3. Add 10 items with maxConsumer=1 and maxElements=5 and raise Exception in the 3rd one. Hold until finish' +
        ' and result expect to be ordered (with Error in 3rd place) because multiple consumers were used', async () => {

        let executionOrder = [];
        let resultOrder = [];

        function consumerProcess(item) {
            executionOrder.push(item);
            return _randomDelay()
            .then(() => {
                if (item === 2) {
                    let err = new Error('TEST_ERROR');
                    resultOrder.push(err);
                    return Promise.reject();
                }
                resultOrder.push(item);
            });
        }

        const opts = _getOptions({ maxConsumers: 1, maxElements: 5, consumerProcess });
        const consumerQueue = new ConsumerQueue(opts);

        for (let i = 0; i < 10; i++) {
            await consumerQueue.add(i);
        }

        consumerQueue.producerFinished();
        await consumerQueue.holdOn();

        expect(executionOrder).to.length(10);
        expect(executionOrder).to.eql([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

        expect(resultOrder).to.length(10);
        expect(resultOrder[2]).to.instanceOf(Error);

        resultOrder.splice(2, 1);
        expect(resultOrder).to.eql([0, 1, 3, 4, 5, 6, 7, 8, 9]);
    });

    /**
     * @return {Promise}
     * @private
     */
    function _randomDelay() {
        const delay = Shuffler.getRandomIntFromInterval(0, 5);
        // return PromiseNativeTool.delay(delay);
        const bluebird = require('bluebird');
        return bluebird.delay(delay);
    }

    /**
     * @param {Object=} opts
     * @return {Object}
     * @private
     */
    function _getOptions(opts = {}) {
        return {
            name: 'TestConsumerQueue',
            logger: new DummyLogger(),
            maxElements: null,
            maxConsumers: null,
            consumerProcess: null,
            ...opts
        };
    }
});
