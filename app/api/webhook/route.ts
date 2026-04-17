import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const sig = headers().get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { userId, trackId } = session.metadata ?? {}

    if (userId && trackId) {
      const track = await prisma.track.findUnique({ where: { id: trackId } })
      if (track) {
        await prisma.purchase.upsert({
          where: { userId_trackId: { userId, trackId } },
          update: {},
          create: {
            userId,
            trackId,
            stripeSessionId: session.id,
            stripePaymentId: session.payment_intent as string,
            amount: track.price,
          },
        })
      }
    }
  }

  return NextResponse.json({ received: true })
}
