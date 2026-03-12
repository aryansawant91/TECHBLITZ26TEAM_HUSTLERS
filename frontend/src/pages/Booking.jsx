import { useState, useEffect } from "react"
import { api } from "../services/api"
import toast from "react-hot-toast"
import { useNavigate, useSearchParams } from "react-router-dom"

export default function Booking() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const rescheduleId = searchParams.get("reschedule")

  const [doctors, setDoctors] = useState([])
  const [bookedSlots, setBookedSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    patient_name: "",
    patient_email: "",
    patient_phone: "",
    doctor_id: "",
    date: "",
    start_time: "",
    end_time: "",
    notes: ""
  })

  useEffect(() => {
    api.get("/doctor/list").then(res => setDoctors(res.data))
  }, [])

  useEffect(() => {
    if (form.doctor_id && form.date) {
      api.get(`/appointments/slots?doctor_id=${form.doctor_id}&date=${form.date}`)
        .then(res => setBookedSlots(res.data.booked_slots))
    }
  }, [form.doctor_id, form.date])

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }))

  const submit = async (e) => {
    e.preventDefault()
    if (form.start_time >= form.end_time) {
      toast.error("End time must be after start time")
      return
    }
    setLoading(true)
    try {
      if (rescheduleId) {
        await api.patch(`/appointments/${rescheduleId}/reschedule`, {
          date: form.date,
          start_time: form.start_time,
          end_time: form.end_time,
          notes: form.notes
        })
        toast.success("Appointment rescheduled!")
      } else {
        await api.post("/appointments/book", form)
        toast.success("Appointment booked!")
      }
      navigate("/reception")
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed")
    } finally {
      setLoading(false)
    }
  }

  // Generate time options in 15-min increments
  const timeOptions = []
  for (let h = 8; h <= 20; h++) {
    for (let m = 0; m < 60; m += 15) {
      timeOptions.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`)
    }
  }

  const isTimeBooked = (time) =>
    bookedSlots.some(s => time >= s.start && time < s.end)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {rescheduleId ? "Reschedule Appointment" : "New Appointment"}
        </h1>
        <p className="text-gray-500 text-sm mt-1">Fill in the details below</p>
      </div>

      <form onSubmit={submit} className="card p-6 space-y-5">
        {!rescheduleId && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Patient name *</label>
                <input className="input-field" placeholder="Full name" value={form.patient_name}
                  onChange={e => set("patient_name", e.target.value)} required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Phone *</label>
                <input className="input-field" placeholder="+91 99999 99999" value={form.patient_phone}
                  onChange={e => set("patient_phone", e.target.value)} required />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Patient email *</label>
              <input type="email" className="input-field" placeholder="patient@email.com" value={form.patient_email}
                onChange={e => set("patient_email", e.target.value)} required />
              <p className="text-xs text-gray-400 mt-1">Reminder will be sent 24h before the appointment</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Doctor *</label>
              <select className="input-field" value={form.doctor_id} onChange={e => set("doctor_id", e.target.value)} required>
                <option value="">Select a doctor</option>
                {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </>
        )}

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Date *</label>
            <input type="date" className="input-field" min={new Date().toISOString().split("T")[0]}
              value={form.date} onChange={e => set("date", e.target.value)} required />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Start time *</label>
            <select className="input-field" value={form.start_time} onChange={e => set("start_time", e.target.value)} required>
              <option value="">From</option>
              {timeOptions.map(t => (
                <option key={t} value={t} disabled={isTimeBooked(t)}
                  style={isTimeBooked(t) ? { color: "#ef4444" } : {}}>
                  {t} {isTimeBooked(t) ? "✕" : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">End time *</label>
            <select className="input-field" value={form.end_time} onChange={e => set("end_time", e.target.value)} required>
              <option value="">To</option>
              {timeOptions.filter(t => t > form.start_time).map(t => (
                <option key={t} value={t} disabled={isTimeBooked(t)}
                  style={isTimeBooked(t) ? { color: "#ef4444" } : {}}>
                  {t} {isTimeBooked(t) ? "✕" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {bookedSlots.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-xs font-medium text-amber-700 mb-1">Already booked on this day:</p>
            <div className="flex flex-wrap gap-2">
              {bookedSlots.map((s, i) => (
                <span key={i} className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-lg">
                  {s.start}–{s.end}
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Notes</label>
          <textarea className="input-field" rows={3} placeholder="Reason for visit, symptoms..."
            value={form.notes} onChange={e => set("notes", e.target.value)} />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary flex-1" disabled={loading}>
            {loading ? "Saving..." : rescheduleId ? "Reschedule" : "Book appointment"}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  )
}