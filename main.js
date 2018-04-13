const {app, BrowserWindow, dialog} = require('electron');
const path = require('path')
const url = require('url')
const logger = require('./src/logger.js')
const WallpaperManager = require('./src/wallpaper_manager.js')
const AutoLaunch = require('auto-launch');

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

function runApp () {
  WallpaperManager.run();
}

app.on('ready', runApp)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});
