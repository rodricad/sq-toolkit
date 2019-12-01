'use strict';

let UAParserJS = require('ua-parser-js');

const Device = {
    DESKTOP: 'desktop',
    MOBILE: 'mobile',
    TABLET: 'tablet',
    OTHER: 'other',
    UNKNOWN: 'unknown'
};

const OTHER_DEVICES = new Set(['console', 'smarttv', 'wearable', 'embedded']);

let _parser = new UAParserJS();

class UAParser {

    /**
     * @param {String} ua
     * @return {String}
     */
    static getDevice(ua) {

        let device = _parser.setUA(ua).getDevice().type;

        if (device == null) {
            return Device.DESKTOP;
        }
        else if (device === Device.MOBILE || device === Device.TABLET) {
            return device;
        }
        else if (OTHER_DEVICES.has(device) === true) {
            return Device.OTHER;
        }
        else {
            return Device.UNKNOWN;
        }
    }
}

UAParser.Device = Device;

module.exports = UAParser;
