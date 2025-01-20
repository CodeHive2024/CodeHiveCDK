import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as cognito from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";

export class CognitoStack extends cdk.Stack {
  public readonly cognitoAppClientId: string;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a Cognito User Pool
    const userPool = new cognito.UserPool(this, "UserPool", {
      deletionProtection: false, // Ensure this is set to false
      userPoolName: "my-user-pool",
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
        phone: false,
        username: false,
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
    });

    // Create an App Client for the User Pool
    const appClient = userPool.addClient("MyAppClient", {
      userPoolClientName: "appclient",
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
    });

    // Create a Cognito Identity Pool
    const identityPool = new cognito.CfnIdentityPool(this, "IdentityPool", {
      identityPoolName: "my-identity-pool",
      allowUnauthenticatedIdentities: false,
    });

    // Create a Cognito Identity Pool Role
    const identityPoolRole = new iam.Role(this, "IdentityPoolRole", {
      assumedBy: new iam.FederatedPrincipal(
        "cognito-identity.amazonaws.com",
        {
          StringEquals: {
            "cognito-identity.amazonaws.com:aud": identityPool.ref,
          },
        },
        "sts:AssumeRoleWithWebIdentity"
      ),
    });

    // Attach the Identity Pool Role to the Identity Pool
    new cognito.CfnIdentityPoolRoleAttachment(
      this,
      "IdentityPoolRoleAttachment",
      {
        identityPoolId: identityPool.ref,
        roles: {
          authenticated: identityPoolRole.roleArn,
        },
      }
    );

    this.cognitoAppClientId = appClient.userPoolClientId;

    new cdk.CfnOutput(this, "CognitoAppClientId", {
      value: appClient.userPoolClientId,
      description: "Cognito App Client ID",
      exportName: "CognitoAppClientId", // Ensure the export name matches
    });
  }
}
