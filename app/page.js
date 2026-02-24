'use client';
import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('watercolor');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [svgData, setSvgData] = useState(null);
  const [components, setComponents] = useState([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [vectorizing, setVectorizing] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');

  const generate = async () => {
    if (!prompt) return;
    setLoading(true);
    setActiveTab('generate');
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style })
      });
      const data = await res.json();
      if (data.imageUrl) {
        setImage(data.imageUrl);
        // Auto-vectorize
        vectorizeImage(data.imageUrl);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const vectorizeImage = async (imgUrl) => {
    setVectorizing(true);
    try {
      const res = await fetch('/api/vectorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: imgUrl })
      });
      const data = await res.json();
      if (data.svg) {
        setSvgData(data.svg);
        setComponents(data.components || []);
        setDimensions(data.dimensions || { width: 600, height: 600 });
        setActiveTab('editor');
      }
    } catch (e) { console.error(e); }
    setVectorizing(false);
  };

  const updateComponent = (id, updates) => {
    if (!svgData) return;
    
    const newComponents = components.map(c => {
      if (c.id === id) {
        return { ...c, ...updates };
      }
      return c;
    });
    setComponents(newComponents);
    
    // Rebuild SVG with updated colors
    let newSvg = svgData;
    if (updates.color) {
      newSvg = newSvg.replace(
        new RegExp(`id="component-${id}"[^>]*fill="[^"]*"`, 'g'),
        `id="component-${id}" fill="${updates.color}"`
      );
    }
    if (updates.opacity !== undefined) {
      newSvg = newSvg.replace(
        new RegExp(`id="component-${id}"[^>]*fill-opacity="[^"]*"`, 'g'),
        `id="component-${id}" fill-opacity="${updates.opacity}"`
      );
    }
    setSvgData(newSvg);
  };

  const downloadSVG = () => {
    if (!svgData) return;
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vectorvision-export.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPNG = async () => {
    if (!image) return;
    const a = document.createElement('a');
    a.href = image;
    a.download = 'vectorvision-original.png';
    a.click();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff' }}>
      <header style={{ textAlign: 'center', padding: '2rem', borderBottom: '1px solid #222' }}>
        <h1 style={{ fontSize: '2.5rem', margin: 0, background: 'linear-gradient(135deg,#ff6b35,#4ecdc4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>VectorVision</h1>
        <p style={{ color: '#888', margin: '0.5rem 0 0' }}>AI Scientific Visualization → Editable Vector Graphics</p>
      </header>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        {/* Input Section */}
        <div style={{ background: '#16161a', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <input 
              value={prompt} 
              onChange={e => setPrompt(e.target.value)} 
              placeholder="Describe your scientific visualization (e.g., 'DNA double helix with base pairs')" 
              style={{ flex: '1 1 400px', padding: '1rem', borderRadius: '8px', border: '1px solid #333', background: '#0a0a0f', color: '#fff', fontSize: '1rem' }} 
            />
            <select 
              value={style} 
              onChange={e => setStyle(e.target.value)} 
              style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #333', background: '#0a0a0f', color: '#fff', minWidth: '150px' }}
            >
              <option value="watercolor">🎨 Watercolor Whimsical</option>
              <option value="scientific">🔬 Scientific Diagram</option>
              <option value="schematic">📐 Technical Schematic</option>
              <option value="illustration">✏️ Detailed Illustration</option>
            </select>
            <button 
              onClick={generate} 
              disabled={loading || !prompt} 
              style={{ padding: '1rem 2rem', borderRadius: '8px', border: 'none', background: loading ? '#666' : 'linear-gradient(135deg,#ff6b35,#4ecdc4)', color: '#fff', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', minWidth: '140px' }}
            >
              {loading ? '⏳ Generating...' : '✨ Generate'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        {image && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button onClick={() => setActiveTab('generate')} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px 8px 0 0', border: 'none', background: activeTab === 'generate' ? '#16161a' : '#111', color: activeTab === 'generate' ? '#fff' : '#666', cursor: 'pointer' }}>Generated Image</button>
            <button onClick={() => setActiveTab('editor')} disabled={!svgData} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px 8px 0 0', border: 'none', background: activeTab === 'editor' ? '#16161a' : '#111', color: activeTab === 'editor' ? '#fff' : '#666', cursor: svgData ? 'pointer' : 'not-allowed' }}>Vector Editor {vectorizing && '(Processing...)'}</button>
          </div>
        )}

        {/* Content */}
        {activeTab === 'generate' && image && (
          <div style={{ background: '#16161a', borderRadius: '0 16px 16px 16px', padding: '2rem', textAlign: 'center' }}>
            <img src={image} alt="Generated" style={{ maxWidth: '100%', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }} />
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={() => vectorizeImage(image)} disabled={vectorizing} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #4ecdc4', background: 'transparent', color: '#4ecdc4', fontWeight: '600', cursor: vectorizing ? 'not-allowed' : 'pointer' }}>
                {vectorizing ? '⏳ Vectorizing...' : '🔄 Vectorize & Edit'}
              </button>
              <button onClick={downloadPNG} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: '#333', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>⬇️ Download PNG</button>
            </div>
          </div>
        )}

        {activeTab === 'editor' && svgData && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', background: '#16161a', borderRadius: '0 16px 16px 16px', padding: '2rem' }}>
            {/* SVG Preview */}
            <div style={{ background: '#0a0a0f', borderRadius: '12px', padding: '1rem', minHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div 
                dangerouslySetInnerHTML={{ __html: svgData }} 
                style={{ maxWidth: '100%', maxHeight: '600px' }}
              />
            </div>
            
            {/* Components Panel */}
            <div>
              <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>🎨 Components ({components.length})</h3>
              <p style={{ color: '#666', fontSize: '0.875rem', marginBottom: '1rem' }}>Click color to edit each component</p>
              
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {components.map(comp => (
                  <div key={comp.id} style={{ padding: '1rem', marginBottom: '0.75rem', background: '#0a0a0f', borderRadius: '8px', border: '1px solid #333' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ fontWeight: '600' }}>Component {comp.id}</span>
                      <input
                        type="color"
                        value={comp.color || '#ff6b35'}
                        onChange={e => updateComponent(comp.id, { color: e.target.value })}
                        style={{ width: '40px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'transparent' }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#666' }}>Opacity:</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        defaultValue="0.8"
                        onChange={e => updateComponent(comp.id, { opacity: parseFloat(e.target.value) })}
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              {components.length === 0 && (
                <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>No components extracted yet</p>
              )}
              
              <button 
                onClick={downloadSVG} 
                style={{ width: '100%', marginTop: '1rem', padding: '1rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#4ecdc4,#45b7aa)', color: '#000', fontWeight: '700', fontSize: '1rem', cursor: 'pointer' }}
              >
                ⬇️ Export SVG
              </button>
            </div>
          </div>
        )}

        {!image && !loading && (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#666', background: '#16161a', borderRadius: '16px' }}>
            <p style={{ fontSize: '1.25rem' }}>Enter a description above and click Generate to create your scientific visualization</p>
            <p style={{ marginTop: '1rem', fontSize: '0.875rem' }}>Then click "Vectorize & Edit" to extract and modify vector components</p>
          </div>
        )}
      </div>
    </div>
  );
}