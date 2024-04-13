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


// Function to fetch content from a file and inject it into the content container
function fetchFileUploadContent() {
  const filePath = "CS_Team/templates/File_Upload.html";

  fetch(filePath)
    .then(response => response.text())
    .then(data => {
      const contentDiv = document.createElement('div');
      contentDiv.innerHTML = data;
      contentContainer.appendChild(contentDiv);

      const script1 = document.createElement('script');
      script1.src = 'CS_Team/templates/File_Upload_script.js';
      document.body.appendChild(script1);

      const style1 = document.createElement('link');
      style1.rel = 'stylesheet';
      style1.href = 'CS_Team/templates/File_Upload_styles.css';
      document.head.appendChild(style1);
    })
    .catch(error => {
      console.error('Error fetching file:', error);
    });
}

// Event listener for chatbot demo button
document.getElementById('chatbotDemoBtn').addEventListener('click', () => {
  openChatbotWindow();
});

// Function to open chatbot window
function openChatbotWindow() {
  const chatbotWindow = window.open('/Chatbot team/index.html', '_blank');
  chatbotWindow.onload = () => {
    loadChatbotResources(chatbotWindow);
  };
}

// Function to load chatbot resources into the new window
function loadChatbotResources(chatbotWindow) {
  const script1 = chatbotWindow.document.createElement('script');
  script1.src = '/Chatbot team/script.js';
  chatbotWindow.document.body.appendChild(script1);

  const style1 = chatbotWindow.document.createElement('link');
  style1.rel = 'stylesheet';
  style1.href = '/Chatbot team/styles.css';
  chatbotWindow.document.head.appendChild(style1);

  // Add more resources (CSS, JS, etc.) as needed
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
    window.location.href = 'CS_Team/Login.html';
  } catch (error) {
    console.error('Error logging out:', error);
  }
}