import React, { useState, useEffect, useCallback } from "react"
import Navbar from "../components/Navbar"
import AppointmentCard from "../components/AppointmentCard"
import BookingModal from "../components/BookingModal"
import api from "../services/api"
import { useAuth } from "../context/AuthContext"

export default function ReceptionDashboard() {
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [stats, setStats] = useState({})
  const [showModal, setShowModal] = useState(false)
  const [rescheduleAppt, setRescheduleAppt] = useState(null)
  const [filter, setFilter] = useState({ date: "", status: "", doctor_id: "" })
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter.date) params.set("date", filter.date)
      if (filter.status) params.set("status", filter.status)
      if (filter.doctor_id) params.set("doctor_id", filter.doctor_id)
      const [apptRes, docRes] = await Promise.all([
        api.get(`/appointments/list?${params}`),
        api.get("/doctor/list")
      ])
      setAppointments(apptRes.data)
      setDoctors(docRes.data)

      // Aggregate stats
      const all = apptRes.data
      setStats({
        total: all.length,
        booked: all.filter(a => a.status === "booked").length,
        completed: all.filter(a => a.status === "completed").length,
        cancelled: all.filter(a => a.status === "cancelled").length,
      })
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { load() }, [load])

  const handleSuccess = () => { setShowModal(false); setRescheduleAppt(null); load() }

  const statCards = [
    { label: "Total", value: stats.total || 0, color: "text-gray-800" },
    { label: "Upcoming", value: stats.booked || 0, color: "text-blue-700" },
    { label: "Completed", value: stats.completed || 0, color: "text-green-700" },
    { label: "Cancelled", value: stats.cancelled || 0, color: "text-red-600" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Reception" />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-2xl text-gray-900">Good morning, {user?.name?.split(" ")[0]}</h1>
            <p className="text-gray-500 text-sm mt-0.5">{new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            New appointment
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map(s => (
            <div key={s.label} className="card p-5">
              <p className="text-xs text-gray-400 mb-1">{s.label}</p>
              <p className={`text-3xl font-semibold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <input type="date" className="input-field w-auto text-sm"
              value={filter.date} onChange={e => setFilter(f => ({ ...f, date: e.target.value }))} />
            <select className="input-field w-auto text-sm"
              value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
              <option value="">All statuses</option>
              <option value="booked">Booked</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No show</option>
            </select>
            <select className="input-field w-auto text-sm"
              value={filter.doctor_id} onChange={e => setFilter(f => ({ ...f, doctor_id: e.target.value }))}>
              <option value="">All doctors</option>
              {doctors.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
            {(filter.date || filter.status || filter.doctor_id) && (
              <button onClick={() => setFilter({ date: "", status: "", doctor_id: "" })}
                className="text-sm text-gray-400 hover:text-gray-700 px-3 py-2 transition-colors">
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Appointments grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <svg className="animate-spin w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Loading appointments...
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <p>No appointments found</p>
            <button onClick={() => setShowModal(true)} className="mt-4 btn-primary text-sm">Book first appointment</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {appointments.map(a => (
              <div key={a._id} className="group relative">
                <AppointmentCard appt={a} onRefresh={load} />
                {a.status === "booked" && (
                  <button onClick={() => { setRescheduleAppt(a); setShowModal(true) }}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-xs text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-lg transition-all">
                    Reschedule
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <BookingModal
          onClose={() => { setShowModal(false); setRescheduleAppt(null) }}
          onSuccess={handleSuccess}
          rescheduleAppt={rescheduleAppt}
        />
      )}
    </div>
  )
}