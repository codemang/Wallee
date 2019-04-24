const {app, BrowserWindow, ipcMain, Tray, nativeImage, dialog} = require('electron')
const path = require('path')
const logger = require('./src/logger.js')
const WallpaperManager = require('./src/wallpaper_manager.js')
const UserStore = require('./src/user_store.js')
const AutoLaunch = require('auto-launch');
const fs = require('fs');
const initialImageSources= require('./initial_image_sources');
const _ = require('lodash');

// Initialize app to launch on startup
const appAutoLauncher = new AutoLaunch({
  name: 'Walllpaper',
});

appAutoLauncher.isEnabled().then(function(isEnabled){
  if (isEnabled) {
      return;
  }
  appAutoLauncher.enable();
}).catch(function(err){});

// Disable error dialogs by overriding
dialog.showErrorBox = (title, content) => {
  logger.info(`${title}\n${content}`);
};


let tray = undefined
let window = undefined

app.on('ready', () => {
  initUserStore();
  startBackgroundJob();
  createMenuTray();
})

const initUserStore = () => {
  if (!UserStore.isInitialized()) {
    const electron = require('electron');
    const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize
    UserStore.writeScreenSize(width, height);
    UserStore.writeImagePreferences(initialImageSources);
  }
};

// Function to start background job that fetches images
let backgroundTab;
const startBackgroundJob = () => {
  backgroundTab = new BrowserWindow({ show: false });
  backgroundTab.on('closed', () => {
      win = null
  })
  backgroundTab.loadURL(`file://${path.join(__dirname, 'background_tab.html')}`)

  backgroundTab.webContents.on('did-finish-load', () => {
    syncImages();
  });
};

// Helper functions for creating menu tray
const createMenuTray = () => {
  tray = new Tray(path.join(__dirname, 'assets/icons/menu/camera.png'))

  // Add a click handler so that when the user clicks on the menubar icon, it shows
  // our popup window
  tray.on('click', function(event) {
    toggleWindow()

    // Show devtools when command clicked
    if (window.isVisible() && process.defaultApp && event.metaKey) {
      window.openDevTools({mode: 'detach'})
    }
  })

  // Make the popup window for the menubar
  window = new BrowserWindow({
    width: 1000,
    height: 550,
    show: false,
    frame: false,
    resizable: false,
  })

  // window.loadURL(`file://${path.join(__dirname, 'menu.html')}`)
  window.loadURL(`file://${path.join(__dirname, 'frontend/build/index.html')}`)

  // Only close the window on blur if dev tools isn't opened
  window.on('blur', () => {
    if(!window.webContents.isDevToolsOpened()) {
      window.hide()
    }
  })
};

const toggleWindow = () => {
  if (window.isVisible()) {
    window.hide()
  } else {
    showWindow()
  }
}

const showWindow = () => {
  const electron = require('electron');
  const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize
  const trayPos = tray.getBounds()
  const windowPos = window.getBounds()
  const x = width - windowPos.width - 20;

  let y =0;
  if (process.platform == 'darwin') {
    y = Math.round(trayPos.y + trayPos.height) + 20;
  } else {
    y = Math.round(trayPos.y + trayPos.height * 10) + 20;
  }

  window.setPosition(x, y, false)
  window.show()
  window.focus()
}

ipcMain.on('show-window', () => {
  showWindow()
})

app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Helper functions for communication between main process and image fetcher
const syncImages = (options = {}) => {
  backgroundTab.webContents.send('sync-images', options);
};

// Helper functions for communication between main process and UI
ipcMain.on('request-image-sources', (event, arg) => {
  event.sender.send('reply-image-sources', UserStore.readImagePreferences().imagePreferences)
})

ipcMain.on('toggle-image-following', (event, internalName) => {
  logger.info("Toggled image following for: " + internalName);
  const imageSources = UserStore.readImagePreferences().imagePreferences;
  let imageSource = _.find(imageSources, ['internalName', internalName]);
  imageSource.isFollowing = !imageSource.isFollowing;
  UserStore.writeImagePreferences(imageSources);
  syncImages({forceRun: true});
  event.sender.send('reply-image-sources', UserStore.readImagePreferences().imagePreferences)
});

// Tray Icon as Base64 so tutorial has less overhead
let base64Icon = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw
7AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AkZCg87wZW7ewA
AAp1JREFUOMuV1U2IVlUcx/HPnbc0MWwEF40hRWRQmWhEUi4KorlTQ0zQKgqSxKinRYuWrdq0iIp8DAy
CFmYUUVTYY0Qw0SsYVDQRlFlQU4o4VDMUY9NzWtz/45znzo3yv7n/l3O+53fOPS+F/7R9G0l34Vlap/x
PG+gPby76471jpJdxI4p/x5QrakPVZ3yI4lLSLH4LpetIT5N24AWKpZXAW4boXogFnGxQXEzhdQYHl0v
pbtJkBIOkBqXpVhzAWIPi8hocxCyH5qp0e10oHY6BNy3P7szULyc9hzkGTjat8WPRqctkD3QORrJ211J
srPV7CKP4i7S6CXxF+GtY2lG5D5yg+D6bckHaRXs463dV+OtJVzeBj4Q/inuy2uf4NYPvyVR38Vn4GzD
ZAC5ezHbITsqtEU8HvGcjpFblDncpDma16yhvqit+c3mLuQj3Vm7rJ4r3kW+z+6sD80aKQWcivwm318B
pHk9mA11PuSXil/B1thyrSA9HMI8nMtYNlDszcKdbHVcLkduCO0L1VxTv1VTv5plR3lrCuzga+c2YqB2
QNEfqjV7EWl8c8X78kKleTTfWeuA49maDjlNuz8CHFykOYDEabKvg0Jqh+AB/Z4D7qs+h03gbxyK/FVf
WL6FfsC/8tdGoZ0/hRKZ6A+2pUP1jdZecse01cGcBr2YNzqdcG6q/oDgS+7e3XLeF6j/wTvzM6Lfi2nQ
KP8e0P6Ezn9X2488MvLnW75vwP2wCr8J5eD4upsxaHZzOwNNZcU2c3FfwWg1cDuISfIxH6fzedE8G90s
8nuXH8B0eoXNc/6tQjsQfXaQz0/BEXUD3W4oF0hQPflTlJwZIl+FcOp86e2vvoj1Le6I/P974ZA2dBXk
97qQ13Z8+3PS0+AdjKa1R95YOZgAAAABJRU5ErkJggg==`
