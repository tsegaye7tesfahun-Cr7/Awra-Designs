import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { throttle } from '../utils/throttle'
import t from '../utils/translations'
import useSettings from '../lib/useSettings'
import SearchModal from './SearchModal'

const SCROLL_THROTTLE_MS = 120
const ALL_SECTIONS = ['home', 'works', 'about', 'contact']

const Navbar = ({ isScrolled, lang }) => {
  const [activeSection, setActiveSection] = useState('home')
  const [searchOpen, setSearchOpen]       = useState(false)
  const [mobileOpen, setMobileOpen]       = useState(false)

  const tx       = t[lang].nav
  const settings = useSettings()
  const disciplines = settings.disciplines || tx.discipline

  // Active section tracker
  useEffect(() => {
    const handle = throttle(() => {
      const current = ALL_SECTIONS.find(id => {
        const el = document.getElementById(id)
        if (!el) return false
        const rect = el.getBoundingClientRect()
        return rect.top <= 120 && rect.bottom >= 120
      })
      if (current) setActiveSection(current)
    }, SCROLL_THROTTLE_MS)
    window.addEventListener('scroll', handle, { passive: true })
    handle()
    return () => window.removeEventListener('scroll', handle)
  }, [])

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (el) {
      const top = el.getBoundingClientRect().top + window.pageYOffset - 72
      window.scrollTo({ top, behavior: 'smooth' })
    }
    setMobileOpen(false)
  }

  const links = [
    { label: tx.work,    id: 'works'   },
    { label: tx.about,   id: 'about'   },
    { label: tx.contact, id: 'contact' },
  ]

  return (
    <>
      <motion.nav
        initial={{ y: -72, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/[0.06]'
            : 'bg-transparent'
        }`}
      >
        <div className="w-full px-6 sm:px-10 lg:px-16 2xl:px-20">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* ── Logo ── */}
            <button
              onClick={() => scrollToSection('home')}
              aria-label="Go to home"
              className="flex-shrink-0 flex flex-col items-start gap-0.5"
            >
              <img
                src="/Logo.svg"
                alt="Awra Designs"
                className="h-7 md:h-9 lg:h-10 w-auto"
                loading="eager"
                fetchpriority="high"
              />
            </button>

            {/* ── Desktop nav ── */}
            <div className="hidden md:flex items-center gap-8 lg:gap-10">
              {links.map(({ label, id }) => {
                const isActive = activeSection === id
                return (
                  <button
                    key={id}
                    onClick={() => scrollToSection(id)}
                    className={`relative label-text transition-colors duration-300 whitespace-nowrap group ${
                      isActive ? 'text-gold' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {label}
                    <span className={`absolute -bottom-0.5 left-0 h-px bg-gold transition-all duration-300 ${
                      isActive ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-50'
                    }`} />
                  </button>
                )
              })}
            </div>

            {/* ── Desktop right: search + CTA ── */}
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="text-neutral-500 hover:text-white transition-colors p-1"
              >
                <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              <button
                onClick={() => scrollToSection('contact')}
                className="group inline-flex items-center gap-2 px-5 py-2.5 bg-gold text-[#0a0a0a] text-[10px] font-semibold tracking-widest uppercase transition-all duration-300 hover:bg-gold-dark"
              >
                Get in Touch
                <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
              </button>
            </div>

            {/* ── Mobile right: search + hamburger ── */}
            <div className="flex md:hidden items-center gap-4">
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              <button
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h10M4 18h16" />
                </svg>
              </button>
            </div>

          </div>
        </div>
      </motion.nav>

      {/* ── Full-screen mobile menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-[60] md:hidden flex flex-col bg-[#0a0a0a]"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 h-16 border-b border-white/[0.06]">
              <img src="/Logo.svg" alt="Awra Designs" className="h-7 w-auto" />
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 flex flex-col justify-center px-8 gap-2">
              {links.map(({ label, id }, i) => (
                <motion.button
                  key={id}
                  onClick={() => scrollTo(id)}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                  className={`text-left py-4 border-b border-white/[0.06] font-display text-3xl font-medium transition-colors ${
                    activeSection === id ? 'text-gold' : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  {label}
                </motion.button>
              ))}
            </nav>

            {/* Bottom CTA */}
            <div className="px-8 pb-10">
              <motion.button
                onClick={() => scrollToSection('contact')}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 }}
                className="w-full py-4 bg-gold text-[#0a0a0a] text-xs font-bold tracking-widest uppercase hover:bg-gold-dark transition-colors"
              >
                Get in Touch →
              </motion.button>
              <p className="label-text text-neutral-700 text-center mt-4">
                {disciplines}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} lang={lang} />
    </>
  )
}

export default Navbar
