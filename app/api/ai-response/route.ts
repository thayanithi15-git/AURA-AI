import { NextRequest, NextResponse } from 'next/server'

type Provider = 'gemini' | 'groq' | 'both'

type MessageEntry = {
  role: 'user' | 'model'
  content: string
}

function getTargetLanguage(language: string) {
  if (language === 'hi') return 'Hindi (हिंदी)'
  if (language === 'ta') return 'Tamil (தமிழ்)'
  if (language === 'te') return 'Telugu (తెలుగు)'
  if (language === 'kn') return 'Kannada (ಕನ್ನಡ)'
  return 'English'
}

function buildInstruction(prompt: string, language: string) {
  const targetLanguage = getTargetLanguage(language)
  return `Answer the following question in 2-3 short, conversational, and direct sentences. You MUST answer and write the text completely in fluent, conversational ${targetLanguage}. If using a non-English language, write completely in that language's native script. If you recommend a percentage asset allocation (e.g. 50% Bonds, 30% Equities, 20% Crypto), explicitly output them in your text so the UI parser can detect them. Question: ${prompt}`
}

async function callGemini(prompt: string, history: MessageEntry[], language: string, apiKey?: string) {
  const key = apiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
  if (!key) {
    throw new Error('Gemini API key is not configured')
  }

  const contents = history.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content.replace(/🔑.*/g, '') }],
  }))

  contents.push({
    role: 'user',
    parts: [{ text: buildInstruction(prompt, language) }],
  })

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
    }
  )

  if (!response.ok) {
    throw new Error('Gemini request failed')
  }

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm having trouble processing that query."
}

async function callGroq(prompt: string, history: MessageEntry[], language: string, apiKey?: string) {
  // Use client API key only if it is a Groq key, otherwise default to env variable
  const key = (apiKey && apiKey.startsWith('gsk_') ? apiKey : undefined) || process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.GROQ_API_KEY
  if (!key) {
    throw new Error('Groq API key is not configured')
  }

  const messages = [
    ...history.map((msg) => ({
      role: msg.role === 'model' ? ('assistant' as const) : (msg.role as 'user' | 'system'),
      content: msg.content.replace(/🔑.*/g, ''),
    })),
    {
      role: 'user' as const,
      content: buildInstruction(prompt, language),
    },
  ]

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    throw new Error('Groq request failed')
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  return typeof content === 'string' ? content : 'I am having trouble processing that request.'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const prompt = body?.prompt || ''
    const history = Array.isArray(body?.history) ? body.history : []
    const provider = (body?.provider || 'gemini') as Provider
    const language = body?.language || 'en'
    const apiKey = body?.apiKey

    if (!prompt.trim()) {
      return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 })
    }

    if (provider === 'groq') {
      const text = await callGroq(prompt, history, language, apiKey)
      return NextResponse.json({ provider, text })
    }

    if (provider === 'both') {
      const [geminiText, groqText] = await Promise.all([
        callGemini(prompt, history, language, apiKey),
        callGroq(prompt, history, language, apiKey),
      ])

      return NextResponse.json({
        provider: 'both',
        text: `Gemini response:\n${geminiText}\n\nGroq response:\n${groqText}`,
      })
    }

    const text = await callGemini(prompt, history, language, apiKey)
    return NextResponse.json({ provider, text })
  } catch (error: any) {
    console.error('AI response route error:', error)
    return NextResponse.json({ error: error?.message || 'AI request failed.' }, { status: 500 })
  }
}
