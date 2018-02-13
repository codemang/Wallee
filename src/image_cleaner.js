const execSync = require('child_process').execSync;

const ProcessedImageManager = require('./processed_image_manager.js')

class ImageCleaner {
  static get DESIRED_NUM_IMAGES() { return 10; }

  static pruneOldImages() {
    const imageRecords = ProcessedImageManager.readImageRecords().sort((imageRecord1, imageRecord2) => {
      return imageRecord1.timestamp > imageRecord2.timestamp ? -1 : 1
    });

    // TODO: this will likely remove the most popular images first, since they
    // will be the first to be saved locally.
    while (imageRecords.length > this.DESIRED_NUM_IMAGES) {
      const imageRecord = imageRecords.pop();
      ProcessedImageManager.removeImage(imageRecord.imageName)
    }
  }
}

module.exports = ImageCleaner;
