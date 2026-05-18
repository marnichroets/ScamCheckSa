from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional
import jwt
import bcrypt
import httpx

from core.config import get_settings
from core.database import get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])
settings = get_settings()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"


class UserRegister(BaseModel):
    username: str
    password: str
    email: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


def create_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


async def get_current_user(token: str = Depends(oauth2_scheme), db=Depends(get_db)):
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        username = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Invalid token.")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")

    user = await db.users.find_one({"$or": [{"username": username}, {"email": username}]})
    if not user:
        # Admin from env may not be in DB — synthesize
        if username in (settings.admin_username, settings.admin_email):
            return {"username": username, "email": settings.admin_email, "is_admin": True}
        raise HTTPException(status_code=401, detail="User not found.")
    return user


async def require_admin(current_user: dict = Depends(get_current_user)):
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required.")
    return current_user


@router.post("/register", response_model=dict)
async def register(user: UserRegister, db=Depends(get_db)):
    query = {"$or": [{"username": user.username}]}
    if user.email:
        query["$or"].append({"email": user.email})
    existing = await db.users.find_one(query)
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already taken.")

    hashed = bcrypt.hashpw(user.password.encode(), bcrypt.gensalt()).decode()
    doc = {
        "username": user.username,
        "email": user.email,
        "password_hash": hashed,
        "is_admin": False,
        "created_at": datetime.utcnow(),
    }
    await db.users.insert_one(doc)
    return {"message": "Account created successfully."}


@router.post("/token", response_model=Token)
async def login(form: OAuth2PasswordRequestForm = Depends(), db=Depends(get_db)):
    login_input = form.username.strip()

    # Check hardcoded admin credentials (match by username or email)
    if login_input in (settings.admin_username, settings.admin_email) and form.password == settings.admin_password:
        token = create_token({"sub": login_input, "is_admin": True})
        return Token(access_token=token)

    # Look up DB user by username or email
    user = await db.users.find_one(
        {"$or": [{"username": login_input}, {"email": login_input}]}
    )

    if not user or not user.get("password_hash") or not bcrypt.checkpw(
        form.password.encode(), user["password_hash"].encode()
    ):
        raise HTTPException(status_code=401, detail="Invalid credentials.")

    token = create_token({"sub": user["username"], "is_admin": user.get("is_admin", False)})
    return Token(access_token=token)


@router.get("/me", response_model=dict)
async def me(current_user: dict = Depends(get_current_user)):
    return {
        "username": current_user["username"],
        "email": current_user.get("email"),
        "is_admin": current_user.get("is_admin", False),
    }


@router.get("/google")
async def google_login():
    if not settings.google_client_id:
        raise HTTPException(status_code=503, detail="Google OAuth not configured.")

    callback_uri = f"{settings.backend_url}/api/auth/google/callback"
    params = (
        f"client_id={settings.google_client_id}"
        f"&redirect_uri={callback_uri}"
        f"&response_type=code"
        f"&scope=openid%20email%20profile"
        f"&access_type=offline"
        f"&prompt=select_account"
    )
    return RedirectResponse(f"{GOOGLE_AUTH_URL}?{params}")


@router.get("/google/callback")
async def google_callback(code: str = "", error: str = "", db=Depends(get_db)):
    if error or not code:
        return RedirectResponse(f"{settings.frontend_url}/login?error=google_cancelled")

    if not settings.google_client_id or not settings.google_client_secret:
        return RedirectResponse(f"{settings.frontend_url}/login?error=not_configured")

    callback_uri = f"{settings.backend_url}/api/auth/google/callback"

    async with httpx.AsyncClient() as client:
        token_resp = await client.post(GOOGLE_TOKEN_URL, data={
            "code": code,
            "client_id": settings.google_client_id,
            "client_secret": settings.google_client_secret,
            "redirect_uri": callback_uri,
            "grant_type": "authorization_code",
        })
        if token_resp.status_code != 200:
            return RedirectResponse(f"{settings.frontend_url}/login?error=google_auth_failed")

        access_token = token_resp.json().get("access_token")

        user_resp = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if user_resp.status_code != 200:
            return RedirectResponse(f"{settings.frontend_url}/login?error=google_auth_failed")

        google_user = user_resp.json()

    email = google_user.get("email", "").lower()
    name = google_user.get("name", email)

    if not email:
        return RedirectResponse(f"{settings.frontend_url}/login?error=no_email")

    is_admin = email == settings.admin_email.lower()

    user = await db.users.find_one({"email": email})
    if not user:
        doc = {
            "username": email,
            "email": email,
            "name": name,
            "password_hash": "",
            "is_admin": is_admin,
            "auth_provider": "google",
            "created_at": datetime.utcnow(),
        }
        await db.users.insert_one(doc)
        username = email
    else:
        username = user["username"]
        if is_admin and not user.get("is_admin"):
            await db.users.update_one({"email": email}, {"$set": {"is_admin": True}})

    jwt_token = create_token({"sub": username, "is_admin": is_admin})
    return RedirectResponse(f"{settings.frontend_url}/login?token={jwt_token}")
