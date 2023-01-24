import { SQS } from '@aws-sdk/client-sqs';
import { DataMapper } from '@aws/dynamodb-data-mapper';
import { APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda';
import DynamoDB = require('aws-sdk/clients/dynamodb');
import { AuditTable } from './models/Audit.dynamo';

export const main = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> => {
    console.log("running sqs producer lambda");

    const client = new DynamoDB({region: 'us-west-2', endpoint: `http://${process.env.LOCALSTACK_HOSTNAME}:4566`});
    const mapper = new DataMapper({client});

    const sqsClient = new SQS({region: 'us-west-2', endpoint: `http://${process.env.LOCALSTACK_HOSTNAME}:4566`});

    await sqsClient.sendMessage({MessageBody: event.queryStringParameters?.["message"] ?? "", QueueUrl: `http://${process.env.LOCALSTACK_HOSTNAME}:4566/ProducerConsumerSQS`});

    const record = new AuditTable();
    record.action = "queue producer ran!";
    await mapper.update(record);

    return {
        statusCode: 200,
        body: JSON.stringify({result: "sent message to queue"}),
    }
}