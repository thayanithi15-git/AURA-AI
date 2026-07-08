'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, TrendingUp, BarChart3, DollarSign, VolumeX, Volume2, User, Bot, Mic, MicOff, Key, HelpCircle } from 'lucide-react'
import type { AIProvider } from './Customizer'

interface Message {
  id: string
  sender: 'user' | 'bot'
  text: string
  timestamp: string
  chartData?: {
    type: 'pie' | 'bar' | 'line'
    labels: string[]
    values: number[]
    colors?: string[]
  }
}

interface AdvisoryPanelProps {
  onSpeakingStateChange: (isSpeaking: boolean) => void
  voicePitch: number
  voiceRate: number
  voiceName: string
  apiKey: string
  setApiKey: (key: string) => void
  onHeadAnimationChange: (anim: 'idle' | 'nod' | 'shake') => void
  onSubtitleChange: (text: string) => void
  gender?: 'male' | 'female'
  language: 'en' | 'hi' | 'ta' | 'kn' | 'te'
  avatarSource?: 'vector' | 'did'
  onSpeakTrigger?: () => void
  onDidVideoGenerated?: (url: string) => void
  didStreamId?: string
  didSessionId?: string
  isSpeaking?: boolean
  aiProvider?: AIProvider
}

const WEALTH_BOT_RESPONSES: Record<string, { reply: string; chart?: Message['chartData'] }> = {
  default: {
    reply: "I am AURA, mhe tumara dost hu . How can I help you optimize your wealth today? You can ask me to analyze your spending habits, suggest investment portfolios, or explain wealth strategies.",
  },
  spending: {
    reply: "Analyzing your transaction flow: You spent $4,200 last month. Your core essentials (rent, bills) accounted for 45%, lifestyle & dining for 38% (which is 8% above average), and savings was only 17%. I recommend shifting $300/month from dining to your investment portfolio to maximize compounding interest.",
    chart: {
      type: 'pie',
      labels: ['Rent/Bills', 'Lifestyle', 'Investments', 'Savings'],
      values: [45, 38, 10, 7],
      colors: ['#3b82f6', '#f43f5e', '#10b981', '#f59e0b']
    }
  },
  portfolio: {
    reply: "Based on a moderate-risk profile, I have designed a balanced asset allocation. This portfolio aims for an 8.4% projected annual return while maintaining solid downside protection.",
    chart: {
      type: 'bar',
      labels: ['US Equities', 'Global Bonds', 'Emerging Tech', 'Real Estate', 'Crypto/Gold'],
      values: [40, 25, 15, 12, 8],
      colors: ['#6366f1', '#3b82f6', '#10b981', '#eab308', '#ec4899']
    }
  },
  projection: {
    reply: "Here is your projected net worth growth over the next 15 years if you invest $500 monthly at an average 8% annual yield compared to keeping it in a basic checking account. The difference is over $78,000!",
    chart: {
      type: 'line',
      labels: ['Start', 'Yr 3', 'Yr 6', 'Yr 9', 'Yr 12', 'Yr 15'],
      values: [10000, 31000, 60000, 102000, 158000, 235000],
      colors: ['#10b981']
    }
  },
  budget: {
    reply: "Let's set up a 50/30/20 budget framework. 50% for Needs ($2,000), 30% for Wants ($1,200), and 20% for Savings & Debt payoff ($800). Here is a layout of how this will look for you.",
    chart: {
      type: 'pie',
      labels: ['Needs (50%)', 'Wants (30%)', 'Savings (20%)'],
      values: [50, 30, 20],
      colors: ['#3b82f6', '#f43f5e', '#10b981']
    }
  }
}

