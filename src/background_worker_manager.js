const {BrowserWindow} = require('electron');
const path = require('path');

class BackgroundWorkerManager {
  constructor() {
    this.backgroundTab = null;
  }

// Function to start background job that fetches images
  static start() {
    this.backgroundTab = new BrowserWindow({ show: true });
    this.backgroundTab.on('closed', () => {
        win = null
    })
    this.backgroundTab.loadURL(`file://${path.join(path.resolve(__dirname, '..'), 'background_tab.html')}`)

    this.backgroundTab.webContents.on('did-finish-load', () => {
      this.syncImages();
    });
  }


  // Helper functions for communication between main process and image fetcher
  static syncImages(options = {}) {
    this.backgroundTab.webContents.send('sync-images', options);
  }
}

module.exports = BackgroundWorkerManager;
