import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { TICKETS_TABLE, TICKET_MESSAGES_TABLE } from '@/lib/tickets/config'

export async function POST(request: NextRequest, { params }: { params: Promise<{ ticketId: string }> }) {
  try {
    const { ticketId } = await params
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
    }
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { message } = await request.json()

    if (!message || !message.trim()) {
      return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 })
    }

    // Auth required
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 })
    }
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Resolve ticket ownership
    const { data: ticket, error: ticketError } = await supabase
      .from(TICKETS_TABLE)
      .select('id, user_id, user_email')
      .eq('ticket_id', ticketId)
      .single()

    if (ticketError || !ticket) {
      return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 })
    }

    const owns = (ticket.user_id && ticket.user_id === user.id) || (ticket.user_email && ticket.user_email.toLowerCase() === user.email?.toLowerCase())
    if (!owns) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    // Insert message
    const { data: inserted, error: insertError } = await supabase
      .from(TICKET_MESSAGES_TABLE)
      .insert([{
        ticket_id: ticket.id,
        sender_type: 'user',
        message: message.trim(),
        attachments: [],
        is_internal: false,
      }])
      .select('id, message, sender_type, created_at')
      .single()

    if (insertError || !inserted) {
      return NextResponse.json({ success: false, error: 'Failed to add message' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: {
      id: inserted.id,
      message: inserted.message,
      sender: inserted.sender_type === 'admin' ? 'support' : 'user',
      timestamp: inserted.created_at,
      ticketId,
    } })
  } catch (error) {
    console.error('Error adding message to ticket:', error)
    return NextResponse.json({ success: false, error: 'Failed to add message' }, { status: 500 })
  }
}