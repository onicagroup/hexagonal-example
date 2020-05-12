import {AppUser, Package, PackageRequest} from "./model";
import * as assert from "assert";
import {expect} from "chai";
import {PackageService} from "./package.service";
import {fail} from "assert";

class MockPackageRepository {
  mockResult?: Promise<Package>;

  create(item: Package): Promise<Package> {
    assert.ok(this.mockResult);
    return this.mockResult!;
  }
}

describe('PackageService', () => {
  let packageRepo = new MockPackageRepository();
  const pkgRequest: PackageRequest = {
    name: 'Unit Test',
    contentType: 'text/plain',
    fileName: "hello-world.txt"
  };
  const appUser: AppUser = {
    id: 'utest',
    name: 'Unit Test'
  };
  const pkg: Package = {
    ...pkgRequest,
    userId: 'utest',
    userName: "Unit Test",
    createdOn: "2020-05-12T14:23:00Z",
    ttl: 120
  };

  it('is successful', async () => {
    // GIVEN
    packageRepo.mockResult = Promise.resolve(pkg);
    const uut = new PackageService(packageRepo as any);

    // WHEN
    const result = await uut.create(pkgRequest, appUser);

    // THEN
    expect(result).to.deep.equal(pkg);
  });

  it('will fail', async () => {
    // GIVEN

    packageRepo.mockResult = Promise.reject(new Error('Reject'));
    const uut = new PackageService(packageRepo as any);

    // WHEN
    try {
      await uut.create(pkgRequest, appUser);
      fail("expected to throw");
    }
    catch (error) {
      // THEN
      expect(error.toString()).to.equal("Error: Reject");
    }
  });
});
