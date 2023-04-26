const downloadButton = document.getElementById('download');
const continueButton = document.getElementById('continue');
const outputElement = document.getElementById('output');

let currentChunk = 0;
const totalChunks = 10;

downloadButton.addEventListener('click', () => {
    downloadChunk(currentChunk);
});

continueButton.addEventListener('click', () => {
    currentChunk++;
    downloadChunk(currentChunk);
});

function downloadChunk(chunk) {
    if (chunk >= totalChunks) {
        alert('下载完成！');
        continueButton.disabled = true;
        return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open('GET', `http://localhost:3001/download/${chunk}`, true);
    xhr.setRequestHeader('Range', `bytes=${chunk * 10}-${(chunk + 1) * 10 - 1}`);

    xhr.onload = function () {
        if (this.status === 200) {
            const downloadedChunk = this.responseText;
            outputElement.textContent += downloadedChunk;
            if (currentChunk < totalChunks - 1) {
                continueButton.disabled = false;
            }else alert("Download finished")
        } else {
            alert(`下载错误: ${this.status}`);
        }
    };

    xhr.onerror = function () {
        alert('请求错误，请检查服务器和网络连接。');
    };

    xhr.send();
    continueButton.disabled = true;
}

