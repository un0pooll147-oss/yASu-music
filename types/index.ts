export interface Track {
  id: string
  title: string
  artist: string
  genre: string
  bpm: number | null
  duration: number
  price: number
  coverUrl: string
  previewUrl: string
  fullUrl: string
  description: string | null
  tags: string
  mood: string | null
  musicKey: string | null
  createdAt: Date
  purchased?: boolean
}

export interface Purchase {
  id: string
  userId: string
  trackId: string
  amount: number
  createdAt: Date
  track: Track
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}
