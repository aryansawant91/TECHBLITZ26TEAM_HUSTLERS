#!/bin/bash
# Run this from your project root: TECHBLITZ26TEAM_HUSTLERS/
# bash setup_missing.sh

set -e
echo "Setting up missing files for ClinicFlow..."

# ─── BACKEND __init__.py files ───────────────────────────────────────────────
touch backend/app/__init__.py
touch backend/app/models/__init__.py
touch backend/app/routes/__init__.py
touch backend/app/services/__init__.py
touch backend/app/utils/__init__.py
echo "✓ Created all __init__.py files"

# ─── seed.py ─────────────────────────────────────────────────────────────────
cat > backend/seed.py << 'EOF'
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
EOF
echo "✓ Created backend/seed.py"

# ─── reminder_service.py ─────────────────────────────────────────────────────
cat > backend/app/services/reminder_service.py << 'EOF'
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
EOF
echo "✓ Created backend/app/services/reminder_service.py"

# ─── .env ────────────────────────────────────────────────────────────────────
cat > backend/.env << 'EOF'
MONGO_URI=mongodb://localhost:27017
JWT_SECRET=clinicflow_super_secret_change_in_prod
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EOF
echo "✓ Created backend/.env"

# ─── FRONTEND missing files ───────────────────────────────────────────────────
mkdir -p frontend/src/context

cat > frontend/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ClinicFlow — Clinic Management System</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
EOF
echo "✓ Created frontend/index.html"

cat > frontend/package.json << 'EOF'
{
  "name": "clinicflow-frontend",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0",
    "axios": "^1.6.0",
    "date-fns": "^3.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.1.0",
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.35"
  }
}
EOF
echo "✓ Created frontend/package.json"

cat > frontend/vite.config.js << 'EOF'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": { target: "http://localhost:8000", rewrite: (p) => p.replace(/^\/api/, "") }
    }
  }
});
EOF
echo "✓ Created frontend/vite.config.js"

cat > frontend/tailwind.config.js << 'EOF'
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        serif: ["DM Serif Display", "serif"],
      },
      colors: {
        clinic: {
          50: "#f0fdf6", 100: "#dcfce9", 200: "#bbf7d2",
          400: "#4ade80", 500: "#22c55e", 600: "#16a34a",
          700: "#15803d", 800: "#166534", 900: "#14532d",
        }
      }
    }
  },
  plugins: []
}
EOF
echo "✓ Created frontend/tailwind.config.js"

cat > frontend/postcss.config.js << 'EOF'
export default {
  plugins: { tailwindcss: {}, autoprefixer: {} }
}
EOF
echo "✓ Created frontend/postcss.config.js"

cat > frontend/src/main.jsx << 'EOF'
import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode><App /></React.StrictMode>
)
EOF
echo "✓ Created frontend/src/main.jsx"

cat > frontend/src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

* { box-sizing: border-box; }
body { font-family: "DM Sans", sans-serif; background: #f8faf9; color: #0f1f14; }

@layer components {
  .btn-primary {
    @apply bg-clinic-600 hover:bg-clinic-700 text-white font-medium px-5 py-2.5 rounded-xl transition-all duration-200 active:scale-95;
  }
  .btn-secondary {
    @apply bg-white hover:bg-gray-50 text-gray-700 font-medium px-5 py-2.5 rounded-xl border border-gray-200 transition-all duration-200 active:scale-95;
  }
  .btn-danger {
    @apply bg-red-50 hover:bg-red-100 text-red-700 font-medium px-5 py-2.5 rounded-xl border border-red-200 transition-all duration-200;
  }
  .card {
    @apply bg-white rounded-2xl border border-gray-100 shadow-sm;
  }
  .input-field {
    @apply w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-clinic-400 focus:border-transparent bg-white transition-all;
  }
  .badge-booked    { @apply bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full; }
  .badge-completed { @apply bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full; }
  .badge-cancelled { @apply bg-red-50 text-red-600 text-xs font-medium px-2.5 py-1 rounded-full; }
  .badge-no_show   { @apply bg-orange-50 text-orange-600 text-xs font-medium px-2.5 py-1 rounded-full; }
}
EOF
echo "✓ Created frontend/src/index.css"

cat > frontend/src/App.jsx << 'EOF'
import React from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import Login from "./pages/Login"
import DoctorDashboard from "./pages/DoctorDashboard"
import ReceptionDashboard from "./pages/ReceptionDashboard"

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-clinic-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  )
  if (!user) return <Navigate to="/" replace />
  if (role && user.role !== role) return <Navigate to={user.role === "doctor" ? "/doctor" : "/reception"} replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={user.role === "doctor" ? "/doctor" : "/reception"} replace /> : <Login />} />
      <Route path="/doctor" element={<ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>} />
      <Route path="/reception" element={<ProtectedRoute role="receptionist"><ReceptionDashboard /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
EOF
echo "✓ Created frontend/src/App.jsx"

cat > frontend/src/context/AuthContext.jsx << 'EOF'
import React, { createContext, useContext, useState, useEffect } from "react"
import api from "../services/api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("cf_token")
    const role  = localStorage.getItem("cf_role")
    const name  = localStorage.getItem("cf_name")
    const id    = localStorage.getItem("cf_id")
    if (token) setUser({ token, role, name, id })
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password })
    const { token, role, name } = res.data
    const payload = JSON.parse(atob(token.split(".")[1]))
    localStorage.setItem("cf_token", token)
    localStorage.setItem("cf_role", role)
    localStorage.setItem("cf_name", name)
    localStorage.setItem("cf_id", payload.id)
    setUser({ token, role, name, id: payload.id })
    return role
  }

  const logout = () => { localStorage.clear(); setUser(null) }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
EOF
echo "✓ Created frontend/src/context/AuthContext.jsx"

cat > frontend/src/services/api.js << 'EOF'
import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000"
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cf_token")
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear()
      window.location.href = "/"
    }
    return Promise.reject(err)
  }
)

export default api
EOF
echo "✓ Created frontend/src/services/api.js"

cat > frontend/.env << 'EOF'
VITE_API_URL=http://localhost:8000
EOF
echo "✓ Created frontend/.env"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "All missing files created successfully!"
echo ""
echo "Next steps:"
echo "  1. cd backend && pip install -r requirements.txt"
echo "  2. python seed.py          (creates demo users)"
echo "  3. uvicorn app.main:app --reload"
echo ""
echo "  4. cd frontend && npm install"
echo "  5. npm run dev"
echo ""
echo "Login: doctor@clinic.com / demo123"
echo "       receptionist@clinic.com / demo123"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
