from typing import Optional
from app.dependencies import get_auth0_claims
from app.routers import (
    airplane_router,
    booking_router,
    flight_router,
    payment_router,
    pet,
    revenue_router,
    seat_router,
    user_router
)
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import Base, create_tables
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
 
app.include_router(pet.router)
app.include_router(user_router.router)
app.include_router(flight_router.router)
app.include_router(airplane_router.router)
app.include_router(seat_router.router)
app.include_router(booking_router.router)
app.include_router(payment_router.router)
app.include_router(revenue_router.router)

@app.get("/auth")
async def auth_required(claims: dict = Depends(get_auth0_claims)):
    """
    A protected endpoint that requires a valid Auth0 token.
    Returns user information from the decoded token.
    """
    sub = claims.get("sub")
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token missing 'sub' claim"
        )
    
    return {
        "message": "Login successful!",
        "sub": sub,
        "user_id": sub,
        "email": claims.get("email"),
        "all_claims": claims
    }

@app.get("/protected")
async def protected_route(claims: dict = Depends(get_auth0_claims)):
    """
    Another protected endpoint demonstrating the same authentication.
    """
    sub = claims.get("sub")
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token missing 'sub' claim"
        )
    
    return {
        "message": "Access granted to protected resource!",
        "sub": sub,
        "user_id": sub,
        "all_claims": claims
    }