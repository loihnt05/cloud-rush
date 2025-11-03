from sqlalchemy.orm import Session, joinedload
from app.models.passenger import EmergencyContact


def get_emergency_contact_by_id(db: Session, contact_id: int):
    """Get an emergency contact by ID"""
    return db.query(EmergencyContact)\
        .options(joinedload(EmergencyContact.passenger))\
        .filter(EmergencyContact.contact_id == contact_id)\
        .first()


def get_all_emergency_contacts(db: Session, skip: int = 0, limit: int = 100):
    """Get all emergency contacts with pagination"""
    return db.query(EmergencyContact)\
        .offset(skip)\
        .limit(limit)\
        .all()


def get_emergency_contacts_by_passenger(db: Session, passenger_id: int):
    """Get all emergency contacts for a specific passenger"""
    return db.query(EmergencyContact)\
        .filter(EmergencyContact.passenger_id == passenger_id)\
        .all()


def create_emergency_contact(db: Session, contact_data: dict):
    """Create a new emergency contact"""
    contact = EmergencyContact(**contact_data)
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact


def create_emergency_contacts_bulk(db: Session, contacts_data: list[dict]):
    """Create multiple emergency contacts at once"""
    contacts = [EmergencyContact(**data) for data in contacts_data]
    db.add_all(contacts)
    db.commit()
    for contact in contacts:
        db.refresh(contact)
    return contacts


def update_emergency_contact(db: Session, contact_id: int, contact_data: dict):
    """Update an emergency contact"""
    contact = get_emergency_contact_by_id(db, contact_id)
    if not contact:
        return None
    
    for key, value in contact_data.items():
        if value is not None and hasattr(contact, key):
            setattr(contact, key, value)
    
    db.commit()
    db.refresh(contact)
    return contact


def delete_emergency_contact(db: Session, contact_id: int):
    """Delete an emergency contact"""
    contact = get_emergency_contact_by_id(db, contact_id)
    if not contact:
        return False
    db.delete(contact)
    db.commit()
    return True


def delete_emergency_contacts_by_passenger(db: Session, passenger_id: int):
    """Delete all emergency contacts for a specific passenger"""
    count = db.query(EmergencyContact)\
        .filter(EmergencyContact.passenger_id == passenger_id)\
        .delete()
    db.commit()
    return count
