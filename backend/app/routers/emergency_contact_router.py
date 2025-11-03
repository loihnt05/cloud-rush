from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.emergency_contact_schema import (
    EmergencyContactCreate,
    EmergencyContactUpdate,
    EmergencyContactResponse
)
from app.services.emergency_contact_service import EmergencyContactService
from app.dependencies import verify_jwt
from typing import List

router = APIRouter(prefix="/emergency-contacts", tags=["Emergency Contacts"])


@router.post("/", response_model=EmergencyContactResponse)
def create_emergency_contact(
    contact: EmergencyContactCreate,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Create a new emergency contact for a passenger"""
    try:
        return EmergencyContactService(db).create_emergency_contact(contact)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/all", response_model=List[EmergencyContactResponse])
def get_all_emergency_contacts(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get all emergency contacts with pagination"""
    return EmergencyContactService(db).get_all_emergency_contacts(skip, limit)


@router.get("/{contact_id}", response_model=EmergencyContactResponse)
def get_emergency_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get a specific emergency contact by ID"""
    try:
        return EmergencyContactService(db).get_emergency_contact(contact_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/passenger/{passenger_id}", response_model=List[EmergencyContactResponse])
def get_emergency_contacts_by_passenger(
    passenger_id: int,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get all emergency contacts for a specific passenger"""
    return EmergencyContactService(db).get_emergency_contacts_by_passenger(passenger_id)


@router.put("/{contact_id}", response_model=EmergencyContactResponse)
def update_emergency_contact(
    contact_id: int,
    contact: EmergencyContactUpdate,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Update emergency contact details"""
    try:
        return EmergencyContactService(db).update_emergency_contact(contact_id, contact)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{contact_id}")
def delete_emergency_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Delete an emergency contact"""
    try:
        return EmergencyContactService(db).delete_emergency_contact(contact_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
