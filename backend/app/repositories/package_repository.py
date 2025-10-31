from sqlalchemy.orm import Session, joinedload
from app.models.package import BookingPackage, PackagePlace


def get_package_by_id(db: Session, package_id: int):
    """Get a package by ID with all relationships loaded"""
    return db.query(BookingPackage)\
        .options(
            joinedload(BookingPackage.hotel),
            joinedload(BookingPackage.car_rental),
            joinedload(BookingPackage.package_places)
        )\
        .filter(BookingPackage.package_id == package_id)\
        .first()


def get_all_packages(db: Session, skip: int = 0, limit: int = 100):
    """Get all packages with pagination"""
    return db.query(BookingPackage)\
        .options(
            joinedload(BookingPackage.hotel),
            joinedload(BookingPackage.car_rental),
            joinedload(BookingPackage.package_places)
        )\
        .offset(skip)\
        .limit(limit)\
        .all()


def create_package(db: Session, package_data: BookingPackage):
    """Create a new package"""
    db.add(package_data)
    db.commit()
    db.refresh(package_data)
    return package_data


def update_package(db: Session, package_id: int, package_data: dict):
    """Update an existing package"""
    package = get_package_by_id(db, package_id)
    if not package:
        return None
    for key, value in package_data.items():
        if value is not None:
            setattr(package, key, value)
    db.commit()
    db.refresh(package)
    return package


def delete_package(db: Session, package_id: int):
    """Delete a package"""
    package = get_package_by_id(db, package_id)
    if not package:
        return False
    db.delete(package)
    db.commit()
    return True


# Package Places operations
def get_package_places_by_package_id(db: Session, package_id: int):
    """Get all places for a specific package"""
    return db.query(PackagePlace)\
        .filter(PackagePlace.package_id == package_id)\
        .all()


def add_place_to_package(db: Session, package_place_data: PackagePlace):
    """Add a place to a package"""
    db.add(package_place_data)
    db.commit()
    db.refresh(package_place_data)
    return package_place_data


def remove_place_from_package(db: Session, package_place_id: int):
    """Remove a place from a package"""
    package_place = db.query(PackagePlace)\
        .filter(PackagePlace.package_place_id == package_place_id)\
        .first()
    if not package_place:
        return False
    db.delete(package_place)
    db.commit()
    return True
