from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client
from app.core.database import get_supabase
from typing import Optional

security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    supabase: Client = Depends(get_supabase)
) -> dict:
    """Get current authenticated user from Supabase JWT token"""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        token = credentials.credentials
        # Create a new Supabase client instance with the token
        # The Supabase client verifies the JWT token when accessing user
        user_response = supabase.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )
        # Convert user object to dict
        user_dict = {
            "id": user_response.user.id,
            "email": getattr(user_response.user, 'email', None),
            "phone": getattr(user_response.user, 'phone', None),
            "created_at": getattr(user_response.user, 'created_at', None),
        }
        return user_dict
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )


async def get_current_customer(
    current_user: dict = Depends(get_current_user)
) -> dict:
    """Ensure the current user is a customer"""
    # Check role from profiles table
    supabase = get_supabase()
    profile_result = supabase.table("profiles").select("*").eq("id", current_user["id"]).execute()
    
    if not profile_result.data or len(profile_result.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found"
        )
    
    profile = profile_result.data[0]
    if profile.get("role") != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Customer access required"
        )
    
    return current_user


async def get_current_provider(
    current_user: dict = Depends(get_current_user)
) -> dict:
    """Ensure the current user is a provider and return provider profile"""
    # Check role from profiles table
    supabase = get_supabase()
    profile_result = supabase.table("profiles").select("*").eq("id", current_user["id"]).execute()
    
    if not profile_result.data or len(profile_result.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found"
        )
    
    profile = profile_result.data[0]
    if profile.get("role") != "provider":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Provider access required"
        )
    
    # Get provider profile
    provider_profile_result = supabase.table("provider_profiles").select("*").eq("user_id", current_user["id"]).execute()
    
    if not provider_profile_result.data or len(provider_profile_result.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Provider profile not found. Please complete your provider profile setup."
        )
    
    provider_profile = provider_profile_result.data[0]
    
    # Add provider_id to user dict for convenience
    current_user["provider_id"] = provider_profile["id"]
    
    return current_user


async def get_current_admin(
    current_user: dict = Depends(get_current_user)
) -> dict:
    """Ensure the current user is an admin"""
    # Check role from profiles table
    supabase = get_supabase()
    profile_result = supabase.table("profiles").select("*").eq("id", current_user["id"]).execute()
    
    if not profile_result.data or len(profile_result.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found"
        )
    
    profile = profile_result.data[0]
    if profile.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    return current_user