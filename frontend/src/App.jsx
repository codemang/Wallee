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
      onboardingStep: null,
    };

    ipcRenderer.on('reply-initial-payload', (event, initialPayload) => {
      this.setState(initialPayload);
    });
    ipcRenderer.send('request-initial-payload');
  }

  moveToStep(step) {
    ipcRenderer.send('set-onboarding-step', step);
    this.setState({onboardingStep: step});
  }

  acknowledgeWelcomeModal() {
    ipcRenderer.send('acknowledge-welcome-modal');
    this.setState({welcomeModalShown: true});
  }

  render() {
    if (this.state.onboardingStep === null) {
      return null;
    }

    return (
      <div>
        {this.state.onboardingStep !== 'complete' && <Onboarding step={this.state.onboardingStep} moveToStep={this.moveToStep.bind(this)} />}
        {this.state.onboardingStep === 'complete' && <Dashboard welcomeModalShown={this.state.welcomeModalShown} acknowledgeWelcomeModal={this.acknowledgeWelcomeModal.bind(this)}/>}
      </div>
    );
  }
}

export default hot(App);
