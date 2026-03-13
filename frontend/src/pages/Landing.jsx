import React, { useState } from "react"
import { SignInButton, SignUpButton, useAuth } from "@clerk/react"
import { useRole } from "../context/AuthContext"

export default function Landing() {
  const { isSignedIn } = useAuth()
  const { roleLoading } = useRole()
  const [selectedRole, setSelectedRole] = useState(null)

  // Store selected role so AuthContext can use it after sign in
  if (selectedRole) {
    sessionStorage.setItem("pending_role", selectedRole)
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

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-7 h-7 bg-clinic-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="font-serif text-xl text-clinic-900">ClinicFlow</span>
          </div>

          {isSignedIn && roleLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-clinic-500 border-t-transparent rounded-full animate-spin"/>
            </div>

          ) : !selectedRole ? (
            /* Step 1: Choose role */
            <>
              <h2 className="text-2xl font-semibold text-gray-900 mb-1">Welcome to ClinicFlow</h2>
              <p className="text-gray-500 text-sm mb-8">Select your role to continue</p>

              <div className="space-y-4">
                <button onClick={() => setSelectedRole("doctor")}
                  className="w-full group card p-6 flex items-center gap-4 hover:border-clinic-300 hover:shadow-md transition-all text-left">
                  <div className="w-14 h-14 bg-clinic-100 rounded-xl flex items-center justify-center group-hover:bg-clinic-200 transition-colors shrink-0">
                    <svg className="w-7 h-7 text-clinic-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-base">I am a Doctor</p>
                    <p className="text-sm text-gray-500 mt-0.5">View your schedule and manage patient appointments</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-clinic-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </button>

                <button onClick={() => setSelectedRole("receptionist")}
                  className="w-full group card p-6 flex items-center gap-4 hover:border-blue-200 hover:shadow-md transition-all text-left">
                  <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors shrink-0">
                    <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-base">I am a Receptionist</p>
                    <p className="text-sm text-gray-500 mt-0.5">Book, cancel and reschedule appointments</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>

              <p className="text-center text-xs text-gray-400 mt-6">
                New to ClinicFlow?{" "}
                <SignUpButton mode="modal">
                  <button className="text-clinic-600 hover:underline font-medium">Create account</button>
                </SignUpButton>
              </p>
            </>

          ) : (
            /* Step 2: Sign in with Clerk */
            <>
              <button onClick={() => setSelectedRole(null)}
                className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-6 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                </svg>
                Back
              </button>

              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${selectedRole === "doctor" ? "bg-clinic-100" : "bg-blue-50"}`}>
                {selectedRole === "doctor" ? (
                  <svg className="w-7 h-7 text-clinic-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                ) : (
                  <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                )}
              </div>

              <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                Sign in as {selectedRole === "doctor" ? "Doctor" : "Receptionist"}
              </h2>
              <p className="text-gray-500 text-sm mb-8">Sign in to access your dashboard</p>

              <SignInButton mode="modal">
                <button className="w-full btn-primary flex items-center justify-center gap-2 text-base py-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign In
                </button>
              </SignInButton>
            </>
          )}
        </div>
      </div>
    </div>
  )
}