'use client'

import React from 'react'
import { Settings, Sliders, Palette, Volume2, X, User } from 'lucide-react'

export type AIProvider = 'gemini' | 'groq' | 'both'

export interface CustomizerSettings {
  skinColor: string
  hairColor: string
  hairStyle: string
  eyeColor: string
  voicePitch: number
  voiceRate: number
  voiceName: string
  gender: 'male' | 'female'
  language: 'en' | 'hi' | 'ta' | 'kn' | 'te'
  avatarSource: 'vector' | 'did'
  didVideoUrl: string
  aiProvider: AIProvider
}

interface CustomizerProps {
  settings: CustomizerSettings
  onChange: (settings: CustomizerSettings) => void
  isOpen: boolean
  onClose: () => void
}

const PRESET_SKINS = [
  { name: 'Warm Peach', value: '#f5c6a5' },
  { name: 'Fair Ivory', value: '#fde0cc' },
  { name: 'Golden Tan', value: '#d89673' },
  { name: 'Warm Amber', value: '#b57954' },
  { name: 'Deep Bronze', value: '#8d5531' },
  { name: 'Espresso', value: '#583622' },
]

const PRESET_HAIRS = [
  { name: 'Black', value: '#000000' },
  { name: 'Charcoal Black', value: '#1a110a' },
  { name: 'Dirty Blonde', value: '#bfa37a' },
  { name: 'Auburn Red', value: '#8c4227' },
  { name: 'Silver Gray', value: '#8e9094' },
  { name: 'Chestnut', value: '#60402b' },
]

const PRESET_EYES = [
  { name: 'Sky Blue', value: '#4b70dd' },
  { name: 'Emerald Green', value: '#2e7d32' },
  { name: 'Dark Hazel', value: '#6d4c41' },
  { name: 'Warm Amber', value: '#ffb300' },
  { name: 'Ocean Cyan', value: '#00acc1' },
]

const HAIR_STYLES = ['spiky', 'long', 'curly', 'bob', 'bald']


