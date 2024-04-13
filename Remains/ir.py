import mysql.connector

# Connect to MySQL
conn = mysql.connector.connect(host="localhost", user="root", passwd="sahil11", db="tag")
cursor = conn.cursor()

# Create tables if they don't exist
cursor.execute('''
    CREATE TABLE IF NOT EXISTS qa_table (
        qa_id INT AUTO_INCREMENT PRIMARY KEY,
        question TEXT,
        answer TEXT
    )
''')

cursor.execute('''
    CREATE TABLE IF NOT EXISTS tags_table (
        tag_id INT AUTO_INCREMENT PRIMARY KEY,
        tag_name VARCHAR(255) UNIQUE
    )
''')

cursor.execute('''
    CREATE TABLE IF NOT EXISTS qa_tags (
        qa_id INT,
        tag_id INT,
        FOREIGN KEY (qa_id) REFERENCES qa_table(qa_id),
        FOREIGN KEY (tag_id) REFERENCES tags_table(tag_id),
        PRIMARY KEY (qa_id, tag_id)
    )
''')

# Function to insert a question-answer pair
def insert_qa(question, answer, tags):
    cursor.execute('INSERT INTO qa_table (question, answer) VALUES (%s, %s)', (question, answer))
    qa_id = cursor.lastrowid
    for tag in tags:
        cursor.execute('INSERT IGNORE INTO tags_table (tag_name) VALUES (%s)', (tag,))
        cursor.execute('SELECT tag_id FROM tags_table WHERE tag_name = %s', (tag,))
        tag_id = cursor.fetchone()[0]
        cursor.execute('INSERT INTO qa_tags (qa_id, tag_id) VALUES (%s, %s)', (qa_id, tag_id))
    conn.commit()

# Function to retrieve a question-answer pair and its tags
def get_qa_with_tags(qa_id):
    cursor.execute('''
        SELECT qa_table.question, qa_table.answer, GROUP_CONCAT(tags_table.tag_name SEPARATOR ', ')
        FROM qa_table
        LEFT JOIN qa_tags ON qa_table.qa_id = qa_tags.qa_id
        LEFT JOIN tags_table ON qa_tags.tag_id = tags_table.tag_id
        WHERE qa_table.qa_id = %s
        GROUP BY qa_table.qa_id
    ''', (qa_id,))
    return cursor.fetchone()

# Example usage
insert_qa("Is it possible to register for classes if I applied late?",
          "Yes, you can still register as a non-degree student, but you must be conditionally admitted and complete your application by the fourth week of the semester. Admission as a non-degree student doesn't guarantee subsequent admission as a degree-seeking student.",
          ["Education"])

insert_qa("How can I register for classes if I've received a letter of admission?",
          "You can register online through myIIT by selecting the Academics Tab and choosing the Add or Drop Classes link in the Registration Tools channel.",
          ["Education"])

insert_qa("What is myIIT and how do I access it?",
          "myIIT is Illinois Tech's portal for students, providing access to various services including registration. New students receive a unique identifier (UID), which serves as their username and login. Initial passwords are based on birth dates and CWID numbers.",
          ["Technology", "Education"])

insert_qa("Who should I contact for registration advice?",
          "For registration advice, contact the Office of the Registrar at registrar@iit.edu. For advice on course selection, contact your faculty advisor assigned to you in your admission letter.",
          ["Education", "Administration"])

insert_qa("How can I lift a registration hold?",
          "Identify the type of hold by reviewing the Registration Hold Information on the Registrar's website, then contact the appropriate office for assistance. Resolving holds may require specific actions from your end.",
          ["Education", "Administration"])

insert_qa("How can I change my course registration, sections, or add/drop courses?",
          "You can add and drop courses online through the myIIT portal. If you encounter difficulties, contact the Student Services Center for assistance.",
          ["Education", "Technology"])

insert_qa("What are the tuition options available for graduate studies?",
          "Illinois Tech offers tuition deferral, installment payment plans, and employer reimbursement plans. Additionally, federal student loan programs are available for eligible U.S. citizens and permanent residents.",
          ["Education", "Finance"])

insert_qa("Is financial aid available for graduate students?",
          "Yes, various forms of financial aid such as scholarships, fellowships, and student loans are available. Contact the Office of Financial Aid for information and assistance.",
          ["Education", "Finance"])

insert_qa("What defines full-time status for graduate students and how does it impact financial aid eligibility?",
          "Full-time status typically requires registration in at least nine credit hours for graduate students. It affects eligibility for federal aid and loan deferment. International students may have additional requirements.",
          ["Education", "Finance", "International"])

insert_qa("Does Illinois Tech offer career placement services?",
          "Yes, the Career Services office provides assistance with resume writing, mock interviews, job fairs, and job postings for students. They also offer services for employers seeking to recruit Illinois Tech students.",
          ["Career Services", "Education"])

insert_qa("How can I find part-time on-campus job opportunities?",
          "The Career Services office maintains an online database of on-campus jobs. International students should be aware of restrictions on employment based on visa status.",
          ["Career Services", "International", "Education"])

insert_qa("What academic policies should I be aware of as a graduate student?",
          "Graduate academic policies are outlined in the Graduate Bulletin and the university's student handbook. It's the responsibility of students to ensure compliance with these policies.",
          ["Education", "Policies"])

insert_qa("How long do I have to complete a degree program?",
          "The duration varies by program, but generally, master's degree students must finish within twelve semesters, and Ph.D. students within 12 semesters after approval of their program of study.",
          ["Education", "Policies"])

insert_qa("Can I transfer credits from previous academic work?",
          "Transfer credit policies vary by program, but generally, a limited number of credits earned prior to matriculation may be considered, subject to certain rules and restrictions.",
          ["Education", "Policies"])

insert_qa("How do I apply for graduation?",
          "You must submit an online graduation application by the deadline for the semester of graduation. Detailed instructions are available on the Student Records page in the myIIT portal.",
          ["Graduation", "Education"])

# Retrieve a question-answer pair with its tags
qa_id = 1
qa_with_tags = get_qa_with_tags(qa_id)
print("Question:", qa_with_tags[0])
print("Answer:", qa_with_tags[1])
print("Tags:", qa_with_tags[2])

# Close the connection
conn.close()


