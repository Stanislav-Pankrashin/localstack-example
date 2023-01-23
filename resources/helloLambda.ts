import { DataMapper } from '@aws/dynamodb-data-mapper';
import {APIGatewayProxyEventV2, APIGatewayProxyResult} from 'aws-lambda';
import DynamoDB = require('aws-sdk/clients/dynamodb');
import { AuditTable } from './models/Audit.dynamo';

export const main = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> => {
    console.log("will you see this???");
    const body = {result: "Hello World!!!"};

    const client = new DynamoDB({region: 'us-west-2', endpoint: `http://${process.env.LOCALSTACK_HOSTNAME}:4566'}`});
    const mapper = new DataMapper({client});

    const record = new AuditTable();
    record.action = "called hello world!";
    await mapper.update(record);
    
    return {
        statusCode: 200,
        body: JSON.stringify(body),
    }
}