import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const copy = {
  en: {
    title: 'Add to Home Screen',
    body: 'Install Awra Designs for a faster, app-like experience — works offline too.',
    install: 'Install',
    dismiss: 'Not now',
    // iOS-specific (no beforeinstallprompt on Safari)
    iosTitle: 'Install this app',
    iosBody: 'Tap the share icon below, then "Add to Home Screen".',
    iosGot: 'Got it',
  },
  am: {
    title: 'ወደ ቤት 画面 ጨምር',
    body: 'Awra Designs ን ጫን — ፈጣን እና ያለ ኢንተርኔት ይሰራል።',
    install: 'ጫን',
    dismiss: 'አይ',
    iosTitle: 'ያዲሱን ጫን',
    iosBody: 'ከዚህ በታች ያለውን የማጋሪያ ቁልፍ ተጫን, ከዚያም "Add to Home Screen" ምረጥ።',
    iosGot: 'ገባኝ',
  },
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream
}

function isInStandaloneMode() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
}

export default function PWAInstallPrompt({ lang = 'en' }) {
  const t = copy[lang] || copy.en

  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [show, setShow] = useState(false)
  const [ios, setIos] = useState(false)
  const [installing, setInstalling] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    // Already installed or running as standalone — don't show
    if (isInStandaloneMode()) return

    // Check if user already dismissed within 7 days
    const dismissed = localStorage.getItem('pwa-prompt-dismissed')
    if (dismissed && Date.now() - Number(dismissed) < 7 * 24 * 60 * 60 * 1000) return

    if (isIOS()) {
      // Show iOS instructions after a short delay
      const id = setTimeout(() => setIos(true), 3000)
      return () => clearTimeout(id)
    }

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      // Small delay so the page finishes loading before the prompt appears
      setTimeout(() => setShow(true), 2500)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setInstalled(true)
      setShow(false)
      setDeferredPrompt(null)
    })

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    setInstalling(true)
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setInstalling(false)
    if (outcome === 'accepted') {
      setInstalled(true)
    }
    setShow(false)
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShow(false)
    setIos(false)
    localStorage.setItem('pwa-prompt-dismissed', String(Date.now()))
  }

  const visible = show || ios

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-20 lg:bottom-6 inset-x-4 mx-auto z-[70] max-w-sm"
          style={{ paddingLeft: 'env(safe-area-inset-left)', paddingRight: 'env(safe-area-inset-right)' }}
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.97 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          role="dialog"
          aria-modal="true"
          aria-label={ios ? t.iosTitle : t.title}
        >
          <div className="bg-[#161616] border border-neutral-800 p-4 shadow-2xl">
            {/* App identity row */}
            <div className="flex items-center gap-3 mb-3">
              <img
                src="/pwa-icon-192.svg"
                alt="Awra Designs"
                className="w-10 h-10 rounded-xl flex-shrink-0"
              />
              <div>
                <p className="text-white text-sm font-medium leading-tight">
                  {ios ? t.iosTitle : t.title}
                </p>
                <p className="text-neutral-500 text-xs leading-snug mt-0.5">
                  {ios ? t.iosBody : t.body}
                </p>
              </div>
            </div>

            {/* iOS share icon hint */}
            {ios && (
              <div className="flex items-center gap-1.5 mb-3 text-neutral-400">
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M9 12l3 3m0 0l3-3m-3 3V2.25" />
                </svg>
                <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                  Safari → Share → Add to Home Screen
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              {!ios && (
                <button
                  onClick={handleInstall}
                  disabled={installing}
                  className="flex-1 py-2 bg-white text-[#0a0a0a] text-xs font-medium tracking-wide hover:bg-[#f5f0eb] transition-colors disabled:opacity-50"
                >
                  {installing ? '…' : t.install}
                </button>
              )}
              <button
                onClick={handleDismiss}
                className={`py-2 text-xs text-neutral-500 hover:text-neutral-300 transition-colors tracking-wide ${ios ? 'flex-1 bg-neutral-800 hover:bg-neutral-700' : 'px-4'}`}
              >
                {ios ? t.iosGot : t.dismiss}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
