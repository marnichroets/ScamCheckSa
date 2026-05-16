from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional
import jwt
import bcrypt

from core.config import get_settings
from core.database import get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])
settings = get_settings()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")


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

    user = await db.users.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=401, detail="User not found.")
    return user


async def require_admin(current_user: dict = Depends(get_current_user)):
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required.")
    return current_user


@router.post("/register", response_model=dict)
async def register(user: UserRegister, db=Depends(get_db)):
    existing = await db.users.find_one({"username": user.username})
    if existing:
        raise HTTPException(status_code=400, detail="Username already taken.")

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
    user = await db.users.find_one({"username": form.username})

    # Allow hardcoded admin login from env
    if form.username == settings.admin_username and form.password == settings.admin_password:
        token = create_token({"sub": form.username, "is_admin": True})
        return Token(access_token=token)

    if not user or not bcrypt.checkpw(form.password.encode(), user["password_hash"].encode()):
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
