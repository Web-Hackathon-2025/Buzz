from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from decimal import Decimal
from datetime import datetime, time
from app.models.schemas import (
    ProviderProfileUpdate,
    ProviderProfileFullResponse,
    AvailabilityCreate,
    AvailabilityResponse,
    AvailabilityUpdate,
    ProviderBookingResponse,
    BookingRescheduleRequest,
    BookingStatusUpdate,
    BookingStatus,
    ProviderDashboardStats,
    ReviewResponse
)
from app.core.security import get_current_provider
from app.core.database import get_supabase, get_db_pool
from supabase import Client
import asyncpg

router = APIRouter(prefix="/providers", tags=["providers"])


# Provider Profile Management
@router.get("/profile", response_model=ProviderProfileFullResponse)
async def get_my_profile(
    current_user: dict = Depends(get_current_provider),
    supabase: Client = Depends(get_supabase)
):
    """Get the current provider's profile"""
    try:
        result = supabase.table("provider_profiles").select(
            """
            *,
            categories(name),
            profiles!provider_profiles_user_id_fkey(full_name, email, phone)
            """
        ).eq("id", current_user["provider_id"]).single().execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Provider profile not found"
            )
        
        profile = result.data
        
        # Extract location if available
        latitude = None
        longitude = None
        if profile.get("location"):
            # Location is stored as PostGIS POINT, we need to extract it
            # This would typically require a database query
            pass
        
        return {
            "id": profile["id"],
            "user_id": profile["user_id"],
            "category_id": profile["category_id"],
            "category_name": profile["categories"]["name"] if profile.get("categories") else None,
            "bio": profile["bio"],
            "base_price": Decimal(str(profile["base_price"])) if profile["base_price"] else None,
            "is_verified": profile["is_verified"],
            "avg_rating": float(profile["avg_rating"]) if profile["avg_rating"] else 0.0,
            "latitude": latitude,
            "longitude": longitude,
            "provider_name": profile["profiles"]["full_name"] if profile.get("profiles") else None,
            "provider_email": profile["profiles"]["email"] if profile.get("profiles") else None,
            "provider_phone": profile["profiles"]["phone"] if profile.get("profiles") else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching profile: {str(e)}"
        )


@router.put("/profile", response_model=ProviderProfileFullResponse)
async def update_my_profile(
    profile_update: ProviderProfileUpdate,
    current_user: dict = Depends(get_current_provider),
    supabase: Client = Depends(get_supabase),
    db_pool: asyncpg.Pool = Depends(get_db_pool)
):
    """Update the current provider's profile"""
    if not db_pool:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection not available"
        )
    
    try:
        update_data = {}
        
        if profile_update.category_id is not None:
            update_data["category_id"] = profile_update.category_id
        if profile_update.bio is not None:
            update_data["bio"] = profile_update.bio
        if profile_update.base_price is not None:
            update_data["base_price"] = float(profile_update.base_price)
        
        # Update location if provided
        if profile_update.latitude is not None and profile_update.longitude is not None:
            async with db_pool.acquire() as conn:
                await conn.execute("""
                    UPDATE provider_profiles
                    SET location = ST_SetSRID(ST_MakePoint($1, $2), 4326)
                    WHERE id = $3
                """, profile_update.longitude, profile_update.latitude, current_user["provider_id"])
        
        # Update other fields via Supabase
        if update_data:
            result = supabase.table("provider_profiles").update(update_data).eq("id", current_user["provider_id"]).execute()
        
        # Fetch updated profile
        profile_result = supabase.table("provider_profiles").select(
            """
            *,
            categories(name),
            profiles!provider_profiles_user_id_fkey(full_name, email, phone)
            """
        ).eq("id", current_user["provider_id"]).single().execute()
        
        profile = profile_result.data
        
        # Get location from database
        latitude = None
        longitude = None
        if profile_update.latitude is not None and profile_update.longitude is not None:
            latitude = profile_update.latitude
            longitude = profile_update.longitude
        else:
            async with db_pool.acquire() as conn:
                location_row = await conn.fetchrow("""
                    SELECT ST_Y(location::geometry) as lat, ST_X(location::geometry) as lng
                    FROM provider_profiles
                    WHERE id = $1
                """, current_user["provider_id"])
                if location_row and location_row["lat"]:
                    latitude = float(location_row["lat"])
                    longitude = float(location_row["lng"])
        
        return {
            "id": profile["id"],
            "user_id": profile["user_id"],
            "category_id": profile["category_id"],
            "category_name": profile["categories"]["name"] if profile.get("categories") else None,
            "bio": profile["bio"],
            "base_price": Decimal(str(profile["base_price"])) if profile["base_price"] else None,
            "is_verified": profile["is_verified"],
            "avg_rating": float(profile["avg_rating"]) if profile["avg_rating"] else 0.0,
            "latitude": latitude,
            "longitude": longitude,
            "provider_name": profile["profiles"]["full_name"] if profile.get("profiles") else None,
            "provider_email": profile["profiles"]["email"] if profile.get("profiles") else None,
            "provider_phone": profile["profiles"]["phone"] if profile.get("profiles") else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating profile: {str(e)}"
        )


