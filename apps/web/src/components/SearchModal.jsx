import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function SearchModal({ isOpen, onClose, lang = 'en' }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setQuery('')
      setResults([])
      return
    }

    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_URL}/projects/published`)
        const data = await res.json()
        if (data.success && data.data) {
          const filtered = data.data.filter(p =>
            p.title.toLowerCase().includes(query.toLowerCase()) ||
            p.category.toLowerCase().includes(query.toLowerCase()) ||
            p.shortDescription.toLowerCase().includes(query.toLowerCase())
          )
          setResults(filtered.slice(0, 8))
        }
      } catch (err) {
        console.error('Search error:', err)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="w-full max-w-2xl bg-[#0a0a0a] dark:bg-[#0a0a0a] light:bg-white border border-neutral-800 dark:border-neutral-800 light:border-neutral-200 overflow-hidden"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search Input */}
              <div className="p-4 border-b border-neutral-900 dark:border-neutral-900 light:border-neutral-200">
                <div className="relative">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search projects..."
                    className="w-full bg-neutral-900 dark:bg-neutral-900 light:bg-gray-100 border border-neutral-800 dark:border-neutral-800 light:border-neutral-300 text-white dark:text-white light:text-neutral-900 text-lg px-4 py-3 pr-12 focus:outline-none focus:border-neutral-600 dark:focus:border-neutral-600 light:focus:border-neutral-400 transition-colors placeholder-neutral-600 dark:placeholder-neutral-600 light:placeholder-neutral-400"
                    autoFocus
                  />
                  <button
                    onClick={onClose}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-neutral-500 light:text-neutral-600 hover:text-white dark:hover:text-white light:hover:text-neutral-900 transition-colors"
                  >
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-5 h-5 border border-neutral-700 dark:border-neutral-700 light:border-neutral-300 border-t-white dark:border-t-white light:border-neutral-900 rounded-full animate-spin" />
                  </div>
                ) : query.length < 2 ? (
                  <div className="p-8 text-center">
                    <p className="text-sm text-neutral-500 dark:text-neutral-500 light:text-neutral-600">Type at least 2 characters to search</p>
                  </div>
                ) : results.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-sm text-neutral-500 dark:text-neutral-500 light:text-neutral-600">No results found for "{query}"</p>
                  </div>
                ) : (
                  <div>
                    {results.map((project, i) => (
                      <a
                        key={project.id}
                        href={`#works`}
                        onClick={(e) => {
                          e.preventDefault()
                          // Scroll to portfolio and filter to this project
                          onClose()
                          window.location.hash = 'works'
                        }}
                        className="flex items-center gap-4 p-4 border-b border-neutral-900 dark:border-neutral-900 light:border-neutral-200 hover:bg-neutral-900/50 dark:hover:bg-neutral-900/50 light:hover:bg-gray-100 transition-colors"
                      >
                        {project.coverImage && (
                          <div className="w-16 h-12 flex-shrink-0 bg-neutral-900 dark:bg-neutral-900 light:bg-gray-200 overflow-hidden">
                            <img src={project.coverImage} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white dark:text-white light:text-neutral-900 truncate">{project.title}</p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-500 light:text-neutral-600 truncate">{project.category}</p>
                        </div>
                        <svg className="w-4 h-4 text-neutral-600 dark:text-neutral-600 light:text-neutral-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-neutral-900 text-center">
                <p className="text-[10px] text-neutral-700">
                  Press <kbd className="px-1.5 py-0.5 bg-neutral-900 rounded text-neutral-500">ESC</kbd> to close
                </p>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
