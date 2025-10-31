from sqlalchemy.orm import Session
from app.repositories import trip_plan_repository
from app.models.trip import TripPlan, TripPlanItem
from app.schemas.trip_schema import TripPlanCreate, TripPlanUpdate, TripPlanItemCreate, TripPlanItemUpdate


class TripPlanService:
    def __init__(self, db: Session):
        self.db = db

    def get_trip_plan(self, plan_id: int):
        """Get a trip plan by ID"""
        trip_plan = trip_plan_repository.get_trip_plan_by_id(self.db, plan_id)
        if not trip_plan:
            raise ValueError("Trip plan not found")
        return trip_plan

    def get_all_trip_plans(self, skip: int = 0, limit: int = 100):
        """Get all trip plans"""
        return trip_plan_repository.get_all_trip_plans(self.db, skip, limit)

    def get_user_trip_plans(self, user_id: str):
        """Get all trip plans for a specific user"""
        return trip_plan_repository.get_user_trip_plans(self.db, user_id)

    def create_trip_plan(self, trip_plan_data: TripPlanCreate):
        """Create a new trip plan with optional items"""
        # Extract items data
        items_data = trip_plan_data.items if trip_plan_data.items else []
        trip_plan_dict = trip_plan_data.model_dump(exclude={'items'})
        
        # Create trip plan
        trip_plan = TripPlan(**trip_plan_dict)
        created_trip_plan = trip_plan_repository.create_trip_plan(self.db, trip_plan)
        
        # Add items to trip plan
        if items_data:
            for item_data in items_data:
                trip_plan_item = TripPlanItem(
                    plan_id=created_trip_plan.plan_id,
                    flight_id=item_data.flight_id,
                    service_id=item_data.service_id,
                    place_id=item_data.place_id,
                    scheduled_time=item_data.scheduled_time
                )
                trip_plan_repository.create_trip_plan_item(self.db, trip_plan_item)
        
        # Refresh to get updated relationships
        self.db.refresh(created_trip_plan)
        return created_trip_plan

    def update_trip_plan(self, plan_id: int, trip_plan_data: TripPlanUpdate):
        """Update an existing trip plan"""
        existing_trip_plan = trip_plan_repository.get_trip_plan_by_id(self.db, plan_id)
        if not existing_trip_plan:
            raise ValueError("Trip plan not found")
        
        update_dict = trip_plan_data.model_dump(exclude_unset=True)
        return trip_plan_repository.update_trip_plan(self.db, plan_id, update_dict)

    def delete_trip_plan(self, plan_id: int):
        """Delete a trip plan"""
        existing_trip_plan = trip_plan_repository.get_trip_plan_by_id(self.db, plan_id)
        if not existing_trip_plan:
            raise ValueError("Trip plan not found")
        
        return trip_plan_repository.delete_trip_plan(self.db, plan_id)

    def get_trip_plan_items(self, plan_id: int):
        """Get all items for a specific trip plan"""
        trip_plan = trip_plan_repository.get_trip_plan_by_id(self.db, plan_id)
        if not trip_plan:
            raise ValueError("Trip plan not found")
        
        return trip_plan_repository.get_trip_plan_items_by_plan(self.db, plan_id)

    def add_item_to_trip_plan(self, plan_id: int, item_data: TripPlanItemCreate):
        """Add an item to a trip plan"""
        trip_plan = trip_plan_repository.get_trip_plan_by_id(self.db, plan_id)
        if not trip_plan:
            raise ValueError("Trip plan not found")
        
        trip_plan_item = TripPlanItem(
            plan_id=plan_id,
            flight_id=item_data.flight_id,
            service_id=item_data.service_id,
            place_id=item_data.place_id,
            scheduled_time=item_data.scheduled_time
        )
        return trip_plan_repository.create_trip_plan_item(self.db, trip_plan_item)

    def update_trip_plan_item(self, plan_item_id: int, item_data: TripPlanItemUpdate):
        """Update a trip plan item"""
        existing_item = trip_plan_repository.get_trip_plan_item_by_id(self.db, plan_item_id)
        if not existing_item:
            raise ValueError("Trip plan item not found")
        
        update_dict = item_data.model_dump(exclude_unset=True)
        return trip_plan_repository.update_trip_plan_item(self.db, plan_item_id, update_dict)

    def remove_item_from_trip_plan(self, plan_item_id: int):
        """Remove an item from a trip plan"""
        existing_item = trip_plan_repository.get_trip_plan_item_by_id(self.db, plan_item_id)
        if not existing_item:
            raise ValueError("Trip plan item not found")
        
        return trip_plan_repository.delete_trip_plan_item(self.db, plan_item_id)