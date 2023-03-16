const { Client } = require('@elastic/elasticsearch');
const util = require('../SDPP_optimized/util')
const { ethers } = require('hardhat')
const hre = require("hardhat");

const fs = require('fs')
// test();
const ipfsAPI = require('ipfs-api');
const { json } = require('express/lib/response');

// 创建 IPFS 实例
const ipfs = ipfsAPI('localhost', '5001', { protocol: 'http' });
const indexName = 'my-index15';
// 创建 Elasticsearch 客户端
const es_client = new Client({ node: 'http://localhost:9200' });

const verifier = new ethers.Contract(util.contract_addresses[1],
    util.verifier_abi.abi
    , util.signer)
const registry_contract = new ethers.Contract(util.contract_addresses[0],
    util.registry_abi.abi, util.signer
)

const query = async (query) => {
    // const query = await util.getInput("Search the data you interested: ");
    const res = await util.searchDocuments(es_client, indexName, query);
    // res = res.hits.hits
    // console.log(res)
    var ret
    for (i = 0; i < res.length; ++i) {
        const index = res[i]._id;
        try {
            var hash = await registry_contract.query(index)
        } catch (err) {
            console.log(err)
        }
        hash = ethers.utils.toUtf8String(hash)
        ret = (await ipfs.get(hash))[0].content.toString()
        console.log(ret)
        // console.log(hash)
        // ans.push(res[0].h)
    }
    return JSON.parse(ret);
}

const upload = async (metadata, is_plagiarizm = false) => {
    // const metadata = await util.getInput("Please enter the metadata: ");
    const obj = Buffer.from(metadata);
    var hash = (await ipfs.add(obj))[0].hash;
    console.log('File added to IPFS:', hash);
    hash = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(hash))
    try {
        const txn = await registry_contract.register(hash, is_plagiarizm);
        await txn.wait();
    } catch (err) {
        console.log(err)
    }
    const docID = await registry_contract.getIndexFromHash(hash);
    metadata = JSON.parse(metadata)
    console.log(metadata)
    await util.insertDocument(es_client, indexName, { _id: docID.toNumber(), content: metadata.description })
    return docID;
}

const delist = async (metadata) => {
    // const metadata = await util.getInput("Please enter the metadata you want to delete: ");

    const res = await util.searchDocuments(es_client, indexName, JSON.parse(metadata).description);
    const index = res[0]._id
    var hash;
    try {
        hash = await registry_contract.query(index)
    } catch (err) {
        console.log(err)
    }
    cid = ethers.utils.toUtf8String(hash)
    const ret = (await ipfs.get(cid))[0].content.toString()
    var doc_id = -1;
    if (ret != metadata) {
        console.log(ret)
        console.log(metadata)
        console.log("ret != metadata)")
        return doc_id
    }

    try {
        await ipfs.files.rm('/IPFS/' + cid, { recursive: true })
        try {
            doc_id = await registry_contract.getIndexFromHash(ethers.utils.hexlify(ethers.utils.toUtf8Bytes(cid)))
        } catch (err) {
            console.log(err)
        }
        try {
            await registry_contract.delist(hash)
        } catch (err) {
            console.log(err)
        }
        await es_client.delete({
            index: indexName,
            id: index
        })
    } catch (err) {
        console.log(err)
    }
    return doc_id
}

module.exports = {
    query,
    upload,
    delist
};
// util.rl.setPrompt("Please enter the number of your operation: 1 for upload, 2 for query, 3 for delete:");
// util.rl.prompt();

// util.rl.on('line', async (input) => {
//     if (input == '1') {
//         await upload()
//     } else if (input == '2') {
//         await query()
//     } else if (input == '3') {
//         await delist()
//     }
//     util.rl.prompt()
// }).on('close', () => console.log("exit"))

