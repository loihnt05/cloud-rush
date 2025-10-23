from app.models.user import Role
from sqlalchemy.orm import Session

def get_role_by_name(db: Session, role_name: str):
    return db.query(Role).filter(Role.name == role_name).first()

def get_all_roles(db: Session):
    return db.query(Role).all()
    
def create_role(db: Session, role_data: Role):
    db.add(role_data)
    db.commit()
    db.refresh(role_data)
    return role_data 