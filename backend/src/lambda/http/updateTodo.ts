import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { getUserId } from '../utils';
import { createLogger } from '../../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)
const docClient = new XAWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE
const indexName = process.env.INDEX_NAME

const logger = createLogger('update')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  await updateTodoItem(event, todoId, updatedTodo.name, updatedTodo.dueDate, updatedTodo.done)
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': '*'
    },
    body: ''
  }
}


async function updateTodoItem(event: APIGatewayProxyEvent, todoId: string, todoname: string, dueDate: string, done: boolean){
  logger.info('Updating todo item: ', todoId )

  await docClient.update({
      TableName: todosTable,
      IndexName: indexName,
      Key : {
        userId: getUserId(event),
        todoId: todoId
      },
      UpdateExpression: 'SET #name = :name, dueDate = :dueDate, done = :done',
      ExpressionAttributeValues : {
        ':name': todoname,
        ':dueDate': dueDate,
        ':done': done
      },
      ExpressionAttributeNames : {
        '#name': 'name'
      }
    })
    .promise()
  }
  
