import { useState, useEffect, useCallback } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { User, LogOut, ShoppingCart, Wifi } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isOpen, setIsOpen] = useState(true) // restaurant open status
  const { isAuthenticated, user, logout } = useAuth()
  const { itemCount, openCart } = useCart()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  // Check if restaurant is open (best-effort via /api/health, fallback to always showing)
  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/health', { signal: controller.signal })
      .then((res) => {
        if (res.ok) return res.json()
        throw new Error('not ok')
      })
      .then((data) => {
        // If the API returns an `open` field, use it; otherwise default true
        if (typeof data.open === 'boolean') {
          setIsOpen(data.open)
        }
      })
      .catch(() => {
        // On any error, just show the badge (assume open)
        setIsOpen(true)
      })
    return () => controller.abort()
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const linkClass = ({ isActive }) =>
    `relative transition-colors duration-200 hover:text-[#e94560] ${
      isActive
        ? 'text-[#e94560] font-semibold'
        : 'text-gray-300'
    }`

  // Active route indicator (underline dot)
  const activeLinkClass = ({ isActive }) =>
    `relative transition-colors duration-200 hover:text-[#e94560] ${
      isActive
        ? 'text-[#e94560] font-semibold after:content-[""] after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-[#e94560]'
        : 'text-gray-300'
    }`

  // Mobile link class: same styling + 44px min touch target + left highlight bar
  const mobileLinkClass = ({ isActive }) =>
    `min-h-[44px] flex items-center px-3 rounded-lg transition-all duration-200 hover:text-[#e94560] hover:bg-white/5 ${
      isActive
        ? 'text-[#e94560] font-semibold bg-[#e94560]/5 border-l-2 border-[#e94560]'
        : 'text-gray-300 border-l-2 border-transparent'
    }`

  const closeMobile = useCallback(() => setMobileOpen(false), [])

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0f0f0f]/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Order Online badge */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-2" onClick={closeMobile}>
              <picture>
                <source srcSet="/images/logo.webp" type="image/webp" />
                <img src="/images/logo.webp" alt="Nimo's Limerick - Takeaway in Knocklong" className="h-10 w-auto" width="40" height="40" loading="eager" fetchPriority="high" />
              </picture>
              <span className="text-white text-xl font-bold tracking-tight">Nimo's</span>
            </Link>

            {isOpen && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold uppercase tracking-wide">
                <Wifi className="w-3 h-3" />
                Order Online
              </span>
            )}
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink to="/menu" className={activeLinkClass}>Menu</NavLink>
            <NavLink to="/deals" className={activeLinkClass}>Deals</NavLink>
            <a
              href="/#hours"
              className="text-gray-300 transition-colors duration-200 hover:text-[#e94560]"
            >
              Hours
            </a>
            <NavLink to="/contact" className={activeLinkClass}>Contact</NavLink>

            {/* Auth: Account or Login */}
            {isAuthenticated ? (
              <NavLink
                to="/account"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 transition-colors duration-200 hover:text-[#e94560] ${isActive ? 'text-[#e94560] font-semibold' : 'text-gray-300'}`
                }
              >
                <User className="w-4 h-4" />
                <span className="max-w-[80px] truncate">{user?.name?.split(' ')[0] || 'Account'}</span>
              </NavLink>
            ) : (
              <NavLink to="/login" className={activeLinkClass}>
                Login
              </NavLink>
            )}

            {/* Cart button */}
            <button
              onClick={openCart}
              className="relative p-2 text-gray-300 hover:text-[#e94560] transition-colors duration-200"
              aria-label="Open cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span aria-live="polite" aria-atomic="true" className="absolute -top-1 -right-1 bg-[#e94560] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            <NavLink
              to="/menu"
              className="ml-2 inline-flex items-center px-5 py-2 rounded-lg bg-[#e94560] text-white font-semibold text-sm hover:bg-[#d63a54] transition-colors duration-200 shadow-lg shadow-[#e94560]/25"
            >
              Order Now
            </NavLink>
          </div>

          {/* Mobile: Cart + Hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Mobile Order Online badge (compact) */}
            {isOpen && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold uppercase tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Open
              </span>
            )}
            <button
              onClick={openCart}
              className="relative p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-300 hover:text-[#e94560] transition-colors duration-200"
              aria-label="Open cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#e94560] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>
            <button
              className="text-gray-300 hover:text-white p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMobile}
        aria-hidden="true"
      />

      {/* Mobile menu - slide in from right */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-label="Mobile navigation"
        aria-modal={mobileOpen}
        className={`fixed top-0 right-0 bottom-0 w-[280px] max-w-[80vw] z-50 md:hidden bg-[#0f0f0f] border-l border-white/5 shadow-2xl transition-transform duration-300 ease-out ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Mobile menu header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <span className="text-white font-bold text-lg">Menu</span>
          <button
            onClick={closeMobile}
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mobile menu links */}
        <div className="flex flex-col gap-1 px-4 py-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 70px)' }}>
          <NavLink to="/menu" className={mobileLinkClass} onClick={closeMobile}>Menu</NavLink>
          <NavLink to="/deals" className={mobileLinkClass} onClick={closeMobile}>Deals</NavLink>
          <a
            href="/#hours"
            className="min-h-[44px] flex items-center px-3 rounded-lg text-gray-300 hover:text-[#e94560] hover:bg-white/5 transition-all duration-200 border-l-2 border-transparent"
            onClick={closeMobile}
          >
            Hours
          </a>
          <NavLink to="/contact" className={mobileLinkClass} onClick={closeMobile}>Contact</NavLink>

          <div className="my-2 border-t border-white/5" />

          {/* Auth: Account or Login (mobile) */}
          {isAuthenticated ? (
            <>
              <NavLink
                to="/account"
                className={({ isActive }) =>
                  `min-h-[44px] flex items-center gap-2 px-3 rounded-lg transition-all duration-200 hover:text-[#e94560] hover:bg-white/5 ${
                    isActive
                      ? 'text-[#e94560] font-semibold bg-[#e94560]/5 border-l-2 border-[#e94560]'
                      : 'text-gray-300 border-l-2 border-transparent'
                  }`
                }
                onClick={closeMobile}
              >
                <User className="w-5 h-5" />
                My Account
              </NavLink>
              <button
                onClick={() => { logout(); closeMobile(); }}
                className="min-h-[44px] flex items-center gap-2 px-3 rounded-lg text-gray-300 hover:text-red-400 hover:bg-white/5 transition-all duration-200 text-left border-l-2 border-transparent"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </>
          ) : (
            <NavLink to="/login" className={mobileLinkClass} onClick={closeMobile}>
              Login
            </NavLink>
          )}

          {/* Cart (mobile) */}
          <button
            onClick={() => { openCart(); closeMobile(); }}
            className="min-h-[44px] flex items-center gap-2 px-3 rounded-lg text-gray-300 hover:text-[#e94560] hover:bg-white/5 transition-all duration-200 text-left border-l-2 border-transparent"
          >
            <ShoppingCart className="w-5 h-5" />
            Cart
            {itemCount > 0 && (
              <span className="bg-[#e94560] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>

          <div className="my-2 border-t border-white/5" />

          <NavLink
            to="/menu"
            className="mt-1 inline-flex items-center justify-center px-5 py-3 rounded-lg bg-[#e94560] text-white font-semibold text-sm hover:bg-[#d63a54] transition-colors duration-200 min-h-[44px]"
            onClick={closeMobile}
          >
            Order Now
          </NavLink>
        </div>
      </div>
    </nav>
  )
}
