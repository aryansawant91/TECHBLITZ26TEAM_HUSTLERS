"""
Run once to create demo users:
  cd backend && python seed.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from app.database import users_col
from app.utils.auth_utils import hash_password

users = [
    {"name": "Dr. Priya Sharma",  "email": "doctor@clinic.com",       "password": "demo123", "role": "doctor"},
    {"name": "Rahul Mehta",       "email": "receptionist@clinic.com",  "password": "demo123", "role": "receptionist"},
]

for u in users:
    if users_col.find_one({"email": u["email"]}):
        print(f"Already exists: {u['email']}")
    else:
        u["password"] = hash_password(u["password"])
        users_col.insert_one(u)
        print(f"Created: {u['email']}")

print("Done.")
