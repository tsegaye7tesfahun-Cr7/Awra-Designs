import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes of inactivity
const WARNING_TIMEOUT = 25 * 60 * 1000 // 5 minutes before logout

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(localStorage.getItem('admin')) } catch { return null }
  })
  const [loading, setLoading] = useState(true)
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false)
  const [timeoutCountdown, setTimeoutCountdown] = useState(0)
  const navigate = useNavigate()

  // Reset session timer
  const resetSessionTimer = useCallback(() => {
    const lastActivity = localStorage.getItem('lastActivity')
    const now = Date.now()

    if (lastActivity && now - parseInt(lastActivity) > SESSION_TIMEOUT) {
      logout()
      return
    }

    localStorage.setItem('lastActivity', now.toString())
    setShowTimeoutWarning(false)
  }, [])

  // Check for session timeout periodically
  useEffect(() => {
    if (!admin) return

    const checkSession = () => {
      const lastActivity = localStorage.getItem('lastActivity')
      if (!lastActivity) {
        localStorage.setItem('lastActivity', Date.now().toString())
        return
      }

      const inactiveTime = Date.now() - parseInt(lastActivity)
      const timeUntilLogout = SESSION_TIMEOUT - inactiveTime

      if (timeUntilLogout <= 0) {
        logout()
      } else if (timeUntilLogout <= (SESSION_TIMEOUT - WARNING_TIMEOUT)) {
        setShowTimeoutWarning(true)
        setTimeoutCountdown(Math.ceil(timeUntilLogout / 1000 / 60)) // minutes
      }
    }

    const interval = setInterval(checkSession, 60000) // Check every minute
    resetSessionTimer()

    return () => clearInterval(interval)
  }, [admin, resetSessionTimer])

  // Track user activity
  useEffect(() => {
    if (!admin) return

    const handleActivity = () => {
      resetSessionTimer()
    }

    window.addEventListener('mousemove', handleActivity)
    window.addEventListener('keydown', handleActivity)
    window.addEventListener('click', handleActivity)
    window.addEventListener('scroll', handleActivity)

    return () => {
      window.removeEventListener('mousemove', handleActivity)
      window.removeEventListener('keydown', handleActivity)
      window.removeEventListener('click', handleActivity)
      window.removeEventListener('scroll', handleActivity)
    }
  }, [admin, resetSessionTimer])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { setLoading(false); return }
    api.get('/auth/me')
      .then(d => {
        setAdmin(d.data)
        localStorage.setItem('admin', JSON.stringify(d.data))
        localStorage.setItem('lastActivity', Date.now().toString())
        setLoading(false)
      })
      .catch(() => { logout(); setLoading(false) })
  }, [])

  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', data.data.token)
    localStorage.setItem('admin', JSON.stringify(data.data.admin))
    localStorage.setItem('lastActivity', Date.now().toString())
    setAdmin(data.data.admin)
    setShowTimeoutWarning(false)
    return data.data.admin
  }

  const logout = useCallback(() => {
    try { api.post('/auth/logout', {}) } catch {}
    localStorage.removeItem('token')
    localStorage.removeItem('admin')
    localStorage.removeItem('lastActivity')
    setAdmin(null)
    setShowTimeoutWarning(false)
    navigate('/login')
  }, [navigate])

  const updateProfile = (updated) => {
    setAdmin(updated)
    localStorage.setItem('admin', JSON.stringify(updated))
  }

  const extendSession = () => {
    resetSessionTimer()
    setShowTimeoutWarning(false)
  }

  return (
    <AuthContext.Provider value={{ admin, login, logout, loading, updateProfile, showTimeoutWarning, timeoutCountdown, extendSession }}>
      {loading ? (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
          <div className="w-6 h-6 border border-neutral-700 border-t-white rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {children}
          {showTimeoutWarning && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
              <div className="bg-[#0a0a0a] border border-neutral-800 p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-medium text-white mb-2">Session Expiring Soon</h3>
                <p className="text-sm text-neutral-400 mb-4">
                  Your session will expire in {timeoutCountdown} minute{timeoutCountdown !== 1 ? 's' : ''} due to inactivity.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={extendSession}
                    className="flex-1 px-4 py-2 bg-white text-[#0a0a0a] text-sm font-medium hover:bg-neutral-200 transition-colors"
                  >
                    Stay Logged In
                  </button>
                  <button
                    onClick={logout}
                    className="flex-1 px-4 py-2 border border-neutral-700 text-white text-sm font-medium hover:border-neutral-500 transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
