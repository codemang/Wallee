import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

const DesktopSettingsOverview = ({
  continueCallback,
}) => (
<div>
  <p>Configure your computer to use the photos as your background.</p>
  <p>1. System Preferences -> Desktop and Screen Saver</p>
  <p>2. Click the + icon in the bottom left corner</p>
  <p>3. Find the folder you inputted in the previous step. Within that folder there is a new “Wallee-Images” folder. Hit the “Choose” button.</p>
  <p>4. At the bottom, ensure the “Change picture” toggle button is enabled. Change the frequency at which the photos change if you desire.</p>
  <button className="button follow-button" onClick={continueCallback}>Continue</button>
</div>
);

DesktopSettingsOverview.propTypes = {
  continueCallback: PropTypes.function,
};

export default DesktopSettingsOverview;
