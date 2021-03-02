'use strict';

let fs = require('fs-extra');

const CRAWLER_USER_AGENTS_FILEPATH = require.resolve('crawler-user-agents');
const CRAWLER_USER_AGENTS_EXTRA = ['freshpingBot\\/1.\\d', 'lnspingbot\\/2(.\\d+)+ ', 'UptimeRobot\\/2.0'];

let _instance = null;

class WhiteHatBotService {

    constructor() {
        this.regex        = null;
        this.pingdomRegex = /pingdom/i;
    }

    /**
     * @return {Promise}
     */
    init() {
        return fs.readJson(CRAWLER_USER_AGENTS_FILEPATH)
        .then(crawlers => {
            let patterns = [...CRAWLER_USER_AGENTS_EXTRA, ...crawlers.map(item => item.pattern)];
            this.regex   = new RegExp('(' + patterns.join('|') + ')', 'i');
        });
    }

    /**
     * @param {String} ua
     * @return {Boolean}
     */
    validate(ua) {
        return this.regex.test(ua);
    }

    /**
     * @param {String} ua
     * @return {Boolean}
     */
    isPingdom(ua) {
        return this.pingdomRegex.test(ua);
    }

    /**
     * @return {WhiteHatBotService}
     */
    static getInstance() {
        if (_instance == null) {
            _instance = new WhiteHatBotService();
        }
        return _instance;
    }
}

module.exports = WhiteHatBotService;
