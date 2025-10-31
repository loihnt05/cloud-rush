from sqlalchemy.orm import Session
from app.models.booking import Service


def get_service_by_id(db: Session, service_id: int):
    """Get a service by ID"""
    return db.query(Service).filter(Service.service_id == service_id).first()


def get_all_services(db: Session, skip: int = 0, limit: int = 100):
    """Get all services with pagination"""
    return db.query(Service).offset(skip).limit(limit).all()


def get_services_by_type(db: Session, service_type: str):
    """Get services filtered by type"""
    return db.query(Service).filter(Service.type == service_type).all()


def create_service(db: Session, service_data: Service):
    """Create a new service"""
    db.add(service_data)
    db.commit()
    db.refresh(service_data)
    return service_data


def update_service(db: Session, service_id: int, service_data: dict):
    """Update an existing service"""
    service = get_service_by_id(db, service_id)
    if not service:
        return None
    for key, value in service_data.items():
        if value is not None:
            setattr(service, key, value)
    db.commit()
    db.refresh(service)
    return service


def delete_service(db: Session, service_id: int):
    """Delete a service"""
    service = get_service_by_id(db, service_id)
    if not service:
        return False
    db.delete(service)
    db.commit()
    return True