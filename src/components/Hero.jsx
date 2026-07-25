import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import t from '../utils/translations'
import QuoteModal from './QuoteModal'

const Hero = ({ lang = 'en' }) => {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true })
  const tx = t[lang].hero
  const [quoteOpen, setQuoteOpen] = useState(false)

  return (
    <>
      <section
        id="home"
        ref={ref}
        className="relative h-[52vh] max-h-[420px] min-h-[300px] flex flex-col justify-center overflow-hidden"
      >
      <div className="absolute inset-0">
        <motion.img
          src="/images/Hero BG.webp"
          alt="Awra Designs — architectural interior"
          className="w-full h-full object-cover"
          loading="eager"
          fetchpriority="high"
          initial={{ scale: 1.04 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
        <div className="absolute inset-0 bg-[#0a0a0a]/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/30" />
      </div>

      <div className="relative z-10 container-custom pt-12 md:pt-16">
        <div className="max-w-xl">

          <motion.p
            className="label-text mb-3"
            initial={{ opacity: 0, y: 8 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <AnimatePresence mode="wait">
              <motion.span key={lang} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                {tx.label}
              </motion.span>
            </AnimatePresence>
          </motion.p>

          <motion.h1
            className="font-display text-3xl sm:text-4xl md:text-5xl font-medium leading-[1.06] tracking-tight mb-2 text-white"
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <AnimatePresence mode="wait">
              <motion.span key={lang} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="block">
                {tx.headline1}<br />
                <em className="not-italic text-cream">{tx.headline2}</em> {tx.headline3}
              </motion.span>
            </AnimatePresence>
          </motion.h1>

          <motion.p
            className="text-neutral-500 text-xs mb-5"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <AnimatePresence mode="wait">
              <motion.span key={lang} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                {tx.proof}
              </motion.span>
            </AnimatePresence>
          </motion.p>

          <motion.div
            className="flex flex-row flex-wrap gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.55 }}
          >
            <button
              onClick={() => setQuoteOpen(true)}
              className="group inline-flex items-center gap-2 px-4 py-2 bg-white text-[#0a0a0a] text-xs font-medium tracking-wide transition-all duration-300 hover:bg-cream"
            >
              <AnimatePresence mode="wait">
                <motion.span key={lang} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  {tx.viewWork}
                </motion.span>
              </AnimatePresence>
              <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
            </button>
            <a
              href="https://wa.me/251923814125?text=Hello%20Awra%20Designs%2C%20I%27d%20like%20to%20discuss%20a%20project."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border border-white/30 text-white text-xs font-medium tracking-wide transition-all duration-300 hover:border-white/60 hover:bg-white/5"
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
    </section>

    <QuoteModal isOpen={quoteOpen} onClose={() => setQuoteOpen(false)} lang={lang} />
    </>
  )
}

export default Hero
