import React, { Component } from 'react';
import ImageSource from './image_source';
import ImagePreview from './image_preview';
import FolderSelector from './folder_selector';
import DesktopSettingsOverview from './desktop_settings_overview';
import '../scss/styles';


// https://github.com/electron/electron/issues/9920
const { ipcRenderer } = window.require('electron');

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imageSources: [],
      view: 'images',
    };
    ipcRenderer.on('reply-image-sources', (event, imageSources) => {
      this.setState({ imageSources });
      const followingImage = _.find(imageSources, imageSource => {
        return imageSource.isFollowing === true;
      });
      // Always have an image source selected. If the user is following any
      // image source, use the first from that list. If not, use the first from
      // all image sources.
      this.setActiveImageSourceInternalName((followingImage || imageSources[0]).internalName);
    });
    ipcRenderer.send('request-image-sources');
  }

  setActiveImageSourceInternalName(internalName) {
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
    const imageSourceButtons = _.compact(_.map(this.state.imageSources, imageSource => {
      if (imageSource.isFollowing === options.isFollowing) {
        return (
          <ImageSource
            displayName={imageSource.displayName}
            internalName={imageSource.internalName}
            clickCallback={this.setActiveImageSourceInternalName.bind(this)}
            isActive={
              this.state.activeImageSourceInternalName ==
              imageSource.internalName
            }
            isFollowing={imageSource.isFollowing}
          />
        );
      }
    }));

    if (_.isEmpty(imageSourceButtons)) {
      return (
        <ImageSource
          displayName='None'
          clickCallback={() => {}}
          canBeClicked={false}
        />
      );
    } else  {
      return imageSourceButtons;
    }
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

  renderWelcomeModal() {
    return (
      <div className="modal-outer-container">
        <div className="modal-inner-container centered-container">
          <p class="onboarding-big-txt">Start Exploring!</p>
          <p>Explore the categories on the left by clicking on them.</p>
          <p>Once you find one you like, click the Follow button and those types of photos will be added to your background.</p>
          <button className="button follow-button" onClick={this.props.acknowledgeWelcomeModal.bind(this)}>Let's Go!</button>
        </div>
      </div>
    );
  }

  moveToView(view) {
    this.setState(_.assign(this.state, {view}));
  }

  renderImageView() {
    return (
      <div>
        <div className="image-source-selector-pane">
          <div class="overflow-container">
            <div class="image-source-list">
              <div class="image-source-label">FOLLOWING</div>
              {this.renderImageSourceButtons({ isFollowing: true })}
            </div>
            <div class="image-source-list">
              <div class="image-source-label">EXPLORE</div>
              {this.renderImageSourceButtons({ isFollowing: false })}
            </div>
          </div>
        </div>
        <div class="container-fluid image-source-overview">
          <div class="row">
            <div class="col-sm-9 overflow-container">
              {this.selectedImageSource() && this.renderPreviewImages()}
              {!this.selectedImageSource() && this.renderAppIntro()}
            </div>
            <div class="col-sm-3 overflow-container">
              {this.selectedImageSource() && this.renderImageSourceOverview()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderSettingsView() {
    let content;
    if (this.state.view === 'folder_selector') {
      content = <FolderSelector successCallback={this.moveToView.bind(this, 'desktop_settings_overview')} submitButtonCopy='Update'/>
    } else {
      content = <DesktopSettingsOverview continueCallback={this.moveToView.bind(this, 'images')}/>;
    }
    return (
      <div className="centered-container small-container">
        {content}
      </div>
    );
  }

  currentNavItem() {
    if (this.state.view === 'images') {
      return 'images';
    } else if (this.state.view === 'folder_selector' || this.state.view === 'desktop_settings_overview') {
      return 'settings';
    }
    return null;
  }

  render() {
    return (
      <div>
        {!this.props.welcomeModalShown && this.renderWelcomeModal()}
        <div class="top-bar">
          <div class="logo">Wallee</div>
          <div class={`nav-item ${this.currentNavItem() === 'images' ? 'nav-item-selected' : ''}`} onClick={this.moveToView.bind(this, 'images')}>Images</div>
          <div class={`nav-item ${this.currentNavItem() === 'settings' ? 'nav-item-selected' : ''}`} onClick={this.moveToView.bind(this, 'folder_selector')}>Settings</div>
        </div>
        <div class="body">
          {this.currentNavItem() === 'images' && this.renderImageView()}
          {this.currentNavItem() === 'settings' && this.renderSettingsView()}
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

Dashboard.propTypes = {
  welcomeModalShown: PropTypes.bool,
  acknowledgeWelcomeModal: PropTypes.function,
};

export default Dashboard;
