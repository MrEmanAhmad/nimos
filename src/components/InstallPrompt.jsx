import { useState, useEffect } from 'react'
import { X, Download } from 'lucide-react'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Don't show if user already dismissed or if already installed
    const dismissed = sessionStorage.getItem('pwa-install-dismissed')
    if (dismissed) return

    // Check if already in standalone mode (already installed)
    if (window.matchMedia('(display-mode: standalone)').matches) return
    if (window.navigator.standalone) return

    const handler = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      setDeferredPrompt(e)
      // Show banner after a short delay (don't interrupt immediately)
      setTimeout(() => setShowBanner(true), 3000)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setShowBanner(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowBanner(false)
    setDeferredPrompt(null)
    sessionStorage.setItem('pwa-install-dismissed', 'true')
  }

  if (!showBanner) return null

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-[60] mx-auto max-w-md animate-slide-up"
      role="alert"
    >
      <div className="bg-[#1a1a2e] border border-[#e94560]/30 rounded-2xl p-4 shadow-2xl shadow-black/50 flex items-center gap-3">
        <div className="shrink-0 w-10 h-10 bg-[#e94560]/20 rounded-xl flex items-center justify-center">
          <Download className="w-5 h-5 text-[#e94560]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold">Install Nimo's App</p>
          <p className="text-[#a0a0a0] text-xs mt-0.5">Quick ordering from your home screen</p>
        </div>
        <button
          onClick={handleInstall}
          className="shrink-0 bg-[#e94560] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#d13350] transition-colors min-h-[44px] min-w-[44px]"
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="shrink-0 p-2 text-[#a0a0a0] hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Dismiss install prompt"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
