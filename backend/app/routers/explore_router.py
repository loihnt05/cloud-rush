from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.dependencies import verify_jwt
from app.schemas.explore_schema import (
    ExploreCreate, ExploreUpdate, ExploreResponse,
    PlaceCreate, PlaceUpdate, PlaceResponse
)
from app.services.explore_service import ExploreService, PlaceService

router = APIRouter(tags=["Explore"])


# Explore endpoints
@router.post("/explores", response_model=ExploreResponse)
def create_explore(
    explore: ExploreCreate,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Create a new explore"""
    try:
        return ExploreService(db).create_explore(explore)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/explores", response_model=list[ExploreResponse])
def list_explores(
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get all explores"""
    return ExploreService(db).get_all_explores()


@router.get("/explores/place/{place_id}", response_model=ExploreResponse)
def get_explores_by_place(
    place_id: int,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get explores by place ID"""
    try:
        result = ExploreService(db).get_explores_by_place(place_id)
        if not result:
            raise HTTPException(status_code=404, detail="No explores found for this place")
        return result
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/explores/{explore_id}", response_model=ExploreResponse)
def update_explore(
    explore_id: int,
    explore_data: ExploreUpdate,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Update an explore"""
    try:
        return ExploreService(db).update_explore(explore_id, explore_data)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/explores/{explore_id}")
def delete_explore(
    explore_id: int,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Delete an explore"""
    try:
        ExploreService(db).delete_explore(explore_id)
        return {"message": "Explore deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


# Place endpoints
@router.post("/places", response_model=PlaceResponse)
def create_place(
    place: PlaceCreate,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Create a new place"""
    try:
        return PlaceService(db).create_place(place)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/places", response_model=list[PlaceResponse])
def list_places(
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get all places"""
    return PlaceService(db).get_all_places()


@router.get("/places/{place_id}", response_model=PlaceResponse)
def get_place(
    place_id: int,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get a specific place by ID"""
    try:
        return PlaceService(db).get_place(place_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/places/{place_id}", response_model=PlaceResponse)
def update_place(
    place_id: int,
    place_data: PlaceUpdate,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Update a place"""
    try:
        return PlaceService(db).update_place(place_id, place_data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
