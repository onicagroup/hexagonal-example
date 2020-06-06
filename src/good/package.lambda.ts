/*
 * This is the handler for entry from AWS Lambda.
 * If you wanted to support other entry points, just make other files
 * for those handlers but use the same PackageService.
 */
import {APIGatewayProxyEvent} from "aws-lambda";
import {Injector} from "@sailplane/injector";
import * as LambdaUtils from "@sailplane/lambda-utils";
import {PackageService} from "./package.service";
import {AppUser, PackageRequest} from "./model";

const HTTP_OK = 200;
const HTTP_INTERNAL_ERROR = 500;

/**
 * AWS Lambda handler.
 * Deals with Lambda, API Gateway, and Cognito interfacing, then
 * calls the business logic to deal with the actual request.
 *
 * Notice most of this is dealing with error handling and API Gateway.
 * See below for an alternative using @sailplane/lambda-utils to remove the boilerplate.
 */
export const createPackageHandler = async (event: APIGatewayProxyEvent) => {
  try {
    const request = JSON.parse(event.body || '{}') as PackageRequest;

    // If any more complex than this, abstract away into an AuthorizerService.
    const claims = event.requestContext.authorizer?.claims || {};
    const user: AppUser = {
      id: claims['cognito:username'] || '',
      name: claims.name || '',
    };

    const result = await Injector.get(PackageService)!.create(request, user);

    return {
      statusCode: HTTP_OK,
      body: JSON.stringify(result)
    };
  }
  catch (error) {
    if (error.statusCode) {
      return {
        statusCode: error.statusCode,
        body: error.toString()
      };
    }
    else {
      return {
        statusCode: HTTP_INTERNAL_ERROR,
        body: error.toString()
      };
    }
  }
};

/**
 * AWS Lambda handler.
 * Deals with Lambda, API Gateway, and Cognito interfacing, then
 * calls the business logic to deal with the actual request.
 *
 * Same as above, but uses @sailplane/lambda-utils
 * to deal with error handling and returning results.
 */
export const createPackageHandlerWithoutBoilerplate = LambdaUtils.wrapApiHandler(
  async (event: LambdaUtils.APIGatewayProxyEvent
) => {
  const request = event.body as PackageRequest;

  // If any more complex than this, abstract away into an AuthorizerService.
  const claims = event.requestContext.authorizer?.claims || {};
  const user: AppUser = {
    id: claims['cognito:username'] || '',
    name: claims.name || '',
  };

  return Injector.get(PackageService)!.create(request, user);
});
