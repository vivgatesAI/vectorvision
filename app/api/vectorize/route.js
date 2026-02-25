import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { imageUrl } = await request.json();
    
    if (!imageUrl) {
      return NextResponse.json({ error: 'No image URL provided' }, { status: 400 });
    }

    console.log('Processing image for vectorization...');
    
    // The actual vectorization will be done client-side
    // This endpoint serves the image as base64 for client-side processing
    let imageBase64;
    
    if (imageUrl.startsWith('data:')) {
      imageBase64 = imageUrl;
    } else {
      const response = await fetch(imageUrl);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      imageBase64 = `data:image/png;base64,${buffer.toString('base64')}`;
    }
    
    // Return the image for client-side processing
    return NextResponse.json({ 
      imageBase64,
      message: 'Use client-side vectorization'
    });
    
  } catch (e) {
    console.error('Error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}