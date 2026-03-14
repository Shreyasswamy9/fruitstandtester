

import { createClient } from '@supabase/supabase-js'

type EmailEventType = 'order_confirmation' | 'order_shipped' | 'order_delivered' | 'order_cancelled'

let supabaseAdmin: ReturnType<typeof createClient<any>> | null = null

/**
 * Get or create Supabase admin client
 */
function getSupabaseAdmin() {
  if (supabaseAdmin) {
    return supabaseAdmin
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('Missing Supabase configuration for email events')
  }

  supabaseAdmin = createClient<any>(url, serviceKey)
  return supabaseAdmin
}

/**
 * Check if an email event has already been recorded for this order
 * 
 * @param orderId - The order ID (string or number)
 * @param type - The type of email event
 * @returns true if the event exists, false otherwise
 */
export async function hasEmailEvent(
  orderId: string | number,
  type: EmailEventType
): Promise<boolean> {
  try {
    const client = getSupabaseAdmin()

    const { data, error } = await client
      .from('email_events')
      .select('id')
      .eq('order_id', orderId)
      .eq('type', type)
      .maybeSingle()

    if (error) {
      console.error('Error checking email event:', error)
      // On error, return false to allow retry (fail open)
      return false
    }

    return data !== null
  } catch (error) {
    console.error('Exception checking email event:', error)
    return false
  }
}

/**
 * Record an email event for an order to prevent duplicate sends
 * 
 * @param orderId - The order ID (string or number)
 * @param type - The type of email event
 * @returns true if recorded successfully, false otherwise
 */
export async function recordEmailEvent(
  orderId: string | number,
  type: EmailEventType
): Promise<boolean> {
  try {
    const client = getSupabaseAdmin()

    const { error } = await client
      .from('email_events')
      .insert({
        order_id: orderId,
        type,
        created_at: new Date().toISOString(),
        // Assumes email_events schema uses created_at (not sent_at)
      })

    if (error) {
      // Check if it's a unique constraint violation (duplicate)
      if (error.code === '23505') {
        console.log(`Email event already exists: ${type} for order ${orderId}`)
        return true // Already recorded, so technically successful
      }
      
      console.error('Error recording email event:', error)
      return false
    }

    console.log(`Recorded email event: ${type} for order ${orderId}`)
    return true
  } catch (error) {
    console.error('Exception recording email event:', error)
    return false
  }
}
