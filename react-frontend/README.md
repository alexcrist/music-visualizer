# Spotify Visualizer - React Frontend

This is a React-Redux implementation of the Spotify visualizer frontend.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Ensure the backend is running on port 3000 for the API proxy to work.

## Development Notes

- The app uses Redux Toolkit for state management
- Spotify Web Playback SDK is loaded via CDN in index.html
- Color extraction uses ColorThief library via CDN
- Vite proxy routes `/spotify/*` requests to the backend server
- Token management is handled in Redux with automatic refresh every 30 minutes

## Architecture

- **Redux Store**: Manages authentication tokens, player state, and UI state
- **Components**:
  - `LoginScreen`: Handles Spotify login redirect
  - `PlayerHeader`: Displays track info and playback controls
  - `AlbumDisplay`: Shows album artwork and extracts colors for background
- **Utils**:
  - `tokenUtils.js`: Token management functions
  - `colorUtils.js`: Color extraction and artist formatting utilities

## Build

To build for production:
```bash
npm run build
```

The built files will be in the `dist/` directory and can be served by the backend.