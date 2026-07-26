import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import t from '../utils/translations'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// ── Static fallback (shown until API responds or if it fails) ─────────────────
const FALLBACK_POSTS = [
  {
    id: 1,
    image: '/images/Blog/Blog 1.jpg',
    category: 'Interior Design', categoryAm: 'ኢንቴሪየር ዲዛይን',
    date: 'Dec 15, 2024', readTime: '5 min read', readTimeAm: '5 ደቂቃ',
    title: 'Top Interior Design Trends for 2026',
    titleAm: 'ለ2026 ምርጥ ኢንቴሪየር ዲዛይን ትሬንዶች',
    description: 'Sustainable materials, biophilic design, and smart integration — the ideas shaping interiors this year.',
    descriptionAm: 'ዘላቂ ቁሳቁሶች፣ ባዮፊሊክ ዲዛይን እና ዘመናዊ ቴክኖሎጂ — ዘንድሮ ኢንቴሪየሮችን የሚቀርጹ ሃሳቦች።',
    fullContent: `As we move through 2026, interior design is embracing new philosophies that prioritise sustainability, functionality, and personal well-being.\n\nSustainable materials are taking centre stage. Biophilic design remains strong. Colour palettes are shifting towards earthy tones and warm neutrals. The desire for craftsmanship is growing.`,
    fullContentAm: `በ2026 ኢንቴሪየር ዲዛይን ዘላቂነት፣ ተግባራዊነት እና ደህንነትን ቅደም ተከተል ወደሚሰጥ አቅጣጫ እየሄደ ነው።`,
  },
  {
    id: 2,
    image: '/images/Blog/Blog 2.jpg',
    category: 'Architecture', categoryAm: 'አርክቴክቸር',
    date: 'Dec 10, 2024', readTime: '8 min read', readTimeAm: '8 ደቂቃ',
    title: 'Architectural Planning in Ethiopia: A Practical Guide',
    titleAm: 'በኢትዮጵያ የአርክቴክቸር ዕቅድ — ተግባራዊ መመሪያ',
    description: 'Navigating permits, zoning, and local building codes for your next project in Addis Ababa.',
    descriptionAm: 'ለሚቀጥለው ፕሮጀክትዎ በአዲስ አበባ ፈቃዶችን፣ ዞኒንግን፣ እና የግንባታ ደንቦችን ለማለፍ።',
    fullContent: `Architectural planning in Ethiopia requires careful navigation of local regulations, cultural considerations, and environmental factors.\n\nBefore beginning any project, you will need permits from relevant authorities. The approval timeline typically runs four to eight weeks for standard projects.`,
    fullContentAm: `በኢትዮጵያ የአርክቴክቸር ዕቅድ ውጤታማ ለመሆን የአካባቢ ደንቦችን ማወቅ ያስፈልጋል።`,
  },
  {
    id: 3,
    image: '/images/Blog/Blog 3.jpg',
    category: 'Design Tips', categoryAm: 'የዲዛይን ምክሮች',
    date: 'Dec 5, 2024', readTime: '6 min read', readTimeAm: '6 ደቂቃ',
    title: 'How Colour Shapes the Spaces We Live In',
    titleAm: 'ቀለም የምንኖርባቸውን ቦታዎች እንዴት ይቀርጻል',
    description: 'The psychology behind colour choices — and how to use them intentionally in your home or office.',
    descriptionAm: 'ከቀለም ምርጫ ጀርባ ያለው ሳይኮሎጂ — እና ቤትዎ ወይም ቢሮዎ ውስጥ ሆን ብለው ለመጠቀም።',
    fullContent: `Colour psychology is one of the quieter tools in interior design. Blue promotes calm — ideal for bedrooms. Yellow brings energy — suited to kitchens. The most important principle is consistency.`,
    fullContentAm: `የቀለም ሳይኮሎጂ ኢንቴሪየር ዲዛይን ውስጥ ዝምብሎ ሆኖ ከፍተኛ ተፅዕኖ ያሳድራሉ።`,
  },
]

