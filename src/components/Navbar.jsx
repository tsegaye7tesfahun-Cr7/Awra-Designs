import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { throttle } from '../utils/throttle'
import t from '../utils/translations'

const SCROLL_THROTTLE_MS = 120

// Section order matches page layout:
// works → about → testimonials → blog → faq → contact
const ALL_SECTIONS = ['home', 'works', 'about', 'testimonials', 'blog', 'faq', 'contact']

const Navbar = ({ isScrolled, lang, setLang }) => {
  const [activeSection, setActiveSection] = useState('home')

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

  // Desktop: all links including Testimonials, Blog, and FAQ
  const desktopLinks = [
    { name: tx.work,         id: 'works'        },
    { name: tx.about,        id: 'about'        },
    { name: tx.testimonials, id: 'testimonials' },
    { name: tx.blog,         id: 'blog'         },
    { name: tx.faq,          id: 'faq'          },
    { name: tx.contact,      id: 'contact'      },
  ]

  // Mobile: shorter list — Testimonials, Blog, and FAQ removed
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
          isActive ? 'text-white' : 'text-neutral-500 hover:text-white'
        }`}
      >
        {link.name}
        <span
          className={`absolute -bottom-0.5 left-0 h-px bg-white transition-all duration-300 ${
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
      className="flex items-center gap-0.5 xs:gap-1 border border-neutral-800 hover:border-neutral-600 transition-colors px-1.5 xs:px-2.5 py-1 flex-shrink-0"
    >
      <span className={`label-text text-[9px] xs:text-[10px] transition-colors duration-200 ${lang === 'en' ? '!text-white' : '!text-neutral-600'}`}>
        EN
      </span>
      <span className="label-text text-[9px] xs:text-[10px] text-neutral-700">/</span>
      <span className={`label-text text-[9px] xs:text-[10px] transition-colors duration-200 ${lang === 'am' ? '!text-white' : '!text-neutral-600'}`}>
        አማ
      </span>
    </button>
  )

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'bg-[#0a0a0a]/95 backdrop-blur-md' : 'bg-transparent'
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
              {tx.discipline}
            </span>
          </button>

          {/* ── Desktop nav (md+): all links ─────────────────────────────── */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 flex-shrink-0">
            {desktopLinks.map(link => <NavLink key={link.id} link={link} />)}
            <LangToggle />
          </div>

          {/* ── Mobile nav (< md): shortened links ───────────────────────── */}
          <div className="flex md:hidden items-center gap-3 xs:gap-4 flex-shrink-0">
            {mobileLinks.map(link => <NavLink key={link.id} link={link} />)}
            <LangToggle />
          </div>

        </div>
      </div>
    </motion.nav>
  )
}

export default Navbar
