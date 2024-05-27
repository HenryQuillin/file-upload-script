console.log('starting');

const uploadButton = document.getElementById('upload-label');
const fileInput = document.getElementById('fileupload_custom');
const downloadLinkField = document.getElementById('form_input_1');
const spinner = document.getElementById('spinner');
const fileNameDisplay = document.getElementById('file-name');

uploadButton.addEventListener('click', function(event) {
    console.log('in event listener');
    event.preventDefault();
    fileInput.click();
});

fileInput.addEventListener('change', function(event) {
    const file = fileInput.files[0];
    if (file) {
        console.log('File selected:', file.name);
        // Clear the download link field
        downloadLinkField.value = '';
        showSpinner();
        fileNameDisplay.textContent = `Selected file: ${file.name}`;
        getPresignedUrlAndUpload(file);
    }
});

function showSpinner() {
    spinner.style.display = 'inline-block';
}

function hideSpinner() {
    spinner.style.display = 'none';
}

function getPresignedUrlAndUpload(file) {
    fetch('https://ad83-73-232-158-17.ngrok-free.app/getPresignedUrl', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fileName: file.name, contentType: file.type })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Pre-signed URL:', data.upload_url);
            uploadToS3(file, data.upload_url, data.download_link);
        } else {
            console.error('Error getting pre-signed URL:', data.message);
            hideSpinner();
        }
    })
    .catch(error => {
        console.error('Error getting pre-signed URL:', error);
        hideSpinner();
    });
}

function uploadToS3(file, uploadUrl, downloadLink) {
    fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
            'Content-Type': file.type
        }
    })
    .then(response => {
        if (response.ok) {
            console.log('File uploaded successfully');
            downloadLinkField.value = downloadLink;
            console.log('Download link set:', downloadLink);
        } else {
            console.error('Error uploading file:', response.statusText);
        }
    })
    .catch(error => {
        console.error('Error uploading file:', error);
    })
    .finally(() => {
        hideSpinner();
    });
}

