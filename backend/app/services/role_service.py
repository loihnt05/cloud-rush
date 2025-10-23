from sqlalchemy.orm import Session

from app.models.user import Role
from app.repositories import role_repository

def get_roles(db: Session):
    return role_repository.get_all_roles(db)

def get_role_name(db: Session, role_id: int):
    return role_repository.get_role_by_id(db, role_id)

def create_role(db: Session, name: str, description: str = None):
    role_data = Role(name=name, description=description)
    return role_repository.create_role(db, role_data)