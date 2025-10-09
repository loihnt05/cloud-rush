from pydantic import BaseModel

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