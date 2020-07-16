import {Injector} from "@sailplane/injector";
import * as assert from "assert";
import {fail} from "assert";
import {expect} from "chai";
import {Package, PackageRequest} from "../models";
import {AuthService} from "./auth.service";
import {PackageService} from "./package.service";
import {testAppUser, testLambdaEvent} from "./auth.service.spec";

class MockPackageRepository {
  mockResult?: Promise<Package>;

  create(item: Package): Promise<Package> {
    assert.ok(this.mockResult);
    return this.mockResult!;
  }
}

describe('PackageService', () => {
  const authSvc = Injector.get(AuthService)!;
  const packageRepo = new MockPackageRepository();
  const pkgRequest: PackageRequest = {
    name: 'Unit Test',
    contentType: 'text/plain',
    fileName: "hello-world.txt"
  };
  const pkg: Package = {
    ...pkgRequest,
    userId: testAppUser.id,
    userName: testAppUser.name,
    createdOn: "2020-05-12T14:23:00Z",
    ttl: 120
  };

  beforeEach(() => {
    authSvc.initForLambda(testLambdaEvent);
  });

  it('is successful', async () => {
    // GIVEN
    packageRepo.mockResult = Promise.resolve(pkg);
    const uut = new PackageService(packageRepo as any, authSvc);

    // WHEN
    const result = await uut.create(pkgRequest);

    // THEN
    expect(result).to.deep.equal(pkg);
  });

  it('will fail', async () => {
    // GIVEN

    packageRepo.mockResult = Promise.reject(new Error('Reject'));
    const uut = new PackageService(packageRepo as any, authSvc);

    // WHEN
    try {
      await uut.create(pkgRequest);
      fail("expected to throw");
    }
    catch (error) {
      // THEN
      expect(error.toString()).to.equal("Error: Reject");
    }
  });
});