# Availability Management
@router.get("/availability", response_model=List[AvailabilityResponse])
async def get_my_availability(
    current_user: dict = Depends(get_current_provider),
    supabase: Client = Depends(get_supabase)
):
    """Get all availability slots for the current provider"""
    try:
        result = supabase.table("provider_availability").select("*").eq(
            "provider_id", current_user["provider_id"]
        ).order("day_of_week").order("start_time").execute()
        
        availability_slots = []
        for slot in result.data:
            availability_slots.append({
                "id": slot["id"],
                "provider_id": slot["provider_id"],
                "day_of_week": slot["day_of_week"],
                "start_time": time.fromisoformat(slot["start_time"]) if isinstance(slot["start_time"], str) else slot["start_time"],
                "end_time": time.fromisoformat(slot["end_time"]) if isinstance(slot["end_time"], str) else slot["end_time"],
                "created_at": datetime.fromisoformat(slot["created_at"].replace('Z', '+00:00'))
            })
        
        return availability_slots
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching availability: {str(e)}"
        )


@router.post("/availability", response_model=AvailabilityResponse, status_code=status.HTTP_201_CREATED)
async def create_availability(
    availability: AvailabilityCreate,
    current_user: dict = Depends(get_current_provider),
    supabase: Client = Depends(get_supabase),
    db_pool: asyncpg.Pool = Depends(get_db_pool)
):
    """Create a new availability slot"""
    if not db_pool:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection not available"
        )
    
    try:
        # Check for overlapping availability on the same day
        async with db_pool.acquire() as conn:
            overlapping = await conn.fetchrow("""
                SELECT id FROM provider_availability
                WHERE provider_id = $1
                AND day_of_week = $2
                AND (
                    (start_time <= $3 AND end_time > $3)
                    OR (start_time < $4 AND end_time >= $4)
                    OR (start_time >= $3 AND end_time <= $4)
                )
            """, current_user["provider_id"], availability.day_of_week, 
                availability.start_time, availability.end_time)
            
            if overlapping:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Availability slot overlaps with existing slot"
                )
        
        # Create availability
        result = supabase.table("provider_availability").insert({
            "provider_id": current_user["provider_id"],
            "day_of_week": availability.day_of_week,
            "start_time": availability.start_time.isoformat(),
            "end_time": availability.end_time.isoformat()
        }).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create availability"
            )
        
        slot = result.data[0]
        return {
            "id": slot["id"],
            "provider_id": slot["provider_id"],
            "day_of_week": slot["day_of_week"],
            "start_time": time.fromisoformat(slot["start_time"]) if isinstance(slot["start_time"], str) else slot["start_time"],
            "end_time": time.fromisoformat(slot["end_time"]) if isinstance(slot["end_time"], str) else slot["end_time"],
            "created_at": datetime.fromisoformat(slot["created_at"].replace('Z', '+00:00'))
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating availability: {str(e)}"
        )


