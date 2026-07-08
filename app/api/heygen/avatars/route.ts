import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const apiKey = process.env.HEYGEN_API_KEY || 'sk_V2_hgu_kzR0IaWqose_mMYxqPfKozqqJYXfUvhdWKA4DCH9cswG'
    
    // Fetch avatars list from HeyGen V3 endpoint
    const res = await fetch("https://api.heygen.com/v3/avatars?ownership=public&limit=10", {
      method: "GET",
      headers: {
        "X-Api-Key": apiKey
      }
    })

    if (!res.ok) {
      const errText = await res.text()
      return NextResponse.json({ success: false, error: errText }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
