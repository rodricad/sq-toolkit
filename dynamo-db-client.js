'use strict';

const AWS = require('aws-sdk');

class DynamoDbClient {

    constructor(config) {
        const dynamoDbClient = new AWS.DynamoDB(config);
        this.docClient = new AWS.DynamoDB.DocumentClient({ service: dynamoDbClient });
    }

    /**
     * Creates a new item, or replaces an old item with a new item.
     * For info on each param please refer to the docs: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GettingStarted.NodeJs.03.html
     * @param {string} table
     * @param {object} item
     * @param {object} [options]
     * @param {string} [options.conditionExpression]
     * @param {string} [options.conditionalOperator]
     * @param {object} [options.expected]
     * @param {object} [options.expressionAttributeNames]
     * @param {object} [options.expressionAttributeValues]
     * @param {string} [options.returnConsumedCapacity]
     * @param {string} [options.returnItemCollectionMetrics]
     * @param {string} [options.returnValues]
     * @return {Promise<{itemCollectionMetrics: *, attributes: *, consumedCapacity: *}>}
     */
    async put(table, item, options={}) {
        const putObject = {
            Item: Object.assign({}, item),
            TableName: table,
            ConditionExpression: options.conditionExpression,
            ConditionalOperator: options.conditionalOperator,
            Expected: options.expected,
            ExpressionAttributeNames: options.expressionAttributeNames,
            ExpressionAttributeValues: options.expressionAttributeValues,
            ReturnConsumedCapacity: options.returnConsumedCapacity,
            ReturnItemCollectionMetrics: options.returnItemCollectionMetrics,
            ReturnValues: options.returnValues
        };

        let result = await this.docClient.put(putObject).promise();
        return {
            attributes: result.Attributes,
            itemCollectionMetrics: result.ItemCollectionMetrics,
            consumedCapacity: result.ConsumedCapacity
        };
    }

    /**
     * Returns a set of attributes for the item with the given primary key.
     * For info on each param please refer to the docs: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GettingStarted.NodeJs.03.html
     * @param {string} table
     * @param {object} key
     * @param {object} [options]
     * @param {array<string>} [options.attributesToGet]
     * @param {boolean} [options.consistentRead]
     * @param {string} [options.projectionExpression]
     * @param {object} [options.expressionAttributeNames]
     * @param {string} [options.returnConsumedCapacity]
     * @return {Promise<{item: *, consumedCapacity: *}>}
     */
    async get(table, key, options={}) {
        const getObject = {
            Key: key,
            TableName: table,
            AttributesToGet: options.attributesToGet,
            ConsistentRead: options.consistentRead,
            ProjectionExpression: options.projectionExpression,
            ExpressionAttributeNames: options.expressionAttributeNames,
            ReturnConsumedCapacity: options.returnConsumedCapacity
        };
        let result = await this.docClient.get(getObject).promise();
        return {
            item: result.Item,
            consumedCapacity: result.ConsumedCapacity
        };
    }

    /**
     * docs: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GettingStarted.NodeJs.03.html
     * @param {string} table
     * @param {string} key
     * @param {object} [options]
     * @param {object} [options.attributeUpdates]
     * @param {string} [options.conditionExpression]
     * @param {string} [options.conditionalOperator]
     * @param {object} [options.expected]
     * @param {object} [options.expressionAttributeNames]
     * @param {object} [options.expressionAttributeValues]
     * @param {string} [options.returnConsumedCapacity]
     * @param {string} [options.returnItemCollectionMetrics]
     * @param {string} [options.returnValues]
     * @param {string} [options.updateExpression]
     * @return {Promise<{itemCollectionMetrics: *, attributes: *, consumedCapacity: *}>}
     */
    async update(table, key, options={}) {
        const updateObject = {
            Key: key,
            TableName: table,
            AttributeUpdates: options.attributeUpdates,
            ConditionExpression: options.conditionExpression,
            ConditionalOperator: options.conditionalOperator,
            Expected: options.expected,
            ExpressionAttributeNames: options.expressionAttributeNames,
            ExpressionAttributeValues: options.expressionAttributeValues,
            ReturnConsumedCapacity: options.returnConsumedCapacity,
            ReturnItemCollectionMetrics: options.returnItemCollectionMetrics,
            ReturnValues: options.returnValues,
            UpdateExpression: options.updateExpression
        };

        let result = await this.docClient.update(updateObject).promise();
        return {
            itemCollectionMetrics: result.ItemCollectionMetrics,
            attributes: result.Attributes,
            consumedCapacity: result.ConsumedCapacity
        };
    }

