import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import t from '../utils/translations'

// ── All image paths verified against files on disk ────────────────────────────
const PROJECTS = [
  {
    id: 'arch-1',
    category: 'Architectural Layouts & Spatial Programming',
    title: 'Architectural Layout Design',
    year: '2024', type: 'Residential', isFeatured: false,
    description: 'A comprehensive architectural layout study combining spatial programming, circulation analysis, and functional zoning to create environments that work as beautifully as they look.',
    images: [1,2,3,4].map(n =>
      `/images/Projects/Architecture/Architectural Layouts & Spatial Programming/Architectural Layouts ${n}.jpg`
    ),
  },
  {
    id: 'arch-2',
    category: 'Renovations & Transformations',
    title: 'Complete Home Renovation',
    year: '2024', type: 'Residential', isFeatured: false,
    description: 'A comprehensive renovation that completely reimagined an existing home — stripping it back to structure and rebuilding with modern materials, better light, and purposeful spaces.',
    images: [1,2,3,4].map(n =>
      `/images/Projects/Architecture/Renovations & Transformations/Renovations ${n}.jpg`
    ),
  },
  {
    id: 'arch-3',
    category: 'Facades & Exterior 3D Designs',
    title: 'Modern Residential Facade',
    year: '2024', type: 'Residential', isFeatured: true,
    description: 'A high-fidelity 3D rendering of a modern residential facade — exploring material contrast, fenestration rhythm, and the relationship between built form and landscape.',
    images: [1,2,3,4].map(n =>
      `/images/Projects/Architecture/For Facades & Outer 3D/For Facades & Outer 3D -${n}.jpg`
    ),
  },
  {
    id: 'res-1',
    category: 'Lounges & Family Rooms',
    title: 'Luxury Family Lounge',
    year: '2024', type: 'Residential', isFeatured: false,
    description: 'A spacious family lounge that feels both grand and deeply comfortable — layered textures, integrated lighting, and custom furniture create a space the whole family wants to live in.',
    images: [1,2,3,4].map(n =>
      `/images/Projects/Residential Interiors/Lounges & Family Rooms/Lounges & Family Rooms ${n}.jpg`
    ),
  },
  {
    id: 'res-2',
    category: 'Master Bedrooms & Suites',
    title: 'Master Bedroom Suite',
    year: '2024', type: 'Residential', isFeatured: false,
    description: 'A master bedroom designed as a true sanctuary — custom millwork, premium finishes, integrated dressing and en-suite, all unified by a calming palette that promotes deep rest.',
    images: [1,2,3,4].map(n =>
      `/images/Projects/Residential Interiors/Master Bedrooms & Suites/Master Bedrooms ${n}.jpg`
    ),
  },
  {
    id: 'res-3',
    category: "Kids' Bedrooms & Nurseries",
    title: "Creative Children's Bedroom",
    year: '2024', type: 'Residential', isFeatured: false,
    description: "A creative children's bedroom that sparks imagination while remaining practical — built-in storage, adaptable furniture, and a playful palette that doesn't sacrifice quality.",
    images: [1,2,3,4].map(n =>
      `/images/Projects/Residential Interiors/Creative Kids' Bedrooms & Nurseries/Kids Bedrooms ${n}.jpg`
    ),
  },
  {
    id: 'res-4',
    category: 'Luxury Bathrooms & Powder Rooms',
    title: 'Spa-Inspired Bathroom',
    year: '2024', type: 'Residential', isFeatured: false,
    description: 'A luxury bathroom that channels the calm of a five-star spa — natural stone, warm-toned metals, freestanding bath, and carefully positioned lighting.',
    images: [1,2,3,4].map(n =>
      `/images/Projects/Residential Interiors/Luxury Bathrooms & Powder Rooms/Luxury Bathrooms ${n}.jpg`
    ),
  },
  {
    id: 'res-5',
    category: 'Terraces & Verandas',
    title: 'Terrace & Veranda Living',
    year: '2024', type: 'Residential', isFeatured: false,
    description: 'Thoughtfully designed terraces and verandas that blur the boundary between inside and out — using shade, greenery, and material continuity to create year-round outdoor living.',
    images: [1,2,3,4].map(n =>
      `/images/Projects/Residential Interiors/Terraces & Verandas/Terraces Verandas ${n}.jpg`
    ),
  },
  {
    id: 'res-6',
    category: 'Islamic Luxury Interiors',
    title: 'Islamic Luxury Interior',
    year: '2024', type: 'Residential', isFeatured: false,
    description: 'An interior that honours Islamic artistic heritage through geometric patterns, calligraphy-inspired details, and premium materials.',
    images: [1,2,3,4].map(n =>
      `/images/Projects/Residential Interiors/Islamic Luxury Interiors/Islamic Luxury Interiors ${n}.jpg`
    ),
  },
  {
    id: 'com-1',
    category: 'Corporate Offices & Workspaces',
    title: 'Modern Corporate Office',
    year: '2024', type: 'Commercial', isFeatured: false,
    description: 'A modern corporate office designed to reflect the company culture — open collaboration zones, quiet focus areas, executive suites, and a reception that makes a strong first impression.',
    images: [1,2,3,4].map(n =>
      `/images/Projects/Commercial Design/Corporate Offices & Workspaces/Corporate Offices ${n}.jpg`
    ),
  },
  {
    id: 'com-2',
    category: 'Beauty Salons, Wellness & Retail',
    title: 'Luxury Beauty Salon',
    year: '2024', type: 'Commercial', isFeatured: false,
    description: 'A luxury beauty salon designed to be as beautiful as the services it offers — thoughtful station layout, premium materials, flattering lighting, and a relaxing colour palette.',
    images: [1,2,3,4].map(n =>
      `/images/Projects/Commercial Design/Beauty Salons, Wellness & Retail/Beauty Salons ${n}.jpg`
    ),
  },
  {
    id: 'out-1',
    category: 'Fences, Gates & Compound Seating',
    title: 'Compound Gate & Seating Design',
    year: '2024', type: 'Residential', isFeatured: false,
    description: 'A considered design for compound boundaries, entrance gates, and integrated outdoor seating — balancing security, aesthetics, and craftsmanship in every detail.',
    images: [1,2,3,4].map(n =>
      `/images/Projects/Outdoor Design/Fences, Gates & Compound Seating/Fences, Gates & Compound Seating ${n}.jpg`
    ),
  },
]

