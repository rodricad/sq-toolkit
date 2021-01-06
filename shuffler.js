'use strict';

let _ = require('lodash');
let seedrandom = require('seedrandom');
let crypto = require('crypto');

let Exception = require('./exception');
let Sanitizer = require('./sanitizer');

const { ShufflerId, ErrorCode, Type } = require('./lib/constants/shuffler');

const LOW_DENSITY_CHARS = 2;
const HIGH_DENSITY_CHARS = 4;

const LOW_DENSITY_LIMIT = 256;
const HIGH_DENSITY_LIMIT = 65536;

/**
 * @typedef {Object} Version
 * @property {Number} size
 */

class Shuffler {

    static ShufflerId = ShufflerId;
    static ErrorConst = ErrorCode;
    static ErrorCode = ErrorCode;
    static Type = Type;

    /**
     * @param {Object=}    opts
     * @param {Number=}    opts.id
     * @param {String=}    opts.stringId
     * @param {Version[]=} opts.versions
     * @param {String=}    opts.type
     */
    constructor(opts) {
        this.id        = _.get(opts, 'id', null);
        this.stringId  = _.get(opts, 'stringId', null);
        this.versions  = Shuffler.createVersions(_.get(opts, 'versions', []));
        this.probs     = Shuffler.createProbs(this.versions);
        this.positions = Shuffler.createVersionPositions(this.versions);
        this.type      = _.get(opts, 'type', Type.LOW_DENSITY);

        this.validateId();
    }

    validateId() {
        if (this.id != null && Shuffler.isValidShufflerId(this.id) === false) {
            throw new Exception(ErrorCode.ERROR_INVALID_ID, 'Shuffle id must be an Integer between [%s,%s]', ShufflerId.MIN, ShufflerId.MAX);
        }
        if (this.id == null && this.stringId != null) {
            if (Shuffler.isValidShufflerStringId(this.stringId) === false) {
                throw new Exception(ErrorCode.ERROR_INVALID_STRING_ID, 'Shuffle string id must be non empty string');
            }
            this.id = this.generateId(this.stringId);
        }
    }

    /**
     * @param {String} stringId
     * @return {Number}
     */
    generateId(stringId) {
        const hash = crypto.createHash('md5').update(stringId).digest('hex');
        const chars = this.type === Type.HIGH_DENSITY ? HIGH_DENSITY_CHARS : LOW_DENSITY_CHARS;
        return Shuffler.getLastHashBytes(hash, chars);
    }

    /**
     * @param {String=} seed
     * @return {Version|null}
     */
    random(seed) {
        if (this.versions.length === 0 || this.positions.length === 0) {
            return null;
        }
        let randomIndex  = Shuffler.getRandomIntFromInterval(0, this.positions.length - 1, seed);
        let versionIndex = this.positions[randomIndex];
        return this.versions[versionIndex];
    }

    /**
     * Version without using filter
     * @param {Number} count
     * @returns {Version[]}
     */
    randomWithoutReplacement(count) {
        if (this.versions.length === 0 || this.positions.length === 0) {
            return [];
        }

        if (this.versions.length <= count) {
            return this.versions;
        }

        const versions = [];
        let positions = this.positions;

        for (let i = 0, lastIndex = count-1; i < count; i++) {
            const randomIndex  = Shuffler.getRandomIntFromInterval(0, positions.length - 1);
            const versionIndex = positions[randomIndex];
            const version = this.versions[versionIndex];
            versions.push(version);
            // Filter the version index to exclude in following searches.
            // The last loop makes no sense to exclude anything.
            if ( i < lastIndex ) {
                const filteredPositions = new Array(positions.length - version.size);
                let j = 0;
                for (const versionIndexAtPosition of positions) {
                    if ( versionIndexAtPosition !== versionIndex ) {
                        filteredPositions[j++] = versionIndexAtPosition;
                    }
                }
                positions = filteredPositions;
            }
        }

        return versions;
    }

