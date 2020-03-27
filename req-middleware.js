'use strict';

const onHeaders = require('on-headers');

let totalReqs = 0;
let activeReqs = 0;

/* istanbul ignore next */
function reqMiddleware(req, res, next) {
    req.locals = req.locals != null ? req.locals : {};
    req.meta   = req.meta   != null ? req.meta   : {};

    // Based on:
    // https://stackoverflow.com/questions/19266329/node-js-get-clients-ip
    req.locals.ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress;
    req.locals.ua = req.headers['user-agent'];

    if(totalReqs === Number.MAX_SAFE_INTEGER){
        totalReqs = 0; // prevent overflow
    }
    activeReqs++;
    totalReqs++;
    req.locals.activeReqs = activeReqs;
    req.locals.totalReqs = totalReqs;

    onHeaders(res, function(){
        activeReqs -= 1;
    });

    next();
}

module.exports = reqMiddleware;
