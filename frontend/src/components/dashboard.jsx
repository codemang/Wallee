import React, { Component } from 'react';
import ImageSource from './image_source';
import ImagePreview from './image_preview';
import '../scss/styles';


// https://github.com/electron/electron/issues/9920
const { ipcRenderer } = window.require('electron');

class Dashboard extends Component {
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
        <div class="image-source-label">PREVIEW</div>
        <ImagePreview internalName={this.selectedImageSource().internalName} />
      </div>
    );
  }

  renderImageSourceOverview() {
    const selectedImageSource = this.selectedImageSource();
    const buttonText = selectedImageSource.isFollowing ? 'Unfollow' : 'Follow';
    return (
      <div>
        <div class="image-source-label">OVERVIEW</div>
        <div class="image-source-name">{selectedImageSource.sourceLabel}</div>
        <div class="image-source-description">
          {selectedImageSource.description}
        </div>
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
        >{buttonText}</div>
      </div>
    );
  }

  renderAppIntro() {
    return (
      <div>
        Welcome to Wallee. Click on the categories to the left to start
        exploring.
      </div>
    );
  }

  render() {
    return (
      <div>
        <div class="top-bar">
          <div class="logo">Wallee</div>
          <div class="nav-item nav-item-selected">Images</div>
          <div class="nav-item">Settings</div>
        </div>
        <div class="body">
          <div class="container-fluid">
            <div class="row">
              <div class="col-sm-3 overflow-container">
                <div class="image-source-list">
                  <div class="image-source-label">FOLLOWING</div>
                  {this.renderImageSourceButtons({ isFollowing: true })}
                </div>
                <div class="image-source-list">
                  <div class="image-source-label">EXPLORE</div>
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
          <div class="love">
            Made with ❤️ by <a>Nate Rubin</a>
          </div>
        </div>
        <div class="hidden "> </div>
      </div>
    );
  }
}

export default Dashboard;