@router.put("/availability/{availability_id}", response_model=AvailabilityResponse)
async def update_availability(
    availability_id: str,
    availability_update: AvailabilityUpdate,
    current_user: dict = Depends(get_current_provider),
    supabase: Client = Depends(get_supabase),
    db_pool: asyncpg.Pool = Depends(get_db_pool)
):
    """Update an availability slot"""
    if not db_pool:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection not available"
        )
    
    try:
        # Verify ownership
        existing = supabase.table("provider_availability").select("*").eq("id", availability_id).eq(
            "provider_id", current_user["provider_id"]
        ).single().execute()
        
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Availability slot not found"
            )
        
        existing_slot = existing.data
        new_start = availability_update.start_time or time.fromisoformat(existing_slot["start_time"]) if isinstance(existing_slot["start_time"], str) else existing_slot["start_time"]
        new_end = availability_update.end_time or time.fromisoformat(existing_slot["end_time"]) if isinstance(existing_slot["end_time"], str) else existing_slot["end_time"]
        
        # Check for overlapping availability
        async with db_pool.acquire() as conn:
            overlapping = await conn.fetchrow("""
                SELECT id FROM provider_availability
                WHERE provider_id = $1
                AND day_of_week = $2
                AND id != $3
                AND (
                    (start_time <= $4 AND end_time > $4)
                    OR (start_time < $5 AND end_time >= $5)
                    OR (start_time >= $4 AND end_time <= $5)
                )
            """, current_user["provider_id"], existing_slot["day_of_week"], 
                availability_id, new_start, new_end)
            
            if overlapping:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Updated availability slot overlaps with existing slot"
                )
        
        # Update availability
        update_data = {}
        if availability_update.start_time is not None:
            update_data["start_time"] = availability_update.start_time.isoformat()
        if availability_update.end_time is not None:
            update_data["end_time"] = availability_update.end_time.isoformat()
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
        
        result = supabase.table("provider_availability").update(update_data).eq("id", availability_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update availability"
            )
        
        updated_slot = result.data[0]
        return {
            "id": updated_slot["id"],
            "provider_id": updated_slot["provider_id"],
            "day_of_week": updated_slot["day_of_week"],
            "start_time": time.fromisoformat(updated_slot["start_time"]) if isinstance(updated_slot["start_time"], str) else updated_slot["start_time"],
            "end_time": time.fromisoformat(updated_slot["end_time"]) if isinstance(updated_slot["end_time"], str) else updated_slot["end_time"],
            "created_at": datetime.fromisoformat(updated_slot["created_at"].replace('Z', '+00:00'))
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating availability: {str(e)}"
        )


@router.delete("/availability/{availability_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_availability(
    availability_id: str,
    current_user: dict = Depends(get_current_provider),
    supabase: Client = Depends(get_supabase)
):
    """Delete an availability slot"""
    try:
        # Verify ownership
        existing = supabase.table("provider_availability").select("*").eq("id", availability_id).eq(
            "provider_id", current_user["provider_id"]
        ).single().execute()
        
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Availability slot not found"
            )
        
        # Delete availability
        supabase.table("provider_availability").delete().eq("id", availability_id).execute()
        
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting availability: {str(e)}"
        )


# Booking Management
@router.get("/bookings", response_model=List[ProviderBookingResponse])
async def get_my_bookings(
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: dict = Depends(get_current_provider),
    supabase: Client = Depends(get_supabase)
):
    """Get all bookings for the current provider"""
    try:
        query = supabase.table("bookings").select(
            """
            *,
            profiles!bookings_customer_id_fkey(full_name, email, phone)
            """
        ).eq("provider_id", current_user["provider_id"])
        
        if status_filter:
            query = query.eq("status", status_filter)
        
        query = query.order("scheduled_for", desc=False)  # Upcoming first
        
        result = query.execute()
        
        bookings = []
        for booking in result.data:
            customer = booking.get("profiles", {})
            bookings.append({
                "id": booking["id"],
                "customer_id": booking["customer_id"],
                "provider_id": booking["provider_id"],
                "status": booking["status"],
                "scheduled_for": datetime.fromisoformat(booking["scheduled_for"].replace('Z', '+00:00')),
                "service_address": booking["service_address"],
                "total_price": Decimal(str(booking["total_price"])) if booking["total_price"] else None,
                "notes": booking["notes"],
                "created_at": datetime.fromisoformat(booking["created_at"].replace('Z', '+00:00')),
                "customer_name": customer.get("full_name") if customer else None,
                "customer_email": customer.get("email") if customer else None,
                "customer_phone": customer.get("phone") if customer else None
            })
        
        return bookings
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching bookings: {str(e)}"
        )


