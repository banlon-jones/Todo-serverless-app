import 'source-map-support/register';
import * as AWS from 'aws-sdk';
import { getUserId } from '../utils';
import { createLogger } from '../../utils/logger';
import * as AWSXRay from 'aws-xray-sdk';
const XAWS = AWSXRay.captureAWS(AWS);
const logger = createLogger('Get');
const docClient = new XAWS.DynamoDB.DocumentClient();
const todosTable = process.env.TODOS_TABLE;
const indexName = process.env.INDEX_NAME;
export const handler = async (event) => {
    // TODO: Get all TODO items for a current user
    const userId = getUserId(event);
    const todosList = await getTodosList(userId);
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': '*'
        },
        body: JSON.stringify({
            items: todosList
        })
    };
};
async function getTodosList(userId) {
    const result = await docClient.query({
        TableName: todosTable,
        IndexName: indexName,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        }
    }).promise();
    logger.info('Get todo items');
    return result.Items;
}
//# sourceMappingURL=getTodos.js.map