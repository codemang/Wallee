const execSync = require('child_process').execSync;
const fs = require('fs');
const path = require('path');

const logger = require('./logger.js')

const RedditImageUrlFetcher = require('./reddit_image_url_fetcher.js')
const RemoteImageSyncer = require('./remote_image_syncer.js');
const ProcessedImageManager = require('./processed_image_manager.js');
const GeneralHelpers = require('./general_helpers.js')
const MetadataFile = require('./metadata_file.js')

class WallpaperManager {
  static get EXECUTION_METADATA() { return 'execution_metadata.json'; }
  static get EXECUTION_STALE_SECONDS() { return 60 * 60; } // 1 hour
  static get EXECUTION_REPEAT_SECONDS() { return 5 * 60; } // 5 minuts

  static run() {
    this.refreshImages();
    setInterval(WallpaperManager.refreshImages, WallpaperManager.EXECUTION_REPEAT_SECONDS * 1000)
  }

  static refreshImages(){
    logger.info("Starting main loop")

    const executionMetadata = MetadataFile.read(WallpaperManager.EXECUTION_METADATA, {})
    if (executionMetadata.timestamp && (new Date() - new Date(executionMetadata.timestamp))/1000 < WallpaperManager.EXECUTION_STALE_SECONDS) {
      logger.info(`Last execution time '${executionMetadata.timestamp}' is too recent. Skipping.`)
      return;
    }

    logger.info(`Last execution time is too old. Proceeding.`)

    RedditImageUrlFetcher.fetch().then(hrefs => {
      hrefs.forEach(href => {
        RemoteImageSyncer.addImage(href, 'RedditEarthPorn')
      });

      const addImagePromises = RemoteImageSyncer.localImagePaths().map(localImagePath => {
        return ProcessedImageManager.addImageIfGoodAspectRatio(localImagePath);
      })

      Promise.all(addImagePromises).then((values) => {
        RemoteImageSyncer.cleanUp();
        ProcessedImageManager.pruneOldImages();
        logger.info("-- Current Images --")
        ProcessedImageManager.readImageRecords().forEach(record => {
          logger.info(JSON.stringify(record))
        })
        MetadataFile.write(WallpaperManager.EXECUTION_METADATA, {timestamp: new Date()})
      })
    });
  }
}

module.exports = WallpaperManager;
