# routers/role_request.py
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.dependencies import verify_jwt

router = APIRouter()

class RoleRequestSchema(BaseModel):
    requested_role: str

def get_current_user(payload: dict = Depends(verify_jwt)):
    return payload["sub"]

