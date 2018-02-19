const electron = require('electron')
const imageSizer = require('image-size');
const jimp = require("jimp");
const logger = require('./logger.js')
const path = require('path');
const execSync = require('child_process').execSync;

const MetadataFile = require('./metadata_file.js')
const GeneralHelpers = require('./general_helpers.js')

class ProcessedImageManager {
  static get PROCESSED_IMAGE_DIR() { return 'Wallpaper-Images'; }

  static get FULL_PROCESSED_IMAGE_DIR() {
    const homeDir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE; // Works on all OS's
    return path.join(homeDir, 'Desktop', this.PROCESSED_IMAGE_DIR);
  }

  static get ASPECT_RATIO_PERCENTAGE_DIFF() { return 0.3 }
  static get IMAGE_METADATA_FILE() { return 'image_metadata.json' }

  static addImageIfGoodAspectRatio(localImagePath) {
    return new Promise((resolve, reject) => {
      GeneralHelpers.mkdirp(this.FULL_PROCESSED_IMAGE_DIR)

      const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize
      const screenAspectRatio = width / (1.0 * height);
      let dimensions;

      try {
        dimensions = imageSizer(localImagePath);
      }
      catch (ex) {
        logger.info(`Cannot calculate size for image ${localImagePath}`)
        resolve();
      }

      const imageAspectRatio = dimensions.width / (1.0 * dimensions.height);

      // If the image is near enough to the native screens aspect ratio, resize
      // it. Otherwise remove it.
      if (Math.abs((imageAspectRatio - screenAspectRatio) / screenAspectRatio) < this.ASPECT_RATIO_PERCENTAGE_DIFF) {
        const outputPath = path.join(this.FULL_PROCESSED_IMAGE_DIR, path.basename(localImagePath))
        jimp.read(localImagePath).then(function (image) {
          image.cover(width, height);
          image.write(outputPath, () => {
            ProcessedImageManager.addImageRecord(path.basename(outputPath))
            resolve();
          })
        }).catch(function (err) {
          logger.info(err)
        });
      } else {
        resolve();
      }
    });
  }

  static addImageRecord(imageName) {
    if (this.findImageRecord(imageName) == -1) {
      let imageRecords = this.readImageRecords();
      imageRecords.push({
        imageName: imageName,
        timestamp: new Date(),
      })
      this.writeImageRecords(imageRecords)
    }
  }

  static removeImage(imageName) {
    execSync(`rm ${path.join(this.FULL_PROCESSED_IMAGE_DIR, imageName)}`)
    this.removeImageRecord(imageName)
  }

  static removeImageRecord(imageName) {
    const indexToRemove = this.findImageRecord(imageName);
    if (indexToRemove >= 0) {
      let imageRecords = this.readImageRecords();
      imageRecords.shift(indexToRemove, 1)
      this.writeImageRecords(imageRecords)
    }
  }

  static findImageRecord(imageName) {
    return this.readImageRecords().findIndex(element => {
      return element.imageName == imageName;
    });
  }

  static readImageRecords() {
    const fileContents = MetadataFile.read(this.IMAGE_METADATA_FILE)
    return fileContents ? JSON.parse(fileContents) : []
  }

  static writeImageRecords(imageRecords) {
    MetadataFile.write(this.IMAGE_METADATA_FILE, JSON.stringify(imageRecords, null, 4))
  }
}

module.exports = ProcessedImageManager;
