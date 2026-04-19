import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function isAdmin(email: string) {
  const adminEmail = process.env.ADMIN_EMAIL
  return adminEmail ? email === adminEmail : false
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: '管理者権限が必要です' }, { status: 401 })
  }

  const body = await req.json()
  const { title, artist, genre, bpm, duration, price, coverUrl, previewUrl, fullUrl, description, tags, mood, musicKey } = body

  if (!title || !artist || !genre || !duration || !price || !coverUrl || !previewUrl || !fullUrl) {
    return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 })
  }

  const track = await prisma.track.create({
    data: {
      title,
      artist,
      genre,
      bpm: bpm ? parseInt(bpm) : null,
      duration: parseInt(duration),
      price: parseInt(price),
      coverUrl,
      previewUrl,
      fullUrl,
      description: description || null,
      tags: JSON.stringify(tags || []),
      mood: mood || null,
      musicKey: musicKey || null,
    },
  })

  return NextResponse.json({ track })
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: '管理者権限が必要です' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'IDが必要です' }, { status: 400 })

  await prisma.track.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
