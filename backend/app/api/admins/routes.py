from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from decimal import Decimal
from datetime import datetime
from app.models.schemas import (
    UserResponse,
    UserListResponse,
    ProviderVerificationUpdate,
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
    AdminDashboardStats,
    AdminBookingResponse,
    BookingStatus,
    ReviewResponse,
    ReviewModerationUpdate
)
from app.core.security import get_current_admin
from app.core.database import get_supabase, get_db_pool
from supabase import Client
import asyncpg

router = APIRouter(prefix="/admins", tags=["admins"])


# User Management
@router.get("/users", response_model=UserListResponse)
async def get_all_users(
    role: Optional[str] = Query(None, description="Filter by role: customer, provider, admin"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_admin),
    supabase: Client = Depends(get_supabase)
):
    """Get all users with pagination and optional role filter"""
    try:
        query = supabase.table("profiles").select("*")
        
        if role:
            query = query.eq("role", role)
        
        # Get total count
        count_result = query.execute()
        total = len(count_result.data) if count_result.data else 0
        
        # Apply pagination
        offset = (page - 1) * page_size
        query = query.order("created_at", desc=True).range(offset, offset + page_size - 1)
        
        result = query.execute()
        
        users = []
        for user in result.data:
            users.append({
                "id": user["id"],
                "email": user.get("email"),
                "phone": user.get("phone"),
                "full_name": user.get("full_name"),
                "role": user.get("role", "customer"),
                "created_at": datetime.fromisoformat(user["created_at"].replace('Z', '+00:00')) if isinstance(user.get("created_at"), str) else user.get("created_at"),
                "is_active": user.get("is_active", True)
            })
        
        return {
            "users": users,
            "total": total,
            "page": page,
            "page_size": page_size
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching users: {str(e)}"
        )


@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user: dict = Depends(get_current_admin),
    supabase: Client = Depends(get_supabase)
):
    """Get detailed information about a specific user"""
    try:
        result = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user = result.data
        return {
            "id": user["id"],
            "email": user.get("email"),
            "phone": user.get("phone"),
            "full_name": user.get("full_name"),
            "role": user.get("role", "customer"),
            "created_at": datetime.fromisoformat(user["created_at"].replace('Z', '+00:00')) if isinstance(user.get("created_at"), str) else user.get("created_at"),
            "is_active": user.get("is_active", True)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching user: {str(e)}"
        )


