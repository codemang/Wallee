const GeneralHelpers = require('./general_helpers.js')
const DatabaseClient = require('./database_client.js')
const execSync = require('child_process').execSync;
const path = require('path');
const CONSTANTS = require('./constants.js');

class FinalImageDirManager {
  static get PROCESSED_IMAGE_DIR() { return 'Wallee-Images'; }

  static updateFinalImageParentDir(newFinalImageParentDir) {
    if (this.finalImageParentDir() && execSync(`test -d ${this.finalImageDir()}`)) {
      execSync(`rm -rf ${this.finalImageDir()}`);
    }
    DatabaseClient.set(CONSTANTS.finalImagesParentDir, newFinalImageParentDir);

    // Will use new parent dir when generating the full path to the final dir
    GeneralHelpers.mkdirp(this.finalImageDir());
  }


  static syncNewImages(newImageDir) {
    execSync(`rm -f ${this.finalImageDir()}/*`);
    execSync(`mv ${newImageDir}/* ${this.finalImageDir()}`);
  }

  static finalImageDir() {
    const homeDir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE; // Works on all OS's
    return path.join(this.finalImageParentDir(), this.PROCESSED_IMAGE_DIR);
  }

  static finalImageParentDir() {
    return DatabaseClient.read(CONSTANTS.finalImagesParentDir);
  }
}

module.exports = FinalImageDirManager;
