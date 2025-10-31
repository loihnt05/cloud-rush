from sqlalchemy.orm import Session
from app.models.package import BookingPackage, PackagePlace
from app.repositories import package_repository
from app.schemas.package_schema import PackageCreate, PackageUpdate, PackagePlaceCreate


class PackageService:
    def __init__(self, db: Session):
        self.db = db

    def get_package(self, package_id: int):
        """Get a package by ID"""
        package = package_repository.get_package_by_id(self.db, package_id)
        if not package:
            raise ValueError("Package not found")
        return package

    def get_all_packages(self, skip: int = 0, limit: int = 100):
        """Get all packages"""
        return package_repository.get_all_packages(self.db, skip, limit)

    def create_package(self, package_data: PackageCreate):
        """Create a new package with places"""
        # Extract places data
        places_data = package_data.places if package_data.places else []
        package_dict = package_data.model_dump(exclude={'places'})
        
        # Create package
        package = BookingPackage(**package_dict)
        created_package = package_repository.create_package(self.db, package)
        
        # Add places to package
        if places_data:
            for place_data in places_data:
                package_place = PackagePlace(
                    package_id=created_package.package_id,
                    place_id=place_data.place_id,
                    day_number=place_data.day_number
                )
                package_repository.add_place_to_package(self.db, package_place)
        
        # Refresh to get updated relationships
        self.db.refresh(created_package)
        return created_package

    def update_package(self, package_id: int, package_data: PackageUpdate):
        """Update an existing package"""
        existing_package = package_repository.get_package_by_id(self.db, package_id)
        if not existing_package:
            raise ValueError("Package not found")
        
        update_dict = package_data.model_dump(exclude_unset=True)
        return package_repository.update_package(self.db, package_id, update_dict)

    def delete_package(self, package_id: int):
        """Delete a package"""
        existing_package = package_repository.get_package_by_id(self.db, package_id)
        if not existing_package:
            raise ValueError("Package not found")
        
        return package_repository.delete_package(self.db, package_id)

    def get_package_places(self, package_id: int):
        """Get all places for a specific package"""
        package = package_repository.get_package_by_id(self.db, package_id)
        if not package:
            raise ValueError("Package not found")
        
        return package_repository.get_package_places_by_package_id(self.db, package_id)

    def add_place_to_package(self, package_id: int, place_data: PackagePlaceCreate):
        """Add a place to a package"""
        package = package_repository.get_package_by_id(self.db, package_id)
        if not package:
            raise ValueError("Package not found")
        
        package_place = PackagePlace(
            package_id=package_id,
            place_id=place_data.place_id,
            day_number=place_data.day_number
        )
        return package_repository.add_place_to_package(self.db, package_place)

    def remove_place_from_package(self, package_place_id: int):
        """Remove a place from a package"""
        success = package_repository.remove_place_from_package(self.db, package_place_id)
        if not success:
            raise ValueError("Package place not found")
        return True
