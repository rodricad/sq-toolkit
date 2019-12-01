'use strict';

class Duration {

    constructor() {
        this.ts = new Date();
    }

    /**
     * @return {Number}
     */
    end() {
        return new Date() - this.ts;
    }

    /**
     * @return {Duration}
     */
    static start() {
        return new Duration();
    }
}

module.exports = Duration;