@router.put("/users/{user_id}/role", response_model=UserResponse)
async def update_user_role(
    user_id: str,
    new_role: str = Query(..., description="New role: customer, provider, admin"),
    current_user: dict = Depends(get_current_admin),
    supabase: Client = Depends(get_supabase)
):
    """Update a user's role"""
    if new_role not in ["customer", "provider", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Must be one of: customer, provider, admin"
        )
    
    try:
        # Prevent self-role change
        if user_id == current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot change your own role"
            )
        
        result = supabase.table("profiles").update({
            "role": new_role
        }).eq("id", user_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user = result.data[0]
        return {
            "id": user["id"],
            "email": user.get("email"),
            "phone": user.get("phone"),
            "full_name": user.get("full_name"),
            "role": user.get("role"),
            "created_at": datetime.fromisoformat(user["created_at"].replace('Z', '+00:00')) if isinstance(user.get("created_at"), str) else user.get("created_at"),
            "is_active": user.get("is_active", True)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating user role: {str(e)}"
        )


@router.put("/users/{user_id}/status", response_model=UserResponse)
async def update_user_status(
    user_id: str,
    is_active: bool = Query(..., description="User active status"),
    current_user: dict = Depends(get_current_admin),
    supabase: Client = Depends(get_supabase)
):
    """Activate or deactivate a user account"""
    try:
        # Prevent self-deactivation
        if user_id == current_user["id"] and not is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot deactivate your own account"
            )
        
        result = supabase.table("profiles").update({
            "is_active": is_active
        }).eq("id", user_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user = result.data[0]
        return {
            "id": user["id"],
            "email": user.get("email"),
            "phone": user.get("phone"),
            "full_name": user.get("full_name"),
            "role": user.get("role"),
            "created_at": datetime.fromisoformat(user["created_at"].replace('Z', '+00:00')) if isinstance(user.get("created_at"), str) else user.get("created_at"),
            "is_active": user.get("is_active", True)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating user status: {str(e)}"
        )


# Provider Verification
@router.get("/providers/pending", response_model=List[dict])
async def get_pending_providers(
    current_user: dict = Depends(get_current_admin),
    supabase: Client = Depends(get_supabase)
):
    """Get all providers pending verification"""
    try:
        result = supabase.table("provider_profiles").select(
            """
            *,
            categories(name),
            profiles!provider_profiles_user_id_fkey(full_name, email, phone, created_at)
            """
        ).eq("is_verified", False).order("created_at", desc=True).execute()
        
        providers = []
        for provider in result.data:
            providers.append({
                "id": provider["id"],
                "user_id": provider["user_id"],
                "category_id": provider["category_id"],
                "category_name": provider["categories"]["name"] if provider.get("categories") else None,
                "bio": provider["bio"],
                "base_price": provider["base_price"],
                "is_verified": provider["is_verified"],
                "provider_name": provider["profiles"]["full_name"] if provider.get("profiles") else None,
                "provider_email": provider["profiles"]["email"] if provider.get("profiles") else None,
                "provider_phone": provider["profiles"]["phone"] if provider.get("profiles") else None,
                "created_at": provider["created_at"]
            })
        
        return providers
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching pending providers: {str(e)}"
        )


@router.put("/providers/{provider_id}/verify", response_model=dict)
async def verify_provider(
    provider_id: str,
    verification: ProviderVerificationUpdate,
    current_user: dict = Depends(get_current_admin),
    supabase: Client = Depends(get_supabase)
):
    """Verify or unverify a provider"""
    try:
        # Check if provider exists
        provider_result = supabase.table("provider_profiles").select("*").eq("id", provider_id).single().execute()
        
        if not provider_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Provider not found"
            )
        
        update_data = {
            "is_verified": verification.is_verified
        }
        
        # Store verification notes if provided (you might want to add a verification_notes column)
        # For now, we'll just update the verification status
        
        result = supabase.table("provider_profiles").update(update_data).eq("id", provider_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update provider verification"
            )
        
        return {
            "id": provider_id,
            "is_verified": verification.is_verified,
            "message": "Provider verification updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating provider verification: {str(e)}"
        )


# Category Management
@router.get("/categories", response_model=List[CategoryResponse])
async def get_all_categories(
    current_user: dict = Depends(get_current_admin),
    supabase: Client = Depends(get_supabase)
):
    """Get all categories"""
    try:
        result = supabase.table("categories").select("*").order("name").execute()
        return result.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching categories: {str(e)}"
        )


@router.post("/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    category: CategoryCreate,
    current_user: dict = Depends(get_current_admin),
    supabase: Client = Depends(get_supabase)
):
    """Create a new service category"""
    try:
        # Check if category with same name exists
        existing = supabase.table("categories").select("*").eq("name", category.name).execute()
        if existing.data:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Category with this name already exists"
            )
        
        result = supabase.table("categories").insert({
            "name": category.name,
            "icon_url": category.icon_url
        }).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create category"
            )
        
        cat = result.data[0]
        return {
            "id": cat["id"],
            "name": cat["name"],
            "icon_url": cat.get("icon_url"),
            "created_at": datetime.fromisoformat(cat["created_at"].replace('Z', '+00:00')) if isinstance(cat.get("created_at"), str) else cat.get("created_at")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating category: {str(e)}"
        )


