import { useState, useMemo, useEffect } from 'react';
import { menuData as staticMenuData } from '../data/menu';
import {
  Star,
  ShoppingCart,
  Plus,
  Search,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import MenuItemModal from '../components/MenuItemModal';
import SEOHead from '../components/SEOHead';

const categories = [
  { key: 'all', label: 'All', emoji: '📋' },
  { key: 'popular', label: 'Popular', emoji: '⭐' },
  { key: 'pizzas', label: 'Pizzas', emoji: '🍕' },
  { key: 'kebabs', label: 'Kebabs', emoji: '🥙' },
  { key: 'wraps', label: 'Wraps', emoji: '🌯' },
  { key: 'burgers', label: 'Burgers', emoji: '🍔' },
  { key: 'chicken', label: 'Chicken', emoji: '🍗' },
  { key: 'fish', label: 'Fish', emoji: '🐟' },
  { key: 'chips', label: 'Chips', emoji: '🍟' },
  { key: 'sides', label: 'Sides', emoji: '🧀' },
  { key: 'kids', label: 'Kids', emoji: '👶' },
  { key: 'drinks', label: 'Drinks', emoji: '🥤' },
  { key: 'sauces', label: 'Sauces', emoji: '🫙' },
];

// Category emoji lookup for item cards
const categoryEmoji = Object.fromEntries(categories.map((c) => [c.key, c.emoji]));

// Flatten the grouped menu data into flat items with unique IDs and category info
function flattenMenuData(data) {
  const items = [];
  (data || []).forEach((category) => {
    // Normalise category key: API returns numeric id + name, static uses string id
    const catKeyRaw = typeof category.id === 'number'
      ? category.name.toLowerCase().replace(/[^a-z]/g, '')
      : category.id;
    const keyMap = { freshchips: 'chips', sideorders: 'sides', kidsmeals: 'kids', softdrinks: 'drinks' };
    const catKey = keyMap[catKeyRaw] || catKeyRaw;
    (category.items || []).forEach((item, idx) => {
      items.push({
        ...item,
        id: item.id || `${category.id}-${idx}`,
        category: catKey,
        categoryName: category.name,
      });
    });
  });
  return items;
}

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [liveMenu, setLiveMenu] = useState(null);
  const [isLiveMenu, setIsLiveMenu] = useState(true);
  const { addItem, openCart, itemCount } = useCart();

  // Fetch live menu from API, fall back to static data
  // Read URL hash to auto-select category (e.g. /menu#pizzas)
  useEffect(() => {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (hash && categories.some((c) => c.key === hash)) {
      setActiveCategory(hash);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    fetch(`${API_BASE}/menu`)
      .then(r => r.json())
      .then(data => {
        if (mounted && data.menu && data.menu.length > 0) setLiveMenu(data.menu);
      })
      .catch(() => { if (mounted) setIsLiveMenu(false); }); // Fall back to static data
    return () => { mounted = false; };
  }, []);

  const allItems = useMemo(() => flattenMenuData(liveMenu || staticMenuData), [liveMenu]);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchesCategory =
        activeCategory === 'all' ||
        (activeCategory === 'popular' && item.popular) ||
        (item.category && item.category.toLowerCase() === activeCategory);

      const matchesSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [allItems, activeCategory, searchQuery]);

  const handleQuickAdd = (e, item) => {
    e.stopPropagation();
    if (!isLiveMenu) return;
    const groups = item.option_groups || item.optionGroups || [];
    if (groups.length > 0) {
      setSelectedItem(item);
      return;
    }
    addItem(item, 1, [], '');
  };

  const menuFaqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What food does Nimo\'s serve?',
        acceptedAnswer: { '@type': 'Answer', text: 'Nimo\'s serves pizza, burgers, kebabs, chicken boxes, wraps, fish & chips, sides, and more — over 50 items on our menu.' },
      },
      {
        '@type': 'Question',
        name: 'How much does pizza cost at Nimo\'s?',
        acceptedAnswer: { '@type': 'Answer', text: 'Our pizzas start from €8 for a 10-inch and go up to €16 for a loaded 14-inch. Check our full menu for all options.' },
      },
      {
        '@type': 'Question',
        name: 'Can I order online from Nimo\'s?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes! You can browse our menu and order online at nimos.emanahmad.cloud for delivery or pickup in Knocklong and surrounding areas.' },
      },
      {
        '@type': 'Question',
        name: 'Does Nimo\'s do delivery?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes, we deliver Thursday to Sunday from 3pm. Delivery covers Knocklong, Hospital, Kilmallock, Bruff and surrounding areas in Co. Limerick.' },
      },
      {
        '@type': 'Question',
        name: 'Are there any deals or meal offers?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes! We have regular combo deals and family meal offers. Check our Deals page for the latest special offers.' },
      },
    ],
  };

  return (
    <>
    <SEOHead
      title="Menu - Pizza, Burgers, Kebabs & More"
      description="Browse Nimo's full menu: 50+ items including pizza from EUR8, burgers from EUR5, kebabs, chicken boxes, wraps & sides. Order online for delivery or pickup in Knocklong."
      keywords="nimos menu, takeaway menu limerick, pizza menu limerick, burger menu knocklong, kebab delivery limerick"
      path="/menu"
      breadcrumbs={[
        { name: 'Home', url: '/' },
        { name: 'Menu' },
      ]}
      extraSchema={menuFaqSchema}
    />
    <div className="min-h-screen bg-[#080808]">
      {/* ===== HERO BANNER ===== */}
      <section className="pt-28 pb-10 px-4 bg-[#0f0f0f]">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Our <span className="text-[#e94560]">Menu</span>
          </h1>
          <p className="text-[#e0e0e0]/70 text-lg max-w-xl mx-auto">
            Fresh pizzas, juicy burgers, crispy chicken, and much more. All made to order.
          </p>
        </div>
      </section>

      {/* ===== STICKY FILTER BAR ===== */}
      <div className="sticky top-16 z-40 bg-[#0f0f0f]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-4">
          {/* Search Bar */}
          <div className="relative mb-4">
            <label htmlFor="menu-search" className="sr-only">Search the menu</label>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#e0e0e0]/40" aria-hidden="true" />
            <input
              id="menu-search"
              type="search"
              placeholder="Search the menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-[#e0e0e0] placeholder-[#e0e0e0]/30 focus:outline-none focus:border-[#e94560]/50 transition-colors"
            />
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" role="tablist" aria-label="Menu categories">
            {categories.map((cat) => (
              <button
                key={cat.key}
                role="tab"
                aria-selected={activeCategory === cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 min-h-[44px] ${
                  activeCategory === cat.key
                    ? 'bg-[#e94560] text-white shadow-lg shadow-[#e94560]/30'
                    : 'bg-[#1a1a2e] text-[#e0e0e0]/70 hover:bg-[#1a1a2e]/80 hover:text-white border border-white/5'
                }`}
              >
                <span aria-hidden="true">{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== MENU GRID ===== */}
      <section className="py-10 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Results count */}
          <p className="text-[#e0e0e0]/70 text-sm mb-6" aria-live="polite" aria-atomic="true">
            {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found
            {activeCategory !== 'all' && (
              <span>
                {' '}in <span className="text-[#f5a623] font-medium">{categories.find((c) => c.key === activeCategory)?.label}</span>
              </span>
            )}
          </p>

          {!isLiveMenu && (
            <div className="bg-yellow-900/30 border border-yellow-600/50 text-yellow-200 px-4 py-3 rounded-lg mb-6 text-center text-sm">
              ⚠️ Showing cached menu — ordering is temporarily unavailable. Please try again shortly.
            </div>
          )}

          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" role="list" aria-live="polite">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  role="button"
                  aria-roledescription="menu item"
                  tabIndex={0}
                  onClick={() => isLiveMenu && setSelectedItem(item)}
                  onKeyDown={(e) => { if (isLiveMenu && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); setSelectedItem(item); } }}
                  aria-label={`${item.name}, ${typeof item.price === 'number' ? '\u20AC' + item.price.toFixed(2) : item.price}. Click to customise.`}
                  className="bg-[#1a1a2e] rounded-2xl p-5 border border-white/5 hover:border-[#e94560]/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#e94560]/5 group relative cursor-pointer"
                >
                  {/* Popular Badge */}
                  {item.popular && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-[#f5a623]/15 text-[#f5a623] text-xs font-bold px-2.5 py-1 rounded-full border border-[#f5a623]/30">
                      <Star className="w-3 h-3 fill-[#f5a623]" />
                      Popular
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-3">
                    {/* Category emoji as visual placeholder for missing images */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl" aria-hidden="true">
                      {categoryEmoji[item.category] || '🍽️'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-white group-hover:text-[#e94560] transition-colors pr-16 mb-1">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-[#e0e0e0]/70 text-sm leading-relaxed line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="bg-[#e94560] text-white text-sm font-bold px-3 py-1.5 rounded-lg">
                      &euro;{typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                    </span>

                    {/* Quick add button */}
                    <button
                      onClick={(e) => handleQuickAdd(e, item)}
                      disabled={!isLiveMenu}
                      className={`flex items-center gap-1.5 border px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 min-h-[44px] ${isLiveMenu ? 'bg-white/5 hover:bg-[#e94560] border-white/10 hover:border-[#e94560] text-[#a0a0a0] hover:text-white cursor-pointer' : 'bg-white/5 border-white/5 text-[#a0a0a0]/40 cursor-not-allowed'}`}
                      aria-label={isLiveMenu ? `Quick add ${item.name} to cart` : 'Ordering unavailable'}
                    >
                      <Plus className="w-4 h-4" aria-hidden="true" />
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-white mb-2">No items found</h3>
              <p className="text-[#e0e0e0]/70">
                Try a different category or search term.
              </p>
              <button
                onClick={() => {
                  setActiveCategory('all');
                  setSearchQuery('');
                }}
                className="mt-4 text-[#e94560] hover:text-[#f5a623] font-semibold transition-colors"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ===== FLOATING CART BUTTON ===== */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={openCart}
          aria-label={itemCount > 0 ? `View cart with ${itemCount} items` : 'Start order'}
          className="flex items-center gap-2 bg-[#e94560] hover:bg-[#d63050] text-white font-bold px-6 py-4 rounded-full shadow-2xl shadow-[#e94560]/40 transition-all duration-300 hover:scale-105 min-h-[48px]"
        >
          <ShoppingCart className="w-5 h-5" />
          {itemCount > 0 ? (
            <>
              View Cart
              <span className="bg-white/20 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            </>
          ) : (
            'Start Order'
          )}
        </button>
      </div>

      {/* ===== MENU ITEM MODAL ===== */}
      {selectedItem && (
        <MenuItemModal
          item={selectedItem}
          optionGroups={selectedItem.optionGroups || selectedItem.option_groups || []}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
    </>
  );
}
