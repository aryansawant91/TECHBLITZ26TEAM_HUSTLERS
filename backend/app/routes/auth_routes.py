from fastapi import APIRouter, Depends, HTTPException
from app.database import users_col
from app.models.user_model import UserRegister, UserLogin
from app.utils.auth_utils import hash_password, verify_password, create_token, get_current_user

router = APIRouter()

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