@router.get("/bookings/{booking_id}", response_model=ProviderBookingResponse)
async def get_booking(
    booking_id: str,
    current_user: dict = Depends(get_current_provider),
    supabase: Client = Depends(get_supabase)
):
    """Get a specific booking by ID"""
    try:
        result = supabase.table("bookings").select(
            """
            *,
            profiles!bookings_customer_id_fkey(full_name, email, phone)
            """
        ).eq("id", booking_id).eq("provider_id", current_user["provider_id"]).single().execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        
        booking = result.data
        customer = booking.get("profiles", {})
        
        return {
            "id": booking["id"],
            "customer_id": booking["customer_id"],
            "provider_id": booking["provider_id"],
            "status": booking["status"],
            "scheduled_for": datetime.fromisoformat(booking["scheduled_for"].replace('Z', '+00:00')),
            "service_address": booking["service_address"],
            "total_price": Decimal(str(booking["total_price"])) if booking["total_price"] else None,
            "notes": booking["notes"],
            "created_at": datetime.fromisoformat(booking["created_at"].replace('Z', '+00:00')),
            "customer_name": customer.get("full_name") if customer else None,
            "customer_email": customer.get("email") if customer else None,
            "customer_phone": customer.get("phone") if customer else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching booking: {str(e)}"
        )


@router.put("/bookings/{booking_id}/accept", response_model=ProviderBookingResponse)
async def accept_booking(
    booking_id: str,
    current_user: dict = Depends(get_current_provider),
    supabase: Client = Depends(get_supabase),
    db_pool: asyncpg.Pool = Depends(get_db_pool)
):
    """Accept a pending booking"""
    if not db_pool:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection not available"
        )
    
    try:
        # Get booking
        booking_result = supabase.table("bookings").select("*").eq("id", booking_id).eq(
            "provider_id", current_user["provider_id"]
        ).single().execute()
        
        if not booking_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        
        booking = booking_result.data
        
        if booking["status"] != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Can only accept pending bookings. Current status: {booking['status']}"
            )
        
        # Check for conflicts
        scheduled_for = datetime.fromisoformat(booking["scheduled_for"].replace('Z', '+00:00'))
        async with db_pool.acquire() as conn:
            conflict = await conn.fetchrow("""
                SELECT id FROM bookings
                WHERE provider_id = $1
                AND id != $2
                AND status IN ('pending', 'confirmed', 'rescheduled')
                AND scheduled_for = $3
            """, current_user["provider_id"], booking_id, scheduled_for)
            
            if conflict:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Another booking already exists at this time"
                )
        
        # Update booking status
        update_result = supabase.table("bookings").update({
            "status": "confirmed"
        }).eq("id", booking_id).execute()
        
        if not update_result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to accept booking"
            )
        
        updated_booking = update_result.data[0]
        
        # Get customer info
        customer = supabase.table("profiles").select("full_name, email, phone").eq(
            "id", updated_booking["customer_id"]
        ).single().execute()
        
        return {
            "id": updated_booking["id"],
            "customer_id": updated_booking["customer_id"],
            "provider_id": updated_booking["provider_id"],
            "status": updated_booking["status"],
            "scheduled_for": datetime.fromisoformat(updated_booking["scheduled_for"].replace('Z', '+00:00')),
            "service_address": updated_booking["service_address"],
            "total_price": Decimal(str(updated_booking["total_price"])) if updated_booking["total_price"] else None,
            "notes": updated_booking["notes"],
            "created_at": datetime.fromisoformat(updated_booking["created_at"].replace('Z', '+00:00')),
            "customer_name": customer.data["full_name"] if customer.data else None,
            "customer_email": customer.data["email"] if customer.data else None,
            "customer_phone": customer.data["phone"] if customer.data else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error accepting booking: {str(e)}"
        )


