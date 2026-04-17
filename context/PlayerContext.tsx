'use client'

import React, { createContext, useContext, useState, useRef, useCallback } from 'react'
import { Track } from '@/types'

interface PlayerState {
  currentTrack: Track | null
  isPlaying: boolean
  progress: number
  duration: number
  volume: number
}

interface PlayerContextType extends PlayerState {
  playTrack: (track: Track) => void
  togglePlay: () => void
  seek: (percent: number) => void
  setVolume: (vol: number) => void
  closePlayer: () => void
}

const PlayerContext = createContext<PlayerContextType | null>(null)

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(0.8)

  const playTrack = useCallback((track: Track) => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.volume = volume

      audioRef.current.addEventListener('timeupdate', () => {
        if (audioRef.current) {
          setProgress(audioRef.current.currentTime)
          setDuration(audioRef.current.duration || 0)
        }
      })
      audioRef.current.addEventListener('loadedmetadata', () => {
        if (audioRef.current) setDuration(audioRef.current.duration)
      })
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false)
        setProgress(0)
      })
    }

    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play().catch(() => {})
        setIsPlaying(true)
      }
      return
    }

    audioRef.current.src = track.previewUrl
    audioRef.current.load()
    setCurrentTrack(track)
    setProgress(0)
    audioRef.current.play().catch(() => {})
    setIsPlaying(true)
  }, [currentTrack, isPlaying, volume])

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentTrack) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().catch(() => {})
      setIsPlaying(true)
    }
  }, [isPlaying, currentTrack])

  const seek = useCallback((percent: number) => {
    if (!audioRef.current || !duration) return
    audioRef.current.currentTime = (percent / 100) * duration
  }, [duration])

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol)
    if (audioRef.current) audioRef.current.volume = vol
  }, [])

  const closePlayer = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
    }
    setCurrentTrack(null)
    setIsPlaying(false)
    setProgress(0)
  }, [])

  return (
    <PlayerContext.Provider value={{
      currentTrack, isPlaying, progress, duration, volume,
      playTrack, togglePlay, seek, setVolume, closePlayer,
    }}>
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider')
  return ctx
}
