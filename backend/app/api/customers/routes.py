from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from decimal import Decimal
from app.models.schemas import (
    ProviderSearchParams,
    ProviderResponse,
    ProviderProfileResponse,
    BookingCreate,
    BookingResponse,
    BookingStatusUpdate,
    ReviewCreate,
    ReviewResponse,
    CategoryResponse
)
from app.core.security import get_current_customer
from app.core.database import get_supabase, get_db_pool
from supabase import Client
import asyncpg
from datetime import datetime

router = APIRouter(prefix="/customers", tags=["customers"])


@router.get("/categories", response_model=List[CategoryResponse])
async def get_categories(supabase: Client = Depends(get_supabase)):
    """Get all available service categories"""
    try:
        result = supabase.table("categories").select("*").order("name").execute()
        return result.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching categories: {str(e)}"
        )


@router.get("/providers/search", response_model=List[ProviderResponse])
async def search_providers(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    category_id: Optional[int] = None,
    min_rating: Optional[float] = Query(None, ge=0, le=5),
    max_price: Optional[Decimal] = None,
    min_price: Optional[Decimal] = None,
    radius_km: float = Query(10, ge=0.1, le=100),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    supabase: Client = Depends(get_supabase),
    db_pool: asyncpg.Pool = Depends(get_db_pool)
):
    """
    Search providers by location (hyperlocal search using PostGIS).
    Returns providers sorted by distance (nearest first).
    """
    if not db_pool:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection not available"
        )
    
    try:
        # Build SQL query for PostGIS distance search
        query = """
            SELECT 
                pp.id,
                pp.user_id,
                pp.category_id,
                c.name as category_name,
                pp.bio,
                pp.base_price,
                pp.is_verified,
                pp.avg_rating,
                ST_Distance(
                    pp.location::geography,
                    ST_MakePoint($1, $2)::geography
                ) / 1000.0 as distance_km,
                p.full_name as provider_name,
                p.email as provider_email
            FROM provider_profiles pp
            LEFT JOIN categories c ON pp.category_id = c.id
            LEFT JOIN profiles p ON pp.user_id = p.id
            WHERE 
                pp.is_verified = true
                AND pp.location IS NOT NULL
                AND ST_DWithin(
                    pp.location::geography,
                    ST_MakePoint($1, $2)::geography,
                    $3 * 1000
                )
        """
        
        params = [longitude, latitude, radius_km]
        param_count = 3
        
        # Add filters
        if category_id:
            param_count += 1
            query += f" AND pp.category_id = ${param_count}"
            params.append(category_id)
        
        if min_rating is not None:
            param_count += 1
            query += f" AND pp.avg_rating >= ${param_count}"
            params.append(min_rating)
        
        if min_price is not None:
            param_count += 1
            query += f" AND pp.base_price >= ${param_count}"
            params.append(float(min_price))
        
        if max_price is not None:
            param_count += 1
            query += f" AND pp.base_price <= ${param_count}"
            params.append(float(max_price))
        
        # Order by distance and limit
        query += " ORDER BY distance_km LIMIT $" + str(param_count + 1) + " OFFSET $" + str(param_count + 2)
        params.extend([limit, offset])
        
        async with db_pool.acquire() as conn:
            rows = await conn.fetch(query, *params)
        
        providers = []
        for row in rows:
            providers.append({
                "id": str(row["id"]),
                "user_id": str(row["user_id"]),
                "category_id": row["category_id"],
                "category_name": row["category_name"],
                "bio": row["bio"],
                "base_price": Decimal(str(row["base_price"])) if row["base_price"] else None,
                "is_verified": row["is_verified"],
                "avg_rating": float(row["avg_rating"]) if row["avg_rating"] else 0.0,
                "distance_km": float(row["distance_km"]),
                "provider_name": row["provider_name"],
                "provider_email": row["provider_email"]
            })
        
        return providers
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error searching providers: {str(e)}"
        )


@router.get("/providers/{provider_id}", response_model=ProviderProfileResponse)
async def get_provider_profile(
    provider_id: str,
    supabase: Client = Depends(get_supabase)
):
    """Get detailed provider profile with availability and reviews"""
    try:
        # Get provider profile
        profile_result = supabase.table("provider_profiles").select(
            """
            *,
            categories(name),
            profiles!provider_profiles_user_id_fkey(full_name, email, phone)
            """
        ).eq("id", provider_id).single().execute()
        
        if not profile_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Provider not found"
            )
        
        profile = profile_result.data
        
        # Get availability
        availability_result = supabase.table("provider_availability").select(
            "*"
        ).eq("provider_id", provider_id).execute()
        
        # Get reviews
        reviews_result = supabase.table("reviews").select(
            """
            *,
            profiles!reviews_customer_id_fkey(full_name)
            """
        ).eq("provider_id", provider_id).order("created_at", desc=True).limit(10).execute()
        
        return {
            "id": profile["id"],
            "user_id": profile["user_id"],
            "category_id": profile["category_id"],
            "category_name": profile["categories"]["name"] if profile.get("categories") else None,
            "bio": profile["bio"],
            "base_price": profile["base_price"],
            "is_verified": profile["is_verified"],
            "avg_rating": profile["avg_rating"] or 0.0,
            "provider_name": profile["profiles"]["full_name"] if profile.get("profiles") else None,
            "provider_email": profile["profiles"]["email"] if profile.get("profiles") else None,
            "provider_phone": profile["profiles"]["phone"] if profile.get("profiles") else None,
            "availability": availability_result.data or [],
            "reviews": reviews_result.data or []
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching provider profile: {str(e)}"
        )


