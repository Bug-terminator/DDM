const fs = require('fs');
const verifier_abi = require('../artifacts/contracts/Verifier.sol/Verifier.json');
const orderbook_abi = require('../artifacts/contracts/Orderbook.sol/Orderbook.json');
const { ethers } = require("hardhat");
const PORT = 1234;
const HOST = 'localhost';
const readline = require('readline');
const rl = readline.createInterface(
    process.stdin, process.stdout);
// Pass the certs to the server and let it know to process even unauthorized certs. 
const options = {
    key: fs.readFileSync('private-key'),
    cert: fs.readFileSync('public-cert'),
    rejectUnauthorized: false
};
const $$ = ethers.utils.parseUnits;
const $ = ethers.utils.formatUnits;
const contract_addresses = ['0x5FbDB2315678afecb367f032d93F642f64180aa3', '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512' ,'0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'];
const provider = new ethers.providers.JsonRpcProvider();

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function sign_msg(signer, msg) {
    const messageHash = ethers.utils.id(msg);
    const messageHashBytes = ethers.utils.arrayify(messageHash)
    // Sign the binary data
    const flatSig = await signer.signMessage(messageHashBytes);
    await sleep(1000);
    return flatSig;
}

async function verify_signiture(verifier, msgHash, sig, address) {
    await sleep(1000);
    const addr = await verifier.verifyHash(msgHash, sig.v, sig.r, sig.s);
    // console.log(addr);
    return true;
}



module.exports = { sleep, fs, PORT, HOST, rl, options, $$, $, contract_addresses, provider, sign_msg, verify_signiture, verifier_abi, orderbook_abi };