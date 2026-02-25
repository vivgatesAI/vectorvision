'use client';
import { useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('watercolor');
  const [image, setImage] = useState(null);
  const [svg, setSvg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [vectorizing, setVectorizing] = useState(false);
  const [error, setError] = useState(null);
  const [log, setLog] = useState([]);

  const addLog = (msg) => setLog(l => [...l, msg]);

  const generate = async () => {
    if (!prompt) return;
    setLoading(true);
    setError(null);
    setImage(null);
    setSvg(null);
    setLog([]);
    
    addLog('Starting');
    
    try {
      addLog('Generating');
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style })
      });
      
      const data = await res.json();
      
      if (res.ok && data.imageUrl) {
        setImage(data.imageUrl);
        addLog('Done');
      } else {
        setError(data.error || 'Error');
        addLog('Error');
      }
    } catch (e) {
      setError(e.message);
      addLog('Error');
    }
    
    setLoading(false);
  };

  const vectorize = async () => {
    if (!image) return;
    
    setVectorizing(true);
    setError(null);
    addLog('Vectorizing');
    
    try {
      const res = await fetch('/api/vectorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: image })
      });
      
      const data = await res.json();
      
      if (res.ok && data.svg) {
        setSvg(data.svg);
        addLog('Complete');
      } else {
        setError(data.error || 'Error');
      }
    } catch (e) {
      setError(e.message);
    }
    
    setVectorizing(false);
  };

  const downloadSVG = () => {
    if (!svg) return;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vector.svg';
    a.click();
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#FFFFFF', 
      color: '#000000',
      fontFamily: 'Inter, Helvetica Neue, Arial, sans-serif'
    }}>
      {/* Header */}
      <header style={{ 
        padding: '3rem 2rem',
        borderBottom: '1px solid #E0E0E0',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 300,
          margin: 0,
          letterSpacing: '0.3em',
          textTransform: 'uppercase'
        }}>
          VectorVision
        </h1>
      </header>

      {/* Main */}
      <main style={{ 
        maxWidth: '600px', 
        margin: '0 auto', 
        padding: '4rem 2rem' 
      }}>
        
        {/* Input */}
        <div style={{ marginBottom: '3rem' }}>
          <textarea 
            value={prompt} 
            onChange={e => setPrompt(e.target.value)} 
            placeholder="Describe your visualization"
            style={{ 
              width: '100%', 
              padding: '1.5rem', 
              border: '1px solid #E0E0E0',
              borderRadius: '0',
              background: '#FFFFFF',
              color: '#000000',
              fontSize: '1rem',
              fontFamily: 'inherit',
              minHeight: '120px', 
              resize: 'vertical',
              outline: 'none',
              fontWeight: 300
            }} 
          />
        </div>

        {/* Controls */}
        <div style={{ 
          display: 'flex', 
          gap: '2rem', 
          alignItems: 'center',
          marginBottom: '4rem'
        }}>
          <select 
            value={style} 
            onChange={e => setStyle(e.target.value)} 
            style={{ 
              flex: 1,
              padding: '1rem 0', 
              border: 'none',
              borderBottom: '1px solid #E0E0E0',
              background: 'transparent',
              color: '#000000',
              fontSize: '0.875rem',
              fontFamily: 'inherit',
              cursor: 'pointer',
              outline: 'none',
              fontWeight: 300
            }}
          >
            <option value="watercolor">Watercolor Whimsical</option>
            <option value="scientific">Scientific Diagram</option>
            <option value="schematic">Technical Schematic</option>
            <option value="illustration">Detailed Illustration</option>
          </select>
          
          <button 
            onClick={generate} 
            disabled={loading || !prompt}
            style={{ 
              padding: '1rem 3rem', 
              border: '1px solid #000000',
              borderRadius: '0',
              background: loading ? '#F8F8F8' : '#000000',
              color: loading ? '#999' : '#FFFFFF',
              fontSize: '0.75rem',
              fontFamily: 'inherit',
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontWeight: 300
            }}
          >
            {loading ? 'Creating' : 'Create'}
          </button>
        </div>

        {/* Status */}
        {log.length > 0 && (
          <div style={{ 
            padding: '1rem 0',
            marginBottom: '2rem',
            fontSize: '0.75rem',
            color: '#333333',
            letterSpacing: '0.1em'
          }}>
            {log.map((l, i) => <span key={i}>{l} </span>)}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ 
            padding: '1rem',
            marginBottom: '2rem',
            border: '1px solid #E0E0E0',
            fontSize: '0.75rem',
            color: '#333333'
          }}>
            {error}
          </div>
        )}

        {/* Result - Image */}
        {image && (
          <div style={{ marginBottom: '2rem' }}>
            <img 
              src={image} 
              alt="Generated" 
              style={{ width: '100%', display: 'block' }} 
            />
            <div style={{ 
              padding: '1.5rem 0',
              display: 'flex',
              gap: '2rem',
              borderBottom: '1px solid #E0E0E0'
            }}>
              <button 
                onClick={vectorize}
                disabled={vectorizing}
                style={{ 
                  padding: '0.75rem 0', 
                  border: 'none',
                  background: 'transparent',
                  color: '#000000',
                  fontSize: '0.75rem',
                  fontFamily: 'inherit',
                  cursor: vectorizing ? 'not-allowed' : 'pointer',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase'
                }}
              >
                {vectorizing ? 'Processing' : 'Vectorize'}
              </button>
              
              <button 
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = image;
                  a.download = 'image.png';
                  a.click();
                }}
                style={{ 
                  padding: '0.75rem 0', 
                  border: 'none',
                  background: 'transparent',
                  color: '#333333',
                  fontSize: '0.75rem',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase'
                }}
              >
                PNG
              </button>
            </div>
          </div>
        )}

        {/* Result - SVG */}
        {svg && (
          <div style={{ marginBottom: '2rem' }}>
            <div 
              dangerouslySetInnerHTML={{ __html: svg }}
              style={{ padding: '1rem', background: '#F8F8F8' }}
            />
            <div style={{ padding: '1.5rem 0', borderBottom: '1px solid #E0E0E0' }}>
              <button 
                onClick={downloadSVG}
                style={{ 
                  padding: '0.75rem 0', 
                  border: 'none',
                  background: 'transparent',
                  color: '#000000',
                  fontSize: '0.75rem',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase'
                }}
              >
                Download SVG
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!image && !loading && (
          <div style={{ 
            padding: '4rem 0', 
            textAlign: 'center',
            color: '#E0E0E0',
            fontSize: '0.875rem',
            letterSpacing: '0.1em'
          }}>
            Describe what you want to create
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ 
        padding: '2rem',
        textAlign: 'center',
        fontSize: '0.625rem',
        color: '#E0E0E0',
        letterSpacing: '0.2em',
        textTransform: 'uppercase'
      }}>
        Form follows function
      </footer>
    </div>
  );
}