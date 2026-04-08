import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  const { planName } = await req.json()

  const planMap: Record<string, { amount: number, radius: number, plan: string }> = {
    'Starter':      { amount: 4900,  radius: 5,  plan: 'Starter' },
    'Growth':       { amount: 19900, radius: 20, plan: 'Growth' },
    'Premier':      { amount: 49900, radius: 50, plan: 'Premier' },
    'Premier Plus': { amount: 99900, radius: 999, plan: 'PremierPlus' },
  }

  const planInfo = planMap[planName] || planMap['Starter']

  // 현재 유저 가져오기 (Authorization 헤더에서)
  const authHeader = req.headers.get('authorization')
  let userId = null
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)
    userId = user?.id || null
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [{
      price_data: {
        currency: 'nzd',
        product_data: { name: `NearMe ${planName} Plan` },
        unit_amount: planInfo.amount,
        recurring: { interval: 'month' },
      },
      quantity: 1,
    }],
    metadata: {
      user_id: userId || '',
      plan: planInfo.plan,
      radius_km: String(planInfo.radius),
    },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/advertiser?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/advertiser`,
  })

  return NextResponse.json({ url: session.url })
}