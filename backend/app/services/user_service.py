from sqlalchemy.orm import Session
from uuid import UUID
from app.models.user import User
from app.repositories import user_repository
from app.schemas.user_schema import UserCreate

class UserService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_user(self, user_id: str | UUID):
        """Get a user by ID"""
        if isinstance(user_id, str):
            user_id = UUID(user_id)
        user = user_repository.get_user_by_id(self.db, user_id)
        if not user:
            raise ValueError("User not found")
        return user
    
    def get_all_users(self):
        """Get all users"""
        return user_repository.get_all_users(self.db)
    
    def create_user(self, user_data: UserCreate):
        """Create a new user"""
        # Check if user already exists by email
        existing = user_repository.get_user_by_email(self.db, user_data.email)
        if existing:
            return existing
        
        # Convert Pydantic model to dict
        user_dict = user_data.model_dump()
        return user_repository.create_user(self.db, user_dict)
    
    def update_user(self, user_id: str | UUID, user_data: dict):
        """Update an existing user"""
        if isinstance(user_id, str):
            user_id = UUID(user_id)
        
        user = user_repository.get_user_by_id(self.db, user_id)
        if not user:
            raise ValueError("User not found")
        
        return user_repository.update_user(self.db, user_id, user_data)
    
    def delete_user(self, user_id: str | UUID):
        """Delete a user"""
        if isinstance(user_id, str):
            user_id = UUID(user_id)
        
        user = user_repository.get_user_by_id(self.db, user_id)
        if not user:
            raise ValueError("User not found")
        
        return user_repository.delete_user(self.db, user_id)