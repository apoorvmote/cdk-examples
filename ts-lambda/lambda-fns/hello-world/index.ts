import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'

export async function myFunction(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
    
    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'hello from ts lambda' })
    }
}