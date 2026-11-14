import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { SheetRef } from './ArchDetails'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Hardcoded fallback — exactly like Portfolio, no async needed
const FALLBACK = [
  { id: 1, name: 'Alemu Bekele',    role: 'Business Owner',    image: '/images/Testimonials/Alemu Bekele.webp',    text: 'Awra transformed our office into a modern, inspiring workspace. Their attention to detail and professional approach exceeded every expectation.' },
  { id: 2, name: 'Marta Asfaw',     role: 'Homeowner',          image: '/images/Testimonials/Marta Asfaw.webp',     text: 'They understood our vision and brought it to life beautifully. Working with Awra was a delightful experience from start to finish.' },
  { id: 3, name: 'Yonas Tadesse',   role: 'Restaurant Owner',   image: '/images/Testimonials/Yonas Tadesse.webp',   text: 'The interior design work completely transformed our restaurant. We receive compliments from guests every day. Excellent craftsmanship.' },
  { id: 4, name: 'Tigist Mekonnen', role: 'Residential Client', image: '/images/Testimonials/Tigist Mekonnen.webp', text: "Professional, reliable, and deeply creative. The finishing work is impeccable and perfectly reflects our family's character." },
]

export default function Testimonials() {
  const { ref, inView } = useInView({ threshold: 0.15, triggerOnce: true })
  const [testimonials, setTestimonials] = useState(FALLBACK)
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  // Try to load live data — keep fallback if it fails or is slow
  useEffect(() => {
    fetch(`${API_URL}/testimonials`, { cache: 'no-store' })
      .then(r => { if (!r.ok) throw new Error('not ok'); return r.json() })
      .then(d => {
        if (d.success && Array.isArray(d.data) && d.data.length > 0) {
          setTestimonials(d.data.map(t => ({
            id: t.id, name: t.clientName, role: t.position,
            image: t.imageUrl || '', text: t.text,
          })))
        }
      })
      .catch(() => {/* keep hardcoded fallback */})
  }, [])

  useEffect(() => {
    if (!inView || paused) return
    const id = setInterval(() => setCurrent(c => (c + 1) % testimonials.length), 6000)
    return () => clearInterval(id)
  }, [inView, paused, testimonials.length])

  return (
    <section ref={ref} className="section-padding bg-[#0d0d0d] border-t border-neutral-900 relative" id="testimonials">
      <SheetRef code="A-301" title="TESTIMONIALS" />
      <div className="container-custom">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }} className="mb-10 md:mb-14">
          <p className="label-text mb-3">Client Voices</p>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-medium text-white">What clients say</h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-8 lg:gap-20 items-start"
          onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>

          <div className="flex flex-col gap-1">
            {testimonials.map((t, i) => (
              <button key={t.id} onClick={() => setCurrent(i)}
                className={`flex items-center gap-3 px-3 py-3 text-left transition-all duration-300 border-l-2 ${i === current ? 'border-gold bg-gold/5' : 'border-transparent hover:border-neutral-700'}`}>
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden flex-shrink-0 bg-neutral-800">
                  {t.image && <img src={t.image} alt={t.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />}
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-medium truncate transition-colors ${i === current ? 'text-gold' : 'text-neutral-500'}`}>{t.name}</p>
                  <p className="label-text mt-0.5 truncate">{t.role}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.blockquote key={current} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
                <svg className="w-7 h-7 md:w-8 md:h-8 text-neutral-700 mb-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.996 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.984zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.432.917-3.995 3.638-3.995 5.849h3.983v10h-9.984z" />
                </svg>
                <p className="font-display text-xl sm:text-2xl md:text-3xl font-medium italic leading-snug text-white mb-7">"{testimonials[current].text}"</p>
                <footer>
                  <p className="text-sm font-medium text-white">{testimonials[current].name}</p>
                  <p className="label-text mt-0.5">{testimonials[current].role}</p>
                </footer>
              </motion.blockquote>
            </AnimatePresence>
          </div>
        </div>

        <div className="flex gap-2 mt-8 md:mt-10">
          {testimonials.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`h-px transition-all duration-300 min-w-[12px] ${i === current ? 'w-8 bg-gold' : 'w-4 bg-neutral-700 hover:bg-neutral-500'}`}
              aria-label={`Go to testimonial ${i + 1}`} />
          ))}
        </div>
      </div>
    </section>
  )
}
