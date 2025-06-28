let isFirstStateChange = true;
let player;

const playButton = document.querySelector('.play');
const pauseButton = document.querySelector('.pause');
const backButton = document.querySelector('.back');
const skipButton = document.querySelector('.skip');
const bodyContainer = document.querySelector('.body-container');
const albumArt = document.querySelector('.album-art');
const songTitle = document.querySelector('.song-title');
const albumTitle = document.querySelector('.album-title');
const artistName = document.querySelector('.artist-name');

playButton.addEventListener('click', () => player.togglePlay());
pauseButton.addEventListener('click', () => player.togglePlay());
backButton.addEventListener('click', () => player.previousTrack());
skipButton.addEventListener('click', () => player.nextTrack());

window.onSpotifyWebPlaybackSDKReady = async () => {
  await initTokens();
  player = new Spotify.Player({
    name: 'Visualizer Player',
    getOAuthToken: async (callback) => {
      const accessToken = getAccessToken();
      callback(accessToken);
    },
    volume: 1,
  });
  player.addListener('ready', ({ device_id }) => {
    console.log('Ready with Device ID', device_id);
    player.getCurrentState();
  });
  player.addListener('not_ready', ({ device_id }) => {
    console.log('Device ID has gone offline', device_id);
  });
  player.addListener('initialization_error', ({ message }) => { 
    console.error(message);
  });
  player.addListener('authentication_error', (a) => {
    console.error(a);
  });
  player.addListener('account_error', ({ message }) => {
    console.error(message);
  });
  player.addListener('player_state_changed', onPlayerChange);
  player.connect();
};

const onPlayerChange = (state) => {
  console.log('player state change', state);
  if (isFirstStateChange) {
    isFirstStateChange = false;
    if (!state.paused) {
      state.paused = true;
      player.togglePlay();
    }
  }
  const { name, album, artists } = state.track_window.current_track;
  displaySongInfo(name, album, artists);
  displayPlayPause(state.paused);
};

const displayPlayPause = (isPaused) => {
  if (isPaused) {
    playButton.style.display = 'block';
    pauseButton.style.display = 'none';
  } else {
    playButton.style.display = 'none';
    pauseButton.style.display = 'block';
  }
};

const formatArtists = (artists) => {
  return artists 
    .map((artist) => artist.name)
    .reduce((names, name) => names + ', ' + name, '')
    .substring(2);
};

const displaySongInfo = async (songName, album, artists) => {
  songTitle.innerText = songName;
  albumTitle.innerText = album.name;
  artistName.innerText = formatArtists(artists);
  albumArt.src = album.images[2].url;
  albumArt.style.opacity = 1;
};

const colorThief = new ColorThief();
albumArt.addEventListener('load', async () => {
  const [r, g, b] = await colorThief.getColor(albumArt);
  bodyContainer.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
});
