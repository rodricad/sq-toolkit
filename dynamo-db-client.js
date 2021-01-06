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
     * @return {Promise<*>}
     */
    async put(table, item, options={}) {
        const putObject = {
            Item: Object.assign({}, item),
            TableName: table
        };
        setIfNotNull(putObject, options.conditionExpression, 'ConditionExpression');
        setIfNotNull(putObject, options.conditionalOperator, 'ConditionalOperator');
        setIfNotNull(putObject, options.expected, 'Expected');
        setIfNotNull(putObject, options.expressionAttributeNames, 'ExpressionAttributeNames');
        setIfNotNull(putObject, options.expressionAttributeValues, 'ExpressionAttributeValues');
        setIfNotNull(putObject, options.returnConsumedCapacity, 'ReturnConsumedCapacity');
        setIfNotNull(putObject, options.returnItemCollectionMetrics, 'ReturnItemCollectionMetrics');
        setIfNotNull(putObject, options.returnValues, 'ReturnValues');

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
     * @return {Promise<*>}
     */
    async get(table, key, options={}) {
        const getObject = {
            Key: key,
            TableName: table
        };
        setIfNotNull(getObject, options.attributesToGet, 'AttributesToGet');
        setIfNotNull(getObject, options.consistentRead, 'ConsistentRead');
        setIfNotNull(getObject, options.projectionExpression, 'ProjectionExpression');
        setIfNotNull(getObject, options.expressionAttributeNames, 'ExpressionAttributeNames');
        setIfNotNull(getObject, options.returnConsumedCapacity, 'ReturnConsumedCapacity');
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
     * @return {Promise<*>}
     */
    async update(table, key, options={}) {
        const updateObject = {
            Key: key,
            TableName:table
        };
        setIfNotNull(updateObject, options.attributeUpdates, 'AttributeUpdates');
        setIfNotNull(updateObject, options.conditionExpression, 'ConditionExpression');
        setIfNotNull(updateObject, options.conditionalOperator, 'ConditionalOperator');
        setIfNotNull(updateObject, options.expected, 'Expected');
        setIfNotNull(updateObject, options.expressionAttributeNames, 'ExpressionAttributeNames');
        setIfNotNull(updateObject, options.expressionAttributeValues, 'ExpressionAttributeValues');
        setIfNotNull(updateObject, options.returnConsumedCapacity, 'ReturnConsumedCapacity');
        setIfNotNull(updateObject, options.returnItemCollectionMetrics, 'ReturnItemCollectionMetrics');
        setIfNotNull(updateObject, options.returnValues, 'ReturnValues');
        setIfNotNull(updateObject, options.updateExpression, 'UpdateExpression');

        let result = await this.docClient.update(updateObject).promise();
        return {
            attributes: result.Attributes,
            itemCollectionMetrics: result.ItemCollectionMetrics,
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
     * @return {Promise<*>}
     */
    async delete(table, key, options={}) {
        const deleteObject = {
            Key: key,
            TableName: table
        };
        setIfNotNull(deleteObject, options.conditionExpression, 'ConditionExpression');
        setIfNotNull(deleteObject, options.conditionalOperator, 'ConditionalOperator');
        setIfNotNull(deleteObject, options.expected, 'Expected');
        setIfNotNull(deleteObject, options.expressionAttributeNames, 'ExpressionAttributeNames');
        setIfNotNull(deleteObject, options.expressionAttributeValues, 'ExpressionAttributeValues');
        setIfNotNull(deleteObject, options.returnConsumedCapacity, 'ReturnConsumedCapacity');
        setIfNotNull(deleteObject, options.returnItemCollectionMetrics, 'ReturnItemCollectionMetrics');
        setIfNotNull(deleteObject, options.returnValues, 'ReturnValues');

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
     * @param {object} [options.exclusiveStartKey]
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
     * @return {Promise<*>}
     */
    async query(table, options={}) {
        const queryObject = {  TableName: table };
        setIfNotNull(queryObject, options.attributesToGet, 'AttributesToGet');
        setIfNotNull(queryObject, options.conditionalOperator, 'ConditionalOperator');
        setIfNotNull(queryObject, options.consistentRead, 'ConsistentRead');
        setIfNotNull(queryObject, options.exclusiveStartKey, 'ExclusiveStartKey');
        setIfNotNull(queryObject, options.expressionAttributeNames, 'ExpressionAttributeNames');
        setIfNotNull(queryObject, options.expressionAttributeValues, 'ExpressionAttributeValues');
        setIfNotNull(queryObject, options.filterExpression, 'FilterExpression');
        setIfNotNull(queryObject, options.indexName, 'IndexName');
        setIfNotNull(queryObject, options.keyConditionExpression, 'KeyConditionExpression');
        setIfNotNull(queryObject, options.keyConditions, 'KeyConditions');
        setIfNotNull(queryObject, options.limit, 'Limit');
        setIfNotNull(queryObject, options.projectionExpression, 'ProjectionExpression');
        setIfNotNull(queryObject, options.queryFilter, 'QueryFilter');
        setIfNotNull(queryObject, options.returnConsumedCapacity, 'ReturnConsumedCapacity');
        setIfNotNull(queryObject, options.scanIndexForward, 'ScanIndexForward');
        setIfNotNull(queryObject, options.select, 'Select');

        let itemsArray = [];
        let additionalResultsData = [];
        let results = {};
        do {
            if(results.LastEvaluatedKey != null) {
                queryObject.ExclusiveStartKey = results.LastEvaluatedKey;
            }
            results = await this.docClient.query(queryObject).promise();
            if(results.Items != null) {
                itemsArray += results.Items;
            }
            additionalResultsData.push({
                count: results.Count,
                scannedCount: results.ScannedCount,
                consumedCapacity: results.ConsumedCapacity
            });
        } while (results.LastEvaluatedKey != null);
        return {
            items: itemsArray,
            additionalResultsData
        };
    }

    /**
     * Returns one or more items and item attributes by accessing every item in a table or a secondary index.
     * For info on each param please refer to the docs: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GettingStarted.NodeJs.03.html
     * @param table
     * @param [options]
     * @param {array<string>} [options.attributesToGet]
     * @param {string} [options.conditionalOperator]
     * @param {boolean} [options.consistentRead]
     * @param {object} [options.exclusiveStartKey]
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
     * @return {Promise<*>}
     */
    async scan(table, options={}) {
        const scanObject = { TableName: table };
        setIfNotNull(scanObject, options.attributesToGet, 'AttributesToGet');
        setIfNotNull(scanObject, options.conditionalOperator, 'ConditionalOperator');
        setIfNotNull(scanObject, options.consistentRead, 'ConsistentRead');
        setIfNotNull(scanObject, options.exclusiveStartKey, 'ExclusiveStartKey');
        setIfNotNull(scanObject, options.expressionAttributeNames, 'ExpressionAttributeNames');
        setIfNotNull(scanObject, options.expressionAttributeValues, 'ExpressionAttributeValues');
        setIfNotNull(scanObject, options.filterExpression, 'FilterExpression');
        setIfNotNull(scanObject, options.indexName, 'IndexName');
        setIfNotNull(scanObject, options.limit, 'Limit');
        setIfNotNull(scanObject, options.projectionExpression, 'ProjectionExpression');
        setIfNotNull(scanObject, options.returnConsumedCapacity, 'ReturnConsumedCapacity');
        setIfNotNull(scanObject, options.scanFilter, 'ScanFilter');
        setIfNotNull(scanObject, options.segment, 'Segment');
        setIfNotNull(scanObject, options.select, 'Select');
        setIfNotNull(scanObject, options.totalSegments, 'TotalSegments');

        let itemsArray = [];
        let additionalResultsData = [];
        let results = {};
        do {
            if(results.LastEvaluatedKey != null) {
                scanObject.ExclusiveStartKey = results.LastEvaluatedKey;
            }
            results = await this.docClient.scan(scanObject).promise();
            if(results.Items != null) {
                itemsArray += results.Items;
            }
            additionalResultsData.push({
                count: results.Count,
                scannedCount: results.ScannedCount,
                consumedCapacity: results.ConsumedCapacity
            });
        } while (results.LastEvaluatedKey != null);
        return {
            items: itemsArray,
            additionalResultsData
        };
    }

}
module.exports = DynamoDbClient;

function setIfNotNull(obj, param, key) {
    if(param != null) {
        obj[key] = param;
    }
}