// ── Filter groups ─────────────────────────────────────────────────────────────
const GROUPS = [
  { id: 'all', label: 'All', subcategories: [] },
  {
    id: 'architecture', label: 'Architecture',
    subcategories: [
      { id: 'Architectural Layouts & Spatial Programming', label: 'Layouts & Spatial' },
      { id: 'Renovations & Transformations',               label: 'Renovations' },
      { id: 'Facades & Exterior 3D Designs',               label: 'Facades & 3D' },
    ],
  },
  {
    id: 'residential', label: 'Residential',
    subcategories: [
      { id: 'Lounges & Family Rooms',           label: 'Lounges' },
      { id: 'Master Bedrooms & Suites',          label: 'Bedrooms' },
      { id: "Kids' Bedrooms & Nurseries",        label: "Kids' Rooms" },
      { id: 'Luxury Bathrooms & Powder Rooms',   label: 'Bathrooms' },
      { id: 'Terraces & Verandas',               label: 'Terraces' },
      { id: 'Islamic Luxury Interiors',          label: 'Islamic Luxury' },
    ],
  },
  {
    id: 'commercial', label: 'Commercial',
    subcategories: [
      { id: 'Corporate Offices & Workspaces',   label: 'Offices' },
      { id: 'Beauty Salons, Wellness & Retail',  label: 'Salons & Retail' },
    ],
  },
  {
    id: 'outdoor', label: 'Outdoor',
    subcategories: [
      { id: 'Fences, Gates & Compound Seating', label: 'Fences & Gates' },
    ],
  },
]

function getGroupCats(groupId) {
  if (groupId === 'all') return null
  return GROUPS.find(g => g.id === groupId)?.subcategories.map(s => s.id) || []
}

function FadeIn({ children, delay = 0, className = '' }) {
  const { ref, inView } = useInView({ threshold: 0.05, triggerOnce: true })
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  )
}

