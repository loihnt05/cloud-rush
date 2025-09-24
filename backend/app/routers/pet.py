from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models import Pet, User
from pydantic import BaseModel

router = APIRouter(
    tags=["pets"],
    prefix="/pets"
)

class PetCreate(BaseModel):
    name: str
    species: str
    breed: str = None
    age: int = None
    owner_id: int = None

class PetResponse(BaseModel):
    id: int
    name: str
    species: str
    breed: str = None
    age: int = None
    owner_id: int = None

    class Config:
        from_attributes = True

@router.get("/", response_model=List[PetResponse])
def read_pets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    pets = db.query(Pet).offset(skip).limit(limit).all()
    return pets

@router.post("/", response_model=PetResponse)
def create_pet(pet: PetCreate, db: Session = Depends(get_db)):
    if pet.owner_id is not None:
        user = db.query(User).filter(User.id == pet.owner_id).first()
        if user is None:
            raise HTTPException(status_code=400, detail="Owner not found")
    db_pet = Pet(**pet.model_dump())
    db.add(db_pet)
    db.commit()
    db.refresh(db_pet)
    return db_pet

@router.get("/{pet_id}", response_model=PetResponse)
def read_pet(pet_id: int, db: Session = Depends(get_db)):
    pet = db.query(Pet).filter(Pet.id == pet_id).first()
    if pet is None:
        raise HTTPException(status_code=404, detail="Pet not found")
    return pet
