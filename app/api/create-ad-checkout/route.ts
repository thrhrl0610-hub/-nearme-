import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })

export async function POST(req: NextRequest) {
  const { planName, adData } = await req.json()

  const planConfig: Record<string, { price: number, radius: number }> = {
    'Starter':  { price: 4900,  radius: 5  },
    'Standard': { price: 9900,  radius: 10 },
    'Growth':   { price: 19900, radius: 20 },
    'Premier':  { price: 49900, radius: 50 },
  }

  const plan = planConfig[planName] || planConfig['Starter']

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [{
      price_data: {
        currency: 'nzd',
        product_data: { name: `nearme ${planName} Plan` },
        unit_amount: plan.price,
        recurring: { interval: 'month' },
      },
      quantity: 1,
    }],
    subscription_data: {
      trial_period_days: 30,
      metadata: {
        planName,
        radius: plan.radius.toString(),
        adData: JSON.stringify(adData),
      },
    },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/advertiser?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/advertiser`,
  })

  return NextResponse.json({ url: session.url })
}