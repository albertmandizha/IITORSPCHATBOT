const contentContainer = document.querySelector('.content-container');
const headerIcon = document.querySelector('.header-icon');

document.getElementById('chatResponsesBtn').addEventListener('click', () => {
  fetchData('chatResponsesBtn', 'Question and Answer Details');
});

document.getElementById('tagTableBtn').addEventListener('click', () => {
  fetchData('tagTableBtn', 'Tag Table');
});

document.getElementById('unansweredBtn').addEventListener('click', () => {
  fetchData('unansweredBtn', 'Unanswered Table');
});

document.getElementById('chatbotusermanagement').addEventListener('click', manageUsers);

function fetchData(buttonId, heading) {
  fetch(`https://127.0.0.1:5001/get_data/${buttonId}`)
    .then(response => response.json())
    .then(data => {
      let tableHTML = `<div class="table-container"><h2>${heading}</h2>`;
      tableHTML += '<table cellspacing="0" cellpadding="5" border="1" style="width: 100%;">';
      tableHTML += '<thead><tr>';
      tableHTML += '<th>Question</th>';
      tableHTML += '<th>Answer</th>';
      tableHTML += '<th>Tag</th>';
      tableHTML += '<th>Option</th>';
      tableHTML += '</tr></thead><tbody>';

      for (const row of data) {
        tableHTML += '<tr>';
        tableHTML += `<td contenteditable="true" style="border: 1px solid #ccc; padding: 5px;">${row[0] || ''}</td>`;
        tableHTML += `<td contenteditable="true" style="border: 1px solid #ccc; padding: 5px;">${row[1] || ''}</td>`;
        tableHTML += `<td contenteditable="true" style="border: 1px solid #ccc; padding: 5px;">${row[2] || ''}</td>`;
        tableHTML += `<td contenteditable="true" style="border: 1px solid #ccc; padding: 5px;">${row[3] || ''}</td>`;
        tableHTML += '</tr>';
      }

      tableHTML += '</tbody></table></div>';
      contentContainer.innerHTML = tableHTML;
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
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



document.getElementById('chatbotDemoBtn').addEventListener('click', startChatbot);

async function startChatbot() {
  try {
    const response = await fetch('https://127.0.0.1:5003/start_chatbot', {
      method: 'GET',
    });
    const data = await response.json();

    // Create the chatbot container HTML
    const chatbotContainerHTML = `
      <div class="chatbot-container">
        <div class="chatbot-url-container">
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


async function manageUsers() {
  try {
    const response = await fetch('https://127.0.0.1:5003/manage_users');
    const data = await response.json();

    let userManagementHTML = `
      <h2>User Management</h2>
      <table cellspacing="0" cellpadding="5" border="1" style="width: 100%;">
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
    `;

    for (const user of data.users) {
      userManagementHTML += `
        <tr>
          <td contenteditable="true" style="border: 1px solid #ccc; padding: 5px;">${user.email}</td>
          <td contenteditable="true" style="border: 1px solid #ccc; padding: 5px;">${user.role_name}</td>
          <td>
            <button class="update-user-btn" data-user-id="${user.id}">Update</button>
            <button class="delete-user-btn" data-user-id="${user.id}">Delete</button>
          </td>
        </tr>
      `;
    }

    userManagementHTML += `
        </tbody>
      </table>
      <div class="user-management-actions">
        <h3>Create User</h3>
        <form class="create-user-form">
          <label for="new-email">Email:</label>
          <input type="email" id="new-email" name="email" required>
          <label for="new-role">Role:</label>
          <select id="new-role" name="role" required>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
          </select>
          <button type="submit">Create</button>
        </form>
      </div>
    `;

    contentContainer.innerHTML = userManagementHTML;

    // Add event listeners for user management actions
    const updateUserBtns = document.querySelectorAll('.update-user-btn');
    updateUserBtns.forEach(btn => {
      btn.addEventListener('click', showUpdateUserForm);
    });

    const deleteUserBtns = document.querySelectorAll('.delete-user-btn');
    deleteUserBtns.forEach(btn => {
      btn.addEventListener('click', showDeleteUserForm);
    });

    const createUserForm = document.querySelector('.create-user-form');
    createUserForm.addEventListener('submit', handleUserManagementAction);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

async function showUpdateUserForm(event) {
  try {
    const userId = event.target.dataset.userId;
    const response = await fetch(`https://127.0.0.1:5003/manage_users`);
    const users = await response.json();
    const user = users.users.find(u => u.id === parseInt(userId));

    if (user) {
      const rolesResponse = await fetch(`https://127.0.0.1:5003/manage_users`);
      const { roles } = await rolesResponse.json();

      let updateUserHTML = `
        <h3>Update User</h3>
        <form class="update-user-form">
          <input type="hidden" name="user_id" value="${user.id}">
          <label for="update-email">Email:</label>
          <input type="email" id="update-email" name="email" value="${user.email}" required>
          <label for="update-role">Role:</label>
          <select id="update-role" name="role" required>
            <option value="">Select Role</option>
            ${roles.map(role => `<option value="${role.name}" ${role.name === user.role_name ? 'selected' : ''}>${role.name}</option>`).join('')}
          </select>
          <button type="submit">Update</button>
        </form>
      `;
      contentContainer.innerHTML = updateUserHTML;
      const updateUserForm = document.querySelector('.update-user-form');
      updateUserForm.addEventListener('submit', handleUserManagementAction);
    } else {
      console.error('User not found');
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
}
async function showDeleteUserForm(event) {
  try {
    const response = await fetch(`https://127.0.0.1:5003/manage_users`);
    const users = await response.json();
    const userId = event.target.dataset.userId;
    const user = users.users.find(u => u.id === parseInt(userId));

    if (user) {
      let deleteUserHTML = `
        <h3>Delete User</h3>
        <p>Are you sure you want to delete the user with email "${user.email}"?</p>
        <form class="delete-user-form">
          <input type="hidden" name="user_id" value="${user.id}">
          <button type="submit">Delete</button>
          <button type="button" onclick="manageUsers()">Cancel</button>
        </form>
      `;
      contentContainer.innerHTML = deleteUserHTML;
      const deleteUserForm = document.querySelector('.delete-user-form');
      deleteUserForm.addEventListener('submit', handleUserManagementAction);
    } else {
      console.error('User not found');
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
}

async function handleUserManagementAction(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  formData.append('action', form.classList.contains('create-user-form') ? 'create' : (form.classList.contains('update-user-form') ? 'update' : 'delete'));

  try {
    await fetch('https://127.0.0.1:5003/manage_users', {
      method: 'POST',
      body: formData
    });
    manageUsers();
  } catch (error) {
    console.error('Error handling user management action:', error);
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