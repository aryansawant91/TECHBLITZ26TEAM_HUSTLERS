import React, { useState, useEffect, useCallback } from "react"
import Navbar from "../components/Navbar"
import AppointmentCard from "../components/AppointmentCard"
import api from "../services/api"
import { useAuth } from "../context/AuthContext"

export default function DoctorDashboard() {
  const [schedule, setSchedule] = useState([])
  const [stats, setStats] = useState({})
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const load = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const [schedRes, statsRes] = await Promise.all([
        api.get(`/doctor/schedule/${user.id}?date=${selectedDate}`),
        api.get(`/doctor/stats/${user.id}`)
      ])
      setSchedule(schedRes.data)
      setStats(statsRes.data)
    } finally {
      setLoading(false)
    }
  }, [user?.id, selectedDate])

  useEffect(() => { load() }, [load])

  const hours = Array.from({ length: 9 }, (_, i) => `${(9 + i).toString().padStart(2, "0")}:00`)

  const getApptAtTime = (hour) => schedule.find(a => a.time.startsWith(hour.split(":")[0].padStart(2, "0")))

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Doctor" />

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-2xl text-gray-900">Dr. {user?.name?.split(" ").slice(-1)[0]}'s Schedule</h1>
            <p className="text-gray-500 text-sm mt-0.5">Your appointments and daily overview</p>
          </div>
          <input type="date" className="input-field w-auto text-sm"
            value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Today", value: stats.today || 0, color: "text-blue-700" },
            { label: "Total booked", value: stats.booked || 0, color: "text-gray-800" },
            { label: "Completed", value: stats.completed || 0, color: "text-green-700" },
            { label: "Cancelled", value: stats.cancelled || 0, color: "text-red-600" },
          ].map(s => (
            <div key={s.label} className="card p-5">
              <p className="text-xs text-gray-400 mb-1">{s.label}</p>
              <p className={`text-3xl font-semibold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Timeline */}
          <div className="lg:col-span-2 card p-6">
            <h2 className="font-semibold text-gray-800 mb-5 text-sm">
              Schedule for {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}
            </h2>
            {loading ? (
              <div className="flex items-center justify-center py-8 text-gray-400 text-sm">Loading...</div>
            ) : (
              <div className="space-y-1">
                {hours.map(hour => {
                  const appt = getApptAtTime(hour)
                  return (
                    <div key={hour} className="flex gap-4 items-start py-2">
                      <span className="text-xs text-gray-400 w-12 shrink-0 mt-1 font-mono">{hour}</span>
                      {appt ? (
                        <div className={`flex-1 rounded-xl px-4 py-3 text-sm border-l-4 
                          ${appt.status === "completed" ? "bg-green-50 border-green-400" :
                            appt.status === "cancelled" ? "bg-red-50 border-red-300 opacity-60" :
                            "bg-blue-50 border-blue-400"}`}>
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-800">{appt.patient_name}</span>
                            <span className="text-xs text-gray-500">{appt.time} · {appt.duration_minutes || 30}min</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{appt.patient_phone}</p>
                          {appt.notes && <p className="text-xs text-gray-400 mt-1 italic">"{appt.notes}"</p>}
                        </div>
                      ) : (
                        <div className="flex-1 border border-dashed border-gray-100 rounded-xl px-4 py-3">
                          <span className="text-xs text-gray-300">Available</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Patient list */}
          <div className="space-y-3">
            <h2 className="font-semibold text-gray-800 text-sm">Today's patients</h2>
            {schedule.filter(a => a.status !== "cancelled").length === 0 ? (
              <div className="card p-6 text-center text-gray-400 text-sm">No patients today</div>
            ) : (
              schedule.filter(a => a.status !== "cancelled").map(a => (
                <AppointmentCard key={a._id} appt={a} onRefresh={load} showActions={true} />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}