import { NextResponse } from 'next/server';
import potrace from 'potrace';

export async function POST(request) {
  try {
    const { imageUrl } = await request.json();
    
    if (!imageUrl) {
      return NextResponse.json({ error: 'No image URL provided' }, { status: 400 });
    }

    console.log('Vectorizing image...');
    
    // Get image as buffer
    let buffer;
    if (imageUrl.startsWith('data:')) {
      const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '');
      buffer = Buffer.from(base64Data, 'base64');
    } else {
      const response = await fetch(imageUrl);
      const arrayBuffer = await response.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }
    
    console.log('Image buffer:', buffer.length, 'bytes');
    
    // Use potrace to vectorize
    const svg = await new Promise((resolve, reject) => {
      potrace.trace(buffer, {
        turdSize: 10,
        alphaMax: 1,
        opticTolerance: 0.2,
        blackThreshold: 0,
        color: '#FF6B6B',
        backgroundColor: '#FFFFFF'
      }, (err, svg) => {
        if (err) reject(err);
        else resolve(svg);
      });
    });
    
    console.log('Vectorization complete, SVG length:', svg.length);
    
    return NextResponse.json({ svg });
    
  } catch (e) {
    console.error('Vectorization error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}