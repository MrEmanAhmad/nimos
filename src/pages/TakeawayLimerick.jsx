import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import SEOHead from '../components/SEOHead';
import { siteInfo } from '../data/siteInfo';

const TakeawayLimerick = () => {
  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: "Best Takeaway Limerick — Pizza, Burgers & More From Nimo's",
    description: "Nimo's is the best value takeaway in Limerick. Pizza from €8, burgers from €5, kebabs from €9. 50+ fresh menu items. Order for delivery Thu-Sun or pickup daily.",
    author: { '@type': 'Organization', name: "Nimo's Limerick" },
    publisher: { '@type': 'Organization', name: "Nimo's Limerick", logo: { '@type': 'ImageObject', url: 'https://nimos.emanahmad.cloud/images/logo.png' } },
    datePublished: '2025-12-01',
    dateModified: '2026-02-22',
    mainEntityOfPage: 'https://nimos.emanahmad.cloud/takeaway-limerick',
    image: 'https://nimos.emanahmad.cloud/images/logo.png',
  };

  const featuredItems = [
    { name: 'Margherita Pizza', price: '€8.00', desc: 'Classic tomato & mozzarella' },
    { name: 'Quarter Pounder Burger', price: '€5.50', desc: 'Fresh beef patty with all the fixings' },
    { name: 'Chicken Kebab', price: '€9.00', desc: 'Tender chicken with fresh salad & sauce' },
    { name: 'Chicken Box (3pc)', price: '€9.50', desc: 'Crispy fried chicken with chips & drink' },
    { name: 'Pepperoni Pizza', price: '€9.50', desc: 'Loaded with spicy pepperoni & cheese' },
    { name: 'Garlic Cheese Chips', price: '€5.50', desc: 'Crispy chips with garlic butter & melted cheese' },
  ];

  const faqData = [
    {
      question: 'Do you deliver in Limerick?',
      answer:
        'Yes, Nimo\'s offers delivery Thursday through Sunday. We deliver across Limerick city and surrounding areas including Knocklong, Hospital, Kilmallock, and Bruff. You can order directly through our website or by calling us.',
    },
    {
      question: 'What are your opening hours?',
      answer:
        'Nimo\'s is open from 3:00 PM to 10:30 PM. We serve freshly prepared food throughout our opening hours so you can enjoy a great meal any time of the evening.',
    },
    {
      question: 'Do you have vegetarian options?',
      answer:
        'Yes, we have multiple vegetarian options on our menu including Margherita Pizza, Vegetarian Pizza loaded with fresh vegetables, garlic bread, chips, wedges, onion rings, and a variety of sides. We cater to different dietary preferences.',
    },
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqData.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <SEOHead
        title="Best Takeaway Limerick - Pizza, Burgers & More"
        description="Nimo's is the best value takeaway in Limerick. Pizza from EUR8, burgers from EUR5, kebabs from EUR9. 50+ fresh menu items. Order for delivery Thu-Sun or pickup daily."
        keywords="takeaway limerick, best takeaway limerick, cheap takeaway limerick, food delivery limerick, limerick takeaway near me, pizza limerick, burger limerick, kebab limerick"
        path="/takeaway-limerick"
        extraSchema={blogSchema}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Takeaway Limerick' },
        ]}
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <div className="min-h-screen" style={{ backgroundColor: '#080808', color: '#ffffff' }}>
        {/* Hero Section */}
        <section className="relative py-20 px-4 text-center" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #080808 100%)' }}>
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Limerick's <span style={{ color: '#e94560' }}>Best Value</span> Takeaway
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Pizza from <span style={{ color: '#f5a623' }}>€8</span> &middot; Burgers from{' '}
              <span style={{ color: '#f5a623' }}>€5</span> &middot; Kebabs from{' '}
              <span style={{ color: '#f5a623' }}>€9</span>
            </p>
            <a
              href="/menu"
              className="inline-block text-white font-bold text-lg px-10 py-4 rounded-lg transition-all duration-300 hover:opacity-90 hover:scale-105"
              style={{ backgroundColor: '#e94560' }}
            >
              Order Now
            </a>
          </div>
        </section>

        {/* Main Content Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
              Why Nimo's Is the <span style={{ color: '#e94560' }}>Best Takeaway in Limerick</span>
            </h2>

            <div className="prose prose-lg prose-invert max-w-none space-y-6 text-gray-300 leading-relaxed">
              <p>
                When it comes to finding the best takeaway in Limerick, locals know that Nimo's stands head and
                shoulders above the rest. Located in the heart of Limerick, we have built a reputation for serving
                outstanding food at prices that simply cannot be beaten. Whether you are craving a freshly made pizza,
                a juicy burger, a loaded kebab, or a crispy chicken box, Nimo's has something for everyone on our
                extensive menu of over 50 items.
              </p>

              <p>
                What sets Nimo's apart from other takeaways in Limerick is our unwavering commitment to quality
                without the premium price tag. Every dish on our menu is prepared fresh to order using high-quality
                ingredients sourced from trusted suppliers. Our pizza dough is made in-house daily, our burgers use
                fresh beef patties, and our kebab meat is seasoned and cooked to perfection on our rotisserie. This
                dedication to freshness means you get restaurant-quality food at genuine takeaway prices.
              </p>

              <p>
                Our menu variety is something we take real pride in. With over 50 items to choose from, you will never
                run out of options. Our <Link to="/menu" className="underline" style={{ color: '#e94560' }}>full menu</Link> includes
                11 different pizza varieties starting from just €8, a range of classic and specialty burgers from €5,
                chicken kebabs, lamb kebabs, and mixed kebabs, plus chicken boxes, wraps, and a huge selection of sides
                like garlic cheese chips, onion rings, and chicken nuggets. We also offer combo deals and meal deals
                that make feeding the whole family affordable.
              </p>

              <p>
                Price is where Nimo's truly shines compared to the big chain takeaways in Limerick. While places like
                Domino's charge nearly €15 for a standard pizza, you can get a delicious freshly made pizza from Nimo's
                starting at just €8. That is a saving of almost 50% without sacrificing quality or portion size. Our
                burgers start from just €5, which is a fraction of what you would pay at most burger chains. When you
                check out our <Link to="/deals" className="underline" style={{ color: '#e94560' }}>current deals</Link>, you will
                find even more ways to save on your next order.
              </p>

              <p>
                Delivery is available Thursday through Sunday, covering Limerick city and the surrounding areas. If
                you prefer to collect, you can place your order by phone or online and pick it up fresh and hot from
                our shop. Either way, you are guaranteed the same great quality and generous portions that have made
                Nimo's the go-to takeaway for hungry Limerick locals.
              </p>

              <p>
                We believe that great food should not cost a fortune, and that is the philosophy behind everything we
                do at Nimo's. From our carefully crafted recipes to our competitive pricing, every aspect of our
                business is designed to give you the best possible takeaway experience in Limerick. It is no wonder
                that our customers keep coming back week after week, and word of mouth continues to bring new faces
                through our door.
              </p>

              <p>
                So the next time you are searching for a takeaway in Limerick that delivers on taste, quality, and
                value, give Nimo's a try. Check out our <Link to="/menu" className="underline" style={{ color: '#e94560' }}>full menu</Link>,
                browse our <Link to="/deals" className="underline" style={{ color: '#e94560' }}>latest deals</Link>, or simply
                hit the order button and let us show you why we are Limerick's favourite takeaway.
              </p>
            </div>
          </div>
        </section>

        {/* Featured Items Grid */}
        <section className="py-16 px-4" style={{ backgroundColor: '#0d0d0d' }}>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              Popular <span style={{ color: '#f5a623' }}>Menu Items</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredItems.map((item, index) => (
                <div
                  key={index}
                  className="rounded-xl p-6 transition-all duration-300 hover:scale-105 border border-gray-800"
                  style={{ backgroundColor: '#1a1a2e' }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-white">{item.name}</h3>
                    <span className="text-xl font-bold shrink-0 ml-3" style={{ color: '#f5a623' }}>
                      {item.price}
                    </span>
                  </div>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link
                to="/menu"
                className="inline-block text-white font-semibold px-8 py-3 rounded-lg border-2 transition-all duration-300 hover:bg-white/10"
                style={{ borderColor: '#e94560', color: '#e94560' }}
              >
                View Full Menu (50+ Items)
              </Link>
            </div>
          </div>
        </section>

        {/* Price Comparison Table */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              Price <span style={{ color: '#e94560' }}>Comparison</span>
            </h2>
            <p className="text-center text-gray-400 mb-10 text-lg">
              See how Nimo's stacks up against the big chains
            </p>

            <div className="overflow-x-auto rounded-xl border border-gray-800">
              <table className="w-full text-left">
                <thead>
                  <tr style={{ backgroundColor: '#1a1a2e' }}>
                    <th className="px-6 py-4 font-bold text-gray-300">Item</th>
                    <th className="px-6 py-4 font-bold" style={{ color: '#f5a623' }}>
                      Nimo's
                    </th>
                    <th className="px-6 py-4 font-bold text-gray-300">Domino's</th>
                    <th className="px-6 py-4 font-bold text-gray-300">Apache</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-800">
                    <td className="px-6 py-4 font-semibold">Pizza</td>
                    <td className="px-6 py-4 font-bold" style={{ color: '#4ade80' }}>
                      €9.00
                    </td>
                    <td className="px-6 py-4 text-gray-400">€14.99</td>
                    <td className="px-6 py-4 text-gray-400">€12.99</td>
                  </tr>
                  <tr className="border-t border-gray-800" style={{ backgroundColor: '#0d0d0d' }}>
                    <td className="px-6 py-4 font-semibold">Burger</td>
                    <td className="px-6 py-4 font-bold" style={{ color: '#4ade80' }}>
                      €6.50
                    </td>
                    <td className="px-6 py-4 text-gray-500">N/A</td>
                    <td className="px-6 py-4 text-gray-500">N/A</td>
                  </tr>
                  <tr className="border-t border-gray-800">
                    <td className="px-6 py-4 font-semibold">Chicken Box</td>
                    <td className="px-6 py-4 font-bold" style={{ color: '#4ade80' }}>
                      €9.50
                    </td>
                    <td className="px-6 py-4 text-gray-500">N/A</td>
                    <td className="px-6 py-4 text-gray-400">€9.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-center text-gray-500 text-sm mt-4">
              * Prices are approximate and may vary. Chain prices based on standard menu items.
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4" style={{ backgroundColor: '#0d0d0d' }}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              Frequently Asked <span style={{ color: '#e94560' }}>Questions</span>
            </h2>

            <div className="space-y-6">
              {faqData.map((faq, index) => (
                <div
                  key={index}
                  className="rounded-xl p-6 border border-gray-800"
                  style={{ backgroundColor: '#1a1a2e' }}
                >
                  <h3 className="text-xl font-bold mb-3 text-white">{faq.question}</h3>
                  <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 text-center" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #080808 100%)' }}>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Order from <span style={{ color: '#e94560' }}>Limerick's Best Takeaway</span>?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Fresh food, unbeatable prices, and fast delivery. What are you waiting for?
            </p>
            <a
              href="/menu"
              className="inline-block text-white font-bold text-lg px-12 py-4 rounded-lg transition-all duration-300 hover:opacity-90 hover:scale-105"
              style={{ backgroundColor: '#e94560' }}
            >
              Order Now
            </a>

            <div className="mt-12 text-gray-400 space-y-2">
              <p className="font-semibold text-white">{siteInfo.name}</p>
              <p>{siteInfo.addressFull}</p>
              <p>
                Phone:{' '}
                <a href={`tel:${siteInfo.phone}`} className="underline" style={{ color: '#f5a623' }}>
                  {siteInfo.phone}
                </a>
              </p>
              <p className="mt-4 space-x-6">
                <Link to="/contact" className="underline" style={{ color: '#e94560' }}>
                  Contact Us
                </Link>
                <Link to="/menu" className="underline" style={{ color: '#e94560' }}>
                  Full Menu
                </Link>
                <Link to="/deals" className="underline" style={{ color: '#e94560' }}>
                  Deals
                </Link>
              </p>
              <p className="mt-3 space-x-6">
                <Link to="/pizza-delivery-limerick" className="underline text-sm" style={{ color: '#f5a623' }}>
                  Pizza Delivery Limerick
                </Link>
                <Link to="/best-takeaway-knocklong" className="underline text-sm" style={{ color: '#f5a623' }}>
                  Takeaway Knocklong
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default TakeawayLimerick;
