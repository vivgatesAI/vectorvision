import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { prompt, style } = await request.json();
    const enhanced = `Highly detailed ${style} scientific illustration: ${prompt}. Soft flowing brush textures, vibrant colors, elegant layout.`;
    
    const res = await fetch('https://api.venice.ai/api/v1/image/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VENICE_API_KEY}`
      },
      body: JSON.stringify({
        model: 'nano-banana-pro',
        prompt: enhanced,
        cfg_scale: 7.5,
        steps: 30,
        hide_watermark: false
      })
    });
    
    const data = await res.json();
    const url = data.image_url || data.images?.[0]?.url;
    return NextResponse.json({ imageUrl: url || data.error });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}