export default function Customizer({
  settings,
  onChange,
  isOpen,
  onClose,
}: CustomizerProps) {
  const [voices, setVoices] = React.useState<SpeechSynthesisVoice[]>([])

  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const loadVoices = () => {
        setVoices(window.speechSynthesis.getVoices())
      }
      loadVoices()
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [])

  const updateSetting = (key: keyof CustomizerSettings, value: any) => {
    onChange({ ...settings, [key]: value })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 z-50 shadow-2xl flex flex-col transition-all duration-300 animate-in slide-in-from-right font-sans">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary-600 animate-spin-slow" />
          <h2 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">Avatar Customizer</h2>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Options Scrollable Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Avatar Engine Mode */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-600 text-xs font-semibold uppercase tracking-wider">
            <Sliders className="w-4 h-4 text-primary-500" />
            <span>Avatar Engine Mode</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => updateSetting('avatarSource', 'vector')}
              className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all duration-200 ${
                settings.avatarSource === 'vector'
                  ? 'bg-primary-50 border-primary-500 text-primary-700 shadow-sm'
                  : 'bg-slate-50/50 border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              Interactive SVG Face
            </button>
            <button
              onClick={() => updateSetting('avatarSource', 'did')}
              className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all duration-200 ${
                settings.avatarSource === 'did'
                  ? 'bg-primary-50 border-primary-500 text-primary-700 shadow-sm'
                  : 'bg-slate-50/50 border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              D-ID AI Avatar
            </button>
          </div>
        </div>

        {settings.avatarSource === 'did' ? (
          /* D-ID Avatar Config Panel */
          <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 text-slate-600 text-xs font-semibold uppercase tracking-wider">
              <User className="w-4 h-4 text-primary-500" />
              <span>D-ID Avatar Configuration</span>
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-slate-600 leading-relaxed">
                AURA is synced with D-ID's video generation engine. When you send messages, AURA will automatically speak and generate realistic talking video animations.
              </p>
              {settings.didVideoUrl && (
                <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-[10px] text-emerald-700 font-mono break-all">
                  Active Video: {settings.didVideoUrl.substring(0, 50)}...
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Interactive Vector Face Settings */
          <>
            {/* Character Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                <Sliders className="w-4 h-4 text-primary-500" />
                <span>Character Gender</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateSetting('gender', 'male')}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all duration-200 ${
                    settings.gender === 'male'
                      ? 'bg-primary-50 border-primary-500 text-primary-700 shadow-sm'
                      : 'bg-slate-50/50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  Male Advisor
                </button>
                <button
                  onClick={() => updateSetting('gender', 'female')}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all duration-200 ${
                    settings.gender === 'female'
                      ? 'bg-primary-50 border-primary-500 text-primary-700 shadow-sm'
                      : 'bg-slate-50/50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  Female Advisor
                </button>
              </div>
            </div>

            {/* AI Provider Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                <Sliders className="w-4 h-4 text-primary-500" />
                <span>AI Response Provider</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { value: 'gemini', label: 'Gemini Only' },
                  { value: 'groq', label: 'Groq Only' },
                  { value: 'both', label: 'Gemini + Groq' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateSetting('aiProvider', option.value)}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all duration-200 ${
                      settings.aiProvider === option.value
                        ? 'bg-primary-50 border-primary-500 text-primary-700 shadow-sm'
                        : 'bg-slate-50/50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Style Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                <Sliders className="w-4 h-4 text-primary-500" />
                <span>HUD Hologram Mode</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {HAIR_STYLES.map((style) => {
                  let label = style
                  if (style === 'spiky') label = 'Pulse'
                  if (style === 'long') label = 'Radar'
                  if (style === 'curly') label = 'Matrix'
                  if (style === 'bob') label = 'Quantum'
                  if (style === 'bald') label = 'Minimal'
                  return (
                    <button
                      key={style}
                      onClick={() => updateSetting('hairStyle', style)}
                      className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all duration-200 capitalize ${
                        settings.hairStyle === style
                          ? 'bg-primary-50 border-primary-500 text-primary-700 shadow-sm'
                          : 'bg-slate-50/50 border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800'
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Skin Tone/Chassis Color */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                <Palette className="w-4 h-4 text-primary-500" />
                <span>Secondary Ring Glow</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_SKINS.map((skin) => (
                  <button
                    key={skin.value}
                    onClick={() => updateSetting('skinColor', skin.value)}
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all duration-200 ${
                      settings.skinColor === skin.value
                        ? 'bg-primary-50 border-primary-500 text-slate-900 shadow-sm'
                        : 'bg-slate-50/50 border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <span 
                      className="w-5 h-5 rounded-full border border-black/10"
                      style={{ backgroundColor: skin.value }}
                    />
                    <span className="text-[10px] font-semibold">{skin.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Hair Color */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                <Palette className="w-4 h-4 text-primary-500" />
                <span>HUD Accent Laser Color</span>
              </div>
              {settings.hairStyle === 'bald' ? (
                <p className="text-xs text-slate-400 italic">Select a HUD mode to modify lasers.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_HAIRS.map((hair) => (
                    <button
                      key={hair.value}
                      onClick={() => updateSetting('hairColor', hair.value)}
                      className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all duration-200 ${
                        settings.hairColor === hair.value
                          ? 'bg-primary-50 border-primary-500 text-slate-900 shadow-sm'
                          : 'bg-slate-50/50 border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      <span 
                        className="w-5 h-5 rounded-full border border-black/10"
                        style={{ backgroundColor: hair.value }}
                      />
                      <span className="text-[10px] font-semibold">{hair.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Eye/Sensors Color */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                <Palette className="w-4 h-4 text-primary-500" />
                <span>AI Sensor Eye Color</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_EYES.map((eye) => (
                  <button
                    key={eye.value}
                    onClick={() => updateSetting('eyeColor', eye.value)}
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all duration-200 ${
                      settings.eyeColor === eye.value
                        ? 'bg-primary-50 border-primary-500 text-slate-900 shadow-sm'
                        : 'bg-slate-50/50 border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <span 
                      className="w-5 h-5 rounded-full border border-black/10"
                      style={{ backgroundColor: eye.value }}
                    />
                    <span className="text-[10px] font-semibold">{eye.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Voice Parameters */}
        <div className="space-y-6 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-2 text-slate-600 text-xs font-semibold uppercase tracking-wider">
            <Volume2 className="w-4 h-4 text-primary-500" />
            <span>Voice &amp; Language</span>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500">Language (AURA Output)</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { code: 'en', label: 'English', flag: '🇺🇸' },
                { code: 'hi', label: 'Hindi (हिंदी)', flag: '🇮🇳' },
                { code: 'ta', label: 'Tamil (தமிழ்)', flag: '🇮🇳' },
                { code: 'te', label: 'Telugu (తెలుగు)', flag: '🇮🇳' },
                { code: 'kn', label: 'Kannada (ಕನ್ನಡ)', flag: '🇮🇳' }
              ].map((lang) => {
                const active = settings.language === lang.code
                return (
                  <button
                    key={lang.code}
                    onClick={() => updateSetting('language', lang.code)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all duration-200 flex items-center gap-2 active:scale-95 ${
                      active
                        ? 'bg-primary-50 border-primary-300 text-primary-700 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-sm">{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500">Choose Voice Type</label>
            <select
              value={settings.voiceName}
              onChange={(e) => updateSetting('voiceName', e.target.value)}
              className="w-full py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-semibold"
              suppressHydrationWarning={true}
            >
              <option value="">System Default</option>
              {voices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>Voice Pitch: {settings.voicePitch.toFixed(1)}</span>
              <span className="text-slate-400">Futuristic / Natural</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={settings.voicePitch}
              onChange={(e) => updateSetting('voicePitch', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary-600"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>Speech Rate: {settings.voiceRate.toFixed(1)}x</span>
              <span className="text-slate-400">Steady / Fast</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.8"
              step="0.1"
              value={settings.voiceRate}
              onChange={(e) => updateSetting('voiceRate', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary-600"
            />
          </div>
        </div>
      </div>

      {/* Footer / Reset option */}
      <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
        <button
          onClick={() => onChange({
            skinColor: '#e5b88c',
            hairColor: '#000000',
            hairStyle: 'spiky',
            eyeColor: '#4b70dd',
            voicePitch: 1.0,
            voiceRate: 1.0,
            voiceName: '',
            gender: 'male',
            language: 'en',
            avatarSource: 'vector',
            didVideoUrl: '',
          })}
          className="flex-1 py-3 text-center text-xs font-bold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
        >
          Reset to Default
        </button>
      </div>
    </div>
  )
}
