import { Stack, StackProps, RemovalPolicy } from "aws-cdk-lib"
import { Construct } from "constructs"
import { BuildSpec, ComputeType, LinuxBuildImage, PipelineProject } from 'aws-cdk-lib/aws-codebuild';
import { Repository } from 'aws-cdk-lib/aws-codecommit';
import { Artifact, Pipeline } from 'aws-cdk-lib/aws-codepipeline';
import { CodeBuildAction, CodeCommitSourceAction, S3DeployAction } from 'aws-cdk-lib/aws-codepipeline-actions';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { reactRepoArn, websiteBucketArn } from './variables';

export class CodePipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    ///////////////////////////////
    // Part 7
    const websiteBucket = Bucket.fromBucketArn(this, 'websiteBucket', websiteBucketArn)

    const reactBuildProject = new PipelineProject(this, 'reactBuild', {
        buildSpec: BuildSpec.fromSourceFilename('buildspec.yml'),
        environment: {
            buildImage: LinuxBuildImage.STANDARD_5_0,
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
                        branch: 'main',
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
