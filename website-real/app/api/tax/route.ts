import { NextRequest, NextResponse } from 'next/server';
import { calculateTaxEstimate } from '@/lib/services/tax';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { postalCode, state, subtotal, country = 'US' } = body;

        if (!postalCode || !state || typeof subtotal !== 'number') {
            return NextResponse.json(
                { error: 'Missing required fields: postalCode, state, subtotal' },
                { status: 400 }
            );
        }

        const estimate = await calculateTaxEstimate(postalCode, state, subtotal, country);

        return NextResponse.json(estimate);
    } catch (error) {
        console.error('Tax API Error:', error);
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
