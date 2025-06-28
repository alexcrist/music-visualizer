import { useCallback } from "react";
import { useDispatch } from "react-redux";
import mainSlice from "../mainSlice";

const LOCAL_STORAGE_ACCESS_TOKEN = "ACCESS_TOKEN";
const LOCAL_STORAGE_REFRESH_TOKEN = "REFRESH_TOKEN";
const THIRTY_MINUTES_IN_MS = 30 * 60 * 1000;

export const getTokensFromLocalStorage = () => {
  const accessToken = localStorage.getItem(LOCAL_STORAGE_ACCESS_TOKEN);
  const refreshToken = localStorage.getItem(LOCAL_STORAGE_REFRESH_TOKEN);
  if (accessToken && refreshToken) {
    return { accessToken, refreshToken };
  }
  return null;
};

export const getTokensFromUrlParams = () => {
  const url = window.location.href;
  const urlParamsString = window.location.search;
  const cleanUrl = url.substring(0, url.indexOf(urlParamsString));
  window.history.replaceState({}, document.title, cleanUrl);
  const urlParams = new URLSearchParams(urlParamsString);
  if (urlParams.get("access_token")) {
    return {
      accessToken: urlParams.get("access_token"),
      refreshToken: urlParams.get("refresh_token"),
    };
  }
  return null;
};

export const saveTokensToLocalStorage = (tokens) => {
  localStorage.setItem(LOCAL_STORAGE_ACCESS_TOKEN, tokens.accessToken);
  localStorage.setItem(LOCAL_STORAGE_REFRESH_TOKEN, tokens.refreshToken);
};

export const refreshTokens = async (refreshToken) => {
  const response = await fetch(
    `http://localhost:3000/spotify/login/refresh?refresh_token=${refreshToken}`
  );
  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: refreshToken,
  };
};

export const useStartTokenRefreshInterval = () => {
  const dispatch = useDispatch();
  return useCallback(
    (refreshToken) => {
      return setInterval(async () => {
        try {
          const newTokens = await refreshTokens(refreshToken);
          dispatch(mainSlice.actions.setTokens(newTokens));
          saveTokensToLocalStorage(newTokens);
        } catch (error) {
          console.error("Failed to refresh tokens:", error);
        }
      }, THIRTY_MINUTES_IN_MS);
    },
    [dispatch]
  );
};
