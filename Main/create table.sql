CREATE DATABASE pj;
use pj;
CREATE TABLE questions (
    question_id INT AUTO_INCREMENT PRIMARY KEY,
    question_text TEXT
);

CREATE TABLE answers (
    answer_id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT,
    answer_text TEXT,
    FOREIGN KEY (question_id) REFERENCES questions(question_id)
);

CREATE TABLE options (
    option_id INT AUTO_INCREMENT PRIMARY KEY,
    answer_id INT,
    option_text VARCHAR(255),
    option_answer TEXT,
    FOREIGN KEY (answer_id) REFERENCES answers(answer_id)
);

CREATE TABLE tags (
    tag_id INT AUTO_INCREMENT PRIMARY KEY,
    tag_name VARCHAR(50) UNIQUE
);

CREATE TABLE question_tags (
    question_id INT,
    tag_id INT,
    FOREIGN KEY (question_id) REFERENCES questions(question_id),
    FOREIGN KEY (tag_id) REFERENCES tags(tag_id)
);

CREATE TABLE tag_responses (
    response_id INT AUTO_INCREMENT PRIMARY KEY,
    tag_id INT,
    response_text VARCHAR(255),
    FOREIGN KEY (tag_id) REFERENCES tags(tag_id)
);

CREATE TABLE vectors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT,
    vector TEXT,
    FOREIGN KEY (question_id) REFERENCES questions(question_id)
);

CREATE TABLE unanswered (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question TEXT,
    answer TEXT,
    tag VARCHAR(50),
    option_text VARCHAR(150),
    option_answer TEXT
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255),
    role ENUM('Admin', 'Manager')
);

INSERT INTO users (email, role) VALUES ('YOUR_EMAIL_ID@hawk.iit.edu','Admin');
OR 
INSERT INTO users (email, role) VALUES ('YOUR_EMAIL_ID@hawk.iit.edu','Manager');