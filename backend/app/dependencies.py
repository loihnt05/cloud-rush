from fastapi import HTTPException, Depends, status
from fastapi.security import OAuth2AuthorizationCodeBearer
from app.core.config import AUTH0_DOMAIN, API_AUDIENCE, MGMT_CLIENT_ID, MGMT_CLIENT_SECRET
from fastapi.security import OAuth2AuthorizationCodeBearer
from jose import jwt
from jose.exceptions import JWTError, ExpiredSignatureError
from urllib.request import urlopen
import json
import requests

oauth2_scheme = OAuth2AuthorizationCodeBearer(
    tokenUrl=f"https://{AUTH0_DOMAIN}/oauth/token",
    authorizationUrl=f"https://{AUTH0_DOMAIN}/authorize?audience={API_AUDIENCE}",
    refreshUrl=f"https://{AUTH0_DOMAIN}/oauth/token",
    scopes={"openid": "description", "profile": "description", "email": "description"}
)
def verify_jwt(token: str = Depends(oauth2_scheme)):
    try:
        # Get JWKS
        jsonurl = urlopen(f"https://{AUTH0_DOMAIN}/.well-known/jwks.json")
        jwks = json.loads(jsonurl.read())
        unverified_header = jwt.get_unverified_header(token)

        rsa_key = {}
        for key in jwks["keys"]:
            if key["kid"] == unverified_header["kid"]:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"],
                }

        if rsa_key:
            payload = jwt.decode(
                token,
                rsa_key,
                algorithms=["RS256"],
                audience=API_AUDIENCE,
                issuer=f"https://{AUTH0_DOMAIN}/",
            )
            return payload
    except ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except JWTError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Token invalid: {str(e)}")

    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token header")

def get_mgmt_token():
    res = requests.post(f"https://{AUTH0_DOMAIN}/oauth/token", json={
        "client_id": MGMT_CLIENT_ID,
        "client_secret": MGMT_CLIENT_SECRET,
        "audience": f"https://{AUTH0_DOMAIN}/api/v2/",
        "grant_type": "client_credentials"
    })
    return res.json()["access_token"]

def verify_admin(payload: dict = Depends(verify_jwt)):
    """Verify that the user has admin role"""
    # Check if user has admin role in their Auth0 token
    roles = payload.get("http://localhost:8000/roles", [])
    if "admin" not in roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return payload

def verify_agent_or_admin(payload: dict = Depends(verify_jwt)):
    """Verify that the user has agent or admin role"""
    # Check if user has agent or admin role in their Auth0 token
    roles = payload.get("http://localhost:8000/roles", [])
    if "agent" not in roles and "admin" not in roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Agent or Admin access required"
        )
    return payload

def get_user_roles(payload: dict = Depends(verify_jwt)):
    """Extract user roles from JWT payload"""
    roles = payload.get("http://localhost:8000/roles", [])
    return roles
