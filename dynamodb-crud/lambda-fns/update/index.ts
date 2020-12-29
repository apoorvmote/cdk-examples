import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { DynamoDB, UpdateItemInput } from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

interface UpdateTodo {
    id: string
    done: boolean 
}

export async function update(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {

    const { body } = event

    if (!body) {

        return sendFail('invalid request')
    }

    const { id, done } = JSON.parse(body) as UpdateTodo

    const dynamoClient = new DynamoDB({ 
        region: 'us-east-1' 
    })

    const todoParams: UpdateItemInput = {
        Key: marshall({ id }),
        UpdateExpression: 'set done = :done',
        ExpressionAttributeValues: marshall({
            ':done': done
        }),
        ReturnValues: 'ALL_NEW',
        TableName: process.env.UPDATE_TABLE_NAME
    }

    try {

        const { Attributes } = await dynamoClient.updateItem(todoParams)

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
        statusCode: 200,
        body: JSON.stringify({ message })
    }
}