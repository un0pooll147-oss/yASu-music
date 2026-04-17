'use client'

import Image from 'next/image'
import { usePlayer } from '@/context/PlayerContext'

function formatTime(seconds: number) {
  if (isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function AudioPlayer() {
  const { currentTrack, isPlaying, progress, duration, volume, togglePlay, seek, setVolume, closePlayer } = usePlayer()

  if (!currentTrack) return null

  const percent = duration > 0 ? (progress / duration) * 100 : 0

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl">
      <div
        className="h-1 bg-gray-200 cursor-pointer"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          seek(((e.clientX - rect.left) / rect.width) * 100)
        }}
      >
        <div
          className="h-full bg-blue-500 transition-none"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex items-center gap-4 px-4 py-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{currentTrack.title}</p>
            <p className="text-xs text-gray-500 truncate">{currentTrack.artist}</p>
          </div>
          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full flex-shrink-0">
            試聴中
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400 w-10 text-right tabular-nums">
            {formatTime(progress)}
          </span>

          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors flex-shrink-0"
          >
            {isPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7L8 5z" />
              </svg>
            )}
          </button>

          <span className="text-xs text-gray-400 w-10 tabular-nums">
            {formatTime(duration)}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-1 justify-end">
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
          </svg>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round(volume * 100)}
            onChange={(e) => setVolume(Number(e.target.value) / 100)}
            className="w-20 accent-blue-500"
          />

          <button
            onClick={closePlayer}
            className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors ml-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
