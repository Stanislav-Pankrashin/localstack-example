import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodeJS from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as path from "path";
import { Duration } from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as events from 'aws-cdk-lib/aws-events';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as sqs from 'aws-cdk-lib/aws-sqs';

export class SrcStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // The code that defines your stack goes here

        // example resource
        // const queue = new sqs.Queue(this, 'SrcQueue', {
        //   visibilityTimeout: cdk.Duration.seconds(300)
        // });

        //dynamo
        const table = new dynamodb.Table(this, id, {
            billingMode: dynamodb.BillingMode.PROVISIONED,
            readCapacity: 1,
            writeCapacity: 1,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'createdAt', type: dynamodb.AttributeType.NUMBER },
            pointInTimeRecovery: true,
            tableName: "auditTable",
        });

        // lambda
        const helloLambdaFunc = new lambdaNodeJS.NodejsFunction(this, "helloLambda", {
            runtime: lambda.Runtime.NODEJS_16_X,
            entry: path.join(__dirname, "/../resources/helloLambda.ts"),
            handler: "main",
            timeout: Duration.seconds(60),
        });

        const tasklambdaFunc = new lambdaNodeJS.NodejsFunction(this, "taskLambda", {
            runtime: lambda.Runtime.NODEJS_16_X,
            entry: path.join(__dirname, "/../resources/taskLambda.ts"),
            handler: "main",
            timeout: Duration.seconds(60),
        });

        const sqsProducerlambdaFunc = new lambdaNodeJS.NodejsFunction(this, "sqsProducerLambda", {
            runtime: lambda.Runtime.NODEJS_16_X,
            entry: path.join(__dirname, "/../resources/sqsProducerLambda.ts"),
            handler: "main",
            timeout: Duration.seconds(60),
        });

        const sqsConsumerlambdaFunc = new lambdaNodeJS.NodejsFunction(this, "sqsConsumerLambda", {
            runtime: lambda.Runtime.NODEJS_16_X,
            entry: path.join(__dirname, "/../resources/sqsConsumerLambda.ts"),
            handler: "main",
            timeout: Duration.seconds(60),
        });

        // SQS

        const queue = new sqs.Queue(this, 'ProducerConsumerSQS', {
            queueName: 'ProducerConsumerSQS',
        });

        queue.grantSendMessages(sqsProducerlambdaFunc);
        queue.grantConsumeMessages(sqsConsumerlambdaFunc);

        const eventSource = new lambdaEventSources.SqsEventSource(queue);

        sqsConsumerlambdaFunc.addEventSource(eventSource);

        //eventBridge
        const eventRule = new events.Rule(this, 'scheduleRule', {
            schedule: events.Schedule.expression("rate(1 minute)"),
        });

        eventRule.addTarget(new targets.LambdaFunction(tasklambdaFunc));

        // lambda permissions
        table.grantFullAccess(helloLambdaFunc);
        table.grantFullAccess(tasklambdaFunc);
        table.grantFullAccess(sqsProducerlambdaFunc);
        table.grantFullAccess(sqsConsumerlambdaFunc);

        // api gateway
        const helloApi = new apigateway.RestApi(this, "handler-hello-api", {
            restApiName: "Handler Service",
            description: "Primary api"
        });

        const getHelloApiHandlerInteraction = new apigateway.LambdaIntegration(helloLambdaFunc, {
            requestTemplates: {
                "application/json": "{ \"statusCode\": \"200\" }"
            }
        });

        const sqsProducerApi = new apigateway.RestApi(this, "handler-sqs-producer-api", {
            restApiName: "Handler Service",
            description: "Primary api"
        });

        const getProducerApiHandlerInteraction = new apigateway.LambdaIntegration(sqsProducerlambdaFunc, {
            requestTemplates: {
                "application/json": "{ \"statusCode\": \"200\" }"
            }
        });

        helloApi.root.addMethod("GET", getHelloApiHandlerInteraction);
        sqsProducerApi.root.addMethod("GET", getProducerApiHandlerInteraction);
    }
}
