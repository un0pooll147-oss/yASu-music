import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

  await prisma.purchase.upsert({
    where: { userId_trackId: { userId: session.user.id, trackId } },
    update: {},
    create: {
      userId: session.user.id,
      trackId,
      amount: track.price,
    },
  })

  return NextResponse.json({ success: true })
}
