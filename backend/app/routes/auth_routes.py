from fastapi import APIRouter, Depends, HTTPException
from app.database import users_col
from app.models.user_model import UserRegister, UserLogin
from app.utils.auth_utils import hash_password, verify_password, create_token, get_current_user
from pydantic import BaseModel
from typing import Optional
from bson import ObjectId

router = APIRouter()

# ── Existing routes (keep exactly as they are) ──────────────────────────────

@router.post("/register", status_code=201)
def register(user: UserRegister):
    if users_col.find_one({"email": user.email}):
        raise HTTPException(400, "Email already registered")
    doc = user.dict()
    doc["password"] = hash_password(doc["password"])
    users_col.insert_one(doc)
    return {"message": "Registered successfully"}

@router.post("/login")
def login(data: UserLogin):
    user = users_col.find_one({"email": data.email})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(401, "Invalid email or password")
    token = create_token({
        "email": user["email"],
        "role": user["role"],
        "name": user["name"],
        "id": str(user["_id"])
    })
    return {"token": token, "role": user["role"], "name": user["name"]}

@router.get("/me")
def get_me(user: dict = Depends(get_current_user)):
    return user

# ── New Clerk routes ─────────────────────────────────────────────────────────

class ClerkRegister(BaseModel):
    clerk_id: str
    email: str
    name: str
    role: str

@router.post("/clerk-register", status_code=201)
def clerk_register(data: ClerkRegister):
    existing = users_col.find_one({"clerk_id": data.clerk_id})
    if existing:
        return {
            "message": "Already registered",
            "role": existing["role"],
            "name": existing["name"],
            "id": str(existing["_id"])
        }
    if data.role not in ["doctor", "receptionist"]:
        raise HTTPException(400, "Invalid role")

    doc = {
        "clerk_id": data.clerk_id,
        "email": data.email,
        "name": data.name,
        "role": data.role,
        "password": ""   # No password needed for Clerk users
    }
    result = users_col.insert_one(doc)
    return {
        "message": "Registered successfully",
        "role": data.role,
        "name": data.name,
        "id": str(result.inserted_id)
    }

@router.get("/clerk-me")
def clerk_me(clerk_id: str = None, email: str = None):
    """Lookup user in MongoDB by clerk_id or email"""
    user = None
    if clerk_id:
        user = users_col.find_one({"clerk_id": clerk_id})
    if not user and email:
        user = users_col.find_one({"email": email})
    if not user:
        raise HTTPException(404, "User not found in database")
    return {
        "role": user["role"],
        "name": user["name"],
        "id": str(user["_id"])
    }