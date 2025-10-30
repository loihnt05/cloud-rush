from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.routers import (
    auth_router, booking_router, flight_router, payment_router, pet, revenue_router, seat_router, airplane_router
)
from app.core.database import create_tables

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

 
app.include_router(auth_router.router)
app.include_router(airplane_router.router)
app.include_router(seat_router.router)
app.include_router(flight_router.router)
app.include_router(booking_router.router)
app.include_router(payment_router.router)
app.include_router(revenue_router.router)
app.include_router(pet.router)

