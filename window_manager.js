const {BrowserWindow, Tray} = require('electron');
const path = require('path');
const DatabaseClient = require('./src/database_client.js');
const CONSTANTS = require('./src/constants.js');

class WindowManager {
  constructor() {
    this.window = null;
    this.tray = undefined
  }

  static windowSize() {
    if (DatabaseClient.read(CONSTANTS.onboardingStep) === 'complete') {
      return {
        windowWidth: 1000,
        windowHeight: 550,
      };
    } else {
      return {
        windowWidth: 500,
        windowHeight: 500,
      };
    }
  }

  static createMenuTray(callback) {
    this.tray = new Tray(path.join(__dirname, 'assets/icons/menu/camera.png'))

    // Add a click handler so that when the user clicks on the menubar icon, it shows
    // our popup window
    const self = this;
    this.tray.on('click', function(event) {
      self.toggleWindow();

      // Show devtools when command clicked
      if (self.window.isVisible() && process.defaultApp && event.metaKey) {
        self.window.openDevTools({mode: 'detach'})
      }
    })

    const windowSize = this.windowSize();

    // Make the popup window for the menubar
    this.window = new BrowserWindow({
      width: windowSize.windowWidth,
      height: windowSize.windowHeight,
      show: false,
      frame: false,
      resizable: false,
    })

    this.window.loadURL(`file://${path.join(__dirname, 'frontend/build/index.html')}`)

    // Only close the window on blur if dev tools isn't opened
    this.window.on('blur', () => {
      if(!this.window.webContents.isDevToolsOpened()) {
        this.window.hide()
      }
    })

    this.setWindowPosition();
    callback(this.window);
  }

  static toggleWindow() {
    if (this.window.isVisible()) {
      this.window.hide()
    } else {
      this.showWindow()
    }
  }

  static showWindow() {
    this.window.show()
    this.window.focus()
  }

  static setWindowPosition(windowWidth) {
    const electron = require('electron');
    const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize
    const trayPos = this.tray.getBounds()
    if (!windowWidth) {
      windowWidth = this.window.getBounds().width;
    }
    const x = width - windowWidth - 20;
    let y = 20
    this.window.setPosition(x, y, true);
  }

  static refreshWindow() {
    const windowSize = this.windowSize();
    this.window.setSize(windowSize.windowWidth, windowSize.windowHeight);
    this.setWindowPosition(windowSize.windowWidth);
  }
}

module.exports = WindowManager;
