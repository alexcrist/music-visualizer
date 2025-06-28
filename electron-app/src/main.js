const { app, BrowserWindow, ipcMain, desktopCapturer } = require("electron");
const path = require("path");
const isDev = process.env.NODE_ENV === "development";

console.log("isDev", isDev);

let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, "preload.js"),
      webSecurity: false, // Allow CORS for local development
      plugins: true, // Enable plugins for Widevine CDM
    },
    titleBarStyle: "hiddenInset",
    icon: path.join(__dirname, "../public/favicon.png"),
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL("http://localhost:3001");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../build/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// Handle audio capture for visualizer
ipcMain.handle("get-audio-sources", async () => {
  try {
    const sources = await desktopCapturer.getSources({
      types: ["audio"],
      fetchWindowIcons: false,
    });
    return sources;
  } catch (error) {
    console.error("Error getting audio sources:", error);
    return [];
  }
});

// Handle screen capture (if needed for system audio)
ipcMain.handle("get-screen-sources", async () => {
  try {
    const sources = await desktopCapturer.getSources({
      types: ["window", "screen"],
      fetchWindowIcons: true,
    });
    return sources;
  } catch (error) {
    console.error("Error getting screen sources:", error);
    return [];
  }
});

// App event handlers
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on("web-contents-created", (event, contents) => {
  contents.on("new-window", (event, navigationUrl) => {
    event.preventDefault();
  });
});

// Handle protocol for Spotify OAuth redirect
app.setAsDefaultProtocolClient("spotify-visualizer");

app.on("open-url", (event, url) => {
  event.preventDefault();
  // Handle Spotify OAuth callback
  if (mainWindow && url.startsWith("spotify-visualizer://")) {
    // Extract parameters and send to renderer
    const urlParams = new URL(url).searchParams;
    mainWindow.webContents.send("spotify-oauth-callback", {
      access_token: urlParams.get("access_token"),
      refresh_token: urlParams.get("refresh_token"),
    });
  }
});
