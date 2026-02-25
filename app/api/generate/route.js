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
    console.log('Venice response received, processing...');
    
    if (!res.ok) {
      return NextResponse.json({ 
        error: data.error || `Venice API error: ${res.status}`, 
        details: data 
      }, { status: res.status });
    }
    
    // Handle base64 images from the images array
    let imageBase64 = null;
    
    if (data.images && Array.isArray(data.images) && data.images.length > 0) {
      // Images could be objects with 'image' property or direct strings
      const firstImage = data.images[0];
      if (typeof firstImage === 'string') {
        imageBase64 = firstImage;
      } else if (firstImage.image) {
        imageBase64 = firstImage.image;
      }
    }
    
    // Also check data.data
    if (!imageBase64 && data.data && Array.isArray(data.data) && data.data.length > 0) {
      const firstData = data.data[0];
      if (typeof firstData === 'string') {
        imageBase64 = firstData;
      } else if (firstData.image) {
        imageBase64 = firstData.image;
      } else if (firstData.url) {
        imageBase64 = firstData.url;
      }
    }
    
    // If still nothing, check for direct image property
    if (!imageBase64 && data.image) {
      imageBase64 = data.image;
    }
    
    if (imageBase64) {
      // Ensure it's a data URL
      const imageUrl = imageBase64.startsWith('data:') 
        ? imageBase64 
        : `data:image/png;base64,${imageBase64}`;
      
      console.log('Image extracted successfully, length:', imageUrl.length);
      return NextResponse.json({ imageUrl });
    }
    
    return NextResponse.json({ 
      error: 'No image in response', 
      fullResponse: JSON.stringify(data).substring(0, 500)
    }, { status: 500 });
    
  } catch (e) {
    console.error('Generate error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}