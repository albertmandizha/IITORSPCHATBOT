from flask import Flask, redirect, url_for, session, request, render_template, jsonify
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from flask_cors import CORS
import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta, timezone
from functools import wraps
from config import Config
import os


app = Flask(__name__)
app.config.from_object(Config)
CORS(app)
CORS(app, resources={r"/*": {"origins": "*"}})

from mysql.connector.pooling import MySQLConnectionPool

# Create the connection pool
pool = MySQLConnectionPool(
    pool_name="pj_pool",
    pool_size=32,
    host="localhost",
    user="root",
    passwd="sahil11",
    db="pj"
)

def get_db_connection():
    return pool.get_connection()

def execute_query(query, params=None, fetch_all=False):
    try:
        with get_db_connection() as conn:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute(query, params)
                if fetch_all:
                    result = cursor.fetchall()
                else:
                    result = cursor.fetchone()
            conn.commit()
            return result
    except (mysql.connector.ProgrammingError, mysql.connector.IntegrityError,
            mysql.connector.OperationalError, mysql.connector.errors.InternalError) as e:
        print(f"Database error: {e}")
        print(f"Query: {query}")
        print(f"Params: {params}")
        return None
    except Exception as e:
        print(f"Unexpected error: {e}")
        print(f"Query: {query}")
        print(f"Params: {params}")
        return None 

def is_user_authenticated():
    return 'role' in session and 'user_id' in session and 'last_activity' in session and session.get('last_activity', None) is not None

def is_session_valid():
    if 'last_activity' not in session or session.get('last_activity', None) is None:
        return False
    return (datetime.now(tz=timezone.utc) - session['last_activity']) <= timedelta(minutes=30)

def check_role(required_role):
    if not is_user_authenticated():
        session.clear()
        return redirect(url_for('index'))

    user_role = get_user_role(session['user_id'])
    if user_role is None:
        session.clear()
        return redirect(url_for('index'))

    if user_role != required_role:
        return 'Unauthorized', 403

    if not is_session_valid():
        session.clear()
        return redirect(url_for('index'))

    session['last_activity'] = datetime.now(tz=timezone.utc)
    return None

def get_user_role(email):
    result = execute_query("SELECT role FROM users WHERE email = %s", (email,))
    if result:
        return result['role']
    else:
        return None

@app.route('/')
def index():
    return render_template('Login.html')


import os
@app.route('/login', methods=['GET'])
def login():
    flow = Flow.from_client_secrets_file(
        os.path.join(os.path.dirname(__file__), 'keys', 'client_secret.json'),
        scopes=['openid', 'https://www.googleapis.com/auth/userinfo.email'],
        redirect_uri=url_for('handle_callback', _external=True)
    )
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true'
    )
    session['state'] = state
    return redirect(authorization_url)

@app.route('/handle_callback')
def handle_callback():
    state = session.get('state')
    if state is None:
        return 'State parameter is missing', 400

    flow = Flow.from_client_secrets_file(
        os.path.join(os.path.dirname(__file__), 'keys', 'client_secret.json'),
        scopes=['openid', 'https://www.googleapis.com/auth/userinfo.email'],
        redirect_uri=url_for('handle_callback', _external=True)
    )

    try:
        flow.fetch_token(authorization_response=request.url)
    except Exception as e:
        print(f"Error fetching token: {e}")
        session.clear()
        return redirect(url_for('index'))

    credentials = flow.credentials
    session['credentials'] = credentials.to_json()

    userinfo_service = build('oauth2', 'v2', credentials=credentials)
    try:
        user_info = userinfo_service.userinfo().get().execute()
        session['name'] = user_info['email']
    except Exception as e:
        print(f"Error retrieving user information: {e}")
        session.clear()
        return redirect(url_for('index'))

    try:
        user_role = get_user_role(user_info['email'])
        if user_role == 'Admin':
            return redirect(url_for('admin_dashboard'))
        elif user_role == 'Manager':
            return redirect(url_for('manager_dashboard'))
        elif user_role is not None:
            return 'Invalid role', 400
        else:
            return 'User not found', 404
    except Exception as e:
        print(f"Error retrieving user role: {e}")
        session.clear()
        return redirect(url_for('index'))

@app.route('/admin_dashboard')
def admin_dashboard():
    users = execute_query("SELECT id, email, role FROM users", fetch_all=True)
    return render_template('Admin.html', users=users)

@app.route('/manager_dashboard')
def manager_dashboard():
    return render_template('Manager.html')

@app.route('/logout')
def logout():
    if is_user_authenticated():
        user_id = session.get('user_id')
        execute_query("UPDATE users SET last_login = NOW() WHERE id = %s", (user_id,))
    session.clear()
    return render_template('Login.html')

@app.route('/start_chatbot', methods=['GET'])
def start_chatbot():
    return jsonify({'chatbot_url': 'https://127.0.0.1:5000'})

@app.route('/manage_users', methods=['GET', 'POST'])
def manage_users():
    if request.method == 'POST':
        action = request.form['action']
        if action == 'create':
            email = request.form['email']
            role = request.form['role']
            result = execute_query("INSERT INTO users (email, role) VALUES (%s, %s)", (email, role))
            if result is not None:
                return jsonify({'success': True})
            else:
                return jsonify({'success': False, 'error': 'Failed to create user'}), 500
        elif action == 'update':
            user_id = request.form['user_id']
            email = request.form['email']
            role = request.form['role']

            # Check if the email or role has changed
            existing_user = execute_query("SELECT email, role FROM users WHERE id = %s", (user_id,))
            if existing_user:
                if existing_user['email'] != email or existing_user['role'] != role:
                    result = execute_query("UPDATE users SET email = %s, role = %s WHERE id = %s", (email, role, user_id))
                    if result is not None:
                        return jsonify({'success': True})
                    else:
                        return jsonify({'success': False, 'error': 'Failed to update user'}), 500
                else:
                    return jsonify({'success': True})
            else:
                return jsonify({'success': False, 'error': 'User not found'}), 404
        elif action == 'delete':
            user_id = request.form['user_id']
            result = execute_query("DELETE FROM users WHERE id = %s", (user_id,))
            if result is not None:
                return jsonify({'success': True})
            else:
                return jsonify({'success': False, 'error': 'Failed to delete user'}), 500

    try:
        users = execute_query("SELECT id, email, role FROM users", fetch_all=True)

        if users is None:
            return jsonify({'success': False, 'error': 'Failed to fetch user data'}), 500

        return jsonify({'users': [{'id': user['id'], 'email': user['email'], 'role_name': user['role']} for user in users]})
    except Exception as e:
        print(f"Error in manage_users: {e}")
        return jsonify({'success': False, 'error': 'An error occurred while fetching user data'}), 500
    
    
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