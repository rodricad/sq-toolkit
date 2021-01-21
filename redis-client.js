'use strict';

let Redis = require('ioredis');
let PromiseTool = require('./promise-tool');

const Event = {
    ERROR: 'error',
    READY: 'ready'
};

const ExpiryMode = {
    EX: 'EX',
    PX: 'PX',

    EXPIRE_IN_SECONDS: 'EX',
    EXPIRE_IN_MILLISECONDS: 'PX'
};

const SetMode = {
    NX: 'NX',
    XX: 'XX',
    KEEPTTL: 'KEEPTTL',

    SET_ONLY_IF_NOT_EXISTS: 'NX',
    SET_ONLY_IF_ALREADY_EXISTS: 'XX',
    KEEP_TIME_TO_LIVE: 'KEEPTTL'
};

class RedisClient {

    /**
     * @param {Object}    options
     * @param {WinstonLogger=|DummyLogger=} options.logger
     * @param {Object}    options.filename
     * @param {String=}   options.name
     * @param {String=}   options.host
     * @param {Number=}   options.port
     * @param {Object=}   options.sentinel
     * @param {Boolean=}  options.sentinel.enabled
     * @param {String=}   options.sentinel.name
     * @param {String[]=} options.sentinel.sentinels
     */
    constructor(options= {}) {
        this.client = null;
        this.logger = options.logger || null;
        this.filename = options.filename;
        this.name = options.name;
        this.host = options.host;
        this.port = options.port;
        this.sentinel = options.sentinel;

        this.initialized = false;
    }

    /**
     * @return {Boolean}
     */
    isInitialized() {
        return this.initialized === true;
    }

    /**
     * @return {Object}
     */
    getClientOptions() {
        let options = {
            showFriendlyErrorStack: true
        };

        if (this.sentinel != null && this.sentinel.enabled === true) {
            options = { ...options, ...this.sentinel };
        }
        else {
            options.host = this.host;
            options.port = this.port;
        }

        return options;
    }

    /**
     * @return {Promise.<RedisClient>}
     */
    async init() {
        if (this.isInitialized() === true) {
            return this;
        }

        let options = this.getClientOptions();
        this.client = new Redis(options);
        const deferred = PromiseTool.createDeferred();

        this.client.on(Event.ERROR, err => {
            this.initialized = false;
            if (this.logger != null) {
                this.logger.notify(this.name + ' | Init').steps(0, 100).msg('%s:init Error at init. name:%s host:%s port:%s sentinel:%s. Error: ', this.filename, this.name, this.host, this.port, JSON.stringify(this.sentinel), err);
            }
            deferred.forceReject(err);
        });

        this.client.on(Event.READY, () => {
            this.initialized = true;
            if (this.logger != null) {
                this.logger.info('%s:init Init ok. name:%s host:%s port:%s sentinel:%s', this.filename, this.name, this.host, this.port, JSON.stringify(this.sentinel));
            }
            deferred.forceResolve(this);
        });

        return deferred;
    }

    /* istanbul ignore next */
    /**
     * Set key to hold the string value. If key already holds a value, it is overwritten by default, regardless of its type.
     * Any previous time to live associated with the key is discarded on successful SET operation by default.
     * @reference https://redis.io/commands/set
     * @param {String} key
     * @param {String} value
     * @param {String=} expiryMode
     * @param {Number=} time
     * @param {Number=} setMode
     * @return {Promise}
     */
    set(key, value, expiryMode, time, setMode) {
        let args = [key, value];

        if (expiryMode != null && time != null) {
            args.push(expiryMode, time);
        }
        if (setMode != null) {
            args.push(setMode);
        }

        return this.client.set.apply(this.client, args);
    }

    /* istanbul ignore next */
    /**
     * Set key to hold the string value and set key to timeout after a given number of seconds.
     * @reference https://redis.io/commands/setex
     * @param {String} key
     * @param {String} value
     * @param {Number} timeInSeconds
     * @return {Promise}
     */
    setex(key, value, timeInSeconds) {
        return this.set(key, value, ExpiryMode.EX, timeInSeconds);
    }

    /* istanbul ignore next */
    /**
     * Set key to hold the string value and set key to timeout after a given number of seconds.
     * @reference https://redis.io/commands/psetex
     * @param {String} key
     * @param {String} value
     * @param {Number} timeInMilliseconds
     * @return {Promise}
     */
    psetex(key, value, timeInMilliseconds) {
        return this.set(key, value, ExpiryMode.PX, timeInMilliseconds);
    }

    /* istanbul ignore next */
    /**
     * Set key to hold the string value and set key to timeout after a given number of milliseconds.
     * @reference https://redis.io/commands/setnx
     * @param {String} key
     * @param {String} value
     * @return {Promise}
     */
    setnx(key, value) {
        return this.set(key, value, null, null, SetMode.NX);
    }

    /* istanbul ignore next */
    /**
     * Get the value of key. If the key does not exist null is returned.
     * @reference https://redis.io/commands/get
     * @param {String} key
     * @return {Promise.<String|null>}
     */
    async get(key) {
        const value = await this.client.get(key);
        return value != null ? value : null;
    }

    /* istanbul ignore next */
    /**
     * Returns the value associated with field in the hash stored at key
     * @reference https://redis.io/commands/hget
     * @param {String} hash
     * @param {String} field
     * @return {Promise<String|null>}
     */
    hget(hash, field) {
        return this.client.hget(hash, field);
    }

