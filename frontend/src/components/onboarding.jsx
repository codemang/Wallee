import React, { Component } from 'react';
import '../scss/styles';

// https://github.com/electron/electron/issues/9920
const { ipcRenderer } = window.require('electron');

class Onboarding extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  selectFolder() {
    ipcRenderer.on('reply-select-photo-dir', (event, selectedDir) => {
      this.setState({ selectedDir });
    });
    ipcRenderer.send('select-photo-dir');
  }

  renderFolderSelector() {
    let folderText;
    if (this.state.selectedDir) {
      folderText = <p className="folder-text">{this.state.selectedDir.split('/').slice(-1)[0]}</p>;
    } else {
      folderText = <p className="folder-text folder-text-inactive">No Folder Chosen</p>;
    }
    return (
      <div className='folder-selector-container'>
        {folderText}
        <div className='folder-selector-button' onClick={this.selectFolder.bind(this)}>
          Choose Folder
        </div>
      </div>
    );
  }

  renderStepThree() {
    return (
      <div>
        <p class="onboarding-big-txt">Step #2</p>
        <p>Configure your computer to use the photos as your background.</p>
        <p>1. System Preferences -> Desktop and Screen Saver</p>
        <p>2. Click the + icon in the bottom left corner</p>
        <p>3. Find the folder you inputted in the previous step. Within that folder there is a new “Wallee-Images” folder. Hit the “Choose” button.</p>
        <p>4. At the bottom, ensure the “Change picture” toggle button is enabled. Change the frequency at which the photos change if you desire.</p>
        <button className="button follow-button" onClick={this.props.moveToStep.bind(this, 'complete')}>Continue</button>
      </div>
    );
  }

  renderStepTwo() {
    return (
      <div>
        <p class="onboarding-big-txt">Step #1</p>
        <p>Choose where you want the images stored.</p>
        {this.renderFolderSelector()}
        <button className="button follow-button" onClick={this.props.moveToStep.bind(this, '3')}>Continue</button>
      </div>
    );
  }

  renderStepOne() {
    return (
      <div>
        <p class="onboarding-big-txt">Welcome to <span class="logo-color">Wallee!</span></p>
        <p>Wallee is an application that finds gorgeous photos from your favorite categories and sets them as your computer background.</p>
        <p>Get started in just <b>two simple steps</b>.</p>
        <p>1. Select where you want the photos stored</p>
        <p>2. Configure your computer to use the photos as your background</p>
        <button className="button follow-button" onClick={this.props.moveToStep.bind(this, '2')}>Get Started!</button>
      </div>
    );
  }

  render() {
    let content;
    if (this.props.step === '1') {
      content = this.renderStepOne();
    } else if (this.props.step === '2') {
      content = this.renderStepTwo();
    } else if (this.props.step === '3') {
      content = this.renderStepThree();
    }

    return (
      <div className="onboarding-container">
        {content}
      </div>
    );
  }
}

Onboarding.propTypes = {
  step: PropTypes.string,
  moveToStep: PropTypes.function,
};

export default Onboarding;
