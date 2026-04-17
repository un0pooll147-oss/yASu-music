'use client'

import { usePlayer } from '@/context/PlayerContext'
import { Track } from '@/types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Props {
  track: Track
  purchased: boolean
  isLoggedIn: boolean
}

export default function TrackPageClient({ track, purchased, isLoggedIn }: Props) {
  const { playTrack, currentTrack, isPlaying } = usePlayer()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const isActive = currentTrack?.id === track.id

  async function handlePurchase() {
    if (!isLoggedIn) {
      router.push('/auth/login?redirect=' + encodeURIComponent(`/track/${track.id}`))
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId: track.id }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        const demoRes = await fetch('/api/purchase/demo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trackId: track.id }),
        })
        if (demoRes.ok) {
          router.push('/checkout/success')
          router.refresh()
        } else {
          const demoData = await demoRes.json()
          alert(demoData.error ?? 'エラーが発生しました')
        }
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleDownload() {
    const res = await fetch(`/api/download/${track.id}`)
    if (!res.ok) {
      alert('ダウンロードに失敗しました')
      return
    }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${track.title}.mp3`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <button
        onClick={() => playTrack(track)}
        className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-blue-200 text-blue-600 hover:border-blue-400 rounded-2xl font-medium transition-colors"
      >
        {isActive && isPlaying ? (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
            停止
          </>
        ) : (
          <>
            <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7L8 5z" />
            </svg>
            試聴する (30秒)
          </>
        )}
      </button>

      {purchased ? (
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-medium transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          ダウンロード
        </button>
      ) : (
        <button
          onClick={handlePurchase}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-2xl font-medium transition-colors"
        >
          {loading ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              ¥{track.price.toLocaleString()} で購入
            </>
          )}
        </button>
      )}
    </div>
  )
}
