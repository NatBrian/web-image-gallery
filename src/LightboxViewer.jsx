import React, { useEffect, useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

// Plugins
import Download from 'yet-another-react-lightbox/plugins/download';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';

const LightboxViewer = ({ images, currentImage, setCurrentImage, closeLightbox }) => {
  const [slides, setSlides] = useState([]);

  useEffect(() => {
    // Preload and get actual dimensions for better zoom quality
    const loadSlides = async () => {
      const loadedSlides = await Promise.all(
        images.map(async (imgUrl, index) => {
          const img = new Image();
          img.src = imgUrl;
          await img.decode();
          return {
            src: imgUrl,
            alt: `Image ${index + 1}`,
            width: img.naturalWidth,
            height: img.naturalHeight,
          };
        })
      );
      setSlides(loadedSlides);
    };

    loadSlides();
  }, [images]);

  return (
    <Lightbox
      open={true}
      close={closeLightbox}
      slides={slides}
      index={currentImage}
      on={{
        view: ({ index }) => {
          if (typeof setCurrentImage === 'function') {
            setCurrentImage(index);
          }
        },
      }}
      plugins={[Download, Zoom]}
      zoom={{
        maxZoomPixelRatio: 3, // how much you can zoom in
        zoomInMultiplier: 1.5,
        doubleTapDelay: 300,
      }}
      download={{
        download: true,
        title: 'Download image',
      }}
      controller={{
        closeOnBackdropClick: true,
        closeOnPullDown: true,
      }}
    />
  );
};

export default LightboxViewer;
