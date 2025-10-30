from app.models.airplane import Seat
from sqlalchemy.orm import Session
from typing import List

def get_seat_by_id(db: Session, seat_id: int):
    return db.query(Seat).filter(Seat.seat_id == seat_id).first()

def get_all_seats(db: Session):
    return db.query(Seat).all()

def get_seats_by_airplane(db: Session, airplane_id: int):
    return db.query(Seat).filter(Seat.airplane_id == airplane_id).all()

def get_seats_by_class(db: Session, airplane_id: int, seat_class: str):
    return db.query(Seat).filter(
        Seat.airplane_id == airplane_id,
        Seat.seat_class == seat_class
    ).all()
    
def create_seat(db: Session, seat_data: Seat):
    db.add(seat_data)
    db.commit()
    db.refresh(seat_data)
    return seat_data

def update_seat(db: Session, seat_id: int, seat_data: dict):
    seat = get_seat_by_id(db, seat_id)
    if not seat:
        return None
    for key, value in seat_data.items():
        setattr(seat, key, value)
    db.commit()
    db.refresh(seat)
    return seat
    
def delete_seat(db: Session, seat_id: int):
    seat = get_seat_by_id(db, seat_id)
    if not seat:
        return False
    db.delete(seat)
    db.commit()
    return True