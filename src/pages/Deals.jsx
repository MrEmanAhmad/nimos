import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { deals } from '../data/deals';
import { useCart } from '../context/CartContext';
import SEOHead from '../components/SEOHead';
import {
  ShoppingCart,
  Tag,
  Percent,
  Gift,
  Star,
  ChevronRight,
  Clock,
  Share2,
  Check,
  Link as LinkIcon,
  BadgePercent,
  Flame,
  Users,
  Zap,
} from 'lucide-react';

// ─── Countdown Timer Hook ───────────────────────────────────────────────────
function useCountdown(expiresAt) {
  const calculateRemaining = useCallback(() => {
    if (!expiresAt) return null;
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      expired: false,
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }, [expiresAt]);

  const [remaining, setRemaining] = useState(calculateRemaining);

  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => setRemaining(calculateRemaining()), 1000);
    return () => clearInterval(interval);
  }, [expiresAt, calculateRemaining]);

  return remaining;
}

// ─── Countdown Display Component ────────────────────────────────────────────
function CountdownTimer({ expiresAt }) {
  const remaining = useCountdown(expiresAt);
  if (!remaining) return null;

  if (remaining.expired) {
    return (
      <div className="flex items-center gap-2 text-red-400 text-xs font-semibold">
        <Clock className="w-3.5 h-3.5" />
        <span>This deal has expired</span>
      </div>
    );
  }

  const segments = [];
  if (remaining.days > 0) segments.push({ value: remaining.days, label: 'd' });
  segments.push({ value: remaining.hours, label: 'h' });
  segments.push({ value: remaining.minutes, label: 'm' });
  segments.push({ value: remaining.seconds, label: 's' });

  return (
    <div className="flex items-center gap-2">
      <Clock className="w-3.5 h-3.5 text-[#f5a623] shrink-0" />
      <div className="flex items-center gap-1">
        {segments.map((seg) => (
          <span
            key={seg.label}
            className="bg-[#e94560]/10 text-[#e94560] font-mono font-bold text-xs px-1.5 py-0.5 rounded"
          >
            {String(seg.value).padStart(2, '0')}{seg.label}
          </span>
        ))}
      </div>
      <span className="text-[#e0e0e0]/50 text-xs">left</span>
    </div>
  );
}

// ─── Share Button Component ─────────────────────────────────────────────────
function ShareDealButton({ deal }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/deals#${deal.id}`;
    const shareData = {
      title: `${deal.name} - Nimo's Limerick`,
      text: `Check out this deal: ${deal.name} for just \u20AC${typeof deal.price === 'number' ? deal.price.toFixed(2) : deal.price}! ${deal.description}`,
      url: shareUrl,
    };

    // Try native Web Share API first
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User cancelled or share failed, fall through to clipboard
      }
    }

    // Fallback: copy link to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable: do nothing
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 text-[#e0e0e0]/50 hover:text-[#f5a623] text-xs transition-colors duration-200"
      aria-label={`Share ${deal.name}`}
      type="button"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-green-400" />
          <span className="text-green-400">Link copied!</span>
        </>
      ) : (
        <>
          <Share2 className="w-3.5 h-3.5" />
          <span>Share</span>
        </>
      )}
    </button>
  );
}

// ─── Value Proposition Badge ────────────────────────────────────────────────
function ValueBadge({ deal }) {
  if (!deal.originalPrice || !deal.price) return null;

  const percentOff = Math.round(((deal.originalPrice - deal.price) / deal.originalPrice) * 100);

  return (
    <span className="absolute -top-0 -right-0 bg-gradient-to-br from-[#e94560] to-[#d63050] text-white text-xs font-bold px-3 py-1.5 rounded-bl-xl rounded-tr-2xl shadow-lg shadow-[#e94560]/30 z-10">
      Save {percentOff}%
    </span>
  );
}

