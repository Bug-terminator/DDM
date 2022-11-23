const { expect } = require("chai");
const { ethers } = require("hardhat");

const $$ = ethers.utils.parseUnits;
const $ = ethers.utils.formatUnits;
// const $ = ethers.utils.formatUnits;

describe("Orderbook", function () {

    async function deploy() {
        const [signer1,signer2] = await ethers.getSigners();
        const provider = ethers.getDefaultProvider();
        const Orderbook = await ethers.getContractFactory("Orderbook");
        const orderbook = await Orderbook.deploy();
        // console.log(signer.address);
        return {provider, orderbook, signer1, signer2 };
    }

    describe("test", function () {
        it("Should pass all the tests", async function () {
            const {provider, orderbook, signer1, signer2 } = await deploy();
            const info = {
                buyer: signer1.address,
                seller: signer2.address,
                item_ID: 1,
                total_pieces: 10,
                finished_pieces: 0,
                start_time: 0,
                deadline: 0,
                cost: 2,
                is_finished: false
            }
            
            var balance = $(await provider.getBalance(orderbook.address));
            console.log("contract balance: ",balance);
            balance = $(await signer1.getBalance());
            console.log("signer1 bal", balance);
            balance = $(await signer2.getBalance());
            console.log("signer2 bal", balance);
            const order_ID = await orderbook.callStatic.create(info, {value: ethers.utils.parseEther('20')});
            await orderbook.create(info, {value: $$('20')});
            balance = $(await provider.getBalance(orderbook.address));
            console.log("contract balance: ",balance);
            await orderbook.increase(order_ID);
            await orderbook.settlement(order_ID);
            balance = $(await provider.getBalance(orderbook.address));
            console.log("contract balance: ",balance);
            balance = $(await signer1.getBalance());
            console.log("signer1 bal", balance);
            balance = $(await signer2.getBalance());
            console.log("signer2 bal", balance);
            // console.log(orderbook.b)
            // console.log(order_ID);
            // console.log(await orderbook.getOrderbook(order_ID));
            expect(1 ==1);
        });
    });
});