@router.put("/bookings/{booking_id}/reject", response_model=ProviderBookingResponse)
async def reject_booking(
    booking_id: str,
    current_user: dict = Depends(get_current_provider),
    supabase: Client = Depends(get_supabase)
):
    """Reject a pending booking"""
    try:
        # Get booking
        booking_result = supabase.table("bookings").select("*").eq("id", booking_id).eq(
            "provider_id", current_user["provider_id"]
        ).single().execute()
        
        if not booking_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        
        booking = booking_result.data
        
        if booking["status"] != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Can only reject pending bookings. Current status: {booking['status']}"
            )
        
        # Update booking status to cancelled
        update_result = supabase.table("bookings").update({
            "status": "cancelled"
        }).eq("id", booking_id).execute()
        
        if not update_result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to reject booking"
            )
        
        updated_booking = update_result.data[0]
        
        # Get customer info
        customer = supabase.table("profiles").select("full_name, email, phone").eq(
            "id", updated_booking["customer_id"]
        ).single().execute()
        
        return {
            "id": updated_booking["id"],
            "customer_id": updated_booking["customer_id"],
            "provider_id": updated_booking["provider_id"],
            "status": updated_booking["status"],
            "scheduled_for": datetime.fromisoformat(updated_booking["scheduled_for"].replace('Z', '+00:00')),
            "service_address": updated_booking["service_address"],
            "total_price": Decimal(str(updated_booking["total_price"])) if updated_booking["total_price"] else None,
            "notes": updated_booking["notes"],
            "created_at": datetime.fromisoformat(updated_booking["created_at"].replace('Z', '+00:00')),
            "customer_name": customer.data["full_name"] if customer.data else None,
            "customer_email": customer.data["email"] if customer.data else None,
            "customer_phone": customer.data["phone"] if customer.data else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error rejecting booking: {str(e)}"
        )


@router.put("/bookings/{booking_id}/reschedule", response_model=ProviderBookingResponse)
async def reschedule_booking(
    booking_id: str,
    reschedule_request: BookingRescheduleRequest,
    current_user: dict = Depends(get_current_provider),
    supabase: Client = Depends(get_supabase),
    db_pool: asyncpg.Pool = Depends(get_db_pool)
):
    """Reschedule a confirmed booking"""
    if not db_pool:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection not available"
        )
    
    try:
        # Get booking
        booking_result = supabase.table("bookings").select("*").eq("id", booking_id).eq(
            "provider_id", current_user["provider_id"]
        ).single().execute()
        
        if not booking_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        
        booking = booking_result.data
        
        if booking["status"] not in ["pending", "confirmed", "rescheduled"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot reschedule booking with status: {booking['status']}"
            )
        
        # Check for conflicts with new time
        async with db_pool.acquire() as conn:
            conflict = await conn.fetchrow("""
                SELECT id FROM bookings
                WHERE provider_id = $1
                AND id != $2
                AND status IN ('pending', 'confirmed', 'rescheduled')
                AND scheduled_for = $3
            """, current_user["provider_id"], booking_id, reschedule_request.new_scheduled_for)
            
            if conflict:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Another booking already exists at the new time"
                )
            
            # Check provider availability
            day_of_week = reschedule_request.new_scheduled_for.weekday()
            db_day = (day_of_week + 1) % 7
            booking_time = reschedule_request.new_scheduled_for.time()
            
            availability_check = await conn.fetchrow("""
                SELECT * FROM provider_availability
                WHERE provider_id = $1
                AND day_of_week = $2
                AND start_time <= $3
                AND end_time >= $3
            """, current_user["provider_id"], db_day, booking_time)
            
            if not availability_check:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Provider is not available at the new time"
                )
        
        # Update booking
        update_result = supabase.table("bookings").update({
            "status": "rescheduled",
            "scheduled_for": reschedule_request.new_scheduled_for.isoformat()
        }).eq("id", booking_id).execute()
        
        if not update_result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to reschedule booking"
            )
        
        updated_booking = update_result.data[0]
        
        # Get customer info
        customer = supabase.table("profiles").select("full_name, email, phone").eq(
            "id", updated_booking["customer_id"]
        ).single().execute()
        
        return {
            "id": updated_booking["id"],
            "customer_id": updated_booking["customer_id"],
            "provider_id": updated_booking["provider_id"],
            "status": updated_booking["status"],
            "scheduled_for": datetime.fromisoformat(updated_booking["scheduled_for"].replace('Z', '+00:00')),
            "service_address": updated_booking["service_address"],
            "total_price": Decimal(str(updated_booking["total_price"])) if updated_booking["total_price"] else None,
            "notes": updated_booking["notes"],
            "created_at": datetime.fromisoformat(updated_booking["created_at"].replace('Z', '+00:00')),
            "customer_name": customer.data["full_name"] if customer.data else None,
            "customer_email": customer.data["email"] if customer.data else None,
            "customer_phone": customer.data["phone"] if customer.data else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error rescheduling booking: {str(e)}"
        )


