from app.database import appointments_col
from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")

def send_reminder_email(to_email, patient_name, date, time, doctor_name):
    if not SMTP_USER:
        print(f"[REMINDER] Would email {to_email}: {patient_name} on {date} at {time} with {doctor_name}")
        return
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Appointment Reminder — {date} at {time}"
    msg["From"] = SMTP_USER
    msg["To"] = to_email
    html = f"""
    <html><body style="font-family:sans-serif;background:#f9fafb;padding:32px">
    <div style="max-width:520px;margin:auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #e5e7eb">
      <h2 style="color:#0f172a;margin:0 0 8px">Appointment Reminder</h2>
      <p style="color:#6b7280;margin:0 0 24px">Hello <strong>{patient_name}</strong>,</p>
      <div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:16px;border-radius:8px;margin-bottom:24px">
        <p style="margin:0;font-size:15px;color:#166534">
          <strong>Date:</strong> {date}<br>
          <strong>Time:</strong> {time}<br>
          <strong>Doctor:</strong> {doctor_name}
        </p>
      </div>
      <p style="color:#6b7280;font-size:13px">Please arrive 10 minutes early. To reschedule, contact the clinic.</p>
    </div>
    </body></html>
    """
    msg.attach(MIMEText(html, "html"))
    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(SMTP_USER, to_email, msg.as_string())
        print(f"[REMINDER] Sent to {to_email}")
    except Exception as e:
        print(f"[REMINDER] Failed: {e}")

def send_pending_reminders():
    from app.database import users_col
    from bson import ObjectId
    tomorrow = (datetime.utcnow() + timedelta(days=1)).strftime("%Y-%m-%d")
    pending = appointments_col.find({
        "date": tomorrow, "status": "booked",
        "reminder_sent": False,
        "patient_email": {"$exists": True, "$ne": None, "$ne": ""}
    })
    count = 0
    for appt in pending:
        doctor = users_col.find_one({"_id": ObjectId(appt["doctor_id"])})
        doctor_name = doctor["name"] if doctor else "your doctor"
        send_reminder_email(appt["patient_email"], appt["patient_name"], appt["date"], appt["time"], doctor_name)
        appointments_col.update_one({"_id": appt["_id"]}, {"$set": {"reminder_sent": True}})
        count += 1
    print(f"[REMINDER] Sent {count} reminders for {tomorrow}")
    return count
