'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, TrendingUp, BarChart3, DollarSign, VolumeX, Volume2, User, Bot, Mic, MicOff, Key, HelpCircle, Terminal } from 'lucide-react'
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

interface VectorAdvisoryPanelProps {
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
  aiProvider?: AIProvider
}

const WEALTH_BOT_RESPONSES: Record<string, { reply: string; chart?: Message['chartData'] }> = {
  default: {
    reply: "I am AURA, your interactive AI Wealth Advisor. How can I help you optimize your wealth today? You can ask me to analyze your spending habits, suggest investment portfolios, or explain wealth strategies.",
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

export default function VectorAdvisoryPanel({
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
  aiProvider = 'gemini',
}: VectorAdvisoryPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: "Hi there! It's great to hear from you. What financial questions do you have today, or what can I help you with?",
      timestamp: "System Online",
    },
  ])
  const [input, setInput] = useState('')
  const [isVoiceMuted, setIsVoiceMuted] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [showKeyInput, setShowKeyInput] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  // Scroll to bottom on messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
        }

        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setInput(transcript)
          handleSendDirect(transcript)
        }

        rec.onerror = () => {
          setIsListening(false)
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

  const speakText = (text: string) => {
    // Clean text of markdown, emojis, or special chars
    let cleanText = text
      .replace(/[\uD83C-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]/g, '')
      .replace(/[*_`#\-]/g, '')
      .replace(/🔑.*/g, '')

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
        const preferredVoice = voices.find(
          (v) => v.name.includes('Google US English') || v.name.includes('Microsoft Zira') || v.name.includes('Samantha')
        )
        if (preferredVoice) utterance.voice = preferredVoice
      }
    }

    utterance.onstart = () => {
      onSpeakingStateChange(true)
      onSubtitleChange(cleanText)
    }

    utterance.onend = () => {
      onSpeakingStateChange(false)
      onSubtitleChange('')
    }

    utterance.onerror = () => {
      onSpeakingStateChange(false)
      onSubtitleChange('')
    }

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
        
        const botMessage: Message = {
          id: botPlaceholderId,
          sender: 'bot',
          text: result.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          chartData: result.chart,
        }

        setMessages((prev) => [...prev, botMessage])
        speakText(result.text)
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
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: response.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          chartData: response.chart,
        }

        setMessages((prev) => [...prev, botMessage])
        speakText(response.reply)
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
        <div className="mt-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-center gap-4 animate-fade-in">
          <div className="relative w-28 h-28 flex-shrink-0 animate-scale-in">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {coordinates.map((path, idx) => (
                <path
                  key={idx}
                  d={path}
                  fill={chart.colors?.[idx] || '#3b82f6'}
                  className="transition-all duration-300 hover:opacity-85"
                />
              ))}
              <circle cx="50" cy="50" r="22" className="fill-white dark:fill-slate-800" />
            </svg>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-2 text-xs">
            {chart.labels.map((lbl, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-slate-600 dark:text-slate-350">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: chart.colors?.[idx] }}
                />
                <span className="truncate text-slate-700 dark:text-slate-300">
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
        <div className="mt-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 animate-fade-in">
          {chart.labels.map((lbl, idx) => {
            const pct = (chart.values[idx] / maxValue) * 100
            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-20500">
                  <span className="text-slate-700 dark:text-slate-300">{lbl}</span>
                  <span className="text-slate-800 dark:text-slate-200">{chart.values[idx]}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
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
      const maxValue = Math.max(...chart.values)
      const minValue = Math.min(...chart.values)
      const range = maxValue - minValue || 1
      const points = chart.values
        .map((val, idx) => {
          const x = (idx / (chart.values.length - 1)) * 90 + 5
          const y = 95 - ((val - minValue) / range) * 85
          return `${x},${y}`
        })
        .join(' ')

      return (
        <div className="mt-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 animate-fade-in">
          <div className="w-full h-32 relative">
            <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
              <polyline
                fill="none"
                stroke={chart.colors?.[0] || '#10b981'}
                strokeWidth="2.5"
                points={points}
                className="animate-dash"
              />
            </svg>
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-2 px-1 font-mono uppercase tracking-widest">
            {chart.labels.map((lbl, idx) => (
              <span key={idx}>{lbl}</span>
            ))}
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg font-sans relative">
      {/* HUD Accents */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-indigo-500 to-primary-600 opacity-20" />

      {/* Header bar */}
      <div className="p-4 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary-500 animate-pulse" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 font-mono">
            AURA Advisory Terminal
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Voice mute toggle */}
          <button
            onClick={() => {
              setIsVoiceMuted(!isVoiceMuted)
              if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel()
              }
            }}
            className={`p-2 rounded-xl transition-all ${
              isVoiceMuted ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-450 dark:hover:text-slate-200 border border-transparent'
            }`}
            title={isVoiceMuted ? 'Unmute voice synthesiser' : 'Mute voice synthesiser'}
          >
            {isVoiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Suggestion HUD */}
      <div className="px-4 py-2 bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-200/50 dark:border-slate-850 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none z-10">
        <button
          onClick={() => handleSendDirect('How is my spending?')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-[10px] font-semibold text-slate-600 dark:text-slate-300 transition-all active:scale-95 shadow-sm"
        >
          <DollarSign className="w-3 h-3 text-primary-500" />
          <span>Check Spending</span>
        </button>
        <button
          onClick={() => handleSendDirect('Recommend an investment portfolio')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-[10px] font-semibold text-slate-600 dark:text-slate-300 transition-all active:scale-95 shadow-sm"
        >
          <TrendingUp className="w-3 h-3 text-primary-500" />
          <span>Recommend Portfolio</span>
        </button>
        <button
          onClick={() => handleSendDirect('Show my wealth projection')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-[10px] font-semibold text-slate-600 dark:text-slate-300 transition-all active:scale-95 shadow-sm"
        >
          <BarChart3 className="w-3 h-3 text-primary-500" />
          <span>Wealth Projection</span>
        </button>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans bg-slate-50/30 dark:bg-slate-950/10">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            {msg.sender === 'bot' && (
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                <Bot className="w-4 h-4 text-primary-500" />
              </div>
            )}
            <div className="max-w-[80%] flex flex-col gap-1.5">
              <div
                className={`py-3 px-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-primary-600 text-white rounded-tr-none'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-150 border border-slate-200/60 dark:border-slate-700 rounded-tl-none'
                }`}
              >
                {msg.text.split('\n').map((line, idx) => (
                  <p key={idx} className={idx > 0 ? 'mt-2' : ''}>
                    {line}
                  </p>
                ))}
                {renderChart(msg.chartData)}
              </div>
              <span className={`text-[9px] text-slate-400 dark:text-slate-500 font-mono tracking-wider px-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                {msg.timestamp}
              </span>
            </div>
            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900/50 flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              </div>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Footer Input Bar */}
      <form onSubmit={handleSend} className="p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-850 flex gap-3 items-center z-10">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AURA a question..."
          className="flex-1 py-2.5 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl text-sm transition-all"
        />

        {/* Mic Toggle Button */}
        <button
          type="button"
          onClick={toggleListening}
          className={`p-2.5 rounded-xl transition-all active:scale-95 ${
            isListening ? 'bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 animate-pulse' : 'bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-350'
          }`}
          title={isListening ? 'Speech Recognition Active' : 'Start Speech Input'}
        >
          {isListening ? <Mic className="w-4.5 h-4.5" /> : <MicOff className="w-4.5 h-4.5" />}
        </button>

        {/* Send Button */}
        <button
          type="submit"
          className="p-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center animate-pulse-glow"
        >
          <Send className="w-4.5 h-4.5" />
        </button>
      </form>
    </div>
  )
}
