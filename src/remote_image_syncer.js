const execSync = require('child_process').execSync;
const path = require('path');
const fs = require('fs');

const GeneralHelpers = require('./general_helpers.js')

class RemoteImageSyncer {
  static get RAW_IMAGE_DIR() { return 'raw_images'; }

  static addImage(imageUrl, source) {
    GeneralHelpers.mkdirp(this.RAW_IMAGE_DIR)
    let remoteImageName = path.basename(imageUrl)
    let localImageName = `${source}-${remoteImageName}`
    execSync(`curl -s ${imageUrl} > ${GeneralHelpers.localJoin(this.RAW_IMAGE_DIR, localImageName)}`);
  }

  static localImagePaths() {
    return fs.readdirSync(path.join(GeneralHelpers.projectDir, this.RAW_IMAGE_DIR)).map(filename => {
      return path.join(GeneralHelpers.projectDir, this.RAW_IMAGE_DIR, filename)
    });
  }

  static cleanUp() {
    execSync(`rm -rf ${path.join(GeneralHelpers.projectDir, this.RAW_IMAGE_DIR)}`)
  }
}

module.exports = RemoteImageSyncer;
