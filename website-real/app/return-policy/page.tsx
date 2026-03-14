"use client"

import { motion } from "framer-motion"
import Link from "next/link"

export default function ReturnPolicyPage() {
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
            Return Policy
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
          {/* Introduction */}
          <section className="mb-12">
            <p className="text-gray-700 leading-relaxed">
              At , we want you to feel confident shopping with us. We&apos;re a small independent company that handles nearly everything in-house — including packaging and fulfillment — so while we aim to make returns and exchanges straightforward, we also ask for your cooperation in following the steps below.
            </p>
          </section>

          {/* Plain-Language Summary */}
          <section className="mb-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Plain-Language Summary (Not a Substitute for Full Policy)</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>You have 14 days from delivery to start a return by contacting us.</li>
              <li>Once approved, you have 7 days to ship it back with tracking.</li>
              <li>Store credit is the default refund method; cash refunds are available upon request.</li>
              <li>Shipping costs (including &quot;free shipping&quot; costs we covered) are non-refundable.</li>
              <li>Sale items, limited drops, and collabs are final sale.</li>
              <li>U.S. Foreign Service and active-duty military personnel get extra time if needed.</li>
              <li>Items must be returned in new, unworn, unwashed condition with tags.</li>
              <li>Stickers and extras are yours to keep.</li>
              <li>Defective/incorrect items? We&apos;ll cover return shipping.</li>
              <li>Nothing in this Policy overrides your rights under New York law.</li>
            </ul>
          </section>

          {/* Eligibility for Returns & Exchanges */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Eligibility for Returns & Exchanges</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex">
                <span className="mr-2">•</span>
                <span>Returns must be initiated within 14 days of delivery by contacting us for return authorization.</span>
              </li>
              <li className="flex">
                <span className="mr-2">•</span>
                <span>Once approved, the item must be shipped back within 7 days of authorization.</span>
              </li>
              <li className="flex">
                <span className="mr-2">•</span>
                <span><strong>Exception:</strong> Active duty U.S. military personnel and members of the U.S. Foreign Service serving abroad whose official duties delay shipping may be granted reasonable additional time to return items. Proof of service or deployment may be requested.</span>
              </li>
              <li className="flex">
                <span className="mr-2">•</span>
                <span>Returned items must be in new, unworn, and unwashed condition, with original tags attached.</span>
              </li>
              <li className="flex">
                <span className="mr-2">•</span>
                <span>Sale items, limited drops, and collaboration pieces are final sale and not eligible for return or exchange.</span>
              </li>
              <li className="flex">
                <span className="mr-2">•</span>
                <span>Final sale items will be clearly marked on the product page or at checkout.</span>
              </li>
              <li className="flex">
                <span className="mr-2">•</span>
                <span>Stickers, accessories, and extras included with your order are yours to keep.</span>
              </li>
            </ul>
          </section>

          {/* Store Credit & Refunds */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Store Credit & Refunds</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex">
                <span className="mr-2">•</span>
                <span>Our default method for returns is store credit, issued once the item is received and inspected.</span>
              </li>
              <li className="flex">
                <span className="mr-2">•</span>
                <span>If you prefer a cash refund, you may request one.</span>
              </li>
              <li className="flex">
                <span className="mr-2">•</span>
                <span>Original shipping costs are non-refundable, including shipping costs covered by  (&quot;free shipping&quot;). These costs will be deducted from the refund amount.</span>
              </li>
            </ul>
          </section>

          {/* Exchanges */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Exchanges</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex">
                <span className="mr-2">•</span>
                <span>Exchanges are available for size or style, subject to inventory.</span>
              </li>
              <li className="flex">
                <span className="mr-2">•</span>
                <span>If the desired item is not in stock, we will issue store credit.</span>
              </li>
            </ul>
          </section>

          {/* Return Shipping & Tracking */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Return Shipping & Tracking</h2>
            <ul className="space-y-3 text-gray-700 mb-4">
              <li className="flex">
                <span className="mr-2">•</span>
                <span>Customers are responsible for shipping returned items back to us.</span>
              </li>
              <li className="flex">
                <span className="mr-2">•</span>
                <span>Tracking numbers are required for all returns.  is not responsible for lost packages without proof of delivery.</span>
              </li>
              <li className="flex">
                <span className="mr-2">•</span>
                <span>Ship returns to:</span>
              </li>
            </ul>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-gray-900 font-semibold mb-1"><sup>®</sup> LLC – Returns Department</p>
              <p className="text-gray-700">3730 Review Avenue, Ste 202</p>
              <p className="text-gray-700">Long Island City, NY 11101</p>
            </div>
          </section>

          {/* Condition of Returned Items */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Condition of Returned Items</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex">
                <span className="mr-2">•</span>
                <span>All returns must arrive in resellable condition.</span>
              </li>
              <li className="flex">
                <span className="mr-2">•</span>
                <span>Items showing signs of wear, washing, alteration, or damage (including odors, stains, or pet hair) may be refused.</span>
              </li>
            </ul>
          </section>

          {/* Late or Unauthorized Returns */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Late or Unauthorized Returns</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex">
                <span className="mr-2">•</span>
                <span>Returns not initiated within 14 days of delivery may be rejected or, if accepted, will be eligible for store credit only.</span>
              </li>
              <li className="flex">
                <span className="mr-2">•</span>
                <span>Returns shipped more than 7 days after authorization may be rejected, unless the military/Foreign Service exception applies.</span>
              </li>
              <li className="flex">
                <span className="mr-2">•</span>
                <span>Returns sent without prior authorization may be delayed or refused.</span>
              </li>
            </ul>
          </section>

          {/* Defective or Incorrect Items */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Defective or Incorrect Items</h2>
            <p className="text-gray-700 leading-relaxed">
              If you receive a defective, damaged, or incorrect item, contact us immediately. We will cover return shipping and ensure the issue is resolved quickly.
            </p>
          </section>

          {/* Chargebacks */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Chargebacks</h2>
            <p className="text-gray-700 leading-relaxed">
              Initiating a chargeback instead of following this return process may delay resolution.  reserves the right to contest chargebacks and provide proof of compliance with this Return Policy.
            </p>
          </section>

          {/* Consumer Protection Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Consumer Protection Rights</h2>
            <p className="text-gray-700 leading-relaxed">
              Nothing in this Return Policy limits your rights under applicable New York consumer protection laws or other laws that cannot be waived by contract.
            </p>
          </section>

          {/* Contact Us */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-3"><strong>Questions about returns?</strong></p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex">
                <span className="mr-2">•</span>
                <span>
                  Email:{" "}
                  <a href="mailto:info@ny.com" className="text-blue-600 hover:text-blue-700">
                    info@ny.com
                  </a>
                </span>
              </li>
              <li className="flex">
                <span className="mr-2">•</span>
                <span>
                  Website:{" "}
                  <Link href="/contact" className="text-blue-600 hover:text-blue-700">
                    ny.com/contact
                  </Link>
                </span>
              </li>
            </ul>
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