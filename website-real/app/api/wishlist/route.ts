import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAdmin =
    supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null

// Helper to get authenticated user
async function getUser(request: NextRequest) {
    if (!supabaseAdmin) return null
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return null
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseAdmin.auth.getUser(token)
    return user
}

export async function GET(request: NextRequest) {
    try {
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Feature disabled in survey project' }, { status: 503 })
        }

        const user = await getUser(request)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data, error } = await supabaseAdmin
            .from('wishlists')
            .select('*, product:products(*)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) throw error
        return NextResponse.json({ data })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Feature disabled in survey project' }, { status: 503 })
        }

        const user = await getUser(request)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { productId } = await request.json() as { productId?: string }
        if (!productId) {
            return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
        }

        // Check if already exists
        const { data: existing } = await supabaseAdmin
            .from('wishlists')
            .select('id')
            .eq('user_id', user.id)
            .eq('product_id', productId)
            .single()

        if (existing) {
            return NextResponse.json({ message: 'Already in wishlist', data: existing })
        }

        const { data, error } = await supabaseAdmin
            .from('wishlists')
            .insert({ user_id: user.id, product_id: productId })
            .select()
            .single()

        if (error) throw error
        return NextResponse.json({ data })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Feature disabled in survey project' }, { status: 503 })
        }

        const user = await getUser(request)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const productId = searchParams.get('productId')

        if (!productId) {
            return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
        }

        const { error } = await supabaseAdmin
            .from('wishlists')
            .delete()
            .eq('user_id', user.id)
            .eq('product_id', productId)

        if (error) throw error
        return NextResponse.json({ success: true })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
