import React, { useState, useCallback, useEffect } from 'react';
import LightboxViewer from './LightboxViewer';

const CustomGallery = ({ images = [], columns = 3, hasMore = false, loadMore, lastImageElementRef }) => {
  const [viewerIsOpen, setViewerIsOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  // Remove the internal columns state and use the prop instead

  // --- Lightbox controls ---
  const openLightbox = useCallback((index) => {
    setCurrentImage(index);
    setViewerIsOpen(true);
  }, []);

  const closeLightbox = () => setViewerIsOpen(false);

  // Flatten nested arrays to handle both flat and nested image structures
  const flattenedImages = Array.isArray(images[0])
    ? images.flat()
    : images;

  // --- Handle empty state ---
  if (!flattenedImages || !Array.isArray(flattenedImages) || flattenedImages.length === 0) {
    return <div className="text-center py-8 text-gray-500">No images to display</div>;
  }

  return (
    <div className="gallery-container w-full mx-auto p-2">
      {/* Masonry layout using CSS columns */}
      <div
        className="masonry"
        style={{
          columnCount: columns,
          columnGap: '1rem',
        }}
      >
        {flattenedImages.map((src, index) => (
          <div
            key={index}
            className="mb-4 break-inside-avoid border border-[var(--card-border)] bg-[var(--card-bg)] rounded-lg overflow-hidden shadow-md transition-transform hover:-translate-y-1 cursor-pointer"
            onClick={() => openLightbox(index)}
            ref={index === flattenedImages.length - 1 ? lastImageElementRef : null}
          >
            <img
              src={src}
              alt={`Gallery image ${index}`}
              loading="lazy"
              className="w-full h-auto object-contain block"
            />
          </div>
        ))}
      </div>

      {/* Loading indicator */}
      {hasMore && (
        <div className="text-center py-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2">Loading more images...</p>
        </div>
      )}

      {/* Lightbox */}
      {viewerIsOpen && (
        <LightboxViewer
          images={flattenedImages}
          currentImage={currentImage}
          setCurrentImage={setCurrentImage}
          closeLightbox={closeLightbox}
        />
      )}
    </div>
  );
};

export default CustomGallery;
