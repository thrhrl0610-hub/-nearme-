import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })

export async function POST(req: NextRequest) {
  const { planName, planPrice } = await req.json()

  const priceMap: Record<string, number> = {
    'Starter': 4900,
    'Growth': 19900,
    'Premier': 49900,
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [{
      price_data: {
        currency: 'nzd',
        product_data: { name: `NearMe ${planName} Plan` },
        unit_amount: priceMap[planName] || 4900,
        recurring: { interval: 'month' },
      },
      quantity: 1,
    }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/advertiser?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/advertiser`,
  })

  return NextResponse.json({ url: session.url })
}