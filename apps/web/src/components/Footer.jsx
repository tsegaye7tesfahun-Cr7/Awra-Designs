import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { AnimatePresence } from 'framer-motion'
import t from '../utils/translations'
import { BlueprintGrid, SheetRef } from './ArchDetails'
import useSettings from '../lib/useSettings'

// SVG icons — purely presentational, no URLs here
const SOCIAL_ICONS = {
  Instagram: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  ),
  Facebook: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  Telegram: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  ),
  TikTok: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  ),
}

export default function Footer({ lang = 'en' }) {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true })
  const tx = t[lang].footer
  const settings = useSettings()

  // Dynamic values from settings with fallbacks
  const estYear       = settings.est_year        || '2019'
  const copyrightName = settings.copyright_name  || 'Awra Finishing & Interior'
  const location      = settings.contact_location || 'Addis Ababa, Ethiopia'

  // Build social links from settings — only include those with a URL set
  const socials = [
    { name: 'Instagram', key: 'instagram_url' },
    { name: 'Facebook',  key: 'facebook_url' },
    { name: 'Telegram',  key: 'telegram_url' },
    { name: 'TikTok',    key: 'tiktok_url' },
  ]
    .map(s => ({ name: s.name, href: settings[s.key], icon: SOCIAL_ICONS[s.name] }))
    .filter(s => s.href)

  return (
    <footer ref={ref} className="bg-[#0a0a0a] relative overflow-hidden">
      <BlueprintGrid opacity={0.025} gridSize={80} />
      <hr className="border-0 border-t border-neutral-800" />
      <motion.div
        className="container-custom"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6 }}
      >
        {/* Mobile — icons only, single tight row */}
        <div className="lg:hidden flex items-center justify-between py-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          <AnimatePresence mode="wait">
            <motion.span key={lang} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="label-text whitespace-nowrap">{`Est. ${estYear} · ${location.split(',')[0]}`}</motion.span>
          </AnimatePresence>
          <div className="flex items-center gap-5">
            {socials.map((s) => (
              <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer"
                aria-label={s.name}
                className="text-neutral-500 hover:text-white transition-colors">
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Desktop — icons + text labels */}
        <div className="hidden lg:flex items-center justify-between py-8">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top">
            <img src="/favicon.svg" alt="Awra Designs"
              className="h-6 w-auto opacity-40 hover:opacity-80 transition-opacity"
              loading="lazy" />
          </button>

          <div className="flex items-center gap-8">
            <AnimatePresence mode="wait">
              <motion.span key={lang} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="label-text">{`Est. ${estYear}`}</motion.span>
            </AnimatePresence>
            <AnimatePresence mode="wait">
              <motion.span key={lang + 'loc'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="label-text">{location}</motion.span>
            </AnimatePresence>
            <AnimatePresence mode="wait">
              <motion.span key={lang + 'copy'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="label-text">{`© ${new Date().getFullYear()} ${copyrightName}`}</motion.span>
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-5">
            {socials.map((s) => (
              <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer"
                aria-label={s.name}
                className="text-neutral-500 hover:text-white transition-colors">
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </motion.div>
    </footer>
  )
}
