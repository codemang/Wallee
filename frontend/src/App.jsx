import React, { Component } from 'react';
import { hot } from 'react-hot-loader/root';
import ImageSource from './components/image_source';
import ImagePreview from './components/image_preview';
import './scss/styles';


// https://github.com/electron/electron/issues/9920
const { ipcRenderer } = window.require('electron');

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imageSources: [],
    };
    ipcRenderer.on('reply-image-sources', (event, imageSources) => {
      this.setState({ imageSources });
    });
    ipcRenderer.send('request-image-sources');
  }

  imageSourceClicked(internalName) {
    this.setState(
      Object.assign(this.state, {
        activeImageSourceInternalName: internalName,
      }),
    );
  }

  toggleImageSource(internalName) {
    ipcRenderer.send('toggle-image-following', internalName);
  }

  renderImageSourceButtons(options = {}) {
    return _.map(this.state.imageSources, imageSource => {
      if (imageSource.isFollowing === options.isFollowing) {
        return (
          <ImageSource
            displayName={imageSource.displayName}
            internalName={imageSource.internalName}
            clickCallback={this.imageSourceClicked.bind(this)}
            isActive={
              this.state.activeImageSourceInternalName ==
              imageSource.internalName
            }
            isFollowing={imageSource.isFollowing}
          />
        );
      }
    });
  }

  selectedImageSource() {
    return _.find(this.state.imageSources, [
      'internalName',
      this.state.activeImageSourceInternalName,
    ]);
  }

  renderPreviewImages() {
    return (
      <div>
        <p class="image-source-label">PREVIEW</p>
        <ImagePreview internalName={this.selectedImageSource().internalName} />
      </div>
    );
  }

  renderImageSourceOverview() {
    const selectedImageSource = this.selectedImageSource();
    return (
      <div>
        <p class="image-source-label">OVERVIEW</p>
        <p class="image-source-name">{selectedImageSource.sourceLabel}</p>
        <p class="image-source-description">
          {selectedImageSource.description}
        </p>
        <div
          class={`button ${
            selectedImageSource.isFollowing
              ? 'unfollow-button'
              : 'follow-button'
          }`}
          onClick={this.toggleImageSource.bind(
            this,
            selectedImageSource.internalName,
          )}
        />
      </div>
    );
  }

  renderAppIntro() {
    return (
      <p>
        Welcome to Wallee. Click on the categories to the left to start
        exploring.
      </p>
    );
  }

  render() {
    return (
      <div>
        <div class="top-bar">
          <p class="logo">Wallee</p>
          <p class="nav-item nav-item-selected">Images</p>
          <p class="nav-item">Settings</p>
        </div>
        <div class="body">
          <div class="container-fluid">
            <div class="row">
              <div class="col-sm-3 overflow-container">
                <div class="image-source-list">
                  <p class="image-source-label">FOLLOWING</p>
                  {this.renderImageSourceButtons({ isFollowing: true })}
                </div>
                <div class="image-source-list">
                  <p class="image-source-label">EXPLORE</p>
                  {this.renderImageSourceButtons({ isFollowing: false })}
                </div>
              </div>
              <div class="col-sm-6 overflow-container">
                {this.selectedImageSource() && this.renderPreviewImages()}
                {!this.selectedImageSource() && this.renderAppIntro()}
              </div>
              <div class="col-sm-3 overflow-container">
                {this.selectedImageSource() && this.renderImageSourceOverview()}
              </div>
            </div>
          </div>
        </div>
        <div class="bottom-bar">
          <p class="love">
            Made with ❤️ by <a>Nate Rubin</a>
          </p>
        </div>
        <div class="hidden "> </div>
      </div>
    );
  }
}

export default hot(App);
