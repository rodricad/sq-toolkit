'use strict';

let _ = require('lodash');
let seedrandom = require('seedrandom');

let Exception = require('./exception');
let Sanitizer = require('./sanitizer');

const ShufflerConst = require('./lib/constants/shuffler');

/**
 * @typedef {Object} Version
 * @property {Number} size
 */

class Shuffler {

    /**
     * @param {Object=}    opts
     * @param {String=}    opts.id
     * @param {Version[]=} opts.versions
     */
    constructor(opts) {
        this.id        = _.get(opts, 'id', null);
        this.versions  = Shuffler.createVersions(_.get(opts, 'versions', []));
        this.probs     = Shuffler.createProbs(this.versions);
        this.positions = Shuffler.createVersionPositions(this.versions);

        this.validateId();
    }

    validateId() {
        if (this.id != null && Shuffler.isValidShufflerId(this.id) === false) {
            throw new Exception(ShufflerConst.ErrorCode.ERROR_INVALID_ID, 'Shuffle id must be an Integer between [%s,%s]', ShufflerConst.ShufflerId.MIN, ShufflerConst.ShufflerId.MAX);
        }
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
            throw new Exception(ShufflerConst.ErrorCode.ERROR_REQUIRED_ID, 'Shuffle id is mandatory to use hash random');
        }
        if (this.versions.length === 0 || this.positions.length === 0) {
            return null;
        }

        let cumulativeProb = 0;
        let probability    = parseInt(hash.substring(hash.length - 2), 16) + this.id;
        probability        = (probability % 256) / 255;

        for (let groupIndex = 0; groupIndex < this.probs.length; groupIndex++) {
            cumulativeProb += this.probs[groupIndex];

            if (probability <= cumulativeProb) {
                return this.versions[groupIndex];
            }
        }
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
                    throw new Exception(ShufflerConst.ErrorCode.ERROR_OVERFLOW);
                }
            }
        }

        if (0 < positions.length && positions.length < 100) {
            throw new Exception(ShufflerConst.ErrorCode.ERROR_UNDERFLOW);
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
        return Sanitizer.isInteger(value) === true
            && value >= ShufflerConst.ShufflerId.MIN
            && value <= ShufflerConst.ShufflerId.MAX;
    }
}

Shuffler.ShufflerId = ShufflerConst.ShufflerId;
Shuffler.ErrorConst = ShufflerConst.ErrorCode;

module.exports = Shuffler;
