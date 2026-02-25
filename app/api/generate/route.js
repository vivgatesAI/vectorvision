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

    const enhanced = `Highly detailed ${style}: ${prompt}. Beautiful colors, elegant, detailed.`;
    
    console.log('Calling Venice API...');
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000); // 2 min timeout
    
    try {
      const res = await fetch('https://api.venice.ai/api/v1/image/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'nano-banana-pro',
          prompt: enhanced,
          steps: 25,
          width: 512,
          height: 512,
          format: 'png'
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeout);
      
      const data = await res.json();
      console.log('Venice response status:', res.status);
      
      if (!res.ok) {
        return NextResponse.json({ 
          error: data.message || data.error || `Venice API error: ${res.status}`, 
          details: data 
        }, { status: res.status });
      }
      
      // Extract image from response
      let imageBase64 = null;
      
      if (data.images && Array.isArray(data.images) && data.images.length > 0) {
        const firstImage = data.images[0];
        imageBase64 = typeof firstImage === 'string' ? firstImage : firstImage.image;
      }
      
      if (!imageBase64 && data.image) {
        imageBase64 = data.image;
      }
      
      if (imageBase64) {
        const imageUrl = imageBase64.startsWith('data:') 
          ? imageBase64 
          : `data:image/png;base64,${imageBase64}`;
        
        return NextResponse.json({ imageUrl });
      }
      
      return NextResponse.json({ 
        error: 'No image in response', 
        fullResponse: JSON.stringify(data).substring(0, 300)
      }, { status: 500 });
      
    } catch (fetchError) {
      clearTimeout(timeout);
      console.error('Fetch error:', fetchError.message);
      
      if (fetchError.name === 'AbortError') {
        return NextResponse.json({ error: 'Request timed out - try a simpler prompt' }, { status: 504 });
      }
      
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }
    
  } catch (e) {
    console.error('Generate error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}