import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'IITORSP@CHATBOT'
    SESSION_TYPE = 'filesystem'
    SESSION_PERMANENT = False
    SESSION_USE_SIGNER = True
    SESSION_FILE_THRESHOLD = 400
    SESSION_FILE_DIR = os.path.join(os.path.dirname(__file__), 'sessions')