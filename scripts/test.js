const { Client } = require('@elastic/elasticsearch');

// 创建 Elasticsearch 客户端
const client = new Client({ node: 'http://localhost:9200' });

async function createIndex(indexName) {
    try {
        // 创建索引并定义映射
        const response = await client.indices.create({
            index: indexName,
            body: {
                mappings: {
                    properties: {
                        id:{type: 'keyword', store: true},
                        content: { type: 'text', store: false }
                    },
                    _source:{
                        enabled:false
                    }
                }
            }
        });

        console.log(`Index created: `, response);
    } catch (err) {
        console.error(`Error creating index "${indexName}": ${err}`);
    }
}

async function insertDocument(indexName, doc) {
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

async function searchDocuments(indexName, query) {
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
        // console.log(`Documents: ${JSON.stringify(response.body.hits.hits.map(hit => hit._id))}`);
    } catch (err) {
        console.error(`Error searching documents: ${err}`);
    }
}

async function test() {
    const indexName = 'my-index15';

    // 创建索引并定义映射
    await createIndex(indexName);

    // 插入文档
    await insertDocument(indexName, { _id: 1, content: 'This is the first document.' });
    await insertDocument(indexName, { _id: 2, content: 'This is the second document.' });
    await insertDocument(indexName, { _id: 3, content: 'This is the third document.' });

    // 搜索文档
    await searchDocuments(indexName, 'third');
    await searchDocuments(indexName, 'second');
    await searchDocuments(indexName, 'third');
}

// test()
const fs = require('fs')
// test();
const ipfsAPI = require('ipfs-api');

// 创建 IPFS 实例
const ipfs = ipfsAPI('localhost', '5001', { protocol: 'http' });

const main = async() => {
    // 添加文件到 IPFS
    const obj = fs.readFileSync('metadata.txt');
    const res = await ipfs.add(obj);
    console.log(res)
    // ipfs.add(obj, (err, files) => {
    //     if (err) {
    //         console.error(err);
    //         return;
    //     }

    //     console.log('File added to IPFS:', files[0].hash);
    //     const hash = files[0].hash;
    //     // 根据哈希值获取文件
    //     ipfs.get(hash, (err, files) => {
    //         if (err) {
    //             console.error(err);
    //             return;
    //         }

    //         console.log('File retrieved from IPFS:', files[0].content.toString());
    //     });
    //     console.log(1)
    // });
    console.log(2)
}

main()


