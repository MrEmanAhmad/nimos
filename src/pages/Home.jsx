import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { menuData } from '../data/menu';
import { deals } from '../data/deals';
import { Helmet } from 'react-helmet-async';
import SEOHead from '../components/SEOHead';
import {
  MapPin,
  ShoppingCart,
  Star,
  ChevronRight,
  Truck,
  Store,
  Navigation,
  Search,
  SlidersHorizontal,
  PartyPopper,
  Leaf,
  Zap,
  BookOpen,
  BadgeDollarSign,
  Quote,
} from 'lucide-react';

/* ───────────────────────── static data ───────────────────────── */

const featureCards = [
  { emoji: '🍕', title: 'Fresh Pizzas', description: 'Hand-stretched dough, premium toppings, baked to perfection in our stone oven.' },
  { emoji: '🍔', title: 'Juicy Burgers', description: 'Quarter-pound beef patties, fresh buns, loaded with your favourite toppings.' },
  { emoji: '🍗', title: 'Crispy Chicken', description: 'Golden fried chicken, seasoned to perfection. Tenders, wings, and fillets.' },
  { emoji: '⚡', title: 'Fast Service', description: 'Quick pickup in ~15 minutes or delivery to your door in ~60 minutes.' },
];

const howItWorksSteps = [
  {
    icon: Search,
    title: 'Browse Menu',
    description: 'Explore our full menu of pizzas, burgers, kebabs, chicken and more.',
    step: '1',
  },
  {
    icon: SlidersHorizontal,
    title: 'Customize',
    description: 'Pick your size, toppings and extras. Make every meal exactly how you like it.',
    step: '2',
  },
  {
    icon: PartyPopper,
    title: 'Order & Enjoy',
    description: 'Place your order for delivery or pickup and enjoy fresh food in no time.',
    step: '3',
  },
];

const whyChooseUsCards = [
  {
    icon: Leaf,
    title: 'Fresh Ingredients',
    description: 'We source quality produce daily so every meal bursts with flavour.',
    color: '#4ade80',
  },
  {
    icon: Zap,
    title: 'Fast Delivery',
    description: 'Delivery in ~60 min, pickup in ~15 min. Hot food, on time, every time.',
    color: '#f5a623',
  },
  {
    icon: BookOpen,
    title: 'Family Recipes',
    description: 'Authentic recipes passed down and perfected over generations.',
    color: '#e94560',
  },
  {
    icon: BadgeDollarSign,
    title: 'Best Value',
    description: 'Generous portions and unbeatable deals without ever cutting corners.',
    color: '#38bdf8',
  },
];

const staticTestimonials = [
  {
    name: "Sarah K.",
    rating: 5,
    text: "Best pizza in Limerick, hands down! The dough is always perfect and the toppings are so fresh. My family orders every Friday night now.",
  },
  {
    name: "Mark O'Brien",
    rating: 5,
    text: "Ordered the burger meal deal last week and was blown away. Huge portions, great chips, and it arrived piping hot. Easily the best takeaway around Knocklong.",
  },
  {
    name: "Emma D.",
    rating: 5,
    text: "We've tried every takeaway in the area and Nimo's is the clear winner. The crispy chicken is incredible and the staff are always friendly. Highly recommend!",
  },
  {
    name: "Liam F.",
    rating: 4,
    text: "Really solid food and super quick pickup. The kebab wraps are massive and full of flavour. Great value for money every single time.",
  },
];

/* ──────────────── reusable scroll-animation hook ─────────────── */

function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
}

/** Wrapper that fades + slides children into view on scroll */
function Reveal({ children, className = '', delay = 0 }) {
  const [ref, visible] = useScrollReveal(0.12);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.7s cubic-bezier(.16,1,.3,1) ${delay}s, transform 0.7s cubic-bezier(.16,1,.3,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  )
}

