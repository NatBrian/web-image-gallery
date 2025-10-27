import React, { useState, useCallback } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import LightboxViewer from './LightboxViewer';

const CustomGallery = ({ images, columns, loadMore, hasMore }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [viewerIsOpen, setViewerIsOpen] = useState(false);

  // Check if images is defined and is an array
  if (!images || !Array.isArray(images) || images.length === 0) {
    return <div>No images to display</div>;
  }

  const openLightbox = useCallback((index) => {
    setCurrentImage(index);
    setViewerIsOpen(true);
  }, []);

  const closeLightbox = () => {
    setViewerIsOpen(false);
  };

  // Calculate grid template columns based on the number of columns
  const gridTemplateColumns = `repeat(${columns}, 1fr)`;

  return (
    <div className="gallery-container">
      <InfiniteScroll
        dataLength={images.length}
        next={loadMore}
        hasMore={hasMore}
        loader={<h4 className="text-center py-4">Loading...</h4>}
        endMessage={
          <p className="text-center py-4">
            <b>Yay! You have seen it all</b>
          </p>
        }
      >
        <div className="grid gap-4" style={{ gridTemplateColumns }}>
          {images.map((image, index) => (
            <div
              key={index}
              className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg overflow-hidden shadow-md transition-transform duration-200 ease-in-out hover:-translate-y-1"
              onClick={() => openLightbox(index)}
            >
              <img
                src={image}
                alt={`Gallery image ${index}`}
                loading="lazy"
                className="w-full h-auto object-cover block cursor-pointer"
              />
            </div>
          ))}
        </div>
      </InfiniteScroll>

      {viewerIsOpen && (
        <LightboxViewer
          images={images}
          currentImage={currentImage}
          setCurrentImage={setCurrentImage}
          closeLightbox={closeLightbox}
        />
      )}
    </div>
  );
};

export default CustomGallery;
