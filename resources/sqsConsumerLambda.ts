import { DataMapper } from '@aws/dynamodb-data-mapper';
import DynamoDB = require('aws-sdk/clients/dynamodb');
import { AuditTable } from './models/Audit.dynamo';

export const main = async (): Promise<void> => {
    console.log("will you see this???");

    const client = new DynamoDB({region: 'us-west-2', endpoint: `http://${process.env.LOCALSTACK_HOSTNAME}:4566'}`});
    const mapper = new DataMapper({client});

    const record = new AuditTable();
    record.action = "queue consumer ran!";
    await mapper.update(record);
    
}