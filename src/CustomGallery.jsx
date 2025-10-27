import React, { useState, useCallback, useEffect } from 'react';
import LightboxViewer from './LightboxViewer';

const CustomGallery = ({ images = [] }) => {
  const [viewerIsOpen, setViewerIsOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [columns, setColumns] = useState(2);

  // --- Responsive column count ---
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 640) setColumns(1);
      else if (width < 1024) setColumns(2);
      else setColumns(3);
    };
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // --- Lightbox controls ---
  const openLightbox = useCallback((index) => {
    setCurrentImage(index);
    setViewerIsOpen(true);
  }, []);

  const closeLightbox = () => setViewerIsOpen(false);

  // --- Handle empty state ---
  if (!images || !Array.isArray(images) || images.length === 0) {
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
        {images.map((src, index) => (
          <div
            key={index}
            className="mb-4 break-inside-avoid border border-[var(--card-border)] bg-[var(--card-bg)] rounded-lg overflow-hidden shadow-md transition-transform hover:-translate-y-1 cursor-pointer"
            onClick={() => openLightbox(index)}
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

      {/* Lightbox */}
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
