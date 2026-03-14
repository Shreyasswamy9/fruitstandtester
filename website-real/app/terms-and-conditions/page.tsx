"use client"

import { motion } from "framer-motion"
import Link from "next/link"

export default function TermsPage() {
  return (
  <div className="min-h-screen bg-[#fbf6f0]">
      {/* Header */}
      <div className="bg-gray-50 border-b pt-20 sm:pt-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Terms & Conditions
          </motion.h1>
          <p className="text-gray-600">
            Last updated: August 26, 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="prose prose-gray max-w-none"
        >
          {/* Plain-Language Summary */}
          <section className="mb-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Plain-Language Summary (Not a Substitute for Full Terms)</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>You must be 18 or have a parent/guardian to use .</li>
              <li>Orders can be cancelled if fraudulent, incorrect, or unavailable.</li>
              <li>Returns and refunds are handled under our Return Policy.</li>
              <li>Accounts must be accurate; you&apos;re responsible for keeping your login safe.</li>
              <li>Intellectual property belongs to ; user content can be reused for marketing.</li>
              <li>SMS/email marketing requires consent, is optional, and you can opt out anytime.</li>
              <li>We limit our liability to what you paid in the last 12 months.</li>
              <li>Disputes are resolved in New York through binding arbitration; no class actions.</li>
              <li>Nothing here limits your rights under New York consumer protection law.</li>
            </ul>
          </section>

          {/* 1. Interpretation and Definitions */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Interpretation and Definitions</h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p><strong>Company</strong> refers to {<><sup>®</sup> LLC</>}, a New York limited liability company with its principal office listed in its Articles of Organization at 45 West 60th Street, New York, NY 10023, and its current business operations located at 3730 Review Avenue, Long Island City, NY 11101 (&quot;,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot).</p>
              <p><strong>Service</strong> refers to the website ny.com and related ecommerce and digital services.</p>
              <p><strong>Goods</strong> refers to the items offered for sale on our Service.</p>
              <p><strong>Account</strong> means a unique account created for you to access our Service or parts of our Service.</p>
              <p><strong>You</strong> means the individual accessing or using the Service, or the company or other legal entity on behalf of which such individual is accessing or using the Service.</p>
            </div>
          </section>

          {/* 2. Eligibility */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Eligibility</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>You must be at least 18 years old to purchase from .</li>
              <li>If you are under 18, you may only use the Service with the involvement and consent of a parent or guardian.</li>
            </ul>
          </section>

          {/* 3. Agreement to Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Agreement to Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-3">Your use of the Service is conditioned on your acceptance of:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>These Terms and Conditions</li>
              <li>Our Privacy Policy (incorporated by reference)</li>
              <li>Our Return Policy</li>
              <li>Our Cookie Policy</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">These documents together form the entire agreement between you and .</p>
          </section>

          {/* 4. Orders and Payments */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Orders and Payments</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Placing Orders</h3>
                <p className="text-gray-700 leading-relaxed">By placing an order, you confirm you are legally capable of entering into binding contracts and that the information you provide is accurate.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Methods</h3>
                <p className="text-gray-700 leading-relaxed">We accept major credit/debit cards, PayPal, Stripe, and other methods listed at checkout. All payments are subject to authorization.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Prices</h3>
                <p className="text-gray-700 leading-relaxed">All prices are in USD unless stated otherwise. Prices may change prior to order confirmation.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Cancellations</h3>
                <p className="text-gray-700 leading-relaxed">We reserve the right to cancel orders due to product unavailability, errors in description or pricing, suspected fraud, or unauthorized activity.</p>
              </div>
            </div>
          </section>

          {/* 5. Returns and Refunds */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Returns and Refunds</h2>
            <p className="text-gray-700 leading-relaxed mb-3">Our policies for returns and refunds are governed by our <Link href="/returns" className="text-blue-600 hover:text-blue-700 underline">Return Policy</Link>, which is incorporated into these Terms by reference.</p>
            <p className="text-gray-700 leading-relaxed mb-3">Cash refunds, where applicable, will be issued within 10 business days after we receive and approve the return.</p>
            <p className="text-gray-700 leading-relaxed">Store credits are non-transferable, may expire as stated at issuance, and are not redeemable for cash except as required by law (including New York law).</p>
          </section>

          {/* 6. Promotions */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Promotions</h2>
            <p className="text-gray-700 leading-relaxed">Promotions may have additional terms. If these conflict with the Terms, the promotion&apos;s rules apply.</p>
          </section>

          {/* 7. User Accounts */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. User Accounts</h2>
            <p className="text-gray-700 leading-relaxed mb-3">If you create an Account, you must provide accurate and current information and keep it updated.</p>
            <p className="text-gray-700 leading-relaxed mb-3">You are responsible for:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-3">
              <li>Maintaining confidentiality of your credentials</li>
              <li>All activity under your account</li>
              <li>Notifying us immediately of unauthorized use</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-3">We may suspend or terminate accounts with or without notice, subject to applicable law, for inactivity, fraud, or violations of these Terms.</p>
            <p className="text-gray-700 leading-relaxed">If terminated, you remain responsible for any outstanding balances. Credits and refunds are at our discretion, except as required by law.</p>
          </section>

          {/* 8. Intellectual Property & User Content */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Intellectual Property & User Content</h2>
            <p className="text-gray-700 leading-relaxed mb-3">The Service, including all content and design, is owned by  and protected by copyright, trademark, and intellectual property laws.</p>
            <div className="mb-3">
              <h3 className="text-lg font-medium text-gray-900 mb-2">User Content License</h3>
              <p className="text-gray-700 leading-relaxed mb-2">By tagging  or otherwise submitting or sharing content with us (including reviews, photos, or social media posts), you grant  a worldwide, royalty-free, non-exclusive, transferable license to use, repost, display, distribute, and create derivative works of that content for marketing, advertising, and promotional purposes.</p>
              <p className="text-gray-700 leading-relaxed">To the extent permitted by law, you also waive any moral rights in that content.</p>
            </div>
            <p className="text-gray-700 leading-relaxed">Our trademarks and trade dress may not be used without written permission.</p>
          </section>

          {/* 9. SMS and Email Communications */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. SMS and Email Communications</h2>
            <p className="text-gray-700 leading-relaxed mb-3">By providing your phone number or email, you consent to receive marketing and transactional communications from , including SMS messages.</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-3">
              <li>Message frequency may vary.</li>
              <li>Message and data rates may apply.</li>
              <li>Consent is not a condition of purchase.</li>
              <li>Opt out anytime: follow unsubscribe links in emails or reply STOP to SMS. Reply HELP for help.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">See our <Link href="/privacy" className="text-blue-600 hover:text-blue-700 underline">Privacy Policy</Link> for details.</p>
          </section>

          {/* 10. Links to Third-Party Websites */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Links to Third-Party Websites</h2>
            <p className="text-gray-700 leading-relaxed">Our Service may link to third-party websites. We are not responsible for their content, policies, or practices.</p>
          </section>

          {/* 11. Termination */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Termination</h2>
            <p className="text-gray-700 leading-relaxed mb-3">We may suspend or terminate your account with or without notice, subject to applicable law, if you violate these Terms.</p>
            <p className="text-gray-700 leading-relaxed">The following provisions survive termination: Intellectual Property, Indemnification, Limitation of Liability, Disclaimer of Warranties, Governing Law, Dispute Resolution, Assignment, and Survival.</p>
          </section>

          {/* 12. Limitation of Liability */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Limitation of Liability</h2>
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <p className="text-gray-700 leading-relaxed mb-3 font-medium">TO THE FULLEST EXTENT PERMITTED BY LAW,  AND ITS SUPPLIERS SHALL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES.</p>
              <p className="text-gray-700 leading-relaxed mb-3 font-medium">OUR TOTAL LIABILITY SHALL NOT EXCEED THE TOTAL AMOUNT YOU PAID FOR GOODS IN THE 12 MONTHS PRECEDING THE CLAIM.</p>
              <p className="text-gray-700 leading-relaxed font-medium">WE ARE NOT LIABLE FOR ISSUES CAUSED BY THIRD-PARTY PROVIDERS (PAYMENT PROCESSORS, SHIPPING CARRIERS, ETC.).</p>
            </div>
          </section>

          {/* 13. DISCLAIMER OF WARRANTIES */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. DISCLAIMER OF WARRANTIES</h2>
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <p className="text-gray-700 leading-relaxed mb-3 font-medium">THE SERVICE AND GOODS ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE,&quot; WITHOUT WARRANTIES OF ANY KIND.</p>
              <p className="text-gray-700 leading-relaxed mb-3 font-medium">TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE DISCLAIM ALL EXPRESS OR IMPLIED WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</p>
              <p className="text-gray-700 leading-relaxed font-medium">WE DO NOT GUARANTEE UNINTERRUPTED OR ERROR-FREE OPERATION.</p>
            </div>
          </section>

          {/* 14. Indemnification */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Indemnification</h2>
            <p className="text-gray-700 leading-relaxed mb-3">You agree to indemnify, defend, and hold harmless , its officers, employees, affiliates, and agents, from and against any claims, liabilities, damages, losses, or expenses (including reasonable attorneys&apos; fees) arising out of or related to your:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-3">
              <li>Misuse of the Service</li>
              <li>Violation of these Terms</li>
              <li>Violation of intellectual property or privacy rights of others</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">This indemnity does not apply to claims arising from &apos;s own negligence, willful misconduct, or breach of these Terms.</p>
          </section>

          {/* 15. Force Majeure */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Force Majeure</h2>
            <p className="text-gray-700 leading-relaxed">We are not responsible for delays or failure to perform caused by events beyond our reasonable control, including natural disasters, strikes, government actions, supply chain disruptions, or similar events.</p>
          </section>

          {/* 16. Governing Law and Jurisdiction */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">16. Governing Law and Jurisdiction</h2>
            <p className="text-gray-700 leading-relaxed mb-3">These Terms are governed by the laws of the State of New York, without regard to conflict-of-law rules.</p>
            <p className="text-gray-700 leading-relaxed">For disputes not subject to arbitration, you consent to the exclusive jurisdiction of the state and federal courts located in New York County, New York, unless otherwise required by law.</p>
          </section>

          {/* 17. Dispute Resolution; Arbitration and Class Action Waiver */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">17. Dispute Resolution; Arbitration and Class Action Waiver</h2>
            <p className="text-gray-700 leading-relaxed mb-3">You agree to first attempt to resolve disputes informally by contacting <a href="mailto:legal@ny.com" className="text-blue-600 hover:text-blue-700">legal@ny.com</a>.</p>
            <p className="text-gray-700 leading-relaxed mb-3">If unresolved, you and  agree that any dispute, claim, or controversy arising out of or relating to these Terms, the Service, or any purchase shall be resolved by binding arbitration administered by the American Arbitration Association (&quot;AAA&quot;) under its Consumer Arbitration Rules.</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-3">
              <li><strong>Venue:</strong> Arbitration shall take place in New York, New York, unless otherwise required by law.</li>
              <li><strong>Costs:</strong>  will cover all filing and arbitrator fees required under the AAA Consumer Rules. Each party bears its own attorneys&apos; fees unless otherwise awarded.</li>
              <li><strong>Class Action Waiver:</strong> You agree to bring claims only in your individual capacity. Class actions, private attorney general actions, and representative proceedings are not permitted.</li>
              <li><strong>Small Claims Exception:</strong> Either party may bring an individual claim in small claims court in New York County, NY, or your county of residence.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">This section is governed by the Federal Arbitration Act. If any portion is found unenforceable, the remainder will be enforced to the fullest extent permitted.</p>
          </section>

          {/* 18. Product Descriptions and Accuracy */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">18. Product Descriptions and Accuracy</h2>
            <p className="text-gray-700 leading-relaxed">We make reasonable efforts to ensure product descriptions, pricing, and availability are accurate. However, errors may occur, and we reserve the right to correct them. Colors may vary slightly due to display settings.</p>
          </section>

          {/* 19. Export and Resale Restrictions */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">19. Export and Resale Restrictions</h2>
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <p className="text-gray-700 leading-relaxed font-medium">ORDERS SUSPECTED TO BE PLACED FOR UNAUTHORIZED RESALE, BULK PURCHASING, OR EXPORT MAY BE CANCELLED AT OUR DISCRETION. REFUNDS WILL BE PROVIDED WHERE LEGALLY REQUIRED.</p>
            </div>
          </section>

          {/* 20. Assignment */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">20. Assignment</h2>
            <p className="text-gray-700 leading-relaxed">You may not assign or transfer your rights under these Terms.  may assign or transfer its rights and obligations without restriction, including in connection with a merger, acquisition, or sale of assets.</p>
          </section>

          {/* 21. Survival */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">21. Survival</h2>
            <p className="text-gray-700 leading-relaxed">The following provisions survive termination or expiration: Intellectual Property & User Content, Indemnification, Limitation of Liability, Disclaimer of Warranties, Governing Law, Dispute Resolution, Assignment, and this Survival clause.</p>
          </section>

          {/* 22. Severability and Waiver */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">22. Severability and Waiver</h2>
            <p className="text-gray-700 leading-relaxed mb-3">If any provision of these Terms is held invalid, the remaining provisions remain in effect.</p>
            <p className="text-gray-700 leading-relaxed">Failure to enforce a right or provision is not a waiver of that right.</p>
          </section>

          {/* 23. Entire Agreement */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">23. Entire Agreement</h2>
            <p className="text-gray-700 leading-relaxed">These Terms, together with our Privacy Policy, Return Policy, and Cookie Policy, constitute the entire agreement between you and . They supersede any prior communications, promises, or understandings relating to the Service.</p>
          </section>

          {/* 24. DMCA Notice Procedure */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">24. DMCA Notice Procedure</h2>
            <p className="text-gray-700 leading-relaxed mb-3">If you believe that content on the Service infringes your copyright, you may submit a notification to our Designated Agent under the Digital Millennium Copyright Act (&quot;DMCA&quot;):</p>
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <p className="text-gray-700 leading-relaxed mb-2"><strong>Designated Agent</strong></p>
              <p className="text-gray-700 leading-relaxed mb-1">Email: <a href="mailto:legal@ny.com" className="text-blue-600 hover:text-blue-700">legal@ny.com</a></p>
              <p className="text-gray-700 leading-relaxed">Mail:  Legal, 3730 Review Avenue, Long Island City, NY 11101</p>
            </div>
            <p className="text-gray-700 leading-relaxed mt-3">Please include the information required under 17 U.S.C. § 512(c)(3).</p>
          </section>

          {/* 25. Changes to These Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">25. Changes to These Terms</h2>
            <p className="text-gray-700 leading-relaxed">We may update these Terms from time to time. Changes are effective when posted to this page. If material, we will provide notice (e.g., email or site notice).</p>
          </section>

          {/* 26. Consumer Protection Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">26. Consumer Protection Rights</h2>
            <p className="text-gray-700 leading-relaxed">Nothing in these Terms limits your rights under applicable New York consumer protection laws or other laws that cannot be waived by contract.</p>
          </section>

          {/* 27. Contact Us */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">27. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-2">For customer inquiries: <a href="mailto:info@ny.com" className="text-blue-600 hover:text-blue-700">info@ny.com</a></p>
            <p className="text-gray-700 leading-relaxed mb-2">For legal notices: <a href="mailto:legal@ny.com" className="text-blue-600 hover:text-blue-700">legal@ny.com</a></p>
            <p className="text-gray-700 leading-relaxed">Website: <Link href="/contact" className="text-blue-600 hover:text-blue-700">ny.com/contact</Link></p>
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