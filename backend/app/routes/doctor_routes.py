from fastapi import APIRouter, Depends
from app.database import appointments_col, users_col
from app.utils.auth_utils import get_current_user, require_role
from bson import ObjectId
from datetime import datetime, date

router = APIRouter()

def serialize(doc):
    doc["_id"] = str(doc["_id"])
    return doc

@router.get("/list")
def list_doctors(_: dict = Depends(get_current_user)):
    doctors = list(users_col.find({"role": "doctor"}, {"password": 0}))
    return [serialize(d) for d in doctors]

@router.get("/schedule/{doctor_id}")
def get_schedule(doctor_id: str, date: str = None, user: dict = Depends(get_current_user)):
    query = {"doctor_id": doctor_id, "status": {"$in": ["booked", "completed", "no_show"]}}
    if date:
        query["date"] = date
    appts = list(appointments_col.find(query).sort([("date", 1), ("time", 1)]))
    return [serialize(a) for a in appts]

@router.get("/today")
def todays_schedule(user: dict = Depends(require_role("doctor"))):
    today = date.today().isoformat()
    appts = list(appointments_col.find({
        "doctor_id": user["id"],
        "date": today,
        "status": {"$in": ["booked", "completed", "no_show"]}
    }).sort("time", 1))
    return [serialize(a) for a in appts]

@router.get("/stats/{doctor_id}")
def get_stats(doctor_id: str, _: dict = Depends(get_current_user)):
    total = appointments_col.count_documents({"doctor_id": doctor_id})
    booked = appointments_col.count_documents({"doctor_id": doctor_id, "status": "booked"})
    completed = appointments_col.count_documents({"doctor_id": doctor_id, "status": "completed"})
    cancelled = appointments_col.count_documents({"doctor_id": doctor_id, "status": "cancelled"})
    today = date.today().isoformat()
    today_count = appointments_col.count_documents({"doctor_id": doctor_id, "date": today, "status": "booked"})
    return {"total": total, "booked": booked, "completed": completed, "cancelled": cancelled, "today": today_count}