const express = require('express');
const multer = require('multer');
const { Minhash } = require('minhash');
const fs = require('fs');
const path = require('path');
const redis = require('redis');
const { promisify } = require('util');
const cors = require('cors');
const app = express();
const { query, upload, delist } = require('../searcher/searcher_publisher')
// const upload = multer({ dest: 'uploads/' });

const storage = multer.memoryStorage();
const upload_param = multer({ storage: storage })

const threshold_low = 0.2;
const threshold_high = 0.8;

function simpleStringHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // 转换为32位整数
  }
  return Math.abs(hash);
}

app.use(cors()); // 使用 CORS 中间件

// 初始化 Redis 客户端
const redisClient = redis.createClient();

const main = async () => {
  await redisClient.connect();
  redisClient.on('ready', () => {
    console.log('Redis client is ready');
  });

  redisClient.on('error', (err) => {
    console.error('Error connecting to Redis:', err);
  });

  // 计算 k-shingles
  function getKShingles(text, k = 5) {
    const shingles = new Set();
    for (let i = 0; i <= text.length - k; i++) {
      shingles.add(text.slice(i, i + k));
    }
    return shingles;
  }

  // 计算文件的 MinHash 签名
  function computeMinHash(fileContents) {
    const kShingles = getKShingles(fileContents);
    const minHash = new Minhash();
    for (const shingle of kShingles) {
      minHash.update(shingle);
    }
    return minHash;
  }

  // 计算两个 MinHash 签名之间的 Jaccard index
  function jaccardIndex(minHash1, minHash2) {
    return minHash1.jaccard(minHash2);
  }

  // 文件上传接口
  app.post('/upload', upload_param.fields([{ name: 'metadata', maxCount: 1 }, { name: 'original', maxCount: 1 }]), async (req, res) => {
    try {
      const metadataContents = req.files['metadata'][0].buffer.toString('utf8');
      const originalContents = req.files['original'][0].buffer.toString('utf8');

      console.log(metadataContents, originalContents)
      const minHash = computeMinHash(originalContents);
      var is_plagiarizm = false;
      let uniqueness = 1;
      // 获取所有的 MinHash 签名
      // const keys = await promisify(redisClient.keys).bind(redisClient)('*');
      const keys = await redisClient.keys("*")
      for (const key of keys) {
        const existingMinHashData = await redisClient.get(key);
        const existingMinHash = JSON.parse(existingMinHashData);
        const jaccard = jaccardIndex(minHash, existingMinHash);
        uniqueness = Math.min(uniqueness, 1 - jaccard);
      }

      // console.log(0, JSON.stringify(minHash))
      // 保存 MinHash 签名
      if (uniqueness < threshold_low) {
        is_plagiarizm = true;
      }
      const doc_id = await upload(metadataContents, is_plagiarizm);
      await redisClient.set(doc_id.toString(), JSON.stringify(minHash));

      // 返回独特性指数
      res.json({ uniqueness });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error processing file');
    }
  });


  app.get('/search', async (req, res) => {
    const q = req.query.query;
    try {
      const result = await query(q)
      // const results = performSearch(query);
      res.json({ success: true, result: result });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error performing search');
    }
  });

  app.post('/delist', upload_param.single('delistMetadata'), async (req, res) => {
    try {
      const delistMetadataContents = req.file.buffer.toString('utf8');
      const doc_id = await delist(delistMetadataContents)
      if (doc_id != -1) {
        try { await redisClient.del(doc_id.toString()) } catch (err) { console.log(err) }
      }
      res.json({ success: true, message: 'File delisted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error de-listing file');
    }
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

main();
