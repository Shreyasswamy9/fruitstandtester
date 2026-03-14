"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/components/CartContext"
import { useStripeCheckout, type CheckoutItem } from "@/hooks/useCheckout"
import { supabase } from "@/app/supabase-client"
import ProductPageBrandHeader from "@/components/ProductPageBrandHeader"
import type { User } from "@supabase/supabase-js"

export default function CheckoutRedirectPage() {
  const router = useRouter()
  const { items } = useCart()
  const { createCheckoutSession, loading } = useStripeCheckout()
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  // Check auth state
  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data } = await supabase.auth.getUser()
      if (!mounted) return
      setUser(data.user ?? null)
    })()

    return () => {
      mounted = false
    }
  }, [])

  // Redirect to checkout on mount
  useEffect(() => {
    if (isProcessing || loading) return
    if (items.length === 0) {
      router.push('/cart')
      return
    }

    const handleCheckout = async () => {
      try {
        setIsProcessing(true)
        setError(null)

        // Calculate shipping
        const subtotal = items.reduce((total, item) => total + (Number(item.price) * item.quantity), 0)
        const shipping = subtotal >= 120 ? 0 : 8.99
        const tax = 0 // Tax calculated at checkout
        const total = subtotal + shipping + tax

        // Prepare normalized items
        const normalizedItems: CheckoutItem[] = items.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: Number(item.price ?? 0),
          quantity: item.quantity,
          image: item.image,
          size: item.size,
          color: item.color,
        }))

        // Create checkout session (works for both logged-in and guest users)
        const result = await createCheckoutSession({
          items: normalizedItems,
          shipping,
          tax,
        })

        if (result.url) {
          // Redirect to Stripe Checkout
          window.location.href = result.url
        } else {
          setError('Failed to create checkout session. Please try again.')
          setIsProcessing(false)
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to start checkout.'
        setError(message)
        setIsProcessing(false)
      }
    }

    handleCheckout()
  }, [items, createCheckoutSession, loading, isProcessing, router])

  return (
    <div className="min-h-screen bg-[#fbf6f0]">
      <ProductPageBrandHeader />
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          {error ? (
            <div className="space-y-4">
              <div className="text-lg font-semibold text-red-600">Unable to process checkout</div>
              <p className="text-sm text-gray-600">{error}</p>
              <button
                onClick={() => router.push('/cart')}
                className="mt-4 px-6 py-2 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
              >
                Return to Cart
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black"></div>
              </div>
              <p className="text-gray-600">Redirecting to checkout...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
