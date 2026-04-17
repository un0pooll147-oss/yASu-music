import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import DownloadButton from './DownloadButton'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/login?redirect=/dashboard')

  const purchases = await prisma.purchase.findMany({
    where: { userId: session.user.id },
    include: { track: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">購入済み楽曲</h1>
        <p className="text-gray-500 text-sm mt-1">{purchases.length}件の楽曲を購入済み</p>
      </div>

      {purchases.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-200" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </svg>
          <p className="text-gray-500 mb-4">まだ楽曲を購入していません</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full text-sm font-medium transition-colors"
          >
            楽曲を探す
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {purchases.map((purchase) => (
            <div
              key={purchase.id}
              className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4"
            >
              <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                <Image
                  src={purchase.track.coverUrl}
                  alt={purchase.track.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <Link href={`/track/${purchase.track.id}`}>
                  <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors truncate">
                    {purchase.track.title}
                  </h3>
                </Link>
                <p className="text-sm text-gray-500">{purchase.track.artist}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {purchase.track.genre}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(purchase.createdAt).toLocaleDateString('ja-JP')}購入
                  </span>
                  <span className="text-xs text-gray-400">
                    ¥{purchase.amount.toLocaleString()}
                  </span>
                </div>
              </div>

              <DownloadButton trackId={purchase.track.id} trackTitle={purchase.track.title} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
