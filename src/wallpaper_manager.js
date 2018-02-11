const execSync = require('child_process').execSync;
const fs = require('fs');
const path = require('path');

const RedditImageUrlFetcher = require('./reddit_image_url_fetcher.js')
const RemoteImageSyncer = require('./remote_image_syncer.js');
const ProcessedImageManager = require('./processed_image_manager.js');

class WallpaperManager {
  static get RAW_IMAGE_DIR() { return 'raw_images'; }
  static get PROCESSED_IMAGE_DIR() { return 'processed_images'; }

  static run() {
    RedditImageUrlFetcher.fetch().then(hrefs => {
      WallpaperManager.processImageUrls(hrefs);
    })
  }

  static processImageUrls(hrefs) {
    // Download remote images to local filesystem
    execSync(`mkdir -p ${this.RAW_IMAGE_DIR}`)
    hrefs.map(href => {
      RemoteImageSyncer.addImage(this.RAW_IMAGE_DIR, href, 'RedditEarthPorn')
    });

    execSync(`mkdir -p ${this.PROCESSED_IMAGE_DIR}`)
    fs.readdirSync(this.RAW_IMAGE_DIR).forEach(localImageName => {
      const localImagePath = path.join(this.RAW_IMAGE_DIR, localImageName);
      ProcessedImageManager.addImageIfGoodAspectRatio(this.PROCESSED_IMAGE_DIR, localImagePath);
    });

    execSync(`rm -rf ${this.RAW_IMAGE_DIR}`)
  }
}

module.exports = WallpaperManager;
