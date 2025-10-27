import React from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

const LightboxViewer = ({ images, currentImage, setCurrentImage, closeLightbox }) => {
  // Convert image URLs to the format expected by yet-another-react-lightbox
  const slides = images.map((imgUrl, index) => ({
    src: imgUrl,
    alt: `Image ${index + 1}`,
    width: 1920,
    height: 1080
  }));

  return (
    <Lightbox
      open={true}
      close={closeLightbox}
      slides={slides}
      index={currentImage}
      on={{
        view: ({ index }) => setCurrentImage(index),
      }}
      animation={{ fade: 200 }}
      controller={{ closeOnPullDown: true, closeOnBackdropClick: true }}
      carousel={{ finite: false }}
    />
  );
};

export default LightboxViewer;
