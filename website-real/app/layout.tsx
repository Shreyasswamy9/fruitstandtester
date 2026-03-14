import type { Metadata } from "next"
// Clerk removed. Use Supabase client or custom auth provider if needed.
import { Geist, Geist_Mono } from 'next/font/google'
import "./globals.css"
import ClientRootLayout from "../components/ClientRootLayout"
import { CartProvider } from "../components/CartContext"
import Script from 'next/script'
import { Suspense } from "react";
import MetaPixelBase from "@/components/MetaPixelBase";
declare global {
  interface Window {
    __SHOW_LOGO__?: boolean;
    /** True when this browser is a flagged internal/staff device. Set by the bootstrap script. */
    INTERNAL_USER?: boolean;
    /** GTM dataLayer — initialised by the bootstrap before GTM loads. */
    dataLayer?: Record<string, unknown>[];
  }
}

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: "®",
  description:
    "Discover the latest collection from ®. Premium clothing and accessories for the modern lifestyle.",
  keywords: ", clothing, fashion",
  authors: [{ name: "®" }],
  icons: {
    icon: "/images/newlogo.png",
    shortcut: "/images/newlogo.png",
    apple: "/images/newlogo.png",
  },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/*
         * ── INTERNAL DEVICE BOOTSTRAP ─────────────────────────────────────────
         * Runs synchronously before ANY analytics script (GTM, Meta, PostHog).
         *
         * Activation URL : ?staff_device=fstnd_7Kx9mQ2pR4vL       → marks this browser as internal
         * Reset URL      : ?staff_device_reset=fstnd_7Kx9mQ2pR4vL  → clears the internal flag
         *
         * The secret token (INTERNAL_DEVICE_TOKEN) is defined inline below.
         * Change it here and update the same value in any activation links you share.
         * ─────────────────────────────────────────────────────────────────────
         */}
        <script
          id="internal-device-bootstrap"
          dangerouslySetInnerHTML={{
            __html: `(function(){
  // ── INTERNAL DEVICE BOOTSTRAP ─────────────────────────────────────────────
  // Activation URL : ?staff_device=fstnd_7Kx9mQ2pR4vL
  // Reset URL      : ?staff_device_reset=fstnd_7Kx9mQ2pR4vL
  // Change INTERNAL_DEVICE_TOKEN to rotate the secret.
  var INTERNAL_DEVICE_TOKEN = 'fstnd_7Kx9mQ2pR4vL';
  var LS_KEY = 'internal_user';
  try {
    var params = new URLSearchParams(window.location.search);
    var cleaned = false;

    if (params.get('staff_device') === INTERNAL_DEVICE_TOKEN) {
      // [ACTIVATION] Store flag in localStorage
      localStorage.setItem(LS_KEY, 'true');
      params.delete('staff_device');
      cleaned = true;
    } else if (params.get('staff_device_reset') === INTERNAL_DEVICE_TOKEN) {
      // [RESET] Remove flag from localStorage
      localStorage.removeItem(LS_KEY);
      params.delete('staff_device_reset');
      cleaned = true;
    }

    // Expose globally so every analytics module can read it
    window.INTERNAL_USER = localStorage.getItem(LS_KEY) === 'true';

    // Remove activation / reset param from the address bar
    if (cleaned) {
      var qs = params.toString();
      history.replaceState(null, '',
        window.location.pathname + (qs ? '?' + qs : '') + window.location.hash);
    }

    // Push to GTM dataLayer on every page load
    // GA4 tags / GTM triggers can filter on internal_user === true
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'internal_user_status',
      internal_user: window.INTERNAL_USER
    });

  } catch(e) {
    // Fail silently — never break the page for analytics errors
    window.INTERNAL_USER = false;
  }
})();`,
          }}
        />
        <MetaPixelBase />
        <Script id="google-tag-manager" strategy="afterInteractive">{`
        // [GA: BLOCKED for internal users]
        // window.INTERNAL_USER is set synchronously by the bootstrap script above.
        if (!window.INTERNAL_USER) {
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-5Q32QDV8');
        }`}
        </Script>
      </head>
      <body 
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#fbf6f0]`}
        suppressHydrationWarning
      >
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-5Q32QDV8"
        height="0" width="0" style={{display:'none',visibility:'hidden'}}></iframe></noscript>
        <CartProvider>
          <Suspense fallback={null}>
            <ClientRootLayout>
              {children}
            </ClientRootLayout>
          </Suspense>
        </CartProvider>
      </body>
    </html>
  )
}
