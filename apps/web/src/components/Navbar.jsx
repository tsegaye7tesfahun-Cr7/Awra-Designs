import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { throttle } from '../utils/throttle'
import t from '../utils/translations'
import useSettings from '../lib/useSettings'
import SearchModal from './SearchModal'
import { useTheme } from '../context/ThemeContext'

const SCROLL_THROTTLE_MS = 120

// Section order matches page layout:
// works → about → testimonials → contact
const ALL_SECTIONS = ['home', 'works', 'about', 'testimonials', 'contact']

const Navbar = ({ isScrolled, lang, setLang }) => {
  const [activeSection, setActiveSection] = useState('home')
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const handleScroll = () => {
      const current = ALL_SECTIONS.find(id => {
        const el = document.getElementById(id)
        if (el) {
          const rect = el.getBoundingClientRect()
          return rect.top <= 120 && rect.bottom >= 120
        }
        return false
      })
      if (current) setActiveSection(current)
    }
    const throttledScroll = throttle(handleScroll, SCROLL_THROTTLE_MS)
    window.addEventListener('scroll', throttledScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', throttledScroll)
  }, [])

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId)
    if (el) {
      const top = el.getBoundingClientRect().top + window.pageYOffset - 64
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  const tx = t[lang].nav

  const settings    = useSettings()
  const disciplines = settings.disciplines || tx.discipline
  const heroLabel   = settings.hero_label  || tx.label

  // Desktop: all links
  const desktopLinks = [
    { name: tx.work,         id: 'works'        },
    { name: tx.about,        id: 'about'        },
    { name: tx.testimonials, id: 'testimonials' },
    { name: tx.contact,      id: 'contact'      },
  ]

  // Mobile: shorter list
  const mobileLinks = [
    { name: tx.work,    id: 'works'   },
    { name: tx.about,   id: 'about'   },
    { name: tx.contact, id: 'contact' },
  ]

  const NavLink = ({ link }) => {
    const isActive = activeSection === link.id
    return (
      <button
        key={link.id}
        onClick={() => scrollToSection(link.id)}
        className={`relative label-text transition-colors duration-300 whitespace-nowrap group ${
          isActive ? 'text-white dark:text-white light:text-neutral-900' : 'text-neutral-500 dark:text-neutral-500 light:text-neutral-600 hover:text-white dark:hover:text-white light:hover:text-neutral-900'
        }`}
      >
        {link.name}
        <span
          className={`absolute -bottom-0.5 left-0 h-px bg-white dark:bg-white light:bg-neutral-900 transition-all duration-300 ${
            isActive
              ? 'w-full opacity-100'
              : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-40'
          }`}
        />
      </button>
    )
  }

  const LangToggle = () => (
    <button
      onClick={() => setLang(l => l === 'en' ? 'am' : 'en')}
      aria-label="Toggle language"
      className="flex items-center gap-0.5 xs:gap-1 border border-neutral-800 dark:border-neutral-800 light:border-neutral-300 hover:border-neutral-600 dark:hover:border-neutral-600 light:hover:border-neutral-400 transition-colors px-1.5 xs:px-2.5 py-1 flex-shrink-0"
    >
      <span className={`label-text text-[9px] xs:text-[10px] transition-colors duration-200 ${lang === 'en' ? '!text-white dark:!text-white light:!text-neutral-900' : '!text-neutral-600 dark:!text-neutral-600 light:!text-neutral-500'}`}>
        EN
      </span>
      <span className="label-text text-[9px] xs:text-[10px] text-neutral-700 dark:text-neutral-700 light:text-neutral-400">/</span>
      <span className={`label-text text-[9px] xs:text-[10px] transition-colors duration-200 ${lang === 'am' ? '!text-white dark:!text-white light:!text-neutral-900' : '!text-neutral-600 dark:!text-neutral-600 light:!text-neutral-500'}`}>
        አማ
      </span>
    </button>
  )

  const ThemeToggle = () => (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="text-neutral-500 dark:text-neutral-500 light:text-neutral-600 hover:text-white dark:hover:text-white light:hover:text-neutral-900 transition-colors flex-shrink-0"
    >
      {theme === 'dark' ? (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  )

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'bg-[#0a0a0a]/95 dark:bg-[#0a0a0a]/95 light:bg-white/95 backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
        <div className="flex items-center justify-between h-14 md:h-20">

          {/* Logo */}
          <button
            onClick={() => scrollToSection('home')}
            aria-label="Go to home"
            className="flex-shrink-0 flex flex-col items-start gap-0.5 min-w-0"
          >
            <img
              src="/images/Asset 1.svg"
              alt="Awra Designs"
              className="h-5 xs:h-6 md:h-8 w-auto"
              loading="eager"
              fetchpriority="high"
            />
            <span className="hidden md:block label-text text-[9px] tracking-[0.25em] text-neutral-600">
              {disciplines}
            </span>
          </button>

          {/* ── Desktop nav (md+): all links ─────────────────────────────── */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 flex-shrink-0">
            {desktopLinks.map(link => <NavLink key={link.id} link={link} />)}
            <button
              onClick={() => setSearchOpen(true)}
              className="text-neutral-500 hover:text-white transition-colors"
              aria-label="Search"
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <ThemeToggle />
            <LangToggle />
          </div>

          {/* ── Mobile nav (< md): hamburger menu ───────────────────────── */}
          <div className="flex md:hidden items-center gap-3 xs:gap-4 flex-shrink-0">
            <button
              onClick={() => setSearchOpen(true)}
              className="text-neutral-500 hover:text-white transition-colors"
              aria-label="Search"
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-neutral-500 hover:text-white transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
            <LangToggle />
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <motion.div
              className="absolute right-0 top-0 bottom-0 w-64 bg-[#0a0a0a] dark:bg-[#0a0a0a] light:bg-white border-l border-neutral-800 dark:border-neutral-800 light:border-neutral-200 flex flex-col"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="p-4 border-b border-neutral-900 dark:border-neutral-900 light:border-neutral-200 flex items-center justify-between">
                <span className="text-sm font-medium text-white dark:text-white light:text-neutral-900">Menu</span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-neutral-500 dark:text-neutral-500 light:text-neutral-600 hover:text-white dark:hover:text-white light:hover:text-neutral-900">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav className="flex-1 p-4 space-y-4">
                {mobileLinks.map(link => (
                  <button
                    key={link.id}
                    onClick={() => { scrollToSection(link.id); setMobileMenuOpen(false) }}
                    className={`text-left w-full py-2 text-sm transition-colors ${
                      activeSection === link.id ? 'text-white dark:text-white light:text-neutral-900' : 'text-neutral-400 dark:text-neutral-400 light:text-neutral-600 hover:text-white dark:hover:text-white light:hover:text-neutral-900'
                    }`}
                  >
                    {link.name}
                  </button>
                ))}
              </nav>
              <div className="p-4 border-t border-neutral-900 dark:border-neutral-900 light:border-neutral-200 flex items-center gap-4">
                <ThemeToggle />
                <LangToggle />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} lang={lang} />
    </motion.nav>
  )
}

export default Navbar
