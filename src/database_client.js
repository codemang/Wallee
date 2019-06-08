const _ = require('lodash');

const MetadataFile = require('./metadata_file.js')

class DatabaseClient {
  static get EXECUTION_METADATA() { return 'execution_metadata.json'; }

  static set(key, value) {
    this.writeLocalData(_.assign(this.readLocalData(), {[key]: value}));
  }

  static read(key) {
    return this.readLocalData()[key]
  }

  static runIfKeyNotSet(key, callback) {
    if (!this.read(key)) {
      callback();
      this.set(key, true);
    }
  }

  static readLocalData(imagePreferences = []) {
    return MetadataFile.read(this.EXECUTION_METADATA, {})
  }

  static writeLocalData(data = {}) {
    MetadataFile.write(this.EXECUTION_METADATA, data)
  }
}

module.exports = DatabaseClient;
