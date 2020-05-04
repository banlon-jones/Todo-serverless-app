import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'

import * as AWS from 'aws-sdk'
import * as uuid from 'uuid'
import { TodoItem } from '../../models/TodoItem'
import { getUserId } from '../utils';
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)


const docClient = new XAWS.DynamoDB.DocumentClient()


const todosTable = process.env.TODOS_TABLE
const bucketName = process.env.IMAGES_S3_BUCKET
const logger  = createLogger('create')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)

  // TODO: Implement creating a new TODO item
  const todoId = uuid.v4()
  const newTodoItem = await createTodoItem(event, todoId, newTodo.name, newTodo.dueDate)
  
  return {

    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': '*'
    },
    body: JSON.stringify({
      item: newTodoItem
    })
    
  }
}


async function createTodoItem(event: APIGatewayProxyEvent, todoId: string, name: string, dueDate: string): Promise<TodoItem>{
  const todosItem = {
    userId: getUserId(event),
    todoId: todoId,
    createdAt: new Date().toISOString(),
    name: name,
    dueDate: dueDate,
    done: false,
    attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`
  }

  await docClient.put({
    TableName: todosTable,
    Item: todosItem
  })
  .promise()
  logger.info("Created new todo Item.")
  return todosItem
}
