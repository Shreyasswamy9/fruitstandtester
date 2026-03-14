import { subscribeToNewsletter } from '@/lib/email/newsletter'
import { createClient } from '@supabase/supabase-js'

let supabaseAdmin: ReturnType<typeof createClient<any>> | null = null

type NewsletterSignupType = 'email' | 'phone'

function getSupabaseAdmin() {
  if (supabaseAdmin) {
    return supabaseAdmin
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('Missing Supabase configuration for newsletter signups')
  }

  supabaseAdmin = createClient<any>(url, serviceKey)
  return supabaseAdmin
}

async function findSubscriberIdByContact(
  supabase: ReturnType<typeof createClient<any>>,
  email?: string,
  phone?: string
) {
  if (email) {
    const { data } = await supabase
      .from('newsletter_subscribers')
      .select('id')
      .ilike('email', email)
      .maybeSingle()

    if (data?.id) {
      return data.id as string
    }
  }

  if (phone) {
    const { data } = await supabase
      .from('newsletter_subscribers')
      .select('id')
      .eq('phone', phone)
      .maybeSingle()

    if (data?.id) {
      return data.id as string
    }
  }

  return null
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, phone, signupType } = body
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : undefined
    const normalizedPhone = typeof phone === 'string' ? phone.trim() : undefined
    const normalizedSignupType: NewsletterSignupType =
      signupType === 'phone' || (!signupType && normalizedPhone && !normalizedEmail)
        ? 'phone'
        : 'email'
    const source = typeof body.source === 'string' && body.source.trim()
      ? body.source.trim()
      : 'site'

    // Validate input
    if (!normalizedEmail && !normalizedPhone) {
      return Response.json(
        { error: 'Email or phone number is required' },
        { status: 400 }
      )
    }

    // Always persist lead in Supabase first (fallback source of truth)
    const supabase = getSupabaseAdmin()
    let subscriberId: string | null = null

    const { data: insertedRow, error: insertError } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email: normalizedEmail || null,
        phone: normalizedPhone || null,
        signup_type: normalizedSignupType,
        source,
        mailchimp_status: 'pending',
      })
      .select('id')
      .single()

    if (!insertError && insertedRow?.id) {
      subscriberId = insertedRow.id as string
    }

    if (insertError && insertError.code !== '23505') {
      console.error('Newsletter Supabase insert error:', insertError)
      return Response.json(
        { error: 'Failed to save newsletter signup' },
        { status: 500 }
      )
    }

    if (insertError?.code === '23505') {
      subscriberId = await findSubscriberIdByContact(supabase, normalizedEmail, normalizedPhone)

      if (subscriberId) {
        await supabase
          .from('newsletter_subscribers')
          .update({
            email: normalizedEmail || null,
            phone: normalizedPhone || null,
            signup_type: normalizedSignupType,
            source,
            mailchimp_status: 'pending',
          })
          .eq('id', subscriberId)
      }
    }

    // Mailchimp sync should not block successful lead capture
    const result = await subscribeToNewsletter(normalizedEmail, normalizedPhone, normalizedSignupType)

    if (subscriberId) {
      await supabase
        .from('newsletter_subscribers')
        .update({ mailchimp_status: result.success ? 'subscribed' : 'failed' })
        .eq('id', subscriberId)
    }

    if (!result.success) {
      console.error('Mailchimp sync failed after Supabase save:', result.error)
      return Response.json(
        { success: true, message: 'Saved to newsletter list. External sync pending.' },
        { status: 200 }
      )
    }

    return Response.json(
      { success: true, message: result.message },
      { status: 200 }
    )
  } catch (error) {
    console.error('Newsletter API error:', error)
    return Response.json(
      { error: 'Failed to process newsletter signup' },
      { status: 500 }
    )
  }
}
