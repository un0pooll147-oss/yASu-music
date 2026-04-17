'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePlayer } from '@/context/PlayerContext'
import { Track } from '@/types'

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatPrice(yen: number) {
  return `¥${yen.toLocaleString()}`
}

interface Props {
  track: Track
  purchased?: boolean
}

export default function TrackCard({ track, purchased = false }: Props) {
  const { playTrack, currentTrack, isPlaying } = usePlayer()
  const isActive = currentTrack?.id === track.id
  const tags: string[] = JSON.parse(track.tags || '[]')

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
      <div className="relative aspect-square bg-gray-100">
        <Image
          src={track.coverUrl}
          alt={track.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={() => playTrack(track)}
            className="w-14 h-14 rounded-full bg-white/90 hover:bg-white text-blue-600 flex items-center justify-center shadow-lg transition-transform hover:scale-110"
          >
            {isActive && isPlaying ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7L8 5z" />
              </svg>
            )}
          </button>
        </div>
        {isActive && (
          <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
            ♪ 再生中
          </div>
        )}
        {purchased && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
            購入済み
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <Link href={`/track/${track.id}`}>
              <h3 className="font-semibold text-gray-900 truncate hover:text-blue-600 transition-colors">
                {track.title}
              </h3>
            </Link>
            <p className="text-sm text-gray-500">{track.artist}</p>
          </div>
          <span className="text-base font-bold text-blue-600 flex-shrink-0">
            {formatPrice(track.price)}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{track.genre}</span>
          {track.bpm && <span>{track.bpm} BPM</span>}
          <span>{formatDuration(track.duration)}</span>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => playTrack(track)}
            className="flex-1 text-sm text-center py-2 border border-gray-200 rounded-full hover:border-blue-300 hover:text-blue-600 transition-colors"
          >
            {isActive && isPlaying ? '⏸ 停止' : '▶ 試聴'}
          </button>
          <Link
            href={`/track/${track.id}`}
            className="flex-1 text-sm text-center py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
          >
            {purchased ? '↓ DL' : '購入'}
          </Link>
        </div>
      </div>
    </div>
  )
}
