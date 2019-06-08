const imageSizer = require('image-size');
const jimp = require("jimp");
const path = require('path');
const execSync = require('child_process').execSync;

const CONSTANTS = require('./constants.js');
const DatabaseClient = require('./database_client.js');
const GeneralHelpers = require('./general_helpers.js');
const Logger = require('./logger.js');
const MetadataFile = require('./metadata_file.js');
const FinalImageDirManager = require('./final_image_dir_manager.js');

class ProcessedImageManager {
  static get TEMP_IMAGE_DIR() { return 'processed_images'; }
  static get ASPECT_RATIO_PERCENTAGE_DIFF() { return 0.3 }

  static addImageIfGoodAspectRatio(localImagePath) {
    return new Promise(async (resolve, reject) => {
      GeneralHelpers.localMkdirp(this.TEMP_IMAGE_DIR)

      const screenAspectRatio = DatabaseClient.read(CONSTANTS.screenWidth) / (1.0 * DatabaseClient.read(CONSTANTS.screenHeight));
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
          image.cover(DatabaseClient.read(CONSTANTS.screenWidth), DatabaseClient.read(CONSTANTS.screenHeight));
          image.write(outputPath, () => {
            resolve(true);
          })
        }).catch(function (err) {
          Logger.info(err)
          resolve(false);
        });
      } else {
        resolve(false);
        return;
      }
    });
  }

  static moveProcessedImagesToFinalDir() {
    const sourceDir = GeneralHelpers.localJoin(this.TEMP_IMAGE_DIR);
    FinalImageDirManager.syncNewImages(sourceDir);
    execSync(`rm -rf ${sourceDir}`);
  }

  static processedImagePath(imageName) {
    return GeneralHelpers.localJoin(this.TEMP_IMAGE_DIR, imageName);
  }
}

module.exports = ProcessedImageManager;
