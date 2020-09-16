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

    describe('4. Test .incr()', () => {

        let client = null;

        before(async () => {
            const opts = _getOptions();
            client = new RedisClient(opts);
            await client.init();
        });

        it('1. Call .incr() with key. Expect to call internal redis incr with proper params', () => {
            const incrStub = _getIncrStub();
            client.incr('key');

            expect(incrStub.calledOnce).to.equals(true);
            sinon.assert.calledWith(incrStub, 'key');
            incrStub.restore();
        });

        it('2. Call .incr() with key and expiration. Expect to call internal redis multi() followed by calls to incr() and expire()', async () => {
            const multiStub = _getMultiStub(5);
            let result = await client.incr('key', 120);
            expect(result).to.eql(5);
            expect(multiStub.multiStub.calledOnce).to.equals(true);
            sinon.assert.calledWith(multiStub.incrStub, 'key');
            sinon.assert.calledWith(multiStub.expireStub, 'key', 120);
            multiStub.restore();
        });

        function _getIncrStub() {
            return sinon.stub(Redis.prototype, 'incr').callsFake(() => null);
        }

        function _getMultiStub(returnValue) {
            let expireStub = sinon.stub().returns({
                exec: async () => [[null, returnValue]]
            });
            let incrStub = sinon.stub().returns({ expire: expireStub });
            let multiStub = sinon.stub(Redis.prototype, 'multi').returns({ incr: incrStub });
            return { expireStub, incrStub, multiStub, restore: () => { multiStub.restore(); } };
        }
    });

    describe('5. Test .decr()', () => {

        let client = null;

        before(async () => {
            const opts = _getOptions();
            client = new RedisClient(opts);
            await client.init();
        });

        it('1. Call .decr() with key. Expect to call internal redis decr with proper params', () => {
            const decrStub = _getIncrStub();
            client.decr('key');

            expect(decrStub.calledOnce).to.equals(true);
            sinon.assert.calledWith(decrStub, 'key');
            decrStub.restore();
        });

        it('2. Call .decr() with key and expiration. Expect to call internal redis multi() followed by calls to decr() and expire()', async () => {
            const multiStub = _getMultiStub(5);
            let result = await client.decr('key', 120);
            expect(result).to.eql(5);
            expect(multiStub.multiStub.calledOnce).to.equals(true);
            sinon.assert.calledWith(multiStub.decrStub, 'key');
            sinon.assert.calledWith(multiStub.expireStub, 'key', 120);
            multiStub.restore();
        });

        function _getIncrStub() {
            return sinon.stub(Redis.prototype, 'decr').callsFake(() => null);
        }

        function _getMultiStub(returnValue) {
            let expireStub = sinon.stub().returns({
                exec: async () => [[null, returnValue]]
            });
            let decrStub = sinon.stub().returns({ expire: expireStub });
            let multiStub = sinon.stub(Redis.prototype, 'multi').returns({ decr: decrStub });
            return { expireStub, decrStub, multiStub, restore: () => { multiStub.restore(); } };
        }
    });

    describe('6. Test .expire()', () => {

        let client = null;

        before(async () => {
            const opts = _getOptions();
            client = new RedisClient(opts);
            await client.init();
        });

        it('1. Call .expire() with key and expiration time in seconds. Expect to call internal redis expire with proper params', () => {
            const expireStub = _getExpireStub();
            client.expire('key', 120);

            expect(expireStub.calledOnce).to.equals(true);
            sinon.assert.calledWith(expireStub, 'key', 120);
            expireStub.restore();
        });

        function _getExpireStub() {
            return sinon.stub(Redis.prototype, 'expire').callsFake(() => null);
        }
    });

    describe('6. Test .pexpire()', () => {

        let client = null;

        before(async () => {
            const opts = _getOptions();
            client = new RedisClient(opts);
            await client.init();
        });

        it('1. Call .pexpire() with key and expiration time in milliseconds. Expect to call internal redis pexpire with proper params', () => {
            const pexpireStub = _getPexpireStub();
            client.pexpire('key', 120000);

            expect(pexpireStub.calledOnce).to.equals(true);
            sinon.assert.calledWith(pexpireStub, 'key', 120000);
            pexpireStub.restore();
        });

        function _getPexpireStub() {
            return sinon.stub(Redis.prototype, 'pexpire').callsFake(() => null);
        }
    });

    describe('7. Test .hincrby()', () => {

        let client = null;

        before(async () => {
            const opts = _getOptions();
            client = new RedisClient(opts);
            await client.init();
        });

        it('1. Call .hincrby() with key, field and increment. Expect to call internal redis hincrby with proper params', () => {
            const hincrbyStub = _getHincrbyStub();
            client.hincrby('key', 'field',10);

            expect(hincrbyStub.calledOnce).to.equals(true);
            sinon.assert.calledWith(hincrbyStub, 'key', 'field', 10);
            hincrbyStub.restore();
        });

        function _getHincrbyStub() {
            return sinon.stub(Redis.prototype, 'hincrby').callsFake(() => null);
        }
    });
});
