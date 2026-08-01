import { Component } from 'react'

class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    if (typeof console !== 'undefined' && console.error) {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }
  }

  handleRefresh = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
          <div className="max-w-sm w-full text-center">

            {/* Minimal architectural icon */}
            <div className="mb-8 flex justify-center">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                <rect x="1" y="1" width="38" height="38" stroke="#333" strokeWidth="0.8"/>
                <line x1="1" y1="1" x2="6" y2="1"   stroke="#555" strokeWidth="1"/>
                <line x1="1" y1="1" x2="1" y2="6"   stroke="#555" strokeWidth="1"/>
                <line x1="39" y1="1" x2="34" y2="1" stroke="#555" strokeWidth="1"/>
                <line x1="39" y1="1" x2="39" y2="6" stroke="#555" strokeWidth="1"/>
                <line x1="1" y1="39" x2="6" y2="39" stroke="#555" strokeWidth="1"/>
                <line x1="1" y1="39" x2="1" y2="34" stroke="#555" strokeWidth="1"/>
                <line x1="39" y1="39" x2="34" y2="39" stroke="#555" strokeWidth="1"/>
                <line x1="39" y1="39" x2="39" y2="34" stroke="#555" strokeWidth="1"/>
                <line x1="20" y1="12" x2="20" y2="22" stroke="#444" strokeWidth="1"/>
                <circle cx="20" cy="27" r="1" fill="#444"/>
              </svg>
            </div>

            <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-600 font-medium mb-4">
              E-001 // ERROR
            </p>

            <h1 className="font-display text-2xl font-medium text-white mb-3 leading-snug">
              Something went wrong.
            </h1>

            <p className="text-sm text-neutral-500 leading-relaxed mb-10">
              An unexpected error occurred. Please refresh the page to continue.
            </p>

            <button
              type="button"
              onClick={this.handleRefresh}
              className="group inline-flex items-center gap-2.5 px-6 py-3 bg-white text-[#0a0a0a] text-xs font-medium tracking-widest uppercase transition-all duration-300 hover:bg-neutral-200"
            >
              Refresh page
              <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
            </button>

          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
