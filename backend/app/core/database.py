from supabase import create_client, Client
from app.core.config import settings
import asyncpg
from typing import Optional


# Supabase client
supabase: Optional[Client] = None


def get_supabase() -> Client:
    """Get Supabase client instance"""
    global supabase
    if supabase is None:
        supabase = create_client(settings.supabase_url, settings.supabase_key)
    return supabase


# Database connection pool for raw SQL queries (PostGIS)
db_pool: Optional[asyncpg.Pool] = None


async def get_db_pool() -> Optional[asyncpg.Pool]:
    """Get database connection pool for PostGIS queries"""
    global db_pool
    if db_pool is None and settings.database_url:
        try:
            db_pool = await asyncpg.create_pool(settings.database_url)
        except Exception:
            # If pool creation fails, return None
            return None
    return db_pool


async def close_db_pool():
    """Close database connection pool"""
    global db_pool
    if db_pool:
        await db_pool.close()
        db_pool = None

