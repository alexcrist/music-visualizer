import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import mainSlice from "./mainSlice";
import {
  getTokensFromLocalStorage,
  getTokensFromUrlParams,
  refreshTokens,
  saveTokensToLocalStorage,
  useStartTokenRefreshInterval,
} from "./utils/tokenUtils";

const SPOTIFY_PLAYER_SCRIPT = "https://sdk.scdn.co/spotify-player.js";

let player = null;
let hasStartedInitializing = false;
export const getPlayer = () => player;

export const useInitSpotify = () => {
  const dispatch = useDispatch();
  const startTokenRefreshInterval = useStartTokenRefreshInterval();

  const handlePlayerStateChange = useCallback(
    (state) => {
      if (state && state.track_window && state.track_window.current_track) {
        const { name, album, artists } = state.track_window.current_track;
        dispatch(mainSlice.actions.setCurrentTrack({ name, album, artists }));
        dispatch(mainSlice.actions.setIsPaused(state.paused));
      }
    },
    [dispatch]
  );

  const createSpotifyPlayer = useCallback(
    (accessToken) => {
      const spotifyPlayer = new window.Spotify.Player({
        name: "Visualizer Player",
        getOAuthToken: (callback) => {
          callback(accessToken);
        },
        volume: 1,
      });

      spotifyPlayer.addListener("ready", ({ device_id }) => {
        console.info("Ready with Device ID", device_id);
        dispatch(mainSlice.actions.setIsPlayerReady(true));
        dispatch(mainSlice.actions.setDeviceId(device_id));
        spotifyPlayer.getCurrentState();
      });

      spotifyPlayer.addListener("not_ready", ({ device_id }) => {
        console.info("Device ID has gone offline", device_id);
        dispatch(mainSlice.actions.setIsPlayerReady(false));
      });

      spotifyPlayer.addListener("initialization_error", ({ message }) => {
        console.error("Initialization error:", message);
      });

      spotifyPlayer.addListener("authentication_error", (error) => {
        console.error("Authentication error:", error);
        dispatch(mainSlice.actions.setShowLogin(true));
      });

      spotifyPlayer.addListener("account_error", ({ message }) => {
        console.error("Account error:", message);
      });

      spotifyPlayer.addListener("player_state_changed", (state) => {
        handlePlayerStateChange(state);
      });

      spotifyPlayer.connect();
      player = spotifyPlayer;
    },
    [dispatch, handlePlayerStateChange]
  );

  const initializeSpotify = useCallback(async () => {
    // Get tokens from localStorage or URL params
    const localTokens = getTokensFromLocalStorage();
    const urlTokens = getTokensFromUrlParams();
    const initialTokens = localTokens || urlTokens;
    if (!initialTokens) {
      dispatch(mainSlice.actions.setShowLogin(true));
      return;
    }

    try {
      // Refresh tokens
      const refreshedTokens = await refreshTokens(initialTokens.refreshToken);
      dispatch(mainSlice.actions.setTokens(refreshedTokens));
      saveTokensToLocalStorage(refreshedTokens);

      // Start token refresh interval
      startTokenRefreshInterval(
        dispatch,
        mainSlice.actions.setTokens,
        refreshedTokens.refreshToken
      );

      // Initialize Spotify SDK
      const { accessToken } = refreshedTokens;
      if (window.Spotify) {
        createSpotifyPlayer(accessToken);
      } else {
        window.onSpotifyWebPlaybackSDKReady = () => {
          createSpotifyPlayer(accessToken);
        };
        const script = document.createElement("script");
        script.src = SPOTIFY_PLAYER_SCRIPT;
        script.async = true;
        document.body.appendChild(script);
      }
    } catch (error) {
      console.error("Failed to initialize app:", error);
      dispatch(mainSlice.actions.setShowLogin(true));
    }
  }, [createSpotifyPlayer, dispatch, startTokenRefreshInterval]);

  useEffect(() => {
    if (!hasStartedInitializing) {
      hasStartedInitializing = true;
      initializeSpotify();
    }
  }, [initializeSpotify]);
};
