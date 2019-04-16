const electron = require('electron')
const imageSizer = require('image-size');
const jimp = require("jimp");
const logger = require('./logger.js')
const path = require('path');
const execSync = require('child_process').execSync;
const fs = require('fs');

const MetadataFile = require('./metadata_file.js')
const GeneralHelpers = require('./general_helpers.js')

class ProcessedImageManager {
  static get DESIRED_NUM_IMAGES() { return 10; }
  static get PROCESSED_IMAGE_DIR() { return 'Wallee-Images'; }

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
        const outputPath = this.localImagePath(path.basename(localImagePath))
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
    const imagePath = this.localImagePath(imageName)
    if (fs.existsSync(imagePath)) {
      execSync(`rm ${imagePath}`)
    } else {
      logger.info(`Trying to remove image but not found on filesystem: ${imagePath}`)
    }
    this.removeImageRecord(imageName)
  }

  static removeImageRecord(imageName) {
    const indexToRemove = this.findImageRecord(imageName);
    if (indexToRemove >= 0) {
      let imageRecords = this.readImageRecords();
      imageRecords.splice(indexToRemove, 1)
      this.writeImageRecords(imageRecords)
    }
  }

  static findImageRecord(imageName) {
    return this.readImageRecords().findIndex(element => {
      return element.imageName == imageName;
    });
  }

  static readImageRecords() {
    return MetadataFile.read(this.IMAGE_METADATA_FILE, [])
  }

  static writeImageRecords(imageRecords) {
    MetadataFile.write(this.IMAGE_METADATA_FILE, imageRecords)
  }

  static pruneOldImages() {
    const imageRecords = this.readImageRecords().sort((imageRecord1, imageRecord2) => {
      return imageRecord1.timestamp > imageRecord2.timestamp ? -1 : 1
    });

    // TODO: this will likely remove the most popular images first, since they
    // will be the first to be saved locally.
    //
    // Ensure there are only 10 images.
    while (imageRecords.length > this.DESIRED_NUM_IMAGES) {
      const imageRecord = imageRecords.pop();
      this.removeImage(imageRecord.imageName)
    }

    // Remove image files that have no corresponding record
    fs.readdirSync(this.FULL_PROCESSED_IMAGE_DIR).forEach(localImageFile => {
      const recordForLocalImage = imageRecords.find(imageRecord => {
        return imageRecord.imageName === localImageFile
      })
      if (!recordForLocalImage) {
        logger.warn(`Could not find image record for local image: ${localImageFile}`)
        this.removeImage(localImageFile)
      }
    });

    // Remove image records that have no corresponding file
    imageRecords.forEach(imageRecord => {
      if (!this.localImageFileExists(imageRecord.imageName)) {
        logger.warn(`Could not find image file for image record: ${imageRecord.imageName}`)
        this.removeImageRecord(imageRecord.imageName)
      }
    });
  }

  static localImagePath(imageName) {
    return path.join(this.FULL_PROCESSED_IMAGE_DIR, imageName);
  }

  static localImageFileExists(imageName) {
    return fs.existsSync(this.localImagePath(imageName));
  }
}

module.exports = ProcessedImageManager;
