from sqlalchemy.orm import Session
from app.models.booking import Service
from repositories import service_repository

def get_services(db: Session):
    return service_repository.get_services(db)

def create_service(db: Session, name: str, type: str, price: float):
    service = Service(name=name, type=type, price=price)
    return service_repository.create_service(db, service)
