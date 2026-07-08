import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const apiKey = process.env.HEYGEN_API_KEY || 'sk_V2_hgu_kzR0IaWqose_mMYxqPfKozqqJYXfUvhdWKA4DCH9cswG'
    
    // Fetch session token from HeyGen token creation endpoint
    const res = await fetch("https://api.heygen.com/v1/streaming.token.create", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json"
      }
    })

    if (!res.ok) {
      const errText = await res.text()
      return NextResponse.json({ success: false, error: errText }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json({ success: true, token: data.data.token })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
