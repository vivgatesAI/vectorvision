import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { prompt, style } = await request.json();
    
    if (!prompt) {
      return NextResponse.json({ error: 'No prompt provided' }, { status: 400 });
    }

    const enhanced = `Highly detailed ${style} scientific illustration: ${prompt}. Soft flowing brush textures, vibrant colors, elegant layout, detailed.`;
    
    console.log('Calling Venice API with prompt:', prompt.substring(0, 50));
    
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
    console.log('Venice API response:', JSON.stringify(data).substring(0, 200));
    
    if (!res.ok) {
      return NextResponse.json({ error: data.error || `Venice API error: ${res.status}` }, { status: res.status });
    }
    
    const url = data.image_url || data.images?.[0]?.url || data.images?.[0]?.base64;
    
    if (!url) {
      return NextResponse.json({ error: 'No image URL in response', details: data }, { status: 500 });
    }
    
    // Handle base64 images
    const imageUrl = url.startsWith('data:') ? url : url;
    
    return NextResponse.json({ imageUrl });
    
  } catch (e) {
    console.error('Generate API error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}