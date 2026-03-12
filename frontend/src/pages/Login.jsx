import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const role = await login(email, password)
      navigate(role === "doctor" ? "/doctor" : "/reception")
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-clinic-900 text-white p-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-clinic-400 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-clinic-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="font-serif text-2xl">ClinicFlow</span>
          </div>
          <p className="text-clinic-300 text-sm">Clinic Management System</p>
        </div>
        <div>
          <h1 className="font-serif text-4xl leading-tight mb-4">The single system<br />your clinic needs.</h1>
          <p className="text-clinic-300 text-base leading-relaxed">From booking to reminders, every step automated. No double bookings, no missed appointments, no chaos.</p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[["Zero", "double bookings"], ["Auto", "reminders"], ["One", "dashboard"]].map(([n, l]) => (
              <div key={n} className="bg-clinic-800 rounded-xl p-4">
                <div className="font-serif text-2xl text-clinic-300">{n}</div>
                <div className="text-xs text-clinic-400 mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-clinic-600 text-xs">© 2025 ClinicFlow</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-7 h-7 bg-clinic-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="font-serif text-xl text-clinic-900">ClinicFlow</span>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mb-1">Welcome back</h2>
          <p className="text-gray-500 text-sm mb-8">Sign in to your account</p>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" required className="input-field" placeholder="you@clinic.com"
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input type="password" required className="input-field" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : "Sign in"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">Demo: receptionist@clinic.com / doctor@clinic.com — password: demo123</p>
        </div>
      </div>
    </div>
  )
}