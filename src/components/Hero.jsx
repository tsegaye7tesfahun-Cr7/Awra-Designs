import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import t from '../utils/translations'
import QuoteModal from './QuoteModal'
import { trackView } from '../lib/analytics'

const Hero = ({ lang = 'en' }) => {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true })
  const tx = t[lang].hero
  const [quoteOpen, setQuoteOpen] = useState(false)

  useEffect(() => { trackView('hero') }, [])

  return (
    <>
      <section
        id="home"
        ref={ref}
        className="relative bg-[#0a0a0a] overflow-hidden"
      >
        {/* Fine dot grid */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />

        {/* Glow accent — bottom right */}
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white/[0.02] blur-3xl pointer-events-none" />

        <div className="relative z-10 container-custom py-24 md:py-36 lg:py-44">
          <div className="max-w-4xl">

            {/* Eyebrow */}
            <motion.div
              className="flex items-center gap-3 mb-8"
              initial={{ opacity: 0, x: -12 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.05 }}
            >
              <span className="w-6 h-px bg-neutral-600" />
              <span className="label-text">
                <AnimatePresence mode="wait">
                  <motion.span key={lang} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                    {tx.label}
                  </motion.span>
                </AnimatePresence>
              </span>
            </motion.div>

            {/* Headline */}
            <AnimatePresence mode="wait">
              <motion.h1
                key={lang}
                className="font-display font-medium leading-[1.04] tracking-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Line 1 — large white */}
                <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] text-white">
                  {tx.headline1}
                </span>
                {/* Line 2 — outlined / ghost text for contrast */}
                <span
                  className="block text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] mt-1"
                  style={{
                    WebkitTextStroke: '1px rgba(255,255,255,0.25)',
                    color: 'transparent',
                  }}
                >
                  {tx.headline2}
                </span>
                {/* Line 3 — cream accent, slightly smaller */}
                <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] text-cream mt-2">
                  {tx.headline3}
                </span>
              </motion.h1>
            </AnimatePresence>

            {/* Rule */}
            <motion.div
              className="flex items-center gap-4 my-8"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={inView ? { opacity: 1, scaleX: 1 } : {}}
              style={{ originX: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
            >
              <div className="h-px w-8 bg-neutral-700" />
              <div className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-neutral-700 to-transparent" />
            </motion.div>

            {/* Proof / subline */}
            <motion.p
              className="text-neutral-500 text-sm sm:text-base leading-relaxed max-w-sm mb-10"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.55 }}
            >
              <AnimatePresence mode="wait">
                <motion.span key={lang} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  {tx.proof}
                </motion.span>
              </AnimatePresence>
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-row flex-wrap gap-3"
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.65 }}
            >
              <button
                onClick={() => setQuoteOpen(true)}
                className="group inline-flex items-center gap-2.5 px-6 py-3 bg-white text-[#0a0a0a] text-xs font-medium tracking-widest uppercase transition-all duration-300 hover:bg-cream"
              >
                <AnimatePresence mode="wait">
                  <motion.span key={lang} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                    {tx.viewWork}
                  </motion.span>
                </AnimatePresence>
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </button>

              <a
                href="https://wa.me/251923814125?text=Hello%20Awra%20Designs%2C%20I%27d%20like%20to%20discuss%20a%20project."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3 border border-neutral-800 text-white text-xs font-medium tracking-widest uppercase transition-all duration-300 hover:border-neutral-500 hover:bg-neutral-900/60"
              >
                <AnimatePresence mode="wait">
                  <motion.span key={lang} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                    {tx.whatsapp}
                  </motion.span>
                </AnimatePresence>
              </a>
            </motion.div>

          </div>
        </div>

        {/* Bottom accent */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent" />
      </section>

      <QuoteModal isOpen={quoteOpen} onClose={() => setQuoteOpen(false)} lang={lang} />
    </>
  )
}

export default Hero
