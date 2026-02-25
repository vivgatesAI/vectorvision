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
        <link href="https://fonts.googleapis.com/css2?family=Grotesk+Nova:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body style={{ 
        margin: 0, 
        padding: 0,
        background: '#000000', 
        color: '#FFFFFF',
        fontFamily: 'Inter, sans-serif',
        minHeight: '100vh'
      }}>
        {children}
      </body>
    </html>
  );
}