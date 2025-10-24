from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2AuthorizationCodeBearer
from fastapi.middleware.cors import CORSMiddleware
from jose import jwt
from jose.exceptions import JWTError, ExpiredSignatureError
from urllib.request import urlopen
import json
from contextlib import asynccontextmanager

from app.routers import (
    booking_router, flight_router, payment_router, pet, revenue_router, user_router
)
from app.core.database import create_tables
from app.core.config import API_AUDIENCE, AUTH0_DOMAIN

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    create_tables()
    yield
    # Shutdown
    pass

app = FastAPI(lifespan=lifespan)
# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
oauth2_scheme = OAuth2AuthorizationCodeBearer(
    tokenUrl=f"https://{AUTH0_DOMAIN}/oauth/token",
    authorizationUrl=f"https://{AUTH0_DOMAIN}/authorize?audience={API_AUDIENCE}",
    refreshUrl=f"https://{AUTH0_DOMAIN}/oauth/token",
    scopes={"openid": "description", "profile": "description", "email": "description"}
)
 
app.include_router(pet.router)
app.include_router(user_router.router)
app.include_router(flight_router.router)
app.include_router(booking_router.router)
app.include_router(payment_router.router)
app.include_router(revenue_router.router)

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


@app.get("/auth")
def auth_required(payload: dict = Depends(verify_jwt)):
    return {"user": payload}

