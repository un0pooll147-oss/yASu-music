import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')
  const genre = searchParams.get('genre')
  const mood = searchParams.get('mood')
  const sort = searchParams.get('sort') ?? 'newest'

  const where: Record<string, unknown> = {}
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { artist: { contains: q } },
      { tags: { contains: q } },
    ]
  }
  if (genre) where.genre = genre
  if (mood) where.mood = mood

  let orderBy: Record<string, string> = { createdAt: 'desc' }
  if (sort === 'price_asc') orderBy = { price: 'asc' }
  if (sort === 'price_desc') orderBy = { price: 'desc' }
  if (sort === 'bpm_asc') orderBy = { bpm: 'asc' }
  if (sort === 'bpm_desc') orderBy = { bpm: 'desc' }

  const tracks = await prisma.track.findMany({ where, orderBy })
  return NextResponse.json(tracks)
}
