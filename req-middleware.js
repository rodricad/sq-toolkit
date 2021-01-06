'use strict';

const net = require('net');
const onHeaders = require('on-headers');
const onFinished = require('on-finished');

let totalReqs = 0;
let activeReqs = 0;
let writingReqs = 0;

/**
 * @reference https://stackoverflow.com/questions/19266329/node-js-get-clients-ip
 * @param req
 * @private
 */
function _getIP(req) {
    let xForwardedForIps = req.headers['x-forwarded-for'] || null;

    if (xForwardedForIps == null) {
        return req.connection.remoteAddress;
    }

    xForwardedForIps = xForwardedForIps.split(',');

    for (let i = 0; i < xForwardedForIps.length; i++) {
        const str = xForwardedForIps[i].trim();
        const isIP = net.isIP(str);

        if (isIP === 4 || isIP === 6) {
            return str;
        }
    }

    return req.connection.remoteAddress;
}

/* istanbul ignore next */
function reqMiddleware(req, res, next) {
    req.locals = req.locals != null ? req.locals : {};
    req.meta   = req.meta   != null ? req.meta   : {};

    req.locals.ip = _getIP(req);
    req.locals.ua = req.headers['user-agent'];

    if (totalReqs === Number.MAX_SAFE_INTEGER) {
        totalReqs = 0; // prevent overflow
    }

    activeReqs++;
    totalReqs++;

    req.locals.counter = {
        total: totalReqs,
        active: activeReqs,
        writing: writingReqs
    };

    onHeaders(res, () => {
        writingReqs++;
    });

    onFinished(res, () => {
        writingReqs--;
        activeReqs--;
    });

    next();
}

reqMiddleware._getIP = _getIP;

module.exports = reqMiddleware;
