from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime, time
from decimal import Decimal
from enum import Enum


# Enums
class UserRole(str, Enum):
    CUSTOMER = "customer"
    PROVIDER = "provider"
    ADMIN = "admin"


class BookingStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    RESCHEDULED = "rescheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


# Provider Search Models
class ProviderSearchParams(BaseModel):
    latitude: float = Field(..., ge=-90, le=90, description="Latitude for location search")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude for location search")
    category_id: Optional[int] = None
    min_rating: Optional[float] = Field(None, ge=0, le=5)
    max_price: Optional[Decimal] = None
    min_price: Optional[Decimal] = None
    radius_km: float = Field(default=10, ge=0.1, le=100, description="Search radius in kilometers")
    limit: int = Field(default=20, ge=1, le=100)
    offset: int = Field(default=0, ge=0)


class ProviderResponse(BaseModel):
    id: str
    user_id: str
    category_id: Optional[int]
    category_name: Optional[str] = None
    bio: Optional[str]
    base_price: Optional[Decimal]
    is_verified: bool
    avg_rating: float
    distance_km: Optional[float] = None
    provider_name: Optional[str] = None
    provider_email: Optional[str] = None
    
    class Config:
        from_attributes = True


# Provider Profile Models
class ProviderProfileResponse(BaseModel):
    id: str
    user_id: str
    category_id: Optional[int]
    category_name: Optional[str] = None
    bio: Optional[str]
    base_price: Optional[Decimal]
    is_verified: bool
    avg_rating: float
    provider_name: Optional[str] = None
    provider_email: Optional[str] = None
    provider_phone: Optional[str] = None
    availability: List[dict] = []
    reviews: List[dict] = []
    
    class Config:
        from_attributes = True


# Booking Models
class BookingCreate(BaseModel):
    provider_id: str
    scheduled_for: datetime
    service_address: str = Field(..., min_length=5)
    notes: Optional[str] = None
    
    @validator('scheduled_for')
    def scheduled_for_must_be_future(cls, v):
        if v <= datetime.now():
            raise ValueError('Scheduled time must be in the future')
        return v


class BookingResponse(BaseModel):
    id: str
    customer_id: str
    provider_id: str
    status: BookingStatus
    scheduled_for: datetime
    service_address: str
    total_price: Optional[Decimal]
    notes: Optional[str]
    created_at: datetime
    provider_name: Optional[str] = None
    provider_email: Optional[str] = None
    
    class Config:
        from_attributes = True


class BookingStatusUpdate(BaseModel):
    status: BookingStatus


# Review Models
class ReviewCreate(BaseModel):
    booking_id: str
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None


class ReviewResponse(BaseModel):
    id: str
    booking_id: str
    customer_id: str
    provider_id: str
    rating: int
    comment: Optional[str]
    created_at: datetime
    customer_name: Optional[str] = None
    
    class Config:
        from_attributes = True


# Category Models
class CategoryResponse(BaseModel):
    id: int
    name: str
    icon_url: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

