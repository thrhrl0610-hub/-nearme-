import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia'
})

export async function POST(req: NextRequest) {
  const { listingId, listingTitle } = await req.json()

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'nzd',
          product_data: {
            name: `Boost listing: ${listingTitle}`,
            description: 'Your listing will appear at the top of the feed for 7 days',
          },
          unit_amount: 999, // NZ$9.99
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/boost-success?listing=${listingId}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/listings/${listingId}`,
  })

  return NextResponse.json({ url: session.url })
}