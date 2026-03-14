"use client"

import { motion } from "framer-motion"
import Link from "next/link"

export default function PrivacyPolicyPage() {
  const policies = [
    { label: "Privacy Policy", link: "/privacy-policy" },
    { label: "Return Policy", link: "/return-policy" },
    { label: "Cookie Policy", link: "/cookie-policy" },
    { label: "Terms & Conditions", link: "/terms-and-conditions" }
  ];
  return (
    <div className="min-h-screen bg-[#fbf6f0]">
      {/* Policy Selector - Always Visible */}
      <div className="w-full max-w-2xl mx-auto pt-12 pb-4 px-4 sticky top-0 z-30 bg-[#fbf6f0]">
        <h1 className="text-[2rem] font-black uppercase tracking-[0.08em] text-[#1d1c19] mb-6 text-center font-avenir-black">Select a Policy</h1>
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          {policies.map((policy) => (
            <Link href={policy.link} key={policy.label} className="rounded-lg border border-[#1d1c19]/15 bg-white shadow-sm hover:shadow-lg transition-shadow px-6 py-3 font-black uppercase tracking-[0.08em] text-[#1d1c19] hover:text-[#5227FF] font-avenir-black">
              {policy.label}
            </Link>
          ))}
        </div>
      </div>
      {/* ...existing page content... */}
      {/* Header */}
      <div className="bg-gray-50 border-b pt-20 sm:pt-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Privacy Policy
          </motion.h1>
          <p className="text-gray-600">
            Last updated: August 26, 2025
          </p>
        </div>
      </div>
      {/* ...existing page content... */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="prose prose-gray max-w-none"
        >
          {/* Plain-Language Summary */}
          <section className="mb-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Plain-Language Summary (Not a Substitute for Full Policy)</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>We collect info like your name, email, phone, shipping address, and payment details.</li>
              <li>We use your data to fulfill orders, run events, and send marketing if you&apos;ve opted in.</li>
              <li>We work with trusted partners (Google, Meta, Snapchat, Mailchimp, Squarespace, Stripe, PayPal, etc.).</li>
              <li>We don&apos;t sell your personal data.</li>
              <li>We keep data as long as needed for business/legal reasons unless you ask us to delete it.</li>
              <li>Your rights (like under CCPA/GDPR) include access, deletion, and opt-outs.</li>
              <li>Kids under 13 (or 16 in some places) can&apos;t use our services.</li>
              <li>Disputes or requests? Email info@ny.com or legal@ny.com.</li>
            </ul>
          </section>

          {/* Introduction */}
          <section className="mb-8">
            <p className="text-gray-700 leading-relaxed mb-4">
              This Privacy Policy explains how ® LLC (&quot;,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) collects, uses, and shares your personal information when you interact with us online or offline, and the rights and choices you have regarding that information.
            </p>
            <p className="text-gray-700 leading-relaxed">
              By using our website, services, in-person events, or participating in our programs, you agree to the collection and use of your information as described in this Policy.
            </p>
          </section>

          {/* Company Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Company Information</h2>
            <p className="text-gray-700 leading-relaxed mb-3">{<><sup>®</sup> LLC is a New York limited liability company with:</>}</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-3">
              <li><strong>Registered Address (Articles of Organization):</strong> 45 West 60th Street, New York, NY 10023</li>
              <li><strong>Operating Address:</strong> 3730 Review Avenue, Long Island City, NY 11101</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              You can contact us at{" "}
              <a href="mailto:info@ny.com" className="text-blue-600 hover:text-blue-700">
                info@ny.com
              </a>{" "}
              or{" "}
              <a href="mailto:legal@ny.com" className="text-blue-600 hover:text-blue-700">
                legal@ny.com
              </a>.
            </p>
          </section>

          {/* Scope */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Scope</h2>
            <p className="text-gray-700 leading-relaxed mb-3">This Policy applies to:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Our website at ny.com</li>
              <li>SMS and email marketing campaigns</li>
              <li>In-person events, retail activations, and pop-ups</li>
              <li>The  Campus Ambassadors program</li>
              <li>Social media channels where we collect or process data</li>
            </ul>
          </section>

          {/* Information We Collect */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Identifiers:</strong> Name, email, phone number, postal address, account login details</li>
              <li><strong>Payment Information:</strong> Processed securely by Stripe, PayPal, Square, etc. (we don&apos;t store card numbers)</li>
              <li><strong>Order & Transaction Data:</strong> Purchase history, delivery details, preferences</li>
              <li><strong>Communications:</strong> Emails, SMS, social media messages, and other correspondence</li>
              <li><strong>Device & Usage Data:</strong> IP address, browser type, operating system, pages viewed, time spent</li>
              <li><strong>Event Data:</strong> Contact info provided at in-person activations, collabs, or ambassador events</li>
              <li><strong>Social Media Data:</strong> Content you tag or share with us</li>
            </ul>
          </section>

          {/* How We Use Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Information</h2>
            <p className="text-gray-700 leading-relaxed mb-3">We use your data to:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Fulfill orders, returns, and services</li>
              <li>Manage accounts and authenticate access</li>
              <li>Communicate via email, SMS, or phone (with consent)</li>
              <li>Send marketing, promotions, and event invitations (opt-out anytime)</li>
              <li>Personalize ads through vendors like Google, Meta, Snapchat</li>
              <li>Improve website functionality, analytics, and security</li>
              <li>Comply with legal obligations and prevent fraud</li>
              <li>Run offline events and ambassador programs</li>
            </ul>
          </section>

          {/* Marketing & SMS Consent */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Marketing & SMS Consent</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              This Privacy Policy explains how <sup>®</sup> LLC (&ldquo;,&rdquo; &ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) collects, uses, and shares your personal information when you interact with us online or offline, and the rights and choices you have regarding that information.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-3">
              <li>Message frequency varies</li>
              <li>Message & data rates may apply</li>
              <li>Opt out anytime: reply STOP (SMS) or click &quot;unsubscribe&quot; (email)</li>
              <li>Reply HELP for assistance</li>
              <li>Consent is not a condition of purchase</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Current or future SMS/email vendors may include: Mailchimp (email and SMS), Klaviyo, Postscript, Attentive, or similar
            </p>
          </section>

          {/* Cookies & Tracking */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cookies & Tracking</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We use cookies, pixels, and similar technologies. See our{" "}
              <Link href="/cookies" className="text-blue-600 hover:text-blue-700 underline">
                Cookie Policy
              </Link>{" "}
              for full details.
            </p>
            <p className="text-gray-700 leading-relaxed mb-3">Vendors we may use include, including but not limited to:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-3">
              <li>Google Tag Manager, Google Analytics</li>
              <li>Meta (Facebook/Instagram)</li>
              <li>Snapchat</li>
              <li>Squarespace (hosting)</li>
              <li>Stripe, PayPal, Square (payments)</li>
              <li>Mailchimp (email and SMS marketing)</li>
              <li>(Additional SMS/email vendors as noted above)</li>
            </ul>
            <p className="text-gray-700 leading-relaxed text-sm italic">This list may be updated.</p>
          </section>

          {/* Sharing of Data */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Sharing of Data</h2>
            <p className="text-gray-700 leading-relaxed mb-3">We share data with:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li><strong>Service Providers</strong> (shipping, payments, analytics, marketing)</li>
              <li><strong>Business Partners</strong> (collabs/events, as needed)</li>
              <li><strong>Legal/Regulatory Authorities</strong> if required by law</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              We also require our vendors and partners to enter into agreements ensuring lawful and secure processing of your data in accordance with applicable privacy laws.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-gray-900 font-semibold">👉 We do not sell personal data.</p>
            </div>
          </section>

          {/* Retention of Data */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Retention of Data</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We retain personal information for as long as reasonably necessary to operate our business, provide services, comply with legal obligations, and resolve disputes.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We do not commit to automatic deletion of communications (such as emails, messages, or social media interactions) unless required by law. We may retain them to the extent legally permissible unless you specifically request deletion.
            </p>
          </section>

          {/* Your Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Depending on your location (e.g. GDPR, CCPA), you may have rights to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>Access, correct, or delete your data</li>
              <li>Opt out of marketing</li>
              <li>Request data portability</li>
              <li>Limit or restrict data processing</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-3">
              We honor legally required opt-out mechanisms, including consumer rights requests under the CCPA.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Requests:</strong>{" "}
              <a href="mailto:legal@ny.com" className="text-blue-600 hover:text-blue-700">
                legal@ny.com
              </a>
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Children&apos;s Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              We do not knowingly collect or solicit information from anyone under the age of 13, nor do we knowingly market to anyone under the age of 16 in jurisdictions (such as the EU) where a higher minimum age applies. If we learn that we have collected information from a child under these thresholds, we will delete it.
            </p>
          </section>

          {/* International Data Transfers */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">International Data Transfers</h2>
            <p className="text-gray-700 leading-relaxed">
              We may transfer your personal information outside of your home country, including to the United States. When we do so, we implement appropriate safeguards as required by law to protect your information.
            </p>
          </section>

          {/* Security */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Security</h2>
            <p className="text-gray-700 leading-relaxed">
              We use industry-standard physical, technical, and organizational safeguards designed to protect your information. However, no method of transmission over the internet or method of electronic storage is 100% secure. You use our services at your own risk.
            </p>
          </section>

          {/* Changes to This Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Policy from time to time. Updates will be posted here with a new &quot;Last updated&quot; date. Material changes may also be shared by email, SMS, or site notice.
            </p>
          </section>

          {/* Contact Us */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-3"><strong>Questions?</strong></p>
            <p className="text-gray-700 leading-relaxed mb-2">
              Email:{" "}
              <a href="mailto:info@ny.com" className="text-blue-600 hover:text-blue-700">
                info@ny.com
              </a>{" "}
              or{" "}
              <a href="mailto:legal@ny.com" className="text-blue-600 hover:text-blue-700">
                legal@ny.com
              </a>
            </p>
            <p className="text-gray-700 leading-relaxed">
              Website:{" "}
              <Link href="/contact" className="text-blue-600 hover:text-blue-700">
                ny.com/contact
              </Link>
            </p>
          </section>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Link 
            href="/shop"
            className="inline-block px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
            aria-label="Return to Store"
          >
            Return to Store
          </Link>
        </motion.div>
      </div>
    </div>
  )
}