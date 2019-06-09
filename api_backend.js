const {ipcMain, dialog} = require('electron');

const BackgroundWorkerManager = require('./src/background_worker_manager.js');
const ImagePreferencesManager = require('./src/image_preferences_manager.js');
const FinalImageDirManaager = require('./src/final_image_dir_manager.js');
const WindowManager = require('./window_manager.js');
const DatabaseClient = require('./src/database_client.js');
const CONSTANTS = require('./src/constants.js');

class ApiBackend {
  static start(window) {
    ipcMain.on('request-image-sources', (event, arg) => {
      event.sender.send('reply-image-sources', ImagePreferencesManager.imagePreferences())
    })

    ipcMain.on('request-initial-payload', (event, arg) => {
      const initialPayload = {
        onboardingStep: DatabaseClient.read(CONSTANTS.onboardingStep),
        welcomeModalShown: DatabaseClient.read(CONSTANTS.welcomeModalShown),
      };
      event.sender.send('reply-initial-payload', initialPayload)
    })

    ipcMain.on('set-onboarding-step', (event, onboardingStep) => {
      DatabaseClient.set(CONSTANTS.onboardingStep, onboardingStep);
      if (onboardingStep === 'complete') {
        WindowManager.refreshWindow();
      }
    })

    ipcMain.on('toggle-image-following', (event, internalName) => {
      ImagePreferencesManager.toggleImagePreference(internalName);
      BackgroundWorkerManager.syncImages({forceRun: true});
      event.sender.send('reply-image-sources', ImagePreferencesManager.imagePreferences())
    });

    ipcMain.on('acknowledge-welcome-modal', (event, internalName) => {
      DatabaseClient.set(CONSTANTS.welcomeModalShown, true);
    });

    ipcMain.on('select-photo-dir', event => {
      const callback = (filenames) => {
        FinalImageDirManaager.updateFinalImageParentDir(filenames[0]);
        event.sender.send('reply-select-photo-dir', filenames[0])
      };

      dialog.showOpenDialog(window, {
        properties: ['openDirectory'],
      }, callback);
    });

  }
}

module.exports = ApiBackend;