    /**
     * Deletes a single item in a table by primary key
     * For info on each param please refer to the docs: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GettingStarted.NodeJs.03.html
     * @param {string} table
     * @param {string} key
     * @param {object} [options]
     * @param {string} [options.conditionExpression]
     * @param {string} [options.conditionalOperator]
     * @param {object} [options.expected]
     * @param {object} [options.expressionAttributeNames]
     * @param {object} [options.expressionAttributeValues]
     * @param {string} [options.returnConsumedCapacity]
     * @param {string} [options.returnItemCollectionMetrics]
     * @param {string} [options.returnValues]
     * @return {Promise<{itemCollectionMetrics: *, attributes: *, consumedCapacity: *}>}
     */
    async delete(table, key, options={}) {
        const deleteObject = {
            Key: key,
            TableName: table,
            ConditionExpression: options.conditionExpression,
            ConditionalOperator: options.conditionalOperator,
            Expected: options.expected,
            ExpressionAttributeNames: options.expressionAttributeNames,
            ExpressionAttributeValues: options.expressionAttributeValues,
            ReturnConsumedCapacity: options.returnConsumedCapacity,
            ReturnItemCollectionMetrics: options.returnItemCollectionMetrics,
            ReturnValues: options.returnValues
        };

        let result = await this.docClient.delete(deleteObject).promise();
        return {
            attributes: result.Attributes,
            consumedCapacity: result.ConsumedCapacity,
            itemCollectionMetrics: result.ItemCollectionMetrics
        };
    }

    /**
     * Directly access items from a table by primary key or a secondary index.
     * For info on each param please refer to the docs: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GettingStarted.NodeJs.03.html
     * @param {string} table
     * @param {object} [options]
     * @param {array<string>} [options.attributesToGet]
     * @param {string} [options.conditionalOperator]
     * @param {boolean} [options.consistentRead]
     * @param {object} [options.exclusiveStartKey] - Used for results pagination. If iterating manually, lastEvaluatedKey param should be passed here
     * @param {object} [options.expressionAttributeNames]
     * @param {object} [options.expressionAttributeValues]
     * @param {string} [options.filterExpression]
     * @param {string} [options.indexName]
     * @param {string} [options.keyConditionExpression]
     * @param {object} [options.keyConditions]
     * @param {integer} [options.limit]
     * @param {string} [options.projectionExpression]
     * @param {object} [options.queryFilter]
     * @param {string} [options.returnConsumedCapacity]
     * @param {boolean} [options.scanIndexForward]
     * @param {string} [options.select]
     * @param {boolean} [options.doNotIterate=false] - prevents client from iterating when more items are available. Will return lastEvaluatedKey param if more items are present to allow manual pagination
     * @return {Promise<{items: array, additionalResultsData: array, lastEvaluatedKey: object}>} - If lastEvaluatedKey is present (will only be present if doNotIterate=true), it should be passed as exclusiveStartKey on the next request to fetch the next set of items.
     */
    async query(table, options={}) {
        const queryOptions = {
            TableName: table,
            AttributesToGet: options.attributesToGet,
            ConditionalOperator: options.conditionalOperator,
            ConsistentRead: options.consistentRead,
            ExclusiveStartKey: options.exclusiveStartKey,
            ExpressionAttributeNames: options.expressionAttributeNames,
            ExpressionAttributeValues: options.expressionAttributeValues,
            FilterExpression: options.filterExpression,
            IndexName: options.indexName,
            KeyConditionExpression: options.keyConditionExpression,
            KeyConditions: options.keyConditions,
            Limit: options.limit,
            ProjectionExpression: options.projectionExpression,
            QueryFilter: options.queryFilter,
            ReturnConsumedCapacity: options.returnConsumedCapacity,
            ScanIndexForward: options.scanIndexForward,
            Select: options.select
        };
        return runIterableMethod(this.docClient.query, queryOptions, options.doNotIterate);
    }