@router.put("/bookings/{booking_id}/complete", response_model=ProviderBookingResponse)
async def complete_booking(
    booking_id: str,
    current_user: dict = Depends(get_current_provider),
    supabase: Client = Depends(get_supabase)
):
    """Mark a booking as completed"""
    try:
        # Get booking
        booking_result = supabase.table("bookings").select("*").eq("id", booking_id).eq(
            "provider_id", current_user["provider_id"]
        ).single().execute()
        
        if not booking_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        
        booking = booking_result.data
        
        if booking["status"] not in ["confirmed", "rescheduled"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Can only complete confirmed or rescheduled bookings. Current status: {booking['status']}"
            )
        
        # Update booking status
        update_result = supabase.table("bookings").update({
            "status": "completed"
        }).eq("id", booking_id).execute()
        
        if not update_result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to complete booking"
            )
        
        updated_booking = update_result.data[0]
        
        # Get customer info
        customer = supabase.table("profiles").select("full_name, email, phone").eq(
            "id", updated_booking["customer_id"]
        ).single().execute()
        
        return {
            "id": updated_booking["id"],
            "customer_id": updated_booking["customer_id"],
            "provider_id": updated_booking["provider_id"],
            "status": updated_booking["status"],
            "scheduled_for": datetime.fromisoformat(updated_booking["scheduled_for"].replace('Z', '+00:00')),
            "service_address": updated_booking["service_address"],
            "total_price": Decimal(str(updated_booking["total_price"])) if updated_booking["total_price"] else None,
            "notes": updated_booking["notes"],
            "created_at": datetime.fromisoformat(updated_booking["created_at"].replace('Z', '+00:00')),
            "customer_name": customer.data["full_name"] if customer.data else None,
            "customer_email": customer.data["email"] if customer.data else None,
            "customer_phone": customer.data["phone"] if customer.data else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error completing booking: {str(e)}"
        )


