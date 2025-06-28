import cookieParser from "cookie-parser";
import cors from "cors";
import * as dotenv from "dotenv";
import express from "express";
import fetch from "node-fetch";
import path from "path";
import querystring from "querystring";
import url from "url";
import { v4 as uuid } from "uuid";
import { config } from "./config/environment.js";

dotenv.config();

const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;
const REDIRECT_URI = `${config.apiBase}/spotify/login/callback`;
const SPOTIFY_SCOPES = [
  "user-read-playback-state",
  "app-remote-control",
  "user-modify-playback-state",
  "playlist-read-private",
  "playlist-read-collaborative",
  "user-read-currently-playing",
  "user-read-playback-position",
  "streaming",
  "user-read-private",
  "user-library-read",
  "user-read-email",
  "user-read-recently-played",
];
const SPOTIFY_STATE_KEY = "SPOTIFY_AUTH_STATE";

const app = express();
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.resolve(__dirname, "../frontend")));
app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.get("/spotify/login", (_, res) => {
  const spotifyAuthState = uuid();
  res.cookie(SPOTIFY_STATE_KEY, spotifyAuthState);
  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: SPOTIFY_CLIENT_ID,
        scope: SPOTIFY_SCOPES.join(" "),
        redirect_uri: REDIRECT_URI,
        state: spotifyAuthState,
      })
  );
});

app.get("/spotify/login/callback", async (req, res) => {
  const { code, state } = req.query;
  const cookieState = req.cookies && req.cookies[SPOTIFY_STATE_KEY];
  if (state && state === cookieState) {
    const tokenResponse = await requestSpotifyToken({
      code,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    });
    res.redirect(
      `${config.frontendUrl}/?` + querystring.stringify(tokenResponse)
    );
  } else {
    res.sendStatus(400);
  }
});

app.get("/spotify/login/refresh", async (req, res) => {
  const refreshResponse = await requestSpotifyToken({
    grant_type: "refresh_token",
    refresh_token: req.query.refresh_token,
  });
  res.json(refreshResponse);
});

app.get("/spotify/playlists", async (req, res) => {
  const accessToken = req.headers.authorization?.replace("Bearer ", "");
  if (!accessToken) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const response = await fetch("https://api.spotify.com/v1/me/playlists", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching playlists:", error);
    res.status(500).json({ error: "Failed to fetch playlists" });
  }
});

app.post("/spotify/play", async (req, res) => {
  const accessToken = req.headers.authorization?.replace("Bearer ", "");
  if (!accessToken) {
    return res.status(401).json({ error: "Access token required" });
  }

  const { playlistUri } = req.body;
  if (!playlistUri) {
    return res.status(400).json({ error: "Playlist URI required" });
  }

  try {
    const response = await fetch("https://api.spotify.com/v1/me/player/play", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        context_uri: playlistUri,
      }),
    });

    if (response.status === 204) {
      res.json({ success: true });
    } else {
      const errorData = await response.json();
      res.status(response.status).json(errorData);
    }
  } catch (error) {
    console.error("Error starting playback:", error);
    res.status(500).json({ error: "Failed to start playback" });
  }
});

app.listen(config.port, () => {
  console.info(`Backend running on port ${config.port}`);
});

const requestSpotifyToken = async (formData) => {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "post",
    body: new URLSearchParams(formData),
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(SPOTIFY_CLIENT_ID + ":" + SPOTIFY_CLIENT_SECRET).toString(
          "base64"
        ),
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  return response.json();
};
