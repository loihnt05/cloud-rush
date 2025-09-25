from app.core.config import API_AUDIENCE, AUTH0_DOMAIN
from fastapi_auth0 import Auth0

# Create Auth0 instance that can handle ID tokens  
auth0 = Auth0(
    domain=AUTH0_DOMAIN, 
    api_audience=API_AUDIENCE,
    auto_error=False 
)