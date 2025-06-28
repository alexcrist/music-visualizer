# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Spotify music visualizer web application that connects to the Spotify Web API and Web Playback SDK to display currently playing music with visual effects based on album artwork colors.

### Architecture

- **Backend** (`backend/`): Express.js server handling Spotify OAuth authentication
  - `index.js`: Main server file with OAuth flow endpoints
  - Uses ES modules (`"type": "module"` in package.json)
  - Serves static frontend files
  
- **Frontend** (`frontend/`): Vanilla JavaScript client-side application  
  - `index.html`: Main UI with player controls and canvas for visualization
  - `main.js`: Spotify Web Playback SDK integration and UI event handlers
  - `tokens.js`: OAuth token management and refresh logic
  - `visualizer.js`: Audio visualization code (currently commented out/WIP)
  - `color-thief.umd.js`: Third-party library for extracting colors from album artwork

### Key Integration Points

- **Spotify OAuth Flow**: Backend handles authorization code flow, frontend uses Web Playback SDK
- **Token Management**: Frontend automatically refreshes tokens every 30 minutes
- **Player State**: Spotify Web Playback SDK manages playback state and track information
- **Visual Effects**: Uses ColorThief to extract dominant colors from album artwork for background

## Development Commands

### Backend
```bash
cd backend
npm start          # Start production server
npm run dev        # Start development server with nodemon
```

### Frontend
Frontend is served statically by the backend server - no separate build process required.

## Environment Setup

1. Copy `backend/.env-template` to `backend/.env`
2. Fill in required Spotify credentials:
   - `SPOTIFY_CLIENT_ID`: From Spotify Developer Dashboard
   - `SPOTIFY_CLIENT_SECRET`: From Spotify Developer Dashboard  
   - `API_BASE`: Base URL for backend API (e.g., http://localhost:3000)
   - `PORT`: Port for backend server

## Spotify Integration Details

### Required Scopes
The app requests these Spotify scopes (defined in `backend/index.js:17-30`):
- `user-read-playback-state`
- `app-remote-control` 
- `user-modify-playback-state`
- `playlist-read-private`
- `playlist-read-collaborative`
- `user-read-currently-playing`
- `user-read-playback-position`
- `streaming`
- `user-read-private`
- `user-library-read`
- `user-read-email`
- `user-read-recently-played`

### Authentication Flow
1. User clicks "Login to Spotify" → `/spotify/login`
2. Backend redirects to Spotify authorization
3. Spotify redirects back to `/spotify/login/callback` 
4. Backend exchanges code for tokens, redirects to frontend with tokens in URL params
5. Frontend extracts tokens, saves to localStorage, initializes Spotify Web Playback SDK

### Player Control
- Uses Spotify Web Playback SDK for playback control
- Player automatically pauses on first state change (intentional behavior)
- Frontend handles play/pause/skip/previous controls

## Current State & Known Issues

- Audio visualization code in `visualizer.js` is commented out and non-functional
- No test framework or linting setup currently configured
- No build process or bundling for frontend code
- Uses third-party CDN resources (Font Awesome, Spotify SDK)