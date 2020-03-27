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

    describe('4. map()', function () {

        it('1. Iterate over array, expect elements to be processed in order (while respecting concurrency)', async () => {
            let array = [1,4,2,6,1];
            let outputArray = [];

            async function iterator(element, index) {
                await PromiseNativeTool.delay(element*50);
                outputArray.push(element);
                return element;
            }

            let result = await PromiseNativeTool.map(array, iterator, {concurrency: 2});

            expect(result).to.eql(array);
            expect(outputArray).to.eql([1,2,4,1,6]);
        });

        it('2. Iterate over array, expect elements to be processed in order (while respecting concurrency)', async () => {
            let array = [1,4,2,6,1];
            let outputArray = [];

            async function iterator(element, index) {
                await PromiseNativeTool.delay(element*50);
                outputArray.push(element);
                return element;
            }

            let result = await PromiseNativeTool.map(array, iterator, {concurrency: 10});

            expect(result).to.eql(array);
            expect(outputArray).to.eql([1,1,2,4,6]);
        });

        it('3. Iterate over object properties, expect elements to be processed in order (while respecting concurrency)', async () => {
            let data = {a:1,b:4,c:1,d:6,e:1};
            let outputArray = [];

            async function iterator(value, key) {
                await PromiseNativeTool.delay(value*50);
                outputArray.push(value);
                return [value, key];
            }

            let result = await PromiseNativeTool.map(data, iterator, {concurrency: 1});

            expect(result).to.eql([
                [ 1, "a" ],
                [ 4, "b" ],
                [ 1, "c" ],
                [ 6, "d" ],
                [ 1, "e" ]
            ]);
            expect(outputArray).to.eql([1,4,1,6,1]);
        });

        it('4. Iterate over array, if one element fails processing stops and promise is rejected.', async () => {
            let array = [1,4,1,6,1];
            let outputArray = [];

            async function iterator(element, index) {
                if(element === 6) {
                    throw new Error('TEST ERROR');
                }
                await PromiseNativeTool.delay(element*50);
                outputArray.push(element);
                return element;
            }

            try {
                await PromiseNativeTool.map(array, iterator, {concurrency: 2});
                expect.fail('should not reach here');
            } catch (err) {
                expect(err.message).to.eql('TEST ERROR');
                expect(outputArray).to.eql([1,1]);
            }
        });

        it('5. Passing concurrency < 2 should reject promise immediately', async () => {
            let array = [1,4,1,6,1];
            let outputArray = [];

            async function iterator(element, index) {
                if(element === 6) {
                    throw new Error('TEST ERROR');
                }
                await PromiseNativeTool.delay(element*50);
                outputArray.push(element);
                return element;
            }

            try {
                await PromiseNativeTool.map(array, iterator, {concurrency: 0});
                expect.fail('should not reach here');
            } catch (err) {
                expect(err.message).to.eql('Concurrency must be >= 1');
                expect(outputArray).to.eql([]);
            }
        });
    });
});
