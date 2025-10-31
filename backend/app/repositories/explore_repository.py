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

def update_explore(db: Session, explore_id: int, data: dict):
    explore = db.query(Explore).filter(Explore.explore_id == explore_id).first()
    for key, value in data.items():
        setattr(explore, key, value)
    db.commit()
    db.refresh(explore)
    return explore

def delete_explore(db: Session, explore_id: int):
    explore = db.query(Explore).filter(Explore.explore_id == explore_id).first()
    db.delete(explore)
    db.commit()
    return explore