const execSync = require('child_process').execSync;
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const CONSTANTS = require('./constants.js');
const DatabaseClient = require('./database_client.js');
const GeneralHelpers = require('./general_helpers.js');
const ImagePreferencesManager = require('./image_preferences_manager.js');
const Logger = require('./logger.js')
const ProcessedImageManager = require('./processed_image_manager.js');
const RedditImageUrlFetcher = require('./reddit_image_url_fetcher.js')
const RemoteImageSyncer = require('./remote_image_syncer.js');

class WallpaperManager {
  static get EXECUTION_STALE_SECONDS() { return 60 * 60; } // 1 hour

  static refreshImages(options = {}, markJobCompleteCallback) {
    if (_.isEmpty(ImagePreferencesManager.followingImagePreferences())) {
      Logger.info(`No preferences set. Not refreshing images.`)
      markJobCompleteCallback();
      return;
    };

    const lastRunTimestamp = DatabaseClient.read(CONSTANTS.lastRunTimestamp);

    if (!options.forceRun && lastRunTimestamp && (new Date() - new Date(lastRunTimestamp))/1000 < WallpaperManager.EXECUTION_STALE_SECONDS) {
      Logger.info(`Last execution time '${lastRunTimestamp}' is too recent. Not refreshing images.`)
      markJobCompleteCallback();
      return;
    }

    if (options.forceRun) {
      Logger.info(`Called with forceRun == true. Refreshing images.`)
    } else {
      Logger.info(`Last execution time is too old. Refreshing images.`)
    }

    const hrefPromises = ImagePreferencesManager.followingImagePreferences().map(imageSource => {
      return new Promise(function(resolve, reject) {
        RedditImageUrlFetcher.fetch(imageSource.endpoint).then(hrefs => {
          imageSource.hrefs = hrefs;
          resolve(imageSource);
        });
      });
    })

    Promise.all(hrefPromises).then(imageSources => {
      Logger.info("Got all hrefs");
      const promises = imageSources.map(imageSource => {
        return new Promise(function(resolve, reject) {
          WallpaperManager.iterativelyDownloadImages(imageSource.hrefs, imageSources.length, function(url, processNextPath) {
            RemoteImageSyncer.addImage(url, imageSource.internalName).then(localImagePath => {
              ProcessedImageManager.addImageIfGoodAspectRatio(localImagePath).then((successfulImageProcessing) => {
                if (successfulImageProcessing) {
                  Logger.info(`Added image for source: ${imageSource.displayName}, url: ${url}`);
                }
                processNextPath(successfulImageProcessing);
              });
            });
          }, function() { resolve(); });
        });
      });

      Promise.all(promises).then(() => {
        ProcessedImageManager.moveProcessedImagesToFinalDir();
        DatabaseClient.set(CONSTANTS.lastRunTimestamp, new Date());
        Logger.info("Successfully moved over final images");
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
