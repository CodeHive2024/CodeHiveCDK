import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as eb from "aws-cdk-lib/aws-elasticbeanstalk";
import {
  Role,
  ServicePrincipal,
  ManagedPolicy,
  InstanceProfile,
} from "aws-cdk-lib/aws-iam";

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const ebRole = new Role(this, "elasticbeanstalk-ec2-role", {
      assumedBy: new ServicePrincipal("ec2.amazonaws.com"),
      roleName: "elasticbeanstalk-ec2-role",
    });

    // some managed policies eb must have
    ebRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName("AWSElasticBeanstalkWebTier")
    );
    ebRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName(
        "AWSElasticBeanstalkMulticontainerDocker"
      )
    );
    ebRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName("AWSElasticBeanstalkWorkerTier")
    );

    //Custom policies
    //access to config secrets

    const roleARN = ebRole.roleArn;

    // Create instance profile
    const instanceProfile = new InstanceProfile(this, "InstanceProfile", {
      role: ebRole,
      instanceProfileName: "eb-instance-profile",
    });

    /// create eb

    new cdk.CfnOutput(this, "ServiceAccountIamRole", { value: roleARN });

    const cognitoAppClientId = cdk.Fn.importValue("CognitoAppClientId"); // Import the value from CloudFormation output

    console.log("from cfn output", cognitoAppClientId);

    // Define the Elastic Beanstalk Application
    const app = new eb.CfnApplication(this, "MyEBApp", {
      applicationName: "Backend",
    });

    // Define the Elastic Beanstalk Environment
    const env = new eb.CfnEnvironment(this, "MyEBEnv", {
      environmentName: "BackendEnv",
      applicationName: app.applicationName!,
      solutionStackName: "64bit Amazon Linux 2 v5.9.10 running Node.js 18", // Example solution stack (can vary)
      optionSettings: [
        {
          namespace: "aws:autoscaling:launchconfiguration",
          optionName: "IamInstanceProfile",
          value: instanceProfile.instanceProfileArn,
        },
        {
          namespace: "aws:elasticbeanstalk:application:environment",
          optionName: "COGNITO_APP_CLIENT_ID",
          value: cognitoAppClientId, // Pass the Cognito App Client ID as an environment variable
        },
        {
          namespace: "aws:elasticbeanstalk:application:environment",
          optionName: "AWS_REGION",
          value: "us-east-1", // Example: passing AWS region
        },
      ],
    });
    env.addDependency(app);

    // Export the Elastic Beanstalk details for use in the pipeline stack
    new cdk.CfnOutput(this, "EBAppName", {
      value: app.applicationName!,
      exportName: "EBAppName",
    });

    new cdk.CfnOutput(this, "EBEnvName", {
      value: env.environmentName!,
      exportName: "EBEnvName",
    });
  }
}
