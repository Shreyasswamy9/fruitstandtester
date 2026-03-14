"use client"

import Image from 'next/image'
import { useMemo, useState } from 'react'
import { bundles as defaultBundles, type Bundle } from '@/lib/bundles'
import { products as gridProducts, type Product } from './ProductsGridHome'
import BundleSheet from './BundleSheet'
import Price from './Price'

function parsePrice(priceStr: string): number {
  const n = Number(String(priceStr).replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? n : 0
}

function formatPrice(n: number): string {
  return `$${n.toFixed(2).replace(/\.00$/, '')}`
}

function getEffectivePrice(p: Product): number {
  // Per-product salePrice removed; use main price for bundle calculations
  return parsePrice(p.price)
}

export type BundlesGridProps = {
  bundles?: Bundle[]
  products?: Product[]
  className?: string
}

export default function BundlesGrid({ bundles = defaultBundles, products = gridProducts, className }: BundlesGridProps) {
  // bundle actions handled in the sheet; no direct cart ops here
  const [openSheet, setOpenSheet] = useState(false)
  const [selectedForSheet, setSelectedForSheet] = useState<string | null>(null)

  const productMap = useMemo(() => new Map(products.map(p => [p.id, p])), [products])
  const maxDiscount = useMemo(() => Math.max(0, ...bundles.map(b => b.discountPercent || 0)), [bundles])

  // Open sheet for bundle so user can choose size/options before adding
  const openBundleSheetFor = (bundle: Bundle) => {
    setSelectedForSheet(bundle.id)
    setOpenSheet(true)
  }

  return (
    <section className={className} aria-label="Bundle and save">
      <div className="text-center mb-6">
        <span className="glass-badge" aria-label={`Maximum bundle discount ${maxDiscount}%`}>
          Save up to {maxDiscount}%
        </span>
        <h2 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight">Bundle & Save</h2>
        <p className="mt-1 text-sm">Curated combos that pair perfectly</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
        {bundles.map((b) => {
          const items = b.itemIds.map(id => productMap.get(id)).filter(Boolean) as Product[]
          const originalSubtotal = items.reduce((acc, p) => acc + parsePrice(p.price), 0)
          const effectiveSubtotal = items.reduce((acc, p) => acc + getEffectivePrice(p), 0)
          const discount = Math.max(0, originalSubtotal - effectiveSubtotal)
          const total = Math.max(0, effectiveSubtotal)
          const computedPercent = originalSubtotal > 0 ? Math.round((discount / originalSubtotal) * 100) : 0

          return (
            <div key={b.id} className="glass-card rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4">
                <div>
                  <h3 className="text-lg font-semibold">{b.title}</h3>
                  {b.description && <p className="text-sm">{b.description}</p>}
                </div>
                {b.discountPercent ? (
                  <span className="glass-badge" data-variant="discount">
                    Save {b.discountPercent}%
                  </span>
                ) : null}
              </div>

              {/* Items thumbnails */}
              <div className="px-4 pb-2">
                <div className="flex gap-3 overflow-x-auto">
                  {items.map((p) => (
                    <div key={p.id} className="shrink-0 w-28">
                      <div className="relative w-28 h-36 overflow-hidden rounded-lg glass-thumb shadow-sm">
                        <Image src={p.image} alt={p.name} fill sizes="112px" style={{ objectFit: 'cover' }} />
                      </div>
                      <p className="text-xs mt-1 font-medium truncate">{p.name}</p>
                      {/* Price hidden for survey/testing mode */}
                      <p className="text-xs text-gray-400 italic">No price</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price summary hidden for survey/testing mode */}
              <div className="px-4 pt-2 pb-4">
                <div className="flex items-center justify-between text-sm text-gray-400 italic">
                  <span>Subtotal</span>
                  <span>—</span>
                </div>
                <div className="flex items-center justify-between text-base font-semibold mt-1 text-gray-400 italic">
                  <span>Total</span>
                  <span>—</span>
                </div>
              </div>

              {/* Actions: Add to cart disabled for survey/testing mode */}
              <div className="flex items-center gap-3 px-4 pb-4">
                <button
                  className="flex-1 bg-gray-300 text-gray-500 py-2.5 rounded-xl font-medium shadow-sm cursor-not-allowed"
                  aria-label="Add to cart disabled"
                  disabled
                >
                  Add to cart (disabled)
                </button>
                <button
                  onClick={() => { setSelectedForSheet(b.id); setOpenSheet(true) }}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50"
                  aria-label="View bundle details"
                >
                  Details
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Optional sheet for full experience */}
      <BundleSheet open={openSheet} initialSelectedId={selectedForSheet} onClose={() => { setOpenSheet(false); setSelectedForSheet(null); }} />
    </section>
  )
}
