import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string }
}) {
  const session = await getServerSession(authOptions)

  const purchase = searchParams.session_id && session?.user?.id
    ? await prisma.purchase.findFirst({
        where: {
          stripeSessionId: searchParams.session_id,
          userId: session.user.id,
        },
        include: { track: true },
      })
    : null

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">購入完了！</h1>
        <p className="text-gray-500 mb-6">
          {purchase
            ? `「${purchase.track.title}」のご購入ありがとうございます。`
            : 'ご購入ありがとうございます。'}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-colors"
          >
            購入済み楽曲を見る
          </Link>
          <Link
            href="/"
            className="px-6 py-3 border border-gray-200 text-gray-600 hover:border-gray-300 rounded-full font-medium transition-colors"
          >
            楽曲一覧に戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
