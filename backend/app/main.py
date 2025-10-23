from typing import Optional
from app.routers import booking_router, flight_router, payment_router, pet, revenue_router, user_router
from fastapi import FastAPI, Depends  
from fastapi.security import OAuth2AuthorizationCodeBearer
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import Base, create_tables
from contextlib import asynccontextmanager
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
oauth2_scheme = OAuth2AuthorizationCodeBearer(
    tokenUrl=f"https://{AUTH0_DOMAIN}/oauth/token",
    authorizationUrl=f"https://{AUTH0_DOMAIN}/authorize",
    refreshUrl=f"https://{AUTH0_DOMAIN}/oauth/token",
    scopes={"openid": "description", "profile": "description", "email": "description"}
)
 
app.include_router(pet.router)
app.include_router(user_router.router)
app.include_router(flight_router.router)
app.include_router(booking_router.router)
app.include_router(payment_router.router)
app.include_router(revenue_router.router)

@app.get("/auth",)  
def auth_required(token: Optional[str] = Depends(oauth2_scheme)):  
  return {"Logged in"}


