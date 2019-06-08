const _ = require('lodash');

const CONSTANTS = require('./constants.js');
const DatabaseClient = require('./database_client.js')
const InitialImageSources= require('./initial_image_sources');
const Logger = require('./logger.js');

class ImagePreferencesManager {
  static imagePreferences() {
    return DatabaseClient.read(CONSTANTS.imagePreferences);
  }

  static toggleImagePreference(internalName) {
    Logger.info("Toggled image following for: " + internalName);
    const imageSources = this.imagePreferences();
    let imageSource = _.find(imageSources, ['internalName', internalName]);
    imageSource.isFollowing = !imageSource.isFollowing;
    DatabaseClient.set(CONSTANTS.imagePreferences, imageSources);
  }

  static followingImagePreferences() {
    return _.filter(this.imagePreferences(), imageSource => {
      return imageSource.isFollowing;
    });
  }

  static initImagePreferences() {
    DatabaseClient.set(CONSTANTS.imagePreferences, InitialImageSources);
  }
}

module.exports = ImagePreferencesManager;
