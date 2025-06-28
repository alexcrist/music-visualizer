import { createSlice } from "@reduxjs/toolkit";

const mainSlice = createSlice({
    name: "main",
    initialState: {
        // Authentication state
        tokens: null,
        isAuthenticated: false,
        showLogin: false,
        
        // Player state
        player: null,
        isPlayerReady: false,
        currentTrack: null,
        isPaused: true,
        isFirstStateChange: true,
        
        // UI state
        backgroundColor: null,
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
        setPlayer: (state, action) => {
            state.player = action.payload;
        },
        setPlayerReady: (state, action) => {
            state.isPlayerReady = action.payload;
        },
        setCurrentTrack: (state, action) => {
            state.currentTrack = action.payload;
        },
        setIsPaused: (state, action) => {
            state.isPaused = action.payload;
        },
        setIsFirstStateChange: (state, action) => {
            state.isFirstStateChange = action.payload;
        },
        setBackgroundColor: (state, action) => {
            state.backgroundColor = action.payload;
        },
    },
});

export const {
    setTokens,
    setShowLogin,
    setPlayer,
    setPlayerReady,
    setCurrentTrack,
    setIsPaused,
    setIsFirstStateChange,
    setBackgroundColor,
} = mainSlice.actions;

export default mainSlice;
