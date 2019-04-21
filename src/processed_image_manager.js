const electron = require('electron')
const imageSizer = require('image-size');
const jimp = require("jimp");
const logger = require('./logger.js')
const path = require('path');
const execSync = require('child_process').execSync;
const fs = require('fs');

const UserStore = require('./user_store.js')
const MetadataFile = require('./metadata_file.js')
const GeneralHelpers = require('./general_helpers.js')

class ProcessedImageManager {
  static get PROCESSED_IMAGE_DIR() { return 'Wallee-Images'; }
  static get TEMP_IMAGE_DIR() { return 'processed_images'; }
  static get ASPECT_RATIO_PERCENTAGE_DIFF() { return 0.3 }

  static addImageIfGoodAspectRatio(localImagePath) {
    return new Promise(async (resolve, reject) => {
      GeneralHelpers.localMkdirp(this.TEMP_IMAGE_DIR)

      const screenAspectRatio = UserStore.screenWidth() / (1.0 * UserStore.screenHeight());
      let dimensions;

      try {
        dimensions = imageSizer(localImagePath);
      } catch (ex) {
        // Cannot calculate size for image
        resolve(false);
        return;
      }

      if (!dimensions) {
        resolve(false);
        return;
      }

      const imageAspectRatio = dimensions.width / (1.0 * dimensions.height);

      // If the image is near enough to the native screens aspect ratio, resize
      // it. Otherwise remove it.
      if (Math.abs((imageAspectRatio - screenAspectRatio) / screenAspectRatio) < this.ASPECT_RATIO_PERCENTAGE_DIFF) {
        const outputPath = this.processedImagePath(path.basename(localImagePath));
        jimp.read(localImagePath).then(function (image) {
          image.cover(UserStore.screenWidth(), UserStore.screenHeight());
          image.write(outputPath, () => {
            resolve(true);
          })
        }).catch(function (err) {
          logger.info(err)
          resolve(false);
        });
      } else {
        resolve(false);
        return;
      }
    });
  }

  static moveProcessedImagesToFinalDir() {
    const homeDir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE; // Works on all OS's
    const fullProcessedImagePath = path.join(homeDir, 'Desktop', this.PROCESSED_IMAGE_DIR);
    GeneralHelpers.mkdirp(fullProcessedImagePath);;
    execSync(`rm -f ${fullProcessedImagePath}/*`);
    execSync(`mv ${GeneralHelpers.localJoin(this.TEMP_IMAGE_DIR)}/* ${fullProcessedImagePath}`);
    execSync(`rm -rf ${GeneralHelpers.localJoin(this.TEMP_IMAGE_DIR)}`);
  }

  static processedImagePath(imageName) {
    return GeneralHelpers.localJoin(this.TEMP_IMAGE_DIR, imageName);
  }
}

module.exports = ProcessedImageManager;
