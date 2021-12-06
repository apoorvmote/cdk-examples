import { Stack, StackProps, CfnOutput, RemovalPolicy, Duration } from "aws-cdk-lib"
import { Construct } from "constructs"
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { Vpc } from 'aws-cdk-lib/aws-ec2'
import { Cluster, ContainerImage, DeploymentControllerType } from 'aws-cdk-lib/aws-ecs';
import { HostedZone } from 'aws-cdk-lib/aws-route53';
import { website_domain, hostedZoneId, dockerUsername, dockerPassword } from './variables';
import { ApplicationLoadBalancedFargateService } from 'aws-cdk-lib/aws-ecs-patterns';
import { ApplicationProtocol } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { HttpsRedirect } from 'aws-cdk-lib/aws-route53-patterns';
import * as codecommit from 'aws-cdk-lib/aws-codecommit'
import { BuildSpec, ComputeType, LinuxBuildImage, PipelineProject } from 'aws-cdk-lib/aws-codebuild';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Artifact, Pipeline } from 'aws-cdk-lib/aws-codepipeline';
import { CodeBuildAction, CodeCommitSourceAction, EcsDeployAction } from 'aws-cdk-lib/aws-codepipeline-actions';


export class BackendInfraStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const ecrRepo = new Repository(this, 'nextJSRepo', {
      repositoryName: 'next-starter',
      removalPolicy: RemovalPolicy.DESTROY,
      imageScanOnPush: true,
      lifecycleRules: [
        {
          tagPrefixList: ['prod'],
          maxImageCount: 5
        },
        {
          maxImageAge: Duration.days(30)
        }
      ]
    })

    new CfnOutput(this, 'repoUrl', {
      value: ecrRepo.repositoryUri
    })

    const vpc = new Vpc(this, 'fargateVpc', {
      maxAzs: 2
    })

    const cluster = new Cluster(this, 'fargateCluster', {
      clusterName: 'fargateCluster',
      containerInsights: true,
      vpc
    })

    const domainZone = HostedZone.fromHostedZoneAttributes(this, 'hostedZoneWithAttributes', {
      zoneName: website_domain,
      hostedZoneId
    })

    const fargateService = new ApplicationLoadBalancedFargateService(this, 'fargateService', {
      cluster,
      assignPublicIp: true,
      cpu: 256,
      desiredCount: 1,
      memoryLimitMiB: 512,
      redirectHTTP: true,
      protocol: ApplicationProtocol.HTTPS,
      deploymentController: {
        type: DeploymentControllerType.ECS
      }, 
      domainName: website_domain,
      domainZone,
      taskImageOptions: {
        // image from docker hub
        // image: ContainerImage.fromRegistry('apoorvmote/next:prod-v1'),
        // image from public ecr registry
        // image: ContainerImage.fromRegistry('public.ecr.aws/abc123xyz/next:prod-v1'),
        // image from private ecr registry
        image: ContainerImage.fromEcrRepository(ecrRepo, 'prod-v1'),
      }
    })

    const scalableTarget = fargateService.service.autoScaleTaskCount({
      minCapacity: 1,
      maxCapacity: 20
    })

    scalableTarget.scaleOnCpuUtilization('cpuScaling', {
      targetUtilizationPercent: 70
    })

    new HttpsRedirect(this, 'wwwToNonWww', {
      recordNames: ['www.example.com'],
      targetDomain: website_domain,
      zone: domainZone
    })

    const nextRepo = new codecommit.Repository(this, 'nextJSSourceCode', {
      repositoryName: 'next-blog',
      description: 'Pipeline source code'
    })

    new CfnOutput(this, 'sourceCodeUrl', {
      value: nextRepo.repositoryCloneUrlSsh
    })

    const containerBuildProject = new PipelineProject(this, 'containerBuild', {
      buildSpec: BuildSpec.fromSourceFilename('buildspec.yml'),
      environment: {
        buildImage: LinuxBuildImage.STANDARD_5_0,
        computeType: ComputeType.SMALL,
        privileged: true
      },
      environmentVariables: {
        'docker_username': {
          value: dockerUsername
        },
        'docker_password': {
          value: dockerPassword
        }
      }
    })

    ecrRepo.grantPullPush(containerBuildProject.grantPrincipal)

    const artifactBucket = new Bucket(this, 'containerBuildArtifactBucket', {
      bucketName: 'example-pipeline-artifact',
      removalPolicy: RemovalPolicy.DESTROY
    })

    const gitOutput = new Artifact('nextJSLatestMaster')

    const buildOutput = new Artifact('ContainerBuildOutput')

    new Pipeline(this, 'containerPipeline', {
      artifactBucket,
      pipelineName: 'examplePipeline',
      stages: [
        {
          stageName: 'SourceCode',
          actions: [
            new CodeCommitSourceAction({
              actionName: 'readCode',
              output: gitOutput,
              repository: nextRepo,
              branch: 'main'
            })
          ]
        },
        {
          stageName: 'build',
          actions: [
            new CodeBuildAction({
              actionName: 'buildContainer',
              input: gitOutput,
              outputs: [buildOutput],
              project: containerBuildProject
            })
          ]
        },
        {
          stageName: 'deploy',
          actions: [
            new EcsDeployAction({
              actionName: 'deployContainer',
              service: fargateService.service,
              input: buildOutput,
              deploymentTimeout: Duration.minutes(30)
            })
          ]
        }
      ]
    })
  }
}
