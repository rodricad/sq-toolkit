'use strict';

describe('Duration Test', function () {

    let tk     = require('timekeeper');
    let chai   = require('chai');
    let expect = chai.expect;

    let Duration = require('../duration');

    beforeEach(function () {
        tk.reset();
    });

    afterEach(function () {
        tk.reset();
    });

    it('1. Duration start and end. Expect to return duration in milliseconds', function () {

        var start = new Date('2020-01-01T08:00:00Z');
        var end   = new Date('2020-01-01T08:01:00Z');

        tk.freeze(start);

        var duration = Duration.start();

        tk.freeze(end);

        expect(duration.end()).to.equals(1000 * 60);

        tk.reset();
    });
});
