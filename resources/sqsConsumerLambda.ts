import { DataMapper } from '@aws/dynamodb-data-mapper';
import { SQSEvent } from 'aws-lambda';
import DynamoDB = require('aws-sdk/clients/dynamodb');
import { AuditTable } from './models/Audit.dynamo';

export const main = async (event: SQSEvent): Promise<void> => {
    console.log("running sqs consumer lambda");

    const client = new DynamoDB({region: 'us-west-2', endpoint: `http://${process.env.LOCALSTACK_HOSTNAME}:4566'}`});
    const mapper = new DataMapper({client});

    const record = new AuditTable();
    record.action = "queue consumer ran!";
    record.message = event.Records[0].body ?? null;
    await mapper.update(record);
    
}