export default function AdvisoryPanel({
  onSpeakingStateChange,
  voicePitch,
  voiceRate,
  voiceName,
  apiKey,
  setApiKey,
  onHeadAnimationChange,
  onSubtitleChange,
  gender = 'male',
  language = 'en',
  avatarSource = 'vector',
  onSpeakTrigger,
  didStreamId,
  didSessionId,
  onDidVideoGenerated,
  isSpeaking = false,
  aiProvider = 'gemini',
}: AdvisoryPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: "Hi there! It's great to hear from you. What financial questions do you have today, or what can I help you with?",
      timestamp: "System Online",
    },
  ])
  const [pendingMessage, setPendingMessage] = useState<{ id: string; text: string; chartData?: any } | null>(null)
  const [input, setInput] = useState('')
  const [isVoiceMuted, setIsVoiceMuted] = useState(false)
  const [isSynthesizing, setIsSynthesizing] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [showKeyInput, setShowKeyInput] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const synthesisUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const recognitionRef = useRef<any>(null)
  const pollIntervalRef = useRef<any>(null)

  // Reveal pending message when D-ID video starts playing (isSpeaking transitions to true)
  useEffect(() => {
    if (isSpeaking && pendingMessage) {
      setMessages(prev => prev.map(msg => 
        msg.id === pendingMessage.id 
          ? { ...msg, text: pendingMessage.text, chartData: pendingMessage.chartData } 
          : msg
      ))
      setPendingMessage(null)
    }
  }, [isSpeaking, pendingMessage])

  // Cleanup polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [])

  // Scroll to bottom on messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Trigger greeting speech generation when switching to D-ID mode
  useEffect(() => {
    if (avatarSource === 'did') {
      const greeting = "Hi there! It's great to hear from you. What financial questions do you have today, or what can I help you with?"
      speakText(greeting)
    }
  }, [avatarSource])

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const rec = new SpeechRecognition()
        rec.continuous = false
        rec.interimResults = false
        rec.lang = 'en-US'

        rec.onstart = () => {
          setIsListening(true)
          onHeadAnimationChange('nod')
          setTimeout(() => onHeadAnimationChange('idle'), 500)
        }

        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setInput(transcript)
          handleSendDirect(transcript)
        }

        rec.onerror = (event: any) => {
          console.error('Speech recognition error', event)
          setIsListening(false)
          onHeadAnimationChange('shake')
          setTimeout(() => onHeadAnimationChange('idle'), 800)
        }

        rec.onend = () => {
          setIsListening(false)
        }

        recognitionRef.current = rec
      }
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [apiKey])

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start()
      } else {
        alert("Speech recognition is not supported in this browser. Try Google Chrome.")
      }
    }
  }

  const speakText = (text: string, botPlaceholderId?: string, chartData?: any) => {
    // Clean text of markdown, emojis, or special chars
    let cleanText = text
      .replace(/[\uD83C-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]/g, '')
      .replace(/[*_`#\-]/g, '')
      .replace(/🔑.*/g, '')

    if (avatarSource === 'did') {
      onSubtitleChange(cleanText)
      onSpeakingStateChange(true)
      
      // Clear any prior active poll interval
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
      
      fetch('/api/did', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText })
      })
      .then(res => res.json())
      .then(resData => {
        if (resData.success && resData.data?.id) {
          const videoId = resData.data.id
          
          const intervalId = setInterval(() => {
            fetch(`/api/did?id=${videoId}`)
              .then(pollRes => pollRes.json())
              .then(pollData => {
                if (!pollData.success || !pollData.data) {
                  console.error("D-ID polling error response:", pollData)
                  clearInterval(intervalId)
                  if (pollIntervalRef.current === intervalId) {
                    pollIntervalRef.current = null
                  }
                  onSpeakingStateChange(false)
                  return
                }

                const status = pollData.data.status
                console.log(`Polling D-ID video status: "${status}"`, pollData.data)

                if (status === 'done' || status === 'completed') {
                  clearInterval(intervalId)
                  if (pollIntervalRef.current === intervalId) {
                    pollIntervalRef.current = null
                  }
                  const videoUrl = pollData.data.result_url
                  console.log("D-ID video successfully generated! URL:", videoUrl)
                  
                  // Reveal the response immediately in the chat when generated video URL is ready
                  if (botPlaceholderId) {
                    setMessages(prev => prev.map(msg => 
                      msg.id === botPlaceholderId 
                        ? { ...msg, text: text, chartData: chartData } 
                        : msg
                    ))
                    setPendingMessage(null)
                  }

                  if (onDidVideoGenerated && videoUrl) {
                    onDidVideoGenerated(videoUrl)
                  }
                } else if (status === 'error' || status === 'failed') {
                  clearInterval(intervalId)
                  if (pollIntervalRef.current === intervalId) {
                    pollIntervalRef.current = null
                  }
                  console.error("D-ID expressive video generation error", pollData.data)
                  alert(`D-ID Video generation errored on server: ${pollData.data?.error?.message || 'Check D-ID console'}`)
                  onSpeakingStateChange(false)
                }
              })
              .catch(err => {
                clearInterval(intervalId)
                if (pollIntervalRef.current === intervalId) {
                  pollIntervalRef.current = null
                }
                console.error("Expressive video polling error:", err)
                onSpeakingStateChange(false)
              })
          }, 3000)
          
          pollIntervalRef.current = intervalId
        } else {
          console.error("D-ID POST failed:", resData)
          alert(`D-ID Video request failed: ${resData.data?.message || resData.error || 'Invalid credentials or character ID'}`)
          onSpeakingStateChange(false)
        }
      })
      .catch(err => {
        console.error("Error creating expressive video:", err)
        onSpeakingStateChange(false)
      })
      return
    }

    if (isVoiceMuted || typeof window === 'undefined' || !window.speechSynthesis) {
      onSubtitleChange(text)
      return
    }

    // Cancel active speak
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.pitch = voicePitch
    utterance.rate = voiceRate

    const langTags: Record<string, string> = {
      en: 'en-US',
      hi: 'hi-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      kn: 'kn-IN',
    }
    const langTag = langTags[language] || 'en-US'
    utterance.lang = langTag

    // Try to get selected voice
    const voices = window.speechSynthesis.getVoices()
    const selectedVoice = voices.find((v) => v.name === voiceName)
    if (selectedVoice) {
      utterance.voice = selectedVoice
    } else {
      // Find voice matching language & gender
      const isFemale = gender === 'female'
      let matchedVoice = voices.find((v) =>
        v.lang.toLowerCase().startsWith(language) &&
        (isFemale ? !v.name.toLowerCase().includes('male') : !v.name.toLowerCase().includes('female'))
      )
      
      if (!matchedVoice) {
        matchedVoice = voices.find((v) => v.lang.toLowerCase().startsWith(language))
      }
      
      if (matchedVoice) {
        utterance.voice = matchedVoice
      } else if (language === 'en') {
        // Only fallback to English voices if the target language is English
        const preferredVoice = voices.find(
          (v) => v.name.includes('Google US English') || v.name.includes('Microsoft Zira') || v.name.includes('Samantha')
        )
        if (preferredVoice) utterance.voice = preferredVoice
      }
    }

    utterance.onstart = () => {
      setIsSynthesizing(true)
      onSpeakingStateChange(true)
      onSubtitleChange(cleanText)
      onHeadAnimationChange('nod')
      setTimeout(() => onHeadAnimationChange('idle'), 600)
    }

    utterance.onend = () => {
      setIsSynthesizing(false)
      onSpeakingStateChange(false)
      onSubtitleChange('')
    }

    utterance.onerror = () => {
      setIsSynthesizing(false)
      onSpeakingStateChange(false)
      onSubtitleChange('')
    }

    synthesisUtteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  const queryAI = async (prompt: string): Promise<{ text: string; chart?: Message['chartData'] }> => {
    const history = messages.map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      content: msg.text.replace(/🔑.*/g, ''),
    }))

    const response = await fetch('/api/ai-response', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        history,
        provider: aiProvider,
        language,
        apiKey,
      }),
    })

    if (!response.ok) {
      throw new Error('AI request failed')
    }

    const data = await response.json()
    const text = data.text || "I'm having trouble processing that query."

    let chart: Message['chartData'] | undefined = undefined
    const pctMatches = [...text.matchAll(/(\d+)%\s+(?:in\s+|for\s+|of\s+)?([a-zA-Z\s]{3,20})/g)]
    if (pctMatches.length >= 2) {
      const labels = pctMatches.map((m) => m[2].trim())
      const values = pctMatches.map((m) => parseInt(m[1]))
      const colors = ['#3b82f6', '#f43f5e', '#10b981', '#f59e0b', '#ec4899', '#6366f1'].slice(0, labels.length)
      chart = {
        type: 'pie',
        labels,
        values,
        colors,
      }
    }

    return { text, chart }
  }

  const handleSendDirect = async (messageText: string) => {
    if (!messageText.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')

    onHeadAnimationChange('nod')
    setTimeout(() => onHeadAnimationChange('idle'), 500)

    if (apiKey) {
      try {
        const botPlaceholderId = (Date.now() + 1).toString()
        onHeadAnimationChange('nod')

        const result = await queryAI(messageText)
        
        if (avatarSource === 'did') {
          const botMessagePlaceholder: Message = {
            id: botPlaceholderId,
            sender: 'bot',
            text: "AURA is preparing video advisor response...",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
          setMessages((prev) => [...prev, botMessagePlaceholder])
          setPendingMessage({
            id: botPlaceholderId,
            text: result.text,
            chartData: result.chart
          })
          speakText(result.text, botPlaceholderId, result.chart)
        } else {
          const botMessage: Message = {
            id: botPlaceholderId,
            sender: 'bot',
            text: result.text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            chartData: result.chart,
          }
          setMessages((prev) => [...prev, botMessage])
          speakText(result.text)
        }
      } catch (err) {
        onHeadAnimationChange('shake')
        setTimeout(() => onHeadAnimationChange('idle'), 1000)

        const errMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: `I encountered an error querying the ${aiProvider === 'both' ? 'AI providers' : aiProvider === 'groq' ? 'Groq API' : 'Gemini API'}. Please make sure your API key is correct and valid.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
        setMessages((prev) => [...prev, errMsg])
        speakText("I encountered an error querying the API. Please check your key.")
      }
    } else {
      setTimeout(() => {
        const lower = messageText.toLowerCase()
        let key = 'default'
        if (lower.includes('spend') || lower.includes('expense') || lower.includes('habit')) {
          key = 'spending'
        } else if (lower.includes('invest') || lower.includes('portfolio') || lower.includes('stock')) {
          key = 'portfolio'
        } else if (lower.includes('project') || lower.includes('growth') || lower.includes('future')) {
          key = 'projection'
        } else if (lower.includes('budget') || lower.includes('save') || lower.includes('saving')) {
          key = 'budget'
        }

        const response = WEALTH_BOT_RESPONSES[key]
        const botPlaceholderId = (Date.now() + 1).toString()

        if (avatarSource === 'did') {
          const botMessagePlaceholder: Message = {
            id: botPlaceholderId,
            sender: 'bot',
            text: "AURA is preparing video advisor response...",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
          setMessages((prev) => [...prev, botMessagePlaceholder])
          setPendingMessage({
            id: botPlaceholderId,
            text: response.reply,
            chartData: response.chart
          })
          speakText(response.reply, botPlaceholderId, response.chart)
        } else {
          const botMessage: Message = {
            id: botPlaceholderId,
            sender: 'bot',
            text: response.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            chartData: response.chart,
          }
          setMessages((prev) => [...prev, botMessage])
          speakText(response.reply)
        }
      }, 800)
    }
  }

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    handleSendDirect(input)
  }

  const renderChart = (chart: Message['chartData']) => {
    if (!chart) return null

    if (chart.type === 'pie') {
      let total = chart.values.reduce((a, b) => a + b, 0)
      let cumulativePercent = 0

      const coordinates = chart.values.map((val) => {
        const percent = val / total
        const startAngle = cumulativePercent * 360
        cumulativePercent += percent
        const endAngle = cumulativePercent * 360

        const x1 = Math.cos(((startAngle - 90) * Math.PI) / 180) * 45 + 50
        const y1 = Math.sin(((startAngle - 90) * Math.PI) / 180) * 45 + 50
        const x2 = Math.cos(((endAngle - 90) * Math.PI) / 180) * 45 + 50
        const y2 = Math.sin(((endAngle - 90) * Math.PI) / 180) * 45 + 50

        const largeArc = percent > 0.5 ? 1 : 0
        return `M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z`
      })

      return (
        <div className="mt-4 p-4 bg-white rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-28 h-28 flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {coordinates.map((path, idx) => (
                <path
                  key={idx}
                  d={path}
                  fill={chart.colors?.[idx] || '#3b82f6'}
                  className="transition-all duration-300 hover:opacity-85"
                />
              ))}
              <circle cx="50" cy="50" r="22" fill="#ffffff" />
            </svg>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-2 text-xs">
            {chart.labels.map((lbl, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-slate-600">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: chart.colors?.[idx] }}
                />
                <span className="truncate">
                  {lbl}: {chart.values[idx]}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (chart.type === 'bar') {
      const maxValue = Math.max(...chart.values)
      return (
        <div className="mt-4 p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
          {chart.labels.map((lbl, idx) => {
            const pct = (chart.values[idx] / maxValue) * 100
            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>{lbl}</span>
                  <span className="text-primary-600 font-bold">{chart.values[idx]}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: chart.colors?.[idx] || '#3b82f6',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )
    }

    if (chart.type === 'line') {
      const maxVal = Math.max(...chart.values)
      const points = chart.values
        .map((v, i) => {
          const x = (i / (chart.values.length - 1)) * 90 + 5
          const y = 90 - (v / maxVal) * 80
          return `${x},${y}`
        })
        .join(' ')

      return (
        <div className="mt-4 p-4 bg-white rounded-2xl border border-slate-200">
          <div className="h-32 w-full">
            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <line x1="5" y1="10" x2="95" y2="10" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="3" />
              <line x1="5" y1="50" x2="95" y2="50" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="3" />
              <line x1="5" y1="90" x2="95" y2="90" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="3" />
              <polyline
                fill="none"
                stroke={chart.colors?.[0] || '#10b981'}
                strokeWidth="2.5"
                points={points}
                className="transition-all duration-500"
              />
              {chart.values.map((v, i) => {
                const x = (i / (chart.values.length - 1)) * 90 + 5
                const y = 90 - (v / maxVal) * 80
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="2.5"
                    fill="#06b6d4"
                    stroke="#ffffff"
                    strokeWidth="0.75"
                  />
                )
              })}
            </svg>
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-medium">
            {chart.labels.map((lbl, idx) => (
              <span key={idx}>{lbl}</span>
            ))}
          </div>
        </div>
      )
    }

    return null
  }

  const triggerPreset = (text: string) => {
    setInput(text)
    setTimeout(() => handleSendDirect(text), 50)
  }

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-lg font-sans">
      {/* Top Status Bar */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
            <div className="w-10 h-10 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600">
              <Bot className="w-5 h-5 text-primary-600" />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm tracking-wide">AURA Advisory Core</h3>
            <p className="text-[11px] text-emerald-600 font-semibold">
              {apiKey ? `${aiProvider === 'both' ? 'Gemini + Groq' : aiProvider === 'groq' ? 'Groq' : 'Gemini'} Mode Synced` : 'Offline Mode (Presets)'}
            </p>
          </div>
        </div>

        {/* Audio control & Help */}
        <div className="flex items-center gap-2">
          {/* Mute toggle */}
          <button
            onClick={() => {
              setIsVoiceMuted(!isVoiceMuted)
              if (!isVoiceMuted && window.speechSynthesis) window.speechSynthesis.cancel()
            }}
            className={`p-2 rounded-xl border transition-all duration-200 ${
              isVoiceMuted
                ? 'bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100'
                : 'bg-primary-50 border border-primary-200 text-primary-600 hover:bg-primary-100'
            }`}
            title={isVoiceMuted ? 'Unmute Voice output' : 'Mute Voice output'}
          >
            {isVoiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Messages thread */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-[85%] ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border text-xs font-semibold ${
                msg.sender === 'user'
                  ? 'bg-slate-100 border-slate-200 text-slate-600'
                  : 'bg-primary-50 border border-primary-100 text-primary-600'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div>
              <div
                className={`p-4 rounded-2xl ${
                  msg.sender === 'user'
                    ? 'bg-primary-600 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                }`}
              >
                <p className="text-xs font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                {msg.chartData && renderChart(msg.chartData)}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block px-1">{msg.timestamp}</span>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Preset Recommendations */}
      <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
        <button
          onClick={() => triggerPreset('How is my spending habits?')}
          className="text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 py-1.5 px-3 rounded-full flex items-center gap-1.5 transition-all shadow-sm"
        >
          <BarChart3 className="w-3.5 h-3.5 text-rose-500" />
          <span>Analyze Spending</span>
        </button>
        <button
          onClick={() => triggerPreset('Recommend an investment portfolio')}
          className="text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 py-1.5 px-3 rounded-full flex items-center gap-1.5 transition-all shadow-sm"
        >
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          <span>Investment Portfolio</span>
        </button>
        <button
          onClick={() => triggerPreset('Show my wealth growth projection')}
          className="text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 py-1.5 px-3 rounded-full flex items-center gap-1.5 transition-all shadow-sm"
        >
          <DollarSign className="w-3.5 h-3.5 text-yellow-500" />
          <span>Future Net Worth</span>
        </button>
      </div>

      {/* Input controls form */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-200 flex items-center gap-3">
        {/* Voice recording mic button */}
        <button
          type="button"
          onClick={toggleListening}
          className={`p-3 rounded-xl border transition-all duration-200 ${
            isListening
              ? 'bg-rose-600 border-rose-500 text-white animate-pulse'
              : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
          title={isListening ? 'Stop Listening' : 'Speak into Microphone'}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? 'Listening to voice...' : 'Ask AURA about wealth, savings, portfolios...'}
          className="flex-1 py-3 px-4 bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 outline-none transition-all"
        />

        <button
          type="submit"
          disabled={!input.trim()}
          className="p-3 bg-primary-600 hover:bg-primary-500 disabled:opacity-40 disabled:hover:bg-primary-600 rounded-xl text-white shadow-lg transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}
