from jose import jwt, JWTError
from passlib.context import CryptContext
from datetime import datetime, timedelta
from fastapi import HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
import httpx

SECRET = os.getenv("JWT_SECRET", "clinicflow_super_secret_change_in_prod")
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 12
CLERK_ISSUER = os.getenv("CLERK_ISSUER", "https://humble-bee-93.clerk.accounts.dev")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer_scheme = HTTPBearer(auto_error=False)

# Cache JWKS keys
_jwks_cache = None

def get_jwks():
    global _jwks_cache
    if _jwks_cache:
        return _jwks_cache
    url = f"{CLERK_ISSUER}/.well-known/jwks.json"
    response = httpx.get(url, timeout=10)
    _jwks_cache = response.json()
    return _jwks_cache

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS)
    return jwt.encode(payload, SECRET, algorithm=ALGORITHM)

def decode_own_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> dict:
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = credentials.credentials

    # 1) Try Clerk RS256 token
    try:
        header = jwt.get_unverified_header(token)
        if header.get("alg") == "RS256":
            jwks = get_jwks()
            kid = header.get("kid")
            key = next((k for k in jwks.get("keys", []) if k.get("kid") == kid), None)
            if key:
                payload = jwt.decode(
                    token,
                    key,
                    algorithms=["RS256"],
                    options={"verify_aud": False}
                )
                # Look up user in MongoDB by clerk_id (sub) or email
                from app.database import users_col
                clerk_id = payload.get("sub")
                email = payload.get("email")
                
                user = users_col.find_one({"clerk_id": clerk_id})
                if not user and email:
                    user = users_col.find_one({"email": email})
                if not user:
                    raise HTTPException(404, "User not registered. Please select a role first.")

                return {
                    "email": user.get("email"),
                    "role": user.get("role"),
                    "name": user.get("name"),
                    "id": str(user["_id"])
                }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Clerk token decode failed: {e}")

    # 2) Fall back to our own HS256 JWT
    return decode_own_token(token)

def require_role(*roles):
    def checker(user: dict = Depends(get_current_user)):
        if user.get("role") not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return checker