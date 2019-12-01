'use strict';

class DummyNotifier {

    constructor() {
        this.values = {
            key: null,
            start: null,
            each: null,
            msg: null
        };
    }

    notify(value) {
        this.values.key = value;
        return this;
    }

    start(value) {
        this.values.start = value;
        return this;
    }

    each(value) {
        this.values.each = value;
        return this;
    }

    steps(start, each) {
        this.values.start = start;
        this.values.each  = each;
        return this;
    }

    msg(value) {
        this.values.msg = value;
        return this;
    }
}

class DummyLogger {

    constructor() {
        this.notifier = new DummyNotifier();
    }

    info() {

    }

    notify(key) {
        this.notifier.notify(key);
        return this.notifier;
    }
}

module.exports = DummyLogger;
