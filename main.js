const {app, BrowserWindow} = require('electron');
const path = require('path')
const url = require('url')
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

function runApp () {
  WallpaperManager.run();
}

app.on('ready', runApp)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
