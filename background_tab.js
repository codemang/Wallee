const path = require('path');
const { ipcRenderer } = require('electron')

const WallpaperManager = require(`${__dirname}/src/wallpaper_manager.js`);
const logger = require(`${__dirname}/src/logger.js`);

const jobQueue = [];
const enqueueRefreshJob = (options = {}) => {
  jobQueue.push(options);
};

ipcRenderer.on('sync-images', (event, options = {}) => {
  enqueueRefreshJob(options);
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
    WallpaperManager.refreshImages(jobOptions, () => {
      isRunning = false;
    });
  } catch(err) {
    logger.error(err);
  }
}, 3000);
