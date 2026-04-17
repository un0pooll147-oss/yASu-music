import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
  }

  const { trackId } = await req.json()
  if (!trackId) {
    return NextResponse.json({ error: '楽曲IDが必要です' }, { status: 400 })
  }

  const track = await prisma.track.findUnique({ where: { id: trackId } })
  if (!track) {
    return NextResponse.json({ error: '楽曲が見つかりません' }, { status: 404 })
  }

  const existing = await prisma.purchase.findUnique({
    where: { userId_trackId: { userId: session.user.id, trackId } },
  })
  if (existing) {
    return NextResponse.json({ error: 'すでに購入済みです' }, { status: 400 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  try {
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: track.title,
              description: `${track.artist} - ${track.genre}`,
              images: [track.coverUrl],
            },
            unit_amount: track.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/track/${trackId}`,
      metadata: {
        userId: session.user.id,
        trackId,
      },
    })

    return NextResponse.json({ url: stripeSession.url })
  } catch {
    return NextResponse.json(
      { error: 'Stripe checkout の作成に失敗しました。Stripeの設定を確認してください。' },
      { status: 500 }
    )
  }
}
