import { useState, useEffect, lazy, Suspense } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import ProgressBar from './components/ProgressBar'
import Cursor from './components/Cursor'
import FloatingCTA from './components/FloatingCTA'
import LazySection from './components/LazySection'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import NotFound from './components/NotFound'
import Error from './components/Error'
import { ThemeProvider } from './context/ThemeContext'
import { throttle } from './utils/throttle'

const Portfolio    = lazy(() => import('./components/Portfolio'))
const About        = lazy(() => import('./components/About'))
const Testimonials = lazy(() => import('./components/Testimonials'))
const Contact      = lazy(() => import('./components/Contact'))
const Footer       = lazy(() => import('./components/Footer'))

const SCROLL_THROTTLE_MS = 100

function SectionFallback() {
  return (
    <div className="min-h-[300px] flex items-center justify-center">
      <div className="w-5 h-5 border border-neutral-800 border-t-neutral-600 rounded-full animate-spin" aria-hidden="true" />
    </div>
  )
}

function App() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [lang, setLang] = useState('en')

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60)
    const throttledScroll = throttle(handleScroll, SCROLL_THROTTLE_MS)
    window.addEventListener('scroll', throttledScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', throttledScroll)
  }, [])

  return (
    <ThemeProvider>
      <div id="main-content" className="min-h-screen bg-[#0a0a0a] dark:bg-[#0a0a0a] light:bg-gray-50 pb-[72px] lg:pb-0 text-white dark:text-white light:text-neutral-900">
        <Cursor />
        <ProgressBar />
        <PWAInstallPrompt lang={lang} />
        <FloatingCTA lang={lang} />
        <Navbar isScrolled={isScrolled} lang={lang} setLang={setLang} />
        <Hero lang={lang} />
        <Suspense fallback={<SectionFallback />}>
          <LazySection fallback={<SectionFallback />} rootMargin="300px">
            <Portfolio lang={lang} />
          </LazySection>
          <LazySection fallback={<SectionFallback />} rootMargin="300px">
            <About lang={lang} />
          </LazySection>
          <LazySection fallback={<SectionFallback />} rootMargin="300px">
            <Testimonials lang={lang} />
          </LazySection>
          <LazySection fallback={<SectionFallback />} rootMargin="300px">
            <Contact lang={lang} />
          </LazySection>
          <LazySection fallback={<SectionFallback />} rootMargin="300px">
            <Footer lang={lang} />
          </LazySection>
        </Suspense>
      </div>
    </ThemeProvider>
  )
}

export default App
