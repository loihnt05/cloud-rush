from pydantic import BaseModel, Field
from typing import Optional, List
from decimal import Decimal


class PackagePlaceCreate(BaseModel):
    """Schema for adding a place to a package"""
    place_id: int
    day_number: Optional[int] = None


class PackagePlaceResponse(BaseModel):
    """Schema for package place response"""
    package_place_id: int
    package_id: int
    place_id: int
    day_number: Optional[int] = None

    class Config:
        from_attributes = True


class PackageCreate(BaseModel):
    """Schema for creating a package"""
    service_id: int
    hotel_id: Optional[int] = None
    car_rental_id: Optional[int] = None
    name: Optional[str] = Field(None, max_length=100)
    total_price: Optional[Decimal] = Field(None, ge=0, description="Total price must be non-negative")
    places: Optional[List[PackagePlaceCreate]] = []


class PackageUpdate(BaseModel):
    """Schema for updating a package"""
    service_id: Optional[int] = None
    hotel_id: Optional[int] = None
    car_rental_id: Optional[int] = None
    name: Optional[str] = Field(None, max_length=100)
    total_price: Optional[Decimal] = Field(None, ge=0, description="Total price must be non-negative")


class PackageResponse(BaseModel):
    """Schema for package response"""
    package_id: int
    service_id: int
    hotel_id: Optional[int] = None
    car_rental_id: Optional[int] = None
    name: Optional[str] = None
    total_price: Optional[Decimal] = None

    class Config:
        from_attributes = True


class PackageDetailResponse(PackageResponse):
    """Schema for detailed package response with places"""
    package_places: List[PackagePlaceResponse] = []

    class Config:
        from_attributes = True
