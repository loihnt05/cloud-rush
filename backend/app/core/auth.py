from app.core.config import API_AUDIENCE, AUTH0_DOMAIN
from fastapi_auth0 import Auth0

auth0 = Auth0(domain=AUTH0_DOMAIN, api_audience=API_AUDIENCE)