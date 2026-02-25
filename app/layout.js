export const metadata = { 
  title: 'VectorVision', 
  description: 'AI Scientific Visualization'
};

export default function Root({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ 
        margin: 0, 
        padding: 0,
        background: '#FFFBF5', 
        color: '#2D3436',
        fontFamily: 'Nunito, sans-serif',
        minHeight: '100vh'
      }}>
        {children}
      </body>
    </html>
  );
}