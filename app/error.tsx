'use client'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">エラーが発生しました</h2>
        <p className="text-gray-500 mb-6">{error.message}</p>
        <button
          onClick={reset}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          再試行
        </button>
      </div>
    </div>
  )
}
