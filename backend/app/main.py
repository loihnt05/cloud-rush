# main.py
from app.routers import pet
from fastapi import FastAPI
app = FastAPI()
app.include_router(pet.router)
@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
