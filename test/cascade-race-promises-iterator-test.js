'use strict';

describe('Cascade Race Promises Iterator Test', () => {

    const expect = require('chai').expect;
    const CascadeRacePromisesIterator = require('../cascade-race-promises-iterator');

    it('1. Resolving 3 promises which resolves in inverted order. Expect that next() resolves the correct promise in sequence', async () => {
        await verifyResolve([3, 2, 1]);
    });

    it('2. Resolving 3 promises which resolves in same order. Expect that next() resolves the correct promise in sequence', async () => {
        await verifyResolve([1, 2, 3]);
    });

    it('3. Resolving 3 promises which resolves in mix order. Expect that next() resolves the correct promise in sequence', async () => {
        await verifyResolve([2, 1, 3]);
    });

    it('4. When promises is empty. Expect that next() resolves as undefined', async () => {
        const cascadeRacePromisesIterator = new CascadeRacePromisesIterator([]);
        const value = await cascadeRacePromisesIterator.next();
        expect(value).to.be.undefined;
    });

    it('5. When promises are completely resolved. Expect that next() resolves as undefined', async () => {
        const cascadeRacePromisesIterator = await verifyResolve([1]);
        const value = await cascadeRacePromisesIterator.next();
        expect(value).to.be.undefined;
    });

    async function verifyResolve(arrayOfMS) {
        const promises = arrayOfMS.map( (ms, index) => createPromise(index, ms) );

        const cascadeRacePromisesIterator = new CascadeRacePromisesIterator(promises);

        for (let i=0; i < arrayOfMS.length; i++) {
            const value = await cascadeRacePromisesIterator.next();
            expect(value, `Promise index ${i}`).eq(i);
        }

        return cascadeRacePromisesIterator;
    }

    function createPromise(value, ms) {
        return new Promise(resolve => setTimeout(() => {
            resolve(value);
        }, ms));
    }
});