import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Instagram, Facebook, Music, Clock, Smartphone, Mail, Send, CheckCircle, Star, Ghost } from 'lucide-react'
import { toast } from '../utils/toast'
import { siteInfo } from '../data/siteInfo'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const currentYear = new Date().getFullYear()

  const handleNewsletterSubmit = (e) => {
    e.preventDefault()
    if (!email.trim()) return

    setSubmitting(true)
    // Simulate a brief delay for UX
    setTimeout(() => {
      setSubscribed(true)
      setSubmitting(false)
      setEmail('')
      toast.success('Thanks for subscribing! You\'ll hear from us soon.')
      // Reset subscribed state after 5 seconds so the form reappears
      setTimeout(() => setSubscribed(false), 5000)
    }, 600)
  }

  return (
    <footer className="bg-[#080808] border-t border-white/5" role="contentinfo">
      {/* Newsletter banner */}
      <div className="bg-gradient-to-r from-[#e94560]/10 via-[#e94560]/5 to-transparent border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#e94560]/10 flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6 text-[#e94560]" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Stay in the loop</h3>
                <p className="text-gray-400 text-sm">Get exclusive deals and updates delivered to your inbox.</p>
              </div>
            </div>

            {subscribed ? (
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                <CheckCircle className="w-5 h-5" />
                <span>You're subscribed!</span>
              </div>
            ) : (
              <form
                onSubmit={handleNewsletterSubmit}
                className="flex w-full md:w-auto"
                aria-label="Newsletter signup"
              >
                <label htmlFor="footer-email" className="sr-only">Email address</label>
                <input
                  id="footer-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 md:w-72 px-4 py-2.5 rounded-l-lg bg-white/5 border border-white/10 border-r-0 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-[#e94560]/50 focus:bg-white/[0.07] transition-colors"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-r-lg bg-[#e94560] text-white text-sm font-semibold hover:bg-[#d63a54] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
                >
                  {submitting ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <picture className="img-placeholder inline-block rounded">
                <source srcSet="/images/logo.webp" type="image/webp" />
                <img src="/images/logo.webp" alt="Nimo's Limerick - Takeaway in Knocklong" className="h-10 w-auto" loading="lazy" width="40" height="40" onLoad={(e) => e.currentTarget.classList.add('loaded')} />
              </picture>
              <span className="text-white text-xl font-bold">Nimo's</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              Limerick's favourite spot for pizza, burgers, and freshly made takeaway. Quality food, fast delivery.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3">
              <a
                href={siteInfo.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#e94560]/20 hover:text-[#e94560] transition-all duration-200"
                aria-label="Follow us on Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={siteInfo.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#e94560]/20 hover:text-[#e94560] transition-all duration-200"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={siteInfo.social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#e94560]/20 hover:text-[#e94560] transition-all duration-200"
                aria-label="Follow us on TikTok"
              >
                <Music className="w-4 h-4" />
              </a>
              <a
                href={siteInfo.social.snapchat}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#FFFC00]/20 hover:text-[#FFFC00] transition-all duration-200"
                aria-label="Follow us on Snapchat"
              >
                <Ghost className="w-4 h-4" />
              </a>
            </div>

            {/* Review badge */}
            {siteInfo.reviews?.restaurantGuru && (
              <a
                href={siteInfo.reviews.restaurantGuru.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-[#e94560]/30 transition-all duration-200 text-sm"
              >
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                <span className="text-white font-medium">{siteInfo.reviews.restaurantGuru.rating}</span>
                <span className="text-gray-400">on Restaurant Guru</span>
              </a>
            )}
          </div>

          {/* Quick Links */}
          <nav aria-label="Footer navigation">
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/menu" className="text-gray-400 hover:text-[#e94560] transition-colors">Menu</Link></li>
              <li><Link to="/deals" className="text-gray-400 hover:text-[#e94560] transition-colors">Deals</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-[#e94560] transition-colors">Contact</Link></li>
              <li><Link to="/takeaway-limerick" className="text-gray-400 hover:text-[#e94560] transition-colors">Takeaway Limerick</Link></li>
              <li><Link to="/pizza-delivery-limerick" className="text-gray-400 hover:text-[#e94560] transition-colors">Pizza Delivery Limerick</Link></li>
              <li><Link to="/best-takeaway-knocklong" className="text-gray-400 hover:text-[#e94560] transition-colors">Best Takeaway Knocklong</Link></li>
            </ul>
          </nav>

          {/* Opening Hours */}
          <div>
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#e94560]" />
              Opening Hours
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex justify-between gap-4">
                <span>Mon &ndash; Sat</span>
                <span className="text-gray-300">3:00 PM &ndash; 10:30 PM</span>
              </li>
              <li className="flex justify-between gap-4">
                <span>Sunday</span>
                <span className="text-gray-300">3:00 PM &ndash; 10:00 PM</span>
              </li>
              <li className="flex justify-between gap-4 pt-1 border-t border-white/5">
                <span>Delivery</span>
                <span className="text-gray-300">Thu &ndash; Sun</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <address className="not-italic">
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <a href={`tel:${siteInfo.phone}`} className="hover:text-[#e94560] transition-colors">
                    {siteInfo.phoneDisplay}
                  </a>
                </li>
                <li>
                  {siteInfo.address.street}<br />
                  {siteInfo.address.area}, {siteInfo.address.eircode}
                </li>
              </ul>
            </address>
          </div>

          {/* Download App */}
          <div>
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#e94560]" />
              Get Our App
            </h4>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Order faster, track deliveries, and unlock app-only deals.
            </p>
            <div className="flex flex-col gap-2">
              <a
                href="#"
                className="inline-flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-[#e94560]/30 hover:bg-white/[0.07] transition-all duration-200 group"
                aria-label="Download on the App Store"
              >
                <svg className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 leading-tight">Download on the</span>
                  <span className="text-sm text-white font-medium leading-tight">App Store</span>
                </div>
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-[#e94560]/30 hover:bg-white/[0.07] transition-all duration-200 group"
                aria-label="Get it on Google Play"
              >
                <svg className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.18 23.71c-.38-.22-.68-.64-.68-1.25V1.54C2.5.93 2.8.51 3.18.29l10.9 11.71-10.9 11.71zm14.12-8.5L5.22 22.2l9.81-9.81 2.27 2.82zm1.41-1.74L16 11.71l2.71-1.76 2.84 1.85c.5.32.5.85 0 1.18l-2.84 1.49zM5.22 1.8l12.08 6.99-2.27 2.82L5.22 1.8z"/>
                </svg>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 leading-tight">Get it on</span>
                  <span className="text-sm text-white font-medium leading-tight">Google Play</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 text-sm">
            <p className="text-gray-500">
              &copy; {currentYear} Nimo's Limerick. All rights reserved.
            </p>
            <span className="hidden sm:inline text-gray-600">|</span>
            <nav aria-label="Legal links" className="flex items-center gap-3">
              <Link to="/terms" className="text-gray-500 hover:text-[#e94560] transition-colors">Terms</Link>
              <Link to="/privacy" className="text-gray-500 hover:text-[#e94560] transition-colors">Privacy</Link>
            </nav>
          </div>

          <div className="flex items-center gap-5">
            <a
              href="https://instagram.com/nimoslimerick"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-[#e94560] transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="https://facebook.com/nimoslimerick"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-[#e94560] transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="https://tiktok.com/@nimoslimerick"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-[#e94560] transition-colors"
              aria-label="TikTok"
            >
              <Music className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