@router.put("/categories/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int,
    category_update: CategoryUpdate,
    current_user: dict = Depends(get_current_admin),
    supabase: Client = Depends(get_supabase)
):
    """Update a category"""
    try:
        # Check if category exists
        existing = supabase.table("categories").select("*").eq("id", category_id).single().execute()
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )
        
        # Check name uniqueness if name is being updated
        if category_update.name:
            name_check = supabase.table("categories").select("*").eq("name", category_update.name).neq("id", category_id).execute()
            if name_check.data:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Category with this name already exists"
                )
        
        update_data = {}
        if category_update.name is not None:
            update_data["name"] = category_update.name
        if category_update.icon_url is not None:
            update_data["icon_url"] = category_update.icon_url
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
        
        result = supabase.table("categories").update(update_data).eq("id", category_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update category"
            )
        
        cat = result.data[0]
        return {
            "id": cat["id"],
            "name": cat["name"],
            "icon_url": cat.get("icon_url"),
            "created_at": datetime.fromisoformat(cat["created_at"].replace('Z', '+00:00')) if isinstance(cat.get("created_at"), str) else cat.get("created_at")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating category: {str(e)}"
        )


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: int,
    current_user: dict = Depends(get_current_admin),
    supabase: Client = Depends(get_supabase),
    db_pool: asyncpg.Pool = Depends(get_db_pool)
):
    """Delete a category (only if no providers are using it)"""
    if not db_pool:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection not available"
        )
    
    try:
        # Check if category exists
        existing = supabase.table("categories").select("*").eq("id", category_id).single().execute()
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )
        
        # Check if any providers are using this category
        async with db_pool.acquire() as conn:
            providers_using = await conn.fetchrow("""
                SELECT COUNT(*) as count
                FROM provider_profiles
                WHERE category_id = $1
            """, category_id)
            
            if providers_using and providers_using["count"] > 0:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Cannot delete category. {providers_using['count']} provider(s) are using this category."
                )
        
        # Delete category
        supabase.table("categories").delete().eq("id", category_id).execute()
        
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting category: {str(e)}"
        )


# Booking Management
@router.get("/bookings", response_model=List[AdminBookingResponse])
async def get_all_bookings(
    status_filter: Optional[str] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_admin),
    supabase: Client = Depends(get_supabase)
):
    """Get all bookings with pagination and optional status filter"""
    try:
        query = supabase.table("bookings").select(
            """
            *,
            profiles!bookings_customer_id_fkey(full_name, email) as customer,
            provider_profiles!bookings_provider_id_fkey(
                user_id,
                profiles!provider_profiles_user_id_fkey(full_name, email)
            ) as provider_info
            """
        )
        
        if status_filter:
            query = query.eq("status", status_filter)
        
        query = query.order("created_at", desc=True)
        
        # Apply pagination
        offset = (page - 1) * page_size
        result = query.range(offset, offset + page_size - 1).execute()
        
        bookings = []
        for booking in result.data:
            customer = booking.get("customer", {}) if isinstance(booking.get("customer"), dict) else {}
            provider_info = booking.get("provider_info", {})
            provider_user = provider_info.get("profiles", {}) if isinstance(provider_info, dict) else {}
            
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
                "provider_name": provider_user.get("full_name") if provider_user else None,
                "provider_email": provider_user.get("email") if provider_user else None
            })
        
        return bookings
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching bookings: {str(e)}"
        )


@router.get("/bookings/{booking_id}", response_model=AdminBookingResponse)
async def get_booking(
    booking_id: str,
    current_user: dict = Depends(get_current_admin),
    supabase: Client = Depends(get_supabase)
):
    """Get detailed information about a specific booking"""
    try:
        result = supabase.table("bookings").select(
            """
            *,
            profiles!bookings_customer_id_fkey(full_name, email) as customer,
            provider_profiles!bookings_provider_id_fkey(
                user_id,
                profiles!provider_profiles_user_id_fkey(full_name, email)
            ) as provider_info
            """
        ).eq("id", booking_id).single().execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        
        booking = result.data
        customer = booking.get("customer", {}) if isinstance(booking.get("customer"), dict) else {}
        provider_info = booking.get("provider_info", {})
        provider_user = provider_info.get("profiles", {}) if isinstance(provider_info, dict) else {}
        
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
            "provider_name": provider_user.get("full_name") if provider_user else None,
            "provider_email": provider_user.get("email") if provider_user else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching booking: {str(e)}"
        )


