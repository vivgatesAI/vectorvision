# VectorVision

AI-powered scientific visualization generator with vector extraction and editing capabilities.

## Features

- **AI Image Generation**: Using Venice API's nano-banana-pro model
- **Scientific Visualization Styles**: Watercolor, Scientific Diagram, Technical Schematic
- **Vector Extraction**: Convert generated images to editable SVG components
- **Component Editing**: Modify colors, opacity of individual elements

## Setup

```bash
cd vectorvision
npm install
cp .env.example .env.local
# Add your VENICE_API_KEY to .env.local
npm run dev
```

## Environment Variables

- `VENICE_API_KEY`: Your Venice AI API key for image generation

## Tech Stack

- Next.js 14
- React 18
- Venice AI API (nano-banana-pro model)