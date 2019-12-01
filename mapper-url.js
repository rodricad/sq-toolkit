'use strict';

let _ = require('lodash');

class MapperURL {

    /**
     * @param {Object} shortByLongMapping
     */
    constructor(shortByLongMapping) {
        this.shortByLongMapping = _.cloneDeep(shortByLongMapping /* istanbul ignore next */ || {});
        this.longByShortMapping = _.invert(this.shortByLongMapping);
    }

    /**
     * @param {String} long
     * @return {String}
     */
    getShort(long) {
        let value = this.shortByLongMapping[long];
        return value == null ? long : value;
    }

    /**
     * @param {String} short
     * @return {String}
     */
    getLong(short) {
        let value = this.longByShortMapping[short];
        return value == null ? short : value;
    }

    /**
     * @param {Object} params
     * @return {Object}
     */
    map(params) {
        let mapped = {};

        for (let key in params) {
            /* istanbul ignore next */
            if (params.hasOwnProperty(key) === false) {
                continue;
            }
            mapped[this.getShort(key)] = params[key];
        }

        return mapped;
    }

    /**
     * @param {Object} params
     * @return {Object}
     */
    unmap(params) {
        let mapped = {};

        for (let key in params) {
            /* istanbul ignore next */
            if (params.hasOwnProperty(key) === false) {
                continue;
            }
            mapped[this.getLong(key)] = params[key];
        }

        return mapped;
    }
}

module.exports = MapperURL;
