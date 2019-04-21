import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

const ImageSource = ({
  displayName,
  internalName,
  isChecked,
  isActive,
  clickCallback,
}) => (
  <div className="image-source-container">
    <div
      className={`image-source-button ${isActive ? 'image-source-active' : ''}`}
      onClick={clickCallback.bind(this, internalName)}
    >
      {displayName}
    </div>
  </div>
);

ImageSource.propTypes = {
  displayName: PropTypes.string,
  internalName: PropTypes.string,
  isChecked: PropTypes.boolean,
  isActive: PropTypes.boolean,
  clickCallback: PropTypes.func,
};

export default ImageSource;
