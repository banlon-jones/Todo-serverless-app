import 'source-map-support/register';
import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import { getUserId } from '../utils';
import { createLogger } from '../../utils/logger';
const XAWS = AWSXRay.captureAWS(AWS);
const logger = createLogger('delete');
const docClient = new XAWS.DynamoDB.DocumentClient();
const todosTable = process.env.TODOS_TABLE;
const indexName = process.env.INDEX_NAME;
export const handler = async (event) => {
    const todoId = event.pathParameters.todoId;
    // TODO: Remove a TODO item by id
    await deleteTodoItem(event, todoId);
    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': '*'
        },
        body: ''
    };
};
async function deleteTodoItem(event, todoId) {
    logger.info('Deleting Todo Item: ', todoId);
    await docClient.delete({
        TableName: todosTable,
        IndexName: indexName,
        Key: {
            userId: getUserId(event),
            todoId: todoId
        }
    }).promise();
}
//# sourceMappingURL=deleteTodo.js.map