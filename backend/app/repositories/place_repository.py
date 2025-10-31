from sqlalchemy.orm import Session
from app.models.place import Place

def get_places(db: Session):
    return db.query(Place).all()

def create_place(db: Session, data: Place):
    db.add(data)
    db.commit()
    db.refresh(data)
    return data

def get_place_by_id(db: Session, place_id: int):
    return db.query(Place).filter(Place.place_id == place_id).first()

def update_place(db: Session, place_id: int, data: dict):
    place = db.query(Place).filter(Place.place_id == place_id).first()
    for key, value in data.items():
        setattr(place, key, value)
    db.commit()
    db.refresh(place)
    return place