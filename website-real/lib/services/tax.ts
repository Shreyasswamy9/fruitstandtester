import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export interface TaxEstimateResult {
  taxAmount: number;
  total: number;
  currency: string;
}

/**
 * Calculates a tax estimate using Stripe Tax API.
 * Note: This requires Stripe Tax to be activated in the dashboard.
 */
export async function calculateTaxEstimate(
  postalCode: string,
  state: string,
  subtotal: number,
  country: string = 'US',
  currency: string = 'usd'
): Promise<TaxEstimateResult> {
  try {
    const amountInCents = Math.round(subtotal * 100);

    // Create a tax calculation
    const calculation = await stripe.tax.calculations.create({
      currency,
      line_items: [
        {
          amount: amountInCents,
          reference: 'cart_subtotal',
          tax_code: 'txcd_99999999', // General tangible goods, adjust if needed
        },
      ],
      customer_details: {
        address: {
          postal_code: postalCode,
          state: state,
          country: country,
        },
        address_source: 'shipping',
      },
      expand: ['line_items'],
    });

    const taxAmount = (calculation.tax_amount_exclusive || 0) / 100;
    const total = (calculation.amount_total || amountInCents) / 100;

    return {
      taxAmount,
      total,
      currency: calculation.currency,
    };
  } catch (error) {
    console.error('Stripe Tax Calculation Error:', error);
    
    // Fallback or specific error handling
    if (error instanceof Error) {
      if (error.message.includes('not enabled')) {
        throw new Error('Stripe Tax is not enabled for this account.');
      }
    }
    
    throw new Error('Failed to calculate tax estimate.');
  }
}
