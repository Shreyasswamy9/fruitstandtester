"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { hasConsent } from "@/lib/analytics/consent";

// Extend window to include fbq
declare global {
  interface Window {
    fbq?: (((...args: any[]) => void) & {
      callMethod?: (...args: any[]) => void;
      queue?: any[];
      push?: (...args: any[]) => void;
      loaded?: boolean;
      version?: string;
    }) | undefined;
    _fbq?: any;
    /** True when this browser is a flagged internal/staff device. */
    INTERNAL_USER?: boolean;
  }
}

/**
 * MetaPixelBase Component
 *
 * Injects the Meta Pixel base code into the page.
 * This must be loaded early (in <head> or at top of body) for accurate tracking.
 *
 * Features:
 * - Initializes window.fbq for client-side tracking
 * - Respects user consent before loading
 * - Does NOT fire initial PageView (handled by route change tracking)
 */

const PIXEL_ID = "951068325996992";

export default function MetaPixelBase() {
  const [consentGranted, setConsentGranted] = useState(false);

  useEffect(() => {
    // Check consent on mount
    const checkConsent = () => {
      // [META PIXEL: BLOCKED for internal users]
      // window.INTERNAL_USER is set synchronously by the bootstrap script in <head>
      // before this component mounts, so this guard is reliable.
      if (typeof window !== 'undefined' && window.INTERNAL_USER) {
        setConsentGranted(false);
        return;
      }
      const granted = hasConsent();
      setConsentGranted(granted);
    };

    checkConsent();

    // Listen for consent changes
    const handleConsentChange = () => {
      checkConsent();
    };

    window.addEventListener('consent-granted', handleConsentChange);
    window.addEventListener('consent-denied', handleConsentChange);
    window.addEventListener('storage', checkConsent);

    return () => {
      window.removeEventListener('consent-granted', handleConsentChange);
      window.removeEventListener('consent-denied', handleConsentChange);
      window.removeEventListener('storage', checkConsent);
    };
  }, []);

  // Don't load pixel if consent not granted
  if (!consentGranted && process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <>
      {/* Meta Pixel Base Code - NO initial PageView */}
      <Script
        id="meta-pixel-base"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${PIXEL_ID}');
          `,
        }}
      />
    </>
  );
}
