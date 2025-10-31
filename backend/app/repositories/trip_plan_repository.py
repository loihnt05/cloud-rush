from sqlalchemy.orm import Session, joinedload
from app.models.trip import TripPlan, TripPlanItem


# TripPlan operations
def get_trip_plan_by_id(db: Session, plan_id: int):
    """Get a trip plan by ID with all relationships loaded"""
    return db.query(TripPlan)\
        .options(joinedload(TripPlan.trip_plan_items))\
        .filter(TripPlan.plan_id == plan_id)\
        .first()


def get_all_trip_plans(db: Session, skip: int = 0, limit: int = 100):
    """Get all trip plans with pagination"""
    return db.query(TripPlan)\
        .options(joinedload(TripPlan.trip_plan_items))\
        .offset(skip)\
        .limit(limit)\
        .all()


def get_user_trip_plans(db: Session, user_id: str):
    """Get all trip plans for a specific user"""
    return db.query(TripPlan)\
        .options(joinedload(TripPlan.trip_plan_items))\
        .filter(TripPlan.user_id == user_id)\
        .all()


def create_trip_plan(db: Session, trip_plan_data: TripPlan):
    """Create a new trip plan"""
    db.add(trip_plan_data)
    db.commit()
    db.refresh(trip_plan_data)
    return trip_plan_data


def update_trip_plan(db: Session, plan_id: int, trip_plan_data: dict):
    """Update an existing trip plan"""
    trip_plan = get_trip_plan_by_id(db, plan_id)
    if not trip_plan:
        return None
    for key, value in trip_plan_data.items():
        if value is not None:
            setattr(trip_plan, key, value)
    db.commit()
    db.refresh(trip_plan)
    return trip_plan


def delete_trip_plan(db: Session, plan_id: int):
    """Delete a trip plan"""
    trip_plan = get_trip_plan_by_id(db, plan_id)
    if not trip_plan:
        return False
    db.delete(trip_plan)
    db.commit()
    return True


# TripPlanItem operations
def get_trip_plan_item_by_id(db: Session, plan_item_id: int):
    """Get a trip plan item by ID"""
    return db.query(TripPlanItem)\
        .filter(TripPlanItem.plan_item_id == plan_item_id)\
        .first()


def get_trip_plan_items_by_plan(db: Session, plan_id: int):
    """Get all items for a specific trip plan"""
    return db.query(TripPlanItem)\
        .filter(TripPlanItem.plan_id == plan_id)\
        .all()


def create_trip_plan_item(db: Session, trip_plan_item_data: TripPlanItem):
    """Add an item to a trip plan"""
    db.add(trip_plan_item_data)
    db.commit()
    db.refresh(trip_plan_item_data)
    return trip_plan_item_data


def update_trip_plan_item(db: Session, plan_item_id: int, trip_plan_item_data: dict):
    """Update a trip plan item"""
    trip_plan_item = get_trip_plan_item_by_id(db, plan_item_id)
    if not trip_plan_item:
        return None
    for key, value in trip_plan_item_data.items():
        if value is not None:
            setattr(trip_plan_item, key, value)
    db.commit()
    db.refresh(trip_plan_item)
    return trip_plan_item


def delete_trip_plan_item(db: Session, plan_item_id: int):
    """Remove an item from a trip plan"""
    trip_plan_item = get_trip_plan_item_by_id(db, plan_item_id)
    if not trip_plan_item:
        return False
    db.delete(trip_plan_item)
    db.commit()
    return True
