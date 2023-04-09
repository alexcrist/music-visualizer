import express from 'express';
import * as dotenv from 'dotenv';
import fetch from 'node-fetch';
import path from 'path';
import url from 'url';
import querystring from 'querystring';
import { v4 as uuid } from 'uuid';
import cookieParser from 'cookie-parser';
import cors from 'cors';

dotenv.config();

const { API_BASE, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, PORT } = process.env;
const REDIRECT_URI = `${API_BASE}/spotify/login/callback`;
const SPOTIFY_SCOPES = [
  'user-read-playback-state',
  'app-remote-control',
  'user-modify-playback-state',
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-read-currently-playing',
  'user-read-playback-position',
  'streaming',
  'user-read-private',
  'user-library-read',
  'user-read-email',
  'user-read-recently-played',
];
const SPOTIFY_STATE_KEY = 'SPOTIFY_AUTH_STATE';

const app = express();
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.resolve(__dirname, '../frontend')));
app.use(cookieParser());
app.use(cors());

app.get('/spotify/login', (_, res) => {
  const spotifyAuthState = uuid();
  res.cookie(SPOTIFY_STATE_KEY, spotifyAuthState);
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: SPOTIFY_CLIENT_ID,
      scope: SPOTIFY_SCOPES.join(' '),
      redirect_uri: REDIRECT_URI,
      state: spotifyAuthState,
    }));
});

app.get('/spotify/login/callback', async (req, res) => {
  const { code, state } = req.query;
  const cookieState = req.cookies && req.cookies[SPOTIFY_STATE_KEY];
  if (state && state === cookieState) {
    const tokenResponse = await requestSpotifyToken({
      code,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    });
    res.redirect('/?' + querystring.stringify(tokenResponse));
  } else {
    res.sendStatus(400);
  }
});

app.get('/spotify/login/refresh', async (req, res) => {
  const refreshResponse = await requestSpotifyToken({
    grant_type: 'refresh_token',
    refresh_token: req.query.refresh_token,
  });
  res.json(refreshResponse);
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

const requestSpotifyToken = async (formData, method='post') => {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'post',
    body: new URLSearchParams(formData),
    headers: { 
      'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    }}
  );
  return response.json();
};