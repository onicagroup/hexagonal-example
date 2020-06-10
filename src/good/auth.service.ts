import {APIGatewayProxyEvent} from "aws-lambda";
import {AppUser} from "./model";
import {Injector} from "@sailplane/injector";
import * as createError from "http-errors";
import * as middy from "middy";

/**
 * Simple start of an authorization/authentication service.
 * This implementation only works for AWS Lambdas called from API Gateway
 * with a Lambda Authorizer having already filled in the user.
 */
export class AuthService {
  /**
   * User in the currently executing context.
   * Works for Lambda because a process only handles one request at a time.
   */
  private currentUser: AppUser | undefined;

  initForLambda(event: APIGatewayProxyEvent): void {
    if (event.requestContext?.authorizer?.claims) {
      const claims = event.requestContext.authorizer.claims;
      this.currentUser = {
        id: claims['cognito:username'] || '',
        name: claims.name || '',
      };
    }
    else {
      this.destroy();
    }
  }

  destroy() {
    this.currentUser = undefined;
  }

  hasUser(): boolean {
    return !!this.currentUser;
  }

  getUser(): AppUser {
    if (this.currentUser) {
      return this.currentUser;
    }
    else {
      throw new createError.Unauthorized("No user authorized");
    }
  }
}

Injector.register(AuthService);

/**
 * Middleware for LambdaUtils to automatically manage AuthService context.
 */
export function authMiddleware() {
  const authSvc = Injector.get(AuthService)!;

  return {
    before: (handler: middy.HandlerLambda, next: middy.NextFunction) => {
      authSvc.initForLambda(handler.event);
      next();
    },
    after: (handler: middy.HandlerLambda, next: middy.NextFunction) => {
      authSvc.destroy();
      next();
    },
    onError: (handler: middy.HandlerLambda, next: middy.NextFunction) => {
      authSvc.destroy();
      next();
    }
  };
}