    /**
     * @param {String} hash
     * @return {Version|null}
     */
    randomByMD5(hash) {
        if (this.id == null) {
            throw new Exception(ErrorCode.ERROR_REQUIRED_ID, 'Shuffle id is mandatory to use hash random');
        }
        if (this.versions.length === 0 || this.positions.length === 0) {
            return null;
        }

        let cumulativeProb = 0;
        const probability = this.getProbability(hash);

        for (let groupIndex = 0; groupIndex < this.probs.length; groupIndex++) {
            cumulativeProb += this.probs[groupIndex];

            if (probability <= cumulativeProb) {
                return this.versions[groupIndex];
            }
        }
    }

    /**
     * @param {String} hash
     * @return {Number}
     */
    getProbability(hash) {
        return this.type === Type.HIGH_DENSITY ? this.getProbabilityForHighDensity(hash) : this.getProbabilityForLowDensity(hash);
    }

    /**
     * @param {String} hash
     * @return {Number}
     */
    getProbabilityForLowDensity(hash) {
        const value = Shuffler.getLastHashBytes(hash, LOW_DENSITY_CHARS) + this.id;
        return (value % LOW_DENSITY_LIMIT) / (LOW_DENSITY_LIMIT - 1);
    }


    /**
     * @param {String} hash
     * @return {Number}
     */
    getProbabilityForHighDensity(hash) {
        const value = Shuffler.getLastHashBytes(hash, HIGH_DENSITY_CHARS) ^ this.id;
        return (value % HIGH_DENSITY_LIMIT) / (HIGH_DENSITY_LIMIT - 1);
    }

    /**
     * @param {String} hash
     * @param {Number} chars
     * @return {Number}
     */
    static getLastHashBytes(hash, chars) {
        return parseInt(hash.substring(hash.length - chars), 16);
    }

    /**
     * @param {Version[]} versions
     * @return {Version[]}
     */
    static createVersions(versions) {
        return _.orderBy(versions, 'size', 'desc');
    }

    /**
     * @param {Version[]} versions
     * @return {Number[]}
     */
    static createProbs(versions) {
        return versions.map(item => item.size / 100);
    }

    /**
     * @param {Version[]} versions
     * @return {Number[]}
     */
    static createVersionPositions(versions) {
        let positions = [];

        for (let i = 0; i < versions.length; i++) {
            let size = versions[i].size;

            for (let j = 0; j < size; j++) {
                positions.push(i);

                if (positions.length > 100) {
                    throw new Exception(ErrorCode.ERROR_OVERFLOW);
                }
            }
        }

        if (0 < positions.length && positions.length < 100) {
            throw new Exception(ErrorCode.ERROR_UNDERFLOW);
        }

        return positions;
    }

    /**
     * Code from:
     * https://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
     *
     * @param {Number} min
     * @param {Number} max
     * @param {String=} seed
     * @returns {Number}
     */
    static getRandomIntFromInterval(min, max, seed) {
        let random = seed == null ? Shuffler.getRandom() : Shuffler.getRandomBySeed(seed);
        return Math.floor(random * (max - min + 1) + min);
    }

    /**
     * @return {Number}
     */
    static getRandom() {
        return Math.random();
    }

    /**
     * @return {Number}
     */
    static getRandomBySeed(seed) {
        return seedrandom(seed)();
    }

    /**
     * @param value
     * @return {Boolean}
     */
    static isValidShufflerId(value) {
        return Sanitizer.isNullOrEmpty(value) === false
            && Sanitizer.isInteger(value) === true
            && value >= ShufflerId.MIN
            && value <= ShufflerId.MAX;
    }

    /**
     * @param value
     * @return {Boolean}
     */
    static isValidShufflerStringId(value) {
        return Sanitizer.isString(value) === true
            && Sanitizer.isNullOrEmptyTrimmed(value) === false;
    }
}

module.exports = Shuffler;
