import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import t from '../utils/translations'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Fallback project cover images for the slideshow
const FALLBACK_COVERS = [
  '/images/Projects/Architecture/For Facades & Outer 3D/For Facades & Outer 3D -1.jpg',
  '/images/Projects/Residential Interiors/Master Bedrooms & Suites/Master Bedrooms 1.jpg',
  '/images/Projects/Commercial Design/Corporate Offices & Workspaces/Corporate Offices 1.jpg',
  '/images/Projects/Residential Interiors/Lounges & Family Rooms/Lounges & Family Rooms 1.jpg',
  '/images/Projects/Residential Interiors/Islamic Luxury Interiors/Islamic Luxury Interiors 1.jpg',
  '/images/Projects/Architecture/Renovations & Transformations/Renovations 1.jpg',
]

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

function ProjectSlideshow({ covers }) {
  const [active, setActive] = useState(0)
  const timerRef = useRef(null)

  const go = (idx) => {
    setActive(idx)
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => setActive(a => (a + 1) % covers.length), 4000)
  }

  useEffect(() => {
    timerRef.current = setInterval(() => setActive(a => (a + 1) % covers.length), 4000)
    return () => clearInterval(timerRef.current)
  }, [covers.length])

  return (
    <div className="relative w-full h-full min-h-[320px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.img
          key={active}
          src={covers[active]}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover rounded-2xl"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          loading="lazy"
          decoding="async"
        />
      </AnimatePresence>
      {/* Dots */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
        {covers.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-px transition-all duration-300 ${i === active ? 'w-6 bg-white' : 'w-3 bg-white/40 hover:bg-white/70'}`}
          />
        ))}
      </div>
    </div>
  )
}

export default function About({ lang = 'en' }) {
  const tx = t[lang].about
  const [teamMembers, setTeamMembers] = useState(FALLBACK_TEAM)
  const [covers, setCovers] = useState(FALLBACK_COVERS)

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
      .catch(() => {})
  }, [])

  // Fetch project cover images for slideshow
  useEffect(() => {
    fetch(`${API_URL}/projects`, { cache: 'no-store' })
      .then(r => { if (!r.ok) throw new Error('not ok'); return r.json() })
      .then(d => {
        if (d.success && Array.isArray(d.data) && d.data.length > 0) {
          const imgs = d.data
            .map(p => p.coverImage || (Array.isArray(p.galleryImages) && p.galleryImages[0]))
            .filter(Boolean)
          if (imgs.length > 0) setCovers(imgs)
        }
      })
      .catch(() => {})
  }, [])

  const getName = m => lang === 'am' ? (m.nameAm || m.name) : m.name
  const getRole = m => lang === 'am' ? (m.roleAm || m.role) : m.role

  return (
    <section id="about" className="bg-[#0a0a0a]">
      <hr className="border-0 border-t border-neutral-800" />

      <div className="section-padding">
        <div className="container-custom">
          {/* Two-column on desktop: text left, slideshow right */}
          <div id='slide' className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ">

            {/* Text */}
            <div>
              <FadeIn>
                <AnimatePresence mode="wait">
                  <motion.h2 key={lang} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}
                    className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[3.5rem] xl:text-[4rem] font-medium leading-[1.08] text-white">
                    {tx.headline1}<br />{tx.headline2}
                  </motion.h2>
                </AnimatePresence>
              </FadeIn>

              <FadeIn delay={0.15} className="mt-8 md:mt-10">
                <AnimatePresence mode="wait">
                  <motion.p key={lang} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}
                    className="text-neutral-400 text-sm sm:text-base leading-relaxed">
                    {tx.tagline}
                  </motion.p>
                </AnimatePresence>
              </FadeIn>
            </div>

            {/* Slideshow — only visible on lg+ */}
            <FadeIn delay={0.2} className="hidden lg:block">
              <div id='slide' className="aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-900 ring-1 ring-neutral-800">
                <ProjectSlideshow covers={covers} />
              </div>
            </FadeIn>

          </div>
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
