import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './App.module.css';
import { 
  setTokens, 
  setShowLogin, 
  setPlayer, 
  setPlayerReady,
  setCurrentTrack,
  setIsPaused,
  setIsFirstStateChange,
  setBackgroundColor
} from '../mainSlice';
import { 
  getTokensFromLocalStorage, 
  getTokensFromUrlParams, 
  saveTokensToLocalStorage,
  refreshTokens,
  startTokenRefreshInterval
} from '../utils/tokenUtils';
import LoginScreen from '../components/LoginScreen';
import PlayerHeader from '../components/PlayerHeader';
import AlbumDisplay from '../components/AlbumDisplay';

const App = () => {
  const dispatch = useDispatch();
  const { 
    tokens, 
    showLogin, 
    player,
    isPlayerReady,
    currentTrack,
    isPaused,
    isFirstStateChange,
    backgroundColor 
  } = useSelector(state => state.main);

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    if (backgroundColor) {
      document.body.style.backgroundColor = backgroundColor;
    }
  }, [backgroundColor]);

  const initializeApp = async () => {
    // Get tokens from localStorage or URL params
    const localTokens = getTokensFromLocalStorage();
    const urlTokens = getTokensFromUrlParams();
    const initialTokens = localTokens || urlTokens;

    if (!initialTokens) {
      dispatch(setShowLogin(true));
      return;
    }

    try {
      // Refresh tokens
      const refreshedTokens = await refreshTokens(initialTokens.refreshToken);
      dispatch(setTokens(refreshedTokens));
      saveTokensToLocalStorage(refreshedTokens);

      // Start token refresh interval
      startTokenRefreshInterval(dispatch, setTokens, refreshedTokens.refreshToken);

      // Initialize Spotify SDK
      initializeSpotifySDK(refreshedTokens.accessToken);
    } catch (error) {
      console.error('Failed to initialize app:', error);
      dispatch(setShowLogin(true));
    }
  };

  const initializeSpotifySDK = (accessToken) => {
    if (window.Spotify) {
      createSpotifyPlayer(accessToken);
    } else {
      window.onSpotifyWebPlaybackSDKReady = () => {
        createSpotifyPlayer(accessToken);
      };
    }
  };

  const createSpotifyPlayer = (accessToken) => {
    const spotifyPlayer = new window.Spotify.Player({
      name: 'Visualizer Player',
      getOAuthToken: (callback) => {
        callback(accessToken);
      },
      volume: 1,
    });

    spotifyPlayer.addListener('ready', ({ device_id }) => {
      console.log('Ready with Device ID', device_id);
      dispatch(setPlayerReady(true));
      spotifyPlayer.getCurrentState();
    });

    spotifyPlayer.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline', device_id);
      dispatch(setPlayerReady(false));
    });

    spotifyPlayer.addListener('initialization_error', ({ message }) => {
      console.error('Initialization error:', message);
    });

    spotifyPlayer.addListener('authentication_error', (error) => {
      console.error('Authentication error:', error);
      dispatch(setShowLogin(true));
    });

    spotifyPlayer.addListener('account_error', ({ message }) => {
      console.error('Account error:', message);
    });

    spotifyPlayer.addListener('player_state_changed', (state) => {
      handlePlayerStateChange(state, spotifyPlayer);
    });

    spotifyPlayer.connect();
    dispatch(setPlayer(spotifyPlayer));
  };

  const handlePlayerStateChange = (state, spotifyPlayer) => {
    console.log('Player state change:', state);
    
    if (isFirstStateChange) {
      dispatch(setIsFirstStateChange(false));
      if (!state.paused) {
        spotifyPlayer.togglePlay();
      }
    }

    if (state && state.track_window && state.track_window.current_track) {
      const { name, album, artists } = state.track_window.current_track;
      dispatch(setCurrentTrack({ name, album, artists }));
      dispatch(setIsPaused(state.paused));
    }
  };

  if (showLogin) {
    return <LoginScreen />;
  }

  return (
    <div className={styles.container}>
      <PlayerHeader 
        currentTrack={currentTrack}
        isPaused={isPaused}
        player={player}
        isPlayerReady={isPlayerReady}
      />
      <AlbumDisplay 
        currentTrack={currentTrack}
        onColorExtracted={(color) => dispatch(setBackgroundColor(color))}
      />
    </div>
  );
};

export default App;
