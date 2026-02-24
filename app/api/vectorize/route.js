import { NextResponse } from 'next/server';
import potrace from 'potrace';
import sharp from 'sharp';
import fetch from 'node-fetch';

export async function POST(request) {
  try {
    const { imageUrl, options = {} } = await request.json();
    
    // Download the image
    let imageBuffer;
    if (imageUrl.startsWith('http')) {
      const response = await fetch(imageUrl);
      imageBuffer = await response.buffer();
    } else if (imageUrl.startsWith('data:')) {
      const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '');
      imageBuffer = Buffer.from(base64Data, 'base64');
    } else {
      return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 });
    }
    
    // Process image: resize, grayscale, get raw bitmap data
    const { data, info } = await sharp(imageBuffer)
      .resize(600, 600, { fit: 'inside', background: { r: 255, g: 255, b: 255 } })
      .grayscale()
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    // Create bitmap array for potrace (0 = white, 1 = black)
    const bitmap = [];
    for (let y = 0; y < info.height; y++) {
      const row = [];
      for (let x = 0; x < info.width; x++) {
        const pixel = data[y * info.width + x];
        // Invert: make dark areas into traces
        row.push(pixel < 128 ? 1 : 0);
      }
      bitmap.push(row);
    }
    
    // Trace with multiple parameters for detailed extraction
    const trace = (params) => new Promise((resolve, reject) => {
      potrace.trace(bitmap, params, (err, svg) => {
        if (err) reject(err);
        else resolve(svg);
      });
    });
    
    // Get main outline
    const mainSvg = await trace({
      turdSize: 5,
      alphaMax: 1,
      opticTolerance: 0.2,
      blackThreshold: 0,
      fillColor: '#ff6b35',
      backgroundColor: 'transparent'
    });
    
    // Create color-segmented components
    // Process different threshold levels to get multiple layers
    const thresholdLevels = [80, 100, 140, 180];
    const colors = ['#ff6b35', '#4ecdc4', '#ffe66d', '#aa96da'];
    
    let componentSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${info.width} ${info.height}">`;
    componentSvg += `<defs><style>.comp{fill-opacity:0.8;stroke:none;}</style></defs>`;
    
    const components = [];
    
    for (let i = 0; i < Math.min(thresholdLevels.length, 4); i++) {
      const thresh = thresholdLevels[i];
      
      // Create bitmap for this threshold
      const layerBitmap = [];
      for (let y = 0; y < info.height; y++) {
        const row = [];
        for (let x = 0; x < info.width; x++) {
          const pixel = data[y * info.width + x];
          row.push(pixel < thresh ? 1 : 0);
        }
        layerBitmap.push(row);
      }
      
      try {
        const layerSvg = await new Promise((resolve, reject) => {
          potrace.trace(layerBitmap, {
            turdSize: 10,
            alphaMax: 1,
            opticTolerance: 0.3,
            blackThreshold: 0,
            fillColor: colors[i],
            backgroundColor: 'transparent'
          }, (err, svg) => {
            if (err) reject(err);
            else resolve(svg);
          });
        });
        
        if (layerSvg && layerSvg.length > 100) {
          // Extract just the path data
          const pathMatch = layerSvg.match(/<path[^>]*d="([^"]*)"[^>]*>/);
          if (pathMatch) {
            componentSvg += `<path id="component-${i + 1}" class="comp" d="${pathMatch[1]}" fill="${colors[i]}"/>`;
            components.push({
              id: i + 1,
              type: 'path',
              color: colors[i],
              threshold: thresh
            });
          }
        }
      } catch (e) {
        console.log(`Threshold ${thresh} failed:`, e.message);
      }
    }
    
    componentSvg += '</svg>';
    
    // If no components extracted, use main trace
    if (components.length === 0) {
      componentSvg = mainSvg;
      components.push({
        id: 1,
        type: 'path',
        color: '#ff6b35',
        threshold: 128
      });
    }
    
    return NextResponse.json({
      svg: componentSvg,
      components: components,
      dimensions: { width: info.width, height: info.height }
    });
    
  } catch (error) {
    console.error('Vectorization error:', error);
    return NextResponse.json({ 
      error: error.message,
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="50" y="50" text-anchor="middle" fill="red">Error: ${error.message}</text></svg>`,
      components: []
    }, { status: 500 });
  }
}