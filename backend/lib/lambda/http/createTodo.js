import 'source-map-support/register';
import * as AWS from 'aws-sdk';
import * as uuid from 'uuid';
import { getUserId } from '../utils';
import * as AWSXRay from 'aws-xray-sdk';
import { createLogger } from '../../utils/logger';
const XAWS = AWSXRay.captureAWS(AWS);
const docClient = new XAWS.DynamoDB.DocumentClient();
const todosTable = process.env.TODOS_TABLE;
const bucketName = process.env.IMAGES_S3_BUCKET;
const logger = createLogger('create');
export const handler = async (event) => {
    const newTodo = JSON.parse(event.body);
    // TODO: Implement creating a new TODO item
    const todoId = uuid.v4();
    const newTodoItem = await createTodoItem(event, todoId, newTodo.name, newTodo.dueDate);
    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': '*'
        },
        body: JSON.stringify({
            item: newTodoItem
        })
    };
};
async function createTodoItem(event, todoId, name, dueDate) {
    const todosItem = {
        userId: getUserId(event),
        todoId: todoId,
        createdAt: new Date().toISOString(),
        name: name,
        dueDate: dueDate,
        done: false,
        attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`
    };
    await docClient.put({
        TableName: todosTable,
        Item: todosItem
    })
        .promise();
    logger.info("Created new todo Item.");
    return todosItem;
}
//# sourceMappingURL=createTodo.js.map