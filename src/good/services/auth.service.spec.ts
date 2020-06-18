// tslint:disable:no-unused-expression
import {authMiddleware, AuthService} from "./auth.service";
import {AppUser} from "../models";
import {expect} from "chai";
import {Injector} from "@sailplane/injector";

export const testAppUser: AppUser = {
  id: 'utest001',
  name: "Unit Test"
};

export const testLambdaEvent = {
  requestContext: {
    authorizer: {
      claims: {
        sub: testAppUser.id,
        name: testAppUser.name
      }
    }
  }
} as any;

it('authMiddleware', () => {
  const authSvc = Injector.get(AuthService)!;
  const handler = { event: testLambdaEvent } as any;

  expect(authSvc.hasUser()).to.be.false;
  authMiddleware().before(handler, () => undefined);
  expect(authSvc.getUser()).to.deep.equal(testAppUser);
  authMiddleware().after(handler, () => undefined);
  expect(authSvc.hasUser()).to.be.false;

  authMiddleware().before(handler, () => undefined);
  expect(authSvc.getUser()).to.deep.equal(testAppUser);
  authMiddleware().onError(handler, () => undefined);
  expect(authSvc.hasUser()).to.be.false;
});

describe('AuthService', () => {
  const authSvc = Injector.get(AuthService)!;

  it('#initForLambda', () => {
    // GIVEN
    expect(authSvc.hasUser()).to.be.false;

    // WHEN
    authSvc.initForLambda(testLambdaEvent);

    // THEN
    expect(authSvc.getUser()).to.deep.equal(testAppUser);
  });

  it('#destroy', () => {
    // GIVEN
    authSvc.initForLambda(testLambdaEvent);
    expect(authSvc.getUser()).to.deep.equal(testAppUser);

    // WHEN
    authSvc.destroy();

    // THEN
    expect(authSvc.hasUser()).to.be.false;
  });

  it('#getUser', () => {
    // GIVEN
    expect(authSvc.hasUser()).to.be.false;
    authSvc.initForLambda(testLambdaEvent);

    // WHEN
    const user = authSvc.getUser();

    // THEN
    expect(user).to.deep.equal(testAppUser);
  });
});
