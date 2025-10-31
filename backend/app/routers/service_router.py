from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.dependencies import verify_jwt
from app.schemas.service_schema import ServiceCreate, ServiceUpdate, ServiceResponse
from app.services.service_service import ServiceService

router = APIRouter(prefix="/services", tags=["Services"])


@router.post("/", response_model=ServiceResponse)
def create_service(
    service: ServiceCreate,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Create a new service"""
    try:
        return ServiceService(db).create_service(service)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=list[ServiceResponse])
def list_services(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get all services with pagination"""
    return ServiceService(db).get_all_services(skip, limit)


@router.get("/type/{service_type}", response_model=list[ServiceResponse])
def get_services_by_type(
    service_type: str,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get services filtered by type (hotel, rental_car, package)"""
    try:
        return ServiceService(db).get_services_by_type(service_type)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{service_id}", response_model=ServiceResponse)
def get_service(
    service_id: int,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get a specific service by ID"""
    try:
        return ServiceService(db).get_service(service_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{service_id}", response_model=ServiceResponse)
def update_service(
    service_id: int,
    service_data: ServiceUpdate,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Update a service"""
    try:
        return ServiceService(db).update_service(service_id, service_data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{service_id}")
def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Delete a service"""
    try:
        ServiceService(db).delete_service(service_id)
        return {"message": "Service deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
