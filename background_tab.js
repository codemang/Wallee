const path = require('path');
const { ipcRenderer } = require('electron')

const WallpaperManager = require(`${__dirname}/src/wallpaper_manager.js`);

ipcRenderer.on('asynchronous-reply', (event, args) => {
  WallpaperManager.run(args);
})
ipcRenderer.send('asynchronous-message', 'ping')
