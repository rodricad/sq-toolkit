'use strict';

describe('PromiseNativeTool Test', function () {

    let chai = require('chai');
    let expect = chai.expect;

    let Promise = require('bluebird');

    let Exception = require('../exception');
    let PromiseNativeTool = require('../promise-native-tool');

    describe('1. eachLimit()', function () {

        it('1. Iterate over an array with a concurrency of 1. Expect to be executed in order', function () {

            let items       = [1, 5, 3, 4, 2];
            let concurrency = 1;
            let order       = [];

            function iterator(number) {
                var delay = number * 10;
                return Promise.delay(delay)
                .then(function () {
                    order.push(number);
                });
            }

            return PromiseNativeTool.eachLimit(items, concurrency, iterator)
            .then(function (response) {
                expect(response).to.equals(undefined);
                expect(order).to.eql([1, 5, 3, 4, 2]);
            });
        });

        it('2. Iterate over an array with a concurrency of 2. Expect to be not be executed in order', function () {

            let items       = [1, 5, 3, 4, 2];
            let concurrency = 2;
            let order       = [];

            function iterator(number) {
                let delay = number * 10;
                return Promise.delay(delay)
                .then(function () {
                    order.push(number);
                });
            }

            return PromiseNativeTool.eachLimit(items, concurrency, iterator)
            .then(function (response) {
                expect(response).to.equals(undefined);
                expect(order).to.eql([1, 3, 5, 2, 4]);
            });
        });

        it('3. Iterate over an array with a concurrency of 1 and raise an exception for 2nd item. Expect error to be raised', function () {

            let items       = [1, 5, 3, 4, 2];
            let concurrency = 1;
            let order       = [];

            function iterator(number) {
                let delay = number * 10;
                return Promise.delay(delay)
                .then(function () {
                    if (number === 5) {
                        throw new Exception('EXCEPTION_CODE');
                    }
                    order.push(number);
                });
            }

            return PromiseNativeTool.eachLimit(items, concurrency, iterator)
            .catch(function (err) {
                expect(err.code).to.equals('EXCEPTION_CODE');
                expect(order).to.eql([1]);
            });
        });

        it('4. Iterate over an array with a concurrency of 1 and raise an exception and reflect for 2nd item. ' +
            'Expect error to not be raised and value be missing in order array', function () {

            let items       = [1, 5, 3, 4, 2];
            let concurrency = 1;
            let order       = [];

            function iterator(number) {
                let delay = number * 10;

                let promise = Promise.delay(delay)
                .then(function () {
                    if (number === 5) {
                        throw new Exception('EXCEPTION_CODE');
                    }
                    order.push(number);
                });

                if (number === 5) {
                    return promise.reflect();
                }

                return promise;
            }

            return PromiseNativeTool.eachLimit(items, concurrency, iterator)
            .then(function (response) {
                expect(response).to.equals(undefined);
                expect(order).to.eql([1, 3, 4, 2]);
            });
        });
    });

    describe('2. eachCursor()', function () {

        class DummyCursor {

            constructor() {
                this.items = ['Table', 'Sofa', 'Bed'];
            }

            next() {
                let item = this.items.length > 0 ? this.items.shift() : null;
                return Promise.resolve(item);
            }
        }

        class ErrorCursor {

            constructor() {
                this.items = ['Table', 'Sofa', 'Bed'];
            }

            next() {
                if (this.items.length === 1) {
                    return Promise.reject(new Exception('EXCEPTION_CODE'));
                }

                let item = this.items.length > 0 ? this.items.shift() : null;
                return Promise.resolve(item);
            }
        }

        it('1. Iterate over a DummyCursor. Expect to be executed in order', function () {

            let cursor  = new DummyCursor();
            let order   = [];
            let indexes = [];

            return PromiseNativeTool.eachCursor(cursor, function (item, index) {
                order.push(item);
                indexes.push(index);
            })
            .then(function () {
                expect(order).to.eql(['Table', 'Sofa', 'Bed']);
                expect(indexes).to.eql([0, 1, 2]);
            });
        });

        it('2. Iterate over an ErrorCursor. Expect to be executed but an Exception thrown', function () {

            let cursor  = new ErrorCursor();
            let order   = [];
            let indexes = [];

            return PromiseNativeTool.eachCursor(cursor, function (item, index) {
                order.push(item);
                indexes.push(index);
            })
            .then(function () {
                chai.assert();
            })
            .catch(function (err) {
                expect(err.code).to.equals('EXCEPTION_CODE');
            });
        });
    });

    describe('3. doWhilst()', function () {

        it('1. Iterate over while tester function is true. Expect count to be 5 at the end', function () {

            let count    = 0;
            let countAux = 0;

            function iterator() {
                return Promise.resolve()
                .then(function () {

                    if (count === 5) {
                        count = null;
                    }
                    else {
                        count++;
                        countAux = count;
                    }

                    return count;
                });
            }

            function tester() {
                return count !== null;
            }

            return PromiseNativeTool.doWhilst(iterator, tester)
            .then(function () {
                expect(count).to.equals(null);
                expect(countAux).to.equals(5);
            });
        });

        it('2. Iterate over while tester function is true. Expect count to be 3 at the end', function () {

            let count = 0;

            function iterator() {
                return Promise.resolve()
                .then(function () {
                    count++;
                    return count;
                });
            }

            function tester() {
                return count < 3;
            }

            return PromiseNativeTool.doWhilst(iterator, tester)
            .then(function () {
                expect(count).to.equals(3);
            });
        });

        it('3. Iterate over while tester function is true. Expect to raise an Exception and catched correctly', function () {

            let count = 0;

            function iterator() {
                return Promise.resolve()
                .then(function() {
                    count++;
                    if (count === 4) {
                        throw new Exception('EXCEPTION_CODE');
                    }
                    return count;
                })
            }

            function tester() {
                return count < 5;
            }

            return PromiseNativeTool.doWhilst(iterator, tester)
            .then(function () {
                chai.assert();
            })
            .catch(function (err) {
                expect(count).to.equals(4);
                expect(err.code).to.equals('EXCEPTION_CODE');
            });
        });
    });
});
