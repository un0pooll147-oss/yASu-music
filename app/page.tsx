import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import TrackCard from '@/components/TrackCard'
import SearchFilter from '@/components/SearchFilter'
import { Track } from '@/types'
import { Suspense } from 'react'

interface SearchParams {
  q?: string
  genre?: string
  mood?: string
  sort?: string
}

async function getTracks(params: SearchParams) {
  const where: Record<string, unknown> = {}

  if (params.q) {
    where.OR = [
      { title: { contains: params.q } },
      { artist: { contains: params.q } },
      { tags: { contains: params.q } },
      { mood: { contains: params.q } },
    ]
  }
  if (params.genre) where.genre = params.genre
  if (params.mood) where.mood = params.mood

  let orderBy: Record<string, string> = { createdAt: 'desc' }
  if (params.sort === 'price_asc') orderBy = { price: 'asc' }
  if (params.sort === 'price_desc') orderBy = { price: 'desc' }
  if (params.sort === 'bpm_asc') orderBy = { bpm: 'asc' }
  if (params.sort === 'bpm_desc') orderBy = { bpm: 'desc' }

  return prisma.track.findMany({ where, orderBy })
}

async function getPurchasedIds(userId: string) {
  const purchases = await prisma.purchase.findMany({
    where: { userId },
    select: { trackId: true },
  })
  return new Set(purchases.map((p) => p.trackId))
}

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const session = await getServerSession(authOptions)
  const tracks = await getTracks(searchParams)
  const purchasedIds = session?.user?.id
    ? await getPurchasedIds(session.user.id)
    : new Set<string>()

  const stats = {
    total: await prisma.track.count(),
    genres: Array.from(new Set(tracks.map((t) => t.genre))).length,
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <section className="relative bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-8 md:p-12 mb-10 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 bg-white rounded-full"
              style={{
                left: `${i * 5.2}%`,
                bottom: 0,
                height: `${30 + Math.sin(i * 0.8) * 20 + Math.cos(i * 1.2) * 15}%`,
              }}
            />
          ))}
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            自作音楽を世界に届けよう
          </h1>
          <p className="text-blue-100 text-lg mb-6 max-w-xl">
            高品質なBGM・SE・楽曲を動画制作・配信に。
            試聴してから購入できる安心の音楽マーケットプレイス。
          </p>
          <div className="flex gap-6 text-sm">
            <div>
              <span className="text-2xl font-bold">{stats.total}</span>
              <span className="text-blue-200 ml-1">楽曲</span>
            </div>
            <div>
              <span className="text-2xl font-bold">{stats.genres}</span>
              <span className="text-blue-200 ml-1">ジャンル</span>
            </div>
            <div>
              <span className="text-2xl font-bold">¥440〜</span>
              <span className="text-blue-200 ml-1">から</span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl p-5 mb-8 shadow-sm border border-gray-100">
        <Suspense>
          <SearchFilter />
        </Suspense>
      </section>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {searchParams.q || searchParams.genre || searchParams.mood
            ? `検索結果: ${tracks.length}件`
            : `楽曲一覧 (${tracks.length}件)`}
        </h2>
      </div>

      {tracks.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          <p>楽曲が見つかりませんでした</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tracks.map((track) => (
            <TrackCard
              key={track.id}
              track={track as Track}
              purchased={purchasedIds.has(track.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
