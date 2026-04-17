import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const track = await prisma.track.findUnique({ where: { id: params.id } })
  if (!track) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(track)
}
