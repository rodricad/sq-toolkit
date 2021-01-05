'use strict';

const ShufflerConst = {
    ShufflerId: {
        MIN: 1,
        MAX: 100000
    },
    ErrorCode: {
        ERROR_INVALID_ID: 'ERROR_SHUFFLER_INVALID_ID',
        ERROR_INVALID_STRING_ID: 'ERROR_SHUFFLER_INVALID_STRING_ID',
        ERROR_REQUIRED_ID: 'ERROR_SHUFFLER_REQUIRED_ID',
        ERROR_OVERFLOW: 'ERROR_SHUFFLER_OVERFLOW',
        ERROR_UNDERFLOW: 'ERROR_SHUFFLER_UNDERFLOW',
    },
    Type: {
        LOW_DENSITY: 'LOW_DENSITY',
        HIGH_DENSITY: 'HIGH_DENSITY'
    }
};

module.exports = ShufflerConst;
