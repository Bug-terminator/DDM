const fs = require('fs');
const registry_abi = require('../artifacts/contracts/Registry.sol/Registry.json')
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
    // key: fs.readFileSync('private-key'),
    // cert: fs.readFileSync('public-cert'),
    rejectUnauthorized: false
};
const $$ = ethers.utils.parseUnits;
const $ = ethers.utils.formatUnits;
const contract_addresses = ['0x5FbDB2315678afecb367f032d93F642f64180aa3' ,'0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512' ,'0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'];
const provider = new ethers.providers.JsonRpcProvider();
const wallet = new ethers.Wallet('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d');
const signer = wallet.connect(provider);
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

async function getInput(prompt) {
    return new Promise((resolve, reject) => {
      rl.question(prompt ,(input) => {
        resolve(input);
      });
    });
}

async function verify_signiture(verifier, msgHash, sig, address) {
    await sleep(1000);
    const addr = await verifier.verifyHash(msgHash, sig.v, sig.r, sig.s);
    // console.log(addr);
    return true;
}

async function createIndex(client, indexName) {
    try {
        // 创建索引并定义映射
        const response = await client.indices.create({
            index: indexName,
            body: {
                mappings: {
                    properties: {
                        content: { type: 'text', store: false }
                    }
                }
            }
        });

        console.log(`Index created: `, response);
    } catch (err) {
        console.error(`Error creating index "${indexName}": ${err}`);
    }
}

async function insertDocument(client, indexName, doc) {
    try {
        const response = await client.index({
            index: indexName,
            body: { content: doc.content },
            id: doc._id
        });
        console.log(`Document inserted: `, response);
    } catch (err) {
        console.error(`Error inserting document: ${err}`);
    }
}

async function searchDocuments(client, indexName, query) {
    try {
        const response = await client.search({
            index: indexName,
            body: {
                query: {
                    match: {
                        content: query
                    }
                }
            }
        });
        console.log(`Documents found:`, response.hits.hits);
        return response.hits.hits
        // console.log(`Documents: ${JSON.stringify(response.body.hits.hits.map(hit => hit._id))}`);
    } catch (err) {
        console.error(`Error searching documents: ${err}`);
    }
}



module.exports = {getInput, signer, createIndex, insertDocument, searchDocuments, sleep, fs, PORT, HOST, rl, options, $$, $, contract_addresses, provider, sign_msg, verify_signiture,registry_abi, verifier_abi, orderbook_abi };