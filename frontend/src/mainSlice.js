import { createSlice } from "@reduxjs/toolkit";

const mainSlice = createSlice({
  name: "main",
  initialState: {
    // Authentication state
    tokens: null,
    isAuthenticated: false,
    showLogin: false,

    // Player state
    isPlayerReady: false,
    currentTrack: null,
    isPaused: true,

    // UI state
    artworkColor: null,
  },
  reducers: {
    setTokens: (state, action) => {
      state.tokens = action.payload;
      state.isAuthenticated = !!action.payload;
      state.showLogin = !action.payload;
    },
    setShowLogin: (state, action) => {
      state.showLogin = action.payload;
    },
    setIsPlayerReady: (state, action) => {
      state.isPlayerReady = action.payload;
    },
    setCurrentTrack: (state, action) => {
      state.currentTrack = action.payload;
    },
    setIsPaused: (state, action) => {
      state.isPaused = action.payload;
    },
    setArtworkColor: (state, action) => {
      state.artworkColor = action.payload;
    },
  },
});

export default mainSlice;
