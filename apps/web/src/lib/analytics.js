/**
 * Awra Designs — self-hosted engagement tracker.
 * Uses /api/collect to avoid ad-blocker pattern matching on "analytics".
 * Tiny, no dependencies, fire-and-forget.
 */
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const ENDPOINT = `${BASE}/collect`

function getSessionId() {
  let sid = sessionStorage.getItem('_asid')
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36)
    sessionStorage.setItem('_asid', sid)
  }
  return sid
}

export async function trackView(section, extra = {}) {
  try {
    fetch(`${ENDPOINT}/pageview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId:    getSessionId(),
        section,
        referrer:     document.referrer || null,
        language:     navigator.language || null,
        screenWidth:  window.screen?.width  || null,
        screenHeight: window.screen?.height || null,
        ...extra,
      }),
      keepalive: true,
    }).catch(() => {})
  } catch {}
}

export async function trackEvent(type, target = null, meta = null) {
  try {
    fetch(`${ENDPOINT}/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: getSessionId(),
        type,
        target,
        meta,
      }),
      keepalive: true,
    }).catch(() => {})
  } catch {}
}
