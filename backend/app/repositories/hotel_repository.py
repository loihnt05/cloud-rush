from sqlalchemy.orm import Session
from app.models.hotel import Hotel


def get_hotel_by_id(db: Session, hotel_id: int):
    """Get a hotel by ID"""
    return db.query(Hotel).filter(Hotel.hotel_id == hotel_id).first()


def get_all_hotels(db: Session, skip: int = 0, limit: int = 100):
    """Get all hotels with pagination"""
    return db.query(Hotel).offset(skip).limit(limit).all()


def get_hotels_by_stars(db: Session, stars: int):
    """Get hotels filtered by star rating"""
    return db.query(Hotel).filter(Hotel.stars == stars).all()


def create_hotel(db: Session, hotel_data: Hotel):
    """Create a new hotel"""
    db.add(hotel_data)
    db.commit()
    db.refresh(hotel_data)
    return hotel_data


def update_hotel(db: Session, hotel_id: int, hotel_data: dict):
    """Update an existing hotel"""
    hotel = get_hotel_by_id(db, hotel_id)
    if not hotel:
        return None
    for key, value in hotel_data.items():
        if value is not None:
            setattr(hotel, key, value)
    db.commit()
    db.refresh(hotel)
    return hotel


def delete_hotel(db: Session, hotel_id: int):
    """Delete a hotel"""
    hotel = get_hotel_by_id(db, hotel_id)
    if not hotel:
        return False
    db.delete(hotel)
    db.commit()
    return True
