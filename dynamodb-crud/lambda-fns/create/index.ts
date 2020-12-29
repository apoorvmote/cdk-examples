import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { DynamoDB, PutItemInput } from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'
import { v4 as uuid } from 'uuid'

interface TodoInput {
    id?: string
    owner?: string
    title: string
    done: boolean 
}

interface Todo {
    id: string
    owner?: string
    title: string
    done: boolean 
}

export async function createTodo(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {

    const { body } = event

    if (!body) {

        return sendFail('invalid request')
    }

    const { id, owner, title, done } = JSON.parse(body) as TodoInput

    const dynamoClient = new DynamoDB({ 
        region: 'us-east-1' 
    })

    const newTodo: Todo = {
        id: id ?? uuid(),
        owner, title, done
    }

    const todoParams: PutItemInput = {
        Item: marshall(newTodo),
        TableName: process.env.TODO_TABLE_NAME
    }

    try {

        await dynamoClient.putItem(todoParams)
        
        return {
            statusCode: 200,
            body: JSON.stringify({ newTodo })    
        }

    } catch (err) {

        console.log(err)

        return sendFail('something went wrong')
    }
}

function sendFail(message: string): APIGatewayProxyResultV2 {
    
    return {
        statusCode: 400,
        body: JSON.stringify({ message })
    }
}