// ─── Deal Badge ─────────────────────────────────────────────────────────────
function DealBadge({ badge }) {
  if (!badge) return null;

  const badgeConfig = {
    'BEST SELLER': { icon: Flame, color: 'text-orange-400 bg-orange-500/15 border-orange-500/30' },
    'MATCH DAY': { icon: Zap, color: 'text-yellow-400 bg-yellow-500/15 border-yellow-500/30' },
    'FAMILY': { icon: Users, color: 'text-blue-400 bg-blue-500/15 border-blue-500/30' },
  };

  const config = badgeConfig[badge] || { icon: Star, color: 'text-purple-400 bg-purple-500/15 border-purple-500/30' };
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border ${config.color} uppercase tracking-wider`}>
      <Icon className="w-3 h-3" />
      {badge}
    </span>
  );
}

// ─── Order Now Button ───────────────────────────────────────────────────────
function OrderNowButton({ deal }) {
  const { addItem, openCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleOrderNow = () => {
    // Add the deal as a single cart item with real menu_item_id
    const dealMenuItem = {
      id: deal.menuItemId,
      name: deal.name,
      price: deal.price,
      category: 'Deals',
      description: deal.description,
    };

    addItem(dealMenuItem, 1, [], '');
    setAdded(true);
    openCart();

    setTimeout(() => setAdded(false), 2000);
  };

  // If the deal has expired, disable the button
  const isExpired = deal.expiresAt && new Date(deal.expiresAt).getTime() < Date.now();

  return (
    <button
      onClick={handleOrderNow}
      disabled={isExpired}
      className={`
        shrink-0 flex items-center gap-2 font-bold px-5 py-2.5 rounded-xl text-sm transition-all duration-300 min-h-[44px]
        ${isExpired
          ? 'bg-gray-600/20 text-gray-500 cursor-not-allowed'
          : added
            ? 'bg-green-500 text-white scale-105'
            : 'bg-[#e94560] hover:bg-[#d63050] text-white hover:scale-105 shadow-lg shadow-[#e94560]/20'
        }
      `}
      aria-label={isExpired ? 'Deal expired' : `Order ${deal.name}`}
      type="button"
    >
      {added ? (
        <>
          <Check className="w-4 h-4" />
          Added!
        </>
      ) : (
        <>
          <ShoppingCart className="w-4 h-4" />
          Order Now
        </>
      )}
    </button>
  );
}

// ─── Single Deal Card ───────────────────────────────────────────────────────
function DealCard({ deal }) {
  const isExpired = deal.expiresAt && new Date(deal.expiresAt).getTime() < Date.now();

  return (
    <div
      id={deal.id}
      className={`
        relative bg-[#1a1a2e] rounded-2xl border border-white/5 transition-all duration-300 overflow-hidden group flex flex-col
        ${isExpired
          ? 'opacity-60'
          : 'hover:border-[#f5a623]/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#f5a623]/10'
        }
      `}
    >
      {/* Value Proposition Badge */}
      <ValueBadge deal={deal} />

      {/* Card Header */}
      <div className="bg-gradient-to-r from-[#e94560]/10 to-[#f5a623]/10 p-6 pb-4 border-b border-white/5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white group-hover:text-[#f5a623] transition-colors">
              {deal.name}
            </h2>
            {deal.badge && (
              <div className="mt-2">
                <DealBadge badge={deal.badge} />
              </div>
            )}
          </div>
          {deal.savings && (
            <span className="shrink-0 bg-green-500/15 text-green-400 text-xs font-bold px-3 py-1.5 rounded-full border border-green-500/30 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              Save &euro;{typeof deal.savings === 'number' ? deal.savings.toFixed(2) : deal.savings}
            </span>
          )}
        </div>

        {deal.description && (
          <p className="text-[#e0e0e0]/70 text-sm">{deal.description}</p>
        )}

        {/* Countdown Timer */}
        {deal.expiresAt && (
          <div className="mt-3">
            <CountdownTimer expiresAt={deal.expiresAt} />
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Items Included */}
        {deal.items && deal.items.length > 0 && (
          <div className="mb-6 flex-1">
            <p className="text-[#e0e0e0]/60 text-xs uppercase tracking-wider font-semibold mb-3">
              What&apos;s Included
            </p>
            <ul className="space-y-2">
              {deal.items.map((item, i) => (
                <li key={i} className="flex items-center gap-2.5 text-[#e0e0e0]/70 text-sm">
                  <span className="w-2 h-2 bg-[#f5a623] rounded-full shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Promo Codes */}
        {deal.promoCodes && deal.promoCodes.length > 0 && (
          <div className="mb-5 bg-[#f5a623]/5 border border-[#f5a623]/20 rounded-xl px-4 py-3 flex items-center gap-3">
            <Gift className="w-5 h-5 text-[#f5a623] shrink-0" />
            <div>
              <p className="text-[#e0e0e0]/60 text-xs uppercase tracking-wider">Promo Code{deal.promoCodes.length > 1 ? 's' : ''}</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {deal.promoCodes.map((code) => (
                  <span key={code} className="text-[#f5a623] font-bold text-sm tracking-widest bg-[#f5a623]/10 px-2 py-0.5 rounded">
                    {code}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Legacy promoCode support */}
        {deal.promoCode && !deal.promoCodes && (
          <div className="mb-5 bg-[#f5a623]/5 border border-[#f5a623]/20 rounded-xl px-4 py-3 flex items-center gap-3">
            <Gift className="w-5 h-5 text-[#f5a623] shrink-0" />
            <div>
              <p className="text-[#e0e0e0]/60 text-xs uppercase tracking-wider">Promo Code</p>
              <p className="text-[#f5a623] font-bold text-sm tracking-widest">{deal.promoCode}</p>
            </div>
          </div>
        )}

        {/* Pricing + Actions */}
        <div className="pt-4 border-t border-white/5 mt-auto">
          <div className="flex items-end justify-between gap-3 mb-3">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-[#e94560]">
                  &euro;{typeof deal.price === 'number' ? deal.price.toFixed(2) : deal.price}
                </span>
                {deal.originalPrice && (
                  <span className="text-[#e0e0e0]/60 line-through text-base">
                    &euro;{typeof deal.originalPrice === 'number' ? deal.originalPrice.toFixed(2) : deal.originalPrice}
                  </span>
                )}
              </div>
            </div>
            <OrderNowButton deal={deal} />
          </div>

          {/* Secondary actions row */}
          <div className="flex items-center justify-between">
            <Link
              to={deal.menuCategory ? `/menu#${deal.menuCategory}` : '/menu'}
              className="flex items-center gap-1 text-[#e0e0e0]/50 hover:text-[#f5a623] text-xs transition-colors duration-200"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>View on menu</span>
            </Link>
            <ShareDealButton deal={deal} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Deals Page Schema ──────────────────────────────────────────────────────
function buildDealsSchema() {
  const BASE_URL = 'https://nimos.emanahmad.cloud';
  return {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    name: "Nimo's Limerick Deals & Specials",
    description: 'Combo deals and special offers on pizza, burgers, chicken and more.',
    url: `${BASE_URL}/deals`,
    numberOfItems: deals.length,
    itemListElement: deals.map((deal, index) => ({
      '@type': 'Offer',
      position: index + 1,
      name: deal.name,
      description: deal.description,
      price: deal.price,
      priceCurrency: 'EUR',
      url: `${BASE_URL}/deals#${deal.id}`,
      availability: deal.expiresAt && new Date(deal.expiresAt).getTime() < Date.now()
        ? 'https://schema.org/SoldOut'
        : 'https://schema.org/InStock',
      ...(deal.expiresAt ? { validThrough: deal.expiresAt } : {}),
    })),
  };
}

// ─── Main Deals Page ────────────────────────────────────────────────────────
export default function Deals() {
  const activeDeals = deals.filter(
    (d) => !d.expiresAt || new Date(d.expiresAt).getTime() > Date.now()
  );
  const expiredDeals = deals.filter(
    (d) => d.expiresAt && new Date(d.expiresAt).getTime() <= Date.now()
  );

  return (
    <>
      <SEOHead
        title="Deals & Specials - Save on Takeaway"
        description="Grab combo deals and save big at Nimo's Limerick. Pizza, burger & chicken meal deals at unbeatable prices. Fresh food, amazing value. Order online now!"
        keywords="takeaway deals limerick, pizza deals limerick, food deals knocklong, combo meals limerick, cheap takeaway limerick, meal deal limerick, food offers limerick"
        path="/deals"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Deals' },
        ]}
        extraSchema={buildDealsSchema()}
      />
      <div className="min-h-screen bg-[#080808]">
        {/* ===== HERO BANNER ===== */}
        <section className="relative pt-28 pb-16 px-4 bg-gradient-to-b from-[#1a1a2e] to-[#080808] overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-[#e94560]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#f5a623]/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#f5a623]/3 rounded-full blur-[100px]" />

          <div className="max-w-6xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-[#f5a623]/10 rounded-full px-4 py-1.5 mb-6 border border-[#f5a623]/20">
              <Percent className="w-4 h-4 text-[#f5a623]" />
              <span className="text-[#f5a623] text-sm font-semibold">Save More, Eat More</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Deals &amp; <span className="text-[#f5a623]">Specials</span>
            </h1>
            <p className="text-[#e0e0e0]/70 text-lg max-w-xl mx-auto mb-8">
              Grab our combo deals and save big. Fresh food, amazing value, every time.
            </p>

            {/* Quick stats */}
            <div className="flex flex-wrap justify-center gap-6 text-center">
              <div className="flex items-center gap-2">
                <BadgePercent className="w-5 h-5 text-[#e94560]" />
                <span className="text-white font-semibold">{activeDeals.length} Active Deal{activeDeals.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-green-400" />
                <span className="text-white font-semibold">
                  Up to &euro;{Math.max(...deals.map((d) => d.savings || 0)).toFixed(2)} off
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ===== DEALS GRID ===== */}
        <section className="py-10 px-4">
          <div className="max-w-6xl mx-auto">
            {activeDeals.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeDeals.map((deal) => (
                  <DealCard key={deal.id} deal={deal} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f5a623]/10 flex items-center justify-center">
                  <Tag className="w-8 h-8 text-[#f5a623]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No deals available right now</h3>
                <p className="text-[#e0e0e0]/70 mb-6">Check back soon for amazing offers!</p>
                <Link
                  to="/menu"
                  className="inline-flex items-center gap-2 bg-[#e94560] hover:bg-[#d63050] text-white font-bold px-6 py-3 rounded-xl transition-all duration-300"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Browse Full Menu
                </Link>
              </div>
            )}

            {/* Expired deals, shown dimmed at the bottom */}
            {expiredDeals.length > 0 && (
              <div className="mt-12">
                <h3 className="text-lg font-semibold text-[#e0e0e0]/40 mb-4 uppercase tracking-wider text-center">
                  Recently Expired
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {expiredDeals.map((deal) => (
                    <DealCard key={deal.id} deal={deal} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ===== CTA SECTION ===== */}
        <section className="py-20 px-4 bg-[#0f0f0f]">
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-[#1a1a2e] rounded-3xl p-10 md:p-14 border border-white/5 relative overflow-hidden">
              {/* Decorative gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#e94560]/5 to-[#f5a623]/5" />

              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#e94560]/10 flex items-center justify-center">
                  <ShoppingCart className="w-8 h-8 text-[#e94560]" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to Order?
                </h2>
                <p className="text-[#e0e0e0]/70 text-lg mb-8 max-w-lg mx-auto">
                  Don&apos;t miss out on these unbeatable deals. Order online now and enjoy fresh food delivered to your door.
                </p>
                <Link
                  to="/menu"
                  className="inline-flex items-center gap-2 bg-[#e94560] hover:bg-[#d63050] text-white font-bold px-10 py-4 rounded-xl text-lg transition-all duration-300 hover:scale-105 shadow-lg shadow-[#e94560]/30"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Order Now
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
                  <Link to="/menu" className="text-[#e94560] hover:text-[#f5a623] underline transition-colors">Full Menu</Link>
                  <Link to="/contact" className="text-[#e94560] hover:text-[#f5a623] underline transition-colors">Contact Us</Link>
                  <Link to="/takeaway-limerick" className="text-[#e94560] hover:text-[#f5a623] underline transition-colors">Takeaway Limerick</Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
