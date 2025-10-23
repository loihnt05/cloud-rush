from sqlalchemy.orm import Session
from app.models.user import User
from app.repositories import user_repository

def get_user(db: Session, user_id: int):
    user = user_repository.get_user_by_id(db, user_id)
    if not user:
        raise ValueError("User not found")
    return user

def get_users(db: Session):
    return user_repository.get_all_users(db)

def create_user(db: Session, email: str, name: str, provider: str, provider_id: str, avatar_url: str = None):
    existing = user_repository.get_user_by_email(db, email)
    if existing:
        return existing
    user = User(email=email, name=name, provider=provider, provider_id=provider_id, avatar_url=avatar_url)
    return user_repository.create_user(db, user)

def update_user(db: Session, user_id: int, user_data: dict):
    user = user_repository.get_user_by_id(db, user_id)
    if not user:
        raise ValueError("User not found")
    for key, value in user_data.items():
        setattr(user, key, value)
    return user_repository.update_user(db, user)

def delete_user(db: Session, user_id: int):
    user = user_repository.get_user_by_id(db, user_id)
    if not user:
        raise ValueError("User not found")
    return user_repository.delete_user(db, user_id)