import cdk = require("@aws-cdk/core");
import glue = require("@aws-cdk/aws-glue");
import s3 = require("@aws-cdk/aws-s3");
import s3Deployment = require("@aws-cdk/aws-s3-deployment");
import iam = require("@aws-cdk/aws-iam");

import { replaceValues } from "./lib";
import { config } from "dotenv";
config();

const PYTHON_VERSION = "3";
const GLUE_VERSION = "1.0";

//This value must be glueetl for Apache Spark
const COMMAND_NAME = "glueetl";
const JDBC_PATH = "dependencies/cdata.jdbc.mongodb.jar";
const BUCKET_NAME = "mongo-glue-etl"

const { RTK, MONGO_SERVER, MONGO_USER, MONGO_PASSWORD, MONGO_PORT, MONGO_SSL, MONGO_DATABASE, COLLECTIONS }= process.env;

export class MongoGlueETLStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const s3Bucket = new s3.Bucket(this, "etl-bucket", {
            bucketName: BUCKET_NAME,
            removalPolicy: cdk.RemovalPolicy.DESTROY
        });

        const dependenciesDeployment = new s3Deployment.BucketDeployment(this, "dependencies-deployment", {
            sources: [s3Deployment.Source.asset("../dependencies")],
            destinationBucket: s3Bucket,
            destinationKeyPrefix: "dependencies"
        });
        
        // Replace hardcoded values in script
        replaceValues(
            "scripts/script.py",
            RTK as string,
            MONGO_SERVER as string,
            MONGO_USER as string,
            MONGO_PASSWORD as string,
            MONGO_PORT as string,
            MONGO_SSL == "true" ? "True" : "False",
            MONGO_DATABASE as string,
            `s3://${BUCKET_NAME}/${MONGO_DATABASE as string}/`,
            COLLECTIONS as string
        );

        const scriptsDeployment = new s3Deployment.BucketDeployment(this, "scripts-deployment", {
            sources: [s3Deployment.Source.asset("scripts")],
            destinationBucket: s3Bucket,
            destinationKeyPrefix: "scripts"
        });

        const glueRole = new iam.Role(this, "glue-role", {
            roleName: "glue-etl-role",
            assumedBy: new iam.ServicePrincipal("glue.amazonaws.com"),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3FullAccess")
            ],
        });

        const glueJob = new glue.CfnJob(this, "glue-job", {
            name: "glue-job",
            role: glueRole.roleArn,
            command: {
                name: COMMAND_NAME,
                pythonVersion: PYTHON_VERSION,
                scriptLocation: `s3://${s3Bucket.bucketName}/scripts/script.py`
            },
            glueVersion: GLUE_VERSION,
            defaultArguments: {
                "--extra-jars": `s3://${s3Bucket.bucketName}/${JDBC_PATH}`
            }
        });

        const glueTrigger = new glue.CfnTrigger(this, "glue-trigger", {
            name: "etl-trigger",
            schedule: "cron(5 * * * ? *)",
            type: "SCHEDULED",
            actions: [
                {
                    jobName: glueJob.name
                }
            ],
            startOnCreation: true
        });
        glueTrigger.addDependsOn(glueJob);
    }
}

const app = new cdk.App();
new MongoGlueETLStack(app, "MongoGlueETLStack", {
    env: {
        region: process.env.AWS_REGION,
        account: process.env.ACCOUNT_ID
    }
});
