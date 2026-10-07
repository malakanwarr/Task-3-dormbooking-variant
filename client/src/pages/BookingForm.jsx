import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

// TODO: build the Book a Room page — see README.md "Your task".
// This page is already routed at /bookings/new (book) and /bookings/:id (edit),
// and both routes are wrapped in <ProtectedRoute>.

const defaults = { roomNumber: '', startDate: '', endDate: '', purpose: '' }

// The server sends dates like "2026-10-10T00:00:00.000Z",
// but <input type="date"> only accepts "2026-10-10" -> keep the first 10 characters.
const toDateInput = (iso) => (iso ? iso.slice(0, 10) : '')

export default function BookingForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  // TODO (edit mode): when there is an `id`, load the booking and fill the form.
  useEffect(() => {
    if (!id) return
    // GET /api/bookings/:id -> the server answers with { booking }
    api.get(`/bookings/${id}`)
      .then(({ data }) => {
        const b = data.booking
        setForm({
          roomNumber: b.roomNumber,
          startDate: toDateInput(b.startDate),
          endDate: toDateInput(b.endDate),
          purpose: b.purpose || '' // avoid undefined so the textarea stays controlled
        })
      })
      .catch((err) => setError(err?.response?.data?.message || 'Could not load booking'))
  }, [id])

  // TODO: update `form` when an input changes.
  function onChange(e) {
    // `name` tells us which field changed (it matches a key in `form`)
    const { name, value } = e.target
    // copy the old form and overwrite only that one field
    setForm((f) => ({ ...f, [name]: value }))
  }

  // TODO: POST a new booking, or PATCH the existing one when editing,
  // then go back to /bookings. Show the server's error message on failure.
  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    // only these 4 fields — never send bookedBy (the server takes it from the token)
    const body = {
      roomNumber: form.roomNumber,
      startDate: form.startDate,
      endDate: form.endDate,
      purpose: form.purpose
    }
    try {
      if (id) await api.patch(`/bookings/${id}`, body) // editing
      else await api.post('/bookings', body)            // new booking
      nav('/bookings')
    } catch (err) {
      // show the server's message (400 bad dates, 403 not your booking, 409 room taken)
      setError(err?.response?.data?.message || 'Something went wrong')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'New'} Booking</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        {/* TODO: room number input, start/end date inputs and purpose textarea */}
        <input
          className="input"
          name="roomNumber"
          placeholder="Room number (e.g. B2-104)"
          value={form.roomNumber}
          onChange={onChange}
        />
        <input className="input" type="date" name="startDate" value={form.startDate} onChange={onChange} />
        <input className="input" type="date" name="endDate" value={form.endDate} onChange={onChange} />
        <textarea
          className="input"
          name="purpose"
          placeholder="Purpose (optional)"
          value={form.purpose}
          onChange={onChange}
        />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}