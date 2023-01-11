import {APIGatewayProxyEventV2, APIGatewayProxyResult} from 'aws-lambda';

export const main = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> => {
    console.log("will you see this???");
    const body = {result: "Hello World!!!"};
    
    return {
        statusCode: 200,
        body: JSON.stringify(body),
    }
}