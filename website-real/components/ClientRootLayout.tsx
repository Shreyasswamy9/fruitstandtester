"use client"

import React, { createContext, useState, useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { ensurePosthog, capturePageview } from "../instrumentation.client"
import LogoButton from "./LogoButton"
import CartBar from "./CartBar"
import StaggeredMenu from "./StagerredMenu"
import SiteFooter from "./SiteFooter"
import BackgroundVideo from "./BackgroundVideo"

// Context to control logo visibility (for intro)
export const LogoVisibilityContext = createContext<{ hideLogo: boolean; setHideLogo: (v: boolean) => void }>({ hideLogo: false, setHideLogo: () => {} })

type ClientRootLayoutProps = {
  children: React.ReactNode
}

export default function ClientRootLayout({ children }: ClientRootLayoutProps) {
  const [hideLogo, setHideLogo] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isShopRoute = pathname?.startsWith('/shop')

  // Ensure PostHog initializes on every client render
  useEffect(() => {
    ensurePosthog()
  }, [])

  useEffect(() => {
    const query = searchParams?.toString()
    capturePageview(query ? `${pathname}?${query}` : pathname)
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

  // Hide logo on certain routes (cart) to avoid visual overlap with page headers
  // Note: logo visibility is now controlled by context only. Keep logo visible on all routes by default.
  
  return (
    <LogoVisibilityContext.Provider value={{ hideLogo, setHideLogo }}>
      <BackgroundVideo />
      {/* Logo button, visible on every page, picture only, hidden if hideLogo */}
      <LogoButton />
      
      {children}
      <SiteFooter />
      {/* Bottom spacer on shop/product pages so CartBar doesn't cover content */}
      {isShopRoute && (
        <div aria-hidden className="h-28 md:h-24" />
      )}
      
      <CartBar />
      
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
            { label: "Account", ariaLabel: "Access your account", link: "/account" },
            { label: "Cart", ariaLabel: "View your cart", link: "/cart" },
            { label: "Contact", ariaLabel: "Contact us", link: "/contact" }
          ]}
          socialItems={[
            { label: "Instagram", link: "https://www.instagram.com/fruitstandny/" },
            { label: "X", link: "https://x.com/FruitStandNY" },
            { label: "Facebook", link: "https://www.facebook.com/FRUITSTANDNY" }
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
          position: relative !important;
          z-index: 10003 !important;
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