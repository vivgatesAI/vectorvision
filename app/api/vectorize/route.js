import { NextResponse } from 'next/server';
import ImageTracer from 'imagetracerjs';

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
    
    // Vectorize using ImageTracer
    const svg = ImageTracer.imagedataToSVG(
      imageBase64,
      {
        ltres: 1,
        qtres: 1,
        pathomit: 8,
        colorsampling: 2,
        numberofcolors: 8,
        mincolorratio: 0,
        colorquantcycles: 3,
        scale: 1,
        simplifytolerance: 0,
        blurradius: 0,
        blurdelta: 10,
        strokewidth: 0,
        linefilters: false
      }
    );
    
    console.log('Vectorization complete, SVG length:', svg.length);
    
    return NextResponse.json({ svg });
    
  } catch (e) {
    console.error('Vectorization error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}