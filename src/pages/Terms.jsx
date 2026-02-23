import { Link } from 'react-router-dom'
import SEOHead from '../components/SEOHead'

export default function Terms() {
  return (
    <>
      <SEOHead
        title="Terms of Service - Nimo's Limerick"
        description="Terms of Service for Nimo's Limerick takeaway and delivery. Ordering terms, delivery policy, payment, refunds, and account information."
        keywords="nimos limerick terms, takeaway terms of service, delivery policy knocklong"
        path="/terms"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Terms of Service' },
        ]}
      />
      <div className="min-h-screen bg-[#080808]">
        {/* Hero */}
        <section className="pt-28 pb-12 px-4 bg-[#0f0f0f]">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Terms of <span className="text-[#e94560]">Service</span>
            </h1>
            <p className="text-[#e0e0e0]/70 text-lg max-w-xl mx-auto">
              Please read these terms carefully before using our ordering service.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#1a1a2e] rounded-2xl p-8 md:p-12 border border-white/5 space-y-10">
              <p className="text-gray-400 text-sm">Last updated: February 2026</p>

              {/* 1. Introduction */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
                <p className="text-[#e0e0e0]/70 leading-relaxed">
                  These Terms of Service ("Terms") govern your use of the Nimo's Limerick website
                  and online ordering platform. By placing an order or creating an account, you agree
                  to be bound by these Terms. Nimo's Limerick is operated from The Cross, Knocklong East,
                  Co. Limerick, V94 TY05, Ireland.
                </p>
              </div>

              {/* 2. Ordering Terms */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">2. Ordering Terms</h2>
                <ul className="space-y-3 text-[#e0e0e0]/70 leading-relaxed list-disc list-inside">
                  <li>All orders placed through our website are subject to availability and confirmation by Nimo's Limerick.</li>
                  <li>Menu prices are displayed in Euro and include VAT where applicable. Prices may change without prior notice.</li>
                  <li>We reserve the right to refuse or cancel any order at our discretion, including due to item unavailability, pricing errors, or suspected fraudulent activity.</li>
                  <li>Once an order has been confirmed and preparation has begun, it cannot be cancelled. Please review your order carefully before submitting.</li>
                  <li>Special dietary requests or allergen information should be communicated at the time of ordering. While we make every effort to accommodate requests, we cannot guarantee a completely allergen-free environment.</li>
                </ul>
              </div>

              {/* 3. Delivery Policy */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">3. Delivery Policy</h2>
                <ul className="space-y-3 text-[#e0e0e0]/70 leading-relaxed list-disc list-inside">
                  <li>Delivery is available Thursday through Sunday during our operating hours.</li>
                  <li>A minimum order value may apply for delivery orders. The current minimum will be displayed at checkout.</li>
                  <li>Delivery times are estimated and may vary depending on order volume, weather conditions, and distance. Typical delivery time is approximately 60 minutes.</li>
                  <li>Delivery is available within our designated delivery zone in the Limerick area. If your address falls outside our delivery area, you will be notified at checkout.</li>
                  <li>You must provide an accurate delivery address and be available to receive the order. If delivery cannot be completed due to an incorrect address or unavailability, a re-delivery fee may apply.</li>
                  <li>Collection (pickup) is available daily during opening hours (Mon-Sat 3:00 PM - 10:30 PM, Sunday 3:00 PM - 10:00 PM).</li>
                </ul>
              </div>

              {/* 4. Payment Terms */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">4. Payment Terms</h2>
                <ul className="space-y-3 text-[#e0e0e0]/70 leading-relaxed list-disc list-inside">
                  <li>We accept online payment via credit/debit card through our secure payment processor.</li>
                  <li>Cash on delivery/collection may also be available and will be indicated at checkout.</li>
                  <li>All payments are processed securely. We do not store your full card details on our servers.</li>
                  <li>Payment must be completed before an order is confirmed and sent to our kitchen.</li>
                </ul>
              </div>

              {/* 5. Account Terms */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">5. Account Terms</h2>
                <ul className="space-y-3 text-[#e0e0e0]/70 leading-relaxed list-disc list-inside">
                  <li>You may create an account to save your details, view order history, and participate in our loyalty programme.</li>
                  <li>You are responsible for maintaining the confidentiality of your account credentials. Do not share your password with others.</li>
                  <li>You must provide accurate and current information when creating an account.</li>
                  <li>We reserve the right to suspend or terminate accounts that violate these Terms or are used for fraudulent purposes.</li>
                  <li>You may request deletion of your account at any time by contacting us directly.</li>
                </ul>
              </div>

              {/* 6. Refund Policy */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">6. Refund Policy</h2>
                <ul className="space-y-3 text-[#e0e0e0]/70 leading-relaxed list-disc list-inside">
                  <li>If there is an issue with your order (e.g., missing items, incorrect order, quality concern), please contact us directly as soon as possible.</li>
                  <li>
                    You can reach us by phone at{' '}
                    <a href="tel:+3536243300" className="text-[#e94560] hover:underline">+353 6243300</a>{' '}
                    during opening hours.
                  </li>
                  <li>Refunds or replacements will be assessed on a case-by-case basis at the discretion of Nimo's Limerick.</li>
                  <li>Refunds, if approved, will be processed to the original payment method and may take 5-10 business days to appear on your statement.</li>
                </ul>
              </div>

              {/* 7. Privacy */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">7. Privacy</h2>
                <p className="text-[#e0e0e0]/70 leading-relaxed">
                  Your privacy is important to us. We collect and process personal data only as necessary
                  to fulfil your orders and manage your account. For full details on how we handle your
                  information, please read our{' '}
                  <Link to="/privacy" className="text-[#e94560] hover:underline">Privacy Policy</Link>.
                </p>
              </div>

              {/* 8. Limitation of Liability */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">8. Limitation of Liability</h2>
                <p className="text-[#e0e0e0]/70 leading-relaxed">
                  To the fullest extent permitted by Irish law, Nimo's Limerick shall not be liable for
                  any indirect, incidental, or consequential damages arising from your use of our website
                  or ordering services. Our total liability for any claim shall not exceed the amount paid
                  for the relevant order.
                </p>
              </div>

              {/* 9. Changes to Terms */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">9. Changes to These Terms</h2>
                <p className="text-[#e0e0e0]/70 leading-relaxed">
                  We may update these Terms from time to time. Changes will be posted on this page with
                  an updated "Last updated" date. Continued use of our service after changes constitutes
                  acceptance of the revised Terms.
                </p>
              </div>

              {/* 10. Contact */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">10. Contact Us</h2>
                <p className="text-[#e0e0e0]/70 leading-relaxed mb-4">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <ul className="space-y-2 text-[#e0e0e0]/70">
                  <li><span className="text-gray-400">Business:</span> <span className="text-white">Nimo's Limerick</span></li>
                  <li><span className="text-gray-400">Address:</span> <span className="text-white">The Cross, Knocklong East, Co. Limerick, V94 TY05</span></li>
                  <li>
                    <span className="text-gray-400">Phone:</span>{' '}
                    <a href="tel:+3536243300" className="text-[#e94560] hover:underline">+353 6243300</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
