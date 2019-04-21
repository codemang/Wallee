import React, { Component } from 'react';
import PropTypes from 'prop-types';

import earthpornImage1 from '../images/earthporn.jpg';
import earthpornImage2 from '../images/earthporn2.jpg';
import earthpornImage3 from '../images/earthporn3.jpg';
import earthpornImage4 from '../images/earthporn4.jpg';
import earthpornImage5 from '../images/earthporn5.jpg';

import mountainImage1 from '../images/mountain1.jpg';
import mountainImage2 from '../images/mountain2.jpg';
import mountainImage3 from '../images/mountain3.jpg';
import mountainImage4 from '../images/mountain4.jpg';
import mountainImage5 from '../images/mountain5.jpg';

import spaceImage1 from '../images/space1.jpg';
import spaceImage2 from '../images/space2.jpg';
import spaceImage3 from '../images/space3.jpg';
import spaceImage4 from '../images/space4.jpg';
import spaceImage5 from '../images/space5.jpg';

import seascapeImage1 from '../images/seascape1.jpg';
import seascapeImage2 from '../images/seascape2.jpg';
import seascapeImage3 from '../images/seascape3.jpg';
import seascapeImage4 from '../images/seascape4.jpg';
import seascapeImage5 from '../images/seascape5.jpg';

import artImage1 from '../images/art1.jpg';
import artImage2 from '../images/art2.jpg';
import artImage3 from '../images/art3.png';
import artImage4 from '../images/art4.jpg';
import artImage5 from '../images/art5.jpg';

import iTookAPictureImage1 from '../images/iTookAPicture1.jpg';
import iTookAPictureImage2 from '../images/iTookAPicture2.jpg';
import iTookAPictureImage3 from '../images/iTookAPicture3.jpg';
import iTookAPictureImage4 from '../images/iTookAPicture4.jpg';
import iTookAPictureImage5 from '../images/iTookAPicture5.jpg';

const imageSrcForSources = {
  earth_porn_reddit: [
    earthpornImage1,
    earthpornImage2,
    earthpornImage3,
    earthpornImage4,
    earthpornImage5,
  ],
  mountains_reddit: [
    mountainImage1,
    mountainImage2,
    mountainImage3,
    mountainImage4,
    mountainImage5,
  ],
  space_porn_reddit: [
    spaceImage1,
    spaceImage2,
    spaceImage3,
    spaceImage4,
    spaceImage5,
  ],
  seascapes_reddit: [
    seascapeImage1,
    seascapeImage2,
    seascapeImage3,
    seascapeImage4,
    seascapeImage5,
  ],
  art_reddit: [artImage1, artImage2, artImage3, artImage4, artImage5],
  i_took_a_picture_reddit: [
    iTookAPictureImage1,
    iTookAPictureImage2,
    iTookAPictureImage3,
    iTookAPictureImage4,
    iTookAPictureImage5,
  ],
};

class ImagePreview extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const images = _.map(
      imageSrcForSources[this.props.internalName],
      imageSrc => {
        return <img class="center-content-image" src={imageSrc} />;
      },
    );
    return <div>{images}</div>;
  }
}

ImagePreview.propTypes = {
  internalName: PropTypes.string,
};

export default ImagePreview;
