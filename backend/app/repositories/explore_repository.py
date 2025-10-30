from sqlalchemy.orm import Session
from app.models.place import Explore

def get_explores_by_place(db: Session, place_id: int):
    return db.query(Explore).filter(Explore.place_id == place_id).first()

def get_explores(db: Session):
    return db.query(Explore).all()
    
def create_explore(db: Session, data: Explore):
    db.add(data)
    db.commit()
    db.refresh(data)
    return data