from tkinter import Place
from sqlalchemy.orm import Session

def get_places(db: Session):
    return db.query(Place).all()

def create_place(db: Session, data: Place):
    db.add(data)
    db.commit()
    db.refresh(data)
    return data