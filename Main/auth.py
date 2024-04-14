from flask import Flask, redirect, url_for, session, request, render_template, jsonify
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from flask_cors import CORS
import os
import mysql.connector
import json
import subprocess
import threading

app = Flask(__name__)
app.secret_key = 'IITORSP@CHATBOT'
CORS(app)
CORS(app, resources={r"/*": {"origins": "*"}})

# MySQL database connection
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    passwd="sahil11",
    db="pj"
)
cursor = conn.cursor(dictionary=True)

def check_role(required_role):
    if 'role' not in session:
        return redirect(url_for('index'))
    if session['role'] != required_role:
        return 'Unauthorized', 403
    return None

def get_user_id_by_email(email):
    cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
    result = cursor.fetchone()
    return result['id'] if result else None

@app.route('/')
def index():
    return render_template('Login.html')

with open('Main/keys/client_secret.json', 'r') as file:
    client_secret = json.load(file)

CLIENT_ID = client_secret['web']['client_id']
CLIENT_SECRET = client_secret['web']['client_secret']
CALLBACK_URI = client_secret['web']['redirect_uris'][0]
SCOPES = ['openid', 'https://www.googleapis.com/auth/userinfo.email']

@app.route('/login')
def login():
    role = request.args.get('role')
    flow = Flow.from_client_secrets_file(
        'Main/keys/client_secret.json',
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
        'Main/keys/client_secret.json',
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

    if role == 'Admin':
        return redirect(url_for('Admin'))
    elif role == 'Manager':
        return redirect(url_for('manager_dashboard'))
    else:
        return 'Invalid role', 400

@app.route('/Admin')
def Admin():
    error = check_role('Admin')
    if error:
        return error

    cursor.execute("SELECT u.id, u.email, r.name AS role_name FROM users u JOIN roles r ON u.role_id = r.id")
    users = cursor.fetchall()
    cursor.execute("SELECT id, name FROM roles")
    roles = cursor.fetchall()
    return render_template('Admin.html', users=users, roles=roles)

@app.route('/manager_dashboard')
def manager_dashboard():
    error = check_role('Manager')
    if error:
        return error
    return render_template('Manager.html')

@app.route('/manage_users', methods=['GET', 'POST'])
def manage_users():
    error = check_role('Admin')
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
    return jsonify({'users': users, 'roles': roles})

@app.route('/logout')
def logout():
    session.clear()
    return render_template('Login.html')

@app.route('/start_chatbot', methods=['GET'])
def start_chatbot():
    # Run the Chatbot.py script in a separate thread
    chatbot_thread = threading.Thread(target=run_chatbot)
    chatbot_thread.start()

    # Return the URL of the running chatbot
    return jsonify({'chatbot_url': 'https://127.0.0.1:5000'})

def run_chatbot():
    chatbot_script_path = os.path.join(os.path.dirname(__file__), 'Chatbot', 'Chatbot.py')
    subprocess.run(['python', chatbot_script_path], check=True)

if __name__ == '__main__':
    app.run(
        host='127.0.0.1',
        port=5003,
        debug=True,
        ssl_context=(
            os.path.join(os.path.dirname(__file__), 'keys', 'cert.pem'),
            os.path.join(os.path.dirname(__file__), 'keys', 'key.pem')
        )
    )