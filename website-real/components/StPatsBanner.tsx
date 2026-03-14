"use client";

import React from "react";

interface StPatsBannerProps {
  /** The green colorway display name, e.g. "Moss" or "Grasshopper" */
  colorName: string;
}

interface StPatsNudgeProps {
  /** The green colorway display name */
  colorName: string;
  /** The discounted price */
  salePrice: number;
}

/**
 * Subtle inline nudge shown when a non-green color is selected.
 * Reminds the customer that the green colorway is 50% off.
 */
export function StPatsNudge({ colorName, salePrice }: StPatsNudgeProps) {
  return (
    <div
      className="flex items-center gap-2 rounded-xl px-3 py-2 my-4"
      style={{
        background: "rgba(14, 64, 14, 0.07)",
        border: "1px solid rgba(74,183,74,0.22)",
      }}
    >
      <span className="text-[14px] leading-none shrink-0">☘️</span>
      <p className="text-[11px] leading-snug" style={{ color: "#2e6b2e" }}>
        <span className="font-black uppercase tracking-wide">St. Patrick&apos;s Day — </span>
        The <span className="font-bold">{colorName}</span> colorway is{" "}
        <span className="font-bold">50% off</span> (${salePrice.toFixed(2)}). Select it to save.
      </p>
    </div>
  );
}

/**
 * Aesthetic St. Patrick's Day 50%-off banner shown on qualifying PDPs
 * when the green colorway is selected during the sale window.
 */
export default function StPatsBanner({ colorName }: StPatsBannerProps) {
  return (
    <div className="st-pats-banner relative overflow-hidden rounded-2xl my-6 px-5 py-4"
      style={{
        background: "linear-gradient(135deg, #0a2e0a 0%, #1a4d1a 40%, #0d3b0d 100%)",
        border: "1px solid rgba(74,183,74,0.35)",
        boxShadow: "0 0 0 1px rgba(74,183,74,0.12), 0 8px 32px rgba(0,0,0,0.28)",
      }}
    >
      {/* Subtle clover watermark */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-4 -top-4 select-none text-[110px] opacity-[0.06] leading-none"
        style={{ filter: "blur(1px)" }}
      >
        ☘️
      </div>

      {/* Top row: badge + discount pill */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[15px] leading-none">☘️</span>
          <span
            className="text-[10px] font-black uppercase tracking-[0.22em]"
            style={{ color: "#6ee86e", letterSpacing: "0.22em" }}
          >
            St. Patrick&apos;s Day
          </span>
        </div>

        <div
          className="ml-auto rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase tracking-[0.14em]"
          style={{
            background: "linear-gradient(90deg, #4ab74a, #2e8b2e)",
            color: "#ffffff",
            boxShadow: "0 2px 8px rgba(74,183,74,0.45)",
          }}
        >
          50% OFF
        </div>
      </div>

      {/* Main message */}
      <p
        className="text-[22px] font-black uppercase leading-tight tracking-[0.04em] mb-1"
        style={{ color: "#ffffff" }}
      >
        Go Green, Save Big
      </p>
      <p className="text-[12px] leading-relaxed mb-3" style={{ color: "rgba(180,255,180,0.75)" }}>
        The <span style={{ color: "#8dff8d", fontWeight: 700 }}>{colorName}</span> colorway is{" "}
        <span style={{ color: "#8dff8d", fontWeight: 700 }}>50% off</span> through March 17th.
        
      </p>

      {/* Bottom note */}
      <p className="mt-3 text-[10px] uppercase tracking-[0.18em]" style={{ color: "rgba(120,200,120,0.55)" }}>
        Discount applied Green colorway only
      </p>
    </div>
  );
}
