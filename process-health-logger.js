const Duration = require('./duration');

class ProcessHealthLogger {

    /**
     * @param options
     * @param {String} options.name
     * @param {Number=30} options.interval Run interval in seconds
     * @param {WinstonLogger} options.logger
     */
    constructor(options) {
        this.name = options.name;
        this.interval = options.interval || 30;
        this.logger = options.logger;
        this._intervalId = null;
    }

    start() {
        let intervalInMs = this.interval * 1000;
        let duration = Duration.start();

        let processHealthBound = this.processHealth.bind(this, this.name, duration);

        processHealthBound();
        this._intervalId = setInterval(processHealthBound, intervalInMs);
    }

    stop() {
        if(this._intervalId != null) {
            clearInterval(this._intervalId);
        }
    }

    /**
     * @param {String} name
     * @param {Duration} duration
     */
    processHealth(name, duration) {
        const memoryUsage = process.memoryUsage();

        let rss       = this.getMegabytes(memoryUsage.rss);
        let external  = this.getMegabytes(memoryUsage.external);
        let heapTotal = this.getMegabytes(memoryUsage.heapTotal);
        let heapUsed  = this.getMegabytes(memoryUsage.heapUsed);

        let heapUsedPercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal * 100).toFixed(2);

        this.logger.info('process-health.js process:%s rss:%s mb external:%s mb heapUsed:%s mb heapTotal:%s mb (%s%) uptime:%s min', name, rss, external, heapUsed, heapTotal, heapUsedPercentage, (duration.end() / (1000.0 * 60)).toFixed(1) );
    }

    /**
     * @param {Number} value
     * @returns {String}
     */
    getMegabytes(value) {
        return (value / 1024 / 1024).toFixed(2);
    }
}

module.exports = ProcessHealthLogger;