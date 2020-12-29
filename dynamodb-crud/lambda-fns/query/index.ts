import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { DynamoDB, QueryInput } from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

interface UserInput {
    owner: string
}

export async function queryTodo(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {

    const { body } = event

    if (!body) return sendError('invalid request')
    
    const data = JSON.parse(body) as UserInput

    const dynamoClient = new DynamoDB({ 
        region: 'us-east-1' 
    })

    const queryTodo: QueryInput = {
        KeyConditionExpression: '#todoOwner = :userId',
        ExpressionAttributeNames: {
            '#todoOwner': 'owner'
        }, 
        ExpressionAttributeValues: marshall({
            ':userId': data.owner
        }),
        IndexName: 'ownerIndex',
        TableName: process.env.TODO_TABLE_NAME
    }
    
    try {

        const { Items } = await dynamoClient.query(queryTodo)

        const listTodo = Items ? Items.map(item => unmarshall(item)) : []

        return {
            statusCode: 200,
            body: JSON.stringify({ listTodo })
        }

    } catch (err) {

        console.log(err)

        return sendError('something went wrong')
    }
}

function sendError(message: string): APIGatewayProxyResultV2 {
    
    return {
        statusCode: 400,
        body: JSON.stringify({ message })
    }
}