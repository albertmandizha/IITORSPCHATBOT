from flask import Flask, render_template, jsonify, request, make_response
import mysql.connector
from flask_cors import CORS
import os;

app = Flask(__name__)
CORS(app, origins=['*'])
CORS(app, allow_headers=['Content-Type', 'Authorization'])

conn = mysql.connector.connect(host="localhost", user="root", passwd="sahil11", db="pj")
cursor = conn.cursor()

@app.route('/get_data/<button_id>')
def get_data(button_id):
    if button_id == 'chatResponsesBtn':
        cursor.execute("""
    SELECT
        q.question_text,
        a.answer_text,
        GROUP_CONCAT(DISTINCT t.tag_name SEPARATOR ', ') AS tags,
        GROUP_CONCAT(CONCAT(o.option_text, ':', IFNULL(o.option_answer, '')) SEPARATOR ';') AS options
    FROM
        questions q
        LEFT JOIN answers a ON q.question_id = a.question_id
        LEFT JOIN options o ON a.answer_id = o.answer_id
        LEFT JOIN question_tags qt ON q.question_id = qt.question_id
        LEFT JOIN tags t ON qt.tag_id = t.tag_id
    GROUP BY
        q.question_text,
        a.answer_text;
        """)
        data = cursor.fetchall()
        return jsonify(data)
    elif button_id == 'tagTableBtn':
        cursor.execute("SELECT tag_id, tag_name FROM tags")
        data = cursor.fetchall()
        return jsonify(data)
    elif button_id == 'unansweredBtn':
        cursor.execute("SELECT question, answer, tag, option_text, option_answer FROM unanswered")
        data = cursor.fetchall()
        return jsonify(data)

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5001, debug=True, ssl_context=(os.path.join(os.path.dirname(__file__), 'keys', 'cert.pem'), os.path.join(os.path.dirname(__file__), 'keys', 'key.pem')))