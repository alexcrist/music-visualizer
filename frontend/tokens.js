const LOCAL_STORAGE_ACCESS_TOKEN = 'ACCESS_TOKEN';
const LOCAL_STORAGE_REFRESH_TOKEN = 'REFRESH_TOKEN';
const THIRTY_MINUTES_IN_MS = 30 * 60 * 1000;

let tokens;

// Public functions ===========================================================

const getAccessToken = () => tokens.accessToken;

const initTokens = async () => {
  
  // Get tokens from either from local storage or url params
  tokens = (
    getTokensFromLocalStorage() || 
    getTokensFromUrlParams()
  );

  // If no tokens, login required
  if (!tokens) {
    displayLogin();
    return;
  }

  // Refresh tokens
  tokens = await refreshTokens();

  // Save tokens in local storage
  saveTokensToLocalStorage();

  // Refresh tokens every 30 min
  setInterval(async () => {
    tokens = await refreshTokens();
  }, THIRTY_MINUTES_IN_MS);
};

// Private functions ==========================================================

const getTokensFromLocalStorage = () => {
  const accessToken = localStorage.getItem(LOCAL_STORAGE_ACCESS_TOKEN);
  const refreshToken = localStorage.getItem(LOCAL_STORAGE_REFRESH_TOKEN);
  if (accessToken && refreshToken) {
    return { accessToken, refreshToken };
  }
};

const getTokensFromUrlParams = () => {
  const url = window.location.href;
  const urlParamsString = window.location.search;
  const cleanUrl = url.substring(0, url.indexOf(urlParamsString));
  window.history.replaceState({}, document.title, cleanUrl);
  const urlParams = new URLSearchParams(urlParamsString);
  if (urlParams.get('access_token')) {
    return {
      accessToken: urlParams.get('access_token'),
      refreshToken: urlParams.get('refresh_token'),
    };
  }
};

const displayLogin = () => {
  const loginContainer = document.querySelector('.login-container');
  loginContainer.style.display = 'flex';
};

const refreshTokens = async () => {
  const response = await fetch(`/spotify/login/refresh?refresh_token=${tokens.refreshToken}`);
  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: tokens.refreshToken,
  };
};

const saveTokensToLocalStorage = () => {
  localStorage.setItem(LOCAL_STORAGE_ACCESS_TOKEN, tokens.accessToken);
  localStorage.setItem(LOCAL_STORAGE_REFRESH_TOKEN, tokens.refreshToken);
};