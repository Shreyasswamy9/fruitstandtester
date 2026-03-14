"use client"

import React, { createContext, useState, useEffect, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { ensurePosthog, capturePageview } from "../instrumentation.client"
import { trackPageView } from "@/lib/analytics/meta-pixel"
import LogoButton from "./LogoButton"
import StaggeredMenu from "./StagerredMenu"
import SiteFooter from "./SiteFooter"
import CartBar from "./CartBar"
import CartOverlay from "./CartOverlay"
import GlobalAddToCartTracker from '@/components/GlobalAddToCartTracker';
import { useSurveyMode } from "@/hooks/useSurveyMode";

// Context to control logo visibility (for intro)
export const LogoVisibilityContext = createContext<{ hideLogo: boolean; setHideLogo: (v: boolean) => void }>({ hideLogo: false, setHideLogo: () => {} })

type ClientRootLayoutProps = {
  children: React.ReactNode
}

export default function ClientRootLayout({ children }: ClientRootLayoutProps) {
  const [hideLogo, setHideLogo] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const isSurveyMode = useSurveyMode()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastTrackedUrl = useRef<string>('')

  // Ensure PostHog initializes on every client render
  useEffect(() => {
    ensurePosthog()
  }, [])

  // Track Meta Pixel PageView on route changes (SPA navigation)
  useEffect(() => {
    const query = searchParams?.toString()
    const currentUrl = query ? `${pathname}?${query}` : pathname

    // Dedupe: only track if URL actually changed
    if (currentUrl !== lastTrackedUrl.current) {
      lastTrackedUrl.current = currentUrl
      
      // Track Meta Pixel PageView
      trackPageView()
      
      // Track PostHog pageview
      capturePageview(currentUrl)
    }
  }, [pathname, searchParams])

  // Apply a global class to body for pages to react (e.g., hide category pills)
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const body = document.body
      if (menuOpen) {
        body.classList.add('menu-open')
      } else {
        body.classList.remove('menu-open')
      }
    }
  }, [menuOpen])

  // Auto-close menu on route change (App Router pathname observer)
  useEffect(() => {
    if (menuOpen) {
      setMenuOpen(false)
    }
  }, [pathname, menuOpen])

  useEffect(() => {
    // Universal uppercase logic removed
  }, [pathname])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    if (pathname && pathname.startsWith('/shop/') && pathname !== '/shop') {
      window.scrollTo({ top: 0, behavior: 'auto' })
      const raf = requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'auto' }))
      return () => cancelAnimationFrame(raf)
    }
  }, [pathname])

  // Survey project safeguard: strip visible dollar prices from PDPs, including legacy hardcoded text.
  useEffect(() => {
    if (!isSurveyMode) return
    if (!pathname?.startsWith('/shop/')) return
    if (pathname === '/shop') return
    if (typeof document === 'undefined') return

    const pricePattern = /\$\s?\d[\d,]*(?:\.\d{1,2})?/g

    const sanitizeTextNodes = (root: ParentNode) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
      let node: Node | null = walker.nextNode()

      while (node) {
        const parent = node.parentElement
        const tag = parent?.tagName
        const skip = !parent || tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT'

        if (!skip) {
          const current = node.textContent ?? ''
          if (pricePattern.test(current)) {
            node.textContent = current.replace(pricePattern, 'Coming Soon')
          }
          pricePattern.lastIndex = 0
        }

        node = walker.nextNode()
      }
    }

    sanitizeTextNodes(document.body)

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((added) => {
          if (added.nodeType === Node.TEXT_NODE) {
            const text = added.textContent ?? ''
            if (pricePattern.test(text)) {
              added.textContent = text.replace(pricePattern, 'Coming Soon')
            }
            pricePattern.lastIndex = 0
            return
          }

          if (added.nodeType === Node.ELEMENT_NODE) {
            sanitizeTextNodes(added as ParentNode)
          }
        })
      }
    })

    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [isSurveyMode, pathname])

  // Hide logo on certain routes (cart) to avoid visual overlap with page headers
  // Note: logo visibility is now controlled by context only. Keep logo visible on all routes by default.
  
  return (
    <LogoVisibilityContext.Provider value={{ hideLogo, setHideLogo }}>
      {/* Global AddToCart tracker */}
      <GlobalAddToCartTracker />
      
      {/* Logo button, visible on every page, picture only, hidden if hideLogo */}
      <LogoButton />
      
      {children}
      {/* <CartOverlay /> */}
      {/* <CartBar /> */}
      <SiteFooter />
      
      {/* Global StaggeredMenu - appears on all pages */}
      <div 
        style={{ 
          position: "fixed", 
          top: 0, 
          left: 0, 
          width: "100vw", 
          height: "100vh", 
          zIndex: 10001, 
          pointerEvents: "none" 
        }}
      >
        <StaggeredMenu
          position="right"
          colors={['#18191a', '#232324']}
          className="custom-staggered-menu"
          items={[
            { label: "Home", ariaLabel: "Go to homepage", link: "/" },
            { label: "Shop", ariaLabel: "Browse products", link: "/shop" },
            { label: "Contact", ariaLabel: "Contact us", link: "/contact" },
            { label: "Policies", ariaLabel: "View our policies", link: "/privacy-policy" },
            { label: "About Us", ariaLabel: "Learn about us", link: "/about" }
          ]}
          socialItems={[
            { label: "Instagram", link: "https://www.instagram.com/ny/" },
            { label: "Facebook", link: "https://www.facebook.com/NY" }
          ]}
          displaySocials={true}
          displayItemNumbering={true}
          logoUrl="/images/newlogo.png"
          menuButtonColor="#000000"
          openMenuButtonColor="#000000"
          changeMenuColorOnOpen={false}
          accentColor="#ff6b6b"
          onMenuOpen={() => setMenuOpen(true)}
          onMenuClose={() => setMenuOpen(false)}
        />
      </div>

      {/* Global menu styles */}
      <style jsx global>{`
        .custom-staggered-menu .staggered-menu-header {
          pointer-events: auto !important;
          position: absolute !important;
          top: 40px !important;
          right: 18px !important;
          left: auto !important;
          z-index: 10003 !important;
          padding: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: flex-end !important;
          width: auto !important;
        }

        .custom-staggered-menu .sm-toggle {
          pointer-events: auto !important;
          background: transparent !important;
          border: none !important;
          color: #000000 !important;
          font-size: 16px !important;
          font-weight: 400 !important;
          padding: 8px 12px !important;
        }

        /* Ensure animated label is visible and safely clipped */
        .custom-staggered-menu .sm-toggle {
          gap: 0.3rem !important;
        }
        .custom-staggered-menu .sm-toggle-textWrap {
          display: inline-block !important;
          height: 1em !important;
          overflow: hidden !important;
          white-space: nowrap !important;
          /* Reserve width for the longest word ("Close") to avoid jitter */
          width: 5.2ch !important;
          min-width: 5.2ch !important;
          vertical-align: middle !important;
          will-change: transform;
        }
        .custom-staggered-menu .sm-toggle-textInner {
          display: flex !important;
          flex-direction: column !important;
          line-height: 1 !important;
          will-change: transform;
        }
        .custom-staggered-menu .sm-toggle-line {
          display: block !important;
          height: 1em !important;
          line-height: 1 !important;
        }

        .custom-staggered-menu:not([data-open]) {
          pointer-events: none !important;
        }

        .custom-staggered-menu:not([data-open]) .staggered-menu-header,
        .custom-staggered-menu:not([data-open]) .sm-toggle {
          pointer-events: auto !important;
        }

        .custom-staggered-menu[data-open] {
          pointer-events: auto !important;
        }

        .custom-staggered-menu[data-open] .staggered-menu-panel {
          pointer-events: auto !important;
        }

        .custom-staggered-menu:not([data-open]) .staggered-menu-panel {
          pointer-events: none !important;
        }

        .custom-staggered-menu[data-open] * {
          pointer-events: auto !important;
        }

        @media (max-width: 768px) {
          .custom-staggered-menu .sm-toggle {
            font-size: 12px !important;
            padding: 0 12px !important;
          }
        }

        /* When menu is open, hide/fade category pills (shop page) */
        body.menu-open .shop-category-nav {
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.25s ease;
        }
        .shop-category-nav {
          transition: opacity 0.25s ease;
        }
      `}</style>
    </LogoVisibilityContext.Provider>
  )
}