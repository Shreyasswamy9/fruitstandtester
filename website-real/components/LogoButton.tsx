"use client"

import React, { useContext } from "react"
import Image from 'next/image'
import { LogoVisibilityContext } from "./ClientRootLayout"
import Link from "next/link"

export default function LogoButton() {
  const { hideLogo } = useContext(LogoVisibilityContext)
  if (hideLogo) return null
  const logoSize = 120
  
  // On click, clear introPlayed so intro plays again
  const handleLogoClick = () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem('introPlayed');
      // Dispatch a custom event to notify the homepage
      window.dispatchEvent(new Event('introReset'));
    }
  };
  
  return (
    <Link
      href="/"
      aria-label="® home"
      title="®"
      onClick={handleLogoClick}
      style={{
          position: 'fixed',
          top: '-15px',
        left: '1px',
        zIndex: 10010,
        display: 'inline-flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        width: `${logoSize}px`,
        height: `${logoSize}px`,
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        outline: 'none',
        borderRadius: '0',
        transition: 'transform 0.25s ease',
        background: 'transparent',
        transformOrigin: 'top left',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'scale(1.04)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
      onFocus={e => {
        e.currentTarget.style.outline = '2px solid rgba(139,92,246,0.6)';
        e.currentTarget.style.outlineOffset = '4px';
      }}
      onBlur={e => {
        e.currentTarget.style.outline = 'none';
        e.currentTarget.style.outlineOffset = '0px';
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <Image
          src="/images/newlogo.png"
          alt="® Logo"
          fill
          unoptimized
          draggable={false}
          style={{
            objectFit: 'contain',
            display: 'block',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        />
      </div>
    </Link>
  )
}
