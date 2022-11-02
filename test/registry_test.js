const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Registry", async function () {
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
      const LENGTH = 10;
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

    // it("Should be reverted when register a existed product", async function () {

    // });




  });

  describe("Withdrawals", function () {
    describe("Validations", function () {
      it("Should revert with the right error if called too soon", async function () {
        const { lock } = await loadFixture(deployOneYearLockFixture);

        await expect(lock.withdraw()).to.be.revertedWith(
          "You can't withdraw yet"
        );
      });

      it("Should revert with the right error if called from another account", async function () {
        const { lock, unlockTime, otherAccount } = await loadFixture(
          deployOneYearLockFixture
        );

        // We can increase the time in Hardhat Network
        await time.increaseTo(unlockTime);

        // We use lock.connect() to send a transaction from another account
        await expect(lock.connect(otherAccount).withdraw()).to.be.revertedWith(
          "You aren't the owner"
        );
      });

      it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
        const { lock, unlockTime } = await loadFixture(
          deployOneYearLockFixture
        );

        // Transactions are sent using the first signer by default
        await time.increaseTo(unlockTime);

        await expect(lock.withdraw()).not.to.be.reverted;
      });
    });

    describe("Events", function () {
      it("Should emit an event on withdrawals", async function () {
        const { lock, unlockTime, lockedAmount } = await loadFixture(
          deployOneYearLockFixture
        );

        await time.increaseTo(unlockTime);

        await expect(lock.withdraw())
          .to.emit(lock, "Withdrawal")
          .withArgs(lockedAmount, anyValue); // We accept any value as `when` arg
      });
    });

    describe("Transfers", function () {
      it("Should transfer the funds to the owner", async function () {
        const { lock, unlockTime, lockedAmount, owner } = await loadFixture(
          deployOneYearLockFixture
        );

        await time.increaseTo(unlockTime);

        await expect(lock.withdraw()).to.changeEtherBalances(
          [owner, lock],
          [lockedAmount, -lockedAmount]
        );
      });
    });
  });
});
