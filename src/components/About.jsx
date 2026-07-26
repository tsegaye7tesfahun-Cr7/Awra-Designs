import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import t from '../utils/translations'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Hardcoded fallback — images served directly from public/
const FALLBACK_TEAM = [
  { name: 'Tesfahun Tsegaye', nameAm: 'ተስፋሁን ፀጋዬ', role: 'Founder & Lead Architect', roleAm: 'መስራች እና ዋና አርክቴክት', image: '/images/The Team/Tesfahun Tsegaye.webp' },
  { name: 'Sarah Bekele',     nameAm: 'ሣራ በቀለ',     role: 'Lead Interior Designer',  roleAm: 'ዋና ኢንቴሪየር ዲዛይነር',   image: '/images/The Team/Sarah Bekele.webp' },
  { name: 'Daniel Haile',     nameAm: 'ዳንኤል ሃይሌ',   role: 'Senior Architect',         roleAm: 'ሲኒየር አርክቴክት',         image: '/images/The Team/Daniel Haile.webp' },
  { name: 'Bereket Fikre',    nameAm: 'በረከት ፍቅሬ',   role: 'Brand Designer',           roleAm: 'ብራንድ ዲዛይነር',          image: '/images/The Team/Bereket Fikre.webp' },
]

function FadeIn({ children, delay = 0, className = '' }) {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true })
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  )
}

export default function About({ lang = 'en' }) {
  const tx = t[lang].about
  const [teamMembers, setTeamMembers] = useState(FALLBACK_TEAM)

  useEffect(() => {
    fetch(`${API_URL}/about`, { cache: 'no-store' })
      .then(r => { if (!r.ok) throw new Error('not ok'); return r.json() })
      .then(d => {
        if (d.success && d.data?.teamMembers?.length > 0) {
          setTeamMembers(d.data.teamMembers.map(m => ({
            name:   m.name,   nameAm: m.nameAm,
            role:   m.role,   roleAm: m.roleAm,
            image:  m.imageUrl || '',
          })))
        }
      })
      .catch(() => {/* keep fallback */})
  }, [])

  const getName = m => lang === 'am' ? (m.nameAm || m.name) : m.name
  const getRole = m => lang === 'am' ? (m.roleAm || m.role) : m.role

  return (
    <section id="about" className="bg-[#0a0a0a]">
      <hr className="border-0 border-t border-neutral-800" />

      <div className="section-padding">
        <div className="container-custom">
          <FadeIn>
            <AnimatePresence mode="wait">
              <motion.h2 key={lang} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}
                className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] xl:text-[4.5rem] font-medium leading-[1.08] text-white">
                {tx.headline1}<br />{tx.headline2}
              </motion.h2>
            </AnimatePresence>
          </FadeIn>

          <FadeIn delay={0.15} className="mt-8 md:mt-12 max-w-xl">
            <AnimatePresence mode="wait">
              <motion.p key={lang} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}
                className="text-neutral-400 text-sm sm:text-base leading-relaxed">
                {tx.tagline}
              </motion.p>
            </AnimatePresence>
          </FadeIn>
        </div>
      </div>

      <hr className="border-0 border-t border-neutral-800" />

      <div className="section-padding">
        <div className="container-custom">
          <FadeIn className="mb-14 md:mb-20">
            <AnimatePresence mode="wait">
              <motion.h3 key={lang} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
                className="font-display text-2xl sm:text-3xl font-medium text-white">
                {tx.teamHeading}
              </motion.h3>
            </AnimatePresence>
          </FadeIn>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            {teamMembers.map((member, i) => (
              <FadeIn key={member.name} delay={i * 0.07}>
                <div className="aspect-[3/4] overflow-hidden mb-4 bg-neutral-900">
                  {member.image && (
                    <img src={member.image} alt={member.name}
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                      loading="lazy" decoding="async" />
                  )}
                </div>
                <p className="text-xs sm:text-sm font-medium text-white leading-snug">
                  <AnimatePresence mode="wait">
                    <motion.span key={lang + member.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                      {getName(member)}
                    </motion.span>
                  </AnimatePresence>
                </p>
                <AnimatePresence mode="wait">
                  <motion.p key={lang} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="label-text mt-1">
                    {getRole(member)}
                  </motion.p>
                </AnimatePresence>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
