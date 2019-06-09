import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

const ImageSource = ({
  displayName,
  internalName,
  isFollowing,
  isActive,
  clickCallback,
  canBeClicked,
}) => (
  <div className="image-source-container">
    <div
      className={`image-source-button ${isActive ? 'image-source-active' : ''} ${canBeClicked ? 'image-source-clickable' : 'image-source-non-clickable'}`}
      onClick={clickCallback.bind(this, internalName)}
    >
      {displayName}
      {isFollowing && <i className="fa fa-check check"></i>}
    </div>
  </div>
);

ImageSource.propTypes = {
  displayName: PropTypes.string,
  internalName: PropTypes.string,
  isFollowing: PropTypes.boolean,
  isActive: PropTypes.boolean,
  clickCallback: PropTypes.func,
  canBeClicked: PropTypes.boolean,
};

ImageSource.defaultProps = {
  canBeClicked: true,
}

export default ImageSource;
