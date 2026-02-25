import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { prompt, style } = await request.json();
    
    if (!prompt) {
      return NextResponse.json({ error: 'No prompt provided' }, { status: 400 });
    }

    const apiKey = process.env.VENICE_INFERENCE_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'VENICE_INFERENCE_KEY not configured' }, { status: 500 });
    }

    const enhanced = `Highly detailed ${style} scientific illustration: ${prompt}. Soft flowing brush textures, vibrant colors, elegant layout, detailed.`;
    
    console.log('Calling Venice API...');
    
    // Try the image generations endpoint
    const res = await fetch('https://api.venice.ai/api/v1/image/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
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
    console.log('Venice response:', JSON.stringify(data).substring(0, 300));
    
    if (!res.ok) {
      return NextResponse.json({ 
        error: data.error || `Venice API error: ${res.status}`, 
        details: data 
      }, { status: res.status });
    }
    
    // Try to get image from various response formats
    let url = data.image_url || data.images?.[0]?.url || data.images?.[0]?.base64 || data.data?.[0]?.url;
    
    if (!url) {
      return NextResponse.json({ 
        error: 'No image in response', 
        fullResponse: data 
      }, { status: 500 });
    }
    
    return NextResponse.json({ imageUrl: url });
    
  } catch (e) {
    console.error('Generate error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}