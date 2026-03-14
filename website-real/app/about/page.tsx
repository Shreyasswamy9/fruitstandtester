import Link from "next/link"
import ProductPageBrandHeader from "@/components/ProductPageBrandHeader"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#fbf6f0] text-gray-900">
      <ProductPageBrandHeader />

      <section className="px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs tracking-[0.2em] uppercase text-gray-500">About Us</p>
          <h1 className="mt-4 text-4xl sm:text-5xl font-semibold leading-tight">Built in NYC, worn everywhere.</h1>
          <p className="mt-6 text-lg text-gray-700 max-w-3xl leading-relaxed">
             is a New York-based label focused on small-batch streetwear with strong silhouettes,
            practical details, and an emphasis on quality materials. We design pieces meant to be worn hard,
            layered often, and kept for years.
          </p>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold">Design</h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              Every drop starts with fit, fabric, and comfort. We iterate quickly and keep collections focused.
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold">Quality</h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              We work with trusted production partners and prioritize durable construction and finish.
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold">Community</h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
               grows through people who wear the product and share it. Thank you for building with us.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-5xl mx-auto bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold">Need help?</h3>
            <p className="text-gray-700 mt-2">For support, sizing, or order questions, our team is here.</p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-xl bg-black text-white px-5 py-3 font-medium hover:bg-gray-800 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  )
}
