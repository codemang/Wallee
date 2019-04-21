const execSync = require('child_process').execSync;
const fs = require('fs');
const path = require('path');

const logger = require('./logger.js')

const RedditImageUrlFetcher = require('./reddit_image_url_fetcher.js')
const RemoteImageSyncer = require('./remote_image_syncer.js');
const ProcessedImageManager = require('./processed_image_manager.js');
const GeneralHelpers = require('./general_helpers.js')
const MetadataFile = require('./metadata_file.js')
const UserStore = require('./user_store.js')

class WallpaperManager {
  static get EXECUTION_STALE_SECONDS() { return 60 * 60; } // 1 hour

  static refreshImages(options = {}, markJobCompleteCallback) {
    const lastRunTimestamp = UserStore.lastRunTimestamp();
    if (!options.forceRun && lastRunTimestamp && (new Date() - new Date(lastRunTimestamp))/1000 < WallpaperManager.EXECUTION_STALE_SECONDS) {
      logger.info(`Last execution time '${lastRunTimestamp}' is too recent. Not refreshing images.`)
      markJobCompleteCallback();
      return;
    }

    if (options.forceRun) {
      logger.info(`Called with forceRun == true. Refreshing images.`)
    } else {
      logger.info(`Last execution time is too old. Refreshing images.`)
    }

    const hrefPromises = UserStore.followingImagePreferences().map(imageSource => {
      return new Promise(function(resolve, reject) {
        RedditImageUrlFetcher.fetch(imageSource.endpoint).then(hrefs => {
          imageSource.hrefs = hrefs;
          resolve(imageSource);
        });
      });
    })

    Promise.all(hrefPromises).then(imageSources => {
      logger.info("Got all hrefs");
      const promises = imageSources.map(imageSource => {
        return new Promise(function(resolve, reject) {
          WallpaperManager.iterativelyDownloadImages(imageSource.hrefs, imageSources.length, function(url, processNextPath) {
            RemoteImageSyncer.addImage(url, imageSource.internalName).then(localImagePath => {
              ProcessedImageManager.addImageIfGoodAspectRatio(localImagePath).then((successfulImageProcessing) => {
                if (successfulImageProcessing) {
                  logger.info(`Added image for source: ${imageSource.displayName}, url: ${url}`);
                }
                processNextPath(successfulImageProcessing);
              });
            });
          }, function() { resolve(); });
        });
      });

      Promise.all(promises).then(() => {
        ProcessedImageManager.moveProcessedImagesToFinalDir();
        UserStore.writeLastRunTimestamp(new Date());
        logger.info("Successfully moved over final images");
        markJobCompleteCallback();
      });
    });
  }

  static iterativelyDownloadImages(urls, numImageSources, processPath, callback) {
    var nextItemIndex = 0;  //keep track of the index of the next item to be processed
    var success = 0;

    function processNextPath(successfulImageProcessing) {
      nextItemIndex++;
      if (successfulImageProcessing) {
        success += 1;
      }
      if(success === WallpaperManager.numImagesPerImageSource()[numImageSources] || nextItemIndex >= urls.length)
        callback();
      else
        processPath(urls[nextItemIndex], processNextPath);
    }

    processPath(urls[0], processNextPath);
  }

  static numImagesPerImageSource() {
    return {
      1: 10,
      2: 5,
      3: 4,
      4: 3,
      5: 2,
    };
  }
}

module.exports = WallpaperManager;
