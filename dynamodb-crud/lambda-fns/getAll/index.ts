import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { DynamoDB, ScanInput } from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'

export async function getAll(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {

    const dynamoClient = new DynamoDB({ 
        region: 'us-east-1' 
    })

    const scanTodo: ScanInput = {
        TableName: process.env.TODO_TABLE_NAME
    }

    try {

        const { Items } = await dynamoClient.scan(scanTodo)

        const userData = Items ? Items.map(item => unmarshall(item)) : []

        return {
            statusCode: 200,
            body: JSON.stringify({ listTodo: userData})
        }

    } catch (err) {

        console.log(err)

        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'something went wrong'
            })
        }
    }
}