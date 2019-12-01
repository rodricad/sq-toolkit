'use strict';

describe('BufferQueue Test', function() {

    let Promise = require('bluebird');
    let chai    = require('chai');
    let expect  = chai.expect;
    let sinon   = require('sinon');

    let NotifyUtil  = require('./utils/notify-util');
    let DummyLogger = require('./utils/dummy-logger');
    let dummyLogger = new DummyLogger();

    let Exception   = require('../exception');
    let BufferQueue = require('../buffer-queue');

    it('1. Create BufferQueue with maxItems = 5 and maxTime = null and without promises.' +
        ' Add 4 items, expect flush to not be called. Add 1 item. Expect flush to be called', function () {

        let consumedCount = 0;
        let consumedItems = [];

        function iterator(items) {
            consumedCount += items.length;
            consumedItems = consumedItems.concat(items);

            return Promise.resolve();
        }

        let opts = {
            name: 'TestQueue',
            iterator: iterator,
            maxItems: 5,
            maxTime: null,
            itemPromises: false,
            logger: dummyLogger
        };

        let bufferQueue = new BufferQueue(opts);

        let flushSpy = sinon.spy(bufferQueue, 'flush');

        for (let i = 0; i < 4; i++) {
            let value = bufferQueue.add('Item ' + i);
            expect(value).to.equals(null);
        }

        expect(flushSpy.notCalled).to.equals(true);

        expect(consumedCount).to.equals(0);
        expect(consumedItems).to.eql([]);

        bufferQueue.add('Item 4');

        expect(flushSpy.calledOnce).to.equals(true);

        expect(consumedCount).to.equals(5);
        expect(consumedItems).to.eql([
            'Item 0',
            'Item 1',
            'Item 2',
            'Item 3',
            'Item 4'
        ]);
    });

    it('2. Create a BufferQueue with maxItems = 5 and maxTime = 100 and without promises. Add 4 items. Expect queue must not flushed. Wait 100 ms. Expect queue to be flushed', function () {
        this.timeout(200);

        let consumedCount = 0;
        let consumedItems = [];

        function iterator(items) {
            consumedCount += items.length;
            consumedItems = consumedItems.concat(items);

            return Promise.resolve();
        }

        let opts = {
            name: 'TestQueue',
            iterator: iterator,
            maxItems: 5,
            maxTime: 100,
            itemPromises: false,
            logger: dummyLogger
        };

        let bufferQueue = new BufferQueue(opts);

        let flushSpy = sinon.spy(bufferQueue, 'flush');

        for (let i = 0; i < 4; i++) {
            let value = bufferQueue.add('Item ' + i);
            expect(value).to.equals(null);
        }

        expect(flushSpy.notCalled).to.equals(true);

        return Promise.delay(opts.maxTime)
        .then(() => {
            expect(flushSpy.calledOnce).to.equals(true);

            expect(consumedCount).to.equals(4);
            expect(consumedItems).to.eql([
                'Item 0',
                'Item 1',
                'Item 2',
                'Item 3'
            ]);
        })
        .finally(() => {
            flushSpy.restore();
            bufferQueue.stop();
        });
    });

    it('3. Create BufferQueue with maxItems = 5 and maxTime = null and without promises.' +
        ' Add 4 items, expect flush to not be called. Add 1 item. Expect flush to be called and raise error and user logger and notifier', function () {

        let notify = NotifyUtil.getNotify(BufferQueue);

        let consumedCount = 0;
        let consumedItems = [];

        function iterator(items) {
            consumedCount += items.length;
            consumedItems = consumedItems.concat(items);

            return Promise.reject(new Exception('BUFFER_QUEUE_ERROR'));
        }

        let opts = {
            name: 'TestQueue',
            iterator: iterator,
            maxItems: 5,
            maxTime: null,
            itemPromises: false,
            logger: dummyLogger,
            loggerStart: 0,
            loggerEach: 10
        };

        let bufferQueue = new BufferQueue(opts);

        let flushSpy = sinon.spy(bufferQueue, 'flush');

        for (let i = 0; i < 4; i++) {
            let value = bufferQueue.add('Item ' + i);
            expect(value).to.equals(null);
        }

        expect(flushSpy.notCalled).to.equals(true);

        expect(consumedCount).to.equals(0);
        expect(consumedItems).to.eql([]);

        bufferQueue.add('Item 4');

        expect(flushSpy.calledOnce).to.equals(true);

        return notify.deferred
        .then(() => {

            expect(consumedCount).to.equals(5);
            expect(consumedItems).to.eql([
                'Item 0',
                'Item 1',
                'Item 2',
                'Item 3',
                'Item 4'
            ]);

            expect(dummyLogger.notifier.values.start).to.eql(0);
            expect(dummyLogger.notifier.values.each).to.eql(10);
            expect(dummyLogger.notifier.values.key).to.eql('TestQueue | BufferQueue Error');
            expect(dummyLogger.notifier.values.msg).to.eql('buffer-queue.js:: Error at %s Buffer. Error: ');
        })
        .finally(() => {
            NotifyUtil.restore(notify);
        });
    });

    it('4. Create a BufferQueue with maxItems = 5 and itemPromises = true. Add 5 items and expect promises in all items', function () {
        let consumedCount = 0;
        let consumedItems = [];

        function iterator() {
            return Promise.resolve();
        }

        let opts = {
            name: 'TestQueue',
            iterator: iterator,
            maxItems: 5,
            maxTime: null,
            itemPromises: true,
            logger: dummyLogger
        };

        let bufferQueue = new BufferQueue(opts);

        for (let i = 0; i < 4; i++) {
            bufferQueue.add('Item ' + i)
            .then(() => {
                consumedCount++;
                consumedItems.push('Item ' + i);
            });
        }

        return bufferQueue.add('Item ' + 4)
        .then(() => {
            consumedCount++;
            consumedItems.push('Item ' + 4);

            expect(consumedCount).to.equals(5);
            expect(consumedItems).to.eql([
                'Item 0',
                'Item 1',
                'Item 2',
                'Item 3',
                'Item 4'
            ]);
        });
    });

    it('5. Create a BufferQueue with maxItems = 5 and itemPromises = true. Add 5 items and expect promises to be rejected', function () {
        let consumedCount = 0;
        let consumedItems = [];

        function iterator(items) {
            return Promise.reject(new Exception('BUFFER_QUEUE_ERROR'));
        }

        let opts = {
            name: 'TestQueue',
            iterator: iterator,
            maxItems: 5,
            maxTime: null,
            itemPromises: true,
            logger: dummyLogger
        };

        let bufferQueue = new BufferQueue(opts);

        let flushSpy = sinon.spy(bufferQueue, 'flush');

        for (let i = 0; i < 4; i++) {
            bufferQueue.add('Item ' + i)
            .catch(err => {
                expect(err.code).to.equals('BUFFER_QUEUE_ERROR');

                consumedCount++;
                consumedItems.push('Item ' + i);
            });
        }

        expect(flushSpy.notCalled).to.equals(true);

        expect(consumedCount).to.equals(0);
        expect(consumedItems).to.eql([]);

        return bufferQueue.add('Item ' + 4)
        .then(() => {
            chai.assert();
        })
        .catch(err => {
            expect(err.code).to.equals('BUFFER_QUEUE_ERROR');

            consumedCount++;
            consumedItems.push('Item ' + 4);

            expect(consumedCount).to.equals(5);
            expect(consumedItems).to.eql([
                'Item 0',
                'Item 1',
                'Item 2',
                'Item 3',
                'Item 4'
            ]);
        });
    });

    it('6. Create BufferQueue with maxItems = 5 and maxTime = null and without promises.' +
        ' Add 10 items with addMany(), expect flush be called once', function () {

        let consumedCount = 0;
        let consumedItems = [];

        function iterator(items) {
            consumedCount += items.length;
            consumedItems = consumedItems.concat(items);

            return Promise.resolve();
        }

        let opts = {
            name: 'TestQueue',
            iterator: iterator,
            maxItems: 5,
            maxTime: null,
            itemPromises: false,
            logger: dummyLogger
        };

        let bufferQueue = new BufferQueue(opts);

        let flushSpy = sinon.spy(bufferQueue, 'flush');

        expect(flushSpy.notCalled).to.equals(true);

        let items = [];

        for (let i = 0; i < 10; i++) {
            items.push('Item ' + i);
        }

        bufferQueue.addMany(items);

        expect(flushSpy.calledOnce).to.equals(true);

        expect(consumedCount).to.equals(5);
        expect(consumedItems).to.eql([
            'Item 0',
            'Item 1',
            'Item 2',
            'Item 3',
            'Item 4'
        ]);

        expect(bufferQueue.queue.length).to.equals(5);
    });

    it('7. Try to .addMany() items with itemPromises = true. Expect tor raise Exception', function () {

        let opts = {
            name: 'TestQueue',
            iterator: function () {},
            maxItems: 5,
            maxTime: null,
            itemPromises: true,
            logger: dummyLogger
        };

        let bufferQueue = new BufferQueue(opts);

        try {
            bufferQueue.addMany([1, 2, 3, 4, 5]);
            chai.assert();
        }
        catch(err) {
            expect(err.code).to.equals('ERROR_ADD_MANY_NOT_SUPPORTED');
        }
    });
});
