import type { Metadata } from 'next'
import './globals.css'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import SessionProvider from '@/components/SessionProvider'
import Header from '@/components/Header'
import AudioPlayer from '@/components/AudioPlayer'
import { PlayerProvider } from '@/context/PlayerContext'

export const metadata: Metadata = {
  title: 'yASu Music - 自作音楽マーケットプレイス',
  description: '高品質な自作音楽をダウンロード販売。BGM・SE・ジングルなど動画・配信で使える楽曲が揃う音楽マーケットプレイス。',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="ja">
      <body>
        <SessionProvider session={session}>
          <PlayerProvider>
            <Header />
            <main className="min-h-screen pb-24">
              {children}
            </main>
            <AudioPlayer />
          </PlayerProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
