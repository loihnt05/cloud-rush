from fastapi import APIRouter

router = APIRouter(
    tags=["pets"],
    prefix="/pets"
)


@router.get("/")
def read_pets():
    return [{"pet_id": 1, "name": "Fido"}, {"pet_id": 2, "name": "Whiskers"}, {"pet_id": 3, "name": "Rex"}]