    /* istanbul ignore next */
    /**
     * Returns the values associated with the specified fields in the hash stored at key.
     * @reference https://redis.io/commands/hmget
     * @param {String} hash
     * @param {String[]} fields
     * @return {Promise.<Array<String|null>>}
     */
    hmget(hash, fields) {
        return this.client.hmget(hash, fields);
    }

    /* istanbul ignore next */
    /**
     * Returns all fields and values of the hash stored at key. In the returned value, every field name is followed by its value, so the length of the reply is twice the size of the hash.
     * @reference https://redis.io/commands/hgetall
     * @param {String} hash
     * @return {Promise<Record<String, String>>}
     */
    hgetall(hash) {
        return this.client.hgetall(hash);
    }

    /* istanbul ignore next */
    /**
     * Sets field in the hash stored at key to value. If key does not exist, a new key holding a hash is created.
     * If field already exists in the hash, it is overwritten.
     * @reference https://redis.io/commands/hset
     * @param {String} hash
     * @param {String|String[]} values
     * @return {Promise<IORedis.BooleanResponse>}
     */
    hset(hash, values) {
        return this.client.hset(hash, values);
    }

    /* istanbul ignore next */
    /**
     * Removes the specified keys. A key is ignored if it does not exist.
     * @reference https://redis.io/commands/del
     * @param {String|String[]} key
     * @return {Promise<Number>}
     */
    del(key) {
        return this.client.del(key);
    }

    /* istanbul ignore next */
    /**
     * Removes the specified fields from the hash stored at key. Specified fields that do not exist within this hash are ignored.
     * If key does not exist, it is treated as an empty hash and this command returns 0.
     * @reference https://redis.io/commands/hdel
     * @param {String} hash
     * @param {String|String[]} field
     * @return {Promise<Number>} - the number of fields that were removed from the hash, not including specified but non existing fields.
     */
    hdel(hash, field) {
        return this.client.hdel(hash, field);
    }

    /* istanbul ignore next */
    /**
     * Delete all the keys of all the existing databases. This command never fails.
     * @reference https://redis.io/commands/flushall
     * @return {Promise}
     */
    flushAll() {
        return this.client.flushall();
    }

    /**
     * Increments the number stored at key by one.
     * If the key does not exist, it is set to 0 before performing the operation.
     * An error is returned if the key contains a value of the wrong type or contains a string that can not be represented as integer.
     * This operation is limited to 64 bit signed integers.
     * @reference https://redis.io/commands/incr
     * @param {String|String[]} key
     * @param {Number=} timeInSeconds
     * @return {Promise<Number>}
     */
    async incr(key, timeInSeconds) {
        if(timeInSeconds == null) {
            return this.client.incr(key);
        } else {
            const result = await this.client.multi()
            .incr(key)
            .expire(key, timeInSeconds)
            .exec();
            return result[0][1];
        }
    }

    /**
     * Decrements the number stored at key by one.
     * An error is returned if the key contains a value of the wrong type or contains a string that can not be represented as integer.
     * This operation is limited to 64 bit signed integers.
     * @reference https://redis.io/commands/incr
     * @param {String|String[]} key
     * @param {Number=} timeInSeconds
     * @return {Promise<Number>}
     */
    async decr(key, timeInSeconds) {
        if(timeInSeconds == null) {
            return this.client.decr(key);
        } else {
            const result = await this.client.multi()
            .decr(key)
            .expire(key, timeInSeconds)
            .exec();
            return result[0][1];
        }
    }

    /**
     * Set a timeout in seconds on key. After the timeout has expired, the key will automatically be deleted.
     * The timeout will only be cleared by commands that delete or overwrite the contents of the key, including DEL, SET, GETSET and all the *STORE commands.
     * All the operations that conceptually alter the value stored at the key without replacing it with a new one will leave the timeout untouched.
     * @param key
     * @param timeInSeconds
     * @return {Promise<*>}
     */
    async expire(key, timeInSeconds) {
        return this.client.expire(key, timeInSeconds);
    }

    /**
     * Set a timeout in milliseconds on key. After the timeout has expired, the key will automatically be deleted.
     * The timeout will only be cleared by commands that delete or overwrite the contents of the key, including DEL, SET, GETSET and all the *STORE commands.
     * All the operations that conceptually alter the value stored at the key without replacing it with a new one will leave the timeout untouched.
     * @param key
     * @param timeInMilliseconds
     * @return {Promise<*>}
     */
    async pexpire(key, timeInMilliseconds) {
        return this.client.pexpire(key, timeInMilliseconds);
    }

    /**
     * Increments the number stored at field in the hash stored at key by increment.
     * If key does not exist, a new key holding a hash is created. If field does not exist the value is set to 0 before the operation is performed.
     * The range of values supported by HINCRBY is limited to 64 bit signed integers.
     * @param {string} key
     * @param {string} field
     * @param {Integer} increment
     * @param {Number=} timeInSeconds
     * @return {Promise<*>}
     */
    async hincrby(key, field, increment, timeInSeconds) {
        if(timeInSeconds == null) {
            return this.client.hincrby(key, field, increment);
        } else {
            const result = await this.client.multi()
            .hincrby(key, field, increment)
            .expire(key, timeInSeconds)
            .exec();
            return result[0][1];
        }
    }
}

RedisClient.ExpiryMode = ExpiryMode;
RedisClient.SetMode = SetMode;

module.exports = RedisClient;
