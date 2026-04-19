import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminContent from './AdminContent'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  const adminEmail = process.env.ADMIN_EMAIL
  if (!session?.user?.email || !adminEmail || session.user.email !== adminEmail) {
    redirect('/')
  }

  const tracks = await prisma.track.findMany({ orderBy: { createdAt: 'desc' } })

  return <AdminContent initialTracks={tracks} />
}
