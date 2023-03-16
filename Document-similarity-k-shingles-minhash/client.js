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
          document.getElementById('response-container').innerText = JSON.stringify(data, null, 2);
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
