const MetadataFile = require('./metadata_file.js')
const _ = require('lodash');

class UserStore {
  static get EXECUTION_METADATA() { return 'execution_metadata.json'; }

  static writeImagePreferences(imagePreferences = []) {
    let userData = UserStore.readImagePreferences();
    userData.imagePreferences = imagePreferences
    MetadataFile.write(UserStore.EXECUTION_METADATA, userData);
  }

  static writeLastRunTimestamp(lastRunTimestamp) {
    let userData = UserStore.readImagePreferences();
    userData.lastRunTimestamp = lastRunTimestamp;
    MetadataFile.write(UserStore.EXECUTION_METADATA, userData);
  }

  static writeScreenSize(screenWidth, screenHeight) {
    let userData = UserStore.readImagePreferences();
    userData.screenWidth = screenWidth;
    userData.screenHeight = screenHeight;
    MetadataFile.write(UserStore.EXECUTION_METADATA, userData);
  }

  static screenWidth() {
    return UserStore.readImagePreferences().screenWidth;
  }
  static screenHeight() {
    return UserStore.readImagePreferences().screenHeight;
  }

  static followingImagePreferences() {

    return _.filter(MetadataFile.read(UserStore.EXECUTION_METADATA, {}).imagePreferences, imageSource => {
      return imageSource.isFollowing;
    });
  }

  static readImagePreferences(imagePreferences = []) {
    return MetadataFile.read(UserStore.EXECUTION_METADATA, {})
  }

  static isInitialized() {
    const executionMetadata = MetadataFile.read(UserStore.EXECUTION_METADATA, {})
    return !_.isNil(executionMetadata.imagePreferences);
  }

  static lastRunTimestamp() {
    const executionMetadata = MetadataFile.read(UserStore.EXECUTION_METADATA, {})
    return executionMetadata ? executionMetadata.lastRunTimestamp : null;
  }
}
module.exports = UserStore;
