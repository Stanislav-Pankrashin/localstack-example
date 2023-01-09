import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodeJS from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as path from "path";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class SrcStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // The code that defines your stack goes here

        // example resource
        // const queue = new sqs.Queue(this, 'SrcQueue', {
        //   visibilityTimeout: cdk.Duration.seconds(300)
        // });
        const lambdaFunc = new lambdaNodeJS.NodejsFunction(this, "handler", {
            runtime: lambda.Runtime.NODEJS_16_X,
            entry: path.join(__dirname, "/../resources/main.ts"),
            handler: "main",
        });

        const api = new apigateway.RestApi(this, "handler-api", {
            restApiName: "Handler Service",
            description: "Primary api"
        });

        const getHandlerInteraction = new apigateway.LambdaIntegration(lambdaFunc, {
            requestTemplates: {
                "application/json": "{ \"statusCode\": \"200\" }"
            }
        });

        api.root.addMethod("GET", getHandlerInteraction);
    }
}
