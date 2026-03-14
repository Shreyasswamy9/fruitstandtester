"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "../app/supabase-client"
import Link from "next/link"
import ShopDropdown from "./ShopDropdown"
import type { User } from "@supabase/supabase-js"

interface NavbarProps {
  isShopDropdownOpen: boolean
  setIsShopDropdownOpen: (open: boolean) => void
}

export default function Navbar({ isShopDropdownOpen, setIsShopDropdownOpen }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    let mounted = true

    async function init() {
      const { data } = await supabase.auth.getUser()
      if (!mounted) return
      setUser(data.user ?? null)
      setIsSignedIn(!!data.user)
      setIsLoaded(true)
    }

    init()

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user ?? null
      setUser(u)
      setIsSignedIn(!!u)
      setIsLoaded(true)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const handleShopHover = (open: boolean) => {
    if (window.innerWidth > 768) {
      setIsShopDropdownOpen(open)
    }
  }

  const handleShopClick = () => {
    if (window.innerWidth <= 768) {
      setIsShopDropdownOpen(!isShopDropdownOpen)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/10 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left - Home and Shop Button */}
          <div className="flex items-center space-x-6">
            <Link
              href="/"
              className="text-white hover:text-gray-300 transition-colors duration-200 font-bold text-xl"
            >
              <><sup>®</sup></>
            </Link>
            <div className="relative">
              <button
                onMouseEnter={() => handleShopHover(true)}
                onMouseLeave={() => handleShopHover(false)}
                onClick={handleShopClick}
                className="text-emerald-300 hover:text-emerald-200 transition-colors duration-200 text-xl font-light"
              >
                Shop
              </button>
              <AnimatePresence>{isShopDropdownOpen && <ShopDropdown />}</AnimatePresence>
            </div>
          </div>

          {/* Center - Empty space for layout balance */}
          <div className="flex-1"></div>

          {/* Right - Navigation Links */}
          <div className="flex items-center space-x-4">
            {/* Authentication Links */}
            {!isLoaded ? (
              <div className="hidden md:block w-16 h-4 bg-gray-300 rounded animate-pulse"></div>
            ) : isSignedIn ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="hidden md:flex items-center text-white hover:text-gray-300 transition-colors duration-200"
                >
                  <span className="mr-1">Hi, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* User Dropdown */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
                    >
                      <Link
                        href="/account"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        My Account
                      </Link>
                      {/* Note: Clerk publicMetadata.role replaced. If you store role in user metadata or a separate table, adapt accordingly. */}
                      {user?.user_metadata?.role === "admin" && (
                        <Link
                          href="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false)
                          handleSignOut()
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link
                  href="/auth/signin"
                  className="text-white hover:text-gray-300 transition-colors duration-200"
                >
                  Sign In
                </Link>
                <span className="text-gray-400">|</span>
                <Link
                  href="/auth/signup"
                  className="text-white hover:text-gray-300 transition-colors duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}

            <Link
              href="/contact"
              className="hidden md:block text-white hover:text-gray-300 transition-colors duration-200"
            >
              Contact
            </Link>
            <Link href="/cart" className="text-white hover:text-gray-300 transition-colors duration-200">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden hover:opacity-80 transition-opacity duration-200"
              style={{ color: "#159b62" }}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden bg-black/20 backdrop-blur-sm"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link href="/" className="block text-white hover:text-gray-300 px-3 py-2 text-base font-medium">
                  Home
                </Link>
                <button
                  onClick={handleShopClick}
                  className="block w-full text-left text-white hover:text-gray-300 px-3 py-2 text-base font-medium"
                >
                  Shop
                </button>
                {isShopDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="pl-6 space-y-1"
                  >
                    <Link href="/tshirts" className="block text-white hover:text-gray-300 px-3 py-2 text-sm">
                      T-Shirts
                    </Link>
                    <Link href="/tracksuits" className="block text-white hover:text-gray-300 px-3 py-2 text-sm">
                      Tracksuits
                    </Link>
                    <Link href="/jerseys" className="block text-white hover:text-gray-300 px-3 py-2 text-sm">
                      Jerseys
                    </Link>
                    <Link href="/hats" className="block text-white hover:text-gray-300 px-3 py-2 text-sm">
                      Hats
                    </Link>
                    <Link href="/socks" className="block text-white hover:text-gray-300 px-3 py-2 text-sm">
                      Socks
                    </Link>
                  </motion.div>
                )}

                {/* Mobile Authentication */}
                {isSignedIn ? (
                  <div className="border-t border-gray-600 pt-2 mt-2">
                    <div className="px-3 py-2 text-white font-medium">
                      Hi, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}
                    </div>
                    <Link
                      href="/account"
                      className="block text-white hover:text-gray-300 px-3 py-2 text-base font-medium"
                    >
                      My Account
                    </Link>
                    {user?.user_metadata?.role === "admin" && (
                      <Link
                        href="/admin"
                        className="block text-white hover:text-gray-300 px-3 py-2 text-base font-medium"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left text-white hover:text-gray-300 px-3 py-2 text-base font-medium"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="border-t border-gray-600 pt-2 mt-2">
                    <Link
                      href="/auth/signin"
                      className="block text-white hover:text-gray-300 px-3 py-2 text-base font-medium"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="block text-white hover:text-gray-300 px-3 py-2 text-base font-medium"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}

                <Link href="/contact" className="block text-white hover:text-gray-300 px-3 py-2 text-base font-medium">
                  Contact
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlay to close user menu when clicking outside */}
        {isUserMenuOpen && (
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsUserMenuOpen(false)}
          />
        )}
      </div>
    </nav>
  )
}
