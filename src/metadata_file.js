const fs = require('fs');
const GeneralHelpers = require('./general_helpers.js')

class MetadataFile {
  static get METADATA_DIR() { return 'metadata' }

  static read(filename, defaultResponse=null) {
    const filepath = GeneralHelpers.localJoin(this.METADATA_DIR, filename);
    if (fs.existsSync(filepath)) {
      return fs.readFileSync(filepath, 'utf8');
    }
    return defaultResponse;
  }

  static write(filename, content) {
    GeneralHelpers.mkdirp(this.METADATA_DIR)
    const filepath = GeneralHelpers.localJoin(this.METADATA_DIR, filename);
    fs.writeFileSync(filepath, content);
  }
}

module.exports = MetadataFile;
