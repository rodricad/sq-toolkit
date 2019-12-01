'use strict';

const SanitizerConst = {
    ErrorCode: {
        ERROR_SANITIZER: 'ERROR_SANITIZER'
    },

    Interval: {
        OPEN_OPEN: '()',
        OPEN_CLOSED: '(]',
        CLOSED_OPEN: '[)',
        CLOSED_CLOSED: '[]'
    }
};

module.exports = SanitizerConst;
