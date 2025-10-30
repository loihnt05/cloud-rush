from sqlalchemy.orm import Session

from app.models.booking import Service

def get_services(db: Session):
    return db.query(Service).all()

def create_service(db: Session, data: Service):
    db.add(data)
    db.commit()
    db.refrseh(data)
    return data