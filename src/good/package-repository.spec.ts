process.env.PACKAGE_TABLE_NAME = "TABLE_NAME";

import {Package} from "./model";
import * as assert from "assert";
import {expect} from "chai";
import {fail} from "assert";
import {PackageRepository} from "./package-repository";

const testPkg: Package = {
  name: 'Unit Test',
  contentType: 'text/plain',
  fileName: "hello-world.txt",
  userId: 'utest',
  userName: "Unit Test",
  createdOn: "2020-05-12T14:23:00Z",
  ttl: 120
};

class MockDynamoDB {
  mockResult?: Promise<Package>;

  put(params: any) {
    assert.ok(this.mockResult);
    expect(params.TableName).to.equal(process.env.PACKAGE_TABLE_NAME);
    expect(params.Item).to.deep.equal(testPkg);
    return {
      promise: () => this.mockResult!
    };
  }
}

describe('PackageRepository', () => {
  let dynamoDB = new MockDynamoDB();

  it('is successful', async () => {
    // GIVEN
    dynamoDB.mockResult = Promise.resolve(testPkg);
    const uut = new PackageRepository(dynamoDB as any);

    // WHEN
    const result = await uut.create(testPkg);

    // THEN
    expect(result).to.deep.equal(testPkg);
  });

  it('will fail', async () => {
    // GIVEN

    dynamoDB.mockResult = Promise.reject(new Error('Reject'));
    const uut = new PackageRepository(dynamoDB as any);

    // WHEN
    try {
      const result = await uut.create(testPkg);
      fail("expected to throw");
    }
    catch (error) {
      // THEN
      expect(error.toString()).to.equal("Error: Reject");
    }
  });
});
