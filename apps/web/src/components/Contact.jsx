import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { submitContact } from '../lib/api'
import { trackView, trackEvent } from '../lib/analytics'
import { SheetRef } from './ArchDetails'
import useSettings from '../lib/useSettings'

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || '').trim())

// bilingual copy (UI labels only — contact values come from settings)
const copy = {
  en: {
    touch: 'Get in Touch',
    heading1: 'Start a',
    heading2: 'conversation.',
    waBtn: 'Chat on WhatsApp',
    namePh: 'Name', emailPh: 'Email', msgPh: 'Tell us about your project',
    send: 'Send Message', sendShort: 'Send',
    sending: 'Sending…',
    sent: "Message sent — we'll be in touch soon.",
    sentShort: 'Sent.',
    err: 'Something went wrong. Please try again.',
    errShort: 'Failed — try again.',
    whatsapp: 'WhatsApp',
    phone: 'Phone',
    email: 'Email',
    location: 'Location',
  },
  am: {
    touch: 'ያግኙን',
    heading1: 'ስለ ፕሮጀክትዎ',
    heading2: 'ያናግሩን።',
    waBtn: 'በ WhatsApp ያናግሩን',
    namePh: 'ስም', emailPh: 'ኢሜይል', msgPh: 'ስለ ፕሮጀክትዎ ያስረዱን',
    send: 'መልእክት ላክ', sendShort: 'ላክ',
    sending: 'እየተላከ…',
    sent: 'መልእክትዎ ተልኳል — በቅርቡ እናገኝዎታለን።',
    sentShort: 'ተልኳል።',
    err: 'ስህተት ተከስቷል። እንደገና ይሞክሩ።',
    errShort: 'አልተሳካም — ይሞክሩ።',
    whatsapp: 'WhatsApp',
    phone: 'ስልክ',
    email: 'ኢሜይል',
    location: 'አድራሻ',
  },
}

const WaIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

