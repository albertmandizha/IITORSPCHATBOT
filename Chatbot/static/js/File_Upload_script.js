let fileInput = document.getElementById("file-input");
let fileList = document.getElementById("files-list");
let numOfFiles = document.getElementById("num-of-files");
let fileoutput = document.getElementById("fileOutput");

function resetFileUpload() {
  fileInput.value = ""; // Reset the file input field
  fileList.innerHTML = ""; // Clear the file list
  numOfFiles.textContent = "No Files Choosen"; // Reset the number of files text
}

fileInput.addEventListener("change", () => {
  fileList.innerHTML = "";
  numOfFiles.textContent = `${fileInput.files.length} Files Selected`;

  for (i of fileInput.files) {
    let reader = new FileReader();
    let listItem = document.createElement("li");
    let fileName = i.name;
    let fileSize = (i.size / 1024).toFixed(1);
    listItem.innerHTML = `<p>${fileName}</p><p>${fileSize}KB</p>`;
    if (fileSize >= 1024) {
      fileSize = (fileSize / 1024).toFixed(1);
      listItem.innerHTML = `<p>${fileName}</p><p>${fileSize}MB</p>`;
    }
    fileList.appendChild(listItem);
  }
});

// Get reference to Send button
const sendBtn = document.querySelector('label[for="fileOutput"]');
sendBtn.addEventListener('click', () => {
  const files = fileInput.files;
  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append('files', files[i]);
  }
  fetch('http://127.0.0.1:5001/upload', {
    method: 'POST',
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      const responseMessage = document.getElementById('response-message');
      responseMessage.textContent = data.message || data.error;
      resetFileUpload(); // Reset the file upload after operation is complete
    })
    .catch(error => {
      console.error('Error:', error);
    });
  resetFileUpload(); // Reset the file upload after clicking the "Send" button
});

const exitButton = document.getElementById('exit-button');
exitButton.addEventListener('click', () => {
  const container = document.querySelector('.container');
  container.remove(); 
  resetFileUpload();
  window.location.reload(); 
});