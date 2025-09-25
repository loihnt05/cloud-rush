from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from fastapi_auth0 import Auth0User
from app.routers import pet
from app.core.database import create_tables
from app.core.auth import auth0

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
def private_route(user: Auth0User = Depends(auth0.get_user)):
    return {"message": f"Hello {user.email}"}