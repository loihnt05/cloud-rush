from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.dependencies import verify_jwt
from app.schemas.trip_schema import (
    TripPlanCreate, TripPlanUpdate, TripPlanResponse, TripPlanDetailResponse,
    TripPlanItemCreate, TripPlanItemUpdate, TripPlanItemResponse
)
from app.services.trip_service import TripPlanService

router = APIRouter(prefix="/trip-plans", tags=["Trip Plans"])


@router.post("/", response_model=TripPlanDetailResponse)
def create_trip_plan(
    trip_plan: TripPlanCreate,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Create a new trip plan with optional items"""
    try:
        return TripPlanService(db).create_trip_plan(trip_plan)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=list[TripPlanDetailResponse])
def list_trip_plans(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get all trip plans with pagination"""
    return TripPlanService(db).get_all_trip_plans(skip, limit)


@router.get("/user/{user_id}", response_model=list[TripPlanDetailResponse])
def get_user_trip_plans(
    user_id: str,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get all trip plans for a specific user"""
    return TripPlanService(db).get_user_trip_plans(user_id)


@router.get("/{plan_id}", response_model=TripPlanDetailResponse)
def get_trip_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get a specific trip plan by ID"""
    try:
        return TripPlanService(db).get_trip_plan(plan_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{plan_id}", response_model=TripPlanResponse)
def update_trip_plan(
    plan_id: int,
    trip_plan_data: TripPlanUpdate,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Update a trip plan"""
    try:
        return TripPlanService(db).update_trip_plan(plan_id, trip_plan_data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{plan_id}")
def delete_trip_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Delete a trip plan"""
    try:
        TripPlanService(db).delete_trip_plan(plan_id)
        return {"message": "Trip plan deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/{plan_id}/items", response_model=list[TripPlanItemResponse])
def get_trip_plan_items(
    plan_id: int,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get all items for a specific trip plan"""
    try:
        return TripPlanService(db).get_trip_plan_items(plan_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/{plan_id}/items", response_model=TripPlanItemResponse)
def add_item_to_trip_plan(
    plan_id: int,
    item_data: TripPlanItemCreate,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Add an item to a trip plan"""
    try:
        return TripPlanService(db).add_item_to_trip_plan(plan_id, item_data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/items/{plan_item_id}", response_model=TripPlanItemResponse)
def update_trip_plan_item(
    plan_item_id: int,
    item_data: TripPlanItemUpdate,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Update a trip plan item"""
    try:
        return TripPlanService(db).update_trip_plan_item(plan_item_id, item_data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/items/{plan_item_id}")
def remove_item_from_trip_plan(
    plan_item_id: int,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Remove an item from a trip plan"""
    try:
        TripPlanService(db).remove_item_from_trip_plan(plan_item_id)
        return {"message": "Item removed from trip plan successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
