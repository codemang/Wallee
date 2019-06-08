const path = require('path');
const { ipcRenderer } = require('electron')

const WallpaperManager = require(`${__dirname}/src/wallpaper_manager.js`);
const Logger = require(`${__dirname}/src/logger.js`);
const _ = require('lodash');

const jobQueue = [];
const enqueueRefreshJob = (options = {}) => {
  jobQueue.push(options);
};

ipcRenderer.on('sync-images', (event, options = {}) => {
  enqueueRefreshJob(_.assign(options, {type: 'sync-images'}));
})

ipcRenderer.on('remove-old-dir', (event, options = {}) => {
  enqueueRefreshJob(_.assign(options, {type: 'remove-old-dir'}));
})

const periodicRunDelay = 5 * 60 * 1000; // 5 minutes
setInterval(() => {
  enqueueRefreshJob();
}, periodicRunDelay);

let isRunning = false;
setInterval(() => {
  if (isRunning || jobQueue.length === 0) { return; }
  jobOptions = jobQueue.shift()

  try {
    isRunning = true;
    if (jobOptions.type === 'sync-images') {
      WallpaperManager.refreshImages(jobOptions, () => {
        isRunning = false;
      });
    } else if (jobOptions.type === 'remove-old-dir') {
      // Upcoming
    }
  } catch(err) {
    Logger.error(err);
  }
}, 3000);