@router.post("/bookings", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
    booking: BookingCreate,
    current_user: dict = Depends(get_current_customer),
    supabase: Client = Depends(get_supabase),
    db_pool: asyncpg.Pool = Depends(get_db_pool)
):
    """Create a new service booking"""
    if not db_pool:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection not available"
        )
    
    try:
        # Check if provider exists and is verified
        provider_result = supabase.table("provider_profiles").select("*").eq("id", booking.provider_id).single().execute()
        if not provider_result.data or not provider_result.data.get("is_verified"):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Provider not found or not verified"
            )
        
        provider = provider_result.data
        
        # Check if booking time conflicts with existing bookings
        async with db_pool.acquire() as conn:
            conflict_check = await conn.fetchrow("""
                SELECT id FROM bookings
                WHERE provider_id = $1
                AND status IN ('pending', 'confirmed', 'rescheduled')
                AND scheduled_for = $2
            """, booking.provider_id, booking.scheduled_for)
            
            if conflict_check:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Provider is already booked at this time"
                )
            
            # Check provider availability (day of week and time)
            day_of_week = booking.scheduled_for.weekday()  # Monday=0, Sunday=6
            # Convert to Sunday=0 format for database
            db_day = (day_of_week + 1) % 7
            booking_time = booking.scheduled_for.time()
            
            availability_check = await conn.fetchrow("""
                SELECT * FROM provider_availability
                WHERE provider_id = $1
                AND day_of_week = $2
                AND start_time <= $3
                AND end_time >= $3
            """, booking.provider_id, db_day, booking_time)
            
            if not availability_check:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Provider is not available at this time"
                )
        
        # Calculate total price (base price for now, can be extended)
        total_price = provider.get("base_price")
        
        # Create booking
        booking_result = supabase.table("bookings").insert({
            "customer_id": current_user["id"],
            "provider_id": booking.provider_id,
            "status": "pending",
            "scheduled_for": booking.scheduled_for.isoformat(),
            "service_address": booking.service_address,
            "total_price": float(total_price) if total_price else None,
            "notes": booking.notes
        }).execute()
        
        if not booking_result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create booking"
            )
        
        booking_data = booking_result.data[0]
        
        # Get provider info
        provider_user = supabase.table("profiles").select("full_name, email").eq("id", provider["user_id"]).single().execute()
        
        return {
            "id": booking_data["id"],
            "customer_id": booking_data["customer_id"],
            "provider_id": booking_data["provider_id"],
            "status": booking_data["status"],
            "scheduled_for": datetime.fromisoformat(booking_data["scheduled_for"].replace('Z', '+00:00')),
            "service_address": booking_data["service_address"],
            "total_price": Decimal(str(booking_data["total_price"])) if booking_data["total_price"] else None,
            "notes": booking_data["notes"],
            "created_at": datetime.fromisoformat(booking_data["created_at"].replace('Z', '+00:00')),
            "provider_name": provider_user.data["full_name"] if provider_user.data else None,
            "provider_email": provider_user.data["email"] if provider_user.data else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating booking: {str(e)}"
        )


@router.get("/bookings", response_model=List[BookingResponse])
async def get_my_bookings(
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: dict = Depends(get_current_customer),
    supabase: Client = Depends(get_supabase)
):
    """Get all bookings for the current customer"""
    try:
        query = supabase.table("bookings").select(
            """
            *,
            provider_profiles!bookings_provider_id_fkey(
                user_id,
                profiles!provider_profiles_user_id_fkey(full_name, email)
            )
            """
        ).eq("customer_id", current_user["id"])
        
        if status_filter:
            query = query.eq("status", status_filter)
        
        query = query.order("created_at", desc=True)
        
        result = query.execute()
        
        bookings = []
        for booking in result.data:
            provider_profile = booking.get("provider_profiles", {})
            provider_user = provider_profile.get("profiles", {}) if provider_profile else {}
            
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
                "provider_name": provider_user.get("full_name"),
                "provider_email": provider_user.get("email")
            })
        
        return bookings
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching bookings: {str(e)}"
        )


