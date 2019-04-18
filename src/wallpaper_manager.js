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

  static refreshImages() {
    logger.info("Starting main loop")

    const executionMetadata = MetadataFile.read(WallpaperManager.EXECUTION_METADATA, {})
    if (executionMetadata.timestamp && (new Date() - new Date(executionMetadata.timestamp))/1000 < WallpaperManager.EXECUTION_STALE_SECONDS) {
      logger.info(`Last execution time '${executionMetadata.timestamp}' is too recent. Skipping.`)
      return;
    }

    logger.info(`Last execution time is too old. Proceeding.`)

    const hrefPromises = WallpaperManager.imageSources().map(imageSource => {
      return new Promise(function(resolve, reject) {
        RedditImageUrlFetcher.fetch(imageSource.endpoint).then(hrefs => {
          imageSource.hrefs = hrefs;
          resolve(imageSource);
        });
      });
    })

    Promise.all(hrefPromises).then(imageSources => {
      const promises = imageSources.map(imageSource => {
        return new Promise(function(resolve, reject) {
          WallpaperManager.iterativelyDownloadImages(imageSource.hrefs, imageSources.length, function(url, processNextPath) {
            const localImagePath = RemoteImageSyncer.addImage(url, imageSource.internalName);
            ProcessedImageManager.addImageIfGoodAspectRatio(localImagePath).then((successfulImageProcessing) => {
              if (successfulImageProcessing) {
                logger.info(`Added image for source: ${imageSource.displayName}, url: ${url}`);
              }
              processNextPath(successfulImageProcessing);
            });
          }, function() { resolve(); });
        });
      });

      Promise.all(promises).then(() => {
        ProcessedImageManager.moveProcessedImagesToFinalDir();
        MetadataFile.write(WallpaperManager.EXECUTION_METADATA, {timestamp: new Date()})
        logger.info("Successfully moved over final images");
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

  static imageSources() {
    return [
      {
        displayName: 'Earth Porn (reddit)',
        internalName: 'earth_porn_reddit',
        endpoint: 'https://www.reddit.com/r/EarthPorn.json'
      },
      {
        displayName: 'I Took A Picture (reddit)',
        internalName: 'i_took_a_picture_reddit',
        endpoint: 'https://www.reddit.com/r/itookapicture.json'
      },
    ];
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
