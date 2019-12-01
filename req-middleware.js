'use strict';

/* istanbul ignore next */
function reqMiddleware(req, res, next) {

    req.locals = req.locals != null ? req.locals : {};
    req.meta   = req.meta   != null ? req.meta   : {};

    // Based on:
    // https://stackoverflow.com/questions/19266329/node-js-get-clients-ip
    req.locals.ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress;
    req.locals.ua = req.headers['user-agent'];

    next();
}

module.exports = reqMiddleware;
