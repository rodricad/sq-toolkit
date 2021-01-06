'use strict';

describe.only('DynamoDB Client Test', function () {

    const chai = require('chai');
    const expect = chai.expect;
    const sinon = require('sinon');

    const DynamoDbClient = require('../dynamo-db-client');

    /**
     * @param {Object=} opts
     * @return {Object}
     * @private
     */
    function _getOptions(opts = {}) {
        return {
            accessKeyId: "dummyAccessKeyId",
            secretAccessKey:"dummySecretAccessKey",
            region: "us-east-1",
            endpoint: "https://dynamodb.us-east-1.amazonaws.com",
            ...opts
        };
    }

    describe('1. Test .put()', () => {
        /**
         * @type {DynamoDbClient|null}
         */
        let client = null;

        before(async () => {
            const opts = _getOptions();
            client = new DynamoDbClient(opts);
        });

        beforeEach(() => {
            sinon.restore();
        });

        after(() => {
            sinon.restore();
        });

        it('1. Call .put() with only table and item. Expect to call internal dynamoDb put with proper params', () => {
            const putStub = _getPutStub(client);

            client.put('table', { some: 'random test item' });

            sinon.assert.calledOnce(putStub);
            sinon.assert.calledWith(putStub, {
                TableName: "table",
                Item: { some: "random test item" }
            });
        });

        function _getPutStub(client) {
            return sinon.stub(client.docClient, 'put').returns({
                promise: async () => null
            });
        }
    });

    describe('2. Test .get()', () => {

    });

    describe('3. Test .update()', () => {

    });

    describe('4. Test .delete()', () => {

    });

    describe('5. Test .query()', () => {

    });

    describe('6. Test .scan()', () => {

    });

});
