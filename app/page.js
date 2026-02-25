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
    <div style={{ minHeight: '100vh', background: '#000000', color: '#FFFFFF' }}>
      {/* Header */}
      <header style={{ 
        borderBottom: '1px solid #333333', 
        padding: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ 
          fontFamily: 'Grotesk Nova, sans-serif', 
          fontSize: '1.5rem', 
          fontWeight: 400,
          margin: 0,
          letterSpacing: '0.05em'
        }}>
          VECTORVISION
        </h1>
        <span style={{ 
          fontFamily: 'Inter, sans-serif', 
          fontSize: '0.75rem', 
          color: '#C0C0C0',
          letterSpacing: '0.1em'
        }}>
          SCIENTIFIC VISUALIZATION
        </span>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem' }}>
        
        {/* Input Section */}
        <div style={{ marginBottom: '3rem' }}>
          <label style={{ 
            display: 'block',
            fontFamily: 'Grotesk Nova, sans-serif',
            fontSize: '0.875rem',
            color: '#C0C0C0',
            marginBottom: '0.75rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase'
          }}>
            Description
          </label>
          <textarea 
            value={prompt} 
            onChange={e => setPrompt(e.target.value)} 
            placeholder="Describe your visualization..."
            style={{ 
              width: '100%', 
              padding: '1.5rem', 
              border: '1px solid #333333',
              background: '#0a0a0a',
              color: '#FFFFFF',
              fontFamily: 'Inter, sans-serif',
              fontSize: '1rem',
              minHeight: '120px', 
              resize: 'vertical',
              outline: 'none'
            }} 
          />
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-end', marginBottom: '3rem' }}>
          <div style={{ flex: 1 }}>
            <label style={{ 
              display: 'block',
              fontFamily: 'Grotesk Nova, sans-serif',
              fontSize: '0.875rem',
              color: '#C0C0C0',
              marginBottom: '0.75rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase'
            }}>
              Style
            </label>
            <select 
              value={style} 
              onChange={e => setStyle(e.target.value)} 
              style={{ 
                width: '100%',
                padding: '1rem 1.5rem', 
                border: '1px solid #333333',
                background: '#0a0a0a',
                color: '#FFFFFF',
                fontFamily: 'Inter, sans-serif',
                fontSize: '1rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="watercolor">Watercolor Whimsical</option>
              <option value="scientific">Scientific Diagram</option>
              <option value="schematic">Technical Schematic</option>
              <option value="illustration">Detailed Illustration</option>
            </select>
          </div>
          
          <button 
            onClick={generate} 
            disabled={loading || !prompt}
            style={{ 
              padding: '1rem 3rem', 
              border: loading ? '1px solid #333333' : '1px solid #FFFFFF',
              background: loading ? '#0a0a0a' : '#FFFFFF',
              color: loading ? '#666666' : '#000000',
              fontFamily: 'Grotesk Nova, sans-serif',
              fontSize: '0.875rem',
              fontWeight: 500,
              letterSpacing: '0.1em',
              cursor: loading ? 'not-allowed' : 'pointer',
              textTransform: 'uppercase',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>

        {/* Status Log */}
        {log.length > 0 && (
          <div style={{ 
            background: '#0a0a0a', 
            border: '1px solid #333333', 
            padding: '1rem', 
            marginBottom: '2rem',
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#C0C0C0'
          }}>
            {log.map((l, i) => <div key={i} style={{ marginBottom: '4px' }}>{l}</div>)}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ 
            border: '1px solid #ff3333', 
            padding: '1rem', 
            marginBottom: '2rem',
            color: '#ff3333',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        {/* Result */}
        {image && (
          <div style={{ border: '1px solid #333333' }}>
            <img 
              src={image} 
              alt="Generated" 
              style={{ 
                width: '100%', 
                display: 'block',
                borderBottom: '1px solid #333333'
              }} 
            />
            <div style={{ padding: '1rem', textAlign: 'center', color: '#C0C0C0', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem' }}>
              ✓ Image generated
            </div>
          </div>
        )}

        {/* Empty State */}
        {!image && !loading && !error && (
          <div style={{ 
            border: '1px solid #333333', 
            padding: '4rem 2rem', 
            textAlign: 'center',
            color: '#666666',
            fontFamily: 'Inter, sans-serif'
          }}>
            <p>Enter a description and click Generate</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ 
        borderTop: '1px solid #333333', 
        padding: '2rem',
        textAlign: 'center',
        fontFamily: 'Inter, sans-serif',
        fontSize: '0.75rem',
        color: '#666666'
      }}>
        VECTORVISION — FORM FOLLOWS FUNCTION
      </footer>
    </div>
  );
}