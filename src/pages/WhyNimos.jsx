import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Why choose Nimo\'s over other takeaways in Limerick?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Nimo\'s uses fresh, locally sourced ingredients with everything made to order. We offer delivery across Knocklong, Hospital, Kilmallock, Bruff and Limerick with a menu of over 50 items at unbeatable prices.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Nimo\'s deliver to my area?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Nimo\'s delivers to Knocklong, Hospital, Kilmallock, Bruff, and surrounding areas in Co. Limerick every Thursday to Sunday from 3pm to 10:30pm (10pm Sunday).',
      },
    },
    {
      '@type': 'Question',
      name: 'What makes Nimo\'s pizza different?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Our pizzas are made with hand-stretched dough, premium mozzarella, and generous toppings. Every pizza is made fresh to order — never pre-made or frozen.',
      },
    },
  ],
};

export default function WhyNimos() {
  return (
    <>
      <SEOHead
        title="Why Choose Nimo's - Best Takeaway Limerick"
        description="Discover why Nimo's is rated the best takeaway in Knocklong & Limerick. Fresh ingredients, fast delivery, 50+ menu items, unbeatable value. Order online today!"
        keywords="why nimos, best takeaway limerick, best takeaway knocklong, fresh food limerick, food delivery limerick, nimos reviews"
        path="/why-nimos"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Why Nimo\'s', url: '/why-nimos' },
        ]}
        extraSchema={faqSchema}
      />

      <div className="min-h-screen bg-[#0a0a0a] text-white">
        {/* Hero */}
        <section className="pt-32 pb-16 px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Why Choose{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e94560] to-[#f5a623]">
              Nimo's?
            </span>
          </h1>
          <p className="text-[#e0e0e0]/70 max-w-2xl mx-auto text-lg">
            There are plenty of takeaways in Limerick. Here's why locals keep coming back to us.
          </p>
        </section>

        {/* Reasons */}
        <section className="pb-16 px-4 max-w-4xl mx-auto">
          <div className="space-y-12">
            {[
              {
                emoji: '🍕',
                title: 'Fresh, Never Frozen',
                text: 'Every single order is made fresh. Our dough is hand-stretched daily, our sauces are homemade, and our ingredients are sourced locally where possible. No shortcuts, no compromises.',
              },
              {
                emoji: '💰',
                title: 'Unbeatable Value',
                text: 'Pizzas from just €8, burgers from €5, meal deals that actually save you money. We believe great food shouldn\'t cost a fortune. Check our deals page for the latest offers.',
              },
              {
                emoji: '🚗',
                title: 'Fast, Reliable Delivery',
                text: 'We deliver across Knocklong, Hospital, Kilmallock, Bruff, and surrounding areas every Thursday to Sunday. Pickup available daily from 3pm. Hot food, at your door, on time.',
              },
              {
                emoji: '📋',
                title: '50+ Menu Items',
                text: 'From classic Margherita to loaded chicken boxes, spicy kebabs to crispy wraps — we\'ve got something for everyone. Fussy eaters, big appetites, late-night cravings — sorted.',
              },
              {
                emoji: '⭐',
                title: 'Loved by Locals',
                text: 'Don\'t just take our word for it. Our customers rate us 4.8 out of 5 stars. Once you try Nimo\'s, you\'ll understand why people drive from across Limerick just for our food.',
              },
              {
                emoji: '❤️',
                title: 'Family-Run, Community-Focused',
                text: 'Nimo\'s isn\'t a chain. We\'re a family business that cares about our community. We know our regulars by name, and we treat every order like it\'s going to our own family.',
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-6 items-start">
                <span className="text-4xl flex-shrink-0">{item.emoji}</span>
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-white">{item.title}</h2>
                  <p className="text-[#e0e0e0]/70 leading-relaxed">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="pb-16 px-4 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e94560] to-[#f5a623]">
              Common Questions
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
          <h2 className="text-2xl font-bold mb-6 text-white">Ready to try the best takeaway in Limerick?</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/menu"
              className="px-8 py-3 bg-[#e94560] text-white font-bold rounded-full hover:bg-[#d63050] transition-colors"
            >
              View Menu
            </Link>
            <Link
              to="/deals"
              className="px-8 py-3 bg-transparent border-2 border-[#f5a623] text-[#f5a623] font-bold rounded-full hover:bg-[#f5a623] hover:text-black transition-colors"
            >
              See Deals
            </Link>
          </div>
        </section>

        {/* Related Pages */}
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
            <Link to="/chicken-box-limerick" className="underline" style={{ color: '#f5a623' }}>
              Chicken Box Limerick
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
