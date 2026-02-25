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

  const colors = {
    primary: '#FF6B6B',
    secondary: '#4ECDC4',
    accent: '#45B7D1',
    warm: '#FFA07A',
    soft: '#98D8C8'
  };

  const addLog = (msg) => setLog(l => [...l, `${new Date().toLocaleTimeString()}: ${msg}`]);

  const generate = async () => {
    if (!prompt) return;
    setLoading(true);
    setError(null);
    setImage(null);
    setSvg(null);
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
      
      if (res.ok && data.imageUrl) {
        setImage(data.imageUrl);
        addLog('Image generated successfully! ✨');
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

  const vectorize = async () => {
    if (!image) return;
    
    setVectorizing(true);
    setError(null);
    addLog('Starting vectorization...');
    
    try {
      addLog('Processing image with ImageTracer...');
      const res = await fetch('/api/vectorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: image })
      });
      
      const data = await res.json();
      addLog(`Response status: ${res.status}`);
      
      if (res.ok && data.svg) {
        setSvg(data.svg);
        addLog('Vectorization complete! 🎉');
      } else {
        setError(data.error || 'Failed to vectorize');
        addLog(`Error: ${data.error}`);
      }
    } catch (e) {
      setError(e.message);
      addLog(`Exception: ${e.message}`);
    }
    
    setVectorizing(false);
  };

  const downloadSVG = () => {
    if (!svg) return;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vectorvision-vector.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#FFFBF5', 
      color: '#2D3436',
      fontFamily: 'Nunito, sans-serif'
    }}>
      {/* Decorative Header Shapes */}
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        height: '200px', 
        background: `linear-gradient(135deg, ${colors.primary}15 0%, ${colors.secondary}15 100%)`,
        zIndex: 0,
        borderRadius: '0 0 50% 50% / 0 0 30px 30px'
      }} />
      
      {/* Floating Decorations */}
      <div style={{ position: 'fixed', top: '10%', left: '5%', fontSize: '40px', opacity: 0.3, zIndex: 0 }}>🎨</div>
      <div style={{ position: 'fixed', top: '20%', right: '8%', fontSize: '30px', opacity: 0.3, zIndex: 0 }}>✏️</div>
      <div style={{ position: 'fixed', bottom: '15%', left: '10%', fontSize: '25px', opacity: 0.3, zIndex: 0 }}>🖌️</div>
      <div style={{ position: 'fixed', bottom: '20%', right: '5%', fontSize: '35px', opacity: 0.3, zIndex: 0 }}>📐</div>

      {/* Header */}
      <header style={{ 
        position: 'relative',
        zIndex: 1,
        padding: '2rem',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          fontFamily: 'Fredoka One, cursive', 
          fontSize: '3rem', 
          margin: 0,
          color: colors.primary,
          textShadow: '3px 3px 0 ' + colors.secondary,
          letterSpacing: '2px'
        }}>
          ✨ VectorVision ✨
        </h1>
        <p style={{ 
          fontFamily: 'Nunito, sans-serif', 
          fontSize: '1.1rem', 
          color: '#636E72',
          marginTop: '0.5rem'
        }}>
          Create magical illustrations → Convert to Vector SVG
        </p>
      </header>

      {/* Main Content */}
      <main style={{ 
        position: 'relative',
        zIndex: 1,
        maxWidth: '700px', 
        margin: '0 auto', 
        padding: '0 1.5rem 3rem' 
      }}>
        
        {/* Input Card */}
        <div style={{ 
          background: '#FFFFFF',
          borderRadius: '24px',
          padding: '2rem',
          marginBottom: '1.5rem',
          boxShadow: '8px 8px 0 ' + colors.secondary,
          border: '3px solid #2D3436'
        }}>
          <label style={{ 
            display: 'block',
            fontFamily: 'Fredoka One, cursive',
            fontSize: '1.2rem',
            color: colors.accent,
            marginBottom: '0.75rem'
          }}>
            🎯 What would you like to create?
          </label>
          <textarea 
            value={prompt} 
            onChange={e => setPrompt(e.target.value)} 
            placeholder="A beautiful diagram of a flower cell with colorful organelles..."
            style={{ 
              width: '100%', 
              padding: '1rem', 
              border: '3px solid #DFE6E9',
              borderRadius: '16px',
              background: '#F8F9FA',
              color: '#2D3436',
              fontFamily: 'Nunito, sans-serif',
              fontSize: '1rem',
              minHeight: '100px', 
              resize: 'vertical',
              outline: 'none'
            }} 
          />
        </div>

        {/* Controls */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          alignItems: 'flex-end',
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ 
              display: 'block',
              fontFamily: 'Fredoka One, cursive',
              fontSize: '1rem',
              color: colors.warm,
              marginBottom: '0.5rem'
            }}>
              🎨 Style
            </label>
            <select 
              value={style} 
              onChange={e => setStyle(e.target.value)} 
              style={{ 
                width: '100%',
                padding: '1rem', 
                border: '3px solid #DFE6E9',
                borderRadius: '16px',
                background: '#FFFFFF',
                color: '#2D3436',
                fontFamily: 'Nunito, sans-serif',
                fontSize: '1rem',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="watercolor">🌸 Watercolor Whimsical</option>
              <option value="scientific">🔬 Scientific Diagram</option>
              <option value="schematic">📐 Technical Schematic</option>
              <option value="illustration">✏️ Detailed Illustration</option>
            </select>
          </div>
          
          <button 
            onClick={generate} 
            disabled={loading || !prompt}
            style={{ 
              padding: '1rem 2.5rem', 
              border: '3px solid #2D3436',
              borderRadius: '16px',
              background: loading ? '#DFE6E9' : colors.primary,
              color: loading ? '#636E72' : '#FFFFFF',
              fontFamily: 'Fredoka One, cursive',
              fontSize: '1.2rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '4px 4px 0 #2D3436',
              transform: loading ? 'none' : 'translate(-2px, -2px)',
              transition: 'all 0.2s'
            }}
          >
            {loading ? '⏳ Making magic...' : '🚀 Create!'}
          </button>
        </div>

        {/* Status Log */}
        {log.length > 0 && (
          <div style={{ 
            background: '#FFFFFF', 
            border: '2px dashed ' + colors.soft, 
            borderRadius: '16px', 
            padding: '1rem', 
            marginBottom: '1.5rem',
            fontFamily: 'monospace',
            fontSize: '13px',
            color: '#636E72'
          }}>
            {log.map((l, i) => (
              <div key={i} style={{ marginBottom: '4px', color: colors.secondary }}>
                {l}
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ 
            background: '#FFE5E5',
            border: '2px solid ' + colors.primary,
            borderRadius: '16px', 
            padding: '1rem', 
            marginBottom: '1.5rem',
            color: colors.primary,
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 600
          }}>
            😢 {error}
          </div>
        )}

        {/* Result - Generated Image */}
        {image && (
          <div style={{ 
            background: '#FFFFFF',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '8px 8px 0 ' + colors.accent,
            border: '3px solid #2D3436',
            marginBottom: '1.5rem'
          }}>
            <img 
              src={image} 
              alt="Generated" 
              style={{ 
                width: '100%', 
                display: 'block'
              }} 
            />
            <div style={{ 
              padding: '1.5rem', 
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button 
                onClick={vectorize}
                disabled={vectorizing}
                style={{ 
                  padding: '1rem 2rem', 
                  border: '3px solid #2D3436',
                  borderRadius: '16px',
                  background: vectorizing ? '#DFE6E9' : colors.secondary,
                  color: '#FFFFFF',
                  fontFamily: 'Fredoka One, cursive',
                  fontSize: '1rem',
                  cursor: vectorizing ? 'not-allowed' : 'pointer',
                  boxShadow: vectorizing ? 'none' : '4px 4px 0 #2D3436'
                }}
              >
                {vectorizing ? '🔄 Vectorizing...' : '📐 Vectorize to SVG'}
              </button>
              
              <button 
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = image;
                  a.download = 'vectorvision-original.png';
                  a.click();
                }}
                style={{ 
                  padding: '1rem 2rem', 
                  border: '3px solid #2D3436',
                  borderRadius: '16px',
                  background: '#FFFFFF',
                  color: '#2D3436',
                  fontFamily: 'Fredoka One, cursive',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '4px 4px 0 #2D3436'
                }}
              >
                ⬇️ Download PNG
              </button>
            </div>
          </div>
        )}

        {/* Result - Vectorized SVG */}
        {svg && (
          <div style={{ 
            background: '#FFFFFF',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '8px 8px 0 ' + colors.primary,
            border: '3px solid #2D3436',
            marginBottom: '1.5rem'
          }}>
            <div style={{ 
              padding: '1rem', 
              background: '#F8F9FA',
              borderBottom: '2px solid #DFE6E9',
              fontFamily: 'Fredoka One',
              color: colors.secondary
            }}>
              🎉 Vectorized SVG Ready! (Editable vector paths)
            </div>
            <div 
              dangerouslySetInnerHTML={{ __html: svg }}
              style={{ 
                padding: '1rem',
                background: '#FFFFFF',
                maxHeight: '400px',
                overflow: 'auto'
              }}
            />
            <div style={{ 
              padding: '1.5rem', 
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center'
            }}>
              <button 
                onClick={downloadSVG}
                style={{ 
                  padding: '1rem 2rem', 
                  border: '3px solid #2D3436',
                  borderRadius: '16px',
                  background: colors.primary,
                  color: '#FFFFFF',
                  fontFamily: 'Fredoka One, cursive',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '4px 4px 0 #2D3436'
                }}
              >
                ⬇️ Download SVG
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!image && !loading && !error && (
          <div style={{ 
            border: '3px dashed #DFE6E9', 
            borderRadius: '24px', 
            padding: '3rem 2rem', 
            textAlign: 'center',
            color: '#636E72',
            fontFamily: 'Nunito, sans-serif'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌈</div>
            <p style={{ fontSize: '1.1rem' }}>
              Tell me what you want to create<br/>
              and I'll make it come to life!
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ 
        position: 'relative',
        zIndex: 1,
        padding: '2rem',
        textAlign: 'center',
        fontFamily: 'Nunito, sans-serif',
        fontSize: '0.9rem',
        color: '#636E72'
      }}>
        Made with <span style={{ color: colors.primary }}>❤️</span> and <span style={{ color: colors.secondary }}>✨</span>
      </footer>
    </div>
  );
}