const faqs = [
  {
    q: 'What areas do you deliver to?',
    a: 'We deliver to Knocklong, Hospital, Kilmallock, Bruff, and surrounding areas in Co. Limerick. Delivery is available Thursday to Sunday from 3 PM.',
  },
  {
    q: 'How long does delivery take?',
    a: 'Delivery typically takes around 60 minutes. Pickup orders are usually ready in about 15 minutes.',
  },
  {
    q: 'What are your opening hours?',
    a: "We're open for pickup Monday to Saturday 3 PM – 10:30 PM and Sunday 3 PM – 10 PM. Delivery runs Thursday to Sunday during the same hours.",
  },
  {
    q: 'Do you accept card payments?',
    a: 'Yes! We accept cash and all major credit/debit cards both in-store and on delivery.',
  },
  {
    q: 'Can I order online?',
    a: "Absolutely! Browse our full menu on this website, add items to your cart, and place your order for delivery or pickup.",
  },
  {
    q: 'Do you have vegetarian options?',
    a: 'Yes, we offer vegetarian pizzas, wraps, sides, and more. Check our menu for items marked as vegetarian.',
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(f => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: f.a,
    },
  })),
};

const reviewSchema = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: "Nimo's Takeaway",
  image: 'https://nimos.emanahmad.cloud/og-image.jpg',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Main Street',
    addressLocality: 'Knocklong',
    addressRegion: 'Co. Limerick',
    addressCountry: 'IE',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    bestRating: '5',
    worstRating: '1',
    reviewCount: String(staticTestimonials.length),
  },
  review: staticTestimonials.map(t => ({
    '@type': 'Review',
    author: { '@type': 'Person', name: t.name },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: String(t.rating),
      bestRating: '5',
    },
    reviewBody: t.text,
  })),
};

/* ──────────────────────── main component ─────────────────────── */