@router.get("/bookings/{booking_id}", response_model=BookingResponse)
async def get_booking(
    booking_id: str,
    current_user: dict = Depends(get_current_customer),
    supabase: Client = Depends(get_supabase)
):
    """Get a specific booking by ID"""
    try:
        result = supabase.table("bookings").select(
            """
            *,
            provider_profiles!bookings_provider_id_fkey(
                user_id,
                profiles!provider_profiles_user_id_fkey(full_name, email)
            )
            """
        ).eq("id", booking_id).eq("customer_id", current_user["id"]).single().execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        
        booking = result.data
        provider_profile = booking.get("provider_profiles", {})
        provider_user = provider_profile.get("profiles", {}) if provider_profile else {}
        
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
            "provider_name": provider_user.get("full_name"),
            "provider_email": provider_user.get("email")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching booking: {str(e)}"
        )


@router.put("/bookings/{booking_id}/cancel", response_model=BookingResponse)
async def cancel_booking(
    booking_id: str,
    current_user: dict = Depends(get_current_customer),
    supabase: Client = Depends(get_supabase)
):
    """Cancel a booking (only if status is pending or confirmed)"""
    try:
        # Get booking
        booking_result = supabase.table("bookings").select("*").eq("id", booking_id).eq("customer_id", current_user["id"]).single().execute()
        
        if not booking_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        
        booking = booking_result.data
        current_status = booking["status"]
        
        if current_status not in ["pending", "confirmed"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot cancel booking with status: {current_status}"
            )
        
        # Update booking status
        update_result = supabase.table("bookings").update({
            "status": "cancelled"
        }).eq("id", booking_id).execute()
        
        if not update_result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to cancel booking"
            )
        
        updated_booking = update_result.data[0]
        
        # Get provider info
        provider_result = supabase.table("provider_profiles").select("user_id").eq("id", updated_booking["provider_id"]).single().execute()
        provider_user = None
        if provider_result.data:
            provider_user = supabase.table("profiles").select("full_name, email").eq("id", provider_result.data["user_id"]).single().execute()
        
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
            "provider_name": provider_user.data["full_name"] if provider_user and provider_user.data else None,
            "provider_email": provider_user.data["email"] if provider_user and provider_user.data else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error cancelling booking: {str(e)}"
        )


@router.post("/reviews", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    review: ReviewCreate,
    current_user: dict = Depends(get_current_customer),
    supabase: Client = Depends(get_supabase),
    db_pool: asyncpg.Pool = Depends(get_db_pool)
):
    """Create a review for a completed booking"""
    if not db_pool:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection not available"
        )
    
    try:
        # Verify booking exists, belongs to customer, and is completed
        async with db_pool.acquire() as conn:
            booking = await conn.fetchrow("""
                SELECT id, customer_id, provider_id, status
                FROM bookings
                WHERE id = $1
            """, review.booking_id)
            
            if not booking:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Booking not found"
                )
            
            if str(booking["customer_id"]) != current_user["id"]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only review your own bookings"
                )
            
            if booking["status"] != "completed":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="You can only review completed bookings"
                )
            
            # Check if review already exists
            existing_review = await conn.fetchrow("""
                SELECT id FROM reviews WHERE booking_id = $1
            """, review.booking_id)
            
            if existing_review:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Review already exists for this booking"
                )
        
        # Create review
        review_result = supabase.table("reviews").insert({
            "booking_id": review.booking_id,
            "customer_id": current_user["id"],
            "provider_id": booking["provider_id"],
            "rating": review.rating,
            "comment": review.comment
        }).execute()
        
        if not review_result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create review"
            )
        
        review_data = review_result.data[0]
        
        # Update provider's average rating
        # This should ideally be done with a database trigger, but we'll do it here
        async with db_pool.acquire() as conn:
            await conn.execute("""
                UPDATE provider_profiles
                SET avg_rating = (
                    SELECT AVG(rating)::float
                    FROM reviews
                    WHERE provider_id = $1
                )
                WHERE id = $1
            """, booking["provider_id"])
        
        # Get customer name
        customer = supabase.table("profiles").select("full_name").eq("id", current_user["id"]).single().execute()
        
        return {
            "id": review_data["id"],
            "booking_id": review_data["booking_id"],
            "customer_id": review_data["customer_id"],
            "provider_id": review_data["provider_id"],
            "rating": review_data["rating"],
            "comment": review_data["comment"],
            "created_at": datetime.fromisoformat(review_data["created_at"].replace('Z', '+00:00')),
            "customer_name": customer.data["full_name"] if customer.data else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating review: {str(e)}"
        )


@router.get("/reviews/my", response_model=List[ReviewResponse])
async def get_my_reviews(
    current_user: dict = Depends(get_current_customer),
    supabase: Client = Depends(get_supabase)
):
    """Get all reviews created by the current customer"""
    try:
        result = supabase.table("reviews").select(
            """
            *,
            profiles!reviews_customer_id_fkey(full_name)
            """
        ).eq("customer_id", current_user["id"]).order("created_at", desc=True).execute()
        
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

