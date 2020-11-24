import { BuildSpec, ComputeType, LinuxBuildImage, PipelineProject } from '@aws-cdk/aws-codebuild';
import { Repository } from '@aws-cdk/aws-codecommit';
import { Artifact, Pipeline } from '@aws-cdk/aws-codepipeline';
import { CodeBuildAction, CodeCommitSourceAction, S3DeployAction } from '@aws-cdk/aws-codepipeline-actions';
import { Bucket } from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';
import { RemovalPolicy } from '@aws-cdk/core';
import { reactRepoArn, websiteBucketArn } from './variables';

export class CodePipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    ///////////////////////////////
    // Part 7
    const websiteBucket = Bucket.fromBucketArn(this, 'websiteBucket', websiteBucketArn)

    const reactBuildProject = new PipelineProject(this, 'reactBuild', {
        buildSpec: BuildSpec.fromSourceFilename('buildspec.yml'),
        environment: {
            buildImage: LinuxBuildImage.STANDARD_4_0,
            computeType: ComputeType.SMALL
        }
    })

    const artifactBucket = new Bucket(this, 'reactPipelineArtifactBucket', {
        bucketName: 'react-pipeline-artifact-bucket',
        removalPolicy: RemovalPolicy.DESTROY
    })

    const gitOutput = new Artifact('reactRepoLatestMaster')

    const buildOutput = new Artifact('reactBuildOutput')

    new Pipeline(this, 'reactPipeline', {
        artifactBucket,
        pipelineName: 'examplePipeline',
        stages: [
            {
                stageName: 'SourceCode',
                actions: [
                    new CodeCommitSourceAction({
                        actionName: 'readLatestMasterCommit',
                        output: gitOutput,
                        repository: Repository.fromRepositoryArn(this, 'reactGitRepo', reactRepoArn)
                    })
                ]
            },
            {
                stageName: 'Build',
                actions: [
                    new CodeBuildAction({
                        actionName: 'buildReactApp',
                        input: gitOutput,
                        outputs: [buildOutput],
                        project: reactBuildProject
                    })
                ]
            },
            {
                stageName: 'Deploy',
                actions: [
                    new S3DeployAction({
                        actionName: 'DeployReactApp',
                        input: buildOutput,
                        bucket: websiteBucket
                    })
                ]
            }
        ]
    })
    ///////////////////////////////
  }
}
