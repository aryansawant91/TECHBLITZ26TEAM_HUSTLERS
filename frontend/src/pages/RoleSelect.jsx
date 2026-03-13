import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useRole } from "../context/AuthContext"
import { useUser } from "@clerk/react"

export default function RoleSelect() {
  const { registerRole } = useRole()
  const { user } = useUser()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(null)
  const [error, setError] = useState("")

  const select = async (role) => {
    setLoading(role)
    setError("")
    try {
      await registerRole(role)
      navigate(role === "doctor" ? "/doctor" : "/reception")
    } catch {
      setError("Failed to set role. Please try again.")
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-clinic-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h1 className="font-serif text-2xl text-gray-900 mb-1">Welcome, {user?.firstName}!</h1>
          <p className="text-gray-500 text-sm">Choose your role to get started</p>
        </div>

        {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 text-center">{error}</div>}

        <div className="space-y-4">
          <button onClick={() => select("doctor")} disabled={!!loading}
            className="w-full group card p-6 flex items-center gap-4 hover:border-clinic-300 hover:shadow-md transition-all text-left disabled:opacity-60">
            <div className="w-14 h-14 bg-clinic-100 rounded-xl flex items-center justify-center group-hover:bg-clinic-200 transition-colors shrink-0">
              <svg className="w-7 h-7 text-clinic-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-base">I am a Doctor</p>
              <p className="text-sm text-gray-500 mt-0.5">View your schedule and manage patient appointments</p>
            </div>
            {loading === "doctor" ? (
              <svg className="animate-spin w-5 h-5 text-clinic-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-300 group-hover:text-clinic-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            )}
          </button>

          <button onClick={() => select("receptionist")} disabled={!!loading}
            className="w-full group card p-6 flex items-center gap-4 hover:border-blue-200 hover:shadow-md transition-all text-left disabled:opacity-60">
            <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors shrink-0">
              <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-base">I am a Receptionist</p>
              <p className="text-sm text-gray-500 mt-0.5">Book, cancel and reschedule appointments</p>
            </div>
            {loading === "receptionist" ? (
              <svg className="animate-spin w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-300 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}