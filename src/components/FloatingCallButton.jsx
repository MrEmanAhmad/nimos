import { Phone } from 'lucide-react'
import { siteInfo } from '../data/siteInfo'

export default function FloatingCallButton() {
  return (
    <a
      href={`tel:${siteInfo.phone}`}
      aria-label={`Call Nimo's at ${siteInfo.phoneDisplay}`}
      title="Call us to order"
      className="fixed bottom-20 right-4 z-40 md:bottom-6 md:right-6 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-lg shadow-emerald-900/30 transition-all duration-200 hover:scale-105 active:scale-95 px-4 py-3 md:px-5 md:py-3.5 group"
    >
      <Phone className="w-5 h-5 animate-pulse group-hover:animate-none" />
      <span className="hidden sm:inline text-sm font-semibold tracking-wide">
        Call to Order
      </span>
    </a>
  )
}
