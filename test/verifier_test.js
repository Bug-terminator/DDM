const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Verifier", function () {

    async function deploy() {
        const signer = await ethers.getSigner();
        const Verifier = await ethers.getContractFactory("Verifier");
        const verifier = await Verifier.deploy();
        console.log(signer.address);
        return { verifier, signer };
    }

    describe("test", function () {
        it("Should pass all the tests", async function () {
            const { verifier, signer } = await deploy();

            //https://docs.ethers.io/v4/cookbook-signing.html
            const messageHash = ethers.utils.id("Hello World");

            // Note: messageHash is a string, that is 66-bytes long, to sign the
            //       binary value, we must convert it to the 32 byte Array that
            //       the string represents
            //
            // i.e.
            //   // 66-byte string
            //   "0x592fa743889fc7f92ac2a37bb1f5ba1daf2a5c84741ca0e0061d243a2e6707ba"
            //
            //   ... vs ...
            //
            //  // 32 entry Uint8Array
            //  [ 89, 47, 167, 67, 136, 159, 199, 249, 42, 194, 163,
            //    123, 177, 245, 186, 29, 175, 42, 92, 132, 116, 28,
            //    160, 224, 6, 29, 36, 58, 46, 103, 7, 186]

            const messageHashBytes = ethers.utils.arrayify(messageHash)

            // Sign the binary data
            const flatSig = await signer.signMessage(messageHashBytes);

            // For Solidity, we need the expanded-format of a signature
            const sig = ethers.utils.splitSignature(flatSig);
            const signer_addr = await verifier.verifyHash(messageHash, sig.v, sig.r, sig.s);
            console.log(signer_addr, signer.address);
            expect(await signer_addr).to.be.equal(signer.address);
        });
    });
});
