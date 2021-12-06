import { Stack, StackProps } from "aws-cdk-lib"
import { Construct } from "constructs"
import { Peer, Port, SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Cluster, ContainerImage, FargateService, FargateTaskDefinition } from 'aws-cdk-lib/aws-ecs';

export class WOLoadBalancerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const vpc = new Vpc(this, 'fargateVpc', {
        maxAzs: 2
      })
  
      const securityGroup = new SecurityGroup(this, 'fargateSecurity', {
        vpc,
        securityGroupName: 'fargateSecurity'
      })
  
      securityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(80))
  
      const cluster = new Cluster(this, 'nextJSCluster', {
        clusterName: 'exampleCluster',
        containerInsights: true,
        vpc
      })
  
      const taskDefinition = new FargateTaskDefinition(this, 'nextJSTaskDefinition', {
        memoryLimitMiB: 512,
        cpu: 256
      })
  
      const container = taskDefinition.addContainer('nextJSContainer', {
        image: ContainerImage.fromRegistry('public.ecr.aws/abc123xyz/next:prod-v1'),
      })
  
      container.addPortMappings({
        containerPort: 80,
        hostPort: 80
      })
      
      new FargateService(this, 'NextJSService', {
        taskDefinition,
        cluster,
        desiredCount: 1,
        serviceName: 'exampleService',
        assignPublicIp: true,
        securityGroups:[securityGroup]
      })
  }
}
