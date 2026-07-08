'use client'

import React, { useEffect, useRef, useState } from 'react'
import { User, Loader2 } from 'lucide-react'

export interface AvatarProps {
  isSpeaking: boolean
  gender?: 'male' | 'female'
  avatarSource?: 'vector' | 'did'
  didVideoUrl?: string
  onSpeakingStateChange?: (speaking: boolean) => void
  onDidStreamCreated?: (streamId: string, sessionId: string) => void
  onTalkEnded?: () => void
  onPlayStarted?: () => void
}

export default function Avatar({
  isSpeaking = false,
  gender = 'male',
  avatarSource = 'did', // default to did
  didVideoUrl = '',
  onSpeakingStateChange,
  onDidStreamCreated,
  onTalkEnded,
  onPlayStarted,
}: AvatarProps) {
  const [agentData, setAgentData] = useState<any>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    // Fetch D-ID agent details from backend (idle video, thumbnail)
    fetch('/api/copy-avatar')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAgentData(data)
        }
      })
      .catch(err => console.error('Error loading D-ID agent properties:', err))
  }, [])

  useEffect(() => {
    if (videoRef.current && didVideoUrl) {
      videoRef.current.load()
      videoRef.current.play().catch((err) => console.log("Video playback error:", err))
    }
  }, [didVideoUrl])

  const fallbackThumbnail = "https://agents-results.d-id.com/google-oauth2|116538317102796705472/v2_agt_nQgFx1OV/thumbnail.png"
  const thumbnailUrl = agentData?.presenter?.thumbnail || agentData?.thumbnail || agentData?.preview_thumbnail || fallbackThumbnail
  const idleVideoUrl = agentData?.presenter?.idle_video || agentData?.idle_video

  const isMale = gender === 'male'
  const showTalkVideo = !!didVideoUrl

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-inner p-1">
      <div className="w-full h-full relative rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center">
        {showTalkVideo ? (
          // Render the speaking/talking video generated from Gemini response
          <video
            ref={videoRef}
            src={didVideoUrl}
            poster={thumbnailUrl}
            crossOrigin="anonymous"
            autoPlay
            playsInline
            className="w-full h-full object-cover rounded-2xl"
            onPlay={() => {
              if (onSpeakingStateChange) onSpeakingStateChange(true)
              if (onPlayStarted) onPlayStarted()
            }}
            onEnded={() => {
              if (onSpeakingStateChange) onSpeakingStateChange(false)
              if (onTalkEnded) onTalkEnded()
            }}
          />
        ) : (
          // Render the looping D-ID Agent idle video or static thumbnail fallback
          (() => {
            if (idleVideoUrl) {
              return (
                <video 
                  src={idleVideoUrl} 
                  poster={thumbnailUrl}
                  crossOrigin="anonymous"
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="w-full h-full object-cover rounded-2xl"
                />
              )
            } else {
              return (
                <img 
                  src={thumbnailUrl} 
                  alt={agentData?.preview_name || "D-ID Agent"}
                  className="w-full h-full object-cover rounded-2xl"
                />
              )
            }
          })()
        )}
      </div>
    </div>
  )
}
