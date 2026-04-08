import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.user_id
    const plan = session.metadata?.plan
    const radius = parseInt(session.metadata?.radius_km || '10')

    if (userId) {
      const paidUntil = new Date()
      paidUntil.setMonth(paidUntil.getMonth() + 1)

      await supabase.from('ads').update({
        plan,
        radius_km: radius,
        paid_until: paidUntil.toISOString(),
        is_active: false,
        status: 'pending',
      }).eq('user_id', userId)
    }
  }

  return NextResponse.json({ received: true })
}