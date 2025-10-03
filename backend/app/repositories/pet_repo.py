from http.client import HTTPException
from app import models
from typing import List, Optional
from app.models.pet_model import Pet
from sqlalchemy.orm import Session

def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[Pet]:
    return db.query(models.Pet).offset(skip).limit(limit).all()

def create(db: Session, pet: dict) -> Pet:
    db_pet = models.Pet(**pet)
    db.add(db_pet)
    db.commit()
    db.refresh(db_pet)
    return db_pet

def get_by_id(db: Session, pet_id: int) -> Optional[Pet]:
    pet = db.query(Pet).filter(Pet.id == pet_id).first()
    if pet is None:
        raise HTTPException(status_code=404, detail="Pet not found")
    return pet