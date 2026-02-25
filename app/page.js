'use client';
import { useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('watercolor');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [log, setLog] = useState([]);

  const addLog = (msg) => setLog(l => [...l, `${new Date().toLocaleTimeString()}: ${msg}`]);

  const generate = async () => {
    if (!prompt) return;
    setLoading(true);
    setError(null);
    setImage(null);
    setLog([]);
    
    addLog('Starting generation...');
    
    try {
      addLog('Calling Venice API...');
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style })
      });
      
      const data = await res.json();
      addLog(`Response status: ${res.status}`);
      addLog(`Response: ${JSON.stringify(data).substring(0, 200)}`);
      
      if (res.ok && data.imageUrl) {
        setImage(data.imageUrl);
        addLog('Image generated successfully!');
      } else {
        setError(data.error || 'Failed to generate image');
        addLog(`Error: ${data.error}`);
      }
    } catch (e) {
      setError(e.message);
      addLog(`Exception: ${e.message}`);
    }
    
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff', padding: '2rem', fontFamily: 'system-ui' }}>
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', margin: 0, background: 'linear-gradient(135deg,#ff6b35,#4ecdc4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>VectorVision</h1>
        <p style={{ color: '#888', margin: '0.5rem 0 0' }}>AI Scientific Visualization → Editable Vectors</p>
      </header>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ background: '#16161a', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <textarea 
            value={prompt} 
            onChange={e => setPrompt(e.target.value)} 
            placeholder="Describe your scientific visualization (e.g., 'A detailed diagram of a plant cell with organelles')" 
            style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #333', background: '#0a0a0f', color: '#fff', fontSize: '1rem', minHeight: '100px', resize: 'vertical' }} 
          />
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <select 
              value={style} 
              onChange={e => setStyle(e.target.value)} 
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #333', background: '#0a0a0f', color: '#fff' }}
            >
              <option value="watercolor">🎨 Watercolor Whimsical</option>
              <option value="scientific">🔬 Scientific Diagram</option>
              <option value="schematic">📐 Technical Schematic</option>
            </select>
            
            <button 
              onClick={generate} 
              disabled={loading || !prompt} 
              style={{ padding: '0.75rem 2rem', borderRadius: '8px', border: 'none', background: loading ? '#666' : 'linear-gradient(135deg,#ff6b35,#4ecdc4)', color: '#fff', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? '⏳ Generating...' : '✨ Generate'}
            </button>
          </div>
        </div>

        {/* Status Log */}
        {log.length > 0 && (
          <div style={{ background: '#111', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', fontSize: '12px', fontFamily: 'monospace' }}>
            {log.map((l, i) => <div key={i} style={{ color: '#4ecdc4', marginBottom: '4px' }}>{l}</div>)}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: '#3a1a1a', border: '1px solid #f00', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', color: '#ff6b6b' }}>
            Error: {error}
          </div>
        )}

        {/* Result */}
        {image && (
          <div style={{ background: '#16161a', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
            <img src={image} alt="Generated" style={{ maxWidth: '100%', borderRadius: '8px' }} />
            <p style={{ color: '#4ecdc4', marginTop: '1rem' }}>✅ Image generated! (Vectorize feature coming soon)</p>
          </div>
        )}

        {!image && !loading && !error && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666', background: '#16161a', borderRadius: '12px' }}>
            <p>Enter a description above and click Generate</p>
          </div>
        )}
      </div>
    </div>
  );
}