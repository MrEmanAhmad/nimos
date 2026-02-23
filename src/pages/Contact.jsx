import { useState } from 'react';
import { Link } from 'react-router-dom';
import { siteInfo } from '../data/siteInfo';
import SEOHead from '../components/SEOHead';
import {
  Phone,
  MapPin,
  Clock,
  Send,
  Truck,
  Store,
  CheckCircle,
  AlertCircle,
  Loader2,
  ShoppingCart,
  ChevronRight,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const sanitize = (str) => str.replace(/<[^>]*>/g, '').trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    // Client-side validation
    if (!formData.name.trim()) {
      setStatus('error');
      setErrorMessage('Please enter your name.');
      return;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!formData.message.trim()) {
      setStatus('error');
      setErrorMessage('Please enter a message.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: sanitize(formData.name),
          email: sanitize(formData.email),
          phone: sanitize(formData.phone),
          message: sanitize(formData.message),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Something went wrong (${res.status})`);
      }

      setStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setStatus('idle'), 6000);
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.message || 'Failed to send message. Please try again.');
    }
  };

  const addressLine = siteInfo?.address
    ? `${siteInfo.address.street}, ${siteInfo.address.area}, ${siteInfo.address.eircode}`
    : 'The Cross, Knocklong East, Co. Limerick, V94 TY05';

  const contactFaqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Where is Nimo\'s located?',
        acceptedAnswer: { '@type': 'Answer', text: 'Nimo\'s is located at The Cross, Knocklong East, Co. Limerick, Ireland (Eircode: V94 TY05). We\'re easy to find right at the crossroads in Knocklong village.' },
      },
      {
        '@type': 'Question',
        name: 'What are Nimo\'s opening hours?',
        acceptedAnswer: { '@type': 'Answer', text: 'We\'re open daily from 3pm. Delivery is available Thursday to Sunday (closing 10:30pm Thu-Sat, 10pm Sun). Pickup is available Monday to Wednesday until 10:30pm.' },
      },
      {
        '@type': 'Question',
        name: 'What is Nimo\'s phone number?',
        acceptedAnswer: { '@type': 'Answer', text: 'You can reach us at +353 6243300. Call to place an order or ask about our menu.' },
      },
      {
        '@type': 'Question',
        name: 'What areas does Nimo\'s deliver to?',
        acceptedAnswer: { '@type': 'Answer', text: 'We deliver to Knocklong, Hospital, Kilmallock, Bruff, and surrounding areas in Co. Limerick. Delivery is available Thursday to Sunday from 3pm.' },
      },
      {
        '@type': 'Question',
        name: 'What payment methods does Nimo\'s accept?',
        acceptedAnswer: { '@type': 'Answer', text: 'We accept cash and credit/debit card payments both in-store and on delivery.' },
      },
    ],
  };

  return (
    <>
    <SEOHead
      title="Contact Us - Nimo's Takeaway Knocklong"
      description="Contact Nimo's Limerick at +353 6243300. Find us at The Cross, Knocklong East, Co. Limerick V94 TY05. Delivery Thu-Sun, pickup daily from 3pm."
      keywords="nimos limerick contact, takeaway knocklong phone, nimos address, nimos opening hours"
      path="/contact"
      breadcrumbs={[
        { name: 'Home', url: '/' },
        { name: 'Contact' },
      ]}
      extraSchema={contactFaqSchema}
    />
    <div className="min-h-screen bg-[#080808]">
      {/* ===== HERO BANNER ===== */}
      <section className="pt-28 pb-12 px-4 bg-[#0f0f0f]">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Get in <span className="text-[#e94560]">Touch</span>
          </h1>
          <p className="text-[#e0e0e0]/70 text-lg max-w-xl mx-auto">
            Have a question, feedback, or need help with an order? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* ===== CONTACT CARDS ===== */}
      <section className="py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Phone Card */}
            <a
              href={`tel:${siteInfo?.phone || '+353 6243300'}`}
              className="bg-[#1a1a2e] rounded-2xl p-8 border border-white/5 hover:border-[#e94560]/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#e94560]/10 flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 bg-[#e94560]/10 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-[#e94560]/20 transition-colors">
                <Phone className="w-7 h-7 text-[#e94560]" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Call Us</h2>
              <p className="text-[#e0e0e0]/70 text-sm mb-3">Tap to call directly</p>
              <p className="text-[#f5a623] font-bold text-lg group-hover:text-[#e94560] transition-colors">
                {siteInfo?.phoneDisplay || '+353 6243300'}
              </p>
            </a>

            {/* Order Online Card */}
            <Link
              to="/menu"
              className="bg-[#1a1a2e] rounded-2xl p-8 border border-white/5 hover:border-[#f5a623]/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#f5a623]/10 flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 bg-[#f5a623]/10 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-[#f5a623]/20 transition-colors">
                <ShoppingCart className="w-7 h-7 text-[#f5a623]" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Order Online</h2>
              <p className="text-[#e0e0e0]/70 text-sm mb-3">Browse our full menu</p>
              <span className="text-[#f5a623] font-bold text-lg group-hover:text-[#e94560] transition-colors flex items-center gap-2">
                View Menu &amp; Order
                <ChevronRight className="w-4 h-4" />
              </span>
            </Link>

            {/* Visit Us Card */}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${siteInfo?.geo?.lat || 52.4631},${siteInfo?.geo?.lng || -8.5672}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#1a1a2e] rounded-2xl p-8 border border-white/5 hover:border-[#e94560]/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#e94560]/10 flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 bg-[#e94560]/10 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-[#e94560]/20 transition-colors">
                <MapPin className="w-7 h-7 text-[#e94560]" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Visit Us</h2>
              <p className="text-[#e0e0e0]/70 text-sm mb-3">Come say hello</p>
              <p className="text-[#f5a623] font-bold text-sm group-hover:text-[#e94560] transition-colors">
                {addressLine}
              </p>
            </a>
          </div>
        </div>
      </section>

      {/* ===== GOOGLE MAP ===== */}
      <section className="py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl overflow-hidden border border-white/5 h-[400px] md:h-[500px]">
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
        </div>
      </section>

      {/* ===== HOURS SECTION ===== */}
      <section className="py-16 px-4 bg-[#0f0f0f]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Opening <span className="text-[#e94560]">Hours</span>
            </h2>
            <p className="text-[#e0e0e0]/70">When you can reach us and place orders.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Delivery Hours */}
            <div className="bg-[#1a1a2e] rounded-2xl p-8 border border-white/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#e94560]/10 rounded-xl flex items-center justify-center">
                  <Truck className="w-6 h-6 text-[#e94560]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Delivery Hours</h3>
                  <p className="text-[#e0e0e0]/70 text-sm">~60 min estimated</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-[#e0e0e0]/70 text-sm">Thursday - Saturday</span>
                  <span className="text-white font-semibold text-sm">3:00 PM - 10:30 PM</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-[#e0e0e0]/70 text-sm">Sunday</span>
                  <span className="text-white font-semibold text-sm">3:00 PM - 10:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[#e0e0e0]/70 text-sm">Mon - Wed</span>
                  <span className="text-[#e0e0e0]/60 text-sm">Closed for delivery</span>
                </div>
              </div>
            </div>

            {/* Pickup Hours */}
            <div className="bg-[#1a1a2e] rounded-2xl p-8 border border-white/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#f5a623]/10 rounded-xl flex items-center justify-center">
                  <Store className="w-6 h-6 text-[#f5a623]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Pickup Hours</h3>
                  <p className="text-[#e0e0e0]/70 text-sm">~15 min estimated</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-[#e0e0e0]/70 text-sm">Monday - Saturday</span>
                  <span className="text-white font-semibold text-sm">3:00 PM - 10:30 PM</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-[#e0e0e0]/70 text-sm">Sunday</span>
                  <span className="text-white font-semibold text-sm">3:00 PM - 10:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[#e0e0e0]/70 text-sm">Collection</span>
                  <span className="text-[#f5a623] text-sm font-medium">Available daily</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CONTACT FORM ===== */}
      <section className="py-16 px-4 bg-[#080808]">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Send a <span className="text-[#f5a623]">Message</span>
            </h2>
            <p className="text-[#e0e0e0]/70">
              Questions, feedback, or special requests? Drop us a message.
            </p>
          </div>

          <div className="bg-[#1a1a2e] rounded-2xl p-8 md:p-10 border border-white/5">
            {status === 'success' ? (
              <div className="text-center py-10" role="status" aria-live="polite">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
                <p className="text-[#e0e0e0]/70">
                  Thank you for reaching out. We'll get back to you soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6" aria-label="Contact form">
                {/* Error Banner */}
                {status === 'error' && errorMessage && (
                  <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3" role="alert">
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <p className="text-red-400 text-sm">{errorMessage}</p>
                  </div>
                )}

                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-[#e0e0e0]/80 text-sm font-medium mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    aria-required="true"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 text-[#e0e0e0] placeholder-[#e0e0e0]/20 focus:outline-none focus:border-[#e94560]/50 focus:ring-1 focus:ring-[#e94560]/30 transition-all"
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-[#e0e0e0]/80 text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    aria-required="true"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 text-[#e0e0e0] placeholder-[#e0e0e0]/20 focus:outline-none focus:border-[#e94560]/50 focus:ring-1 focus:ring-[#e94560]/30 transition-all"
                  />
                </div>

                {/* Phone Field */}
                <div>
                  <label htmlFor="phone" className="block text-[#e0e0e0]/80 text-sm font-medium mb-2">
                    Phone Number <span className="text-[#e0e0e0]/60">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+353 ..."
                    className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 text-[#e0e0e0] placeholder-[#e0e0e0]/20 focus:outline-none focus:border-[#e94560]/50 focus:ring-1 focus:ring-[#e94560]/30 transition-all"
                  />
                </div>

                {/* Message Field */}
                <div>
                  <label htmlFor="message" className="block text-[#e0e0e0]/80 text-sm font-medium mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    aria-required="true"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                    className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 text-[#e0e0e0] placeholder-[#e0e0e0]/20 focus:outline-none focus:border-[#e94560]/50 focus:ring-1 focus:ring-[#e94560]/30 transition-all resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full flex items-center justify-center gap-2 bg-[#e94560] hover:bg-[#d63050] disabled:bg-[#e94560]/50 disabled:cursor-not-allowed text-white font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 hover:shadow-lg hover:shadow-[#e94560]/30"
                >
                  {status === 'submitting' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ===== INTERNAL LINKS ===== */}
      <section className="py-10 px-4 bg-[#080808]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[#e0e0e0]/70 mb-4">Looking for something else?</p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link to="/menu" className="text-[#e94560] hover:text-[#f5a623] font-semibold transition-colors">View Our Menu</Link>
            <Link to="/deals" className="text-[#e94560] hover:text-[#f5a623] font-semibold transition-colors">Today's Deals</Link>
            <Link to="/takeaway-limerick" className="text-[#e94560] hover:text-[#f5a623] font-semibold transition-colors">Takeaway Limerick</Link>
            <Link to="/pizza-delivery-limerick" className="text-[#e94560] hover:text-[#f5a623] font-semibold transition-colors">Pizza Delivery</Link>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
