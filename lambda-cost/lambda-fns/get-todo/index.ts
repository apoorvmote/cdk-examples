import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda"
import { DynamoDB, GetItemInput } from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

interface TodoInput {
    id: string
}

interface Todo extends TodoInput {
    title: string
    isComplete: boolean
}

export async function getTodo(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
    
    const body = event.body

    if (!body) {

        return sendFailResponse()
    }

    const { id } = JSON.parse(body) as TodoInput

    const dynamoClient = new DynamoDB({ region: 'us-east-1' })
    
    const getTodoInput: GetItemInput = {
        Key: marshall({ id }),
        TableName: process.env.TODO_TABLE_NAME
    }

    try {

        const { Item } = await dynamoClient.getItem(getTodoInput)

        if (!Item) {

            return sendFailResponse()
        }

        const todo = unmarshall(Item) as Todo

        return {
            statusCode: 200,
            body: JSON.stringify({ todo })
        }

    } catch (err) {

        console.log('get item failed', err)

        return sendFailResponse()
    }
}

function sendFailResponse(): APIGatewayProxyResultV2 {
    
    return {
        statusCode: 400,
        body: JSON.stringify({ message: 'fail' })
    }
}