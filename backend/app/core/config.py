import os 
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
API_AUDIENCE = os.getenv("API_AUDIENCE") 
MGMT_CLIENT_ID = os.getenv("MGMT_CLIENT_ID")
MGMT_CLIENT_SECRET = os.getenv("MGMT_CLIENT_SECRET")
ROLE_ID_MAP = {
    "admin": os.getenv("ADMIN_ROLE_ID"),
    "agent": os.getenv("AGENT_ROLE_ID"),
}
ALGORITHMS = ["RS256"]
