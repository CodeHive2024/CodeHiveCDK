import * as cdk from "aws-cdk-lib";
import { CognitoStack } from "./stacks/CognitoStack";
import { BackendStack } from "./stacks/BackendStack";
import { BackendPipelineStack } from "./stacks/BackendPipelineStack";
const app = new cdk.App();

const env = { account: "337909741599", region: "us-east-1" };

const cognitoStack = new CognitoStack(app, "CognitoStack", { env });

const ebStack = new BackendStack(app, "BackendStack");

const backendPipelineStack = new BackendPipelineStack(
  app,
  "BackendPipelineStack"
);

ebStack.addDependency(cognitoStack);
backendPipelineStack.addDependency(ebStack);
