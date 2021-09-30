import { Architecture, Runtime } from '@aws-cdk/aws-lambda';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { AttributeType, BillingMode, Table } from '@aws-cdk/aws-dynamodb';
import { CfnApplication } from '@aws-cdk/aws-sam';
import * as cdk from '@aws-cdk/core';
import { CfnOutput, RemovalPolicy } from '@aws-cdk/core';
import { todoTableName } from './variables';

export class LambdaCostStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const powerValues = '128,256,512,1024,2048'

    new CfnApplication(this, 'powerTuner', {
      location: {
          applicationId: 'arn:aws:serverlessrepo:us-east-1:451282441545:applications/aws-lambda-power-tuning',
          semanticVersion: '4.0.0'
      },
      parameters: {
          "lambdaResource": "*",
          "PowerValues": powerValues
      },
      timeoutInMinutes: 15
    })

    const todoTable = new Table(this, 'todoTable', {
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY
    })
    
    new CfnOutput(this, 'todoTableName', {
      value: todoTable.tableName
    })

    const getTodoFn = new NodejsFunction(this, 'getTodoFn', {
      runtime: Runtime.NODEJS_14_X,
      entry: `${__dirname}/../lambda-fns/get-todo/index.ts`,
      handler: 'getTodo',
      architectures: [Architecture.ARM_64],
      environment: {
        TODO_TABLE_NAME: todoTableName
      }
    })

    todoTable.grantReadData(getTodoFn)

    const createTodoFn = new NodejsFunction(this, 'createTodoFn', {
      runtime: Runtime.NODEJS_14_X,
      entry: `${__dirname}/../lambda-fns/create-todo/index.ts`,
      handler: 'createTodo',
      architectures: [Architecture.ARM_64],
      environment: {
        TODO_TABLE_NAME: todoTableName
      }
    })

    todoTable.grantReadWriteData(createTodoFn)

    const deleteTodoFn = new NodejsFunction(this, 'deleteTodoFn', {
      runtime: Runtime.NODEJS_14_X,
      entry: `${__dirname}/../lambda-fns/delete-todo/index.ts`,
      handler: 'deleteTodo',
      architectures: [Architecture.ARM_64],
      environment: {
        TODO_TABLE_NAME: todoTableName
      }
    })

    todoTable.grantReadWriteData(deleteTodoFn)
  }
}