function ImageGallery({ images, title }) {
  const [active, setActive] = useState(0)
  if (!images?.length) return null
  if (images.length === 1) return (
    <div className="aspect-[16/9] overflow-hidden">
      <img src={images[0]} alt={title} className="w-full h-full object-cover" loading="eager" decoding="async" />
    </div>
  )
  return (
    <div>
      <div className="aspect-[16/9] overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.img key={active} src={images[active]} alt={`${title} ${active + 1}`}
            className="w-full h-full object-cover absolute inset-0" loading="eager" decoding="async"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} />
        </AnimatePresence>
        <button onClick={() => setActive(a => (a - 1 + images.length) % images.length)}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#0a0a0a]/70 flex items-center justify-center text-white hover:bg-[#0a0a0a] transition-colors" aria-label="Previous">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <button onClick={() => setActive(a => (a + 1) % images.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#0a0a0a]/70 flex items-center justify-center text-white hover:bg-[#0a0a0a] transition-colors" aria-label="Next">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <span className="absolute bottom-3 right-3 label-text bg-[#0a0a0a]/70 px-2 py-1">{active + 1} / {images.length}</span>
      </div>
      <div className="flex gap-1 mt-1">
        {images.map((img, i) => (
          <button key={i} onClick={() => setActive(i)}
            className={`flex-1 aspect-[4/3] overflow-hidden transition-opacity ${i === active ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}>
            <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
          </button>
        ))}
      </div>
    </div>
  )
}

const WaIcon = () => (
  <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

export default function Portfolio({ lang = 'en' }) {
  const { ref, inView } = useInView({ threshold: 0.05, triggerOnce: true })
  const [selected, setSelected] = useState(null)
  const [scrollPos, setScrollPos] = useState(0)
  const [activeGroup, setActiveGroup] = useState('all')
  const [activeSub, setActiveSub] = useState(null)
  const modalRef = useRef(null)
  const tx = t[lang].portfolio

  const openModal  = item => { setScrollPos(window.scrollY); setSelected(item); document.body.style.overflow = 'hidden' }
  const closeModal = () => { setSelected(null); document.body.style.overflow = ''; setTimeout(() => window.scrollTo({ top: scrollPos, behavior: 'instant' }), 80) }
  const handleGroup = id => { setActiveGroup(id); setActiveSub(null) }

  const groupCats = getGroupCats(activeGroup)
  const visible   = PROJECTS.filter(p => {
    if (groupCats === null) return true
    if (activeSub) return p.category === activeSub
    return groupCats.includes(p.category)
  })

  const featured   = visible.find(p => p.isFeatured) || null
  const grid       = visible.filter(p => !(p.isFeatured && p.id === featured?.id && activeGroup === 'all' && !activeSub))
  const showFeat   = !!featured && !activeSub && activeGroup === 'all'
  const total      = (showFeat ? 1 : 0) + grid.length
  const currentGrp = GROUPS.find(g => g.id === activeGroup)

  return (
    <section id="works" ref={ref} onKeyDown={e => e.key === 'Escape' && closeModal()} className="bg-[#0a0a0a]">

      <div className="container-custom pt-12 md:pt-16 lg:pt-20 pb-0">
        {/* Heading */}
        <motion.div className="flex items-end justify-between mb-8 md:mb-10"
          initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}>
          <AnimatePresence mode="wait">
            <motion.h2 key={lang} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
              className="font-display text-3xl sm:text-4xl md:text-5xl font-medium text-white">
              {tx.heading}
            </motion.h2>
          </AnimatePresence>
          <span className="label-text">{tx.projects(total)}</span>
        </motion.div>

        {/* Row 1: Group tabs */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center gap-0 overflow-x-auto scrollbar-hide border-b border-neutral-900 -mb-px"
          role="tablist" aria-label="Filter by group">
          {GROUPS.map(g => (
            <button key={g.id} role="tab" aria-selected={activeGroup === g.id}
              onClick={() => handleGroup(g.id)}
              className={`relative flex-shrink-0 px-5 py-3.5 label-text transition-colors duration-200 whitespace-nowrap
                ${activeGroup === g.id ? 'text-white' : 'text-neutral-600 hover:text-neutral-300'}`}>
              {g.label}
              {activeGroup === g.id && (
                <motion.span layoutId="grp-ul" className="absolute bottom-0 left-0 right-0 h-px bg-white"
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }} />
              )}
            </button>
          ))}
        </motion.div>

        {/* Row 2: Subcategory chips */}
        <AnimatePresence>
          {activeGroup !== 'all' && currentGrp?.subcategories.length > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden">
              <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
                <button onClick={() => setActiveSub(null)}
                  className={`flex-shrink-0 px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] font-medium border transition-colors whitespace-nowrap
                    ${!activeSub ? 'border-white text-white' : 'border-neutral-800 text-neutral-600 hover:border-neutral-600 hover:text-neutral-300'}`}>
                  All {currentGrp.label}
                </button>
                {currentGrp.subcategories.map(sub => (
                  <button key={sub.id} onClick={() => setActiveSub(prev => prev === sub.id ? null : sub.id)}
                    className={`flex-shrink-0 px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] font-medium border transition-colors whitespace-nowrap
                      ${activeSub === sub.id ? 'border-white text-white' : 'border-neutral-800 text-neutral-600 hover:border-neutral-600 hover:text-neutral-300'}`}>
                    {sub.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Featured full-bleed */}
      <AnimatePresence mode="wait">
        {showFeat && featured && (
          <motion.div key="featured" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="mt-px">
            <div className="relative w-full aspect-[16/9] overflow-hidden group cursor-pointer" onClick={() => openModal(featured)}>
              <img src={featured.images[0]} alt={featured.title}
                className="w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-[1.03]" loading="eager" decoding="async" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 lg:p-14 flex items-end justify-between">
                <div>
                  <p className="label-text text-neutral-400 mb-1">{featured.category} — {featured.year}</p>
                  <h3 className="font-display text-2xl md:text-4xl lg:text-5xl font-medium text-white">{featured.title}</h3>
                </div>
                <div className="hidden sm:flex flex-col items-end gap-1">
                  <span className="label-text text-neutral-400">{tx.open}</span>
                  {featured.images.length > 1 && <span className="label-text text-neutral-600">{tx.views(featured.images.length)}</span>}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      <AnimatePresence mode="wait">
        <motion.div key={`${activeGroup}-${activeSub}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }} transition={{ duration: 0.35 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-neutral-900 mt-px">
          {grid.map((item, idx) => (
            <FadeIn key={item.id} delay={idx * 0.03} className="bg-[#0a0a0a] group cursor-pointer overflow-hidden">
              <div onClick={() => openModal(item)} className="relative overflow-hidden aspect-[16/9]">
                <img src={item.images[0]} alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-[1s] group-hover:scale-[1.04]"
                  loading={idx < 3 ? 'eager' : 'lazy'} decoding="async" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {item.images.length > 1 && (
                  <span className="absolute top-3 right-3 label-text bg-[#0a0a0a]/70 px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {tx.views(item.images.length)}
                  </span>
                )}
              </div>
              <div className="px-4 py-3 md:px-5 md:py-4 border-t border-neutral-900">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] md:text-xs font-medium text-white truncate">{item.title}</p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="label-text">{item.year}</span>
                    <button onClick={() => openModal(item)}
                      className="label-text px-2.5 py-1 border border-neutral-800 hover:border-neutral-500 hover:text-white transition-colors whitespace-nowrap"
                      aria-label={`View details for ${item.title}`}>
                      {tx.open.replace(' →', '')} →
                    </button>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
          {grid.length === 0 && (
            <div className="col-span-full py-24 flex flex-col items-center gap-3 text-center">
              <p className="text-neutral-600 text-sm">No projects in this category yet.</p>
              <button onClick={() => { setActiveGroup('all'); setActiveSub(null) }}
                className="label-text text-neutral-500 hover:text-white transition-colors underline underline-offset-4">
                View all work
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-[#0a0a0a]/96 backdrop-blur-sm overflow-y-auto" onClick={closeModal}>
            <div className="min-h-full flex items-start justify-center p-4 py-8 md:p-10 md:py-14">
              <motion.div ref={modalRef} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full max-w-3xl bg-[#0f0f0f]" onClick={e => e.stopPropagation()}>
                <button onClick={closeModal}
                  className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-white transition-colors" aria-label="Close">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
                </button>
                <ImageGallery images={selected.images} title={selected.title} />
                <div className="p-6 sm:p-8 md:p-10">
                  <div className="flex flex-wrap gap-x-8 gap-y-2 mb-6">
                    {[{label: tx.type, value: selected.type}, {label: tx.year, value: selected.year}, {label: tx.category, value: selected.category}].map(m => (
                      <div key={m.label}><p className="label-text mb-1">{m.label}</p><p className="text-xs text-white">{m.value}</p></div>
                    ))}
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl font-medium text-white mb-4">{selected.title}</h2>
                  <p className="text-neutral-500 leading-relaxed text-sm max-w-xl">{selected.description}</p>
                  <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-neutral-900">
                    <a href={`https://wa.me/251923814125?text=Hello%20Awra%20Designs%2C%20I%27m%20interested%20in%20a%20project%20similar%20to%20your%20${encodeURIComponent(selected.title)}.`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-2.5 bg-white text-[#0a0a0a] text-xs font-medium tracking-wide hover:bg-cream transition-colors">
                      <WaIcon />{tx.whatsappModal}
                    </a>
                    <button onClick={() => { closeModal(); setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 250) }}
                      className="px-6 py-2.5 border border-neutral-800 text-neutral-400 text-xs font-medium tracking-wide hover:border-neutral-600 hover:text-white transition-colors">
                      {tx.enquiry}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
