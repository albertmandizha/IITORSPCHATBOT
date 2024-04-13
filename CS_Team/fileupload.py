import csv
from flask import Flask, request, jsonify
import os
from flask_cors import CORS
import mysql.connector
from sentence_transformers import SentenceTransformer
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

app = Flask(__name__)
CORS(app, origins=['*'])
CORS(app, allow_headers=['Content-Type', 'Authorization'])

# MySQL database
conn = mysql.connector.connect(host="localhost", user="root", passwd="sahil11", db="pj")

ALLOWED_EXTENSIONS = {'csv', 'txt'}

# Load the SentenceTransformer model
model_name = 'all-MiniLM-L6-v2'
model = SentenceTransformer(model_name)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def parse_csv(file_content):
    parsed_data = []
    rows = csv.reader(file_content.splitlines())
    header = next(rows)  # Get the header row
    if header != ['question', 'answer', 'options', 'tags']:
        return False, "Invalid CSV format. Header must contain: 'question', 'answer', 'options', 'tags'"
    for row in rows:
        if len(row) != 4:
            return False, "File does not have the expected number of columns"
        question, answer, options_str, tags = row
        option_list = []
        option_answers = []
        for option in options_str.split(';'):
            option_parts = option.strip().split(':', 1)
            if len(option_parts) == 2:
                option_text, option_answer = option_parts
                option_list.append(option_text.strip())
                option_answers.append(option_answer.strip())
            else:
                option_list.append(option_parts[0].strip())
                option_answers.append(None)
        tag_list = [tag.strip() for tag in tags.split(';')]
        parsed_data.append((question.strip(), answer.strip(), option_list, option_answers, tag_list))
    return True, parsed_data

def parse_txt(file_content):
    parsed_data = []
    lines = file_content.splitlines()
    temp_question = None
    temp_answer = None
    temp_options = []
    temp_option_answers = []
    temp_tags = []
    for line in lines:
        line = line.strip()
        if line.startswith('question:'):
            if temp_question:
                parsed_data.append((temp_question, temp_answer, temp_options, temp_option_answers, temp_tags))
                temp_options = []
                temp_option_answers = []
                temp_tags = []
            temp_question = line.replace('question:', '').strip()
        elif line.startswith('answer:'):
            temp_answer = line.replace('answer:', '').strip()
        elif line.startswith('option:'):
            option_parts = line.replace('option:', '').strip().split(':', 1)
            if len(option_parts) == 2:
                option_text, option_answer = option_parts
                temp_options.append(option_text.strip())
                temp_option_answers.append(option_answer.strip())
            else:
                temp_options.append(option_parts[0].strip())
                temp_option_answers.append(None)
        elif line.startswith('tags:'):
            temp_tags = line.replace('tags:', '').strip().split(',')
    if temp_question:
        parsed_data.append((temp_question, temp_answer, temp_options, temp_option_answers, temp_tags))
    return True, parsed_data

def encode_and_save_vectors(question_id, question_text):
    # Encode the question
    question_embedding = model.encode([question_text])[0]
    
    # Convert to string to save in the database
    question_vector_str = ','.join(map(str, question_embedding.tolist()))

    # Insert the vector into the database
    cursor = conn.cursor()
    insert_vector_query = "INSERT INTO vectors (question_id, vector) VALUES (%s, %s)"
    cursor.execute(insert_vector_query, (question_id, question_vector_str))
    conn.commit()
    cursor.close()

def insert_into_database(data):
    cursor = conn.cursor()
    try:
        if data:
            for question, answer, options, option_answers, tags in data:
                # Insert the question
                insert_question_query = "INSERT INTO questions (question_text) VALUES (%s)"
                cursor.execute(insert_question_query, (question,))
                question_id = cursor.lastrowid

                # Encode and save the vector for the question
                encode_and_save_vectors(question_id, question)

                # Insert the answer
                insert_answer_query = "INSERT INTO answers (question_id, answer_text) VALUES (%s, %s)"
                cursor.execute(insert_answer_query, (question_id, answer))
                answer_id = cursor.lastrowid

                # Insert the options and option answers
                for option_text, option_answer in zip(options, option_answers):
                    insert_option_query = "INSERT INTO options (answer_id, option_text, option_answer) VALUES (%s, %s, %s)"
                    cursor.execute(insert_option_query, (answer_id, option_text, option_answer))

                # Insert the tags and associate them with the question
                for tag_name in tags:
                    insert_tag_query = "INSERT IGNORE INTO tags (tag_name) VALUES (%s)"
                    cursor.execute(insert_tag_query, (tag_name,))

                    cursor.execute("SELECT tag_id FROM tags WHERE tag_name = %s", (tag_name,))
                    tag_id = cursor.fetchone()[0]

                    insert_question_tag_query = "INSERT INTO question_tags (question_id, tag_id) VALUES (%s, %s)"
                    cursor.execute(insert_question_tag_query, (question_id, tag_id))

            conn.commit()
            # Trigger the rerun of app.py after successful insertion
            trigger_app_rerun()
            return True, "Data inserted into the database successfully"
    except Exception as e:
        conn.rollback()
        return False, f"Error inserting data into the database: {str(e)}"
    finally:
        cursor.close()

def trigger_app_rerun():
    os.system("python3 dashboard.py")

class AppRerunEventHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if event.src_path.endswith("dashboard.py"):
            trigger_app_rerun()

@app.route('/upload', methods=['POST'])
def upload_file():
    files = request.files.getlist('files')
    file_contents = {}
    for file in files:
        if file and allowed_file(file.filename):
            file_contents[file.filename] = file.read().decode('utf-8')
        else:
            return jsonify({'error': 'Only CSV or TXT files are allowed'}), 400

    success = False
    message = None

    for file_name, file_content in file_contents.items():
        if file_name.endswith('.csv'):
            success, parsed_data = parse_csv(file_content)
        elif file_name.endswith('.txt'):
            success, parsed_data = parse_txt(file_content)
        else:
            message = "Unsupported file format. Only CSV or TXT files are allowed"
            break

        if success:
            success, message = insert_into_database(parsed_data)
            if not success:
                break
        else:
            message = "Error parsing the file"
            break

    if success:
        response_data = {'message': message}
        return jsonify(response_data), 200
    else:
        response_data = {'error': message}
        return jsonify(response_data), 400

if __name__ == "__main__":
    observer = Observer()
    observer.schedule(AppRerunEventHandler(), path=".", recursive=False)
    observer.start()
    app.run(host='127.0.0.1', port=5002, debug=True, ssl_context=('D:/IITCHATBOTPRACTICUM2024/CS_Team/keys/cert.pem', 'D:/IITCHATBOTPRACTICUM2024/CS_Team/keys/key.pem'))