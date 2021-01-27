import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda"
import { DynamoDB, DeleteItemInput } from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'

interface Todo {
    id: string
}

export async function deleteTodo(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
    
    const body = event.body

    if (!body) {

        return sendFailResponse()
    }

    const { id } = JSON.parse(body) as Todo

    const dynamoClient = new DynamoDB({ region: 'us-east-1' })

    const deleteInput: DeleteItemInput = {
        Key: marshall({ id }),
        TableName: process.env.TODO_TABLE_NAME
    }

    try {

        await dynamoClient.deleteItem(deleteInput)

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'success' })
        }

    } catch (err) {

        console.log('failed to delete todo', err)

        return sendFailResponse()
    }
}

function sendFailResponse(): APIGatewayProxyResultV2 {
    
    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'fail' })
    }
}