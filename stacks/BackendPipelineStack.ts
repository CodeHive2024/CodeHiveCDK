import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as codepipeline from "aws-cdk-lib/aws-codepipeline";
import * as cpactions from "aws-cdk-lib/aws-codepipeline-actions";
import * as codebuild from "aws-cdk-lib/aws-codebuild";

export class BackendPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Import Elastic Beanstalk Application and Environment Names from the BackendStack
    const ebAppName = cdk.Fn.importValue("EBAppName");
    const ebEnvName = cdk.Fn.importValue("EBEnvName");

    // CodePipeline
    const pipeline = new codepipeline.Pipeline(this, "Pipeline", {
      pipelineName: "BackendPipeline",
    });

    const sourceOutput = new codepipeline.Artifact();
    pipeline.addStage({
      stageName: "Source",
      actions: [
        new cpactions.GitHubSourceAction({
          actionName: "GitHub_Source",
          owner: "CodeHive2024", // Replace with your GitHub username
          repo: "Backend", // Replace with your repository name
          oauthToken: cdk.SecretValue.secretsManager("github-token"), // GitHub token stored in Secrets Manager
          output: sourceOutput,
          branch: "main", // Replace with your branch name
        }),
      ],
    });

    // Build Stage (Using buildspec.yml from the repository)
    const buildOutput = new codepipeline.Artifact();
    const buildProject = new codebuild.PipelineProject(this, "BuildProject", {
      buildSpec: codebuild.BuildSpec.fromSourceFilename("buildspec.yml"), // Reference the buildspec.yml from the repo
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
        privileged: true, // Required for Docker
      },
    });

    pipeline.addStage({
      stageName: "Build",
      actions: [
        new cpactions.CodeBuildAction({
          actionName: "Build",
          project: buildProject,
          input: sourceOutput,
          outputs: [buildOutput],
        }),
      ],
    });

    pipeline.addStage({
      stageName: "Deploy",
      actions: [
        new cpactions.ElasticBeanstalkDeployAction({
          actionName: "Deploy_to_ElasticBeanstalk",
          input: buildOutput,
          applicationName: ebAppName, // Imported Elastic Beanstalk application name
          environmentName: ebEnvName, // Imported Elastic Beanstalk environment name
        }),
      ],
    });
  }
}
