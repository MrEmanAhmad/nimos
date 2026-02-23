import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { siteInfo } from '../data/siteInfo';

const PizzaDeliveryLimerick = () => {
  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: 'Pizza Delivery Limerick — Fresh Pizza From €8',
    description: "Order pizza delivery in Limerick from just €8. 11 freshly made pizzas with quality ingredients at unbeatable prices. Delivery Thu-Sun from Nimo's.",
    author: { '@type': 'Organization', name: "Nimo's Limerick" },
    publisher: { '@type': 'Organization', name: "Nimo's Limerick", logo: { '@type': 'ImageObject', url: 'https://nimos.emanahmad.cloud/images/logo.png' } },
    datePublished: '2025-12-01',
    dateModified: '2026-02-22',
    mainEntityOfPage: 'https://nimos.emanahmad.cloud/pizza-delivery-limerick',
    image: 'https://nimos.emanahmad.cloud/images/logo.png',
  };

  const faqs = [
    { question: 'How much does pizza delivery cost in Limerick?', answer: "At Nimo's, our pizzas start from just €8 with delivery available across Limerick. That's up to 46% cheaper than the big chains like Domino's and Apache." },
    { question: 'What days do you deliver pizza in Limerick?', answer: "We deliver Thursday through Sunday across Limerick city and surrounding areas. You can also collect directly from our shop in Knocklong." },
    { question: 'What is the cheapest pizza delivery in Limerick?', answer: "Nimo's offers the cheapest quality pizza delivery in Limerick, starting at just €8 for a freshly made Margherita. Compare that to €13.99+ at Domino's." },
    { question: 'How many pizza varieties does Nimo\'s have?', answer: "We have 11 different pizzas on our menu, from classic Margherita and Pepperoni to loaded options like our signature Nimo's Special (€12) and Meat Feast (€11)." },
    { question: 'Are Nimo\'s pizzas made fresh?', answer: "Yes! Every pizza is made fresh to order. Our dough is prepared in-house daily, we use real mozzarella cheese, and all toppings are fresh." },
    { question: 'Can I order pizza online from Nimo\'s?', answer: "Yes, you can order online through our website or by calling us directly. Browse our full menu and place your order for delivery or collection." },
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  const pizzas = [
    { name: 'Margherita', price: '€8.00', desc: 'Classic tomato sauce and mozzarella cheese on a freshly made base.' },
    { name: 'Pepperoni', price: '€9.50', desc: 'Generous portions of spicy pepperoni slices with mozzarella and tomato sauce.' },
    { name: 'Hawaiian', price: '€9.50', desc: 'Sweet pineapple chunks and tender ham on a bed of melted mozzarella.' },
    { name: 'BBQ Chicken', price: '€10.50', desc: 'Seasoned chicken pieces with smoky BBQ sauce, red onion, and mozzarella.' },
    { name: 'Meat Feast', price: '€11.00', desc: 'Loaded with pepperoni, ham, chicken, and ground beef for the ultimate meat lovers pizza.' },
    { name: 'Vegetarian', price: '€9.50', desc: 'Fresh mushrooms, peppers, onions, sweetcorn, and olives on a tomato and cheese base.' },
    { name: 'Chicken & Sweetcorn', price: '€10.00', desc: 'Tender chicken pieces and sweet golden corn with mozzarella cheese.' },
    { name: 'Tuna', price: '€9.50', desc: 'Flaked tuna with red onion and sweetcorn on a classic cheese and tomato base.' },
    { name: 'Garlic Chicken', price: '€10.50', desc: 'Chicken pieces in a rich garlic butter sauce with mozzarella cheese.' },
    { name: 'Hot & Spicy', price: '€10.50', desc: 'Spicy chicken, jalapenos, peppers, and chilli flakes for those who like it hot.' },
    { name: 'The Nimo\'s Special', price: '€12.00', desc: 'Our signature pizza loaded with pepperoni, chicken, mushrooms, peppers, and onions.' },
  ];

  return (
    <>
      <SEOHead
        title="Pizza Delivery Limerick | Fresh Pizza From EUR8"
        description="Order pizza delivery in Limerick from just EUR8. 11 freshly made pizzas with quality ingredients at unbeatable prices. Delivery Thu-Sun. Order from Nimo's now!"
        keywords="pizza delivery limerick, pizza limerick, cheap pizza limerick, best pizza limerick, order pizza limerick, pizza takeaway limerick, pizza near me limerick"
        path="/pizza-delivery-limerick"
        extraSchema={[blogSchema, faqSchema]}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Menu', url: '/menu' },
          { name: 'Pizza Delivery Limerick' },
        ]}
      />

      <div className="min-h-screen" style={{ backgroundColor: '#080808', color: '#ffffff' }}>
        {/* Hero Section */}
        <section className="relative py-20 px-4 text-center" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #080808 100%)' }}>
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Pizza Delivery in Limerick — From Just{' '}
              <span style={{ color: '#f5a623' }}>€8</span>
            </h1>
            <p className="text-xl md:text-2xl mb-4 opacity-90">
              11 freshly made pizzas. Real ingredients. Prices that beat every chain.
            </p>
            <p className="text-lg text-gray-400 mb-8">
              Delivery available Thursday to Sunday across Limerick
            </p>
            <a
              href="/menu"
              className="inline-block text-white font-bold text-lg px-10 py-4 rounded-lg transition-all duration-300 hover:opacity-90 hover:scale-105"
              style={{ backgroundColor: '#e94560' }}
            >
              Order Pizza Now
            </a>
          </div>
        </section>

        {/* Full Pizza Menu */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              Our Complete <span style={{ color: '#e94560' }}>Pizza Menu</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pizzas.map((pizza, index) => (
                <div
                  key={index}
                  className="rounded-xl p-6 border border-gray-800 transition-all duration-300 hover:border-gray-600"
                  style={{ backgroundColor: '#1a1a2e' }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-white">{pizza.name}</h3>
                    <span className="text-xl font-bold shrink-0 ml-4" style={{ color: '#f5a623' }}>
                      {pizza.price}
                    </span>
                  </div>
                  <p className="text-gray-400 leading-relaxed">{pizza.desc}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <a
                href="/menu"
                className="inline-block text-white font-bold text-lg px-10 py-4 rounded-lg transition-all duration-300 hover:opacity-90 hover:scale-105"
                style={{ backgroundColor: '#e94560' }}
              >
                Order Your Pizza Now
              </a>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16 px-4" style={{ backgroundColor: '#0d0d0d' }}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
              Why Nimo's Pizza Is <span style={{ color: '#e94560' }}>Limerick's Best Kept Secret</span>
            </h2>

            <div className="prose prose-lg prose-invert max-w-none space-y-6 text-gray-300 leading-relaxed">
              <p>
                If you are looking for the best pizza delivery in Limerick, you have just found it. At Nimo's, we
                believe that an incredible pizza should not come with an incredible price tag. That is why our pizzas
                start from just €8 — a fraction of what you would pay at the big chains — without compromising on
                quality, flavour, or portion size. Every pizza we serve is made fresh to order, from the dough right
                through to the toppings.
              </p>

              <p>
                Our dough is prepared in-house daily, giving each pizza a light, crispy base that is the perfect
                foundation for our generous toppings. We use real mozzarella cheese that melts beautifully, rich
                tomato sauce made from quality ingredients, and fresh toppings that you can actually taste. Whether
                you are a fan of the classic Margherita or you prefer something loaded like our signature Nimo's
                Special, every bite delivers on flavour.
              </p>

              <p>
                With 11 different pizza varieties on our menu, there is something for every taste. Classic lovers
                will enjoy our Margherita and Pepperoni. If you like a bit of sweetness, the Hawaiian with pineapple
                and ham is a customer favourite. For meat lovers, our Meat Feast is loaded with pepperoni, ham,
                chicken, and beef. Vegetarians are well catered for with our Vegetarian pizza featuring mushrooms,
                peppers, onions, sweetcorn, and olives. And if you like heat, our Hot and Spicy pizza with jalapenos
                and chilli flakes will hit the spot.
              </p>

              <p>
                The real question is: why pay nearly €15 for a Domino's pizza when you can get an equally delicious,
                freshly made pizza from Nimo's starting at €8? Our customers regularly tell us they prefer our pizzas
                to the chains, and the savings speak for themselves. A family of four can enjoy a pizza night from
                Nimo's for less than the price of two pizzas from the big names. That is the Nimo's difference.
              </p>

              <p>
                Pizza delivery from Nimo's is available Thursday through Sunday across Limerick city and surrounding
                areas. You can also collect your order directly from our shop. Either way, your pizza is made fresh
                when you order it, so it arrives hot and ready to enjoy. Pair it with some of our famous garlic
                cheese chips or onion rings for the ultimate takeaway experience. Browse our{' '}
                <Link to="/menu" className="underline" style={{ color: '#e94560' }}>
                  full menu
                </Link>{' '}
                to see everything we offer, or check our{' '}
                <Link to="/deals" className="underline" style={{ color: '#e94560' }}>
                  deals page
                </Link>{' '}
                for combo offers that save you even more.
              </p>
            </div>
          </div>
        </section>

        {/* Why Our Pizza Beats the Chains */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              Why Our Pizza <span style={{ color: '#f5a623' }}>Beats the Chains</span>
            </h2>
            <p className="text-center text-gray-400 mb-10 text-lg">
              Better pizza. Better prices. It is that simple.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div
                className="rounded-xl p-6 text-center border border-gray-800"
                style={{ backgroundColor: '#1a1a2e' }}
              >
                <div className="text-4xl font-bold mb-2" style={{ color: '#4ade80' }}>
                  46%
                </div>
                <h3 className="text-lg font-semibold mb-2">Cheaper Than Domino's</h3>
                <p className="text-gray-400 text-sm">
                  Our comparable pizza at €8 vs their €14.99 — same size, better value.
                </p>
              </div>
              <div
                className="rounded-xl p-6 text-center border border-gray-800"
                style={{ backgroundColor: '#1a1a2e' }}
              >
                <div className="text-4xl font-bold mb-2" style={{ color: '#f5a623' }}>
                  11
                </div>
                <h3 className="text-lg font-semibold mb-2">Pizza Varieties</h3>
                <p className="text-gray-400 text-sm">
                  From classic Margherita to our loaded Nimo's Special — something for everyone.
                </p>
              </div>
              <div
                className="rounded-xl p-6 text-center border border-gray-800"
                style={{ backgroundColor: '#1a1a2e' }}
              >
                <div className="text-4xl font-bold mb-2" style={{ color: '#e94560' }}>
                  100%
                </div>
                <h3 className="text-lg font-semibold mb-2">Fresh Ingredients</h3>
                <p className="text-gray-400 text-sm">
                  Dough made in-house daily. Real mozzarella. Fresh toppings on every pizza.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-800">
              <table className="w-full text-left">
                <thead>
                  <tr style={{ backgroundColor: '#1a1a2e' }}>
                    <th className="px-6 py-4 font-bold text-gray-300">Pizza Type</th>
                    <th className="px-6 py-4 font-bold" style={{ color: '#f5a623' }}>
                      Nimo's
                    </th>
                    <th className="px-6 py-4 font-bold text-gray-300">Domino's</th>
                    <th className="px-6 py-4 font-bold text-gray-300">Apache</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-800">
                    <td className="px-6 py-4 font-semibold">Margherita</td>
                    <td className="px-6 py-4 font-bold" style={{ color: '#4ade80' }}>
                      €8.00
                    </td>
                    <td className="px-6 py-4 text-gray-400">€13.99</td>
                    <td className="px-6 py-4 text-gray-400">€11.99</td>
                  </tr>
                  <tr className="border-t border-gray-800" style={{ backgroundColor: '#0d0d0d' }}>
                    <td className="px-6 py-4 font-semibold">Pepperoni</td>
                    <td className="px-6 py-4 font-bold" style={{ color: '#4ade80' }}>
                      €9.50
                    </td>
                    <td className="px-6 py-4 text-gray-400">€14.99</td>
                    <td className="px-6 py-4 text-gray-400">€12.99</td>
                  </tr>
                  <tr className="border-t border-gray-800">
                    <td className="px-6 py-4 font-semibold">Meat Feast</td>
                    <td className="px-6 py-4 font-bold" style={{ color: '#4ade80' }}>
                      €11.00
                    </td>
                    <td className="px-6 py-4 text-gray-400">€16.99</td>
                    <td className="px-6 py-4 text-gray-400">€14.99</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-center text-gray-500 text-sm mt-4">
              * Chain prices are approximate based on standard menu pricing.
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4" style={{ backgroundColor: '#0d0d0d' }}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">
              Pizza Delivery <span style={{ color: '#f5a623' }}>FAQ</span>
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
              Craving Pizza? <span style={{ color: '#e94560' }}>Order from Nimo's</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Freshly made pizza from €8 with delivery across Limerick. Why pay more?
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

export default PizzaDeliveryLimerick;
