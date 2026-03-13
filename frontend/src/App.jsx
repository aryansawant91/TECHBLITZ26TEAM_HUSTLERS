import React, { useEffect, useState } from "react"
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@clerk/react"
import { RoleProvider, useRole } from "./context/AuthContext"
import Landing from "./pages/Landing"
import DoctorDashboard from "./pages/DoctorDashboard"
import ReceptionDashboard from "./pages/ReceptionDashboard"

function RoleMismatchBanner() {
  const { role: userRole } = useRole()
  const location = useLocation()
  const [visible, setVisible] = useState(false)
  const [attemptedRole, setAttemptedRole] = useState("")

  useEffect(() => {
    const mismatch = sessionStorage.getItem("role_mismatch")
    const attempted = sessionStorage.getItem("attempted_role") || ""
    if (mismatch) {
      setAttemptedRole(attempted)
      setVisible(true)
      sessionStorage.removeItem("role_mismatch")
      sessionStorage.removeItem("attempted_role")
      const t = setTimeout(() => setVisible(false), 5000)
      return () => clearTimeout(t)
    }
  }, [location.pathname])

  if (!visible) return null

  const roleLabel = (r) => r === "doctor" ? "Doctor" : "Receptionist"

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 shadow-lg flex items-start gap-3">
        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-800">Role Mismatch</p>
          <p className="text-xs text-amber-700 mt-1">
            You selected <strong>{roleLabel(attemptedRole)}</strong> but your account is registered as{" "}
            <strong>{roleLabel(userRole)}</strong>. You've been redirected to your correct dashboard.
          </p>
        </div>
        <button onClick={() => setVisible(false)} className="text-amber-400 hover:text-amber-600 transition-colors shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

function ProtectedRoute({ children, role }) {
  const { isSignedIn, isLoaded } = useAuth()
  const { role: userRole, roleLoading } = useRole()

  if (!isLoaded || roleLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-clinic-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  )
  if (!isSignedIn) return <Navigate to="/" replace />
  if (!userRole) return <Navigate to="/" replace />
  if (role && userRole !== role) {
    sessionStorage.setItem("role_mismatch", "true")
    sessionStorage.setItem("attempted_role", role)
    return <Navigate to={userRole === "doctor" ? "/doctor" : "/reception"} replace />
  }
  return children
}

function AppRoutes() {
  const { isSignedIn, isLoaded } = useAuth()
  const { role, roleLoading } = useRole()

  if (!isLoaded || roleLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-clinic-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  return (
    <>
      <RoleMismatchBanner />
      <Routes>
        <Route path="/" element={
          !isSignedIn ? <Landing /> :
          !role ? <Landing /> :
          <Navigate to={role === "doctor" ? "/doctor" : "/reception"} replace />
        }/>
        <Route path="/role-select" element={<Navigate to="/" replace />}/>
        <Route path="/doctor" element={<ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>}/>
        <Route path="/reception" element={<ProtectedRoute role="receptionist"><ReceptionDashboard /></ProtectedRoute>}/>
        <Route path="*" element={<Navigate to="/" replace />}/>
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <RoleProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </RoleProvider>
  )
}