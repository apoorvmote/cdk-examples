import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda"
import { v4 as uuid } from "uuid"
import { DynamoDB, PutItemInput } from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'

interface TodoInput {
    title: string
    isComplete: boolean
}

interface Todo extends TodoInput {
    id: string
}

export async function createTodo(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
    
    const body = event.body

    if (!body) {

        return sendFailResponse()
    }

    const { title, isComplete } = JSON.parse(body) as TodoInput

    const dynamoClient = new DynamoDB({ region: 'us-east-1' })

    const newTodo: Todo = { id: uuid(), title, isComplete }

    const newTodoInput: PutItemInput = {
        Item: marshall({
            'id': newTodo.id,
            'title': title,
            'isComplete': isComplete
        }),
        TableName: process.env.TODO_TABLE_NAME
    }

    try {

        await dynamoClient.putItem(newTodoInput)

        return {
            statusCode: 200,
            body: JSON.stringify({ id: newTodo.id })
        }

    } catch (err) {

        console.log("failed to save new todo", err)

        return sendFailResponse()
    }
}

function sendFailResponse(): APIGatewayProxyResultV2 {
    
    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'fail' })
    }
}