export default function Contact({ lang = 'en' }) {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true })
  const t = copy[lang]
  const settings = useSettings()

  // Build contact links dynamically from settings
  const waNumber = settings.whatsapp_number || '251923814125'
  const waText   = encodeURIComponent("Hello Awra Designs, I'd like to discuss a project.")
  const waHref   = `https://wa.me/${waNumber}?text=${waText}`
  const phone    = settings.contact_phone    || '+251 92 381 4125'
  const email    = settings.contact_email    || 'info@awradesigns.com'
  const location = settings.contact_location || 'Addis Ababa, Ethiopia'
  const mapsUrl  = settings.google_maps_url  || 'https://maps.google.com/maps?q=9.021902,38.786683'
  const proofText = settings.proof_text      || '100+ spaces completed across Ethiopia'

  const contactLinks = [
    { label: t.whatsapp, value: phone, href: waHref, external: true },
    { label: t.phone,    value: phone, href: `tel:${phone.replace(/\s/g, '')}` },
    { label: t.email,    value: email, href: `mailto:${email}` },
    { label: t.location, value: location, href: mapsUrl, external: true },
  ]

  useEffect(() => { trackView('contact') }, [])

  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors]     = useState({ name: '', email: '', message: '' })
  const [touched, setTouched]   = useState({ name: false, email: false, message: false })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)
  const [permitBanner, setPermitBanner] = useState(null) // permit prefill banner

  // Listen for prefill-contact event from PermitCalculator
  // Also check sessionStorage in case Contact was not yet mounted when event fired
  useEffect(() => {
    const applyPrefill = ({ message, permitData }) => {
      if (message) {
        setFormData(prev => ({ ...prev, message }))
        setTouched(prev => ({ ...prev, message: true }))
      }
      if (permitData) setPermitBanner(permitData)
    }

    // Check sessionStorage first (handles lazy-load case)
    const stored = sessionStorage.getItem('_permit_prefill')
    if (stored) {
      try {
        applyPrefill(JSON.parse(stored))
        sessionStorage.removeItem('_permit_prefill')
      } catch {}
    }

    // Also listen for real-time event
    const handler = (e) => {
      applyPrefill(e.detail || {})
      sessionStorage.removeItem('_permit_prefill')
    }
    window.addEventListener('prefill-contact', handler)
    return () => window.removeEventListener('prefill-contact', handler)
  }, [])

  const validateField = (name, value) => {
    if (name === 'name') {
      const v = (value || '').trim()
      if (!v) return 'Required'
      if (v.length < 2) return 'Too short'
      return ''
    }
    if (name === 'email') {
      const v = (value || '').trim()
      if (!v) return 'Required'
      if (!isValidEmail(v)) return 'Invalid email'
      return ''
    }
    if (name === 'message') {
      const v = (value || '').trim()
      if (!v) return 'Required'
      if (v.length < 10) return 'Too short'
      return ''
    }
    return ''
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(p => ({ ...p, [name]: value }))
    if (touched[name]) setErrors(p => ({ ...p, [name]: validateField(name, value) }))
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched(p => ({ ...p, [name]: true }))
    setErrors(p => ({ ...p, [name]: validateField(name, value) }))
  }

  const validateAll = () => {
    const e = {
      name:    validateField('name',    formData.name),
      email:   validateField('email',   formData.email),
      message: validateField('message', formData.message),
    }
    setErrors(e)
    setTouched({ name: true, email: true, message: true })
    return !Object.values(e).some(Boolean)
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!validateAll()) return
    setIsSubmitting(true)
    setSubmitStatus(null)
    try {
      await submitContact({
        name:    formData.name.trim(),
        email:   formData.email.trim(),
        message: formData.message.trim(),
        subject: 'Contact Form',
      })
      setSubmitStatus('success')
      trackEvent('contact_form', null, { name: formData.name.trim() })
      setFormData({ name: '', email: '', message: '' })
      setErrors({ name: '', email: '', message: '' })
      setTouched({ name: false, email: false, message: false })
      setTimeout(() => setSubmitStatus(null), 6000)
    } catch {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid =
    formData.name.trim().length >= 2 &&
    isValidEmail(formData.email) &&
    formData.message.trim().length >= 10

  const fieldClass = (name) =>
    `w-full bg-transparent border-b py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none transition-colors duration-300 ${
      touched[name] && errors[name]
        ? 'border-red-600/70 focus:border-red-500'
        : 'border-neutral-800 focus:border-neutral-500'
    }`

  return (
    <section id="contact" ref={ref} className="bg-[#0a0a0a] relative">
      <SheetRef code="A-601" title="CONTACT" />
      <hr className="border-0 border-t border-neutral-800" />

      {/* ── MOBILE ── */}
      <div className="lg:hidden px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {/* Header row — toggle now lives in navbar */}
          <div className="flex items-center mb-6">
            <p className="label-text">{t.touch}</p>
          </div>

          {/* WhatsApp primary */}
          <a
            href={waHref}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-white text-[#0a0a0a] text-xs font-medium tracking-wide mb-6"
          >
            <WaIcon />
            <AnimatePresence mode="wait">
              <motion.span key={t.waBtn}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}>
                {t.waBtn}
              </motion.span>
            </AnimatePresence>
          </a>

          {/* Contact rows */}
          <div className="space-y-0 mb-8">
            {contactLinks.map((row) => (
              row.href ? (
                <a key={row.label} href={row.href}
                  {...(row.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="flex items-center py-2.5 border-b border-neutral-900 text-sm text-neutral-400 hover:text-white transition-colors group"
                >
                  <span className="label-text w-24 flex-shrink-0">{row.label}</span>
                  <span className="group-hover:underline underline-offset-4">{row.value}</span>
                </a>
              ) : (
                <div key={row.label} className="flex items-center py-2.5 border-b border-neutral-900 text-sm text-neutral-400">
                  <span className="label-text w-24 flex-shrink-0">{row.label}</span>
                  <span>{row.value}</span>
                </div>
              )
            ))}
          </div>

          {/* Compact form */}
          {permitBanner && (
            <div className="mb-4 px-4 py-3 border border-white/10 bg-white/5 text-xs text-neutral-400 leading-relaxed">
              Your estimated permit fee has been attached to your consultation request.
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <input type="text" name="name" value={formData.name}
                onChange={handleChange} onBlur={handleBlur}
                placeholder={t.namePh} required className={fieldClass('name')} />
              {touched.name && errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>
            <div>
              <input type="email" name="email" value={formData.email}
                onChange={handleChange} onBlur={handleBlur}
                placeholder={t.emailPh} required className={fieldClass('email')} />
              {touched.email && errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>
            <div>
              <textarea name="message" value={formData.message}
                onChange={handleChange} onBlur={handleBlur}
                rows={3} placeholder={t.msgPh} required
                className={`${fieldClass('message')} resize-none`} />
              {touched.message && errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
            </div>
            <div className="flex items-center gap-4">
              <button type="submit" disabled={isSubmitting || !isFormValid}
                className="px-6 py-2.5 bg-white text-[#0a0a0a] text-xs font-medium tracking-wide hover:bg-cream transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                {isSubmitting ? t.sending : t.sendShort}
              </button>
              {submitStatus === 'success' && <span className="text-xs text-neutral-400">{t.sentShort}</span>}
              {submitStatus === 'error'   && <span className="text-xs text-red-500">{t.errShort}</span>}
            </div>
          </form>
        </motion.div>
      </div>

      {/* ── DESKTOP ── */}
      <div className="hidden lg:block section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-2 gap-24">

            {/* Left */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7 }}
            >
              {/* Heading — toggle lives in navbar now */}
              <div className="mb-8">
                <AnimatePresence mode="wait">
                  <motion.h2 key={lang}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="font-display text-5xl xl:text-6xl font-medium text-white leading-[1.1]"
                  >
                    {t.heading1}<br />
                    <em className="not-italic text-neutral-400">{t.heading2}</em>
                  </motion.h2>
                </AnimatePresence>
              </div>

              <p className="text-neutral-600 text-sm mb-8">
                <AnimatePresence mode="wait">
                  <motion.span key={proofText}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}>
                    {proofText}
                  </motion.span>
                </AnimatePresence>
              </p>

              <div className="space-y-5">
                {contactLinks.map((row) => (
                  <div key={row.label} className="flex items-start text-sm text-neutral-400">
                    <span className="label-text flex-shrink-0 w-24 whitespace-nowrap">
                      {row.label}
                    </span>
                    {row.href ? (
                      <a href={row.href}
                        {...(row.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        className="hover:text-white hover:underline underline-offset-4 transition-colors break-all">
                        {row.value}
                      </a>
                    ) : (
                      <span>{row.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              {permitBanner && (
                <div className="mb-6 px-4 py-3 border border-white/10 bg-white/5 text-xs text-neutral-400 leading-relaxed">
                  Your estimated permit fee has been attached to your consultation request.
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-7" noValidate>
                <div className="grid grid-cols-2 gap-7">
                  <div>
                    <input type="text" name="name" value={formData.name}
                      onChange={handleChange} onBlur={handleBlur}
                      placeholder={t.namePh} required
                      aria-invalid={touched.name && !!errors.name}
                      className={fieldClass('name')} />
                    {touched.name && errors.name && <p className="mt-1 text-xs text-red-500" role="alert">{errors.name}</p>}
                  </div>
                  <div>
                    <input type="email" name="email" value={formData.email}
                      onChange={handleChange} onBlur={handleBlur}
                      placeholder={t.emailPh} required
                      aria-invalid={touched.email && !!errors.email}
                      className={fieldClass('email')} />
                    {touched.email && errors.email && <p className="mt-1 text-xs text-red-500" role="alert">{errors.email}</p>}
                  </div>
                </div>
                <div>
                  <textarea name="message" value={formData.message}
                    onChange={handleChange} onBlur={handleBlur}
                    rows={4} placeholder={t.msgPh} required
                    aria-invalid={touched.message && !!errors.message}
                    className={`${fieldClass('message')} resize-none`} />
                  {touched.message && errors.message && <p className="mt-1 text-xs text-red-500" role="alert">{errors.message}</p>}
                </div>
                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <button type="submit" disabled={isSubmitting || !isFormValid}
                    className="px-7 py-3 bg-white text-[#0a0a0a] text-sm font-medium tracking-wide hover:bg-cream transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                    {isSubmitting ? t.sending : t.send}
                  </button>
                  {submitStatus === 'success' && <span className="text-sm text-neutral-400">{t.sent}</span>}
                  {submitStatus === 'error'   && <span className="text-sm text-red-500">{t.err}</span>}
                </div>
              </form>
            </motion.div>

          </div>
        </div>
      </div>

    </section>
  )
}
