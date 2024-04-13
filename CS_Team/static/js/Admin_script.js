const contentContainer = document.querySelector('.content-container');
const headerIcon = document.querySelector('.header-icon');


// Event listeners for buttons
document.getElementById("fileBtn").addEventListener("click", fetchFileUploadContent);

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
  fetch(`/get_data/${buttonId}`)
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
    await fetch('http://127.0.0.1:5003/logout', {
      method: 'GET',
    });
    window.location.href = '/';
  } catch (error) {
    console.error('Error logging out:', error);
  }
}

async function fetchFileUploadContent() {
  try {
    const response = await fetch('/CS_Team/Dashboard/index1.html');
    const data = await response.text();
    const contentDiv = document.createElement('div');
    contentDiv.innerHTML = data;
    contentContainer.appendChild(contentDiv);

    const script1 = document.createElement('script');
    script1.src = '/CS_Team/Dashboard/script1.js';
    document.body.appendChild(script1);

    const style1 = document.createElement('link');
    style1.rel = 'stylesheet';
    style1.href = '/CS_Team/Dashboard/style1.css';
    document.head.appendChild(style1);
  } catch (error) {
    console.error('Error fetching file:', error);
  }
}

function downloadQATable() {
  const downloadLink = document.createElement('a');
  downloadLink.href = '/download_qa_table';
  downloadLink.download = 'qa_table.csv';
  downloadLink.click();
}

document.getElementById('chatbotDemoBtn').addEventListener('click', openChatbotWindow);

function openChatbotWindow() {
  const chatbotWindow = window.open('/Chatbot team/index.html', '_blank');
  chatbotWindow.onload = () => {
    loadChatbotResources(chatbotWindow);
  };
}

function loadChatbotResources(chatbotWindow) {
  const script1 = chatbotWindow.document.createElement('script');
  script1.src = '/Chatbot team/script.js';
  chatbotWindow.document.body.appendChild(script1);

  const style1 = chatbotWindow.document.createElement('link');
  style1.rel = 'stylesheet';
  style1.href = '/Chatbot team/styles.css';
  chatbotWindow.document.head.appendChild(style1);
}

async function manageUsers() {
  try {
    const response = await fetch('http://127.0.0.1:5003/manage_users');
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
          <select id="new-role" name="role_id" required>
            <option value="">Select Role</option>
            ${data.roles.map(role => `<option value="${role.id}">${role.name}</option>`).join('')}
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
    const response = await fetch(`http://127.0.0.1:5003/manage_users/${userId}`);
    const user = await response.json();

    let updateUserHTML = `
      <h3>Update User</h3>
      <form class="update-user-form">
        <input type="hidden" name="user_id" value="${user.id}">
        <label for="update-email">Email:</label>
        <input type="email" id="update-email" name="email" value="${user.email}" required>
        <label for="update-role">Role:</label>
        <select id="update-role" name="role_id" required>
          <option value="">Select Role</option>
          ${data.roles.map(role => `<option value="${role.id}" ${role.id === user.role_id ? 'selected' : ''}>${role.name}</option>`).join('')}
        </select>
        <button type="submit">Update</button>
      </form>
    `;

    contentContainer.innerHTML = updateUserHTML;

    const updateUserForm = document.querySelector('.update-user-form');
    updateUserForm.addEventListener('submit', handleUserManagementAction);
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
}

async function showDeleteUserForm(event) {
  try {
    const userId = event.target.dataset.userId;
    const response = await fetch(`http://127.0.0.1:5003/manage_users/${userId}`);
    const user = await response.json();

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
    await fetch('http://127.0.0.1:5003/manage_users', {
      method: 'POST',
      body: formData
    });
    manageUsers();
  } catch (error) {
    console.error('Error handling user management action:', error);
  }
}