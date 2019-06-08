import { hot } from 'react-hot-loader/root';
import React, { Component } from 'react';

import Dashboard from './components/dashboard';
import Onboarding from './components/onboarding';

// https://github.com/electron/electron/issues/9920
const { ipcRenderer } = window.require('electron');

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      step: null,
    };

    ipcRenderer.on('reply-onboarding-step', (event, onboardingStep) => {
      this.setState({step: onboardingStep});
    });
    ipcRenderer.send('request-onboarding-step');
  }

  moveToStep(step) {
    ipcRenderer.send('set-onboarding-step', step);
    this.setState({step: step});
  }

  render() {
    if (this.state.step === null) {
      return null;
    }

    return (
      <div>
        {this.state.step !== 'complete' && <Onboarding step={this.state.step} moveToStep={this.moveToStep.bind(this)} />}
        {this.state.step === 'complete' && <Dashboard />}
      </div>
    );
  }
}

export default hot(App);
