import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import TrackPageClient from './TrackPageClient'
import { Track } from '@/types'

export default async function TrackPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  const track = await prisma.track.findUnique({ where: { id: params.id } })
  if (!track) notFound()

  const purchased = session?.user?.id
    ? !!(await prisma.purchase.findUnique({
        where: { userId_trackId: { userId: session.user.id, trackId: track.id } },
      }))
    : false

  const related = await prisma.track.findMany({
    where: { genre: track.genre, NOT: { id: track.id } },
    take: 4,
  })

  const tags: string[] = JSON.parse(track.tags || '[]')

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        楽曲一覧に戻る
      </Link>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="md:flex">
          <div className="relative w-full md:w-72 aspect-square flex-shrink-0">
            <Image
              src={track.coverUrl}
              alt={track.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="flex-1 p-6 md:p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full">{track.genre}</span>
                {track.mood && (
                  <span className="ml-2 text-xs bg-purple-50 text-purple-600 px-3 py-1 rounded-full">{track.mood}</span>
                )}
              </div>
              <span className="text-2xl font-bold text-blue-600">¥{track.price.toLocaleString()}</span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-1">{track.title}</h1>
            <p className="text-gray-500 mb-4">{track.artist}</p>

            <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
              {track.bpm && (
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-1">BPM</p>
                  <p className="font-semibold text-gray-900">{track.bpm}</p>
                </div>
              )}
              <div className="text-center">
                <p className="text-xs text-gray-400 mb-1">時間</p>
                <p className="font-semibold text-gray-900">
                  {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                </p>
              </div>
              {track.musicKey && (
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-1">キー</p>
                  <p className="font-semibold text-gray-900">{track.musicKey}</p>
                </div>
              )}
            </div>

            {track.description && (
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">{track.description}</p>
            )}

            <div className="flex flex-wrap gap-1.5 mb-6">
              {tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/?q=${tag}`}
                  className="text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>

            <TrackPageClient
              track={track as Track}
              purchased={purchased}
              isLoggedIn={!!session}
            />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">同ジャンルの楽曲</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((t) => (
              <Link key={t.id} href={`/track/${t.id}`} className="group">
                <div className="relative aspect-square rounded-xl overflow-hidden mb-2">
                  <Image src={t.coverUrl} alt={t.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                </div>
                <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600">{t.title}</p>
                <p className="text-xs text-gray-500">¥{t.price.toLocaleString()}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
