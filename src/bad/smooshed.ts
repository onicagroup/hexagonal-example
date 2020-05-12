/*
 * This is the _not_ hexagonal example.
 * All concerns are smooshed together into one mess.
 */
import {DynamoDB} from "aws-sdk";
import {DocumentClient, ScanOutput} from "aws-sdk/clients/dynamodb";
import {APIGatewayProxyEvent} from "aws-lambda";
import {MillisecondsInSecond, SecondsInMinute} from "temporal-constants";
import {Seconds} from "temporal-types";

const dynamoClient = new DynamoDB.DocumentClient();

/** Request body for the RESTFul API - not bad */
export interface PackageRequest {
  name: string;
  description?: string;
  contentType?: string;
  fileName?: string;
}

/** Implementation detail right in the name - BAD */
export interface DynamoDBPackage extends PackageRequest {
  userId: string;
  userName: string;
  createdOn: string;
  ttl?: number;
}

/** AWS Lambda function entry point */
export const handler = async (event: APIGatewayProxyEvent) => {
  const request = JSON.parse(event.body || '{}') as PackageRequest;
  const claims = event.requestContext.authorizer?.claims || {};

  if (!request.name || !request.description || !request.contentType || !request.fileName) {
    return {
      statusCode: 400,
      body: 'Request validation error'
    };
  }

  // Bad: Dealing with DynamoDB details in handler
  const tableName = process.env.TABLE_NAME;
  const epochTime = Math.floor(Date.now() / MillisecondsInSecond) as Seconds;
  const entry: DynamoDBPackage = {
    ...request,
    userId: claims['cognito:username'] || '',
    userName: claims.name || '',
    createdOn: new Date().toISOString(),
    ttl: epochTime + SecondsInMinute
  };

  try {
    await addPackage(dynamoClient, tableName, entry);
    return {
      statusCode: 200,
      body: JSON.stringify(entry)
    };
  } catch (error) {
    if (error.message === 'Name already exists') {
      return {
        statusCode: 401,
        body: error.message
      };
    }
    return {
      statusCode: 500,
      body: error.message
    };
  }
};

// Good: Helper function to update DynamoDB
// Bad: In same file with everything else & returns DynamoDB specific data type
async function addPackage(client: DocumentClient, tableName: string | undefined, packageUpload: DynamoDBPackage): Promise<ScanOutput> {
  if (!tableName) {
    throw Error('tableName is not defined');
  }

  const params: DocumentClient.PutItemInput = {
    TableName: tableName,
    Item: packageUpload,
  };

  return client.put(params).promise();
}
