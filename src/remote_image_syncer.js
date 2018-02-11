const execSync = require('child_process').execSync;
const path = require('path');

class RemoteImageSyncer {
  static addImage(destinationDir, imageUrl, source) {
    let remoteImageName = path.basename(imageUrl)
    let localImageName = `${source}-${remoteImageName}`
    execSync(`curl -s ${imageUrl} > ${path.join(destinationDir, localImageName)}`);
  }
}

module.exports = RemoteImageSyncer;
