document.getElementById('upload-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const metadataFile = document.getElementById('metadata-file').files[0];
    const originalFile = document.getElementById('original-file').files[0];

    const formData = new FormData();
    formData.append('metadata', metadataFile);
    formData.append('original', originalFile);

    try {
        const response = await fetch('http://localhost:3000/upload', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            document.getElementById('response-container').innerText = JSON.stringify(data, null, 2);
        } else {
            alert('Error uploading files');
        }
    } catch (err) {
        console.error(err);
        alert('Error uploading files');
    }
});

document.getElementById('query-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = document.getElementById('query-input').value;

    try {
        const response = await fetch(`http://localhost:3000/search?query=${query}`, {
            method: 'GET'
        });

        if (response.ok) {
            const data = await response.json();
            console.log(data.result)
            item = data.result
            const container = document.getElementById('response-container');
            container.innerHTML = ''; // 清空容器中的内容
            //   data.result.forEach((item, index) => {
            // 创建展示JSON数据的pre元素
            const pre = document.createElement('pre');
            pre.innerText = JSON.stringify(item, null, 2);
            container.appendChild(pre);

            // 创建下载按钮
            const downloadBtn = document.createElement('button');
            downloadBtn.innerText = '下载';
            downloadBtn.style.margin = '10px';
            downloadBtn.style.padding = '5px';
            downloadBtn.style.backgroundColor = 'blue';
            downloadBtn.style.color = 'white';
            downloadBtn.style.border = 'none';
            downloadBtn.style.borderRadius = '5px';
            downloadBtn.style.cursor = 'pointer';
            downloadBtn.setAttribute('data-json', JSON.stringify(item));
            downloadBtn.addEventListener('click', async () => {
                window.open('file:///C:/Users/litang/lt_ddm/Document-similarity-k-shingles-minhash/Splited_download/index.html', '_blank')
            });
            console.log(1)
            container.appendChild(downloadBtn);
            // });
            // document.getElementById('response-container').innerText = JSON.stringify(data, null, 2);
        } else {
            alert('Error performing search');
        }
    } catch (err) {
        console.error(err);
        alert('Error performing search');
    }
});

document.getElementById('delist-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const delistMetadataFile = document.getElementById('delist-metadata-file').files[0];

    const formData = new FormData();
    formData.append('delistMetadata', delistMetadataFile);

    try {
        const response = await fetch('http://localhost:3000/delist', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            document.getElementById('response-container').innerText = JSON.stringify(data, null, 2);
        } else {
            alert('Error de-listing file');
        }
    } catch (err) {
        console.error(err);
        alert('Error de-listing file');
    }
});
