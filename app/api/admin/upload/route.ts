import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

function isAdmin(email: string) {
  const adminEmail = process.env.ADMIN_EMAIL
  return adminEmail ? email === adminEmail : false
}

export async function POST(request: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: '管理者権限が必要です' }, { status: 401 })
  }

  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'image/jpeg', 'image/png', 'image/webp'],
        maximumSizeInBytes: 100 * 1024 * 1024,
      }),
      onUploadCompleted: async () => {},
    })
    return NextResponse.json(jsonResponse)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}
