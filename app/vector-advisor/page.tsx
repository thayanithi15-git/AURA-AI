'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Settings, Sparkles, ChevronDown, Globe, Check } from 'lucide-react'
import VectorAvatar from '../../components/VectorAvatar'
import Customizer, { CustomizerSettings } from '../../components/Customizer'
import VectorAdvisoryPanel from '../../components/VectorAdvisoryPanel'

export default function VectorAdvisorPage() {
  const [customizerOpen, setCustomizerOpen] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [headAnimation, setHeadAnimation] = useState<'idle' | 'nod' | 'shake'>('idle')
  const [subtitle, setSubtitle] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [langDropdownOpen, setLangDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const [settings, setSettings] = useState<CustomizerSettings>({
    skinColor: '#e5b88c',
    hairColor: '#000000',
    hairStyle: 'combed',
    eyeColor: '#5c4033',
    voicePitch: 1.0,
    voiceRate: 1.0,
    voiceName: '',
    gender: 'male',
    language: 'en',
    avatarSource: 'vector',
    didVideoUrl: '',
    aiProvider: 'gemini',
  })

  // Load API key from localStorage or .env on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('gemini_api_key')
      if (stored) {
        setApiKey(stored)
      } else if (process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        setApiKey(process.env.NEXT_PUBLIC_GEMINI_API_KEY)
      }
    }
  }, [])

  const saveApiKey = (key: string) => {
    setApiKey(key)
    if (typeof window !== 'undefined') {
      localStorage.setItem('gemini_api_key', key)
    }
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col relative overflow-hidden font-sans">
      {/* Dynamic background grid effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />

      {/* Main Header */}
      <header className="w-full px-6 py-4 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="AURA Logo" className="w-12 mb-2 h-12 rounded-lg object-contain shadow-sm border border-slate-100" />
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-lg tracking-wider text-slate-800">
                AURA
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded border border-primary-200">
                Core v1.2
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Digital Wealth Management Advisory</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Quick Stats (Desktop) */}
          <div className="hidden md:flex items-center gap-4 text-xs font-semibold px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-slate-400 font-medium">Portfolio:</span>
              <span className="text-slate-800">$84,320</span>
            </div>
            <div className="w-px h-3 bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Status:</span>
              <span className="text-emerald-600 font-medium">Balanced Growth</span>
            </div>
          </div>

          {/* Shadcn-Style Language Select Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex h-9 w-[190px] items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none transition-all active:scale-[0.98]"
            >
              <span className="truncate">
                {settings.language === 'en' && 'English (US/UK)'}
                {settings.language === 'hi' && 'Hindi (हिंदी)'}
                {settings.language === 'ta' && 'Tamil (தமிழ்)'}
                {settings.language === 'te' && 'Telugu (తెలుగు)'}
                {settings.language === 'kn' && 'Kannada (ಕನ್ನಡ)'}
              </span>
              <ChevronDown className={`h-4 w-4 opacity-50 transition-transform duration-200 ${langDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {langDropdownOpen && (
              /* Shadcn Select Content Dropdown */
              <div className="absolute right-0 mt-1 w-[190px] rounded-lg border border-slate-200 bg-white p-1 text-slate-950 shadow-md ring-1 ring-black/5 animate-in fade-in-80 slide-in-from-top-1 duration-100 origin-top-right z-40">
                {[
                  { code: 'en', label: 'English (US/UK)' },
                  { code: 'hi', label: 'Hindi (हिंदी)' },
                  { code: 'ta', label: 'Tamil (தமிழ்)' },
                  { code: 'te', label: 'Telugu (తెలుగు)' },
                  { code: 'kn', label: 'Kannada (ಕನ್ನಡ)' }
                ].map((lang) => {
                  const active = settings.language === lang.code
                  return (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setSettings({ ...settings, language: lang.code as any })
                        setLangDropdownOpen(false)
                      }}
                      className={`relative flex w-full cursor-pointer select-none items-center rounded-md py-1.5 pl-8 pr-2 text-sm font-semibold outline-none transition-colors ${
                        active 
                          ? 'bg-slate-100 text-slate-900' 
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      {active && (
                        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                          <Check className="h-3.5 w-3.5 text-slate-900" />
                        </span>
                      )}
                      <span>{lang.label}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <button
            onClick={() => setCustomizerOpen(true)}
            suppressHydrationWarning={true}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-sm font-semibold rounded-xl transition-all shadow-sm text-slate-700 active:scale-95"
          >
            <Settings className="w-4 h-4 text-primary-500" />
            <span>Customize Face</span>
          </button>
        </div>
      </header>

      {/* Main Section */}
      <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 z-10 overflow-hidden lg:h-[calc(100vh-160px)] lg:max-h-[660px]">
        
        {/* Left Column: Fullscreen AI Avatar display */}
        <div className="lg:col-span-5 flex flex-col justify-between items-center bg-white border border-slate-200 rounded-3xl p-6 min-h-[450px] lg:h-full group shadow-lg">
          {/* Top Row: Scientific HUD info & Secure Link */}
          <div className="w-full flex justify-between items-center mb-4">
            <div className="text-[10px] text-slate-400 font-mono space-y-1">
              <div>SYS.LOC: DIGITAL_CORE</div>
              <div>STATUS: {isSpeaking ? "ACTIVE_TRANSMITTING" : "MONITORING_INPUT"}</div>
              <div>HOLOGRAPHIC_AVATAR: ONLINE</div>
            </div>
            
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-lg text-[9px] font-bold text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>SECURE LINK</span>
            </div>
          </div>

          {/* AI Avatar Face */}
          <div className="w-full max-w-[340px] aspect-square flex items-center justify-center relative mb-4">
            <VectorAvatar
              isSpeaking={isSpeaking}
              gender={settings.gender}
              skinColor={settings.skinColor}
              hairColor={settings.hairColor}
              hairStyle={settings.hairStyle}
              eyeColor={settings.eyeColor}
              speechText={subtitle}
              speechRate={settings.voiceRate}
            />
          </div>

          {/* Bottom Area: Stack Subtitles and Stats static / responsive */}
          <div className="w-full space-y-4">
            {/* Captions / Subtitles bar */}
            <div className="w-full min-h-[4rem] flex items-center justify-center text-center px-4 py-2.5 bg-slate-50/90 border border-slate-200 rounded-2xl backdrop-blur-md shadow-sm">
              {subtitle ? (
                <p className="text-sm font-semibold text-slate-800 tracking-wide leading-relaxed animate-pulse">
                  "{subtitle}"
                </p>
              ) : (
                <p className="text-xs text-slate-400 italic font-mono uppercase tracking-widest">
                  AURA System Ready &amp; Idle
                </p>
              )}
            </div>

            {/* Interactive stats overlay */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50/70 border border-slate-200/60 rounded-2xl text-center backdrop-blur-md">
                <span className="text-[10px] text-slate-400 block mb-0.5">Customization</span>
                <span className="text-xs font-bold text-slate-700 capitalize">{settings.hairStyle} / Theme</span>
              </div>
              <div className="p-3 bg-slate-50/70 border border-slate-200/60 rounded-2xl text-center backdrop-blur-md">
                <span className="text-[10px] text-slate-400 block mb-0.5">Interface</span>
                <span className="text-xs font-bold text-slate-700">Vector SVG Core</span>
              </div>
              <div className="p-3 bg-slate-50/70 border border-slate-200/60 rounded-2xl text-center backdrop-blur-md">
                <span className="text-[10px] text-slate-400 block mb-0.5">Voice Synth</span>
                <span className="text-xs font-bold text-slate-700">{settings.voiceRate}x rate</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Advisory Chat Interface */}
        <div className="lg:col-span-7 h-[500px] lg:h-full flex flex-col overflow-hidden">
          <VectorAdvisoryPanel
            onSpeakingStateChange={setIsSpeaking}
            voicePitch={settings.voicePitch}
            voiceRate={settings.voiceRate}
            voiceName={settings.voiceName}
            apiKey={apiKey}
            setApiKey={saveApiKey}
            onHeadAnimationChange={setHeadAnimation}
            onSubtitleChange={setSubtitle}
            gender={settings.gender}
            language={settings.language}
            aiProvider={settings.aiProvider}
          />
        </div>
      </div>

      {/* Slide-out customizer */}
      <Customizer
        settings={settings}
        onChange={setSettings}
        isOpen={customizerOpen}
        onClose={() => setCustomizerOpen(false)}
      />

      {/* Decorative cyber borders */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-600 via-indigo-500 to-emerald-500 opacity-60 z-30" />
    </main>
  )
}
