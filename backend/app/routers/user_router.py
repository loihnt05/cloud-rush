from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.user_schema import UserCreate, UserResponse
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    return UserService(db).create_user(user)

@router.get("/all", response_model=list[UserResponse])
def list_users(db: Session = Depends(get_db)):
    return UserService(db).get_all_users()

@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: str, db: Session = Depends(get_db)):
    user = UserService(db).get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
