import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How much is a chicken box at Nimo\'s?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Chicken boxes at Nimo\'s start from just €6. Our meal deals include chips and a drink for incredible value. Check our menu for the latest prices.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I get a chicken box delivered in Limerick?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! We deliver chicken boxes across Knocklong, Hospital, Kilmallock, Bruff and surrounding Limerick areas every Thursday to Sunday from 3pm. Pickup is available daily.',
      },
    },
    {
      '@type': 'Question',
      name: 'What comes in the Nimo\'s chicken box?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Our chicken boxes include crispy fried chicken pieces with your choice of chips, coleslaw, or other sides. We also offer spicy chicken options, chicken tenders, chicken burgers, and chicken wraps.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is the chicken at Nimo\'s halal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, all chicken at Nimo\'s is halal certified. We take pride in serving food that everyone can enjoy.',
      },
    },
  ],
};

export default function ChickenBoxLimerick() {
  return (
    <>
      <SEOHead
        title="Chicken Box Limerick - Crispy Chicken Delivery"
        description="Order the best chicken box in Limerick from Nimo's! Crispy fried chicken, tenders, wings & meal deals from €6. Halal. Delivery Thu-Sun across Knocklong & Limerick."
        keywords="chicken box limerick, chicken delivery limerick, fried chicken limerick, chicken takeaway knocklong, halal chicken limerick, chicken meal deal limerick, chicken box near me"
        path="/chicken-box-limerick"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Menu', url: '/menu' },
          { name: 'Chicken Box Limerick', url: '/chicken-box-limerick' },
        ]}
        extraSchema={faqSchema}
      />

      <div className="min-h-screen bg-[#0a0a0a] text-white">
        {/* Hero */}
        <section className="pt-32 pb-16 px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e94560] to-[#f5a623]">
              Chicken Box
            </span>{' '}
            Limerick
          </h1>
          <p className="text-[#e0e0e0]/70 max-w-2xl mx-auto text-lg">
            Crispy, golden, and packed with flavour. Nimo's chicken boxes are the talk of Limerick — and for good reason.
          </p>
        </section>

        {/* Content */}
        <section className="pb-16 px-4 max-w-4xl mx-auto">
          <div className="prose prose-invert max-w-none space-y-8">
            <div className="bg-[#121212] rounded-2xl p-8 border border-white/5">
              <h2 className="text-2xl font-bold mb-4 text-white">🍗 The Best Chicken Box in Limerick</h2>
              <p className="text-[#e0e0e0]/70 leading-relaxed mb-4">
                Looking for a proper chicken box in Limerick? You've found it. At Nimo's, our chicken is marinated for 24 hours,
                coated in our secret spice blend, and fried to crispy perfection. Every. Single. Time.
              </p>
              <p className="text-[#e0e0e0]/70 leading-relaxed">
                Whether you're after a quick snack box or a full chicken meal deal with chips and a drink,
                we've got you covered. Starting from just <strong className="text-[#f5a623]">€6</strong>, our chicken boxes
                are the best value in Co. Limerick.
              </p>
            </div>

            <div className="bg-[#121212] rounded-2xl p-8 border border-white/5">
              <h2 className="text-2xl font-bold mb-4 text-white">📋 Our Chicken Range</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { name: 'Classic Chicken Box', desc: 'Crispy fried chicken pieces with chips', price: 'From €6' },
                  { name: 'Chicken Tenders', desc: 'Golden breaded tenders with dip', price: 'From €5' },
                  { name: 'Spicy Chicken Box', desc: 'Extra kick with our hot spice blend', price: 'From €7' },
                  { name: 'Chicken Burger', desc: 'Crispy fillet in a toasted bun', price: 'From €5' },
                  { name: 'Chicken Wrap', desc: 'Grilled or crispy in a warm tortilla', price: 'From €6' },
                  { name: 'Family Chicken Bucket', desc: 'Sharing size — feeds 3-4', price: 'From €16' },
                ].map((item, i) => (
                  <div key={i} className="p-4 bg-[#0a0a0a] rounded-xl border border-white/5">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-white">{item.name}</h3>
                      <span className="text-[#f5a623] font-semibold text-sm whitespace-nowrap ml-2">{item.price}</span>
                    </div>
                    <p className="text-[#e0e0e0]/50 text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
              <p className="text-[#e0e0e0]/50 text-sm mt-4 italic">
                * Prices shown are starting prices. See our <Link to="/menu" className="underline" style={{ color: '#e94560' }}>full menu</Link> for
                all options and current pricing.
              </p>
            </div>

            <div className="bg-[#121212] rounded-2xl p-8 border border-white/5">
              <h2 className="text-2xl font-bold mb-4 text-white">🕌 100% Halal Chicken</h2>
              <p className="text-[#e0e0e0]/70 leading-relaxed">
                All chicken at Nimo's is <strong className="text-white">halal certified</strong>. We believe everyone deserves
                great food they can enjoy with confidence. Our suppliers are fully certified and we maintain strict standards
                across our entire chicken range.
              </p>
            </div>

            <div className="bg-[#121212] rounded-2xl p-8 border border-white/5">
              <h2 className="text-2xl font-bold mb-4 text-white">🚗 Chicken Box Delivery Limerick</h2>
              <p className="text-[#e0e0e0]/70 leading-relaxed mb-4">
                We deliver our chicken boxes hot and fresh across Co. Limerick every <strong className="text-white">Thursday to Sunday, 3pm–10:30pm</strong> (10pm Sunday).
                Delivery areas include Knocklong, Hospital, Kilmallock, Bruff, and surrounding areas.
              </p>
              <p className="text-[#e0e0e0]/70 leading-relaxed">
                Can't wait for delivery? <strong className="text-white">Pickup is available daily from 3pm</strong> at our
                shop in Knocklong. Order ahead online and skip the queue.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="pb-16 px-4 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e94560] to-[#f5a623]">
              Chicken Box FAQs
            </span>
          </h2>
          <div className="space-y-6">
            {faqSchema.mainEntity.map((faq, i) => (
              <div key={i} className="bg-[#121212] rounded-xl p-6 border border-white/5">
                <h3 className="text-lg font-semibold text-white mb-2">{faq.name}</h3>
                <p className="text-[#e0e0e0]/60 leading-relaxed">{faq.acceptedAnswer.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="pb-20 px-4 text-center">
          <h2 className="text-2xl font-bold mb-6 text-white">Craving chicken? Order now!</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/menu"
              className="px-8 py-3 bg-[#e94560] text-white font-bold rounded-full hover:bg-[#d63050] transition-colors"
            >
              Order Now
            </Link>
            <Link
              to="/deals"
              className="px-8 py-3 bg-transparent border-2 border-[#f5a623] text-[#f5a623] font-bold rounded-full hover:bg-[#f5a623] hover:text-black transition-colors"
            >
              See Deals
            </Link>
          </div>
        </section>

        {/* Related */}
        <section className="pb-16 px-4 max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/best-takeaway-knocklong" className="underline" style={{ color: '#f5a623' }}>
              Best Takeaway Knocklong
            </Link>
            <Link to="/takeaway-limerick" className="underline" style={{ color: '#f5a623' }}>
              Takeaway Limerick
            </Link>
            <Link to="/pizza-delivery-limerick" className="underline" style={{ color: '#f5a623' }}>
              Pizza Delivery Limerick
            </Link>
            <Link to="/why-nimos" className="underline" style={{ color: '#f5a623' }}>
              Why Nimo's
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
