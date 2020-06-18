/*
 * This is the handler for entry from AWS Lambda.
 * If you wanted to support other entry points, just make other files
 * for those handlers but use the same PackageService.
 */
import {APIGatewayProxyEvent} from "aws-lambda";
import {Injector} from "@sailplane/injector";
import * as LambdaUtils from "@sailplane/lambda-utils";
import * as HttpStatus from "http-status-codes";
import {authMiddleware, AuthService} from "../services/auth.service";
import {PackageService} from "../services/package.service";
import {PackageRequest} from "../models";

/**
 * AWS Lambda handler.
 * Deals with Lambda, API Gateway, and Cognito interfacing, then
 * calls the business logic to deal with the actual request.
 *
 * Notice most of this is dealing with error handling and API Gateway.
 * See below for an alternative using @sailplane/lambda-utils to remove the boilerplate.
 */
export const createPackageHandler = async (event: APIGatewayProxyEvent) => {
  const authSvc = Injector.get(AuthService)!;
  authSvc.initForLambda(event);

  try {
    const request = JSON.parse(event.body || '{}') as PackageRequest;
    const result = await Injector.get(PackageService)!.create(request);

    return {
      statusCode: HttpStatus.OK,
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
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        body: error.toString()
      };
    }
  }
  finally {
    authSvc.destroy();
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
  return Injector.get(PackageService)!.create(request);
}).use(authMiddleware());
