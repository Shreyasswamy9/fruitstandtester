"use client";

import React from "react";

interface MarqueeBannerProps {
  items?: string[]; 
  speed?: number; // seconds for one full loop
  backgroundColor?: string;
  textColor?: string;
  separator?: string;
}

const defaultItems = [
  "FREE SHIPPING ON ORDERS OVER $75",
  "NEW ARRIVALS",
  "MADE FOR THE STREETS OF NEW YORK",
  "SHOP NOW",
  " NY",
];

export default function MarqueeBanner({
  items = defaultItems,
  speed = 30,
  backgroundColor = "#181818",
  textColor = "#ffffff",
  separator = "✦",
}: MarqueeBannerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [repeatCount, setRepeatCount] = React.useState(4); // Start with a safe default

  React.useEffect(() => {
    if (!containerRef.current || !trackRef.current) return;
    const containerWidth = containerRef.current.offsetWidth;
    const trackWidth = trackRef.current.scrollWidth;
    if (trackWidth < containerWidth * 2) {
      const singleSetWidth = trackWidth / repeatCount;
      let minRepeats = Math.ceil((containerWidth * 2) / singleSetWidth);
      minRepeats = Math.max(minRepeats, 2); // at least twice for seamless
      setRepeatCount(minRepeats);
    }
  }, [items, repeatCount]);

  const allItems = Array.from({ length: repeatCount }, () => items).flat();

  return (
    <div
      className="marquee-banner w-full overflow-hidden"
      style={{ backgroundColor, borderTop: "1px solid #6ee86e", borderBottom: "1px solid #6ee86e" }}
      ref={containerRef}
    >
      <div
        className="marquee-track flex items-center whitespace-nowrap"
        style={{
          animation: `marquee ${speed}s linear infinite`,
          willChange: "transform",
        }}
        ref={trackRef}
      >
        {allItems.map((item, i) => (
          <React.Fragment key={i}>
            <span
              className="text-[13px] font-black uppercase tracking-[0.22em] py-3 px-4"
              style={{ color: textColor, fontFamily: "Avenir Black, Avenir, Helvetica, Arial, sans-serif", WebkitTextStroke: "0.5px currentColor" }}
            >
              {item}
            </span>
            <span
              className="text-[10px] py-3 px-1"
              style={{ color: textColor, opacity: 0.5 }}
            >
              {separator}
            </span>
          </React.Fragment>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          display: inline-flex;
          width: max-content;
        }
      `}</style>
    </div>
  );
}
