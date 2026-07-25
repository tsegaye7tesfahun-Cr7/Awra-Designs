import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import t from '../utils/translations'

const teamMembers = [
  { name: 'Tesfahun Tsegaye', image: '/images/The Team/Tesfahun Tsegaye.webp' },
  { name: 'Sarah Bekele',     image: '/images/The Team/Sarah Bekele.webp' },
  { name: 'Daniel Haile',     image: '/images/The Team/Daniel Haile.webp' },
  { name: 'Bereket Fikre',    image: '/images/The Team/Bereket Fikre.webp' },
]

function FadeIn({ children, delay = 0, className = '' }) {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true })
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  )
}

export default function About({ lang = 'en' }) {
  const tx = t[lang].about

  return (
    <section id="about" className="bg-[#0a0a0a]">
      <hr className="border-0 border-t border-neutral-800" />

      {/* Statement */}
      <div className="section-padding">
        <div className="container-custom">
          <FadeIn>
            <AnimatePresence mode="wait">
              <motion.h2
                key={lang}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] xl:text-[4.5rem] font-medium leading-[1.08] text-white"
              >
                {tx.headline1}
                <br />
                {tx.headline2}
              </motion.h2>
            </AnimatePresence>
          </FadeIn>

          <FadeIn delay={0.15} className="mt-8 md:mt-12 max-w-xl">
            <AnimatePresence mode="wait">
              <motion.p
                key={lang}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="text-neutral-400 text-sm sm:text-base leading-relaxed"
              >
                {tx.tagline}
              </motion.p>
            </AnimatePresence>
          </FadeIn>
        </div>
      </div>

      <hr className="border-0 border-t border-neutral-800" />

      {/* Team */}
      <div className="section-padding">
        <div className="container-custom">
          <FadeIn className="mb-14 md:mb-20">
            <AnimatePresence mode="wait">
              <motion.h3
                key={lang}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="font-display text-2xl sm:text-3xl font-medium text-white"
              >
                {tx.teamHeading}
              </motion.h3>
            </AnimatePresence>
          </FadeIn>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            {teamMembers.map((member, i) => (
              <FadeIn key={member.name} delay={i * 0.07}>
                <div className="aspect-[3/4] overflow-hidden mb-4 bg-neutral-900">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <p className="text-xs sm:text-sm font-medium text-white leading-snug">
                  <AnimatePresence mode="wait">
                    <motion.span key={lang + member.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                      {tx.names[member.name]}
                    </motion.span>
                  </AnimatePresence>
                </p>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={lang}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="label-text mt-1"
                  >
                    {tx.roles[member.name]}
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
