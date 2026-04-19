'use client'

import { useState, useRef } from 'react'
import { upload } from '@vercel/blob/client'

const GENRES = ['アンビエント', 'エレクトロニカ', 'ジャズ', 'クラシック', 'ポップ', 'ロック', 'ヒップホップ', 'ボサノバ', 'フォーク', 'その他']
const MOODS = ['Calm', 'Energetic', 'Happy', 'Sad', 'Romantic', 'Mysterious', 'Epic', 'Playful']

interface UploadProgress {
  previewFile: number
  fullFile: number
  coverFile: number
}

export default function TrackUploadForm({ onTrackAdded }: { onTrackAdded: () => void }) {
  const [form, setForm] = useState({
    title: '', artist: 'yASu', genre: 'アンビエント', bpm: '', duration: '',
    price: '550', coverUrl: '', description: '', tagsInput: '', mood: '', musicKey: '',
  })
  const [previewFile, setPreviewFile] = useState<File | null>(null)
  const [fullFile, setFullFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [progress, setProgress] = useState<UploadProgress>({ previewFile: 0, fullFile: 0, coverFile: 0 })
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleAudioLoad(e: React.ChangeEvent<HTMLInputElement>, field: 'preview' | 'full') {
    const file = e.target.files?.[0]
    if (!file) return
    if (field === 'preview') setPreviewFile(file)
    else setFullFile(file)

    // Auto-detect duration from full audio
    if (field === 'full') {
      const url = URL.createObjectURL(file)
      const audio = new Audio(url)
      audio.onloadedmetadata = () => {
        setForm(f => ({ ...f, duration: Math.round(audio.duration).toString() }))
        URL.revokeObjectURL(url)
      }
    }
  }

  async function uploadFile(file: File, path: string, key: keyof UploadProgress): Promise<string> {
    const blob = await upload(path, file, {
      access: 'public',
      handleUploadUrl: '/api/admin/upload',
      onUploadProgress: ({ percentage }) => {
        setProgress(p => ({ ...p, [key]: percentage }))
      },
    })
    return blob.url
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!previewFile || !fullFile) {
      setMessage({ type: 'error', text: 'プレビュー音源とフル音源は必須です' })
      return
    }

    setUploading(true)
    setMessage(null)

    try {
      const timestamp = Date.now()
      const slug = form.title.replace(/\s+/g, '-').toLowerCase()

      const [previewUrl, fullUrl, coverUrl] = await Promise.all([
        uploadFile(previewFile, `audio/preview-${slug}-${timestamp}.mp3`, 'previewFile'),
        uploadFile(fullFile, `audio/full-${slug}-${timestamp}.mp3`, 'fullFile'),
        coverFile
          ? uploadFile(coverFile, `covers/${slug}-${timestamp}.jpg`, 'coverFile')
          : Promise.resolve(form.coverUrl || `https://picsum.photos/seed/${timestamp}/400/400`),
      ])

      const tags = form.tagsInput.split(/[,、]/).map(t => t.trim()).filter(Boolean)

      const res = await fetch('/api/admin/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, previewUrl, fullUrl, coverUrl, tags }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }

      setMessage({ type: 'success', text: `「${form.title}」を登録しました！` })
      setForm({ title: '', artist: 'yASu', genre: 'アンビエント', bpm: '', duration: '', price: '550', coverUrl: '', description: '', tagsInput: '', mood: '', musicKey: '' })
      setPreviewFile(null)
      setFullFile(null)
      setCoverFile(null)
      setProgress({ previewFile: 0, fullFile: 0, coverFile: 0 })
      onTrackAdded()
    } catch (err) {
      setMessage({ type: 'error', text: (err as Error).message })
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
      <h2 className="text-lg font-bold text-gray-900">新しい楽曲を登録</h2>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">楽曲タイトル *</label>
          <input name="title" value={form.title} onChange={handleChange} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">アーティスト名 *</label>
          <input name="artist" value={form.artist} onChange={handleChange} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ジャンル *</label>
          <select name="genre" value={form.genre} onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {GENRES.map(g => <option key={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ムード</label>
          <select name="mood" value={form.mood} onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">未設定</option>
            {MOODS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">BPM</label>
          <input name="bpm" type="number" value={form.bpm} onChange={handleChange} placeholder="例: 120"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">再生時間（秒）*</label>
          <input name="duration" type="number" value={form.duration} onChange={handleChange} required placeholder="フル音源アップで自動入力"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">価格（円・税込）*</label>
          <select name="price" value={form.price} onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {[330, 440, 550, 660, 770, 880, 1100, 1320, 1650].map(p => (
              <option key={p} value={p}>¥{p.toLocaleString()}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">キー</label>
          <input name="musicKey" value={form.musicKey} onChange={handleChange} placeholder="例: C major"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">タグ（カンマ区切り）</label>
        <input name="tagsInput" value={form.tagsInput} onChange={handleChange} placeholder="例: リラックス, BGM, 瞑想"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
        <textarea name="description" value={form.description} onChange={handleChange} rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {/* File uploads */}
      <div className="space-y-4 border-t pt-4">
        <FileUploadField
          label="プレビュー音源（30秒程度のMP3）*"
          accept="audio/*"
          file={previewFile}
          progress={progress.previewFile}
          uploading={uploading}
          onChange={e => handleAudioLoad(e, 'preview')}
        />
        <FileUploadField
          label="フル音源（MP3/WAV）*"
          accept="audio/*"
          file={fullFile}
          progress={progress.fullFile}
          uploading={uploading}
          onChange={e => handleAudioLoad(e, 'full')}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ジャケット画像（省略時は自動生成）
          </label>
          <div className="flex gap-2 items-center">
            <input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files?.[0] || null)}
              className="flex-1 text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            {!coverFile && (
              <input name="coverUrl" value={form.coverUrl} onChange={handleChange} placeholder="または画像URLを入力"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            )}
          </div>
          {uploading && progress.coverFile > 0 && (
            <ProgressBar value={progress.coverFile} />
          )}
        </div>
      </div>

      <button type="submit" disabled={uploading}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        {uploading ? 'アップロード中...' : '楽曲を登録する'}
      </button>
    </form>
  )
}

function FileUploadField({ label, accept, file, progress, uploading, onChange }: {
  label: string
  accept: string
  file: File | null
  progress: number
  uploading: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type="file" accept={accept} onChange={onChange}
        className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
      {file && <p className="text-xs text-gray-500 mt-1">{file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)</p>}
      {uploading && progress > 0 && <ProgressBar value={progress} />}
    </div>
  )
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="mt-1.5 bg-gray-100 rounded-full h-1.5">
      <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${value}%` }} />
    </div>
  )
}
