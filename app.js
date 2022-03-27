const { app, BrowserWindow, globalShortcut, ipcMain } = require("electron");
const url = require("url");
const path = require("path");
let win, serve;
const args = process.argv.slice(1);
serve = args.some((val) => val === "--serve");

let d2gsi = require("dota2-gsi");
// let server = new d2gsi({ port: 30506 });
let server = new d2gsi({ port: 30506, ip: "localhost" });
console.log(server);
var clients = [];
server.events.on("newclient", (client) => {
  console.log("New client connected, IP address: " + client.ip);
  client.on("player:activity", function (activity) {
    if (activity == "playing") console.log("Game started!");
  });
  client.on("hero:level", function (level) {
    console.log("Now level " + level);
  });
  client.on("abilities:ability0:can_cast", function (can_cast) {
    if (can_cast) console.log("Ability0 off cooldown!");
  });
  client.on("map:roshan_state", function (state) {
    console.log("rosh state:", state);
  });
  client.on("buildings", function (building) {
    console.log("buildings:", buildings);
  });
  client.on("map:roshan_state_end_seconds", function (seconds) {
    console.log("ROSHAN SECONDS:", seconds);
  });
  clients.push(client);
});

//

if (serve) {
  // require("electron-reload")(__dirname, {});
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
    },
  });

  if (serve) {
    mainWindow.loadURL("http://localhost:4200");
  } else {
    mainWindow.loadFile(path.join(__dirname, "dist/dota-timer/index.html"));
  }

  const ret = globalShortcut.register("CommandOrControl+X", () => {
    console.log("CommandOrControl+X is pressed");
    mainWindow.webContents.send("rosh");
  });

  if (!ret) {
    console.log("registration failed");
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  mainWindow.on("closed", function () {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  ipcMain.on("gamestate", (event, arg) => {
    console.log("gamestate:", arg);
    clients.forEach(function (client, index) {
      // States Setup
      var state = null;
      if (client.gamestate.map) {
        state = client.gamestate.map.game_state;
      }

      const gs = client.gamestate;
      const player = gs.player;
      const hero = gs.hero;
      const map = gs.map;

      // Setting Vars
      var heroName = "";
      var heroNameFix = "";

      var kills = 0;
      var deaths = 0;
      var assists = 0;
      var lastHits = 0;
      var denies = 0;

      var level = 0;

      var clockTimeStr;
      // console.log(client.gamestate.map.clock_time);
      // console.log(client.gamestate.map.roshan_state);
      // console.log(client.gamestate);

      // send gamestate to frontend
      event.sender.send("gamestate", {
        gs,
      });
    });
  });

  // Check whether a shortcut is registered.
  console.log(globalShortcut.isRegistered("CommandOrControl+X"));
});

app.on("window-all-closed", function () {
  globalShortcut.unregisterAll();
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", function () {
  if (mainWindow === null) createWindow();
});

function urlFromComponents({
  pathname = "/",
  protocol = "https:",
  ...props
} = {}) {
  const url = new URL("https://site.example");
  url.protocol = protocol;
  url.hostname = props.hostname;
  url.pathname = pathname;
  return url;
}
