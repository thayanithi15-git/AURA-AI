import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const apiKey = process.env.DID_API_KEY || 'dGhheWFuaXRoaS5jczIzQGJpdHNhdGh5LmFjLmlu:VWF0Kp8_v6K97leWRzf6d'
    const basicAuth = apiKey.startsWith('Basic ') ? apiKey : `Basic ${Buffer.from(apiKey).toString('base64')}`
    const agentId = process.env.NEXT_PUBLIC_DID_AGENT_ID || 'agt_your_agent_id'

    // Fetch the specific Agent info from D-ID to verify
    const response = await fetch(`https://api.d-id.com/agents/${agentId}`, {
      method: "GET",
      headers: {
        "Authorization": basicAuth,
        "accept": "application/json"
      }
    })
    const data = await response.json()
    const agentName = data.preview_name || data.preview?.name || data.name || 'AURA Agent'

    return NextResponse.json({
      success: true,
      didConnected: true,
      didError: null,
      agentId: data.id,
      agentName,
      message: `Successfully fetched agent "${agentName}" from D-ID account. Live streaming is active.`,
      ...data
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message })
  }
}
