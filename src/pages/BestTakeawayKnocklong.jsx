import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { siteInfo } from '../data/siteInfo';

const BestTakeawayKnocklong = () => {
  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: 'Best Takeaway in Knocklong — Pizza, Burgers & Kebabs',
    description: "Nimo's is Knocklong's favourite takeaway. Pizza from €8, burgers from €5, kebabs from €9. Delivery to Knocklong, Hospital, Kilmallock & Bruff.",
    author: { '@type': 'Organization', name: "Nimo's Limerick" },
    publisher: { '@type': 'Organization', name: "Nimo's Limerick", logo: { '@type': 'ImageObject', url: 'https://nimos.emanahmad.cloud/images/logo.png' } },
    datePublished: '2025-12-01',
    dateModified: '2026-02-22',
    mainEntityOfPage: 'https://nimos.emanahmad.cloud/best-takeaway-knocklong',
    image: 'https://nimos.emanahmad.cloud/images/logo.png',
  };

  const faqs = [
    { question: 'What is the best takeaway in Knocklong?', answer: "Nimo's Limerick is Knocklong's top-rated takeaway, offering pizza from €8, burgers from €5, and kebabs from €9. We deliver to Knocklong, Hospital, Kilmallock, and Bruff." },
    { question: 'Does Nimo\'s deliver to Knocklong?', answer: "Yes! Knocklong is our home base so delivery is fast and reliable. We also deliver to surrounding areas including Hospital, Kilmallock, and Bruff." },
    { question: 'What food can I order from Nimo\'s?', answer: "We offer a wide range including 11 pizza varieties, burgers, chicken kebabs, chicken boxes, chips, and sides. Check our full menu online." },
    { question: 'What are the opening hours for Nimo\'s Knocklong?', answer: "We are open Thursday to Sunday for delivery and collection. Check our website or call us for exact times." },
    { question: 'How much is delivery from Nimo\'s?', answer: "Delivery charges vary by area. Knocklong and nearby areas enjoy low delivery fees. Order online or call us to confirm." },
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  const featuredItems = [
    { name: 'Margherita Pizza', price: '€8.00', desc: 'Classic tomato & mozzarella on a freshly made base' },
    { name: 'Pepperoni Pizza', price: '€9.50', desc: 'Loaded with spicy pepperoni & melted mozzarella' },
    { name: 'Quarter Pounder Burger', price: '€5.50', desc: 'Juicy fresh beef patty with all the trimmings' },
    { name: 'Chicken Kebab', price: '€9.00', desc: 'Tender seasoned chicken with fresh salad & sauce' },
    { name: 'Chicken Box (3pc)', price: '€9.50', desc: 'Crispy fried chicken with chips & a drink' },
    { name: 'Garlic Cheese Chips', price: '€5.50', desc: 'Golden chips with garlic butter & melted cheese' },
  ];

  const deliveryAreas = [
    { area: 'Knocklong', note: 'Our home base — fast delivery guaranteed' },
    { area: 'Hospital', note: 'Just minutes away from our shop' },
    { area: 'Kilmallock', note: 'Regular deliveries to Kilmallock town' },
    { area: 'Bruff', note: 'Serving the Bruff community' },
  ];

  return (
    <>
      <SEOHead
        title="Best Takeaway Knocklong - Pizza & Burgers"
        description="Nimo's is Knocklong's favourite takeaway. Pizza from EUR8, burgers from EUR5, kebabs from EUR9. Delivery to Knocklong, Hospital, Kilmallock & Bruff. Order now!"
        keywords="takeaway knocklong, food delivery knocklong, pizza knocklong, burger knocklong, takeaway hospital limerick, takeaway kilmallock, takeaway bruff, best takeaway knocklong"
        path="/best-takeaway-knocklong"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Best Takeaway Knocklong' },
        ]}
        extraSchema={[blogSchema, faqSchema]}
      />

      <div className="min-h-screen" style={{ backgroundColor: '#080808', color: '#ffffff' }}>
        {/* Hero Section */}
        <section className="relative py-20 px-4 text-center" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #080808 100%)' }}>
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Knocklong's <span style={{ color: '#e94560' }}>Favourite</span> Takeaway
            </h1>
            <p className="text-xl md:text-2xl mb-4 opacity-90">
              Pizza from <span style={{ color: '#f5a623' }}>€8</span> &middot; Burgers from{' '}
              <span style={{ color: '#f5a623' }}>€5</span> &middot; Kebabs from{' '}
              <span style={{ color: '#f5a623' }}>€9</span>
            </p>
            <p className="text-lg text-gray-400 mb-8">
              Delivering to Knocklong, Hospital, Kilmallock &amp; Bruff
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
              Your <span style={{ color: '#e94560' }}>Local Takeaway</span> in Knocklong
            </h2>

            <div className="prose prose-lg prose-invert max-w-none space-y-6 text-gray-300 leading-relaxed">
              <p>
                Nimo's is proud to be Knocklong's go-to takeaway, serving the local community with freshly made
                food at prices that genuinely represent great value. We are not a faceless chain operating from a
                distant city — we are your neighbours, and we take pride in being part of the Knocklong community.
                Every meal we prepare is made with care, using quality ingredients, and served with the kind of
                personal touch you only get from a local business.
              </p>

              <p>
                Living in a smaller town does not mean you should have to settle for limited options or long drives
                to find a decent takeaway. That is exactly why Nimo's exists. Our menu features over 50 items
                covering everything from freshly made pizzas and juicy burgers to loaded kebabs, crispy chicken
                boxes, wraps, and a huge selection of sides. Whatever you are in the mood for, chances are we have
                it on our <Link to="/menu" className="underline" style={{ color: '#e94560' }}>menu</Link>.
              </p>

              <p>
                Our pizzas start from just €8 and are made fresh to order with dough prepared in-house daily. Our
                burgers use fresh beef patties and come loaded with your choice of toppings from just €5. Our kebabs
                are a local favourite, with tender, seasoned meat served with crisp salad and your choice of sauce
                from €9. And for those nights when only a chicken box will do, our crispy fried chicken boxes with
                chips and a drink start at just €9.50.
              </p>

              <p>
                We understand that convenience matters, especially in the evenings when you just want great food
                delivered to your door. That is why we offer delivery across Knocklong and the surrounding areas
                including Hospital, Kilmallock, and Bruff every Thursday through Sunday. Whether you are having a
                quiet night in, feeding the family after a busy day, or hosting friends for a casual get-together,
                Nimo's makes it easy and affordable.
              </p>

              <p>
                The feedback we receive from our Knocklong customers is what drives us to keep improving. People
                tell us they love the generous portions, the consistent quality, and the fact that they can feed
                the whole family without breaking the bank. We also offer regular{' '}
                <Link to="/deals" className="underline" style={{ color: '#e94560' }}>
                  deals and combo offers
                </Link>{' '}
                that make ordering even better value. It is this combination of quality, price, and community spirit
                that has made Nimo's the favourite takeaway in Knocklong and the surrounding areas.
              </p>
            </div>
          </div>
        </section>

        {/* Delivery Areas */}
        <section className="py-16 px-4" style={{ backgroundColor: '#0d0d0d' }}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              Delivery <span style={{ color: '#f5a623' }}>Areas</span>
            </h2>
            <p className="text-center text-gray-400 mb-10 text-lg">
              We deliver Thursday to Sunday across Knocklong and surrounding towns
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {deliveryAreas.map((area, index) => (
                <div
                  key={index}
                  className="rounded-xl p-6 border border-gray-800 flex items-start gap-4"
                  style={{ backgroundColor: '#1a1a2e' }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 font-bold text-lg"
                    style={{ backgroundColor: '#e94560' }}
                  >
                    {area.area.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{area.area}</h3>
                    <p className="text-gray-400">{area.note}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-gray-500 mt-8">
              Not sure if we deliver to your area?{' '}
              <Link to="/contact" className="underline" style={{ color: '#e94560' }}>
                Get in touch
              </Link>{' '}
              and we will let you know.
            </p>
          </div>
        </section>

        {/* Featured Items */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              Popular Items in <span style={{ color: '#e94560' }}>Knocklong</span>
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

        {/* Why Choose Nimo's */}
        <section className="py-16 px-4" style={{ backgroundColor: '#0d0d0d' }}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">
              Why Knocklong <span style={{ color: '#f5a623' }}>Chooses Nimo's</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                className="rounded-xl p-6 text-center border border-gray-800"
                style={{ backgroundColor: '#1a1a2e' }}
              >
                <div className="text-4xl font-bold mb-3" style={{ color: '#f5a623' }}>
                  50+
                </div>
                <h3 className="text-lg font-semibold mb-2">Menu Items</h3>
                <p className="text-gray-400 text-sm">
                  Pizza, burgers, kebabs, chicken boxes, wraps, sides, and more.
                </p>
              </div>
              <div
                className="rounded-xl p-6 text-center border border-gray-800"
                style={{ backgroundColor: '#1a1a2e' }}
              >
                <div className="text-4xl font-bold mb-3" style={{ color: '#4ade80' }}>
                  €5
                </div>
                <h3 className="text-lg font-semibold mb-2">Burgers From</h3>
                <p className="text-gray-400 text-sm">
                  Fresh beef burgers at prices you will not find anywhere else locally.
                </p>
              </div>
              <div
                className="rounded-xl p-6 text-center border border-gray-800"
                style={{ backgroundColor: '#1a1a2e' }}
              >
                <div className="text-4xl font-bold mb-3" style={{ color: '#e94560' }}>
                  4
                </div>
                <h3 className="text-lg font-semibold mb-2">Towns Covered</h3>
                <p className="text-gray-400 text-sm">
                  Knocklong, Hospital, Kilmallock, and Bruff — we have you covered.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4" style={{ backgroundColor: '#0d0d0d' }}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">
              Knocklong Takeaway <span style={{ color: '#f5a623' }}>FAQ</span>
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="rounded-xl p-6 border border-gray-800" style={{ backgroundColor: '#1a1a2e' }}>
                  <h3 className="text-lg font-bold mb-2 text-white">{faq.question}</h3>
                  <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 text-center" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #080808 100%)' }}>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Order in <span style={{ color: '#e94560' }}>Knocklong</span>?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Fresh food, great prices, and delivery right to your door. Order from your local favourite today.
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
                <Link to="/takeaway-limerick" className="underline text-sm" style={{ color: '#f5a623' }}>
                  Takeaway Limerick
                </Link>
                <Link to="/pizza-delivery-limerick" className="underline text-sm" style={{ color: '#f5a623' }}>
                  Pizza Delivery Limerick
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default BestTakeawayKnocklong;
