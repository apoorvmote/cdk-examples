import { BuildSpec, ComputeType, LinuxBuildImage, PipelineProject } from '@aws-cdk/aws-codebuild';
import { Repository } from '@aws-cdk/aws-codecommit';
import { Artifact, Pipeline } from '@aws-cdk/aws-codepipeline';
import { CodeBuildAction, CodeCommitSourceAction, S3DeployAction } from '@aws-cdk/aws-codepipeline-actions';
import { Bucket } from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';
import { hugoRepoArn, websiteBucketArn } from './variables';

export class CodePipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    ///////////////////////////////
    // Part 7
    const websiteBucket = Bucket.fromBucketArn(this, 'websiteBucket', websiteBucketArn)

    const hugoBuildProject = new PipelineProject(this, 'hugoBuild', {
        buildSpec: BuildSpec.fromSourceFilename('buildspec.yml'),
        environment: {
            buildImage: LinuxBuildImage.STANDARD_4_0,
            computeType: ComputeType.SMALL
        }
    })

    const gitOutput = new Artifact('hugoRepoLatestMaster')

    const buildOutput = new Artifact('hugoBuildOutput')

    new Pipeline(this, 'hugoPipeline', {
        pipelineName: 'examplePipeline',
        stages: [
            {
                stageName: 'SourceCode',
                actions: [
                    new CodeCommitSourceAction({
                        actionName: 'readLatestMasterCommit',
                        output: gitOutput,
                        repository: Repository.fromRepositoryArn(this, 'hugoGitRepo', hugoRepoArn)
                    })
                ]
            },
            {
                stageName: 'Build',
                actions: [
                    new CodeBuildAction({
                        actionName: 'buildHugoWebsite',
                        input: gitOutput,
                        outputs: [buildOutput],
                        project: hugoBuildProject
                    })
                ]
            },
            {
                stageName: 'Deploy',
                actions: [
                    new S3DeployAction({
                        actionName: 'DeployHugoWebsite',
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
