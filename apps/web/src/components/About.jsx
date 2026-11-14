import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import t from '../utils/translations'
import { trackView } from '../lib/analytics'
import { SheetRef } from './ArchDetails'

function useCounter(target, inView, duration = 1800) {
  const [count, setCount] = useState(0)
  const started = useRef(false)
  useEffect(() => {
    if (!inView || started.current) return
    started.current = true
    const start = performance.now()
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setCount(Math.round(target * ease))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, target, duration])
  return count
}

function StatCard({ stat, inView, delay }) {
  const [active, setActive] = useState(false)
  const count = useCounter(stat.value, active)
  useEffect(() => {
    if (!inView) return
    const t = setTimeout(() => setActive(true), delay)
    return () => clearTimeout(t)
  }, [inView, delay])

  return (
    <div className="bg-[#0a0a0a] px-6 py-8">
      <div className="font-display text-3xl sm:text-4xl font-medium text-gold tabular-nums">
        {count}{stat.suffix}
      </div>
      <p className="label-text mt-2 text-neutral-600 leading-snug">{stat.label}</p>
    </div>
  )
}

function StatsSection() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true })
  const stats = [
    { label: 'Completed Projects',  value: 120, suffix: '+' },
    { label: 'Residential Designs', value: 80,  suffix: '+' },
    { label: 'Commercial Projects', value: 40,  suffix: '+' },
    { label: 'Building Permits',    value: 200, suffix: '+' },
    { label: 'Years of Experience', value: 7,   suffix: '' },
    { label: 'Satisfied Clients',   value: 100, suffix: '+' },
  ]
  return (
    <div ref={ref}>
      <FadeIn className="mb-10 md:mb-14">
        <p className="label-text mb-3">By the Numbers</p>
        <h3 className="font-display text-2xl sm:text-3xl font-medium text-white">Impact & Scale</h3>
      </FadeIn>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-neutral-900">
        {stats.map((stat, i) => (
          <StatCard key={stat.label} stat={stat} inView={inView} delay={i * 120} />
        ))}
      </div>
    </div>
  )
}

