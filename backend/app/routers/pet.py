from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models import Pet
from pydantic import BaseModel
from app.core.auth import auth0 
from fastapi_auth0 import Auth0User

router = APIRouter(
    tags=["pets"],
    prefix="/pets"
)

class PetCreate(BaseModel):
    name: str
    species: str
    breed: str = None
    age: int = None
    owner_id: str = None

class PetResponse(BaseModel):
    id: int
    name: str
    species: str
    breed: str = None
    age: int = None
    owner_id: str = None

    class Config:
        from_attributes = True

@router.get("", response_model=List[PetResponse])
def read_pets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), user: Auth0User = Depends(auth0.get_user)):
    pets = db.query(Pet).offset(skip).limit(limit).all()
    return pets

@router.post("", response_model=PetResponse)
def create_pet(pet: PetCreate, db: Session = Depends(get_db), user: Auth0User = Depends(auth0.get_user)):
    pet_data = pet.model_dump()
    if pet.owner_id is None:
        pet_data['owner_id'] = user.sub  # Set owner to JWT sub claim
    db_pet = Pet(**pet_data)
    db.add(db_pet)
    db.commit()
    db.refresh(db_pet)
    return db_pet

@router.get("/{pet_id}", response_model=PetResponse)
def read_pet(pet_id: int, db: Session = Depends(get_db), user: Auth0User = Depends(auth0.get_user)):
    pet = db.query(Pet).filter(Pet.id == pet_id).first()
    if pet is None:
        raise HTTPException(status_code=404, detail="Pet not found")
    return pet