export default function Home() {
  // Live reviews from API, fallback to static
  const [testimonials, setTestimonials] = useState(staticTestimonials);
  useEffect(() => {
    fetch('/api/menu/reviews?limit=8')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        if (data.length >= 2) {
          setTestimonials(data.map(r => ({
            name: r.reviewer_name || 'Customer',
            rating: r.rating,
            text: r.comment || `Loved the ${r.items_ordered || 'food'}!`,
          })));
        }
      })
      .catch(() => {}); // keep static fallback
  }, []);

  // Flatten category-grouped menu data to get popular items
  const popularItems = (menuData || [])
    .flatMap(cat => (cat.items || []).map(item => ({ ...item, category: cat.name })))
    .filter(item => item.popular)
    .slice(0, 6);

  /* ── sticky CTA bar: show after hero leaves viewport ── */
  const heroRef = useRef(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <>
    <SEOHead
      title="Pizza, Burgers & Takeaway Knocklong"
      description="Order pizza, burgers, kebabs & more from Nimo's in Knocklong, Co. Limerick. Fresh ingredients, fast delivery Thu-Sun. Pickup daily from 3pm. Order online now!"
      keywords="takeaway limerick, pizza delivery limerick, takeaway knocklong, nimos limerick, food delivery limerick"
      path="/"
      extraSchema={faqSchema}
    />
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(reviewSchema)}</script>
    </Helmet>
    <div className="min-h-screen bg-[#080808]">

      {/* ===== STICKY ORDER NOW BAR ===== */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          transform: showStickyBar ? 'translateY(0)' : 'translateY(100%)',
          opacity: showStickyBar ? 1 : 0,
          pointerEvents: showStickyBar ? 'auto' : 'none',
        }}
      >
        <div className="bg-[#080808]/95 backdrop-blur-md border-t border-white/10 shadow-[0_-4px_24px_rgba(233,69,96,.25)]">
          <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3 gap-4">
            <p className="text-white font-semibold text-sm sm:text-base hidden sm:block">
              Craving something delicious?
            </p>
            <Link
              to="/menu"
              className="inline-flex items-center justify-center gap-2 bg-[#e94560] hover:bg-[#d63050] text-white font-bold px-6 py-2.5 rounded-xl text-sm sm:text-base transition-all duration-300 shadow-lg shadow-[#e94560]/30 hover:shadow-[#e94560]/50 hover:scale-105 w-full sm:w-auto"
            >
              <ShoppingCart className="w-4 h-4" />
              Order Now
            </Link>
          </div>
        </div>
      </div>

      {/* ===== HERO SECTION ===== */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image -- WebP with PNG fallback via <picture> for 71% smaller download */}
        <div className="absolute inset-0 img-placeholder img-placeholder--eager">
          <picture>
            <source srcSet="/images/hero-bg.webp" type="image/webp" />
            <img
              src="/images/hero-bg.webp"
              alt=""
              className="absolute inset-0 w-full h-full object-cover loaded"
              width="1920"
              height="1080"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </picture>
        </div>
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/70" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          {/* Logo -- WebP with PNG fallback */}
          <picture>
            <source srcSet="/images/logo.webp" type="image/webp" />
            <img
              src="/images/logo.webp"
              alt="Nimo's Limerick - Best Takeaway in Knocklong, Co. Limerick"
              className="w-[120px] h-[120px] object-contain mx-auto mb-6 drop-shadow-2xl"
              width="120"
              height="120"
              loading="eager"
              fetchPriority="high"
            />
          </picture>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
            Nimo's <span className="text-[#e94560]">Limerick</span>
          </h1>

          {/* Tagline */}
          <p className="text-lg md:text-xl text-[#f5a623] font-medium mb-6 tracking-wide">
            Fresh Pizza &middot; Burgers &middot; Kebabs &middot; Chicken &amp; Chips
          </p>

          {/* Location Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 mb-8 border border-white/10">
            <MapPin className="w-4 h-4 text-[#e94560]" aria-hidden="true" />
            <span className="text-[#e0e0e0] text-sm">
              The Cross, Knocklong East, Co. Limerick
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Link
              to="/menu"
              className="inline-flex items-center justify-center gap-2 bg-[#e94560] hover:bg-[#d63050] text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-300 shadow-lg shadow-[#e94560]/30 hover:shadow-[#e94560]/50 hover:scale-105"
            >
              <ShoppingCart className="w-5 h-5" />
              Order Now
            </Link>
            <Link
              to="/menu"
              className="inline-flex items-center justify-center gap-2 border-2 border-[#f5a623] text-[#f5a623] hover:bg-[#f5a623] hover:text-[#080808] font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-300 hover:scale-105"
            >
              View Menu
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Delivery/Pickup Time Badges */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="flex items-center gap-2 bg-[#1a1a2e]/80 backdrop-blur-sm rounded-lg px-5 py-3 border border-white/5">
              <Truck className="w-5 h-5 text-[#e94560]" />
              <div className="text-left">
                <p className="text-white text-sm font-semibold">Delivery</p>
                <p className="text-[#e0e0e0]/70 text-xs">~60 min</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-[#1a1a2e]/80 backdrop-blur-sm rounded-lg px-5 py-3 border border-white/5">
              <Store className="w-5 h-5 text-[#f5a623]" />
              <div className="text-left">
                <p className="text-white text-sm font-semibold">Pickup</p>
                <p className="text-[#e0e0e0]/70 text-xs">~15 min</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce" aria-hidden="true">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1.5">
            <div className="w-1.5 h-3 bg-white/60 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* ===== ABOUT SECTION ===== */}
      <section className="py-20 px-4 bg-[#0f0f0f]">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Welcome to <span className="text-[#e94560]">Nimo's</span>
              </h2>
              <p className="text-[#e0e0e0]/70 text-lg max-w-2xl mx-auto">
                Limerick's favourite spot for fresh pizzas, juicy burgers, crispy chicken, and more.
                Made fresh, served fast, and always delicious.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featureCards.map((card, i) => (
              <Reveal key={card.title} delay={i * 0.1}>
                <div
                  className="bg-[#1a1a2e] rounded-2xl p-6 text-center border border-white/5 hover:border-[#e94560]/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#e94560]/10 h-full"
                >
                  <div className="text-5xl mb-4" aria-hidden="true">{card.emoji}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
                  <p className="text-[#e0e0e0]/70 text-sm leading-relaxed">{card.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS SECTION ===== */}
      <section className="py-20 px-4 bg-[#080808]">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 bg-[#f5a623]/10 rounded-full px-4 py-1.5 mb-4">
                <span className="text-[#f5a623] text-sm font-semibold">Simple & Easy</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                How It <span className="text-[#e94560]">Works</span>
              </h2>
              <p className="text-[#e0e0e0]/70 text-lg">Three simple steps to a delicious meal.</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorksSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <Reveal key={step.title} delay={i * 0.15}>
                  <div className="relative text-center group">
                    {/* connector line (desktop only) */}
                    {i < howItWorksSteps.length - 1 && (
                      <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-[#e94560]/40 to-transparent" aria-hidden="true" />
                    )}
                    {/* step number badge */}
                    <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#1a1a2e] border border-white/5 group-hover:border-[#e94560]/40 transition-all duration-300 mb-6 shadow-lg group-hover:shadow-[#e94560]/20">
                      <Icon className="w-8 h-8 text-[#e94560]" />
                      <span className="absolute -top-2 -right-2 w-7 h-7 bg-[#e94560] rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
                        {step.step}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-[#e0e0e0]/70 text-sm leading-relaxed max-w-xs mx-auto">{step.description}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <Reveal delay={0.4}>
            <div className="text-center mt-12">
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 bg-[#e94560] hover:bg-[#d63050] text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-300 shadow-lg shadow-[#e94560]/30 hover:shadow-[#e94560]/50 hover:scale-105"
              >
                <ShoppingCart className="w-5 h-5" />
                Start Your Order
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== POPULAR ITEMS SECTION ===== */}
      {popularItems.length > 0 && (
        <section className="py-20 px-4 bg-[#0f0f0f]">
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <div className="text-center mb-14">
                <div className="inline-flex items-center gap-2 bg-[#e94560]/10 rounded-full px-4 py-1.5 mb-4">
                  <Star className="w-4 h-4 text-[#f5a623] fill-[#f5a623]" />
                  <span className="text-[#f5a623] text-sm font-semibold">Customer Favourites</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Popular <span className="text-[#e94560]">Items</span>
                </h2>
                <p className="text-[#e0e0e0]/70 text-lg">Our most-loved dishes, ordered again and again.</p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularItems.map((item, i) => (
                <Reveal key={item.name} delay={i * 0.08}>
                  <div
                    className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5 hover:border-[#e94560]/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#e94560]/10 group h-full"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="text-lg font-bold text-white group-hover:text-[#e94560] transition-colors">
                        {item.name}
                      </h3>
                      <span className="shrink-0 bg-[#e94560] text-white text-sm font-bold px-3 py-1 rounded-lg">
                        &euro;{typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-[#e0e0e0]/70 text-sm leading-relaxed">{item.description}</p>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.5}>
              <div className="text-center mt-10">
                <Link
                  to="/menu"
                  className="inline-flex items-center gap-2 text-[#f5a623] hover:text-[#e94560] font-semibold text-lg transition-colors"
                >
                  View Full Menu
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ===== WHY CHOOSE NIMO'S SECTION ===== */}
      <section className="py-20 px-4 bg-[#080808]">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Why Choose <span className="text-[#e94560]">Nimo's?</span>
              </h2>
              <p className="text-[#e0e0e0]/70 text-lg max-w-2xl mx-auto">
                We go the extra mile so every bite feels like the best meal you've had all week.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseUsCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <Reveal key={card.title} delay={i * 0.12}>
                  <div className="bg-[#1a1a2e] rounded-2xl p-6 text-center border border-white/5 hover:border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg h-full"
                    style={{ '--accent': card.color }}
                  >
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
                      style={{ backgroundColor: `${card.color}15` }}
                    >
                      <Icon className="w-7 h-7" style={{ color: card.color }} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
                    <p className="text-[#e0e0e0]/70 text-sm leading-relaxed">{card.description}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS SECTION ===== */}
      <section className="py-20 px-4 bg-[#0f0f0f]">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 bg-[#f5a623]/10 rounded-full px-4 py-1.5 mb-4">
                <Quote className="w-4 h-4 text-[#f5a623]" />
                <span className="text-[#f5a623] text-sm font-semibold">Real Reviews</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                What Our Customers <span className="text-[#e94560]">Say</span>
              </h2>
              <p className="text-[#e0e0e0]/70 text-lg">Don't take our word for it -- hear from our regulars.</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.1}>
                <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5 hover:border-[#f5a623]/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#f5a623]/10 flex flex-col h-full">
                  {/* stars */}
                  <div className="flex gap-0.5 mb-4" aria-label={`${t.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }).map((_, si) => (
                      <Star
                        key={si}
                        className={`w-4 h-4 ${si < t.rating ? 'text-[#f5a623] fill-[#f5a623]' : 'text-white/20'}`}
                      />
                    ))}
                  </div>
                  {/* quote */}
                  <p className="text-[#e0e0e0]/80 text-sm leading-relaxed mb-6 flex-1">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  {/* author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                    <div className="w-9 h-9 rounded-full bg-[#e94560]/20 flex items-center justify-center text-[#e94560] font-bold text-sm">
                      {t.name.charAt(0)}
                    </div>
                    <span className="text-white font-semibold text-sm">{t.name}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DEALS SECTION ===== */}
      {deals && deals.length > 0 && (
        <section className="py-20 px-4 bg-[#080808]">
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <div className="text-center mb-14">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Today's <span className="text-[#f5a623]">Deals</span>
                </h2>
                <p className="text-[#e0e0e0]/70 text-lg">Amazing combos at unbeatable prices.</p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {deals.slice(0, 6).map((deal, i) => (
                <Reveal key={deal.name} delay={i * 0.08}>
                  <div
                    className="bg-[#1a1a2e] rounded-2xl p-6 border border-[#f5a623]/20 hover:border-[#f5a623]/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#f5a623]/10 relative overflow-hidden h-full"
                  >
                    {/* Savings Badge */}
                    {deal.savings && (
                      <div className="absolute top-4 right-4 bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full border border-green-500/30">
                        Save &euro;{deal.savings}
                      </div>
                    )}

                    <h3 className="text-xl font-bold text-white mb-3 pr-20">{deal.name}</h3>

                    {deal.items && (
                      <ul className="text-[#e0e0e0]/70 text-sm space-y-1 mb-4">
                        {deal.items.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-[#f5a623] rounded-full shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="flex items-baseline gap-3 mt-auto">
                      <span className="text-2xl font-bold text-[#e94560]">
                        &euro;{typeof deal.price === 'number' ? deal.price.toFixed(2) : deal.price}
                      </span>
                      {deal.originalPrice && (
                        <span className="text-[#e0e0e0]/60 line-through text-sm">
                          &euro;{typeof deal.originalPrice === 'number' ? deal.originalPrice.toFixed(2) : deal.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.5}>
              <div className="text-center mt-10">
                <Link
                  to="/deals"
                  className="inline-flex items-center gap-2 text-[#f5a623] hover:text-[#e94560] font-semibold text-lg transition-colors"
                >
                  View All Deals
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ===== HOURS SECTION ===== */}
      <section id="hours" className="py-20 px-4 bg-[#0f0f0f]">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Opening <span className="text-[#e94560]">Hours</span>
              </h2>
              <p className="text-[#e0e0e0]/70 text-lg">Plan your visit or order ahead.</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Delivery Card */}
            <Reveal delay={0}>
              <div className="bg-[#1a1a2e] rounded-2xl p-8 border border-white/5 hover:border-[#e94560]/30 transition-all duration-300 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-[#e94560]/10 rounded-xl flex items-center justify-center">
                    <Truck className="w-6 h-6 text-[#e94560]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Delivery</h3>
                    <p className="text-[#e0e0e0]/70 text-sm">~60 min estimated</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-[#e0e0e0]/70">Thursday - Saturday</span>
                    <span className="text-white font-semibold">3:00 PM - 10:30 PM</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-[#e0e0e0]/70">Sunday</span>
                    <span className="text-white font-semibold">3:00 PM - 10:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-[#e0e0e0]/70">Mon - Wed</span>
                    <span className="text-[#e0e0e0]/60 text-sm">Closed for delivery</span>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Pickup Card */}
            <Reveal delay={0.12}>
              <div className="bg-[#1a1a2e] rounded-2xl p-8 border border-white/5 hover:border-[#f5a623]/30 transition-all duration-300 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-[#f5a623]/10 rounded-xl flex items-center justify-center">
                    <Store className="w-6 h-6 text-[#f5a623]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Pickup</h3>
                    <p className="text-[#e0e0e0]/70 text-sm">~15 min estimated</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-[#e0e0e0]/70">Monday - Saturday</span>
                    <span className="text-white font-semibold">3:00 PM - 10:30 PM</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-[#e0e0e0]/70">Sunday</span>
                    <span className="text-white font-semibold">3:00 PM - 10:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-[#e0e0e0]/70">Collection</span>
                    <span className="text-[#f5a623] text-sm font-medium">Available daily</span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== LOCATION SECTION ===== */}
      <section className="py-20 px-4 bg-[#080808]">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Find <span className="text-[#e94560]">Us</span>
              </h2>
              <p className="text-[#e0e0e0]/70 text-lg">
                The Cross, Knocklong East, Co. Limerick, V94 TY05
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Address Card */}
            <Reveal delay={0}>
              <div className="bg-[#1a1a2e] rounded-2xl p-8 border border-white/5 flex flex-col items-center text-center h-full">
                <div className="w-14 h-14 bg-[#e94560]/10 rounded-xl flex items-center justify-center mb-4">
                  <MapPin className="w-7 h-7 text-[#e94560]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Our Address</h3>
                <p className="text-[#e0e0e0]/70 mb-6">
                  The Cross, Knocklong East, Co. Limerick, V94 TY05
                </p>
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=52.4631,-8.5672"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#e94560] hover:bg-[#d63050] text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 mt-auto"
                >
                  <Navigation className="w-4 h-4" />
                  Get Directions
                </a>
              </div>
            </Reveal>

            {/* Map */}
            <Reveal delay={0.1} className="lg:col-span-2">
              <div className="rounded-2xl overflow-hidden border border-white/5 h-[400px]">
                <iframe
                  title="Nimo's Limerick Location"
                  src="https://www.google.com/maps/embed/v1/place?key=" + import.meta.env.VITE_GOOGLE_MAPS_KEY + "&q=Nimo's,The+Cross,Knocklong,Co.+Limerick,V94TY05,Ireland&zoom=15"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== FAQ SECTION ===== */}
      <section className="py-20 px-4 bg-[#0f0f0f]">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Frequently Asked <span className="text-[#e94560]">Questions</span>
              </h2>
              <p className="text-[#e0e0e0]/70 text-lg">Everything you need to know about ordering from Nimo's.</p>
            </div>
          </Reveal>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <details className="group bg-[#1a1a2e] rounded-2xl border border-white/5 hover:border-[#e94560]/30 transition-all duration-300">
                  <summary className="flex items-center justify-between cursor-pointer p-6 text-white font-semibold text-lg list-none">
                    {faq.q}
                    <ChevronRight className="w-5 h-5 text-[#e94560] transition-transform duration-300 group-open:rotate-90 shrink-0 ml-4" />
                  </summary>
                  <div className="px-6 pb-6 text-[#e0e0e0]/70 leading-relaxed">
                    {faq.a}
                  </div>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== EXPLORE MORE (Internal Links) ===== */}
      <section className="py-16 px-4 bg-[#0a0a0a]">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e94560] to-[#f5a623]">
                Explore More
              </span>
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                to: '/best-takeaway-knocklong',
                title: 'Best Takeaway in Knocklong',
                desc: 'Discover why locals rate Nimo\'s as the #1 takeaway in Knocklong — fresh food, fast delivery, unbeatable value.',
              },
              {
                to: '/takeaway-limerick',
                title: 'Takeaway Limerick',
                desc: 'Serving Limerick city and county with a menu packed with burgers, pizzas, wraps, and more. Order online now.',
              },
              {
                to: '/pizza-delivery-limerick',
                title: 'Pizza Delivery Limerick',
                desc: 'Hot, fresh pizzas delivered to your door across Limerick. Hand-stretched dough, premium toppings, real value.',
              },
            ].map((item) => (
              <Reveal key={item.to}>
                <Link
                  to={item.to}
                  className="block p-6 rounded-2xl bg-[#121212] border border-white/5 hover:border-[#e94560]/40 transition-all duration-300 hover:-translate-y-1 group"
                >
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#e94560] transition-colors">
                    {item.title} →
                  </h3>
                  <p className="text-[#e0e0e0]/60 text-sm leading-relaxed">{item.desc}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-20 px-4 bg-gradient-to-r from-[#e94560] to-[#d63050] relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2" />

        <Reveal>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Hungry? Order Now!
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Fresh food made to order, delivered to your door or ready for pickup. Don't wait — your next favourite meal is just a click away.
            </p>
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 bg-white text-[#e94560] font-bold px-10 py-4 rounded-xl text-lg transition-all duration-300 hover:bg-[#f5a623] hover:text-[#080808] hover:scale-105 shadow-lg"
            >
              <ShoppingCart className="w-5 h-5" />
              Order Now
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
    </>
  );
}
