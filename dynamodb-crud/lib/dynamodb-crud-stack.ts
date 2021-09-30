import { AttributeType, BillingMode, Table } from '@aws-cdk/aws-dynamodb';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { Architecture, Runtime } from '@aws-cdk/aws-lambda';
import * as cdk from '@aws-cdk/core';
import { CfnOutput, RemovalPolicy } from '@aws-cdk/core';
import { todoTableName } from './variables'

export class DynamodbCrudStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const todoTable = new Table(this, 'todoTable', {
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY
    })

    todoTable.addGlobalSecondaryIndex({
      indexName: 'ownerIndex',
      partitionKey: {
        name: 'owner',
        type: AttributeType.STRING
      }
    })

    new CfnOutput(this, 'todoTableName', {
      value: todoTable.tableName
    })

    const createTodoFn = new NodejsFunction(this, 'createTodoFn', {
      runtime: Runtime.NODEJS_14_X,
      entry: `${__dirname}/../lambda-fns/create/index.ts`,
      handler: 'createTodo',
      architectures: [Architecture.ARM_64],
      environment: {
        TODO_TABLE_NAME: todoTableName
      }
    })

    todoTable.grantReadWriteData(createTodoFn)

    const getAllTodoFn = new NodejsFunction(this, 'getAllTodoFn', {
      runtime: Runtime.NODEJS_14_X,
      entry: `${__dirname}/../lambda-fns/getAll/index.ts`,
      handler: 'getAll',
      architectures: [Architecture.ARM_64],
      environment: {
        TODO_TABLE_NAME: todoTableName
      }
    })

    todoTable.grantReadData(getAllTodoFn)

    const getOneTodoFn = new NodejsFunction(this, 'getOneTodoFn', {
      runtime: Runtime.NODEJS_14_X,
      entry: `${__dirname}/../lambda-fns/getOne/index.ts`,
      handler: 'getOne',
      architectures: [Architecture.ARM_64],
      environment: {
        TODO_TABLE_NAME: todoTableName
      }
    })

    todoTable.grantReadData(getOneTodoFn)

    const updateTodoFn = new NodejsFunction(this, 'updateTodoFn', {
      runtime: Runtime.NODEJS_14_X,
      entry: `${__dirname}/../lambda-fns/update/index.ts`,
      handler: 'update',
      architectures: [Architecture.ARM_64],
      environment: {
        TODO_TABLE_NAME: todoTableName
      }
    })

    todoTable.grantReadWriteData(updateTodoFn)

    const deleteTodoFn = new NodejsFunction(this, 'deleteTodoFn', {
      runtime: Runtime.NODEJS_14_X,
      entry: `${__dirname}/../lambda-fns/delete/index.ts`,
      handler: 'deleteTodo',
      architectures: [Architecture.ARM_64],
      environment: {
        TODO_TABLE_NAME: todoTableName
      }
    })

    todoTable.grantReadWriteData(deleteTodoFn)

    const tableWithIndex = Table.fromTableAttributes(this, 'tableWithIndex', {
      tableName: todoTableName,
      globalIndexes: ['ownerIndex']
    })

    const queryTodoFn = new NodejsFunction(this, 'queryTodoFn', {
      runtime: Runtime.NODEJS_14_X,
      entry: `${__dirname}/../lambda-fns/query/index.ts`,
      handler: 'queryTodo',
      architectures: [Architecture.ARM_64],
      environment: {
        TODO_TABLE_NAME: todoTableName
      }
    })

    tableWithIndex.grantReadData(queryTodoFn)
  }
}
