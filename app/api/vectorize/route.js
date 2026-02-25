import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { imageUrl } = await request.json();
    
    if (!imageUrl) {
      return NextResponse.json({ error: 'No image URL provided' }, { status: 400 });
    }

    console.log('Vectorizing image...');
    
    // Get image as base64
    let imageBase64;
    if (imageUrl.startsWith('data:')) {
      imageBase64 = imageUrl;
    } else {
      const response = await fetch(imageUrl);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      imageBase64 = `data:image/png;base64,${buffer.toString('base64')}`;
    }
    
    console.log('Image loaded, tracing...');
    
    // Dynamic import to avoid build issues
    const ImageTracer = require('imagetracerjs');
    
    // Vectorize using ImageTracer with options for better quality
    const svg = ImageTracer.imagedataToSVG(
      imageBase64,
      {
        ltres: 0.1,
        qtres: 0.1,
        pathomit: 20,
        colorsampling: 2,
        numberofcolors: 16,
        mincolorratio: 0.02,
        colorquantcycles: 3,
        scale: 1,
        simplifytolerance: 0,
        blurradius: 0,
        blurdelta: 20,
        strokewidth: 0,
        linefilters: false
      }
    );
    
    console.log('Vectorization complete, SVG length:', svg.length);
    
    return NextResponse.json({ svg });
    
  } catch (e) {
    console.error('Vectorization error:', e);
    return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
  }
}