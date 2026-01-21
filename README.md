# Street Parking Finder - Frontend

A mobile-friendly React web application for finding parking signs near your location.

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Leaflet / React-Leaflet** - Interactive maps

## Prerequisites

- Node.js (v18+ recommended)
- npm

## Installation

```bash
npm install
```

## Running the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` by default.

## Building for Production

```bash
npm run build
```

The production build will be output to the `dist/` directory.

## Preview Production Build

```bash
npm run preview
```

## Project Structure

```
├── index.html          # Entry HTML file
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite configuration
└── src/
    ├── main.jsx        # React entry point
    ├── App.jsx         # Main application component
    ├── index.css       # Global styles
    ├── components/     # React components
    ├── hooks/          # Custom React hooks
    └── utils/          # Utility functions
```
