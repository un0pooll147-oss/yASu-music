'use client'

interface Props {
  trackId: string
  trackTitle: string
}

export default function DownloadButton({ trackId, trackTitle }: Props) {
  async function handleDownload() {
    const res = await fetch(`/api/download/${trackId}`)
    if (!res.ok) {
      alert('ダウンロードに失敗しました')
      return
    }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${trackTitle}.mp3`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={handleDownload}
      className="flex-shrink-0 flex items-center gap-1.5 text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full transition-colors"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      DL
    </button>
  )
}
