'use strict';

const LRU = require('lru-cache');
const CACHE_SIZE = 10000;
const UAParserJS = require('ua-parser-js');

const Device = {
    DESKTOP: 'desktop',
    MOBILE: 'mobile',
    TABLET: 'tablet',
    OTHER: 'other',
    UNKNOWN: 'unknown'
};
const OTHER_DEVICES = new Set(['console', 'smarttv', 'wearable', 'embedded']);
const MOBILE_DEVICES = new Set(['mobile', 'tablet', 'wearable']);

let _parser = new UAParserJS();
let cache = new LRU(CACHE_SIZE);

class UAParser {

    /**
     * @param {String} ua
     * @return {String}
     */
    static getDevice(ua) {
        let device = _parser.setUA(ua).getDevice().type;
        return UAParser._normalizeDeviceType(device);
    }

    /**
     * @param {String} ua
     * @param {Boolean=} ignoreCache
     */
    static getData(ua, ignoreCache = false) {
        let data = ignoreCache ? null : cache.get(ua);
        if(data != null) {
            return Object.assign({}, data);
        }
        let deviceData = _parser.setUA(ua).getResult();
        let deviceType = this._normalizeDeviceType(deviceData.device.type);
        data = {
            deviceType: deviceType,
            deviceModel: deviceData.device.model || null,
            isMobile: deviceType !== Device.UNKNOWN ? MOBILE_DEVICES.has(deviceData.device.type) : null,
            browserName: deviceData.browser.name || null,
            browserVersion: deviceData.browser.version || null
        };
        if(!ignoreCache) {
            cache.set(ua, Object.assign({}, data));
        }
        return data;
    }

    static _normalizeDeviceType(type) {
        if (type == null) {
            return Device.DESKTOP;
        }
        else if (type === Device.MOBILE || type === Device.TABLET) {
            return type;
        }
        else if (OTHER_DEVICES.has(type) === true) {
            return Device.OTHER;
        }
        else {
            return Device.UNKNOWN;
        }
    }

    static _clearCacheForTest() {
        cache.reset();
    }

    static _getParserForTest() {
        return _parser;
    }
}

UAParser.Device = Device;

module.exports = UAParser;