# Dashboard & Analytics
@router.get("/dashboard", response_model=AdminDashboardStats)
async def get_admin_dashboard(
    current_user: dict = Depends(get_current_admin),
    supabase: Client = Depends(get_supabase),
    db_pool: asyncpg.Pool = Depends(get_db_pool)
):
    """Get admin dashboard statistics and overview"""
    if not db_pool:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection not available"
        )
    
    try:
        async with db_pool.acquire() as conn:
            # User statistics
            user_stats = await conn.fetchrow("""
                SELECT 
                    COUNT(*) as total_users,
                    COUNT(*) FILTER (WHERE role = 'customer') as total_customers,
                    COUNT(*) FILTER (WHERE role = 'provider') as total_providers
                FROM profiles
            """)
            
            # Provider verification stats
            provider_stats = await conn.fetchrow("""
                SELECT 
                    COUNT(*) FILTER (WHERE is_verified = true) as verified_providers,
                    COUNT(*) FILTER (WHERE is_verified = false) as pending_providers
                FROM provider_profiles
            """)
            
            # Booking statistics
            booking_stats = await conn.fetchrow("""
                SELECT 
                    COUNT(*) as total_bookings,
                    COUNT(*) FILTER (WHERE status = 'pending') as pending_bookings,
                    COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_bookings,
                    COUNT(*) FILTER (WHERE status = 'completed') as completed_bookings,
                    COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_bookings,
                    COALESCE(SUM(total_price) FILTER (WHERE status = 'completed'), 0) as total_revenue
                FROM bookings
            """)
            
            # Category count
            category_count = await conn.fetchrow("""
                SELECT COUNT(*) as total_categories FROM categories
            """)
            
            # Review statistics
            review_stats = await conn.fetchrow("""
                SELECT 
                    COUNT(*) as total_reviews,
                    COALESCE(AVG(rating)::float, 0) as avg_rating
                FROM reviews
            """)
            
            # Recent users (last 10)
            recent_users = await conn.fetch("""
                SELECT 
                    id,
                    full_name,
                    email,
                    role,
                    created_at
                FROM profiles
                ORDER BY created_at DESC
                LIMIT 10
            """)
            
            # Recent bookings (last 10)
            recent_bookings = await conn.fetch("""
                SELECT 
                    b.id,
                    b.status,
                    b.scheduled_for,
                    b.total_price,
                    b.created_at,
                    c.full_name as customer_name,
                    p.full_name as provider_name
                FROM bookings b
                LEFT JOIN profiles c ON b.customer_id = c.id
                LEFT JOIN provider_profiles pp ON b.provider_id = pp.id
                LEFT JOIN profiles p ON pp.user_id = p.id
                ORDER BY b.created_at DESC
                LIMIT 10
            """)
            
            # Top providers by bookings
            top_providers = await conn.fetch("""
                SELECT 
                    pp.id,
                    p.full_name as provider_name,
                    COUNT(b.id) as total_bookings,
                    COALESCE(SUM(b.total_price) FILTER (WHERE b.status = 'completed'), 0) as total_earnings,
                    pp.avg_rating
                FROM provider_profiles pp
                LEFT JOIN profiles p ON pp.user_id = p.id
                LEFT JOIN bookings b ON pp.id = b.provider_id
                WHERE pp.is_verified = true
                GROUP BY pp.id, p.full_name, pp.avg_rating
                ORDER BY total_bookings DESC
                LIMIT 10
            """)
        
        recent_users_list = []
        for user in recent_users:
            recent_users_list.append({
                "id": str(user["id"]),
                "full_name": user["full_name"],
                "email": user["email"],
                "role": user["role"],
                "created_at": user["created_at"].isoformat() if user["created_at"] else None
            })
        
        recent_bookings_list = []
        for booking in recent_bookings:
            recent_bookings_list.append({
                "id": str(booking["id"]),
                "status": booking["status"],
                "scheduled_for": booking["scheduled_for"].isoformat() if booking["scheduled_for"] else None,
                "total_price": float(booking["total_price"]) if booking["total_price"] else None,
                "customer_name": booking["customer_name"],
                "provider_name": booking["provider_name"],
                "created_at": booking["created_at"].isoformat() if booking["created_at"] else None
            })
        
        top_providers_list = []
        for provider in top_providers:
            top_providers_list.append({
                "id": str(provider["id"]),
                "provider_name": provider["provider_name"],
                "total_bookings": provider["total_bookings"] or 0,
                "total_earnings": float(provider["total_earnings"]) if provider["total_earnings"] else 0.0,
                "avg_rating": float(provider["avg_rating"]) if provider["avg_rating"] else 0.0
            })
        
        return {
            "total_users": user_stats["total_users"] or 0,
            "total_customers": user_stats["total_customers"] or 0,
            "total_providers": user_stats["total_providers"] or 0,
            "verified_providers": provider_stats["verified_providers"] or 0,
            "pending_providers": provider_stats["pending_providers"] or 0,
            "total_bookings": booking_stats["total_bookings"] or 0,
            "pending_bookings": booking_stats["pending_bookings"] or 0,
            "confirmed_bookings": booking_stats["confirmed_bookings"] or 0,
            "completed_bookings": booking_stats["completed_bookings"] or 0,
            "cancelled_bookings": booking_stats["cancelled_bookings"] or 0,
            "total_revenue": Decimal(str(booking_stats["total_revenue"])) if booking_stats["total_revenue"] else Decimal("0"),
            "total_categories": category_count["total_categories"] or 0,
            "total_reviews": review_stats["total_reviews"] or 0,
            "avg_platform_rating": float(review_stats["avg_rating"]) if review_stats["avg_rating"] else 0.0,
            "recent_users": recent_users_list,
            "recent_bookings": recent_bookings_list,
            "top_providers": top_providers_list
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching dashboard stats: {str(e)}"
        )


