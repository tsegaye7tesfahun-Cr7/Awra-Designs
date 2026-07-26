import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

// Static fallback — shown while API loads or if API fails
const FALLBACK_FAQS = [
  {
    id: '1',
    question: 'What services does Awra Designs offer?',
    answer: 'We offer architecture, interior design, 3D visualization, finishing works, and branding services. From concept to completion, we handle residential, commercial, and hospitality projects across Ethiopia.',
  },
  {
    id: '2',
    question: 'How do I start a project with Awra Designs?',
    answer: 'Simply reach out via WhatsApp, phone, or our contact form. We will schedule an initial consultation to understand your vision, requirements, and budget before proposing a plan tailored to your project.',
  },
  {
    id: '3',
    question: 'How long does a typical interior design project take?',
    answer: 'Project timelines vary based on scope and complexity. A single room typically takes 4–8 weeks, while a full apartment or commercial space can range from 3 to 6 months. We provide a detailed timeline during the proposal stage.',
  },
  {
    id: '4',
    question: 'Do you work outside of Addis Ababa?',
    answer: 'Yes. While our studio is based in Addis Ababa, we take on projects across Ethiopia. For remote projects, we coordinate closely through digital tools and site visits at key project milestones.',
  },
  {
    id: '5',
    question: 'What is included in your 3D visualization service?',
    answer: 'Our 3D service includes photorealistic renders of your space from multiple angles, material and lighting studies, and revision rounds based on your feedback. It is ideal for approving a design before construction begins.',
  },
  {
    id: '6',
    question: 'Can I see examples of your previous work?',
    answer: 'Absolutely. Our portfolio section showcases a curated selection of completed projects across interior design, architecture, 3D rendering, finishing, and branding. You can filter by category to find relevant examples.',
  },
  {
    id: '7',
    question: 'How is your pricing structured?',
    answer: 'Pricing depends on project type, scale, and complexity. We offer fixed-fee contracts for defined scopes and percentage-of-construction-cost models for larger projects. Contact us for a free initial estimate.',
  },
]

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function FadeIn({ children, delay = 0, className = '' }) {
  const { ref, inView } = useInView({ threshold: 0.05, triggerOnce: true })
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

function FAQItem({ item, isOpen, onToggle, index }) {
  return (
    <FadeIn delay={index * 0.04}>
      <div className="border-b border-neutral-900">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between gap-6 py-6 text-left group"
          aria-expanded={isOpen}
        >
          <span className={`text-sm sm:text-base font-medium leading-snug transition-colors duration-200 ${
            isOpen ? 'text-white' : 'text-neutral-300 group-hover:text-white'
          }`}>
            {item.question}
          </span>
          <span className={`flex-shrink-0 w-5 h-5 flex items-center justify-center border transition-all duration-300 ${
            isOpen ? 'border-white rotate-45' : 'border-neutral-700 group-hover:border-neutral-500'
          }`}>
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
              <path d="M4.5 1v7M1 4.5h7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </span>
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <p className="text-neutral-500 text-sm leading-relaxed pb-6 max-w-2xl">
                {item.answer}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FadeIn>
  )
}

export default function FAQ({ lang = 'en' }) {
  const { ref, inView } = useInView({ threshold: 0.05, triggerOnce: true })
  const [openId, setOpenId] = useState(null)
  const [faqs, setFaqs] = useState(FALLBACK_FAQS)

  useEffect(() => {
    fetch(`${API_URL}/faq`)
      .then(r => { if (!r.ok) throw new Error('not ok'); return r.json() })
      .then(d => { if (d.success && d.data?.length) setFaqs(d.data) })
      .catch(() => {/* keep fallback */})
  }, [])

  const toggle = (id) => setOpenId(prev => prev === id ? null : id)

  // Bilingual labels
  const labels = {
    en: { eyebrow: 'Questions', heading: 'Frequently asked', cta: 'Still have questions?', ctaLink: 'Get in touch →' },
    am: { eyebrow: 'ጥያቄዎች', heading: 'ብዙ ጊዜ የሚጠየቁ', cta: 'ተጨማሪ ጥያቄ አለዎት?', ctaLink: 'ያናግሩን →' },
  }
  const tx = labels[lang] || labels.en

  return (
    <section id="faq" ref={ref} className="bg-[#0a0a0a] border-t border-neutral-900">
      <div className="section-padding">
        <div className="container-custom">

          {/* Header */}
          <motion.div
            className="mb-12 md:mb-16 max-w-xl"
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <p className="label-text mb-3">{tx.eyebrow}</p>
            <AnimatePresence mode="wait">
              <motion.h2
                key={lang}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="font-display text-3xl sm:text-4xl md:text-5xl font-medium text-white"
              >
                {tx.heading}
              </motion.h2>
            </AnimatePresence>
          </motion.div>

          {/* FAQ list */}
          <div className="max-w-3xl">
            {faqs.map((item, i) => (
              <FAQItem
                key={item.id}
                item={item}
                index={i}
                isOpen={openId === item.id}
                onToggle={() => toggle(item.id)}
              />
            ))}
          </div>

          {/* CTA */}
          <motion.div
            className="mt-12 md:mt-16 pt-10 border-t border-neutral-900 flex items-center justify-between"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <AnimatePresence mode="wait">
              <motion.p key={lang} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                className="text-neutral-500 text-sm">
                {tx.cta}
              </motion.p>
            </AnimatePresence>
            <a
              href="#contact"
              onClick={e => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }) }}
              className="label-text text-neutral-400 hover:text-white transition-colors"
            >
              {tx.ctaLink}
            </a>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
