from sqlalchemy.orm import Session
from app.models.airport import Airport


def get_airport_by_id(db: Session, airport_id: int):
    """Get an airport by ID"""
    return db.query(Airport).filter(Airport.airport_id == airport_id).first()


def get_airport_by_iata_code(db: Session, iata_code: str):
    """Get an airport by IATA code"""
    return db.query(Airport).filter(Airport.iata_code == iata_code.upper()).first()


def get_all_airports(db: Session, skip: int = 0, limit: int = 100):
    """Get all airports with pagination"""
    return db.query(Airport).offset(skip).limit(limit).all()


def get_airports_by_city(db: Session, city: str):
    """Get airports filtered by city"""
    return db.query(Airport).filter(Airport.city.ilike(f"%{city}%")).all()


def get_airports_by_country(db: Session, country: str):
    """Get airports filtered by country"""
    return db.query(Airport).filter(Airport.country.ilike(f"%{country}%")).all()


def create_airport(db: Session, airport: Airport):
    """Create a new airport"""
    db.add(airport)
    db.commit()
    db.refresh(airport)
    return airport


def update_airport(db: Session, airport_id: int, airport_data: dict):
    """Update an existing airport"""
    airport = get_airport_by_id(db, airport_id)
    if not airport:
        return None
    for key, value in airport_data.items():
        if value is not None:
            setattr(airport, key, value)
    db.commit()
    db.refresh(airport)
    return airport


def delete_airport(db: Session, airport_id: int):
    """Delete an airport"""
    airport = get_airport_by_id(db, airport_id)
    if not airport:
        return False
    db.delete(airport)
    db.commit()
    return True