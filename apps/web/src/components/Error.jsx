import { useState, useEffect } from 'react'

export default function Error({ statusCode = 500, message = 'Something went wrong' }) {
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          window.location.href = '/'
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-display font-medium text-white mb-4">{statusCode}</h1>
        <p className="text-neutral-500 mb-8">{message}</p>
        <p className="text-sm text-neutral-600 mb-4">Redirecting to home in {countdown} seconds...</p>
        <button
          onClick={() => window.location.href = '/'}
          className="px-6 py-3 bg-white text-[#0a0a0a] text-sm font-medium hover:bg-neutral-200 transition-colors"
        >
          Go Home Now
        </button>
      </div>
    </div>
  )
}

// For error boundary to use
Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 500
  return { statusCode }
}
