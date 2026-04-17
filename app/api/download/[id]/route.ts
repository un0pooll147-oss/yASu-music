import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { readFileSync, existsSync } from 'fs'
import path from 'path'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
  }

  const purchase = await prisma.purchase.findUnique({
    where: { userId_trackId: { userId: session.user.id, trackId: params.id } },
    include: { track: true },
  })

  if (!purchase) {
    return NextResponse.json({ error: '購入履歴が見つかりません' }, { status: 403 })
  }

  const filePath = path.join(process.cwd(), 'public', purchase.track.fullUrl)

  if (!existsSync(filePath)) {
    return NextResponse.json(
      { error: '音声ファイルが見つかりません。/public/audio/ フォルダに音楽ファイルを追加してください。' },
      { status: 404 }
    )
  }

  const fileBuffer = readFileSync(filePath)
  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(purchase.track.title)}.mp3"`,
      'Content-Length': fileBuffer.length.toString(),
    },
  })
}
