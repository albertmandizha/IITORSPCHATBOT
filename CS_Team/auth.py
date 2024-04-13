from flask import Flask, redirect, url_for, session, request, render_template, jsonify
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from flask_cors import CORS
import os
import mysql.connector
import json

app = Flask(__name__)
app.secret_key = 'IITORSP@CHATBOT'
CORS(app)
CORS(app, resources={r"/*": {"origins": "*"}})

# MySQL database connection
conn = mysql.connector.connect(host="localhost", user="root", passwd="sahil11", db="pj")
cursor = conn.cursor()

def check_role(role):
    if 'role' not in session:
        return redirect(url_for('index'))
    if session['role'] != role:
        return 'Unauthorized', 403
    return None


def get_user_id_by_email(email):
    cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
    result = cursor.fetchone()
    if result:
        return result[0]
    return None

@app.route('/')
def index():
    return render_template('Login.html')


with open('CS_Team/keys/client_secret.json', 'r') as file:
    client_secret = json.load(file)

CLIENT_ID = client_secret['web']['client_id']
CLIENT_SECRET = client_secret['web']['client_secret']
CALLBACK_URI = client_secret['web']['redirect_uris'][0]
SCOPES = ['openid', 'https://www.googleapis.com/auth/userinfo.email']



@app.route('/login')
def login():
    role = request.args.get('role')
    flow = Flow.from_client_secrets_file(
        'CS_Team/keys/client_secret.json',
        scopes=SCOPES,
        redirect_uri=CALLBACK_URI
    )
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true'
    )
    session['state'] = state
    session['role'] = role
    return redirect(authorization_url)


@app.route('/callback')
def callback():
    state = session.get('state')
    role = session.get('role')
    if state is None:
        return 'State parameter is missing', 400

    flow = Flow.from_client_secrets_file(
        'CS_Team/keys/client_secret.json',
        scopes=SCOPES,
        redirect_uri=CALLBACK_URI
    )
    flow.fetch_token(authorization_response=request.url)

    credentials = flow.credentials
    session['credentials'] = credentials.to_json()

    # Retrieve the user's email using the Google API
    userinfo_service = build('oauth2', 'v2', credentials=credentials)
    user_info = userinfo_service.userinfo().get().execute()
    session['name'] = user_info['email']
    session['user_id'] = get_user_id_by_email(user_info['email'])

    if role == 'admin':
        return redirect(url_for('admin'))
    elif role == 'manager':
        return redirect(url_for('manager_dashboard'))
    else:
        return 'Invalid role', 400

@app.route('/admin')
def admin():
    error = check_role('admin')
    if error:
        return error

    cursor.execute("SELECT u.id, u.email, r.name AS role_name FROM users u JOIN roles r ON u.role_id = r.id")
    users = cursor.fetchall()
    cursor.execute("SELECT id, name FROM roles")
    roles = cursor.fetchall()
    return render_template('Admin.html', users=users, roles=roles)

@app.route('/manager_dashboard')
def manager_dashboard():
    error = check_role('manager')
    if error:
        return error

    cursor.execute("SELECT q.question, q.answer, t.name AS tag, q.options FROM questions q "
                   "JOIN tags t ON q.tag_id = t.id "
                   "WHERE q.assigned_to = %s", (session['user_id'],))
    manager_data = cursor.fetchall()

    cursor.execute("SELECT u.id, u.email, r.name AS role_name "
                   "FROM users u "
                   "JOIN manager_assignments ma ON u.id = ma.user_id "
                   "JOIN roles r ON u.role_id = r.id "
                   "WHERE ma.manager_id = %s", (session['user_id'],))
    assigned_users = cursor.fetchall()
    return render_template('Manager.html', manager_data=manager_data, assigned_users=assigned_users)

@app.route('/manage_users', methods=['GET', 'POST'])
def manage_users():
    error = check_role('admin')
    if error:
        return error

    if request.method == 'POST':
        action = request.form['action']
        if action == 'create':
            email = request.form['email']
            role_id = request.form['role_id']
            cursor.execute("INSERT INTO users (email, role_id) VALUES (%s, %s)", (email, role_id))
            conn.commit()
        elif action == 'update':
            user_id = request.form['user_id']
            email = request.form['email']
            role_id = request.form['role_id']
            cursor.execute("UPDATE users SET email = %s, role_id = %s WHERE id = %s", (email, role_id, user_id))
            conn.commit()
        elif action == 'delete':
            user_id = request.form['user_id']
            cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
            conn.commit()

    cursor.execute("SELECT u.id, u.email, r.name AS role_name FROM users u JOIN roles r ON u.role_id = r.id")
    users = cursor.fetchall()
    cursor.execute("SELECT id, name FROM roles")
    roles = cursor.fetchall()
    return jsonify({'users': [{'id': user[0], 'email': user[1], 'role_name': user[2]} for user in users], 'roles': [{'id': role[0], 'name': role[1]} for role in roles]})

@app.route('/logout')
def logout():
    session.clear()
    return render_template('Login.html') 

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5003, debug=True, ssl_context=('D:/IITCHATBOTPRACTICUM2024/CS_Team/keys/cert.pem', 'D:/IITCHATBOTPRACTICUM2024/CS_Team/keys/key.pem'))