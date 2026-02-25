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
    
    console.log('Calling Venice API with nano-banana-pro...');
    
    // Correct endpoint and parameters from Venice API docs
    const res = await fetch('https://api.venice.ai/api/v1/image/generate', {
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
        hide_watermark: false,
        width: 1024,
        height: 1024,
        aspect_ratio: '1:1',
        format: 'png'
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
    
    // Handle response - could be base64 or URL
    let url = data.image || data.images?.[0]?.image || data.images?.[0]?.url || data.data?.[0]?.url;
    
    // If it's base64, create a data URL
    if (url && !url.startsWith('http') && !url.startsWith('data:')) {
      url = `data:image/png;base64,${url}`;
    }
    
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