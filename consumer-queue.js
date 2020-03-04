'use strict';

const Deque = require('double-ended-queue');

const PromiseTool = require('./promise-tool');

const MAX_ELEMENTS  = 10;
const MAX_CONSUMERS = 10;

class ConsumerQueue {

    /**
     *
     * @param {Object}      options
     * @param {String}      options.name
     * @param {Logger}      options.logger
     * @param {Number=}     options.maxElements
     * @param {Number=}     options.maxConsumers
     * @param {Function}    options.consumerProcess This is a promise based function
     */
    constructor(options) {
        this.name         = options.name;

        this.logger = options.logger;
        this.maxElements    = options.maxElements   || MAX_ELEMENTS;
        this.maxConsumers   = options.maxConsumers  || MAX_CONSUMERS;

        this.consumerProcess = options.consumerProcess;

        this.currentConsumerCount = 0;

        this.queue          = new Deque();
        this.outOfRangeQueue  = new Deque();

        this.finishedPromise = PromiseTool.createDeferred();
        this.hasProducerFinished = false;

    }

    /**
     * @param {Object} item
     * @return {Promise}
     */
    async add(item){

        // If there was a consumer available to process the item we have nothing more to do
        if(this.tryProcess(item) === true){
            return;
        }

        // If all consumers were busy and we have space in the queue, we push it
        if(this.queue.length < this.maxElements){
            this.queue.push(item);
            return;
        }

        // If we don't have space in the queue, we push it to the out of range queue. It will be pushed to the
        // consumer queue once we have space again
        let deferred = PromiseTool.createDeferred();
        deferred.then(() => this.queue.push(item));
        this.outOfRangeQueue.push(deferred);

        return deferred;
    }

    /**
     *
     * @param {Object} item
     * @returns {boolean}
     */
    tryProcess(item){
        // If consumers are full, do not process and enqueue it
        if(this.areConsumersFull() === true){
            return false;
        }

        // ATTENTION: Process is made async and it handles the errors itself
        this.process(item)
        .then(() => null);

        return true;
    }


    /**
     *
     * @param {Object} item
     */
    async process(item){
        try {
            // Set the consumer as busy
            this.currentConsumerCount++;

            try {
                // Make actual process for the item
                await this.consumerProcess(item);
            }
            catch(err) {
                this.logger.notify(`Consumer Queue | Consumer Process Item ${this.name} Error`).steps(0,100).msg('consumer-queue.js Error at consumer process. name:%s Error:', this.name, err);
            }
            finally {
                // Set the consumer as idle
                this.currentConsumerCount--;
            }

            // If we have an item that it wasn't queued because the queue was full, we queue it now we have space
            let outOfRageDeferred = this.outOfRangeQueue.shift();
            if(outOfRageDeferred)
                await outOfRageDeferred.forceResolve();


            // If no items are added any more to the queue and the queue is empty and there is no consumer working, we resolve
            this.resolveIfFinished();
            // TODO: VALIDATE THIS CONDITIONS
            // if(this.areConsumersFull() === true || this.isMainQueueEmpty() === true){
            //     return this.resolveIfFinished();
            // }

            // If we have items in the queue, we keep processing those recursively
            if (this.queue.length > 0) {
                let nextItem = this.queue.shift();
                // ATTENTION: Because of the recursive nature of this method, nextTick is used to break the stack
                process.nextTick(() => this.process(nextItem));
            }
        }
        catch (error) {
            // ATTENTION: This errors should be EXTREMELY weird. Some inconsistent error happened
            this.logger.notify(`Consumer Queue | Internal Process Item ${this.name} Error`).steps(0,100).msg('consumer-queue.js Error at internal process. name:%s Error:', this.name, error);
        }
    }

    /**
     *
     * @returns {boolean}
     */
    areConsumersFull(){
        return this.currentConsumerCount >= this.maxConsumers
    }

    /**
     *
     * @returns {boolean}
     */
    isMainQueueEmpty(){
        return this.queue.length === 0;
    }

    /**
     *
     * @returns {boolean}
     */
    isAnyConsumerRunning(){
        return this.currentConsumerCount !== 0;
    }


    hasFinished(){
        return this.isMainQueueEmpty() && this.hasProducerFinished === true && this.isAnyConsumerRunning() === false
    }

    resolveIfFinished(){
        if(this.hasFinished() === true)
            return this.finishedPromise.forceResolve();
    }

    producerFinished(){
        this.hasProducerFinished = true;
        this.resolveIfFinished();
    }

    async holdOn(){
        return this.finishedPromise;
    }

}


module.exports = ConsumerQueue;