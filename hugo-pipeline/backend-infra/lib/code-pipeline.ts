import { Stack, StackProps, RemovalPolicy } from "aws-cdk-lib"
import { Construct } from "constructs"
import { BuildSpec, ComputeType, LinuxBuildImage, PipelineProject } from 'aws-cdk-lib/aws-codebuild';
import { Repository } from 'aws-cdk-lib/aws-codecommit';
import { Artifact, Pipeline } from 'aws-cdk-lib/aws-codepipeline';
import { CodeBuildAction, CodeCommitSourceAction, S3DeployAction } from 'aws-cdk-lib/aws-codepipeline-actions';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { hugoRepoArn, websiteBucketArn } from './variables';

export class CodePipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    ///////////////////////////////
    // Part 7
    const websiteBucket = Bucket.fromBucketArn(this, 'websiteBucket', websiteBucketArn)

    const hugoBuildProject = new PipelineProject(this, 'hugoBuild', {
        buildSpec: BuildSpec.fromSourceFilename('buildspec.yml'),
        environment: {
            buildImage: LinuxBuildImage.STANDARD_5_0,
            computeType: ComputeType.SMALL
        }
    })

    const artifactBucket = new Bucket(this, 'websitePipelineArtifactBucket', {
        bucketName: 'hugo-pipeline-artifact-bucket',
        removalPolicy: RemovalPolicy.DESTROY
    })

    const gitOutput = new Artifact('hugoRepoLatestMaster')

    const buildOutput = new Artifact('hugoBuildOutput')

    new Pipeline(this, 'hugoPipeline', {
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
