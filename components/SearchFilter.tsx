'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const GENRES = ['すべて', 'アンビエント', 'エレクトロニカ', 'ピアノ', 'ジャズ', 'ポップ', 'ロック', 'オーケストラ', 'Lo-Fi', 'アコースティック', 'シンセポップ', 'ビジネスBGM', 'ネイチャー']
const MOODS = ['すべて', 'Calm', 'Energetic', 'Happy', 'Melancholic', 'Epic', 'Chill', 'Nostalgic', 'Romantic', 'Motivational', 'Peaceful', 'Futuristic', 'Warm']
const SORT_OPTIONS = [
  { value: 'newest', label: '新着順' },
  { value: 'price_asc', label: '価格が低い順' },
  { value: 'price_desc', label: '価格が高い順' },
  { value: 'bpm_asc', label: 'BPM低い順' },
  { value: 'bpm_desc', label: 'BPM高い順' },
]

export default function SearchFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')

  const currentGenre = searchParams.get('genre') ?? 'すべて'
  const currentMood = searchParams.get('mood') ?? 'すべて'
  const currentSort = searchParams.get('sort') ?? 'newest'

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'すべて') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/?${params.toString()}`)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (query.trim()) {
      params.set('q', query.trim())
    } else {
      params.delete('q')
    }
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="曲名・タグ・ムードで検索..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-full transition-colors"
        >
          検索
        </button>
      </form>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 font-medium">ジャンル:</label>
          <div className="flex gap-1 flex-wrap">
            {GENRES.map((g) => (
              <button
                key={g}
                onClick={() => updateParam('genre', g)}
                className={`text-xs px-3 py-1 rounded-full transition-colors ${
                  currentGenre === g || (g === 'すべて' && !searchParams.get('genre'))
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 font-medium">ムード:</label>
          <div className="flex gap-1 flex-wrap">
            {MOODS.map((m) => (
              <button
                key={m}
                onClick={() => updateParam('mood', m)}
                className={`text-xs px-3 py-1 rounded-full transition-colors ${
                  currentMood === m || (m === 'すべて' && !searchParams.get('mood'))
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <label className="text-xs text-gray-500 font-medium">並び替え:</label>
          <select
            value={currentSort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="text-xs border border-gray-200 rounded-full px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
