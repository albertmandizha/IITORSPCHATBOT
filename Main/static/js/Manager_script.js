const contentContainer = document.querySelector('.content-container');
const headerIcon = document.querySelector('.header-icon');

// Event listeners for buttons
document.getElementById("fileBtn").addEventListener("click", function() {
  fetchFileUploadContent();
});

document.getElementById('chatResponsesBtn').addEventListener('click', () => {
  fetchData('chatResponsesBtn', 'Question and Answer Details');
});

document.getElementById('tagTableBtn').addEventListener('click', () => {
  fetchDataTag('tagTableBtn', 'Tag Table');
});

document.getElementById('unansweredBtn').addEventListener('click', () => {
  fetchData('unansweredBtn','Unanswered Table');
});

// Function to fetch data
function fetchData(buttonId, heading) {
  fetch(`https://127.0.0.1:5001/get_data/${buttonId}`)
    .then(response => response.json())
    .then(data => {
      let tableHTML = generateTableHTML(data, heading);
      contentContainer.innerHTML = tableHTML;
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
}

// Function to fetch data for Tag Table
function fetchDataTag(buttonId, heading) {
  fetch(`https://127.0.0.1:5001/get_data/${buttonId}`)
    .then(response => response.json())
    .then(data => {
      let tableHTML = generateTagTableHTML(data, heading);
      contentContainer.innerHTML = tableHTML;
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
}

// Function to generate table HTML
function generateTableHTML(data, heading) {
  let tableHTML = `<div class="table-container"><h2>${heading}</h2>`;
  tableHTML += '<table cellspacing="0" cellpadding="5" border="1" style="width: 100%;">';
  tableHTML += '<thead><tr>';
  tableHTML += '<th>Question</th>';
  tableHTML += '<th>Answer</th>';
  
  // Include Tag and Option columns only if the heading is not 'Tag Table'
  if (heading !== 'Tag Table') {
    tableHTML += '<th>Tag</th>';
    tableHTML += '<th>Option</th>';
  }
  
  tableHTML += '</tr></thead><tbody>';

  for (const row of data) {
    tableHTML += '<tr>';
    tableHTML += `<td contenteditable="true" style="border: 1px solid #ccc; padding: 5px;">${row[0] || ''}</td>`;
    tableHTML += `<td contenteditable="true" style="border: 1px solid #ccc; padding: 5px;">${row[1] || ''}</td>`;
    
    // Include Tag and Option columns only if the heading is not 'Tag Table'
    if (heading !== 'Tag Table') {
      tableHTML += `<td contenteditable="true" style="border: 1px solid #ccc; padding: 5px;">${row[2] || ''}</td>`;
      tableHTML += `<td contenteditable="true" style="border: 1px solid #ccc; padding: 5px;">${row[3] || ''}</td>`;
    }
    
    tableHTML += '</tr>';
  }

  tableHTML += '</tbody></table></div>';
  return tableHTML;
}

// Function to generate table HTML for Tag Table
function generateTagTableHTML(data, heading) {
  let tableHTML = `<div class="table-container"><h2>${heading}</h2>`;
  tableHTML += '<table cellspacing="0" cellpadding="5" border="1" style="width: 100%;">';
  tableHTML += '<thead><tr>';
  tableHTML += '<th>Id</th>';
  tableHTML += '<th>Tag</th>';
  tableHTML += '</tr></thead><tbody>';

  for (const row of data) {
    tableHTML += '<tr>';
    tableHTML += `<td contenteditable="true" style="border: 1px solid #ccc; padding: 5px;">${row[0] || ''}</td>`;
    tableHTML += `<td contenteditable="true" style="border: 1px solid #ccc; padding: 5px;">${row[1] || ''}</td>`;
    tableHTML += '</tr>';
  }

  tableHTML += '</tbody></table></div>';
  return tableHTML;
}

document.getElementById('chatbotDemoBtn').addEventListener('click', () => {
  startChatbot();
});

async function startChatbot() {
  try {
    const response = await fetch('https://127.0.0.1:5003/start_chatbot', {
      method: 'GET',
    });
    const data = await response.json();

    // Create the chatbot container HTML
    const chatbotContainerHTML = `
      <div class="chatbot-container">
          <button class="open-chatbot-btn">Open</button>
        </div>
      </div>
    `;

    // Add the chatbot container to the contentContainer
    contentContainer.innerHTML = chatbotContainerHTML;

    // Add event listener for the "Open" button
    const openChatbotBtn = document.querySelector('.open-chatbot-btn');
    openChatbotBtn.addEventListener('click', () => {
      window.open(data.chatbot_url, '_blank');
    });
  } catch (error) {
    console.error('Error starting chatbot:', error);
  }
}
headerIcon.addEventListener('click', () => {
  const confirmLogout = confirm('Do you really want to logout?');
  if (confirmLogout) {
    logout();
  }
});

async function logout() {
  try {
    await fetch('https://127.0.0.1:5003/logout', {
      method: 'GET',
    });
    window.location.href = '/';
  } catch (error) {
    console.error('Error logging out:', error);
  }
}



function createFileUploadBox() {
  const fileUploadBox = document.createElement('div');
  fileUploadBox.classList.add('file-upload-box');
  fileUploadBox.innerHTML = `
    <div class="file-input-container">
      <label for="file-input" class="custom-file-input">Choose File</label>
      <input type="file" id="file-input" accept=".txt, .csv" style="display: none;">
    </div>
    <div class="file-info">
      <p>Selected file: <span id="file-name"></span></p>
      <p>File size: <span id="file-size"></span></p>
    </div>
    <div class="button-container">
      <button id="send-file-btn">Send</button>
      <button id="exit-file-btn">Exit</button>
    </div>
  `;
  contentContainer.innerHTML = '';
  contentContainer.appendChild(fileUploadBox);

  // Add event listeners for file input and buttons
  const fileInput = document.getElementById('file-input');
  const customFileInput = document.querySelector('.custom-file-input');
  const sendFileBtn = document.getElementById('send-file-btn');
  const exitFileBtn = document.getElementById('exit-file-btn');

  customFileInput.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', handleFileSelection);
  sendFileBtn.addEventListener('click', handleFileSend);
  exitFileBtn.addEventListener('click', closeFileUploadBox);
}

// Function to handle file selection
function handleFileSelection() {
  const fileInput = document.getElementById('file-input');
  const fileNameElement = document.getElementById('file-name');
  const fileSizeElement = document.getElementById('file-size');

  if (fileInput.files.length > 0) {
    const selectedFile = fileInput.files[0];
    fileNameElement.textContent = selectedFile.name;
    fileSizeElement.textContent = `${(selectedFile.size / 1024).toFixed(2)} KB`;
  } else {
    fileNameElement.textContent = '';
    fileSizeElement.textContent = '';
  }
}


// Function to handle file upload
async function handleFileSend() {
  const fileInput = document.getElementById('file-input');
  if (fileInput.files.length > 0) {
    const selectedFile = fileInput.files[0];
    try {
      const formData = new FormData();
      formData.append('files', selectedFile, selectedFile.name);

      const response = await fetch('https://127.0.0.1:5002/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        fileInput.value = ''; // Reset the file input
      } else {
        const error = await response.json();
        console.error('Error uploading file:', error);
        alert(`Error: ${error.error || 'An unknown error occurred.'}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('An error occurred while uploading the file. Please check the server logs for more information.');
    }
  }
}

// Function to close the file upload box
function closeFileUploadBox() {
  const fileUploadBox = document.querySelector('.file-upload-box');
  contentContainer.removeChild(fileUploadBox);
}

// Add event listener for the "File Upload" button
document.getElementById('fileBtn').addEventListener('click', createFileUploadBox);


document.getElementById('manualEntryBtn').addEventListener('click', showManualEntryForm);

function showManualEntryForm() {
  const manualEntryHTML = `
    <div class="manual-entry-form">
      <h2>Manual Entry</h2>
      <div class="input-row">
        <label for="question">Question:</label>
        <input type="text" id="question" required>
      </div>
      <div class="input-row">
        <label for="answer">Answer:</label>
        <input type="text" id="answer" required>
      </div>
      <div class="input-row">
        <label for="tags">Tags (comma-separated):</label>
        <input type="text" id="tags">
      </div>
      <div id="option-container"></div>
      <div class="button-row">
        <button id="add-option">Add Option</button>
        <button id="send-manual-entry">Send</button>
      </div>
    </div>
  `;

  contentContainer.innerHTML = manualEntryHTML;

  const addOptionBtn = document.getElementById('add-option');
  addOptionBtn.addEventListener('click', addOptionInput);

  const sendManualEntryBtn = document.getElementById('send-manual-entry');
  sendManualEntryBtn.addEventListener('click', sendManualEntryData);
}

let optionCount = 1;

function addOptionInput() {
  const optionContainer = document.getElementById('option-container');
  const newOptionInput = document.createElement('div');
  newOptionInput.classList.add('input-row');
  newOptionInput.innerHTML = `
    <label for="option-text-${optionCount}">Option Text:</label>
    <input type="text" id="option-text-${optionCount}" required>
    <label for="option-answer-${optionCount}">Option Answer:</label>
    <input type="text" id="option-answer-${optionCount}" required>
  `;
  optionContainer.appendChild(newOptionInput);
  optionCount++;
}

function addOptionInput() {
  const optionContainer = document.getElementById('option-container');
  const newOptionInput = document.createElement('div');
  newOptionInput.classList.add('input-row');
  newOptionInput.innerHTML = `
    <label for="option-text-${optionCount}">Option Text:</label>
    <input type="text" id="option-text-${optionCount}" required>
    <label for="option-answer-${optionCount}">Option Answer:</label>
    <input type="text" id="option-answer-${optionCount}" required>
  `;
  optionContainer.appendChild(newOptionInput);
  optionCount++;
}


async function sendManualEntryData() {
  const question = document.getElementById('question').value;
  const answer = document.getElementById('answer').value;
  const tags = document.getElementById('tags').value.split(',').map(tag => tag.trim());
  const optionInputs = document.querySelectorAll('.input-row');
  const options = [];

  optionInputs.forEach(input => {
    const optionTextElement = input.querySelector('input[id^="option-text-"]');
    const optionAnswerElement = input.querySelector('input[id^="option-answer-"]');

    if (optionTextElement && optionAnswerElement) {
      const optionText = optionTextElement.value;
      const optionAnswer = optionAnswerElement.value;

      if (optionText && optionAnswer) {
        options.push(`${optionText}:${optionAnswer}`);
      }
    }
  });

  const data = {
    question,
    answer,
    tags,
    options: options.join(';')
  };

  try {
    const response = await fetch('https://127.0.0.1:5002/manual_entry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (response.ok) {
      alert(result.message);
      clearInputFields(); // Call the clearInputFields function
    } else {
      alert(`Error: ${result.error}`);
    }
  } catch (error) {
    console.error('Error sending manual entry data:', error);
    alert('An error occurred while sending the data. Please check the server logs for more information.');
  }
}

function clearInputFields() {
  document.getElementById('question').value = '';
  document.getElementById('answer').value = '';
  document.getElementById('tags').value = '';

  const optionInputs = document.querySelectorAll('.input-row');
  optionInputs.forEach(input => {
    const optionTextElement = input.querySelector('input[id^="option-text-"]');
    const optionAnswerElement = input.querySelector('input[id^="option-answer-"]');

    if (optionTextElement && optionAnswerElement) {
      optionTextElement.value = '';
      optionAnswerElement.value = '';
    }
  });
}