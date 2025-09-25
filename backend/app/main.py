from fastapi import Depends, FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from fastapi_auth0 import Auth0User
from app.routers import pet
from app.core.database import create_tables
from app.core.auth import auth0
import base64
import json
import httpx
from app.core.config import AUTH0_DOMAIN

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

# Routers
app.include_router(pet.router)


@app.get("/private")
async def private_route(user: Auth0User = Depends(auth0.get_user), request: Request = None):
    print(f"User object: {user}")
    print(f"User email: {user.email}")
    print(f"User id: {user.id}")
    
    auth_header = request.headers.get('authorization', '') if request else ''
    if not auth_header.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    token = auth_header[7:]
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"https://{AUTH0_DOMAIN}/userinfo",
                headers={"Authorization": f"Bearer {token}"}
            )
            if response.status_code == 200:
                user_info = response.json()
                print(f"UserInfo response: {user_info}")
                return {
                    "message": "This is a private route",
                    "email": user_info.get('email'),  
                    "user_email_from_object": user.email, 
                    "user_info": user_info
                }
            else:
                print(f"UserInfo request failed: {response.status_code} - {response.text}")
                return {
                    "message": "This is a private route",
                    "email": None,
                    "error": f"UserInfo request failed: {response.status_code}"
                }
        except Exception as e:
            print(f"Error fetching user info: {e}")
            raise HTTPException(status_code=400, detail=f"Error fetching user info: {str(e)}")
    