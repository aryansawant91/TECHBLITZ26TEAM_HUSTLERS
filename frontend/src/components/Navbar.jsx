import React from "react"
import { useRole } from "../context/AuthContext"
import { useClerk } from "@clerk/react"
import { useNavigate } from "react-router-dom"

export default function Navbar({ title }) {
  const { name, role } = useRole()
  const { signOut } = useClerk()
  const navigate = useNavigate()

  const handleLogout = () => signOut(() => navigate("/"))

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 bg-clinic-600 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <span className="font-serif text-lg text-clinic-900">ClinicFlow</span>
        {title && <><span className="text-gray-300 mx-1">·</span><span className="text-sm text-gray-500">{title}</span></>}
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-gray-800">{name}</p>
          <p className="text-xs text-gray-400 capitalize">{role}</p>
        </div>
        <div className="w-8 h-8 bg-clinic-100 rounded-full flex items-center justify-center text-clinic-700 font-semibold text-sm">
          {name?.[0]?.toUpperCase()}
        </div>
        <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
          Sign out
        </button>
      </div>
    </header>
  )
}