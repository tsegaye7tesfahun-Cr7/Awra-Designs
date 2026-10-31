import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { throttle } from '../utils/throttle'

const SCROLL_THROTTLE_MS = 80

export default function ProgressBar() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const calc = () => {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0
      setScrollProgress(Math.min(progress, 100))
    }
    const throttled = throttle(calc, SCROLL_THROTTLE_MS)
    window.addEventListener('scroll', throttled, { passive: true })
    window.addEventListener('resize', throttled)
    calc()
    return () => {
      window.removeEventListener('scroll', throttled)
      window.removeEventListener('resize', throttled)
    }
  }, [])

  return (
    <>
      {/* Top progress line */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-px bg-neutral-900">
        <motion.div
          className="h-full bg-white origin-left"
          style={{ scaleX: scrollProgress / 100, transformOrigin: 'left' }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Back-to-top — left side on mobile to avoid floating CTA, right side on desktop */}
      <AnimatePresence>
        {scrollProgress > 15 && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 left-6 lg:left-auto lg:right-8 z-50 w-9 h-9 lg:w-10 lg:h-10 border border-neutral-700 bg-[#0a0a0a] flex items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors lg:hidden-when-floating"
            aria-label="Back to top"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 11V3M3 7l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}
