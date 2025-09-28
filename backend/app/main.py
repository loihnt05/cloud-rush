from typing import Optional
from fastapi import FastAPI, Depends  
from fastapi.security import OAuth2AuthorizationCodeBearer
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import create_tables
from contextlib import asynccontextmanager

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
    tokenUrl="https://{DOMAIN}/oauth/token",  
    authorizationUrl="https://{DOMAIN}/authorize",  
    refreshUrl="https://{DOMAIN}/oauth/token",
    scopes={"openid": "description", "profile": "description", "email": "description"}  
)
 
 
@app.get("/auth",)  
def auth_required(token: Optional[str] = Depends(oauth2_scheme)):  
  return {"Logged in"}


