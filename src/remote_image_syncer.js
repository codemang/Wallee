const execSync = require('child_process').execSync;
const path = require('path');
const fs = require('fs');

class RemoteImageSyncer {
  static get RAW_IMAGE_DIR() { return 'raw_images'; }

  static addImage(imageUrl, source) {
    execSync(`mkdir -p ${this.RAW_IMAGE_DIR}`)
    let remoteImageName = path.basename(imageUrl)
    let localImageName = `${source}-${remoteImageName}`
    execSync(`curl -s ${imageUrl} > ${path.join(this.RAW_IMAGE_DIR, localImageName)}`);
  }

  static localImagePaths() {
    return fs.readdirSync(this.RAW_IMAGE_DIR).map(filename => {
      return path.join(this.RAW_IMAGE_DIR, filename)
    });
  }

  static cleanUp() {
    execSync(`rm -rf ${this.RAW_IMAGE_DIR}`)
  }
}

module.exports = RemoteImageSyncer;
