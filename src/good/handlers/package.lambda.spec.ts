import {APIGatewayProxyEvent} from "aws-lambda";
import {Injector} from "@sailplane/injector";
import {expect} from "chai";
import * as assert from "assert";
import {AuthService} from "../services/auth.service";
import {createPackageHandler} from "./package.lambda";
import {Package, PackageRequest} from "../models";

class MockPackageService {
  mockResult?: Promise<Package>;

  create(request: PackageRequest, _: AuthService): Promise<Package> {
    assert.ok(request);
    assert.ok(this.mockResult);
    return this.mockResult!;
  }
}

describe('#createPackageHandler', () => {
  const packageSvc = new MockPackageService();
  const pkgRequest: PackageRequest = {
    name: 'Unit Test',
    contentType: 'text/plain',
    fileName: "hello-world.txt"
  };
  const pkg: Package = {
    ...pkgRequest,
    userId: 'utest',
    userName: "Unit Test",
    createdOn: "2020-05-12T14:23:00Z",
    ttl: 120
  };

  beforeEach(() => {
    Injector.bottle.factory('PackageService', () => packageSvc);
  });

  it('is successful', async () => {
    // GIVEN
    packageSvc.mockResult = Promise.resolve(pkg);

    // WHEN
    const apiResult = await createPackageHandler({
      body: JSON.stringify(pkgRequest),
      requestContext: {
        authorizer: {
          claims: "valid"
        }
      }
    } as any as APIGatewayProxyEvent);

    // THEN
    expect(apiResult).to.deep.equal({
      statusCode: 200,
      body: JSON.stringify(pkg)
    });
  });

  it('will fail', async () => {
    // GIVEN
    packageSvc.mockResult = Promise.reject(new Error('Reject'));

    // WHEN
    const apiResult = await createPackageHandler({
      body: JSON.stringify(pkgRequest),
      requestContext: {
        authorizer: {
          claims: "valid"
        }
      }
    } as any as APIGatewayProxyEvent);

    // THEN
    expect(apiResult).to.deep.equal({
      statusCode: 500,
      body: "Error: Reject"
    });
  });
});
