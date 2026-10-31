import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-display font-medium text-white mb-4">404</h1>
        <p className="text-neutral-500 mb-8">Page not found</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-white text-[#0a0a0a] text-sm font-medium hover:bg-neutral-200 transition-colors"
        >
          Go Home
        </button>
      </div>
    </div>
  )
}
