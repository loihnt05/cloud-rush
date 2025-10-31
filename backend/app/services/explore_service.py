from sqlalchemy.orm import Session
from app.models.place import Explore, Place
from app.repositories import explore_repository, place_repository
from app.schemas.explore_schema import ExploreCreate, ExploreUpdate


class ExploreService:
    def __init__(self, db: Session):
        self.db = db

    def get_all_explores(self):
        """Get all explores"""
        return explore_repository.get_explores(self.db)

    def get_explores_by_place(self, place_id: int):
        """Get explores filtered by place"""
        return explore_repository.get_explores_by_place(self.db, place_id)

    def create_explore(self, explore_data: ExploreCreate):
        """Create a new explore"""
        explore_dict = explore_data.model_dump()
        explore = Explore(**explore_dict)
        return explore_repository.create_explore(self.db, explore)

    def update_explore(self, explore_id: int, explore_data: ExploreUpdate):
        """Update an existing explore"""
        update_dict = explore_data.model_dump(exclude_unset=True)
        return explore_repository.update_explore(self.db, explore_id, update_dict)

    def delete_explore(self, explore_id: int):
        """Delete an explore"""
        return explore_repository.delete_explore(self.db, explore_id)


class PlaceService:
    def __init__(self, db: Session):
        self.db = db

    def get_all_places(self):
        """Get all places"""
        return place_repository.get_places(self.db)

    def get_place(self, place_id: int):
        """Get a place by ID"""
        place = place_repository.get_place_by_id(self.db, place_id)
        if not place:
            raise ValueError("Place not found")
        return place

    def create_place(self, place_data):
        """Create a new place"""
        place = Place(**place_data.model_dump())
        return place_repository.create_place(self.db, place)

    def update_place(self, place_id: int, place_data):
        """Update an existing place"""
        existing_place = place_repository.get_place_by_id(self.db, place_id)
        if not existing_place:
            raise ValueError("Place not found")
        
        update_dict = place_data.model_dump(exclude_unset=True)
        return place_repository.update_place(self.db, place_id, update_dict)
