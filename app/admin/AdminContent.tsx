'use client'

import { useState } from 'react'
import { Track } from '@/types'
import TrackUploadForm from './TrackUploadForm'

function formatDuration(sec: number) {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`
}

export default function AdminContent({ initialTracks }: { initialTracks: Track[] }) {
  const [tracks, setTracks] = useState<Track[]>(initialTracks)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function refreshTracks() {
    const res = await fetch('/api/tracks')
    if (res.ok) {
      const data = await res.json()
      setTracks(data)
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`「${title}」を削除しますか？購入済みのユーザーへの影響にご注意ください。`)) return
    setDeleting(id)
    await fetch(`/api/admin/track?id=${id}`, { method: 'DELETE' })
    setTracks(t => t.filter(tr => tr.id !== id))
    setDeleting(null)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">管理画面</h1>
        <span className="text-sm text-gray-500">{tracks.length}曲登録済み</span>
      </div>

      <TrackUploadForm onTrackAdded={refreshTracks} />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">登録済み楽曲</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {tracks.length === 0 && (
            <p className="text-center py-10 text-gray-400 text-sm">楽曲がありません</p>
          )}
          {tracks.map(track => (
            <div key={track.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50">
              <img src={track.coverUrl} alt={track.title}
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{track.title}</p>
                <p className="text-sm text-gray-500">{track.genre} · {track.bpm ? `${track.bpm}BPM · ` : ''}{formatDuration(track.duration)}</p>
              </div>
              <span className="text-sm font-semibold text-gray-900 flex-shrink-0">¥{track.price.toLocaleString()}</span>
              <button
                onClick={() => handleDelete(track.id, track.title)}
                disabled={deleting === track.id}
                className="text-red-400 hover:text-red-600 text-sm px-3 py-1 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 flex-shrink-0"
              >
                削除
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
