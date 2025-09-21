import os 
from dotenv import load_dotenv

load_dotenv()

CLIENT_ID = os.getenv("client-id", None)
CLIENT_SECRET = os.getenv("client-secret", None)