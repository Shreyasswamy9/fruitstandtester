"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface SizeGuideProps {
  productSlug: string; // e.g. 'classic-tee'
  imagePath?: string; // override full path (e.g. '/images/size-guides/custom.png')
  buttonLabel?: string;
  className?: string;
}

// Convention: if imagePath not provided we derive `/images/size-guides/${productSlug}.png`
export const SizeGuide: React.FC<SizeGuideProps> = ({
  productSlug,
  imagePath,
  buttonLabel = 'Size Guide',
  className = ''
}) => {
  const [open, setOpen] = useState(false);
  // Candidate image sources to try before showing a fallback UI
  const candidatePaths = React.useMemo(() => {
    if (imagePath) return [imagePath];
    // Special cases for Liberty Hoodie/Zip-Up, Rugby Jersey, and Waffle Knit
    if (productSlug === "liberty-hoodie" || productSlug === "liberty-zip-up") {
      return [
        "/images/size-guides/Size Guide/liberty hoodie size guide.jpeg",
        "/images/size-guides/liberty-hoodie.png",
        "/images/size-guides/liberty-hoodie.jpg",
        "/images/size-guides/liberty-hoodie.jpeg",
        "/images/size-guides/liberty-hoodie.webp",
      ];
    }
    if (productSlug === "rugby-jersey" || productSlug === "kiwi-rugby-jersey" || productSlug === "jozi-rugby-jersey") {
      return [
        "/images/size-guides/Size Guide/rugby jersey size guide.jpeg",
        "/images/size-guides/rugby-jersey.png",
        "/images/size-guides/rugby-jersey.jpg",
        "/images/size-guides/rugby-jersey.jpeg",
        "/images/size-guides/rugby-jersey.webp",
      ];
    }
    if (productSlug === "waffle-knit" || productSlug === "stamped-waffle-knit") {
      return [
        "/images/size-guides/Size Guide/waffle knit.jpeg",
        "/images/size-guides/waffle-knit.png",
        "/images/size-guides/waffle-knit.jpg",
        "/images/size-guides/waffle-knit.jpeg",
        "/images/size-guides/waffle-knit.webp",
      ];
    }
    const base = `/images/size-guides/${productSlug}`;
    return [
      `${base}.png`,
      `${base}.jpg`,
      `${base}.jpeg`,
      `${base}.webp`,
    ];
  }, [imagePath, productSlug]);

  const [activeSrcIndex, setActiveSrcIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  // Reset when slug or explicit path changes
  useEffect(() => {
    setActiveSrcIndex(0);
    setImageError(false);
  }, [productSlug, imagePath]);

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false);
  }, []);

  useEffect(() => {
    if (open) {
      window.addEventListener('keydown', onKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    }
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onKeyDown]);

  return (
    <>
      <motion.button
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(true)}
        className={`group inline-flex items-center gap-1 px-0 py-1 bg-transparent text-sm font-semibold tracking-wide underline underline-offset-4 decoration-black/60 hover:decoration-black transition-colors ${className}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={`size-guide-modal-${productSlug}`}
      >
        <span className="relative z-10">{buttonLabel}</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={`size-guide-modal-${productSlug}`}
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-10010 flex items-center justify-center p-6 backdrop-blur-sm"
            style={{ background: 'rgba(0,0,0,0.55)' }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-black/10 bg-linear-to-b from-white to-neutral-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-3 right-3 z-20">
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close size guide"
                  className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-semibold border border-black/10 hover:border-black/40 hover:bg-white transition"
                >
                  Close ✕
                </button>
              </div>
              <div className="relative w-full h-130">
                {!imageError ? (
                  <Image
                    src={candidatePaths[Math.min(activeSrcIndex, candidatePaths.length - 1)]}
                    alt={`${productSlug} size guide`}
                    fill
                    sizes="(max-width: 768px) 90vw, 520px"
                    style={{ objectFit: 'contain' }}
                    className="select-none"
                    priority
                    onError={() => {
                      if (activeSrcIndex < candidatePaths.length - 1) {
                        setActiveSrcIndex((i) => i + 1);
                      } else {
                        setImageError(true);
                      }
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-neutral-50">
                    <div className="text-center px-8">
                      <div className="mb-3 text-3xl" aria-hidden>📏</div>
                      <p className="text-sm font-medium text-neutral-700">Size guide coming soon</p>
                      <p className="mt-1 text-xs text-neutral-500">
                        We couldn’t load the guide image for “{productSlug}”. If you need help with sizing, contact us.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="px-6 pb-6 pt-4 text-center text-xs text-neutral-500">
                <p>Measure carefully to ensure the best fit. Guides may vary slightly by collection.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SizeGuide;