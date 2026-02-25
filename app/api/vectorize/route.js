import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { imageUrl, apiId, apiSecret } = await request.json();
    
    if (!imageUrl) {
      return NextResponse.json({ error: 'No image URL provided' }, { status: 400 });
    }

    // Get credentials from request or environment
    const vectorizerApiId = apiId || process.env.VECTORIZER_API_ID;
    const vectorizerApiSecret = apiSecret || process.env.VECTORIZER_API_SECRET;
    
    if (!vectorizerApiId || !vectorizerApiSecret) {
      return NextResponse.json({ error: 'Vectorizer.ai credentials not configured' }, { status: 500 });
    }

    console.log('Calling Vectorizer.ai...');
    
    // First, fetch the image and convert to base64
    let imageBuffer;
    if (imageUrl.startsWith('data:')) {
      // Already base64
      const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '');
      imageBuffer = Buffer.from(base64Data, 'base64');
    } else {
      // Fetch from URL
      const response = await fetch(imageUrl);
      const arrayBuffer = await response.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
    }
    
    // Create form data for Vectorizer.ai
    const FormData = require('form-data');
    const form = new FormData();
    form.append('image', imageBuffer, { filename: 'image.png', contentType: 'image/png' });
    form.append('format', 'svg');
    
    // Make request to Vectorizer.ai
    const res = await fetch('https://vectorizer.ai/api/v1/vectorize', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${vectorizerApiId}:${vectorizerApiSecret}`).toString('base64'),
        ...form.getHeaders()
      },
      body: form
    });
    
    const data = await res.json();
    console.log('Vectorizer.ai response status:', res.status);
    
    if (!res.ok) {
      return NextResponse.json({ 
        error: data.error || data.message || `Vectorizer.ai error: ${res.status}`, 
        details: data 
      }, { status: res.status });
    }
    
    // Vectorizer.ai returns the SVG directly
    const svg = data.result?.svg || data.svg;
    
    if (!svg) {
      return NextResponse.json({ 
        error: 'No SVG in response', 
        fullResponse: JSON.stringify(data).substring(0, 500)
      }, { status: 500 });
    }
    
    return NextResponse.json({ svg });
    
  } catch (e) {
    console.error('Vectorize error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}