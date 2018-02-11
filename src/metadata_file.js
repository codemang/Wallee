const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;

class MetadataFile {
  static get METADATA_DIR() { return 'metadata' }

  static read(filename, defaultResponse=null) {
    const filepath = path.join(this.METADATA_DIR, filename);
    if (fs.existsSync(filepath)) {
      return fs.readFileSync(filepath, 'utf8');
    }
    return defaultResponse;
  }

  static write(filename, content) {
    execSync(`mkdir -p ${this.METADATA_DIR}`);
    const filepath = path.join(this.METADATA_DIR, filename);
    fs.writeFileSync(filepath, content);
  }
}

module.exports = MetadataFile;
