import React, { useState, useEffect } from "react"
import api from "../services/api"

export default function BookingModal({ onClose, onSuccess, rescheduleAppt }) {
  const isReschedule = !!rescheduleAppt

  const [doctors, setDoctors] = useState([])
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const today = new Date().toISOString().split("T")[0]

  const [form, setForm] = useState({
    patient_name: "",
    patient_phone: "",
    doctor_id: rescheduleAppt?.doctor_id || "",
    date: rescheduleAppt?.date || today,
    time: "",
    duration_minutes: 30,
    notes: "",
  })

  // Load doctors
  useEffect(() => {
    api.get("/doctor/list").then(r => setDoctors(r.data)).catch(() => {})
  }, [])

  // Load available slots when doctor + date selected
  useEffect(() => {
    if (!form.doctor_id || !form.date) { setSlots([]); return }
    setLoadingSlots(true)
    setForm(f => ({ ...f, time: "" }))
    api.get(`/appointments/slots/${form.doctor_id}/${form.date}?duration=${form.duration_minutes}`)
      .then(r => setSlots(r.data))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false))
  }, [form.doctor_id, form.date, form.duration_minutes])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async () => {
    setError("")

    // Validation
    if (!isReschedule && !form.patient_name.trim()) return setError("Patient name is required.")
    if (!form.doctor_id) return setError("Please select a doctor.")
    if (!form.date) return setError("Please select a date.")
    if (!form.time) return setError("Please select a time slot.")

    setSubmitting(true)
    try {
      if (isReschedule) {
        await api.put(`/appointments/${rescheduleAppt._id}/reschedule`, {
          new_date: form.date,
          new_time: form.time,
        })
      } else {
        await api.post("/appointments/book", {
          patient_name: form.patient_name,
          patient_phone: form.patient_phone,
          doctor_id: form.doctor_id,
          date: form.date,
          time: form.time,
          duration_minutes: Number(form.duration_minutes),
          notes: form.notes,
        })
      }
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isReschedule ? "Reschedule Appointment" : "New Appointment"}
            </h2>
            {isReschedule && (
              <p className="text-sm text-gray-500 mt-0.5">
                Patient: {rescheduleAppt.patient_name}
              </p>
            )}
          </div>
          <button onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">

          {/* Patient info — only for new bookings */}
          {!isReschedule && (
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Patient Name *</label>
                <input className="input-field w-full text-sm"
                  placeholder="Full name"
                  value={form.patient_name}
                  onChange={e => set("patient_name", e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Phone Number</label>
                <input className="input-field w-full text-sm"
                  placeholder="+91 XXXXX XXXXX"
                  value={form.patient_phone}
                  onChange={e => set("patient_phone", e.target.value)} />
              </div>
            </div>
          )}

          {/* Doctor */}
          {!isReschedule && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Doctor *</label>
              <select className="input-field w-full text-sm"
                value={form.doctor_id}
                onChange={e => set("doctor_id", e.target.value)}>
                <option value="">Select a doctor</option>
                {doctors.map(d => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Date & Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date *</label>
              <input type="date" className="input-field w-full text-sm"
                min={today}
                value={form.date}
                onChange={e => set("date", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Duration</label>
              <select className="input-field w-full text-sm"
                value={form.duration_minutes}
                onChange={e => set("duration_minutes", e.target.value)}>
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min</option>
              </select>
            </div>
          </div>

          {/* Time Slots */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Available Slots *</label>
            {!form.doctor_id || !form.date ? (
              <p className="text-sm text-gray-400 py-2">Select a doctor and date to see slots</p>
            ) : loadingSlots ? (
              <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Loading slots...
              </div>
            ) : slots.length === 0 ? (
              <p className="text-sm text-red-500 py-2">No slots available for this date.</p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {slots.map(slot => {
                  const time = typeof slot === "object" ? slot.time : slot
                  const available = typeof slot === "object" ? slot.available !== false : true
                  return (
                    <button key={time} type="button"
                      disabled={!available}
                      onClick={() => available && set("time", time)}
                      className={`py-2 px-1 rounded-lg text-xs font-medium border transition-all
                        ${!available
                          ? "bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed line-through"
                          : form.time === time
                            ? "bg-green-600 text-white border-green-600"
                            : "bg-white text-gray-700 border-gray-200 hover:border-green-400 hover:text-green-700"
                        }`}>
                      {time}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Notes — only for new bookings */}
          {!isReschedule && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
              <textarea className="input-field w-full text-sm resize-none"
                rows={2}
                placeholder="Reason for visit, symptoms, etc."
                value={form.notes}
                onChange={e => set("notes", e.target.value)} />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={submitting}
            className="btn-primary text-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
            {submitting && (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            )}
            {submitting ? "Saving..." : isReschedule ? "Reschedule" : "Book Appointment"}
          </button>
        </div>

      </div>
    </div>
  )
}