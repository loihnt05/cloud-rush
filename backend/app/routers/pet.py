from app.schemas.pet_schema import PetCreate, PetResponse
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models import Pet
from app.core.auth import auth0 
from fastapi_auth0 import Auth0User
from app.repositories import pet_repo

router = APIRouter(
    tags=["pets"],
    prefix="/pets"
)

@router.get("", response_model=List[PetResponse])
def read_pets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), user: Auth0User = Depends(auth0.get_user)):
    return pet_repo.get_all(db, skip=skip, limit=limit)

@router.post("", response_model=PetResponse)
def create_pet(pet: PetCreate, db: Session = Depends(get_db)):
    return pet_repo.create(db, pet.model_dump())

@router.get("/{pet_id}", response_model=PetResponse)
def read_pet(pet_id: int, db: Session = Depends(get_db)):
    return pet_repo.get_by_id(db, pet_id=pet_id)
