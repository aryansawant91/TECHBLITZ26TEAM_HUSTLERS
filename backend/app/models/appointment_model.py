from pydantic import BaseModel
from typing import Optional, Literal

class AppointmentCreate(BaseModel):
    patient_name: str
    patient_phone: str
    patient_email: Optional[str] = None
    doctor_id: str
    date: str
    time: str
    duration_minutes: int = 30
    notes: Optional[str] = None

class AppointmentReschedule(BaseModel):
    new_date: str
    new_time: str

class AppointmentUpdate(BaseModel):
    status: Literal["booked", "cancelled", "completed", "no_show"]