const execSync = require('child_process').execSync;
const fs = require('fs');
const path = require('path');

const RedditImageUrlFetcher = require('./reddit_image_url_fetcher.js')
const RemoteImageSyncer = require('./remote_image_syncer.js');
const ProcessedImageManager = require('./processed_image_manager.js');

class WallpaperManager {
  static run() {
    RedditImageUrlFetcher.fetch().then(hrefs => {
      hrefs.forEach(href => {
        RemoteImageSyncer.addImage(href, 'RedditEarthPorn')
      });
      RemoteImageSyncer.localImagePaths().forEach(localImagePath => {
        ProcessedImageManager.addImageIfGoodAspectRatio(localImagePath);
      })
      RemoteImageSyncer.cleanUp();
    })
  }
}

module.exports = WallpaperManager;
