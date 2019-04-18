const execSync = require('child_process').execSync;
const path = require('path');
const fs = require('fs');

const GeneralHelpers = require('./general_helpers.js')

class RemoteImageSyncer {
  static get RAW_IMAGE_DIR() { return 'raw_images'; }

  static addImage(imageUrl, source) {
    GeneralHelpers.localMkdirp(this.RAW_IMAGE_DIR)
    let remoteImageName = path.basename(imageUrl)
    let localImageName = `${source}::${remoteImageName}`
    const localImagePath = GeneralHelpers.localJoin(this.RAW_IMAGE_DIR, localImageName);
    execSync(`curl -s ${imageUrl} > ${localImagePath}`);
    return localImagePath;
  }
}

module.exports = RemoteImageSyncer;
