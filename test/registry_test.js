const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Registry", function () {
  
  async function deploy() {
    const signer = await ethers.getSigner();
    const Registry = await ethers.getContractFactory("Registry");
    const registry = await Registry.deploy();
    return { registry, signer };
  }

  describe("test", function () {
    it("Should pass all the tests", async function () {
      const { registry } = await deploy();
      const type = '0x00';
      const LENGTH = 100;
      const HALF = LENGTH/2;
      let hash = [];
      let desiredResult = [];

      // create a random hash array with length = LENGTH
      for (i = 0; i < LENGTH; ++i) {
        hash.push(ethers.utils.hexlify(ethers.utils.randomBytes(32)));
      }
      console.log(hash);

      // register HALF different products
      for (i = 0; i < HALF; i++) {
        await expect(registry.register(type, hash[i])).not.to.be.reverted;
        desiredResult.push(hash[i]);
        // check the desired result
        expect(await registry.query(type)).to.deep.equal(desiredResult);
      }

      // any hash whose index under HALF shouldn't be registed any more
      for (i = 0; i < HALF; i++) {
        await expect(registry.register(type, hash[i])).to.be.
          revertedWith("Product has already been registered.");
      }

      // update HALF registed hash with another HALF one by one, check the result
      for (i = 0; i < HALF; i++) {
        await expect(registry.update(hash[i], hash[i + HALF])).not.to.be.reverted;
        desiredResult[i] = hash[i + HALF];
        expect(await registry.query(type)).to.deep.equal(desiredResult);
      }
      console.log(desiredResult);
      
      // delist all existed product and other HALF non-existed product, 
      // the latter should be reverted with certain message
      for (i = HALF; i < LENGTH; i++) {
        await expect(registry.delist(hash[i])).not.to.be.reverted;
        desiredResult.shift();
        expect(await registry.query(type)).to.deep.equal(desiredResult);
      }

      for (i = 0; i < LENGTH; i++) { // all products is delisted
        await expect(registry.delist(hash[i])).to.be.revertedWith("Product doesn't exist.");
      }
    });
  });
});