# Dashboard & Analytics
@router.get("/dashboard", response_model=ProviderDashboardStats)
async def get_dashboard_stats(
    current_user: dict = Depends(get_current_provider),
    supabase: Client = Depends(get_supabase),
    db_pool: asyncpg.Pool = Depends(get_db_pool)
):
    """Get provider dashboard statistics and overview"""
    if not db_pool:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection not available"
        )
    
    try:
        async with db_pool.acquire() as conn:
            # Get booking statistics
            stats = await conn.fetchrow("""
                SELECT 
                    COUNT(*) as total_bookings,
                    COUNT(*) FILTER (WHERE status = 'pending') as pending_bookings,
                    COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_bookings,
                    COUNT(*) FILTER (WHERE status = 'completed') as completed_bookings,
                    COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_bookings,
                    COALESCE(SUM(total_price) FILTER (WHERE status = 'completed'), 0) as total_earnings
                FROM bookings
                WHERE provider_id = $1
            """, current_user["provider_id"])
            
            # Get rating stats
            rating_stats = await conn.fetchrow("""
                SELECT 
                    COALESCE(AVG(rating)::float, 0) as avg_rating,
                    COUNT(*) as total_reviews
                FROM reviews
                WHERE provider_id = $1
            """, current_user["provider_id"])
            
            # Get upcoming bookings (next 5)
            upcoming = await conn.fetch("""
                SELECT 
                    b.*,
                    p.full_name as customer_name,
                    p.email as customer_email,
                    p.phone as customer_phone
                FROM bookings b
                LEFT JOIN profiles p ON b.customer_id = p.id
                WHERE b.provider_id = $1
                AND b.status IN ('pending', 'confirmed', 'rescheduled')
                AND b.scheduled_for >= NOW()
                ORDER BY b.scheduled_for ASC
                LIMIT 5
            """, current_user["provider_id"])
            
            # Get recent reviews (last 5)
            recent_reviews = await conn.fetch("""
                SELECT 
                    r.*,
                    p.full_name as customer_name
                FROM reviews r
                LEFT JOIN profiles p ON r.customer_id = p.id
                WHERE r.provider_id = $1
                ORDER BY r.created_at DESC
                LIMIT 5
            """, current_user["provider_id"])
        
        upcoming_bookings = []
        for booking in upcoming:
            upcoming_bookings.append({
                "id": str(booking["id"]),
                "customer_name": booking["customer_name"],
                "scheduled_for": booking["scheduled_for"].isoformat() if booking["scheduled_for"] else None,
                "status": booking["status"],
                "service_address": booking["service_address"]
            })
        
        reviews_list = []
        for review in recent_reviews:
            reviews_list.append({
                "id": str(review["id"]),
                "customer_name": review["customer_name"],
                "rating": review["rating"],
                "comment": review["comment"],
                "created_at": review["created_at"].isoformat() if review["created_at"] else None
            })
        
        return {
            "total_bookings": stats["total_bookings"] or 0,
            "pending_bookings": stats["pending_bookings"] or 0,
            "confirmed_bookings": stats["confirmed_bookings"] or 0,
            "completed_bookings": stats["completed_bookings"] or 0,
            "cancelled_bookings": stats["cancelled_bookings"] or 0,
            "total_earnings": Decimal(str(stats["total_earnings"])) if stats["total_earnings"] else Decimal("0"),
            "avg_rating": float(rating_stats["avg_rating"]) if rating_stats["avg_rating"] else 0.0,
            "total_reviews": rating_stats["total_reviews"] or 0,
            "upcoming_bookings": upcoming_bookings,
            "recent_reviews": reviews_list
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching dashboard stats: {str(e)}"
        )


# Reviews Management
@router.get("/reviews", response_model=List[ReviewResponse])
async def get_my_reviews(
    current_user: dict = Depends(get_current_provider),
    supabase: Client = Depends(get_supabase),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Get all reviews for the current provider"""
    try:
        result = supabase.table("reviews").select(
            """
            *,
            profiles!reviews_customer_id_fkey(full_name)
            """
        ).eq("provider_id", current_user["provider_id"]).order(
            "created_at", desc=True
        ).range(offset, offset + limit - 1).execute()
        
        reviews = []
        for review in result.data:
            customer = review.get("profiles", {})
            reviews.append({
                "id": review["id"],
                "booking_id": review["booking_id"],
                "customer_id": review["customer_id"],
                "provider_id": review["provider_id"],
                "rating": review["rating"],
                "comment": review["comment"],
                "created_at": datetime.fromisoformat(review["created_at"].replace('Z', '+00:00')),
                "customer_name": customer.get("full_name") if customer else None
            })
        
        return reviews
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching reviews: {str(e)}"
        )

