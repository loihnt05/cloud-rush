from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.dependencies import verify_jwt
from app.schemas.airplane_schema import AirplaneCreate, AirplaneResponse
from app.services.airplane_service import AirplaneService

router = APIRouter(prefix="/airplanes", tags=["Airplanes"])


@router.post("/", response_model=AirplaneResponse)
def create_airplane(airplane: AirplaneCreate, db: Session = Depends(get_db), payload: dict = Depends(verify_jwt)
                    ):
    """Create a new airplane"""
    return AirplaneService(db).create_airplane(airplane)


@router.get("/all", response_model=list[AirplaneResponse])
def list_airplanes(db: Session = Depends(get_db), payload: dict = Depends(verify_jwt)):
    """Get all airplanes"""
    return AirplaneService(db).get_all_airplanes()


@router.get("/{airplane_id}", response_model=AirplaneResponse)
def get_airplane(airplane_id: int, db: Session = Depends(get_db), payload: dict = Depends(verify_jwt)):
    """Get a specific airplane by ID"""
    try:
        airplane = AirplaneService(db).get_airplane(airplane_id)
        return airplane
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{airplane_id}", response_model=AirplaneResponse)
def update_airplane(airplane_id: int, airplane_data: dict, db: Session = Depends(get_db), payload: dict = Depends(verify_jwt)):
    """Update an airplane"""
    try:
        return AirplaneService(db).update_airplane(airplane_id, airplane_data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{airplane_id}")
def delete_airplane(airplane_id: int, db: Session = Depends(get_db), payload: dict = Depends(verify_jwt)):
    """Delete an airplane"""
    try:
        AirplaneService(db).delete_airplane(airplane_id)
        return {"message": "Airplane deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