function DesignProcessSection() {
  const { ref, inView } = useInView({ threshold: 0.15, triggerOnce: true })
  const steps = [
    { code: '01', title: 'Discovery',              desc: 'Site analysis, brief development, and client consultation.' },
    { code: '02', title: 'Concept Sketch',          desc: 'Initial spatial ideas, massing studies, and mood direction.' },
    { code: '03', title: 'Planning',                desc: 'Detailed floor plans, section drawings, and permit documentation.' },
    { code: '04', title: '3D Visualization',        desc: 'Photorealistic renders and walkthroughs for approval.' },
    { code: '05', title: 'Permit Documentation',    desc: 'Full drawing sets prepared to Addis Ababa Building Authority standards.' },
    { code: '06', title: 'Construction Support',    desc: 'Site supervision and contractor coordination through completion.' },
  ]

  return (
    <div ref={ref}>
      <FadeIn className="mb-12 md:mb-16">
        <p className="label-text mb-3">Methodology</p>
        <h3 className="font-display text-2xl sm:text-3xl font-medium text-white">Design Process</h3>
      </FadeIn>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-neutral-900">
        {steps.map((step, i) => (
          <motion.div
            key={step.code}
            className="bg-[#0a0a0a] p-6 md:p-8 group"
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Animated connector line */}
            <div className="flex items-center gap-3 mb-4">
              <span className="label-text text-gold/50">{step.code}</span>
              <motion.div
                className="flex-1 h-px bg-gold/20"
                initial={{ scaleX: 0 }}
                animate={inView ? { scaleX: 1 } : {}}
                style={{ originX: 0 }}
                transition={{ duration: 0.8, delay: i * 0.1 + 0.2 }}
              />
            </div>
            <h4 className="text-sm font-medium text-white mb-2">{step.title}</h4>
            <p className="text-xs text-neutral-600 leading-relaxed">{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const SITE_ORIGIN = typeof window !== 'undefined' ? window.location.origin : ''
function resolveImg(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${SITE_ORIGIN}${url}`
}

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
            className={`h-px transition-all duration-300 ${i === active ? 'w-6 bg-gold' : 'w-3 bg-white/40 hover:bg-white/70'}`}
          />
        ))}
      </div>
    </div>
  )
}

export default function About({ lang = 'en' }) {
  const tx = t[lang].about
  const [teamMembers, setTeamMembers] = useState(FALLBACK_TEAM)
  useEffect(() => { trackView('about') }, [])
  const [covers, setCovers] = useState(FALLBACK_COVERS)

  useEffect(() => {
    fetch(`${API_URL}/about`, { cache: 'no-store' })
      .then(r => { if (!r.ok) throw new Error('not ok'); return r.json() })
      .then(d => {
        if (d.success && d.data?.teamMembers?.length > 0) {
          setTeamMembers(d.data.teamMembers.map(m => ({
            name:   m.name,   nameAm: m.nameAm,
            role:   m.role,   roleAm: m.roleAm,
            image:  resolveImg(m.imageUrl) || '',
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
    <section id="about" className="bg-[#0a0a0a] relative overflow-hidden">
      <SheetRef code="A-201" title="ABOUT" />
      <hr className="border-0 border-t border-neutral-800" />

      <div className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* ── Left: editorial text ── */}
            <div>
              {/* Eyebrow */}
              <FadeIn>
                <div className="flex items-center gap-3 mb-8">
                  <span className="w-6 h-px bg-gold" />
                  <span className="label-text">
                    <AnimatePresence mode="wait">
                      <motion.span key={lang} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                        {lang === 'am' ? 'ስለ እኛ' : 'Addis Ababa · Est. 2019'}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                </div>
              </FadeIn>

              {/* Headline */}
              <FadeIn delay={0.08}>
                <AnimatePresence mode="wait">
                  <motion.h2
                    key={lang}
                    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="font-display font-medium leading-[1.06] tracking-tight"
                  >
                    <span className="block text-4xl sm:text-5xl lg:text-[3.2rem] xl:text-[3.8rem] text-white">
                      {lang === 'am' ? 'ሥነ ሕንፃ' : 'Architecture'}
                    </span>
                    <span
                      className="block text-4xl sm:text-5xl lg:text-[3.2rem] xl:text-[3.8rem] mt-1"
                      style={{ WebkitTextStroke: '1px rgba(255,255,255,0.2)', color: 'transparent' }}
                    >
                      {lang === 'am' ? 'ከልብ የመጣ' : 'with intention.'}
                    </span>
                    <span className="block text-3xl sm:text-4xl lg:text-[2.6rem] xl:text-[3rem] text-gold mt-2">
                      {lang === 'am' ? 'ዘለዓለም የሚቆይ።' : 'Built to last.'}
                    </span>
                  </motion.h2>
                </AnimatePresence>
              </FadeIn>

              {/* Rule */}
              <FadeIn delay={0.18}>
                <div className="flex items-center gap-4 my-8">
                  <div className="h-px w-8 bg-gold/60" />
                  <div className="h-px flex-1 max-w-[100px] bg-gradient-to-r from-gold/30 to-transparent" />
                </div>
              </FadeIn>

              {/* Body */}
              <FadeIn delay={0.22}>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={lang}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="text-neutral-400 text-sm sm:text-base leading-relaxed max-w-md"
                  >
                    {lang === 'am'
                      ? 'እኛ ቤቶችን፣ ቢሮዎችን እና ሕዝባዊ ቦታዎችን — ፋይዳ ያላቸውን ቦታዎች — ሕይወት ያለው ሥነ ሕንፃ ሠርተን እናድሳለን። ከፕላን ፈቃድ እስከ ማጠናቀቂያ ሥራ ድረስ።'
                      : 'We build homes, offices, and public spaces that are rooted in purpose — where every material choice, every proportion, and every detail serves the people who live and work inside. From permit drawings to finishing, we own every phase.'
                    }
                  </motion.p>
                </AnimatePresence>
              </FadeIn>

              {/* Two proof points */}
              <FadeIn delay={0.3} className="mt-10 grid grid-cols-2 gap-6 border-t border-neutral-800 pt-8">
                <div>
                  <p className="font-display text-3xl font-medium text-white tabular-nums">120<span className="text-gold">+</span></p>
                  <p className="label-text mt-1 text-neutral-500 leading-snug">
                    {lang === 'am' ? 'ተጠናቅቀዋል' : 'Projects delivered'}
                  </p>
                </div>
                <div>
                  <p className="font-display text-3xl font-medium text-white tabular-nums">7<span className="text-gold"> yrs</span></p>
                  <p className="label-text mt-1 text-neutral-500 leading-snug">
                    {lang === 'am' ? 'የልምድ ዓመታት' : 'Studio experience'}
                  </p>
                </div>
              </FadeIn>
            </div>

            {/* ── Right: slideshow ── */}
            <FadeIn delay={0.15} className="hidden lg:flex flex-col gap-4">
              <div id='slide' className="aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-900 ring-1 ring-neutral-800/60">
                <ProjectSlideshow covers={covers} />
              </div>
              {/* Caption strip */}
              <div className="flex items-center justify-between px-1">
                <span className="label-text text-neutral-600">
                  {lang === 'am' ? 'ከፕሮጀክቶቻችን' : 'Selected projects · Addis Ababa'}
                </span>
                <span className="label-text text-gold/60">{covers.length} images</span>
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

      <div className="section-padding border-t border-neutral-800">
        <div className="container-custom">
          <StatsSection />
        </div>
      </div>

      <div className="section-padding border-t border-neutral-800">
        <div className="container-custom">
          <DesignProcessSection />
        </div>
      </div>
    </section>
  )
}
