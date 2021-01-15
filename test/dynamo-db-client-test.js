'use strict';

describe('DynamoDB Client Test', function () {

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

        let client = null;

        before(async () => {
            const opts = _getOptions();
            client = new DynamoDbClient(opts);
        });

        it('1.1. Call .put() with only table and item. Expect to call internal dynamoDb put with proper params', async () => {
            const putStub = _getPutStub(client);

            await client.put('table', { some: 'random test item' });

            sinon.assert.calledOnce(putStub);
            sinon.assert.calledWith(putStub, {
                TableName: "table",
                Item: { some: "random test item" },
                ConditionExpression: undefined,
                ConditionalOperator: undefined,
                Expected: undefined,
                ExpressionAttributeNames: undefined,
                ExpressionAttributeValues: undefined,
                ReturnConsumedCapacity: undefined,
                ReturnItemCollectionMetrics: undefined,
                ReturnValues: undefined
            });
            putStub.restore();
        });

        it('1.2. Call .put() with all supported params. Expect to call internal dynamoDb put with proper params', async () => {
            const putStub = _getPutStub(client, {
                returnValue: {
                    Attributes: { testAttribute: true },
                    ConsumedCapacity: { ReadCapacityUnits: 3.14 },
                    ItemCollectionMetrics: { ItemCollectionKey: 'testItemCollectionKey' }
                }
            });

            let result = await client.put('table', { some: 'random test item' }, {
                conditionExpression: '#a1=:a1',
                conditionalOperator: 'OR',
                expected: {
                    testAttribute: {
                        Exists: true
                    }
                },
                expressionAttributeNames: {
                    '#a1': 'attribute_1'
                },
                expressionAttributeValues: {
                    ':a1': true
                },
                returnConsumedCapacity: 'TOTAL',
                returnItemCollectionMetrics: 'SIZE',
                returnValues: 'ALL_NEW'
            });

            expect(result).to.eql({
                attributes: { testAttribute: true },
                consumedCapacity: { ReadCapacityUnits: 3.14 },
                itemCollectionMetrics: { ItemCollectionKey: 'testItemCollectionKey' }
            });
            sinon.assert.calledOnce(putStub);
            sinon.assert.calledWith(putStub, {
                ConditionExpression: "#a1=:a1",
                ConditionalOperator: "OR",
                Expected: { testAttribute: { Exists: true } },
                ExpressionAttributeNames: { '#a1': "attribute_1" },
                ExpressionAttributeValues: { ':a1': true },
                Item: { some: "random test item" },
                ReturnConsumedCapacity: "TOTAL",
                ReturnItemCollectionMetrics: "SIZE",
                ReturnValues: "ALL_NEW",
                TableName: "table"
            });
            putStub.restore();
        });

        it('1.3. Should raise error when calling internal .put()', async () => {
            const putStub = _getPutStub(client, {error: new Error('TEST_ERROR')});

            try {
                await client.put('table', { some: 'random test item' });
                expect.fail('should not reach here');
            } catch (e) {
                expect(e.message).to.eql('TEST_ERROR');
                sinon.assert.calledOnce(putStub);
                sinon.assert.calledWith(putStub, {
                    TableName: "table",
                    Item: { some: "random test item" },
                    ConditionExpression: undefined,
                    ConditionalOperator: undefined,
                    Expected: undefined,
                    ExpressionAttributeNames: undefined,
                    ExpressionAttributeValues: undefined,
                    ReturnConsumedCapacity: undefined,
                    ReturnItemCollectionMetrics: undefined,
                    ReturnValues: undefined
                });
            }
            putStub.restore();
        });

        function _getPutStub(client, options={}) {
            if(options.error == null) {
                return sinon.stub(client.docClient, 'put').returns({
                    promise: async () => {
                        return options.returnValue || {};
                    }
                });
            } else {
                return sinon.stub(client.docClient, 'put').returns({
                    promise: async () => {
                        throw options.error;
                    }
                });
            }
        }
    });

    describe('2. Test .get()', () => {
        let client = null;

        before(async () => {
            const opts = _getOptions();
            client = new DynamoDbClient(opts);
        });

        it('2.1. Call .get() with only table and key. Expect to call internal dynamoDb get with proper params', async () => {
            const testItem = {
                id: 'testId',
                param1: true,
                param2: false
            };
            const getStub = _getGetStub(client, {
                returnValue: {
                    Item: testItem
                }
            });

            let result = await client.get('table', { id: testItem.id });

            expect(result).to.eql({
                item: testItem,
                consumedCapacity: undefined
            });
            sinon.assert.calledOnce(getStub);
            sinon.assert.calledWith(getStub, {
                TableName: "table",
                Key: { id: "testId" },
                AttributesToGet: undefined,
                ConsistentRead: undefined,
                ExpressionAttributeNames: undefined,
                ProjectionExpression: undefined,
                ReturnConsumedCapacity: undefined
            });
            getStub.restore();
        });

        it('2.2. Call .get() with all supported params. Expect to call internal dynamoDb get with proper params', async () => {
            const testItem = {
                id: 'testId',
                param1: true,
                param2: false
            };
            const getStub = _getGetStub(client, {
                returnValue: {
                    Item: testItem,
                    ConsumedCapacity: { ReadCapacityUnits: 3.14 }
                }
            });

            let result = await client.get('table', { id: testItem.id }, {
                attributesToGet: ['param1', 'param2'],
                consistentRead: true,
                projectionExpression: 'testProjectionExpression',
                expressionAttributeNames: { '#p1': 'param1' },
                returnConsumedCapacity: 'TOTAL'
            });

            expect(result).to.eql({
                item: testItem,
                consumedCapacity: { ReadCapacityUnits: 3.14 }
            });
            sinon.assert.calledOnce(getStub);
            sinon.assert.calledWith(getStub, {
                TableName: "table",
                Key: { id: "testId" },
                AttributesToGet: ["param1", "param2"],
                ConsistentRead: true,
                ExpressionAttributeNames: { '#p1': "param1" },
                ProjectionExpression: "testProjectionExpression",
                ReturnConsumedCapacity: "TOTAL"
            });
            getStub.restore();
        });

        it('2.3. Should raise error when calling internal .get()', async () => {
            const getStub = _getGetStub(client, {error: new Error('TEST_ERROR')});

            try {
                await client.get('table', { id: 'testId' });
                expect.fail('should not reach here');
            } catch (e) {
                expect(e.message).to.eql('TEST_ERROR');
                sinon.assert.calledOnce(getStub);
                sinon.assert.calledWith(getStub, {
                    TableName: "table",
                    Key: { id: "testId" },
                    AttributesToGet: undefined,
                    ConsistentRead: undefined,
                    ExpressionAttributeNames: undefined,
                    ProjectionExpression: undefined,
                    ReturnConsumedCapacity: undefined
                });
            }
            getStub.restore();
        });

        function _getGetStub(client, options={}) {
            if(options.error == null) {
                return sinon.stub(client.docClient, 'get').returns({
                    promise: async () => {
                        return options.returnValue || {};
                    }
                });
            } else {
                return sinon.stub(client.docClient, 'get').returns({
                    promise: async () => {
                        throw options.error;
                    }
                });
            }
        }
    });

    describe('3. Test .update()', () => {
        let client = null;

        before(async () => {
            const opts = _getOptions();
            client = new DynamoDbClient(opts);
        });

        it('3.1. Call .update() with only table and key. Expect to call internal dynamoDb get with proper params', async () => {
            const updateStub = _getUpdateStub(client);

            let result = await client.update('table', { id: 'testId' }, {
                updateExpression: 'set #p1=:p1',
                expressionAttributeValues: {
                    ':p1': 'test value'
                },
                expressionAttributeNames: {
                    '#p1': 'param1'
                }
            });

            expect(result).to.eql({
                attributes: undefined,
                consumedCapacity: undefined,
                itemCollectionMetrics: undefined
            });
            sinon.assert.calledOnce(updateStub);
            sinon.assert.calledWith(updateStub, {
                TableName: "table",
                Key: { id: "testId" },
                UpdateExpression: "set #p1=:p1",
                ExpressionAttributeNames: { '#p1': "param1" },
                ExpressionAttributeValues: { ':p1': "test value" },
                AttributeUpdates: undefined,
                ConditionExpression: undefined,
                ConditionalOperator: undefined,
                Expected: undefined,
                ReturnConsumedCapacity: undefined,
                ReturnItemCollectionMetrics: undefined,
                ReturnValues: undefined
            });
            updateStub.restore();
        });

        it('3.2. Call .update() with all supported params. Expect to call internal dynamoDb update with proper params', async () => {
            const updateStub = _getUpdateStub(client, {
                returnValue: {
                    Attributes: {testAttribute: true},
                    ConsumedCapacity: {ReadCapacityUnits: 3.14},
                    ItemCollectionMetrics: {ItemCollectionKey: 'testItemCollectionKey'}
                }
            });

            let result = await client.update('table', { id: 'testId' }, {
                attributeUpdates: {
                    testAttribute: {
                        Value: true
                    }
                },
                updateExpression: 'set #p1=:p1',
                conditionExpression: '#a1=:a1',
                conditionalOperator: 'OR',
                expected: {
                    testAttribute: {
                        Exists: true
                    }
                },
                expressionAttributeNames: {
                    '#a1': 'attribute_1'
                },
                expressionAttributeValues: {
                    ':a1': true
                },
                returnConsumedCapacity: 'TOTAL',
                returnItemCollectionMetrics: 'SIZE',
                returnValues: 'ALL_NEW'
            });

            expect(result).to.eql({
                attributes: {testAttribute: true},
                consumedCapacity: {ReadCapacityUnits: 3.14},
                itemCollectionMetrics: {ItemCollectionKey: 'testItemCollectionKey'}
            });
            sinon.assert.calledOnce(updateStub);
            sinon.assert.calledWith(updateStub, {
                AttributeUpdates: { testAttribute: { Value: true } },
                ConditionExpression: "#a1=:a1",
                ConditionalOperator: "OR",
                Expected: { testAttribute: { Exists: true } },
                ExpressionAttributeNames: { '#a1': "attribute_1" },
                ExpressionAttributeValues: { ':a1': true },
                Key: { id: "testId" },
                ReturnConsumedCapacity: "TOTAL",
                ReturnItemCollectionMetrics: "SIZE",
                ReturnValues: "ALL_NEW",
                TableName: "table",
                UpdateExpression: "set #p1=:p1"
            });
            updateStub.restore();
        });

        it('3.3. Should raise error when calling internal .update()', async () => {
            const updateStub = _getUpdateStub(client, {error: new Error('TEST_ERROR')});

            try {
                await client.update('table', { id: 'testId' });
                expect.fail('should not reach here');
            } catch (e) {
                expect(e.message).to.eql('TEST_ERROR');
                sinon.assert.calledOnce(updateStub);
                sinon.assert.calledWith(updateStub, {
                    TableName: "table",
                    Key: { id: "testId" },
                    UpdateExpression: undefined,
                    ExpressionAttributeNames: undefined,
                    ExpressionAttributeValues: undefined,
                    AttributeUpdates: undefined,
                    ConditionExpression: undefined,
                    ConditionalOperator: undefined,
                    Expected: undefined,
                    ReturnConsumedCapacity: undefined,
                    ReturnItemCollectionMetrics: undefined,
                    ReturnValues: undefined
                });
            }
            updateStub.restore();
        });

        function _getUpdateStub(client, options={}) {
            if(options.error == null) {
                return sinon.stub(client.docClient, 'update').returns({
                    promise: async () => {
                        return options.returnValue || {};
                    }
                });
            } else {
                return sinon.stub(client.docClient, 'update').returns({
                    promise: async () => {
                        throw options.error;
                    }
                });
            }
        }
    });

    describe('4. Test .delete()', () => {
        let client = null;

        before(async () => {
            const opts = _getOptions();
            client = new DynamoDbClient(opts);
        });

        it('4.1. Call .delete() with only table and key. Expect to call internal dynamoDb delete with proper params', async () => {
            const deleteStub = _getDeleteStub(client);

            await client.delete('table', { id: 'testId' });

            sinon.assert.calledOnce(deleteStub);
            sinon.assert.calledWith(deleteStub, {
                TableName: "table",
                Key: { id: "testId" },
                ConditionExpression: undefined,
                ConditionalOperator: undefined,
                Expected: undefined,
                ExpressionAttributeNames: undefined,
                ExpressionAttributeValues: undefined,
                ReturnConsumedCapacity: undefined,
                ReturnItemCollectionMetrics: undefined,
                ReturnValues: undefined
            });
            deleteStub.restore();
        });

        it('4.2. Call .delete() with all supported params. Expect to call internal dynamoDb delete with proper params', async () => {
            const deleteStub = _getDeleteStub(client, {
                returnValue: {
                    Attributes: {testAttribute: true},
                    ConsumedCapacity: {ReadCapacityUnits: 3.14},
                    ItemCollectionMetrics: {ItemCollectionKey: 'testItemCollectionKey'}
                }
            });

            let result = await client.delete('table', { id: 'testId' }, {
                conditionExpression: '#a1=:a1',
                conditionalOperator: 'OR',
                expected: {
                    testAttribute: {
                        Exists: true
                    }
                },
                expressionAttributeNames: {
                    '#a1': 'attribute_1'
                },
                expressionAttributeValues: {
                    ':a1': true
                },
                returnConsumedCapacity: 'TOTAL',
                returnItemCollectionMetrics: 'SIZE',
                returnValues: 'ALL_NEW'
            });

            expect(result).to.eql({
                attributes: {testAttribute: true},
                consumedCapacity: {ReadCapacityUnits: 3.14},
                itemCollectionMetrics: {ItemCollectionKey: 'testItemCollectionKey'}
            });
            sinon.assert.calledOnce(deleteStub);
            sinon.assert.calledWith(deleteStub, {
                ConditionExpression: "#a1=:a1",
                ConditionalOperator: "OR",
                Expected: { testAttribute: { Exists: true } },
                ExpressionAttributeNames: { '#a1': "attribute_1" },
                ExpressionAttributeValues: { ':a1': true },
                Key: { id: "testId" },
                ReturnConsumedCapacity: "TOTAL",
                ReturnItemCollectionMetrics: "SIZE",
                ReturnValues: "ALL_NEW",
                TableName: "table"
            });
            deleteStub.restore();
        });

        it('4.3. Should raise error when calling internal .delete()', async () => {
            const deleteStub = _getDeleteStub(client, {error: new Error('TEST_ERROR')});

            try {
                await client.delete('table', { id: 'testId' });
                expect.fail('should not reach here');
            } catch (e) {
                expect(e.message).to.eql('TEST_ERROR');
                sinon.assert.calledOnce(deleteStub);
                sinon.assert.calledWith(deleteStub, {
                    TableName: "table",
                    Key: { id: "testId" },
                    ConditionExpression: undefined,
                    ConditionalOperator: undefined,
                    Expected: undefined,
                    ExpressionAttributeNames: undefined,
                    ExpressionAttributeValues: undefined,
                    ReturnConsumedCapacity: undefined,
                    ReturnItemCollectionMetrics: undefined,
                    ReturnValues: undefined
                });
            }
            deleteStub.restore();
        });

        function _getDeleteStub(client, options={}) {
            if(options.error == null) {
                return sinon.stub(client.docClient, 'delete').returns({
                    promise: async () => {
                        return options.returnValue || {};
                    }
                });
            } else {
                return sinon.stub(client.docClient, 'delete').returns({
                    promise: async () => {
                        throw options.error;
                    }
                });
            }
        }
    });

    describe('5. Test .query()', () => {
        let client = null;

        before(async () => {
            const opts = _getOptions();
            client = new DynamoDbClient(opts);
        });

        it('5.1. Call .query() with only table and key. Expect to call internal dynamoDb query with proper params', async () => {
            const queryStub = _getQueryStub(client, {
                returnValue: {
                    Items: [{item: 1}, {item: 2}, {item: 3}],
                    Count: 3,
                    ScannedCount: 3,
                    ConsumedCapacity: {
                        ReadCapacityUnits: 1
                    }
                }
            });

            let result = await client.query('table', {
                indexName: 'Index',
                keyConditionExpression: 'HashKey = :hkey and RangeKey > :rkey',
                expressionAttributeValues: {
                    ':hkey': 'key',
                    ':rkey': 2015
                }
            });

            expect(result).to.eql({
                items: [{item: 1}, {item: 2}, {item: 3}],
                additionalResultsData: [{
                    consumedCapacity: {
                        ReadCapacityUnits: 1
                    },
                    count: 3,
                    scannedCount: 3
                }]
            });
            sinon.assert.calledOnce(queryStub);
            sinon.assert.calledWith(queryStub, {
                TableName: "table",
                IndexName: "Index",
                KeyConditionExpression: "HashKey = :hkey and RangeKey > :rkey",
                ExpressionAttributeValues: { ':hkey': "key", ':rkey': 2015 },
                AttributesToGet: undefined,
                ConditionalOperator: undefined,
                ConsistentRead: undefined,
                ExclusiveStartKey: undefined,
                ExpressionAttributeNames: undefined,
                FilterExpression: undefined,
                KeyConditions: undefined,
                Limit: undefined,
                ProjectionExpression: undefined,
                QueryFilter: undefined,
                ReturnConsumedCapacity: undefined,
                ScanIndexForward: undefined,
                Select: undefined
            });
            queryStub.restore();
        });

        it('5.2. Call .query() with all supported params. Expect to call internal dynamoDb query with proper params', async () => {
            const queryStub = _getQueryStub(client, {
                returnValue: {
                    Items: [{item: 1}, {item: 2}, {item: 3}],
                    Count: 3,
                    ScannedCount: 3,
                    ConsumedCapacity: {
                        ReadCapacityUnits: 1
                    }
                }
            });

            let result = await client.query('table', {
                indexName: 'Index',
                keyConditionExpression: '#hkey = :hkey and #rkey > :rkey',
                expressionAttributeValues: {
                    ':hkey': 'key',
                    ':rkey': 2015,
                    ':p1': 20
                },
                attributesToGet: ["param1", "param2"],
                consistentRead: true,
                expressionAttributeNames: {
                    '#hkey': 'HashKey',
                    '#rkey': 'RangeKey'
                },
                projectionExpression: "testProjectionExpression",
                returnConsumedCapacity: 'TOTAL',
                filterExpression: 'param1 > :p1',
                keyConditions: {
                    testAttribute: {
                        Exists: true
                    }
                },
                limit: 1000,
                queryFilter: {
                    testAttribute: {
                        ComparisonOperator: 'NOT_NULL'
                    }
                },
                scanIndexForward: true,
                select: 'ALL_ATTRIBUTES'
            });

            expect(result).to.eql({
                items: [{item: 1}, {item: 2}, {item: 3}],
                additionalResultsData: [{
                    consumedCapacity: {
                        ReadCapacityUnits: 1
                    },
                    count: 3,
                    scannedCount: 3
                }]
            });
            sinon.assert.calledOnce(queryStub);
            sinon.assert.calledWith(queryStub, {
                AttributesToGet: ["param1", "param2"],
                ConditionalOperator: undefined,
                ConsistentRead: true,
                ExclusiveStartKey: undefined,
                ExpressionAttributeNames: { '#hkey': "HashKey", '#rkey': "RangeKey" },
                ExpressionAttributeValues: { ':hkey': "key", ':p1': 20, ':rkey': 2015 },
                FilterExpression: "param1 > :p1",
                IndexName: "Index",
                KeyConditionExpression: "#hkey = :hkey and #rkey > :rkey",
                KeyConditions: { testAttribute: { Exists: true } },
                Limit: 1000,
                ProjectionExpression: "testProjectionExpression",
                QueryFilter: { testAttribute: { ComparisonOperator: "NOT_NULL" } },
                ReturnConsumedCapacity: "TOTAL",
                ScanIndexForward: true,
                Select: "ALL_ATTRIBUTES",
                TableName: "table"
            });
            queryStub.restore();
        });

        it('5.3. Call .query() multiple times when LastEvaluatedKey param is returned', async () => {
            const returnValue = {
                Items: [{id: 4}, {id: 5}, {id: 6}],
                Count: 3,
                ScannedCount: 6,
                ConsumedCapacity: {
                    ReadCapacityUnits: 1
                }
            };
            const queryStub = _getQueryStub(client, { returnValue });
            queryStub.onFirstCall().returns({
                promise: async () => {
                    return {
                        Items: [{id: 1}, {id: 2}, {id: 3}],
                        Count: 3,
                        ScannedCount: 6,
                        ConsumedCapacity: {
                            ReadCapacityUnits: 1
                        },
                        LastEvaluatedKey: {id: 3}
                    };
                }
            });

            let result = await client.query('table', {
                keyConditionExpression: 'id < :i',
                expressionAttributeValues: { ':i': 7 }
            });

            expect(result).to.eql({
                items: [{id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}, {id: 6}],
                additionalResultsData: [
                    {
                        consumedCapacity: {
                            ReadCapacityUnits: 1
                        },
                        count: 3,
                        scannedCount: 6
                    },
                    {
                        consumedCapacity: {
                            ReadCapacityUnits: 1
                        },
                        count: 3,
                        scannedCount: 6
                    }
                ]
            });
            sinon.assert.calledTwice(queryStub);
            sinon.assert.calledWith(queryStub.secondCall, {
                TableName: "table",
                KeyConditionExpression: "id < :i",
                ExpressionAttributeValues: { ':i': 7 },
                ExclusiveStartKey: { id: 3 },
                AttributesToGet: undefined,
                ConditionalOperator: undefined,
                ConsistentRead: undefined,
                ExpressionAttributeNames: undefined,
                FilterExpression: undefined,
                IndexName: undefined,
                KeyConditions: undefined,
                Limit: undefined,
                ProjectionExpression: undefined,
                QueryFilter: undefined,
                ReturnConsumedCapacity: undefined,
                ScanIndexForward: undefined,
                Select: undefined
            });
            queryStub.restore();
        });

        it('5.4. Should raise error when calling internal .query()', async () => {
            const queryStub = _getQueryStub(client, {error: new Error('TEST_ERROR')});

            try {
                await client.query('table');
                expect.fail('should not reach here');
            } catch (e) {
                expect(e.message).to.eql('TEST_ERROR');
                sinon.assert.calledOnce(queryStub);
                sinon.assert.calledWith(queryStub, {
                    TableName: "table",
                    IndexName: undefined,
                    KeyConditionExpression: undefined,
                    ExpressionAttributeValues: undefined,
                    AttributesToGet: undefined,
                    ConditionalOperator: undefined,
                    ConsistentRead: undefined,
                    ExclusiveStartKey: undefined,
                    ExpressionAttributeNames: undefined,
                    FilterExpression: undefined,
                    KeyConditions: undefined,
                    Limit: undefined,
                    ProjectionExpression: undefined,
                    QueryFilter: undefined,
                    ReturnConsumedCapacity: undefined,
                    ScanIndexForward: undefined,
                    Select: undefined
                });
            }
            queryStub.restore();
        });

        it('5.5. Call .query() only once when doNotIterate param is passed', async () => {
            const returnValue = {
                Items: [{id: 1}, {id: 2}, {id: 3}],
                Count: 3,
                ScannedCount: 6,
                ConsumedCapacity: {
                    ReadCapacityUnits: 1
                },
                LastEvaluatedKey: {id: 3}
            };
            const queryStub = _getQueryStub(client, { returnValue });

            let result = await client.query('table', {
                keyConditionExpression: 'id < :i',
                expressionAttributeValues: { ':i': 7 },
                doNotIterate: true
            });

            expect(result).to.eql({
                items: [{id: 1}, {id: 2}, {id: 3}],
                lastEvaluatedKey: {id: 3},
                additionalResultsData: [
                    {
                        consumedCapacity: {
                            ReadCapacityUnits: 1
                        },
                        count: 3,
                        scannedCount: 6
                    }
                ]
            });
            sinon.assert.calledOnce(queryStub);
            sinon.assert.calledWith(queryStub.firstCall, {
                TableName: "table",
                KeyConditionExpression: "id < :i",
                ExpressionAttributeValues: { ':i': 7 },
                ExclusiveStartKey: undefined,
                AttributesToGet: undefined,
                ConditionalOperator: undefined,
                ConsistentRead: undefined,
                ExpressionAttributeNames: undefined,
                FilterExpression: undefined,
                IndexName: undefined,
                KeyConditions: undefined,
                Limit: undefined,
                ProjectionExpression: undefined,
                QueryFilter: undefined,
                ReturnConsumedCapacity: undefined,
                ScanIndexForward: undefined,
                Select: undefined
            });
            queryStub.restore();
        });

        function _getQueryStub(client, options={}) {
            if(options.error == null) {
                return sinon.stub(client.docClient, 'query').returns({
                    promise: async () => {
                        return options.returnValue || {};
                    }
                });
            } else {
                return sinon.stub(client.docClient, 'query').returns({
                    promise: async () => {
                        throw options.error;
                    }
                });
            }
        }
    });

    describe('6. Test .scan()', () => {
        let client = null;

        before(async () => {
            const opts = _getOptions();
            client = new DynamoDbClient(opts);
        });

        it('6.1. Call .scan() with only table and key. Expect to call internal dynamoDb scan with proper params', async () => {
            const scanStub = _getScanStub(client, {
                returnValue: {
                    Items: [{item: 1}, {item: 2}, {item: 3}],
                    Count: 3,
                    ScannedCount: 3,
                    ConsumedCapacity: {
                        ReadCapacityUnits: 1
                    }
                }
            });

            let result = await client.scan('table');

            expect(result).to.eql({
                items: [{item: 1}, {item: 2}, {item: 3}],
                additionalResultsData: [{
                    consumedCapacity: {
                        ReadCapacityUnits: 1
                    },
                    count: 3,
                    scannedCount: 3
                }]
            });
            sinon.assert.calledOnce(scanStub);
            sinon.assert.calledWith(scanStub, {
                TableName: "table",
                AttributesToGet: undefined,
                ConditionalOperator: undefined,
                ConsistentRead: undefined,
                ExclusiveStartKey: undefined,
                ExpressionAttributeNames: undefined,
                ExpressionAttributeValues: undefined,
                FilterExpression: undefined,
                IndexName: undefined,
                Limit: undefined,
                ProjectionExpression: undefined,
                ReturnConsumedCapacity: undefined,
                ScanFilter: undefined,
                Segment: undefined,
                Select: undefined,
                TotalSegments: undefined
            });
            scanStub.restore();
        });

        it('6.2. Call .scan() with all supported params. Expect to call internal dynamoDb scan with proper params', async () => {
            const scanStub = _getScanStub(client, {
                returnValue: {
                    Items: [{item: 1}, {item: 2}, {item: 3}],
                    Count: 3,
                    ScannedCount: 3,
                    ConsumedCapacity: {
                        ReadCapacityUnits: 1
                    }
                }
            });

            let result = await client.scan('table', {
                indexName: 'Index',
                attributesToGet: ["param1", "param2"],
                limit: 1000,
                select: 'ALL_ATTRIBUTES',
                scanFilter: {
                    testAttribute: {
                        ComparisonOperator: 'NOT_NULL'
                    }
                },
                conditionalOperator: 'AND',
                returnConsumedCapacity: 'TOTAL',
                totalSegments: 100,
                segment: 10,
                projectionExpression: "testProjectionExpression",
                filterExpression: 'param1 > :p1',
                expressionAttributeValues: {
                    ':hkey': 'key',
                    ':rkey': 2015,
                    ':p1': 20
                },
                expressionAttributeNames: {
                    '#hkey': 'HashKey',
                    '#rkey': 'RangeKey'
                },
                consistentRead: true
            });

            expect(result).to.eql({
                items: [{item: 1}, {item: 2}, {item: 3}],
                additionalResultsData: [{
                    consumedCapacity: {
                        ReadCapacityUnits: 1
                    },
                    count: 3,
                    scannedCount: 3
                }]
            });
            sinon.assert.calledOnce(scanStub);
            sinon.assert.calledWith(scanStub, {
                AttributesToGet: ["param1", "param2"],
                ConditionalOperator: "AND",
                ConsistentRead: true,
                ExclusiveStartKey: undefined,
                ExpressionAttributeNames: { '#hkey': "HashKey", '#rkey': "RangeKey" },
                ExpressionAttributeValues: { ':hkey': "key", ':p1': 20, ':rkey': 2015 },
                FilterExpression: "param1 > :p1",
                IndexName: "Index",
                Limit: 1000,
                ProjectionExpression: "testProjectionExpression",
                ReturnConsumedCapacity: "TOTAL",
                ScanFilter: { testAttribute: { ComparisonOperator: "NOT_NULL" } },
                Segment: 10,
                Select: "ALL_ATTRIBUTES",
                TableName: "table",
                TotalSegments: 100
            });
            scanStub.restore();
        });

        it('6.3. Call .scan() multiple times when LastEvaluatedKey param is returned', async () => {
            const returnValue = {
                Items: [{id: 4}, {id: 5}, {id: 6}],
                Count: 3,
                ScannedCount: 6,
                ConsumedCapacity: {
                    ReadCapacityUnits: 1
                }
            };
            const scanStub = _getScanStub(client, { returnValue });
            scanStub.onFirstCall().returns({
                promise: async () => {
                    return {
                        Items: [{id: 1}, {id: 2}, {id: 3}],
                        Count: 3,
                        ScannedCount: 6,
                        ConsumedCapacity: {
                            ReadCapacityUnits: 1
                        },
                        LastEvaluatedKey: {id: 3}
                    };
                }
            });

            let result = await client.scan('table');

            expect(result).to.eql({
                items: [{id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}, {id: 6}],
                additionalResultsData: [
                    {
                        consumedCapacity: {
                            ReadCapacityUnits: 1
                        },
                        count: 3,
                        scannedCount: 6
                    },
                    {
                        consumedCapacity: {
                            ReadCapacityUnits: 1
                        },
                        count: 3,
                        scannedCount: 6
                    }
                ]
            });
            sinon.assert.calledTwice(scanStub);
            sinon.assert.calledWith(scanStub.secondCall, {
                TableName: "table",
                ExclusiveStartKey: { id: 3 },
                AttributesToGet: undefined,
                ConditionalOperator: undefined,
                ConsistentRead: undefined,
                ExpressionAttributeNames: undefined,
                ExpressionAttributeValues: undefined,
                FilterExpression: undefined,
                IndexName: undefined,
                Limit: undefined,
                ProjectionExpression: undefined,
                ReturnConsumedCapacity: undefined,
                ScanFilter: undefined,
                Segment: undefined,
                Select: undefined,
                TotalSegments: undefined
            });
            scanStub.restore();
        });

        it('6.4. Should raise error when calling internal .scan()', async () => {
            const scanStub = _getScanStub(client, {error: new Error('TEST_ERROR')});

            try {
                await client.scan('table');
                expect.fail('should not reach here');
            } catch (e) {
                expect(e.message).to.eql('TEST_ERROR');
                sinon.assert.calledOnce(scanStub);
                sinon.assert.calledWith(scanStub, {
                    TableName: "table",
                    AttributesToGet: undefined,
                    ConditionalOperator: undefined,
                    ConsistentRead: undefined,
                    ExclusiveStartKey: undefined,
                    ExpressionAttributeNames: undefined,
                    ExpressionAttributeValues: undefined,
                    FilterExpression: undefined,
                    IndexName: undefined,
                    Limit: undefined,
                    ProjectionExpression: undefined,
                    ReturnConsumedCapacity: undefined,
                    ScanFilter: undefined,
                    Segment: undefined,
                    Select: undefined,
                    TotalSegments: undefined
                });
            }
            scanStub.restore();
        });

        it('6.5. Call .scan() only once if doNotIterate=true', async () => {
            const returnValue = {
                Items: [{id: 1}, {id: 2}, {id: 3}],
                Count: 3,
                ScannedCount: 6,
                ConsumedCapacity: {
                    ReadCapacityUnits: 1
                },
                LastEvaluatedKey: {id: 3}
            };
            const scanStub = _getScanStub(client, { returnValue });

            let result = await client.scan('table', {doNotIterate: true});

            expect(result).to.eql({
                items: [{id: 1}, {id: 2}, {id: 3}],
                lastEvaluatedKey: {id: 3},
                additionalResultsData: [
                    {
                        consumedCapacity: {
                            ReadCapacityUnits: 1
                        },
                        count: 3,
                        scannedCount: 6
                    }
                ]
            });
            sinon.assert.calledOnce(scanStub);
            sinon.assert.calledWith(scanStub, {
                TableName: "table",
                ExclusiveStartKey: undefined,
                AttributesToGet: undefined,
                ConditionalOperator: undefined,
                ConsistentRead: undefined,
                ExpressionAttributeNames: undefined,
                ExpressionAttributeValues: undefined,
                FilterExpression: undefined,
                IndexName: undefined,
                Limit: undefined,
                ProjectionExpression: undefined,
                ReturnConsumedCapacity: undefined,
                ScanFilter: undefined,
                Segment: undefined,
                Select: undefined,
                TotalSegments: undefined
            });
            scanStub.restore();
        });

        function _getScanStub(client, options={}) {
            if(options.error == null) {
                return sinon.stub(client.docClient, 'scan').returns({
                    promise: async () => {
                        return options.returnValue || {};
                    }
                });
            } else {
                return sinon.stub(client.docClient, 'scan').returns({
                    promise: async () => {
                        throw options.error;
                    }
                });
            }
        }
    });

});
