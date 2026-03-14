"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Instagram, Facebook } from "lucide-react"

export default function SiteFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              <sup>®</sup>
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Organic New York Culture™
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm">
            <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">About Us</Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</Link>
            <Link href="/cookie-policy" className="text-gray-600 hover:text-gray-900 transition-colors">Cookie Policy</Link>
            <Link href="/return-policy" className="text-gray-600 hover:text-gray-900 transition-colors">Return Policy</Link>
            <Link href="/privacy-policy" className="text-gray-600 hover:text-gray-900 transition-colors">Privacy Policy</Link>
            <Link href="/terms-and-conditions" className="text-gray-600 hover:text-gray-900 transition-colors">Terms and Conditions</Link>
          </div>

          <div className="flex justify-center gap-6 mb-8">
            <a
              href="https://www.instagram.com/ny?igsh=MWNqcmFwdGRvaWQzOQ=="
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Instagram"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram className="w-6 h-6" />
            </a>
            <a
              href="https://www.facebook.com/ny"
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Facebook"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Facebook className="w-6 h-6" />
            </a>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <p className="text-gray-500 text-sm">
              © {currentYear} <sup>®</sup>. All rights reserved.
            </p>
            <p className="text-gray-400 text-xs mt-2">
              Designed and crafted with care in New York, NY
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