# Review Management
@router.get("/reviews", response_model=List[ReviewResponse])
async def get_all_reviews(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_admin),
    supabase: Client = Depends(get_supabase)
):
    """Get all reviews with pagination"""
    try:
        offset = (page - 1) * page_size
        result = supabase.table("reviews").select(
            """
            *,
            profiles!reviews_customer_id_fkey(full_name)
            """
        ).order("created_at", desc=True).range(offset, offset + page_size - 1).execute()
        
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


@router.delete("/reviews/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(
    review_id: str,
    current_user: dict = Depends(get_current_admin),
    supabase: Client = Depends(get_supabase),
    db_pool: asyncpg.Pool = Depends(get_db_pool)
):
    """Delete a review (moderation)"""
    if not db_pool:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection not available"
        )
    
    try:
        # Check if review exists
        existing = supabase.table("reviews").select("*").eq("id", review_id).single().execute()
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review not found"
            )
        
        review = existing.data
        
        # Delete review
        supabase.table("reviews").delete().eq("id", review_id).execute()
        
        # Update provider's average rating
        async with db_pool.acquire() as conn:
            await conn.execute("""
                UPDATE provider_profiles
                SET avg_rating = (
                    SELECT COALESCE(AVG(rating)::float, 0)
                    FROM reviews
                    WHERE provider_id = $1
                )
                WHERE id = $1
            """, review["provider_id"])
        
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting review: {str(e)}"
        )

