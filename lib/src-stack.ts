import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodeJS from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as path from "path";
import { Duration } from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as targets from 'aws-cdk-lib/aws-events-targets'
import * as events from 'aws-cdk-lib/aws-events'
// import * as sqs from 'aws-cdk-lib/aws-sqs';

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

        //eventBridge
        const eventRule = new events.Rule(this, 'scheduleRule', {
            schedule: events.Schedule.cron({ minute: '1' }),
        });
        eventRule.addTarget(new targets.LambdaFunction(tasklambdaFunc));

        // lambda permissions
        table.grantFullAccess(helloLambdaFunc);
        table.grantFullAccess(tasklambdaFunc);

        // api gateway
        const api = new apigateway.RestApi(this, "handler-api", {
            restApiName: "Handler Service",
            description: "Primary api"
        });

        const getHandlerInteraction = new apigateway.LambdaIntegration(helloLambdaFunc, {
            requestTemplates: {
                "application/json": "{ \"statusCode\": \"200\" }"
            }
        });

        api.root.addMethod("GET", getHandlerInteraction);
    }
}
