const {app, dialog} = require('electron');
const fs = require('fs');
const _ = require('lodash');
const AutoLaunch = require('auto-launch');


const BackgroundWorkerManager = require('./src/background_worker_manager.js');
const ApiBackend = require('./api_backend.js');
const ImagePreferencesManager = require('./src/image_preferences_manager.js');
const Logger = require('./src/logger.js');
const WindowManager = require('./window_manager.js');
const DatabaseClient = require('./src/database_client.js');
const CONSTANTS = require('./src/constants.js');

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
  Logger.info(`${title}\n${content}`);
};


app.on('ready', () => {
  initDatabaseOnDownload();
  BackgroundWorkerManager.start();
  WindowManager.createMenuTray(function(window) {
    ApiBackend.start(this.window);
    openWindowOnDownload();
  });
});

const openWindowOnDownload = () => {
  DatabaseClient.runIfKeyNotSet(CONSTANTS.hasShownOnboarding, function() {
    setTimeout(() => {
      WindowManager.showWindow();
    }, 1000);
  });
};

const initDatabaseOnDownload = () => {
  DatabaseClient.runIfKeyNotSet(CONSTANTS.databaseInitialized, function() {
    ImagePreferencesManager.initImagePreferences();
    DatabaseClient.set(CONSTANTS.onboardingStep, '1');
    DatabaseClient.set(CONSTANTS.databaseInitialized, true);

    // Screensize can only be accessed in the main thread, which is why we do
    // it here. It's used by the processedImageManager which executes in a
    // render thread.
    const electron = require('electron');
    const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;
    DatabaseClient.set(CONSTANTS.screenWidth, width);
    DatabaseClient.set(CONSTANTS.screenHeight, height);
  });
};

app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
