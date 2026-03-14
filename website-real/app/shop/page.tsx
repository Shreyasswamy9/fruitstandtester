"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import ProductsGrid from "../../components/ProductsGridHome"
import BundleSheet from "../../components/BundleSheet"
import ProductPageBrandHeader from "../../components/ProductPageBrandHeader"
import { ChevronDown } from "lucide-react"
import { useTrackCategoryView } from "@/hooks/useTrackCategoryView"

const SORT_OPTIONS = [
  { label: 'All Products', value: null },
  { label: 'Tees', value: 'Tops' },
  { label: 'Tracksuits', value: 'Tracksuits' },
  { label: 'Jerseys', value: 'Jerseys' },
  { label: 'Hats', value: 'Hats' },
  { label: 'Relics', value: 'Extras' },
]

export default function ShopPage() {
  const searchParams = useSearchParams()
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [stPatsOnly, setStPatsOnly] = useState(() => searchParams.get('stpats') === '1')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const [bundleSheetConfig, setBundleSheetConfig] = useState<{
    open: boolean;
    tab: 'curated' | 'custom';
    selectedId: string | null;
  }>({ open: false, tab: 'curated', selectedId: null })

  const openBundleSheet = (options?: { tab?: 'curated' | 'custom'; selectedId?: string | null }) => {
    setBundleSheetConfig({
      open: true,
      tab: options?.tab ?? 'curated',
      selectedId: options?.selectedId ?? null,
    })
  }

  const closeBundleSheet = () => {
    setBundleSheetConfig(prev => ({ ...prev, open: false }))
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedLabel = SORT_OPTIONS.find(opt => opt.value === activeCategory)?.label || 'All Products'

  // Track category/collection view
  useTrackCategoryView({
    categoryName: selectedLabel,
  })

  return (
    <>
      <ProductPageBrandHeader />
      <div className="min-h-screen" style={{ background: '#fbf6f0', textTransform: 'uppercase' }}>
        {/* Sort Menu */}
        <div
          className="shop-sort-nav pb-6 px-4 sm:px-6 lg:px-8"
          style={{
            position: 'relative',
            paddingTop: '120px',
            zIndex: 60
          }}
        >
          <div className="max-w-7xl mx-auto flex justify-start">
            <motion.div
              ref={menuRef}
              className="relative"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Menu Button - Minimal Text Based */}
              <motion.button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="group flex items-center gap-2 px-0 py-2 text-base sm:text-lg font-medium text-gray-800 hover:text-black transition-colors duration-300 relative"
                whileTap={{ scale: 0.98 }}
              >
                <span className="tracking-wide">{selectedLabel}</span>
                <motion.div
                  animate={{ rotate: isMenuOpen ? 180 : 0, y: isMenuOpen ? 2 : 0 }}
                  transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown size={22} className="text-gray-700 group-hover:text-black transition-colors" />
                </motion.div>
                {/* Underline accent */}
                <motion.div
                  animate={{ scaleX: isMenuOpen ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute bottom-0 left-0 right-0 h-px bg-black origin-left"
                />
              </motion.button>

              {/* Dropdown Menu - Minimal & Elegant */}
              <AnimatePresence>
                {isMenuOpen && (
                  <>
                    {/* Backdrop to prevent grid interaction */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-40"
                      onClick={() => setIsMenuOpen(false)}
                    />
                    {/* Menu Dropdown */}
                    <motion.div
                      initial={{ opacity: 0, y: -15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.25, type: 'spring', stiffness: 150 }}
                      className="absolute top-full left-0 mt-4 space-y-0.5 pt-2 z-50 bg-[#fbf6f0] rounded-lg shadow-lg p-4 min-w-max"
                    >
                    {SORT_OPTIONS.map((option, index) => {
                      const isSelected = activeCategory === option.value
                      return (
                        <motion.button
                          key={option.value || 'all'}
                          initial={{ opacity: 0, x: -15 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -15 }}
                          transition={{ duration: 0.15, delay: index * 0.04 }}
                          onClick={() => {
                            setActiveCategory(option.value)
                            if (option.value === null) setStPatsOnly(false)
                            setIsMenuOpen(false)
                          }}
                          className={`block text-left px-3 py-2.5 text-base sm:text-lg tracking-wide font-medium transition-all duration-200 relative group whitespace-nowrap ${
                            isSelected
                              ? 'text-black'
                              : 'text-gray-600 hover:text-black'
                          }`}
                        >
                          <span className="relative">
                            {option.label}
                            {/* Animated underline on hover and when selected */}
                            <motion.div
                              animate={{
                                scaleX: isSelected ? 1 : 0,
                                opacity: isSelected ? 1 : 0
                              }}
                              transition={{ duration: 0.3 }}
                              className="absolute bottom-0 left-0 right-0 h-px bg-black origin-left group-hover:scale-x-100"
                            />
                          </span>
                        </motion.button>
                      )
                    })}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>

      {/* Products Grid */}
      <motion.div
        key={activeCategory || 'all'}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="pb-16"
        style={{ position: 'relative', zIndex: 1 }}
      >
        <ProductsGrid
          categoryFilter={activeCategory}
          showBackgroundVideo={false}
          collapseVariantsByName={false}
          stPatsOnly={stPatsOnly}
          onStPatsToggle={() => setStPatsOnly(prev => !prev)}
          onRequestBundleSheet={(options) => openBundleSheet({
            tab: options?.initialTab ?? 'custom',
            selectedId: options?.selectedId ?? null,
          })}
        />
      </motion.div>

      {/* Bundle Sheet */}
      <BundleSheet
        open={bundleSheetConfig.open}
        onClose={closeBundleSheet}
        initialTab={bundleSheetConfig.tab}
        initialSelectedId={bundleSheetConfig.selectedId}
      />
    </div>
    </>
  )
}
