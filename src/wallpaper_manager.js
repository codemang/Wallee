const execSync = require('child_process').execSync;
const fs = require('fs');
const path = require('path');

const RedditImageUrlFetcher = require('./reddit_image_url_fetcher.js')
const RemoteImageSyncer = require('./remote_image_syncer.js');
const ProcessedImageManager = require('./processed_image_manager.js');
const ImageCleaner = require('./image_cleaner.js')

class WallpaperManager {
  static run() {
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
      })
    })
  }
}

module.exports = WallpaperManager;
