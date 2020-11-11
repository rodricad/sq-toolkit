'use strict';

class CascadeRacePromisesIterator {

    /**
     * @param {Promise[]} promiseArray
     */
    constructor(promiseArray) {
        this.promises = promiseArray.map( (promise, index) => {
            return promise.then( value => {
                return { value, index, resolved: false };
            });
        });

        this._nextIndexToResolve = 0;
        this._resolvedValues = new Array(promiseArray.length);
    }

    /**
     * @return {Promise<*>}
     */
    async next() {
        const resolvedValue = this._resolvedValues[this._nextIndexToResolve];
        if ( resolvedValue != null ) {
            this._nextIndexToResolve++;
            return resolvedValue;
        }
        const pendingPromises = this.getPendingPromises();
        if (pendingPromises.length === 0) {
            return;
        }
        return Promise.race(pendingPromises)
        .then( ({ value, index }) => {
            this._resolvedValues[index] = value;
            this.promises[index].resolved = true;
            if (this._nextIndexToResolve === index) {
                this._nextIndexToResolve++;
                return value;
            }
            return this.next();
        })
    }

    /**
     * @return {Promise[]}
     */
    getPendingPromises() {
        return this.promises.filter( ({ resolved }) => resolved !== true );
    }
}

module.exports = CascadeRacePromisesIterator;