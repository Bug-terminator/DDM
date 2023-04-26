const express = require('express');
const fs = require('fs');
const app = express();
const cors = require('cors');

const port = 3001;

app.use(cors());

app.get('/download/:chunk', (req, res) => {
  const chunk = parseInt(req.params.chunk);
  const filePath = './file.txt';

  fs.stat(filePath, (err, stats) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
      return;
    }

    const fileSize = stats.size;
    const chunkSize = fileSize / 10; // 你可以自定义分段大小

    const start = chunk * chunkSize;
    const end = Math.min(fileSize - 1, (chunk + 1) * chunkSize - 1);

    if (start > end) {
      res.sendStatus(416); // 请求范围无效
      return;
    }

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
    res.setHeader('Content-Length', end - start + 1);

    const fileStream = fs.createReadStream(filePath, { start, end });
    fileStream.pipe(res);
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
