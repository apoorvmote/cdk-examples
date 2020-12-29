import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { DynamoDB, DeleteItemInput } from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

interface DeleteTodo {
    id: string
}

export async function deleteTodo(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {

    const { body } = event

    if (!body) {

        return sendFail('invalid request')
    }

    const { id } = JSON.parse(body) as DeleteTodo

    const dynamoClient = new DynamoDB({ 
        region: 'us-east-1' 
    })

    const todoParams: DeleteItemInput = {
        Key: marshall({ id }),
        ReturnValues: 'ALL_OLD',
        TableName: process.env.TODO_TABLE_NAME
    }

    try {

        const { Attributes } = await dynamoClient.deleteItem(todoParams)

        const todo = Attributes ? unmarshall(Attributes) : null
        
        return {
            statusCode: 200,
            body: JSON.stringify({ todo })    
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