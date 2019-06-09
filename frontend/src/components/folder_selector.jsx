import React, { Component } from 'react';
import '../scss/styles';

// https://github.com/electron/electron/issues/9920
const { ipcRenderer } = window.require('electron');

class FolderSelector extends Component {
  constructor(props) {
    super(props);
    ipcRenderer.on('reply-photo-dir', (event, selectedDir) => {
      this.setState({ selectedDir });
    });
    ipcRenderer.send('request-photo-dir');
    this.state = {};
  }

  selectFolder() {
    ipcRenderer.on('reply-select-photo-dir', (event, selectedDir) => {
      this.setState({ selectedDir });
    });
    ipcRenderer.send('select-photo-dir');
  }

  renderFolderSelectorInput() {
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

  submitButtonCallback() {
    if (!this.state.selectedDir) {
      this.setState(_.assign(this.state, {showError: true}));
      return;
    }

    ipcRenderer.send('update-photo-dir', this.state.selectedDir);
    this.props.successCallback();
  }

  renderError() {
    return (
      <div className="error-container">
        <p className="error-text">You must select a directory to continue.</p>
      </div>
    );
  }

  render() {
    return (
      <div>
        <p>Choose where you want the images stored.</p>
        {this.renderFolderSelectorInput()}
        {this.state.showError && this.renderError()}
        <button className="button follow-button" onClick={this.submitButtonCallback.bind(this)}>{this.props.submitButtonCopy}</button>
      </div>
    );
  }
}

FolderSelector.propTypes = {
  successCallback: PropTypes.function,
  submitButtonCopy: PropTypes.string,
};

FolderSelector.defaultProps = {
  submitButtonCopy: 'Continue',
};

export default FolderSelector;
