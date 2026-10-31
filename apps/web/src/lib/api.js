// Shared API helper for the frontend
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export async function submitContact(payload) {
  const res = await fetch(`${BASE}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Request failed')
  return data
}
