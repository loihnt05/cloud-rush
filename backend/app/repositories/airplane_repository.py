from app.models.airplane import Airplane
from sqlalchemy.orm import Session

def get_airplane_by_id(db: Session, airplane_id: int):
    return db.query(Airplane).filter(Airplane.airplane_id == airplane_id).first()

def get_all_airplanes(db: Session):
    return db.query(Airplane).all()
    
def create_airplane(db: Session, airplane_data: Airplane):
    db.add(airplane_data)
    db.commit()
    db.refresh(airplane_data)
    return airplane_data

def update_airplane(db: Session, airplane_id: int, airplane_data: dict):
    airplane = get_airplane_by_id(db, airplane_id)
    if not airplane:
        return None
    for key, value in airplane_data.items():
        setattr(airplane, key, value)
    db.commit()
    db.refresh(airplane)
    return airplane
    
def delete_airplane(db: Session, airplane_id: int):
    airplane = get_airplane_by_id(db, airplane_id)
    if not airplane:
        return False
    db.delete(airplane)
    db.commit()
    return True