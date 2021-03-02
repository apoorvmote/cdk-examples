# AWS CDK examples

[![MIT License](https://badgen.now.sh/badge/License/MIT/blue)](https://github.com/apoorvmote/cdk-examples/blob/master/License.md)
![Typescript](https://badgen.net/badge/icon/typescript?icon=typescript&label)

These are CDK examples exclusively written in typescript. These are CDK template/patterns that I came across my journey with AWS CDK. I hope other people find it helpful as I myself refer to these examples time to time. 

Detailed explanation of each cdk example will be found at

## [https redirect](https://apoorv.blog/redirect-www-to-non-www/)

Redirect from www to non-www url

## [React pipeline](https://apoorv.blog/deploy-reactjs-cloudfront-codepipeline-cdk/)

Build and deploy react app on s3 and cloudfront with Codepipeline

## [Hugo pipeline](https://apoorv.blog/deploy-hugo-cloudfront-codepipeline-cdk/)

Build and deploy hugo website on s3 and cloudfront with Codepipeline

## [NextJS pipeline](https://apoorv.blog/nextjs-fargate-codepipline-cdk/)

Build docker container and deploy SSR NextJS app on Fargate with ECS and Codepipeline

## [Lambda Layers](https://apoorv.blog/lambda-layers-cdk/)

Share code and dependency library between multiple lambda functions with layers

## [Lambda Local](https://apoorv.blog/run-lambda-locally-cdk-sam/)

Lambda that is deployed with CDK can be invoked locally with SAM for faster iteration.

## [HTTP API](https://apoorv.blog/http-api-cloudfront-cdk/)

We will deploy HTTP API with CDK and connect subdomain with SSL to our api. 

## [Typescript Lambda](https://apoorv.blog/typescript-lambda-cdk/)

Lambda function written in typescript. It is compiled and build to javascript and deployed with CDK. 

## [Dynamodb Crud Lambda](https://apoorv.blog/dynamodb-crud-typescript-lambda/)

We are using latest AWS SDK V3 for Javascript for doing CRUD operations on Dynamodb with Lambda functions written in typescript.

## [Golang Lambda](https://apoorv.blog/golang-lambda-cdk/)

Build golang lambda function inside docker container that matches closely with the production environment. 

## [Lambda Cost Optimization](https://apoorv.blog/optimize-lambda-cost/)

We are going to run lambda on multiple ram settings to find out which gives you better value for money :moneybag:.

## [Basic auth to Password protect s3 website with cloudfront lambda@edge](https://apoorv.blog/password-protect-s3-static-site/)

Before deploying changed to production website we deploy changes to preview site and test. 