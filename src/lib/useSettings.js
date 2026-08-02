// Shared hook — fetches /api/settings once and caches in module scope
// so multiple components (Contact, Footer, FloatingCTA) share one request.

import { useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Module-level cache so all hook instances share the same fetch
let _cache = null
let _promise = null

const DEFAULTS = {
  contact_phone:    '+251 92 381 4125',
  contact_email:    'info@awradesigns.com',
  contact_location: 'Addis Ababa, Ethiopia',
  whatsapp_number:  '251923814125',
  google_maps_url:  'https://maps.google.com/maps?q=9.021902,38.786683',
  instagram_url:    'https://www.instagram.com/awradesigns/',
  facebook_url:     'https://web.facebook.com/people/Awra-Designs/100089517497042/',
  telegram_url:     'https://t.me/AwraDesigns',
  tiktok_url:       'https://www.tiktok.com/@awrainteriors',
  proof_text:       '100+ spaces completed across Ethiopia',
}

function fetchSettings() {
  if (_cache) return Promise.resolve(_cache)
  if (_promise) return _promise
  _promise = fetch(`${API_URL}/settings`, { cache: 'no-store' })
    .then(r => { if (!r.ok) throw new Error('not ok'); return r.json() })
    .then(d => {
      if (d.success && d.data) {
        _cache = { ...DEFAULTS, ...d.data }
        return _cache
      }
      return DEFAULTS
    })
    .catch(() => DEFAULTS)
    .finally(() => { _promise = null })
  return _promise
}

export default function useSettings() {
  const [settings, setSettings] = useState(_cache || DEFAULTS)

  useEffect(() => {
    if (_cache) { setSettings(_cache); return }
    fetchSettings().then(s => setSettings(s))
  }, [])

  return settings
}
