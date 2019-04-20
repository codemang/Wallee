const exec = require('child_process').exec;
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
    return new Promise(function(resolve, reject) {
      const cmd = `curl -s ${imageUrl} > ${localImagePath}`;
      const callback = (error, stdout, stderr) => {
        resolve(localImagePath);
      };
      exec(cmd, callback);
    });
  }
}

module.exports = RemoteImageSyncer;
