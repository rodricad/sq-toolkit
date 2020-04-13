const Duration = require('./duration');

class ProcessHealthLogger {

    /**
     * @param options
     * @param options.logger
     * @param {String} options.processLabel
     * @param {Number=30} options.interval Run interval in seconds
     */
    constructor(options) {
        this.processLabel = options.processLabel;
        this.interval = options.interval || 30;
        this.logger = options.logger;
    }

    start() {
        let intervalInMs = this.interval * 1000;
        let duration = Duration.start();

        let processHealthBound = this.processHealth.bind(this, this.processLabel, duration);

        processHealthBound();
        return setInterval(processHealthBound, intervalInMs);
    }

    /**
     * @param {String} processLabel
     * @param {Duration} duration
     */
    processHealth(processLabel, duration) {
        const memoryUsage = process.memoryUsage();

        let rss       = this.getMegabytes(memoryUsage.rss);
        let external  = this.getMegabytes(memoryUsage.external);
        let heapTotal = this.getMegabytes(memoryUsage.heapTotal);
        let heapUsed  = this.getMegabytes(memoryUsage.heapUsed);

        let heapUsedPerc = (memoryUsage.heapUsed / memoryUsage.heapTotal * 100).toFixed(2);

        this.logger.info('process-health.js process:%s rss:%s mb external:%s mb heapUsed:%s mb heapTotal:%s mb (%s%) uptime:%s min', processLabel, rss, external, heapUsed, heapTotal, heapUsedPerc, (duration.end() / (1000.0 * 60)).toFixed(1) );
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