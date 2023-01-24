import { DataMapper } from '@aws/dynamodb-data-mapper';
import DynamoDB = require('aws-sdk/clients/dynamodb');
import { AuditTable } from './models/Audit.dynamo';

export const main = async (): Promise<void> => {
    console.log("running task lambda");

    const client = new DynamoDB({region: 'us-west-2', endpoint: `http://${process.env.LOCALSTACK_HOSTNAME}:4566'}`});
    const mapper = new DataMapper({client});

    const record = new AuditTable();
    record.action = "task ran!";
    await mapper.update(record);
    
}