import { Link } from 'react-router-dom'
import SEOHead from '../components/SEOHead'

export default function Privacy() {
  return (
    <>
      <SEOHead
        title="Privacy Policy - Nimo's Limerick"
        description="Privacy Policy for Nimo's Limerick. Learn how we collect, use, and protect your personal data. GDPR compliant."
        keywords="nimos limerick privacy, data protection, GDPR takeaway, privacy policy knocklong"
        path="/privacy"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Privacy Policy' },
        ]}
      />
      <div className="min-h-screen bg-[#080808]">
        {/* Hero */}
        <section className="pt-28 pb-12 px-4 bg-[#0f0f0f]">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Privacy <span className="text-[#e94560]">Policy</span>
            </h1>
            <p className="text-[#e0e0e0]/70 text-lg max-w-xl mx-auto">
              How we collect, use, and protect your personal information.
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
                  Nimo's Limerick ("we", "us", "our") is committed to protecting your privacy.
                  This Privacy Policy explains how we collect, use, store, and protect your personal
                  data when you use our website and ordering services. As an Irish business, we comply
                  with the General Data Protection Regulation (GDPR) and the Irish Data Protection Acts.
                </p>
              </div>

              {/* 2. Data We Collect */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">2. Data We Collect</h2>
                <p className="text-[#e0e0e0]/70 leading-relaxed mb-4">
                  We collect the following personal data when you create an account or place an order:
                </p>
                <ul className="space-y-3 text-[#e0e0e0]/70 leading-relaxed list-disc list-inside">
                  <li><span className="text-white font-medium">Name</span> - to identify you and personalise your experience.</li>
                  <li><span className="text-white font-medium">Email address</span> - for account login, order confirmations, and important communications.</li>
                  <li><span className="text-white font-medium">Phone number</span> - so we can contact you about your order if needed (e.g., delivery issues).</li>
                  <li><span className="text-white font-medium">Delivery address</span> - to deliver your order to the correct location.</li>
                  <li><span className="text-white font-medium">Order history</span> - to provide order tracking, enable reordering, and manage our loyalty programme.</li>
                </ul>
              </div>

              {/* 3. How We Use Your Data */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Data</h2>
                <p className="text-[#e0e0e0]/70 leading-relaxed mb-4">
                  We use your personal data for the following purposes:
                </p>
                <ul className="space-y-3 text-[#e0e0e0]/70 leading-relaxed list-disc list-inside">
                  <li><span className="text-white font-medium">Order processing</span> - to receive, prepare, and fulfil your food orders.</li>
                  <li><span className="text-white font-medium">Delivery</span> - to deliver orders to your specified address during delivery hours (Thu-Sun).</li>
                  <li><span className="text-white font-medium">Account management</span> - to maintain your account, allow login, and save your preferences.</li>
                  <li><span className="text-white font-medium">Loyalty programme</span> - to track and reward your purchases through our loyalty system.</li>
                  <li><span className="text-white font-medium">Customer support</span> - to respond to enquiries, resolve issues, and process refund requests.</li>
                </ul>
              </div>

              {/* 4. Data Storage & Security */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">4. Data Storage & Security</h2>
                <ul className="space-y-3 text-[#e0e0e0]/70 leading-relaxed list-disc list-inside">
                  <li>Your personal data is stored locally on our own server infrastructure.</li>
                  <li>Passwords are securely hashed and are never stored in plain text.</li>
                  <li>We use HTTPS encryption for all data transmitted between your browser and our servers.</li>
                  <li>Access to personal data is restricted to authorised staff only.</li>
                  <li>We retain your data for as long as your account is active or as needed to provide our services. You may request deletion at any time.</li>
                </ul>
              </div>

              {/* 5. Data Sharing */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">5. Data Sharing</h2>
                <p className="text-[#e0e0e0]/70 leading-relaxed">
                  We do not sell, trade, or share your personal data with third parties, with the
                  following exception:
                </p>
                <ul className="mt-4 space-y-3 text-[#e0e0e0]/70 leading-relaxed list-disc list-inside">
                  <li><span className="text-white font-medium">Payment processor</span> - when you pay online, your payment card details are handled directly by our secure payment processor. We do not receive or store your full card number.</li>
                </ul>
              </div>

              {/* 6. Cookies & Local Storage */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">6. Cookies & Local Storage</h2>
                <p className="text-[#e0e0e0]/70 leading-relaxed">
                  We use minimal browser storage to keep our service functional:
                </p>
                <ul className="mt-4 space-y-3 text-[#e0e0e0]/70 leading-relaxed list-disc list-inside">
                  <li><span className="text-white font-medium">Authentication token</span> - stored in localStorage to keep you logged in between visits.</li>
                  <li><span className="text-white font-medium">Cart data</span> - stored locally so your shopping cart persists between page loads.</li>
                </ul>
                <p className="text-[#e0e0e0]/70 leading-relaxed mt-4">
                  We do not use third-party tracking cookies, analytics cookies, or advertising cookies.
                </p>
              </div>

              {/* 7. Your Rights (GDPR) */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">7. Your Rights Under GDPR</h2>
                <p className="text-[#e0e0e0]/70 leading-relaxed mb-4">
                  As a data subject under the General Data Protection Regulation, you have the following rights:
                </p>
                <ul className="space-y-3 text-[#e0e0e0]/70 leading-relaxed list-disc list-inside">
                  <li><span className="text-white font-medium">Right of access</span> - you can request a copy of the personal data we hold about you.</li>
                  <li><span className="text-white font-medium">Right to rectification</span> - you can ask us to correct any inaccurate data.</li>
                  <li><span className="text-white font-medium">Right to erasure</span> - you can request that we delete your personal data and account.</li>
                  <li><span className="text-white font-medium">Right to data portability</span> - you can request your data in a structured, commonly used format.</li>
                  <li><span className="text-white font-medium">Right to object</span> - you can object to the processing of your data in certain circumstances.</li>
                </ul>
                <p className="text-[#e0e0e0]/70 leading-relaxed mt-4">
                  To exercise any of these rights, please contact us using the details below. We will
                  respond to your request within 30 days as required by GDPR.
                </p>
              </div>

              {/* 8. Data Deletion */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">8. Requesting Data Deletion</h2>
                <p className="text-[#e0e0e0]/70 leading-relaxed">
                  You can request deletion of your account and all associated personal data by contacting
                  Nimo's Limerick directly. We will process your request and confirm deletion within 30 days.
                  Please note that we may need to retain certain records for legal or accounting purposes, but
                  these will be kept to the minimum required by law.
                </p>
              </div>

              {/* 9. Changes */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">9. Changes to This Policy</h2>
                <p className="text-[#e0e0e0]/70 leading-relaxed">
                  We may update this Privacy Policy from time to time. Any changes will be posted on this
                  page with an updated "Last updated" date. We encourage you to review this page
                  periodically. Continued use of our service after changes constitutes acceptance of the
                  revised policy.
                </p>
              </div>

              {/* 10. Contact */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">10. Contact Us</h2>
                <p className="text-[#e0e0e0]/70 leading-relaxed mb-4">
                  If you have any questions about this Privacy Policy or wish to exercise your data
                  protection rights, please contact us:
                </p>
                <ul className="space-y-2 text-[#e0e0e0]/70">
                  <li><span className="text-gray-400">Business:</span> <span className="text-white">Nimo's Limerick</span></li>
                  <li><span className="text-gray-400">Address:</span> <span className="text-white">The Cross, Knocklong East, Co. Limerick, V94 TY05</span></li>
                  <li>
                    <span className="text-gray-400">Phone:</span>{' '}
                    <a href="tel:+3536243300" className="text-[#e94560] hover:underline">+353 6243300</a>
                  </li>
                </ul>
                <p className="text-[#e0e0e0]/70 leading-relaxed mt-6">
                  You also have the right to lodge a complaint with the Irish Data Protection Commission
                  (DPC) if you believe your data protection rights have been violated. Visit{' '}
                  <a
                    href="https://www.dataprotection.ie"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#e94560] hover:underline"
                  >
                    www.dataprotection.ie
                  </a>{' '}
                  for more information.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
