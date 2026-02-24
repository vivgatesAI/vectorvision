export const metadata = { title: 'VectorVision - AI Scientific Visualization' };
export default function Root({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, fontFamily: 'Inter, sans-serif', background: '#0a0a0f', color: '#fff' }}>{children}</body>
    </html>
  );
}