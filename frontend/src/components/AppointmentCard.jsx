import React from "react"
import api from "../services/api"

const statusClass = { booked: "badge-booked", completed: "badge-completed", cancelled: "badge-cancelled", no_show: "badge-no_show" }
const statusLabel = { booked: "Booked", completed: "Completed", cancelled: "Cancelled", no_show: "No show" }

export default function AppointmentCard({ appt, onRefresh, showActions = true }) {
  const cancel = async () => {
    if (!confirm(`Cancel appointment for ${appt.patient_name}?`)) return
    await api.delete(`/appointments/${appt._id}`)
    onRefresh?.()
  }

  const complete = async () => {
    await api.put(`/appointments/${appt._id}/status`, { status: "completed" })
    onRefresh?.()
  }

  return (
    <div className="card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-clinic-100 rounded-full flex items-center justify-center text-clinic-700 font-semibold text-sm">
            {appt.patient_name[0].toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">{appt.patient_name}</p>
            <p className="text-xs text-gray-400">{appt.patient_phone}</p>
          </div>
        </div>
        <span className={statusClass[appt.status] || "badge-booked"}>{statusLabel[appt.status] || appt.status}</span>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          {appt.date}
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          {appt.time} · {appt.duration_minutes || 30}min
        </span>
      </div>

      {appt.notes && <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mb-4 italic">"{appt.notes}"</p>}

      {showActions && appt.status === "booked" && (
        <div className="flex gap-2 pt-3 border-t border-gray-50">
          <button onClick={complete} className="flex-1 text-xs text-center text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors font-medium">
            Mark complete
          </button>
          <button onClick={cancel} className="flex-1 text-xs text-center text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors font-medium">
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}