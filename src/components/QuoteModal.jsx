import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { submitContact } from '../lib/api'

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v || '').trim())

const services = {
  en: ['Architecture', 'Interior Design', '3D Visualization', 'Finishing & Fit-out', 'Consultation'],
  am: ['አርክቴክቸር', 'ኢንቴሪየር ዲዛይን', '3D ቪዥዋላይዜሽን', 'ፊኒሺንግ', 'ምክር'],
}

const copy = {
  en: {
    title: 'Request a Quote',
    subtitle: "Tell us about your project and we'll get back to you within 24 hours.",
    service: 'Service',
    servicePh: 'Select a service',
    name: 'Name',
    namePh: 'Your name',
    contact: 'Email or Phone',
    contactPh: 'How should we reach you?',
    details: 'Project Details',
    detailsPh: 'Describe your space, timeline, or any other details…',
    send: 'Send Request',
    sending: 'Sending…',
    sent: 'Request sent — we\'ll be in touch soon.',
    err: 'Something went wrong. Please try again.',
    close: 'Close',
  },
  am: {
    title: 'ጥያቄ ላኩ',
    subtitle: 'ስለ ፕሮጀክትዎ ያስረዱን — በ24 ሰዓት ውስጥ እናገኝዎታለን።',
    service: 'አገልግሎት',
    servicePh: 'አገልግሎት ይምረጡ',
    name: 'ስም',
    namePh: 'ስምዎ',
    contact: 'ኢሜይል ወይም ስልክ',
    contactPh: 'እንዴት ማግኘት እንችላለን?',
    details: 'የፕሮጀክት ዝርዝር',
    detailsPh: 'ስለ ቦታዎ፣ የጊዜ ሰሌዳዎ ወይም ሌሎች ዝርዝሮችን ያስረዱ…',
    send: 'ጥያቄ ላክ',
    sending: 'እየተላከ…',
    sent: 'ጥያቄዎ ተልኳል — በቅርቡ እናገኝዎታለን።',
    err: 'ስህተት ተከስቷል። እንደገና ይሞክሩ።',
    close: 'ዝጋ',
  },
}

export default function QuoteModal({ isOpen, onClose, lang = 'en' }) {
  const t = copy[lang]
  const svcList = services[lang]
  const firstFocusRef = useRef(null)

  const [form, setForm] = useState({ service: '', name: '', contact: '', details: '' })
  const [touched, setTouched] = useState({})
  const [status, setStatus] = useState(null) // null | 'sending' | 'sent' | 'error'

  // lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setTimeout(() => firstFocusRef.current?.focus(), 100)
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const errors = {
    service: !form.service ? 'Required' : '',
    name:    !(form.name || '').trim() ? 'Required' : form.name.trim().length < 2 ? 'Too short' : '',
    contact: !(form.contact || '').trim() ? 'Required'
      : !isValidEmail(form.contact) && (form.contact.replace(/\D/g, '').length < 9)
        ? 'Enter a valid email or phone'
        : '',
    details: !(form.details || '').trim() ? 'Required' : form.details.trim().length < 10 ? 'Too short' : '',
  }

  const isValid = !Object.values(errors).some(Boolean)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
  }
  const handleBlur = (e) => setTouched(p => ({ ...p, [e.target.name]: true }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ service: true, name: true, contact: true, details: true })
    if (!isValid) return

    setStatus('sending')
    try {
      // Detect whether contact is email or phone
      const contactVal = (form.contact || '').trim()
      const isEmail = isValidEmail(contactVal)

      await submitContact({
        name:    form.name.trim(),
        email:   isEmail ? contactVal : 'noreply@awradesigns.com',
        phone:   !isEmail ? contactVal : undefined,
        subject: `Quote Request — ${form.service}`,
        message: form.details.trim(),
      })

      setStatus('sent')
      setForm({ service: '', name: '', contact: '', details: '' })
      setTouched({})
      setTimeout(onClose, 3000)
    } catch {
      setStatus('error')
    }
  }

  const fieldBase = 'w-full bg-transparent border-b py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none transition-colors duration-300'
  const fieldClass = (name) =>
    `${fieldBase} ${touched[name] && errors[name] ? 'border-red-600/70 focus:border-red-500' : 'border-neutral-800 focus:border-neutral-500'}`

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-[#0a0a0a]/90 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t.title}
            className="relative w-full sm:max-w-lg bg-[#111] border-t sm:border border-neutral-800 p-6 sm:p-8 max-h-[92vh] overflow-y-auto"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-display text-2xl font-medium text-white">{t.title}</h2>
                <p className="text-neutral-500 text-xs mt-1 max-w-xs leading-relaxed">{t.subtitle}</p>
              </div>
              <button
                onClick={onClose}
                aria-label={t.close}
                className="ml-4 flex-shrink-0 w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-white transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-5">

              {/* Service chips */}
              <div>
                <p className="label-text mb-3">{t.service}</p>
                <div className="flex flex-wrap gap-2">
                  {svcList.map((svc) => (
                    <button
                      type="button"
                      key={svc}
                      onClick={() => { setForm(p => ({ ...p, service: svc })); setTouched(p => ({ ...p, service: true })) }}
                      className={`text-[10px] uppercase tracking-[0.18em] px-3 py-1.5 border transition-colors duration-200 ${
                        form.service === svc
                          ? 'border-white text-white bg-white/10'
                          : 'border-neutral-800 text-neutral-500 hover:border-neutral-600 hover:text-neutral-300'
                      }`}
                    >
                      {svc}
                    </button>
                  ))}
                </div>
                {touched.service && errors.service && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.service}</p>
                )}
              </div>

              {/* Name */}
              <div>
                <input
                  ref={firstFocusRef}
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={t.namePh}
                  className={fieldClass('name')}
                />
                {touched.name && errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>

              {/* Contact */}
              <div>
                <input
                  type="text"
                  name="contact"
                  value={form.contact}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={t.contactPh}
                  className={fieldClass('contact')}
                />
                {touched.contact && errors.contact && <p className="mt-1 text-xs text-red-500">{errors.contact}</p>}
              </div>

              {/* Details */}
              <div>
                <textarea
                  name="details"
                  value={form.details}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows={3}
                  placeholder={t.detailsPh}
                  className={`${fieldClass('details')} resize-none`}
                />
                {touched.details && errors.details && <p className="mt-1 text-xs text-red-500">{errors.details}</p>}
              </div>

              {/* Submit */}
              <div className="flex items-center gap-4 pt-1">
                <button
                  type="submit"
                  disabled={status === 'sending' || status === 'sent'}
                  className="px-6 py-2.5 bg-white text-[#0a0a0a] text-xs font-medium tracking-wide hover:bg-[#f5f0eb] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {status === 'sending' ? t.sending : t.send}
                </button>
                {status === 'sent'  && <span className="text-xs text-neutral-400">{t.sent}</span>}
                {status === 'error' && <span className="text-xs text-red-500">{t.err}</span>}
              </div>

            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
