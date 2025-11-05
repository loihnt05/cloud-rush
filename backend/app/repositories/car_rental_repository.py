from sqlalchemy.orm import Session, joinedload
from app.models.car_rental import CarRental


def get_car_rental_by_id(db: Session, car_rental_id: int):
    """Get a car rental by ID"""
    return db.query(CarRental).filter(CarRental.car_rental_id == car_rental_id).first()


def get_all_car_rentals(db: Session, skip: int = 0, limit: int = 100):
    """Get all car rentals with pagination - no eager loading to avoid unnecessary joins"""
    return db.query(CarRental).offset(skip).limit(limit).all()


def get_available_car_rentals(db: Session):
    """Get all available car rentals"""
    return db.query(CarRental).filter(CarRental.available == True).all()


def get_car_rentals_by_brand(db: Session, brand: str):
    """Get car rentals filtered by brand"""
    return db.query(CarRental).filter(CarRental.brand.ilike(f"%{brand}%")).all()


def create_car_rental(db: Session, car_rental_data: CarRental):
    """Create a new car rental"""
    db.add(car_rental_data)
    db.commit()
    db.refresh(car_rental_data)
    return car_rental_data


def update_car_rental(db: Session, car_rental_id: int, car_rental_data: dict):
    """Update an existing car rental"""
    car_rental = get_car_rental_by_id(db, car_rental_id)
    if not car_rental:
        return None
    for key, value in car_rental_data.items():
        if value is not None:
            setattr(car_rental, key, value)
    db.commit()
    db.refresh(car_rental)
    return car_rental


def delete_car_rental(db: Session, car_rental_id: int):
    """Delete a car rental"""
    car_rental = get_car_rental_by_id(db, car_rental_id)
    if not car_rental:
        return False
    db.delete(car_rental)
    db.commit()
    return True
