"use client"

import { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { bundles as defaultBundles, type Bundle } from '@/lib/bundles'
import { TEE_VARIANTS, SIZE_OPTIONS, type TeeVariant, type TeeColor, type SizeOption } from '@/lib/teeVariants'
import { CUSTOM_BUNDLE_SIZES, CUSTOM_BUNDLE_PRICES, type CustomBundleSize } from '@/lib/customBundles'
import { products as gridProducts, type Product } from './ProductsGridHome'
import Price from './Price'
import { useCart } from './CartContext'

// ---------- utils
function parsePrice(priceStr: string): number {
  const n = Number(String(priceStr).replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? n : 0
}

function getEffectivePrice(p: Product): number {
  // Bundle pricing uses the regular product price. Per-product sale prices removed.
  return parsePrice(p.price)
}
function formatPrice(n: number): string {
  return `$${n.toFixed(2).replace(/\.00$/, '')}`
}

// ---------- props
export type BundleSheetProps = {
  open: boolean
  onClose: () => void
  bundles?: Bundle[]
  products?: Product[]
  // optionally preselect a bundle when opening the sheet
  initialSelectedId?: string | null
  // optionally open the sheet on the 'custom' tab
  initialTab?: 'curated' | 'custom'
}

// Rebuilt from scratch: a clean, polished bottom sheet for curated bundles and a custom builder
export default function BundleSheet({ open, onClose, bundles = defaultBundles, products = gridProducts, initialSelectedId = null, initialTab = 'curated' }: BundleSheetProps) {
  const { addToCart, addBundleToCart } = useCart()

  // allow choosing a default size per curated bundle (applies to tees in bundle)
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({})

  // UI state
  const [mounted, setMounted] = useState(false)
  const [adding, setAdding] = useState(false)
  const [tab, setTab] = useState<'curated' | 'custom'>('curated')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [teaseBuild, setTeaseBuild] = useState(false)

  // Custom builder state
  const [comboSize, setComboSize] = useState<CustomBundleSize>(2)
  type CustomItem = { tee: TeeVariant; color: TeeColor; size?: SizeOption }
  const defaultItem = useCallback((i: number): CustomItem => {
    const tee = TEE_VARIANTS[i % TEE_VARIANTS.length]
    return { tee, color: tee.colors[0], size: undefined }
  }, [])
  const [customItems, setCustomItems] = useState<CustomItem[]>(Array.from({ length: comboSize }, (_, i) => defaultItem(i)))
  // Refs for guided scrolling
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const teeRefs = useRef<(HTMLSelectElement | null)[]>([])
  const colorRefs = useRef<(HTMLDivElement | null)[]>([])
  const sizeRefs = useRef<(HTMLSelectElement | null)[]>([])
  const scrollIntoViewWithin = useCallback((el: HTMLElement | null, offset = 48) => {
    const container = scrollContainerRef.current
    if (!el || !container) return
    const parentRect = container.getBoundingClientRect()
    const rect = el.getBoundingClientRect()
    const top = container.scrollTop + (rect.top - parentRect.top) - offset
    container.scrollTo({ top, behavior: 'smooth' })
  }, [])

  // Derived
  const productMap = useMemo(() => new Map(products.map(p => [p.id, p])), [products])
  const maxDiscount = useMemo(() => bundles.reduce((m, b) => Math.max(m, b.discountPercent || 0), 0), [bundles])
  const canAddCustom = useMemo(() => customItems.every(ci => ci.tee && ci.color && ci.size), [customItems])
  const filledCount = useMemo(() => customItems.filter(ci => !!ci.size).length, [customItems])

  // Lifecycle
  useEffect(() => setMounted(true), [])
  useEffect(() => {
    if (!mounted) return
    const onKey = (e: KeyboardEvent) => { if (open && e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mounted, open, onClose])
  useEffect(() => {
    if (!mounted) return
    // lock scroll when sheet is open using fixed positioning (works on mobile)
    let scrollY = 0
    const body = document.body
    if (open) {
      scrollY = window.scrollY || window.pageYOffset || 0
      // apply lock
      body.style.position = 'fixed'
      body.style.top = `-${scrollY}px`
      body.style.left = '0'
      body.style.right = '0'
      body.style.overflow = 'hidden'
    }
    return () => {
      // restore
      body.style.position = ''
      body.style.top = ''
      body.style.left = ''
      body.style.right = ''
      body.style.overflow = ''
      if (open) {
        // restore scroll position
        window.scrollTo(0, scrollY)
      }
    }
  }, [mounted, open])
  // Gentle one-time nudge to highlight the Build tab (respect reduced motion)
  useEffect(() => {
    if (!open) return
    if (typeof window === 'undefined') return
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const already = sessionStorage.getItem('buildTeased')
    if (!already && !reduced) {
      setTeaseBuild(true)
      const t = setTimeout(() => setTeaseBuild(false), 1800)
      sessionStorage.setItem('buildTeased', '1')
      return () => clearTimeout(t)
    }
  }, [open])
  useEffect(() => {
    if (!open) return
    const hasInitial = typeof initialSelectedId === 'string' && initialSelectedId.length > 0
    if (hasInitial) {
      setSelectedId(initialSelectedId)
    } else {
      setSelectedId(prev => prev ?? (bundles[0]?.id ?? null))
    }
    setTab(initialTab ?? 'curated')
  }, [open, bundles, initialSelectedId, initialTab])

  useEffect(() => {
    // when opening, ensure selected bundle has a default size (M)
    if (!open) return
    const id = selectedId ?? (initialSelectedId ?? bundles[0]?.id ?? null)
    if (!id) return
    setSelectedSizes(prev => ({ ...prev, [id]: prev[id] ?? 'M' }))
  }, [open, selectedId, initialSelectedId, bundles])
  useEffect(() => {
    setCustomItems(prev => {
      const next = [...prev]
      if (next.length < comboSize) for (let i = next.length; i < comboSize; i++) next.push(defaultItem(i))
      else if (next.length > comboSize) next.length = comboSize
      return next
    })
    // Ensure ref arrays match new size
    teeRefs.current.length = Number(comboSize)
    colorRefs.current.length = Number(comboSize)
    sizeRefs.current.length = Number(comboSize)
  }, [comboSize, defaultItem])

  // Actions
  const addCuratedToCart = (bundle: Bundle) => {
    if (adding) return
    setAdding(true)
    // compute subtotal/discount/total
  const items = (bundle.itemIds.map(id => productMap.get(id)).filter(Boolean) as Product[])
    const originalSubtotal = items.reduce((acc, p) => acc + parsePrice(p.price), 0)
    const discount = Math.max(0, Math.round((bundle.discountPercent || 0) * 100) / 100 === 0 ? 0 : originalSubtotal * ((bundle.discountPercent || 0) / 100))
    const total = Math.max(0, originalSubtotal - discount)
  // add a single bundle line item to the cart, include chosen size if present
  const chosenSize = selectedSizes[bundle.id]
  addBundleToCart({ bundleId: bundle.id, name: bundle.title, price: total, image: items[0]?.image || '/images/classicteemale1.jpeg', itemIds: bundle.itemIds, bundleSize: chosenSize, quantity: 1 })
    setTimeout(() => setAdding(false), 350)
  }
  const addCustomToCart = () => {
    if (!canAddCustom || adding) return
    setAdding(true)
    const price = CUSTOM_BUNDLE_PRICES[comboSize]
    const summary = customItems.map(ci => `${ci.tee.name} • ${ci.color.name} • ${ci.size}`).join(' | ')
    addToCart({
      productId: `custom-bundle-${comboSize}-${Date.now()}`,
      name: `Build Your Bundle (${comboSize}) – ${summary}`,
      price,
      image: customItems[0]?.color.image || '/images/classicteemale1.jpeg',
      quantity: 1,
    })
    setTimeout(() => setAdding(false), 350)
  }

  // Render
  return mounted ? createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop with subtle blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-11000 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Bottom sheet */}
          <motion.section
            initial={{ y: 300 }}
            animate={{ y: 0 }}
            exit={{ y: 300 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            role="dialog" aria-modal="true" aria-label="Bundle deals"
            className="fixed inset-x-0 bottom-0 z-11001 max-h-[75vh] bg-white rounded-t-[28px] shadow-2xl flex flex-col border border-black/5 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white/90 backdrop-blur supports-backdrop-filter:bg-white/70 border-b border-gray-100 rounded-t-[28px]">
              <div className="px-5 pt-4 pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">Bundle & Save</h3>
                    <p className="text-xs">Save up to {maxDiscount}% with curated picks or build your own</p>
                  </div>
                  <button onClick={onClose} aria-label="Close"
                          className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 active:scale-95">✕</button>
                </div>
                {/* Tabs */}
                <div className="mt-3 inline-flex rounded-full bg-gray-100 p-1" role="tablist" aria-label="Bundle mode">
                  <button
                    role="tab" aria-selected={tab === 'curated'}
                    onClick={() => setTab('curated')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-full transition ${tab === 'curated' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                  >
                    <span className="inline-flex items-center gap-1">Curated</span>
                  </button>
                  <button
                    role="tab" aria-selected={tab === 'custom'}
                    onClick={() => setTab('custom')}
                    className={`ml-2 px-4 py-1.5 text-sm font-medium rounded-full transition ${tab === 'custom' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-800'} ${(!tab || tab === 'curated') && teaseBuild ? 'ring-2 ring-black/40 shadow-[0_0_0_4px_rgba(0,0,0,0.18)]' : ''}`}
                  >
                    <span className="inline-flex items-center gap-1">Build <span aria-hidden>✨</span></span>
                  </button>
                </div>
                {tab === 'curated' && (
                  <div className="mt-2">
                    <button
                      onClick={() => setTab('custom')}
                      className="inline-flex items-center gap-1.5 text-xs bg-black/5 border border-black/10 px-2.5 py-1 rounded-full hover:bg-black/10"
                    >
                      Prefer to mix your own? <span className="font-semibold">Try Build</span> →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Body */}
            <div ref={scrollContainerRef} className="p-5 space-y-4 pb-28 md:px-8 max-w-5xl mx-auto w-full overflow-y-auto bundle-sheet-scroll">
              {tab === 'curated' ? (
                <div className="space-y-4">
                  {bundles.map(b => {
                    const items = (b.itemIds.map(id => productMap.get(id)).filter(Boolean) as Product[])
                    const originalSubtotal = items.reduce((acc, p) => acc + parsePrice(p.price), 0)
                    const effectiveSubtotal = items.reduce((acc, p) => acc + getEffectivePrice(p), 0)
                    const discount = Math.max(0, originalSubtotal - effectiveSubtotal)
                    const total = Math.max(0, effectiveSubtotal)
                    const computedPercent = originalSubtotal > 0 ? Math.round((discount / originalSubtotal) * 100) : 0
                    const isSelected = selectedId === b.id
                    // Also consider other size-bearing categories (jersey, tracksuit, pants, shirt)
                    const hasSizedItems = items.some(p => {
                      const c = (p.category || '').toLowerCase()
                      return ['top', 'tee', 'jersey', 'tracksuit', 'track', 'pants', 'shirt'].some(k => c.includes(k))
                    })
                    return (
                      <label
                        key={b.id}
                        onClick={() => setSelectedId(b.id)}
                        className={`relative block glass-subcard rounded-2xl transition ${isSelected ? 'border-2 border-black bg-white shadow-2xl ring-4 ring-black/5 z-10' : 'border border-transparent hover:border-gray-200 hover:shadow-sm'}`}
                        aria-checked={isSelected}
                        role="radio"
                      >
                        {/* Visible selected badge */}
                        {isSelected && (
                          <span className="absolute top-3 right-3 z-20 inline-flex items-center justify-center w-9 h-9 rounded-full bg-black text-white text-sm font-semibold shadow">✓</span>
                        )}
                        <input type="radio" name="bundle" value={b.id} className="sr-only"
                               checked={isSelected} onChange={() => setSelectedId(b.id)} />
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-base">{b.title}</h4>
                                {b.discountPercent ? (
                                  <span className="glass-badge" data-variant="discount" style={{ fontSize: '10px', padding: '4px 8px' }}>
                                    Save {b.discountPercent}%
                                  </span>
                                ) : null}
                              </div>
                              {b.description && <p className="text-sm mt-0.5">{b.description}</p>}
                              {hasSizedItems && (
                                <div className="mt-2 flex items-center gap-2">
                                  <label className="text-xs text-gray-700">Size</label>
                                  <select
                                    value={selectedSizes[b.id] ?? 'M'}
                                    onChange={(e) => setSelectedSizes(prev => ({ ...prev, [b.id]: e.target.value }))}
                                    className="text-sm border rounded px-2 py-1 bundle-sheet-select"
                                    style={{ fontSize: '16px' }}
                                    aria-label={`Select size for ${b.title}`}
                                  >
                                    {SIZE_OPTIONS.map(sz => (
                                      <option key={sz} value={sz}>{sz}</option>
                                    ))}
                                  </select>
                                  <span className="text-[11px] text-gray-500">(applies to tees in this bundle)</span>
                                </div>
                              )}
                            </div>
                            {isSelected && <span className="text-xs glass-badge" style={{ padding: '2px 8px' }}>Selected</span>}
                          </div>
                          <div className="mt-3 grid grid-cols-3 gap-3">
                            {items.map(p => (
                              <div key={p.id} className="col-span-1">
                                <div className="relative w-full aspect-square overflow-hidden rounded-lg glass-thumb">
                                  <Image src={p.image} alt={p.name} fill sizes="33vw" className="object-cover" />
                                </div>
                                <p className="mt-1 text-[12px] font-medium truncate">{p.name}</p>
                                <p className="text-[12px]"><Price price={p.price} /></p>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 rounded-xl glass-thumb p-3 text-sm">
                            <div className="flex items-center justify-between">
                              <span>Subtotal</span>
                              <span className="font-medium">{formatPrice(originalSubtotal)}</span>
                            </div>
                            {discount > 0 ? (
                              <div className="flex items-center justify-between mt-1">
                                <span>Bundle discount</span>
                                <span>- {formatPrice(discount)}</span>
                              </div>
                            ) : null}
                            <div className="flex items-center justify-between mt-2 text-base font-semibold">
                              <span>Total</span>
                              <span>{formatPrice(total)}</span>
                            </div>
                          </div>
                        </div>
                      </label>
                    )
                  })}
                </div>
              ) : (
                /* Custom build UI (unchanged) */
                <div className="p-5 pb-28 md:px-8 max-w-4xl mx-auto w-full">
                  {/* Top highlight */}
                  <div className="glass-banner-darker rounded-2xl p-4 relative overflow-hidden">
                    <span aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(circle at 25% 20%, rgba(255,255,255,0.18), transparent 60%)' }} />
                    <span aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.22) 50%, transparent 100%)', mixBlendMode: 'screen', animation: 'sheetSheen 5s linear infinite', transform: 'translateX(-60%)' }} />
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-base font-semibold">Build your own bundle</h4>
                        <p className="text-sm mt-0.5">Mix any tees, choose colors and sizes. One simple price.</p>
                      </div>
                      <span className="glass-badge" style={{ fontSize: '10px', padding: '4px 10px' }}>{comboSize} tees</span>
                    </div>
                    {/* Steps */}
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                      <span className="glass-badge" style={{ textTransform: 'none', fontSize: '10px' }}>1. Choose size</span>
                      <span className="glass-badge" style={{ textTransform: 'none', fontSize: '10px' }}>2. Customize tees</span>
                      <span className="glass-badge" style={{ textTransform: 'none', fontSize: '10px' }}>3. Add to cart</span>
                    </div>
                    {/* Progress */}
                    <div className="mt-3">
                      <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                        <div className="h-full" style={{ width: `${Math.round((filledCount / Number(comboSize)) * 100)}%`, background: 'linear-gradient(90deg,#ffffff 0%,#d0d0d0 60%,#b0b0b0 100%)' }} />
                      </div>
                      <p className="mt-1 text-[12px] opacity-70">{filledCount} of {comboSize} tees configured</p>
                    </div>
                  </div>

                  {/* Size options (combo pack selector) */}
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="text-sm font-semibold">Choose bundle size</h5>
                      <span className="text-[11px]">Pick how many tees you want</span>
                    </div>
                    <div className="w-full gap-2 flex md:grid md:grid-cols-4">
                      {CUSTOM_BUNDLE_SIZES.map(sz => {
                        const selected = comboSize === sz
                        return (
                          <button
                            key={sz}
                            onClick={() => {
                              setComboSize(sz)
                              // Smoothly bring the first tee selector into view
                              requestAnimationFrame(() => {
                                scrollIntoViewWithin(teeRefs.current[0] as unknown as HTMLElement, 48)
                              })
                            }}
                            aria-pressed={selected}
                            aria-label={`${sz} tee bundle for ${formatPrice(CUSTOM_BUNDLE_PRICES[sz])}`}
                            className={`group relative rounded-xl border transition shadow-sm active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-black/40 ${selected ? 'bg-black text-white border-black shadow-lg ring-2 ring-black/50' : 'bg-white text-gray-800 border-gray-300 hover:border-black'} flex flex-col items-center justify-center px-3.5 py-2.5 flex-1 basis-0 w-full md:flex-none`}
                          >
                            <span className={`text-lg font-bold tracking-tight leading-none ${selected ? 'text-white' : 'text-gray-900'}`}>{sz}</span>
                            <span className={`mt-0.5 text-[11px] font-medium ${selected ? 'text-white/70' : ''}`}>Tees</span>
                            <span className={`mt-0.5 text-[12px] font-semibold leading-none ${selected ? 'text-white' : 'text-gray-800'}`}>{formatPrice(CUSTOM_BUNDLE_PRICES[sz])}</span>
                            {selected && (
                              <span className="absolute -top-2 right-2 text-[10px] bg-black text-white px-2 py-0.5 rounded-full shadow">Selected</span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Rows */}
                  <div className="mt-4 space-y-3">
                    {customItems.map((ci, idx) => (
                      <div key={idx} className="rounded-2xl glass-subcard p-3">
                        <div className="flex gap-3">
                          <div className="relative w-16 h-20 rounded-lg overflow-hidden glass-thumb shadow-sm">
                            <Image src={ci.color.image} alt={`${ci.tee.name} ${ci.color.name}`} fill sizes="64px" className="object-cover" />
                            <span className="absolute top-1 left-1 text-[10px] px-1.5 py-0.5 rounded-full bg-black/70 text-white">#{idx + 1}</span>
                          </div>
                          <div className="flex-1 grid grid-cols-3 gap-2 min-w-0">
                            <div className="col-span-3">
                              <label className="block text-[11px]">Tee</label>
                              <select
                                value={ci.tee.slug}
                                ref={el => { teeRefs.current[idx] = el }}
                                onChange={e => {
                                  const tee = TEE_VARIANTS.find(t => t.slug === e.target.value as TeeVariant['slug'])!
                                  setCustomItems(prev => prev.map((it, i) => i === idx ? { tee, color: tee.colors[0], size: it.size } : it))
                                }}
                                className="w-full border rounded-md px-2 py-1.5 text-xs"
                              >
                                {TEE_VARIANTS.map(tv => <option key={tv.slug} value={tv.slug}>{tv.name}</option>)}
                              </select>
                            </div>
                            <div className="col-span-2">
                              <label className="block text-[11px]">Color</label>
                              <div className="flex gap-1.5 flex-wrap mt-1" ref={el => { colorRefs.current[idx] = el }}>
                                {ci.tee.colors.map(color => (
                                  <button key={color.name} aria-label={color.name}
                                          onClick={() => {
                                            setCustomItems(prev => prev.map((it, i) => i === idx ? { ...it, color } : it))
                                          }}
                                          className={`w-6 h-6 rounded-full border ${ci.color.name === color.name ? 'ring-2 ring-blue-500 border-black' : 'border-gray-300'}`}
                                          style={{ background: color.hex }}
                                          title={color.name}
                                  />
                                ))}
                              </div>
                              {/* Show selected color name below color options as a pill with swatch */}
                              <div className="mt-2">
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full glass-badge" style={{ textTransform: 'none', fontSize: '10px' }}>
                                  <span
                                    className="w-2.5 h-2.5 rounded-full border border-black/10"
                                    style={{ background: ci.color?.hex || '#999' }}
                                    aria-hidden
                                  />
                                  {ci.color?.name || 'Color Name'}
                                </span>
                              </div>
                            </div>
                            <div>
                              <label className="block text-[11px]">Size</label>
                              <select
                                value={ci.size ?? ''}
                                ref={el => { sizeRefs.current[idx] = el }}
                                onChange={e => {
                                  setCustomItems(prev => prev.map((it, i) => i === idx ? { ...it, size: (e.target.value as typeof SIZE_OPTIONS[number]) || undefined } : it))
                                  // Move to next row's tee selector, or nudge to bottom
                                  requestAnimationFrame(() => {
                                    const next = teeRefs.current[idx + 1]
                                    if (next) scrollIntoViewWithin(next as unknown as HTMLElement, 48)
                                    else {
                                      const container = scrollContainerRef.current
                                      if (container) container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
                                    }
                                  })
                                }}
                                className="mt-1 w-full border rounded-md px-2 py-1.5 text-xs"
                              >
                                <option value="" disabled>Select size</option>
                                {SIZE_OPTIONS.map(sz => (
                                  <option key={sz} value={sz}>{sz}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer CTA */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-5 py-3 rounded-t-2xl">
              {tab === 'curated' ? (
                <div className="flex gap-3">
                  <button onClick={onClose} className="px-4 py-3 rounded-xl border border-gray-300 text-gray-700">Close</button>
                  <button
                    disabled
                    className="flex-1 py-3 rounded-xl bg-gray-300 text-gray-500 font-medium shadow-md cursor-not-allowed"
                  >
                    Add to cart (disabled)
                  </button>
                </div>
              ) : (
                <div className="flex gap-3 items-center">
                  <button onClick={onClose} className="px-4 py-3 rounded-xl border border-gray-300 text-gray-700">Close</button>
                  <button
                    disabled
                    className="flex-1 py-3 rounded-xl bg-gray-300 text-gray-500 font-medium shadow-md cursor-not-allowed"
                  >
                    Add to cart (disabled)
                  </button>
                </div>
              )}
            </div>
          </motion.section>
        </>
      )}
    </AnimatePresence>,
    document.body
  ) : null
}
