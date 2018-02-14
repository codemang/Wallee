const execSync = require('child_process').execSync;
const fs = require('fs');
const path = require('path');

const logger = require('./logger.js')

const RedditImageUrlFetcher = require('./reddit_image_url_fetcher.js')
const RemoteImageSyncer = require('./remote_image_syncer.js');
const ProcessedImageManager = require('./processed_image_manager.js');
const ImageCleaner = require('./image_cleaner.js')
const GeneralHelpers = require('./general_helpers.js')

class WallpaperManager {
  static run() {
    logger.info("Starting main loop")
    RedditImageUrlFetcher.fetch().then(hrefs => {
      hrefs.forEach(href => {
        RemoteImageSyncer.addImage(href, 'RedditEarthPorn')
      });

      const addImagePromises = RemoteImageSyncer.localImagePaths().map(localImagePath => {
        return ProcessedImageManager.addImageIfGoodAspectRatio(localImagePath);
      })

      Promise.all(addImagePromises).then((values) => {
        RemoteImageSyncer.cleanUp();
        ImageCleaner.pruneOldImages();
        logger.info("-- Current Images --")
        ProcessedImageManager.readImageRecords().forEach(record => {
          logger.info(JSON.stringify(record))
        })
        setTimeout(WallpaperManager.run, 1000 * 30) // 1 hour
      })
    })
  }
}

module.exports = WallpaperManager;
