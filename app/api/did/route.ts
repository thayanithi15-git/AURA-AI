import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text) {
      return NextResponse.json({ success: false, error: 'Text script is required' }, { status: 400 });
    }

    const apiKey = process.env.DID_API_KEY || 'dGhheWFuaXRoaS5jczIzQGJpdHNhdGh5LmFjLmlu:VWF0Kp8_v6K97leWRzf6d';
    const basicAuth = apiKey.startsWith('Basic ') ? apiKey : `Basic ${Buffer.from(apiKey).toString('base64')}`;
    const agentId = process.env.NEXT_PUBLIC_DID_AGENT_ID || 'v2_agt_nQgFx1OV';

    // 1. Fetch Agent details to get the correct presenter_id and sentiment_id dynamically from the account
    const agentResponse = await fetch(`https://api.d-id.com/agents/${agentId}`, {
      method: "GET",
      headers: {
        Authorization: basicAuth,
        accept: "application/json"
      }
    });
    
    let avatarId = "public_mia_sport_elegant@avt_r9EHaB"; // fallback
    let sentimentId = "snt_iTjusd"; // fallback

    if (agentResponse.ok) {
      const agentData = await agentResponse.json();
      if (agentData?.presenter?.presenter_id) {
        avatarId = agentData.presenter.presenter_id;
      }
      if (agentData?.sentiments && agentData.sentiments.length > 0) {
        sentimentId = agentData.sentiments[0].id;
      }
    }

    console.log(`Creating expressive video. Avatar ID: ${avatarId}, Sentiment ID: ${sentimentId}`);

    // 2. Call the D-ID Expressives API to generate the video
    const response = await fetch("https://api.d-id.com/expressives", {
      method: "POST",
      headers: {
        Authorization: basicAuth,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        avatar_id: avatarId,
        sentiment_id: sentimentId,
        script: {
          type: "text",
          input: text
        }
      }),
    });

    const data = await response.json();
    return NextResponse.json({ success: response.ok, data });
  } catch (err: any) {
    console.error("Expressive API POST error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create expressive video" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Video ID is required' }, { status: 400 });
    }

    const apiKey = process.env.DID_API_KEY || 'dGhheWFuaXRoaS5jczIzQGJpdHNhdGh5LmFjLmlu:VWF0Kp8_v6K97leWRzf6d';
    const basicAuth = apiKey.startsWith('Basic ') ? apiKey : `Basic ${Buffer.from(apiKey).toString('base64')}`;

    const response = await fetch(`https://api.d-id.com/expressives/${id}`, {
      method: "GET",
      headers: {
        Authorization: basicAuth,
        accept: "application/json",
      },
    });

    const data = await response.json();
    return NextResponse.json({ success: response.ok, data });
  } catch (err: any) {
    console.error("Expressive API GET error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to check video status" },
      { status: 500 }
    );
  }
}
