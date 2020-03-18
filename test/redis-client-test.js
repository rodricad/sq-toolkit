'use strict';

describe('Redis Client Test', function () {

    const chai = require('chai');
    const expect = chai.expect;
    const sinon = require('sinon');
    const Redis = require('ioredis');

    const DummyLogger = require('./utils/dummy-logger');
    const RedisClient = require('../redis-client');

    /**
     * @param {Object=} opts
     * @return {Object}
     * @private
     */
    function _getOptions(opts = {}) {
        return {
            logger: new DummyLogger(),
            filename: 'redis-client-test.js',
            name: 'RedisClientTest',
            host: 'localhost',
            port: 6379,
            sentinel: {
                enabled: false,
                name: 'SentinelName',
                sentinels: [
                    { host: 'localhost', port: 26379 },
                    { host: 'localhost', port: 26380 }
                ]
            },
            ...opts
        };
    }

    describe('1. getClientOptions()', () => {

        it('1. Instance redis client without sentinel. Expect to return simple host:port config', () => {
            const opts = _getOptions();
            opts.sentinel = null;

            const client = new RedisClient(opts);
            const clientOptions = client.getClientOptions();

            expect(clientOptions).to.eql({
                host: 'localhost',
                port: 6379,
                showFriendlyErrorStack: true
            });
        });

        it('2. Instance redis client with sentinel but disabled. Expect to return simple host:port config', () => {
            const opts = _getOptions();
            opts.sentinel.enabled = false;

            const client = new RedisClient(opts);
            const clientOptions = client.getClientOptions();

            expect(clientOptions).to.eql({
                host: 'localhost',
                port: 6379,
                showFriendlyErrorStack: true
            });
        });

        it('3. Instance redis client with sentinel but enabled. Expect to return sentinels config', () => {
            const opts = _getOptions();
            opts.sentinel.enabled = true;

            const client = new RedisClient(opts);
            const clientOptions = client.getClientOptions();

            expect(clientOptions).to.eql({
                enabled: true,
                name: 'SentinelName',
                sentinels: [
                    {
                        host: 'localhost',
                        port: 26379
                    },
                    {
                        host: 'localhost',
                        port: 26380
                    }
                ],
                showFriendlyErrorStack: true
            });
        });
    });

    describe('2. Test .init() with valid values. Expect to handle Redis init event correctly', () => {

        it('1. Test .init() with valid values. Expect to init correctly', async () => {
            const opts = _getOptions();
            const client = new RedisClient(opts);

            const getClientOptionsSpy = sinon.spy(client, 'getClientOptions');

            expect(client.isInitialized()).to.equals(false);

            await client.init();
            expect(client.isInitialized()).to.equals(true);
            expect(getClientOptionsSpy.calledOnce).to.equals(true);

            await client.init();
            expect(client.isInitialized()).to.equals(true);
            expect(getClientOptionsSpy.calledOnce).to.equals(true);
        });

        it('2. Test .init() with invalid values. Expect error to be catch correctly', async () => {

            const opts = _getOptions({ port: 6666 });
            const client = new RedisClient(opts);

            try {
                await client.init();
                expect.fail('Initialization should have failed');
            }
            catch(err) {
                expect(err.code).to.equals('ECONNREFUSED');
                expect(err.message).to.equals('connect ECONNREFUSED 127.0.0.1:6666');
            }
        });
    });

    describe('3. Test .set()', () => {

        /**
         * @type {RedisClient|null}
         */
        let client = null;

        before(async () => {
            const opts = _getOptions();
            client = new RedisClient(opts);
            await client.init();
        });

        beforeEach(() => {
            sinon.restore();
        });

        after(() => {
            sinon.restore();
        });

        it('1. Call .set() with only key and value. Expect to call internal redis set with proper params', () => {
            const setStub = _getSetStub();
            client.set('key', 'value');

            expect(setStub.calledOnce).to.equals(true);
            sinon.assert.calledWith(setStub, 'key', 'value');
        });

        it('2. Call .set() with only key, value, expiryMode and time. Expect to call internal redis set with proper params', () => {
            const setStub = _getSetStub();
            client.set('key', 'value', RedisClient.ExpiryMode.EX, 1000);

            expect(setStub.calledOnce).to.equals(true);
            sinon.assert.calledWith(setStub, 'key', 'value', 'EX', 1000);
        });

        it('3. Call .set() with only key, value and setMode. Expect to call internal redis set with proper params', () => {
            const setStub = _getSetStub();
            client.set('key', 'value', null, null, RedisClient.SetMode.NX);

            expect(setStub.calledOnce).to.equals(true);
            sinon.assert.calledWith(setStub, 'key', 'value', 'NX');
        });

        it('4. Call .set() with only key, value, expiryMode and setMode. Expect to call internal redis set with proper params (without expiryMode)', () => {
            const setStub = _getSetStub();
            client.set('key', 'value', RedisClient.ExpiryMode.EX, null, RedisClient.SetMode.NX);

            expect(setStub.calledOnce).to.equals(true);
            sinon.assert.calledWith(setStub, 'key', 'value', 'NX');
        });

        it('5. Call .set() with only key, value, time and setMode. Expect to call internal redis set with proper params (without expiryMode)', () => {
            const setStub = _getSetStub();
            client.set('key', 'value', null, 1000, RedisClient.SetMode.NX);

            expect(setStub.calledOnce).to.equals(true);
            sinon.assert.calledWith(setStub, 'key', 'value', 'NX');
        });

        function _getSetStub() {
            return sinon.stub(Redis.prototype, 'set').callsFake(() => null);
        }
    });
});
