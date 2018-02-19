const path = require('path');
const fs = require('fs');

class GeneralHelpers {
  static get projectDir() { return path.dirname(__dirname); }

  static localMkdirp(relativePathToCreate) {
    this.mkdirp(this.localJoin(relativePathToCreate));
  }

  static mkdirp(path) {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
  }

  static localJoin(...args) {
    return path.join(this.projectDir, ...args);
  }
}

module.exports = GeneralHelpers;
