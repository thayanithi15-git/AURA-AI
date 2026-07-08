import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { text, gender } = await req.json()
    if (!text) {
      return NextResponse.json({ success: false, error: 'Text script is required' }, { status: 400 })
    }

    const apiKey = process.env.DID_API_KEY || 'dGhheWFuaXRoaS5jczIzQGJpdHNhdGh5LmFjLmlu:VWF0Kp8_v6K97leWRzf6d'
    const basicAuth = apiKey.startsWith('Basic ') ? apiKey : `Basic ${Buffer.from(apiKey).toString('base64')}`

    const isMale = gender === 'male'
    const sourceUrl = isMale
      ? "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&h=400&q=80"
      : "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&h=400&q=80"

    const voiceId = isMale ? "en-US-GuyNeural" : "en-US-JennyNeural"

    // Create D-ID Talk request
    const response = await fetch("https://api.d-id.com/talks", {
      method: "POST",
      headers: {
        "Authorization": basicAuth,
        "Content-Type": "application/json",
        "accept": "application/json"
      },
      body: JSON.stringify({
        source_url: sourceUrl,
        script: {
          type: "text",
          subtitles: false,
          provider: {
            type: "microsoft",
            voice_id: voiceId
          },
          input: text
        },
        config: {
          fluent: false,
          pad_audio: 0.0
        }
      })
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error("D-ID talks create failed:", errText)
      return NextResponse.json({ success: false, error: errText }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Talk Route POST error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, error: 'Talk ID is required' }, { status: 400 })
    }

    const apiKey = process.env.DID_API_KEY || 'dGhheWFuaXRoaS5jczIzQGJpdHNhdGh5LmFjLmlu:VWF0Kp8_v6K97leWRzf6d'
    const basicAuth = apiKey.startsWith('Basic ') ? apiKey : `Basic ${Buffer.from(apiKey).toString('base64')}`

    const response = await fetch(`https://api.d-id.com/talks/${id}`, {
      method: "GET",
      headers: {
        "Authorization": basicAuth,
        "accept": "application/json"
      }
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error("D-ID talks status failed:", errText)
      return NextResponse.json({ success: false, error: errText }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Talk Route GET error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
