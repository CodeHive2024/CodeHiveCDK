# This is our cdk repo
- The purpose of this repo is to create our AWS resources through code. We can tear up and bring back resources with just a few commands as opposed to the long process of interacting with the ui console.
- The only manual process right now is creating github-token in secrets manager to let source stage in pipeline
retrieve our source code.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `npx cdk deploy` deploy this stack to your default AWS account/region
- `npx cdk diff` compare deployed stack with current state
- `npx cdk synth` emits the synthesized CloudFormation template