// Normalise API post → local shape
function toPost(p) {
  return {
    id: p.id,
    image: p.coverImage || '/images/Blog/Blog 1.jpg',
    category: p.category,
    date: p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
    readTime: p.readTime || '',
    title: p.title,
    description: p.excerpt || '',
    fullContent: p.content || '',
  }
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

export default function Blog({ lang = 'en' }) {
  const { ref, inView } = useInView({ threshold: 0.05, triggerOnce: true })
  const [posts, setPosts] = useState(FALLBACK_POSTS)
  const [selected, setSelected] = useState(null)
  const [scrollPos, setScrollPos] = useState(0)
  const [copyDone, setCopyDone] = useState(false)

  // Fetch live posts from backend; keep fallback until/if it responds
  useEffect(() => {
    fetch(`${API_URL}/blog?limit=10`)
      .then(r => { if (!r.ok) throw new Error('not ok'); return r.json() })
      .then(d => {
        if (d.success && Array.isArray(d.data) && d.data.length > 0) {
          setPosts(d.data.map(toPost))
        }
      })
      .catch(() => {/* keep fallback */})
  }, [])

  const tx = t[lang]?.blog ?? { heading: 'Insights' }

  const getTitle = p => lang === 'am' ? (p.titleAm || p.title) : p.title
  const getDesc  = p => lang === 'am' ? (p.descriptionAm || p.description) : p.description
  const getCat   = p => lang === 'am' ? (p.categoryAm || p.category) : p.category
  const getRead  = p => lang === 'am' ? (p.readTimeAm || p.readTime) : p.readTime
  const getBody  = p => lang === 'am' ? (p.fullContentAm || p.fullContent) : p.fullContent

  const openPost  = post => { setScrollPos(window.scrollY); setSelected(post); document.body.style.overflow = 'hidden' }
  const closePost = () => { setSelected(null); document.body.style.overflow = ''; setTimeout(() => window.scrollTo({ top: scrollPos, behavior: 'instant' }), 80); setCopyDone(false) }

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape' && selected) closePost() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [selected])

  const shareUrl = () => `${window.location.origin}${window.location.pathname}#blog-${selected?.id ?? ''}`
  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl()).then(() => { setCopyDone(true); setTimeout(() => setCopyDone(false), 2000) }).catch(() => {})
  }

  return (
    <section id="blog" ref={ref} className="bg-[#0a0a0a]">
      <hr className="border-0 border-t border-neutral-800" />
      <div className="section-padding">
        <div className="container-custom">
          <motion.div className="flex items-end justify-between mb-12 md:mb-16"
            initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}>
            <div>
              <p className="label-text mb-3">Journal</p>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium text-white">Insights</h2>
            </div>
            <span className="label-text">{posts.length} Articles</span>
          </motion.div>

          <div className="divide-y divide-neutral-900">
            {posts.map((post, i) => (
              <FadeIn key={post.id} delay={i * 0.06}>
                <article className="group grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 md:gap-16 py-8 md:py-10 cursor-pointer" onClick={() => openPost(post)}>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <span className="label-text">{getCat(post)}</span>
                      {post.date && <><span className="label-text text-neutral-700">—</span><span className="label-text">{post.date}</span></>}
                      {getRead(post) && <><span className="label-text text-neutral-700">·</span><span className="label-text">{getRead(post)}</span></>}
                    </div>
                    <h3 className="font-display text-xl sm:text-2xl md:text-3xl font-medium text-white leading-snug group-hover:text-neutral-300 transition-colors duration-300">{getTitle(post)}</h3>
                    <p className="text-neutral-500 text-sm leading-relaxed max-w-xl">{getDesc(post)}</p>
                    <span className="text-xs font-medium text-neutral-400 group-hover:text-white transition-colors duration-300 mt-1 flex items-center gap-1.5">
                      Read article
                      <svg className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="1.4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2 5h6M5 2l3 3-3 3" />
                      </svg>
                    </span>
                  </div>
                  <div className="w-full md:w-48 lg:w-56 aspect-[4/3] md:aspect-auto md:h-36 lg:h-40 overflow-hidden flex-shrink-0 bg-neutral-900">
                    <img src={post.image} alt={getTitle(post)} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" loading="lazy" decoding="async" />
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-[#0a0a0a]/96 backdrop-blur-sm overflow-y-auto" onClick={closePost}>
            <div className="min-h-full flex items-start justify-center p-4 py-8 md:p-10 md:py-14">
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full max-w-2xl bg-[#0f0f0f]" onClick={e => e.stopPropagation()}>
                <button onClick={closePost} className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-white transition-colors" aria-label="Close">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
                </button>
                <div className="aspect-[16/9] overflow-hidden">
                  <img src={selected.image} alt={getTitle(selected)} className="w-full h-full object-cover" loading="eager" decoding="async" />
                </div>
                <div className="p-6 sm:p-8 md:p-10">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-5">
                    <span className="label-text">{getCat(selected)}</span>
                    {selected.date && <><span className="label-text text-neutral-700">—</span><span className="label-text">{selected.date}</span></>}
                    {getRead(selected) && <><span className="label-text text-neutral-700">·</span><span className="label-text">{getRead(selected)}</span></>}
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-medium text-white leading-snug mb-6 pr-8">{getTitle(selected)}</h2>
                  <div className="text-neutral-400 text-sm sm:text-base leading-relaxed whitespace-pre-line border-t border-neutral-900 pt-6">{getBody(selected)}</div>
                  <div className="mt-8 pt-6 border-t border-neutral-900 flex flex-wrap items-center gap-3">
                    <span className="label-text mr-2">Share</span>
                    <button onClick={handleCopy}
                      className="flex items-center gap-2 px-4 py-2 border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-white text-xs font-medium tracking-wide transition-colors">
                      {copyDone ? 'Copied ✓' : 'Copy link'}
                    </button>
                    <a href={`https://wa.me/?text=${encodeURIComponent(getTitle(selected) + ' ' + shareUrl())}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-white text-xs font-medium tracking-wide transition-colors">
                      <img src="/images/whatsapp-color-svgrepo-com.svg" alt="" className="w-3.5 h-3.5" aria-hidden="true" />
                      WhatsApp
                    </a>
                  </div>
                  <p className="mt-6 label-text text-center">Press <kbd className="px-1.5 py-0.5 border border-neutral-800 text-neutral-400 font-mono not-italic">ESC</kbd> to close</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
