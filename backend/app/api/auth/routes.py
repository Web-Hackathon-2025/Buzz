from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from app.core.database import get_supabase
from supabase import Client
import logging
import traceback

# ------------------------------------------------------------------
# Logging config (ideally this lives in main.py, but safe here too)
# ------------------------------------------------------------------
logging.basicConfig(
    level=logging.ERROR,
    format="%(asctime)s - %(levelname)s - %(message)s",
)

router = APIRouter(prefix="/auth", tags=["auth"])


# ------------------------------------------------------------------
# Schemas
# ------------------------------------------------------------------
class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------
def _build_user_response(
    user: dict,
    full_name: str | None = None,
    phone: str | None = None,
):
    return {
        "id": user.get("id"),
        "email": user.get("email"),
        "full_name": full_name,
        "phone": phone,
        "role": "customer",
    }


# ------------------------------------------------------------------
# Routes
# ------------------------------------------------------------------
@router.post("/signup")
def signup(payload: SignupRequest):
    supabase: Client = get_supabase()

    try:
        # 1️⃣ Create auth user
        auth_response = supabase.auth.sign_up(
            {
                "email": payload.email,
                "password": payload.password,
            }
        )

        if not auth_response or not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Signup failed",
            )

        user = auth_response.user
        user_id = str(user.id)

        # 2️⃣ Create profile row
        profile_resp = (
            supabase.table("profiles")
            .upsert(
                {
                    "id": user_id,
                    "full_name": payload.full_name,
                    "email": payload.email,
                    "phone": payload.phone,
                    "role": "customer",
                }
            )
            .execute()
        )

        if not profile_resp:
            raise Exception("Profile insert failed")

        return {
            "access_token": auth_response.session.access_token
            if auth_response.session
            else None,
            "refresh_token": auth_response.session.refresh_token
            if auth_response.session
            else None,
            "token_type": "bearer",
            "user": _build_user_response(
                {"id": user_id, "email": payload.email},
                full_name=payload.full_name,
                phone=payload.phone,
            ),
        }

    except HTTPException:
        # Re-throw expected HTTP errors
        raise

    except Exception:
        # 🔥 FULL TRACEBACK PRINTED HERE
        logging.error("Signup failed")
        logging.error(traceback.format_exc())

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Signup failed. Check server logs for details.",
        )


@router.post("/login")
def login(payload: LoginRequest):
    supabase: Client = get_supabase()

    try:
        auth_response = supabase.auth.sign_in_with_password(
            {
                "email": payload.email,
                "password": payload.password,
            }
        )

        if not auth_response or not auth_response.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )

        user = auth_response.user
        user_id = str(user.id)

        profile_resp = (
            supabase.table("profiles")
            .select("*")
            .eq("id", user_id)
            .single()
            .execute()
        )

        profile = profile_resp.data if profile_resp and profile_resp.data else None

        return {
            "access_token": auth_response.session.access_token,
            "refresh_token": auth_response.session.refresh_token,
            "token_type": "bearer",
            "user": _build_user_response(
                {"id": user_id, "email": payload.email},
                full_name=profile.get("full_name") if profile else None,
                phone=profile.get("phone") if profile else None,
            ),
        }

    except HTTPException:
        raise

    except Exception:
        # 🔥 FULL TRACEBACK PRINTED HERE
        logging.error("Login failed")
        logging.error(traceback.format_exc())

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed. Check server logs for details.",
        )
