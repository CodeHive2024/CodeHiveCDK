import * as cdk from "aws-cdk-lib";
import { CognitoStack } from "./stacks/CognitoStack";
import { BackendStack } from "./stacks/BackendStack";
import { BackendPipelineStack } from "./stacks/BackendPipelineStack";
import { UIStack } from "./stacks/UIStack";
import { UIPipelineStack } from "./stacks/UIPipelineStack";
const app = new cdk.App();

const env = { account: "337909741599", region: "us-east-1" };

const cognitoStack = new CognitoStack(app, "CognitoStack", { env });

const backendStack = new BackendStack(app, "BackendStack");

const uiStack = new UIStack(app, "UIStack");

const backendPipelineStack = new BackendPipelineStack(
  app,
  "BackendPipelineStack"
);

const uiPipelineStack = new UIPipelineStack(app, "UIPipelineStack");

backendStack.addDependency(cognitoStack);
uiStack.addDependency(backendStack);
backendPipelineStack.addDependency(backendStack);
uiPipelineStack.addDependency(uiStack);
