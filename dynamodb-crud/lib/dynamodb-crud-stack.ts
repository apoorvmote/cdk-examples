import { Stack, StackProps, CfnOutput, RemovalPolicy } from "aws-cdk-lib"
import { Construct } from "constructs"
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { todoTableName } from './variables'

export class DynamodbCrudStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
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
      architecture: Architecture.ARM_64,
      environment: {
        TODO_TABLE_NAME: todoTableName
      }
    })

    todoTable.grantReadWriteData(createTodoFn)

    const getAllTodoFn = new NodejsFunction(this, 'getAllTodoFn', {
      runtime: Runtime.NODEJS_14_X,
      entry: `${__dirname}/../lambda-fns/getAll/index.ts`,
      handler: 'getAll',
      architecture: Architecture.ARM_64,
      environment: {
        TODO_TABLE_NAME: todoTableName
      }
    })

    todoTable.grantReadData(getAllTodoFn)

    const getOneTodoFn = new NodejsFunction(this, 'getOneTodoFn', {
      runtime: Runtime.NODEJS_14_X,
      entry: `${__dirname}/../lambda-fns/getOne/index.ts`,
      handler: 'getOne',
      architecture: Architecture.ARM_64,
      environment: {
        TODO_TABLE_NAME: todoTableName
      }
    })

    todoTable.grantReadData(getOneTodoFn)

    const updateTodoFn = new NodejsFunction(this, 'updateTodoFn', {
      runtime: Runtime.NODEJS_14_X,
      entry: `${__dirname}/../lambda-fns/update/index.ts`,
      handler: 'update',
      architecture: Architecture.ARM_64,
      environment: {
        TODO_TABLE_NAME: todoTableName
      }
    })

    todoTable.grantReadWriteData(updateTodoFn)

    const deleteTodoFn = new NodejsFunction(this, 'deleteTodoFn', {
      runtime: Runtime.NODEJS_14_X,
      entry: `${__dirname}/../lambda-fns/delete/index.ts`,
      handler: 'deleteTodo',
      architecture: Architecture.ARM_64,
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
      architecture: Architecture.ARM_64,
      environment: {
        TODO_TABLE_NAME: todoTableName
      }
    })

    tableWithIndex.grantReadData(queryTodoFn)
  }
}
