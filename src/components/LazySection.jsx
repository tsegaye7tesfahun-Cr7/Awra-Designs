import { useInView } from 'react-intersection-observer'
import { Suspense } from 'react'
import { motion } from 'framer-motion'

// Smooth fade-in wrapper — replaces the bare spinner with a polished reveal
function SectionReveal({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

function Skeleton() {
  return (
    <div className="min-h-[200px] flex items-center justify-center" aria-hidden="true">
      <div className="w-px h-8 bg-neutral-800 animate-pulse" />
    </div>
  )
}

export default function LazySection({ children, fallback, rootMargin = '300px' }) {
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin,
    triggerOnce: true,
  })

  return (
    <div ref={ref}>
      {inView ? (
        <Suspense fallback={fallback ?? <Skeleton />}>
          <SectionReveal>{children}</SectionReveal>
        </Suspense>
      ) : (
        <div className="min-h-[200px]" aria-hidden="true" />
      )}
    </div>
  )
}
