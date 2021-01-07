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
            TableName: table
        };
        options.conditionExpression != null && (putObject.ConditionExpression = options.conditionExpression);
        options.conditionalOperator != null && (putObject.ConditionalOperator = options.conditionalOperator);
        options.expected != null && (putObject.Expected = options.expected);
        options.expressionAttributeNames != null && (putObject.ExpressionAttributeNames = options.expressionAttributeNames);
        options.expressionAttributeValues != null && (putObject.ExpressionAttributeValues = options.expressionAttributeValues);
        options.returnConsumedCapacity != null && (putObject.ReturnConsumedCapacity = options.returnConsumedCapacity);
        options.returnItemCollectionMetrics != null && (putObject.ReturnItemCollectionMetrics = options.returnItemCollectionMetrics);
        options.returnValues != null && (putObject.ReturnValues = options.returnValues);

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
            TableName: table
        };
        options.attributesToGet != null && (getObject.AttributesToGet = options.attributesToGet);
        options.consistentRead != null && (getObject.ConsistentRead = options.consistentRead);
        options.projectionExpression != null && (getObject.ProjectionExpression = options.projectionExpression);
        options.expressionAttributeNames != null && (getObject.ExpressionAttributeNames = options.expressionAttributeNames);
        options.returnConsumedCapacity != null && (getObject.ReturnConsumedCapacity = options.returnConsumedCapacity);
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
            TableName:table
        };
        options.attributeUpdates != null && (updateObject.AttributeUpdates = options.attributeUpdates);
        options.conditionExpression != null && (updateObject.ConditionExpression = options.conditionExpression);
        options.conditionalOperator != null && (updateObject.ConditionalOperator = options.conditionalOperator);
        options.expected != null && (updateObject.Expected = options.expected);
        options.expressionAttributeNames != null && (updateObject.ExpressionAttributeNames = options.expressionAttributeNames);
        options.expressionAttributeValues != null && (updateObject.ExpressionAttributeValues = options.expressionAttributeValues);
        options.returnConsumedCapacity != null && (updateObject.ReturnConsumedCapacity = options.returnConsumedCapacity);
        options.returnItemCollectionMetrics != null && (updateObject.ReturnItemCollectionMetrics = options.returnItemCollectionMetrics);
        options.returnValues != null && (updateObject.ReturnValues = options.returnValues);
        options.updateExpression != null && (updateObject.UpdateExpression = options.updateExpression);

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
            TableName: table
        };
        options.conditionExpression != null && (deleteObject.ConditionExpression = options.conditionExpression);
        options.conditionalOperator != null && (deleteObject.ConditionalOperator = options.conditionalOperator);
        options.expected != null && (deleteObject.Expected = options.expected);
        options.expressionAttributeNames != null && (deleteObject.ExpressionAttributeNames = options.expressionAttributeNames);
        options.expressionAttributeValues != null && (deleteObject.ExpressionAttributeValues = options.expressionAttributeValues);
        options.returnConsumedCapacity != null && (deleteObject.ReturnConsumedCapacity = options.returnConsumedCapacity);
        options.returnItemCollectionMetrics != null && (deleteObject.ReturnItemCollectionMetrics = options.returnItemCollectionMetrics);
        options.returnValues != null && (deleteObject.ReturnValues = options.returnValues);

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
     * @return {Promise<{items: array, additionalResultsData: array}>}
     */
    async query(table, options={}) {
        const queryObject = {  TableName: table };
        options.attributesToGet != null && (queryObject.AttributesToGet = options.attributesToGet);
        options.conditionalOperator != null && (queryObject.ConditionalOperator = options.conditionalOperator);
        options.consistentRead != null && (queryObject.ConsistentRead = options.consistentRead);
        options.exclusiveStartKey != null && (queryObject.ExclusiveStartKey = options.exclusiveStartKey);
        options.expressionAttributeNames != null && (queryObject.ExpressionAttributeNames = options.expressionAttributeNames);
        options.expressionAttributeValues != null && (queryObject.ExpressionAttributeValues = options.expressionAttributeValues);
        options.filterExpression != null && (queryObject.FilterExpression = options.filterExpression);
        options.indexName != null && (queryObject.IndexName = options.indexName);
        options.keyConditionExpression != null && (queryObject.KeyConditionExpression = options.keyConditionExpression);
        options.keyConditions != null && (queryObject.KeyConditions = options.keyConditions);
        options.limit != null && (queryObject.Limit = options.limit);
        options.projectionExpression != null && (queryObject.ProjectionExpression = options.projectionExpression);
        options.queryFilter != null && (queryObject.QueryFilter = options.queryFilter);
        options.returnConsumedCapacity != null && (queryObject.ReturnConsumedCapacity = options.returnConsumedCapacity);
        options.scanIndexForward != null && (queryObject.ScanIndexForward = options.scanIndexForward);
        options.select != null && (queryObject.Select = options.select);

        let itemsArray = [];
        let additionalResultsData = [];
        let results = {};
        do {
            const queryParams = Object.assign({}, queryObject);
            if(results.LastEvaluatedKey != null) {
                queryParams.ExclusiveStartKey = results.LastEvaluatedKey;
            }
            results = await this.docClient.query(queryParams).promise();
            if(results.Items != null) {
                itemsArray = itemsArray.concat(results.Items);
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
     * @return {Promise<{items: array, additionalResultsData: array}>}
     */
    async scan(table, options={}) {
        const scanObject = { TableName: table };
        options.attributesToGet != null && (scanObject.AttributesToGet = options.attributesToGet);
        options.conditionalOperator != null && (scanObject.ConditionalOperator = options.conditionalOperator);
        options.consistentRead != null && (scanObject.ConsistentRead = options.consistentRead);
        options.exclusiveStartKey != null && (scanObject.ExclusiveStartKey = options.exclusiveStartKey);
        options.expressionAttributeNames != null && (scanObject.ExpressionAttributeNames = options.expressionAttributeNames);
        options.expressionAttributeValues != null && (scanObject.ExpressionAttributeValues = options.expressionAttributeValues);
        options.filterExpression != null && (scanObject.FilterExpression = options.filterExpression);
        options.indexName != null && (scanObject.IndexName = options.indexName);
        options.limit != null && (scanObject.Limit = options.limit);
        options.projectionExpression != null && (scanObject.ProjectionExpression = options.projectionExpression);
        options.returnConsumedCapacity != null && (scanObject.ReturnConsumedCapacity = options.returnConsumedCapacity);
        options.scanFilter != null && (scanObject.ScanFilter = options.scanFilter);
        options.segment != null && (scanObject.Segment = options.segment);
        options.select != null && (scanObject.Select = options.select);
        options.totalSegments != null && (scanObject.TotalSegments = options.totalSegments);

        let itemsArray = [];
        let additionalResultsData = [];
        let results = {};
        do {
            const scanParams = Object.assign({}, scanObject);
            if(results.LastEvaluatedKey != null) {
                scanParams.ExclusiveStartKey = results.LastEvaluatedKey;
            }
            results = await this.docClient.scan(scanParams).promise();
            if(results.Items != null) {
                itemsArray = itemsArray.concat(results.Items);
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