    /**
     * Returns one or more items and item attributes by accessing every item in a table or a secondary index.
     * For info on each param please refer to the docs: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GettingStarted.NodeJs.03.html
     * @param table
     * @param [options]
     * @param {array<string>} [options.attributesToGet]
     * @param {string} [options.conditionalOperator]
     * @param {boolean} [options.consistentRead]
     * @param {object} [options.exclusiveStartKey] - Used for results pagination. If iterating manually, lastEvaluatedKey param should be passed here
     * @param {object} [options.expressionAttributeNames]
     * @param {object} [options.expressionAttributeValues]
     * @param {string} [options.filterExpression]
     * @param {string} [options.indexName]
     * @param {integer} [options.limit]
     * @param {string} [options.projectionExpression]
     * @param {string} [options.returnConsumedCapacity]
     * @param {object} [options.scanFilter]
     * @param {integer} [options.segment]
     * @param {string} [options.select]
     * @param {integer} [options.totalSegments]
     * @param {boolean} [options.doNotIterate=false] - prevents client from iterating when more items are available. Will return lastEvaluatedKey param if more items are present to allow manual pagination
     * @return {Promise<{items: array, additionalResultsData: array, lastEvaluatedKey: object}>} - If lastEvaluatedKey is present (will only be present if doNotIterate=true), it should be passed as exclusiveStartKey on the next request to fetch the next set of items.
     */
    async scan(table, options={}) {
        const scanOptions = {
            TableName: table,
            AttributesToGet: options.attributesToGet,
            ConditionalOperator: options.conditionalOperator,
            ConsistentRead: options.consistentRead,
            ExclusiveStartKey: options.exclusiveStartKey,
            ExpressionAttributeNames: options.expressionAttributeNames,
            ExpressionAttributeValues: options.expressionAttributeValues,
            FilterExpression: options.filterExpression,
            IndexName: options.indexName,
            Limit: options.limit,
            ProjectionExpression: options.projectionExpression,
            ReturnConsumedCapacity: options.returnConsumedCapacity,
            ScanFilter: options.scanFilter,
            Segment: options.segment,
            Select: options.select,
            TotalSegments: options.totalSegments
        };
        return runIterableMethod(this.docClient.scan, scanOptions, options.doNotIterate);
    }

}
module.exports = DynamoDbClient;

async function runIterableMethod(method, options, doNotIterate) {
    let itemsArray = [];
    let additionalResultsData = [];
    let results = {};
    do {
        if(results.LastEvaluatedKey != null) {
            options.ExclusiveStartKey = results.LastEvaluatedKey;
        }
        results = await method(options).promise();
        if(results.Items != null) {
            itemsArray = itemsArray.concat(results.Items);
        }
        additionalResultsData.push({
            count: results.Count,
            scannedCount: results.ScannedCount,
            consumedCapacity: results.ConsumedCapacity
        });
    } while (results.LastEvaluatedKey != null && doNotIterate !== true);
    const ret = {
        items: itemsArray,
        additionalResultsData
    };
    if(results.LastEvaluatedKey != null) {
        ret.lastEvaluatedKey = results.LastEvaluatedKey;
    }
    return ret;
}