import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import t from '../utils/translations'
import { trackView, trackEvent } from '../lib/analytics'
import { FloorPlanFragment, SheetRef } from './ArchDetails'
import ProjectDetailModal from './ProjectDetailModal'
import ProjectComparison from './ProjectComparison'
import { useFavorites } from '../hooks/useFavorites'

function getProjectId(index) {
  return `AW-${String(index + 1).padStart(3, '0')}`
}

function PortfolioCursor({ visible }) {
  const [pos, setPos] = useState({ x: -100, y: -100 })

  useEffect(() => {
    const move = e => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', move, { passive: true })
    return () => window.removeEventListener('mousemove', move)
  }, [])

  return (
    <div
      className="fixed z-[9998] pointer-events-none select-none hidden md:flex items-center justify-center"
      style={{
        left: pos.x, top: pos.y,
        width: 52, height: 52,
        transform: 'translate(-50%, -50%)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.2s',
      }}
      aria-hidden
    >
      <div className="w-full h-full rounded-full border border-white/40 bg-black/30 backdrop-blur-sm flex items-center justify-center">
        <span className="text-[9px] uppercase tracking-[0.2em] text-white font-medium">VIEW</span>
      </div>
    </div>
  )
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

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
      { id: 'Gym',                               label: 'Gym' },
      { id: 'Steam & Sauna',                     label: 'Steam & Sauna' },
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

// Convert API group shape → internal GROUPS shape
function buildGroupsFromApi(apiGroups) {
  const allGroup = { id: 'all', label: 'All', subcategories: [] }
  const rest = apiGroups.map(g => ({
    id: g.label.toLowerCase().replace(/\s+/g, '-'),
    label: g.label,
    subcategories: (g.subcategories || []).map(s => ({ id: s, label: s })),
  }))
  return [allGroup, ...rest]
}

function getGroupCats(groupId, groups) {
  if (groupId === 'all') return null
  return groups.find(g => g.id === groupId)?.subcategories.map(s => s.id) || []
}

function FadeIn({ children, delay = 0, className = '', onMouseEnter, onMouseLeave }) {
  const { ref, inView } = useInView({ threshold: 0.05, triggerOnce: true })
  return (
    <motion.div ref={ref} className={className}
      onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}
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
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [detailProjectId, setDetailProjectId] = useState(null)
  const [scrollPos, setScrollPos] = useState(0)
  const [activeGroup, setActiveGroup] = useState('all')
  const [activeSub, setActiveSub] = useState(null)
  const [openDropdown, setOpenDropdown] = useState(null)
  const [projects, setProjects] = useState([])
  const [groups, setGroups] = useState(GROUPS)
  const [waNumber, setWaNumber] = useState('251923814125')
  const [cursorVisible, setCursorVisible] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [loading, setLoading] = useState(true)
  const modalRef = useRef(null)
  const tx = t[lang].portfolio
  const { favorites, toggleFavorite, isFavorite } = useFavorites()

  useEffect(() => {
    trackView('projects')
    setLoading(true)
    // Fetch settings for WhatsApp number
    fetch(`${API_URL}/settings`, { cache: 'no-store' })
      .then(r => { if (!r.ok) throw new Error('not ok'); return r.json() })
      .then(d => { if (d.success && d.data?.whatsapp_number) setWaNumber(d.data.whatsapp_number) })
      .catch(() => {})
    fetch(`${API_URL}/projects`, { cache: 'no-store' })
      .then(r => { if (!r.ok) throw new Error('not ok'); return r.json() })
      .then(d => {
        if (d.success && Array.isArray(d.data) && d.data.length > 0) {
          const apiProjects = d.data.map(p => {
            let images = []
            if (Array.isArray(p.galleryImages) && p.galleryImages.length) {
              images = p.galleryImages.filter(Boolean)
            } else if (typeof p.galleryImages === 'string' && p.galleryImages.trim()) {
              images = p.galleryImages.split(/(?=http)/).map(s => s.trim()).filter(Boolean)
            }
            if (!images.length && p.coverImage) images = [p.coverImage]
            return {
              id: p.id, title: p.title, category: p.category,
              filter: p.filter, images, year: p.year, type: p.type,
              description: p.description, isFeatured: p.isFeatured, client: p.client,
              services: Array.isArray(p.services) ? p.services
                : typeof p.services === 'string'
                  ? p.services.split(/\s{2,}|\n/).map(s => s.trim()).filter(Boolean)
                  : [],
            }
          })
          // API returned data — use it exclusively, no static fallback
          setProjects(apiProjects)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))

    // Fetch groups — fall back to hardcoded GROUPS if unavailable
    fetch(`${API_URL}/project-groups`)
      .then(r => { if (!r.ok) throw new Error('not ok'); return r.json() })
      .then(d => {
        if (d.success && Array.isArray(d.data) && d.data.length > 0) {
          setGroups(buildGroupsFromApi(d.data))
        }
      })
      .catch(() => {}) // silently keep GROUPS fallback
  }, [])

  const openModal  = item => {
    trackEvent('project_view', item.title, { projectId: item.id })
    setScrollPos(window.scrollY)
    setSelected(item)
    document.body.style.overflow = 'hidden'
    // Push a history entry so the browser back button can close the modal
    history.pushState({ modal: true }, '')
  }
  const closeModal = () => {
    setSelected(null)
    document.body.style.overflow = ''
    setTimeout(() => window.scrollTo({ top: scrollPos, behavior: 'instant' }), 80)
  }

  const openDetailModal = (projectId) => {
    setDetailProjectId(projectId)
    setDetailModalOpen(true)
  }
  const closeDetailModal = () => {
    setDetailModalOpen(false)
    setDetailProjectId(null)
  }

  // ESC key — document-level so it works regardless of focus
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape' && selected) closeModal() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [selected, scrollPos])

  // Mobile/tablet back button — fires when history entry is popped
  useEffect(() => {
    const onPop = () => { if (selected) closeModal() }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [selected, scrollPos])
  const handleGroup = id => { setActiveGroup(id); setActiveSub(null); setOpenDropdown(null) }

  const groupCats = getGroupCats(activeGroup, groups)
  const visible   = projects.filter(p => {
    if (groupCats === null) return true
    if (activeSub) return p.category === activeSub
    return groupCats.includes(p.category)
  })

  const featured   = visible.find(p => p.isFeatured) || null
  const grid       = visible.filter(p => !(p.isFeatured && p.id === featured?.id && activeGroup === 'all' && !activeSub))
  const showFeat   = !!featured && !activeSub && activeGroup === 'all'
  const total      = (showFeat ? 1 : 0) + grid.length

  return (
    <section id="works" ref={ref} className="bg-[#0a0a0a] relative overflow-hidden">
      {/* Floor plan fragment — bottom right, very faint */}
      <FloorPlanFragment opacity={0.025} className="w-80 h-60 bottom-16 right-0 hidden lg:block" />
      <SheetRef code="A-101" title="WORKS" />

      <div className="container-custom pt-4 md:pt-6 lg:pt-8 pb-0">
        {/* Heading */}
        <motion.div className="flex items-end justify-between mb-8 md:mb-10"
          initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}>
          <AnimatePresence mode="wait">
            <motion.h2 key={lang} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
              className="font-display text-3xl sm:text-4xl md:text-5xl font-medium text-white">
              {tx.heading}
            </motion.h2>
          </AnimatePresence>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="text-xs text-neutral-500 hover:text-white transition-colors"
            >
              {showComparison ? 'Hide Compare' : 'Compare Projects'}
            </button>
            <span className="label-text">{tx.projects(total)}</span>
          </div>
        </motion.div>

        {/* Comparison Panel */}
        <AnimatePresence>
          {showComparison && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 border border-neutral-900 bg-neutral-950/50"
            >
              <ProjectComparison projects={visible} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Group tabs */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.1 }}
          className="relative -mb-px"
          role="tablist" aria-label="Filter by group">

          {/* ── MOBILE: vertical stack, subcategories expand inline ── */}
          <div className="md:hidden border border-neutral-900">
            {groups.map(g => (
              <div key={g.id} className="border-b border-neutral-900 last:border-b-0">
                {/* Main tab button */}
                <button
                  role="tab"
                  aria-selected={activeGroup === g.id}
                  onClick={() => {
                    if (g.subcategories.length > 0) {
                      setOpenDropdown(prev => prev === g.id ? null : g.id)
                      setActiveGroup(g.id); setActiveSub(null)
                    } else {
                      handleGroup(g.id)
                    }
                  }}
                  className={`w-full flex items-center justify-between px-5 py-4 text-[12px] uppercase tracking-[0.18em] font-medium transition-colors
                    ${activeGroup === g.id ? 'text-white bg-neutral-900/60' : 'text-neutral-500'}`}
                >
                  <span>{g.label}</span>
                  <div className="flex items-center gap-2">
                    {activeGroup === g.id && activeSub && (
                      <span className="text-[10px] text-neutral-500 normal-case tracking-normal">
                        {g.subcategories.find(s => s.id === activeSub)?.label}
                      </span>
                    )}
                    {g.subcategories.length > 0 && (
                      <svg
                        className={`w-3 h-3 transition-transform duration-200 ${openDropdown === g.id ? 'rotate-180 opacity-80' : 'opacity-30'}`}
                        viewBox="0 0 10 6" fill="none">
                        <path d="M1 1L5 5l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </button>

                {/* Inline subcategory list — expands below the tab */}
                {g.subcategories.length > 0 && openDropdown === g.id && (
                  <div className="bg-[#0d0d0d] border-t border-neutral-900">
                    <button
                      onClick={() => { handleGroup(g.id); setActiveSub(null); setOpenDropdown(null) }}
                      className={`w-full text-left px-8 py-3 text-[11px] uppercase tracking-[0.14em] font-medium transition-colors border-b border-neutral-900/50
                        ${activeGroup === g.id && !activeSub ? 'text-white' : 'text-neutral-600 active:text-white'}`}
                    >
                      All {g.label}
                    </button>
                    {g.subcategories.map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => { setActiveGroup(g.id); setActiveSub(sub.id); setOpenDropdown(null) }}
                        className={`w-full text-left px-8 py-3 text-[11px] uppercase tracking-[0.14em] font-medium transition-colors border-b border-neutral-900/50 last:border-b-0
                          ${activeSub === sub.id ? 'text-white bg-neutral-800/40' : 'text-neutral-600 active:text-white'}`}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ── DESKTOP: horizontal tabs with hover dropdowns ── */}
          <div className="hidden md:flex items-center border-b border-neutral-900 overflow-x-auto scrollbar-hide">
            {groups.map(g => (
              <div key={g.id} className="relative flex-shrink-0"
                onMouseEnter={() => g.subcategories.length > 0 && setOpenDropdown(g.id)}
                onMouseLeave={() => setOpenDropdown(null)}>
                <button role="tab" aria-selected={activeGroup === g.id}
                  onClick={() => handleGroup(g.id)}
                  className={`relative px-5 py-3.5 text-[13px] uppercase tracking-[0.18em] font-medium transition-colors duration-200 whitespace-nowrap flex items-center gap-1
                    ${activeGroup === g.id ? 'text-white' : 'text-neutral-600 hover:text-neutral-300'}`}>
                  {g.label}
                  {g.subcategories.length > 0 && (
                    <svg className={`w-2.5 h-2.5 transition-all duration-200 ${openDropdown === g.id ? 'opacity-80 rotate-180' : 'opacity-40'}`} viewBox="0 0 10 6" fill="none">
                      <path d="M1 1L5 5l4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {activeGroup === g.id && <motion.span layoutId="grp-ul" className="absolute bottom-0 left-0 right-0 h-px bg-white" transition={{ type: 'spring', stiffness: 400, damping: 35 }} />}
                </button>
                {g.subcategories.length > 0 && openDropdown === g.id && (
                  <div className="absolute top-full left-0 mt-1 z-50">
                    <div className="bg-[#111111] border border-neutral-800 py-1 min-w-[180px] shadow-2xl shadow-black/80">
                      <button onClick={() => { handleGroup(g.id); setActiveSub(null) }}
                        className={`w-full text-left px-4 py-2.5 text-[11px] uppercase tracking-[0.12em] font-medium whitespace-nowrap transition-colors ${activeGroup === g.id && !activeSub ? 'text-white bg-neutral-800/60' : 'text-neutral-500 hover:text-white hover:bg-neutral-800/40'}`}>
                        All {g.label}
                      </button>
                      {g.subcategories.map(sub => (
                        <button key={sub.id} onClick={() => { handleGroup(g.id); setActiveSub(sub.id); setOpenDropdown(null) }}
                          className={`w-full text-left px-4 py-2.5 text-[11px] uppercase tracking-[0.12em] font-medium whitespace-nowrap transition-colors ${activeGroup === g.id && activeSub === sub.id ? 'text-white bg-neutral-800/60' : 'text-neutral-500 hover:text-white hover:bg-neutral-800/40'}`}>
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

        </motion.div>
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
                  {/* Metadata chips — visible on hover */}
                  <div className="hidden sm:flex items-center gap-4 mt-3 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    {featured.type && (
                      <div className="border border-white/20 px-2.5 py-1">
                        <span className="label-text text-neutral-300">{featured.type}</span>
                      </div>
                    )}
                    {featured.client && (
                      <div className="border border-white/20 px-2.5 py-1">
                        <span className="label-text text-neutral-300">{featured.client}</span>
                      </div>
                    )}
                    <div className="border border-white/20 px-2.5 py-1">
                      <span className="label-text text-neutral-300">AW-001</span>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:flex flex-col items-end gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(featured.id) }}
                    className={`p-2 transition-colors ${isFavorite(featured.id) ? 'text-red-500' : 'text-neutral-600 hover:text-white'}`}
                    aria-label={isFavorite(featured.id) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <svg width="20" height="20" fill={isFavorite(featured.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
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
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px lg:gap-4 xl:gap-6 bg-neutral-900 lg:bg-transparent mt-px"
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-[#0a0a0a]">
                <div className="aspect-[16/9] bg-neutral-900 animate-pulse" />
                <div className="px-4 py-3 md:px-5 md:py-4 border-t border-neutral-900">
                  <div className="h-4 bg-neutral-800 rounded animate-pulse mb-2 w-3/4" />
                  <div className="h-3 bg-neutral-800 rounded animate-pulse w-1/4" />
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div key={`${activeGroup}-${activeSub}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.35 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px lg:gap-4 xl:gap-6 bg-neutral-900 lg:bg-transparent mt-px">
            {grid.map((item, idx) => (
              <FadeIn key={item.id} delay={idx * 0.03} className="bg-[#0a0a0a] group cursor-pointer overflow-hidden"
                onMouseEnter={() => setCursorVisible(true)} onMouseLeave={() => setCursorVisible(false)}>
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
                    <p className="text-[13px] md:text-sm font-medium text-white truncate">{item.title}</p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id) }}
                        className={`p-1.5 transition-colors ${isFavorite(item.id) ? 'text-red-500' : 'text-neutral-600 hover:text-white'}`}
                        aria-label={isFavorite(item.id) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <svg width="16" height="16" fill={isFavorite(item.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </button>
                      <span className="label-text">{item.year}</span>
                      <button onClick={() => openModal(item)}
                        className="label-text px-2.5 py-1 border border-neutral-800 hover:border-neutral-500 hover:text-white transition-colors whitespace-nowrap"
                        aria-label={`View details for ${item.title}`}>
                        {tx.open.replace(' →', '')} →
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="label-text text-neutral-600">{getProjectId(idx)}</span>
                    {item.type && <><span className="label-text text-neutral-800">·</span><span className="label-text text-neutral-600 truncate">{item.type}</span></>}
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
        )}
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
                  className="absolute top-4 right-4 z-20 w-9 h-9 flex items-center justify-center bg-[#0a0a0a]/80 hover:bg-[#0a0a0a] text-neutral-300 hover:text-white transition-colors rounded-full border border-neutral-700" aria-label="Close">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                </button>
                <ImageGallery images={selected.images} title={selected.title} />
                <div className="p-6 sm:p-8 md:p-10">
                  {/* Project ID + status row */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="label-text text-neutral-600">{getProjectId(projects.indexOf(selected))}</span>
                    <span className="label-text text-green-600 border border-green-900/60 px-2 py-0.5">Completed</span>
                  </div>

                  {/* Title */}
                  <h2 className="font-display text-2xl sm:text-3xl font-medium text-white mb-6">{selected.title}</h2>

                  {/* Metadata grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 mb-6 pb-6 border-b border-neutral-900">
                    {[
                      { label: tx.type,      value: selected.type },
                      { label: tx.year,      value: selected.year },
                      { label: tx.category,  value: selected.category },
                      { label: 'Client',     value: selected.client || '—' },
                      { label: 'Project ID', value: getProjectId(projects.indexOf(selected)) },
                      { label: 'Status',     value: 'Completed' },
                    ].map(m => m.value && (
                      <div key={m.label}>
                        <p className="label-text mb-1 text-neutral-600">{m.label}</p>
                        <p className="text-xs text-white">{m.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Description */}
                  <p className="text-neutral-500 leading-relaxed text-sm mb-6">{selected.description}</p>

                  {/* Services */}
                  {selected.services?.length > 0 && (
                    <div className="mb-6 pb-6 border-b border-neutral-900">
                      <p className="label-text mb-3 text-neutral-600">Services</p>
                      <div className="flex flex-wrap gap-2">
                        {selected.services.map((s, i) => (
                          <span key={i} className="label-text border border-neutral-800 px-2.5 py-1 text-neutral-400">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Design Timeline */}
                  <div className="mb-6 pb-6 border-b border-neutral-900">
                    <p className="label-text mb-4 text-neutral-600">Design Process</p>
                    <div className="flex items-center gap-0">
                      {['Concept', 'Planning', 'Design', 'Viz', 'Delivery'].map((step, i, arr) => (
                        <span key={step} className="contents">
                          <div className="flex flex-col items-center flex-shrink-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
                            <p className="text-[9px] uppercase tracking-[0.08em] text-neutral-600 mt-1.5 whitespace-nowrap">{step}</p>
                          </div>
                          {i < arr.length - 1 && <div className="flex-1 h-px bg-neutral-800 -mt-3" />}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-0">
                    <a href={`https://wa.me/${waNumber}?text=Hello%20Awra%20Designs%2C%20I%27m%20interested%20in%20a%20project%20similar%20to%20your%20${encodeURIComponent(selected.title)}.`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-5 py-3 label-text border border-neutral-800 text-neutral-400 hover:border-neutral-500 hover:text-white transition-colors whitespace-nowrap">
                      <WaIcon />{tx.whatsappModal}
                    </a>
                    <button onClick={() => { closeModal(); setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 250) }}
                      className="px-5 py-3 label-text border border-neutral-800 border-l-0 text-neutral-400 hover:border-neutral-500 hover:text-white transition-colors whitespace-nowrap">
                      {tx.enquiry}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <PortfolioCursor visible={cursorVisible} />
      
      {/* Project Detail Modal */}
      <ProjectDetailModal 
        isOpen={detailModalOpen} 
        onClose={closeDetailModal} 
        projectId={detailProjectId} 
        lang={lang} 
      />
    </section>
  )
}
