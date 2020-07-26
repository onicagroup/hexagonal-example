import {DynamoDB} from "aws-sdk";
import {DocumentClient} from "aws-sdk/clients/dynamodb";
import {Injector} from "@sailplane/injector";
import {Package} from "../models";

const tableName = process.env.PACKAGE_TABLE_NAME || 'test-table';

/**
 * External interface to storage of "Package".
 * No business logic here - just deals with external service.
 * This implementation uses DynamoDB.
 */
export class PackageRepository {
  constructor(private dynamoDB: DynamoDB.DocumentClient) {
    if (!tableName) {
      throw Error('PACKAGE_TABLE_NAME is not defined');
    }
  }

  async create(item: Package): Promise<Package> {
    const params: DocumentClient.PutItemInput = {
      TableName: tableName,
      Item: item,
    };

    await this.dynamoDB.put(params).promise();
    return item;
  }
}

// Inject a raw DynamoDB client. Can easily replace with a mock for unit testing
// or a wrapper that enhances the default behavior.
Injector.registerConstant('DynamoDB', () => new DynamoDB.DocumentClient());
Injector.register(PackageRepository, ['DynamoDB']);
