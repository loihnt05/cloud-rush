from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.dependencies import verify_jwt
from app.schemas.package_schema import (
    PackageCreate, PackageUpdate, PackageResponse, PackageDetailResponse,
    PackagePlaceCreate, PackagePlaceResponse
)
from app.services.package_service import PackageService

router = APIRouter(prefix="/packages", tags=["Packages"])


@router.post("/", response_model=PackageDetailResponse)
def create_package(
    package: PackageCreate,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Create a new package with optional places"""
    try:
        return PackageService(db).create_package(package)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=list[PackageDetailResponse])
def list_packages(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get all packages with pagination"""
    return PackageService(db).get_all_packages(skip, limit)


@router.get("/{package_id}", response_model=PackageDetailResponse)
def get_package(
    package_id: int,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get a specific package by ID"""
    try:
        return PackageService(db).get_package(package_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{package_id}", response_model=PackageResponse)
def update_package(
    package_id: int,
    package_data: PackageUpdate,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Update a package"""
    try:
        return PackageService(db).update_package(package_id, package_data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{package_id}")
def delete_package(
    package_id: int,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Delete a package"""
    try:
        PackageService(db).delete_package(package_id)
        return {"message": "Package deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/{package_id}/places", response_model=list[PackagePlaceResponse])
def get_package_places(
    package_id: int,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get all places for a specific package"""
    try:
        return PackageService(db).get_package_places(package_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/{package_id}/places", response_model=PackagePlaceResponse)
def add_place_to_package(
    package_id: int,
    place_data: PackagePlaceCreate,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Add a place to a package"""
    try:
        return PackageService(db).add_place_to_package(package_id, place_data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/places/{package_place_id}")
def remove_place_from_package(
    package_place_id: int,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Remove a place from a package"""
    try:
        PackageService(db).remove_place_from_package(package_place_id)
        return {"message": "Place removed from package successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# Factory Pattern Endpoints
@router.post("/factory/create")
def create_package_with_factory(
    service_name: str,
    service_price: float,
    package_name: str,
    total_price: float,
    hotel_id: int = None,
    car_rental_id: int = None,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """
    Create a package using the Factory Pattern.
    This endpoint demonstrates the factory pattern implementation.
    """
    try:
        service, package = PackageService(db).create_package_with_service(
            service_name=service_name,
            service_price=service_price,
            package_name=package_name,
            total_price=total_price,
            hotel_id=hotel_id,
            car_rental_id=car_rental_id
        )
        return {
            "message": "Package created successfully using Factory Pattern",
            "service": {
                "service_id": service.service_id,
                "name": service.name,
                "type": service.type,
                "price": float(service.price)
            },
            "package": {
                "package_id": package.package_id,
                "service_id": package.service_id,
                "name": package.name,
                "total_price": float(package.total_price),
                "hotel_id": package.hotel_id,
                "car_rental_id": package.car_rental_id
            }
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
