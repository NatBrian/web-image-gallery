import React, { useState, useEffect, useRef, useCallback } from 'react';

const App = () => {
  const [url, setUrl] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [columns, setColumns] = useState(3);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [filter, setFilter] = useState({
    jpg: true, png: true, gif: true, webp: true, svg: true, bmp: true, tiff: true
  });
  const [visibleImagesCount, setVisibleImagesCount] = useState(0);

  const observer = useRef();
  const currentPage = useRef(0);
  const allExtractedImages = useRef([]);

  const imagesPerPage = 20;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const fetchImages = async (page = 0) => {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/extract-images?url=${encodeURIComponent(url)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      allExtractedImages.current = data;
      currentPage.current = 0;
      setImages(allExtractedImages.current.slice(0, imagesPerPage));
      setVisibleImagesCount(Math.min(imagesPerPage, allExtractedImages.current.length));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreImages = useCallback(() => {
    const nextPage = currentPage.current + 1;
    const startIndex = nextPage * imagesPerPage;
    const newImages = allExtractedImages.current.slice(startIndex, startIndex + imagesPerPage);

    if (newImages.length > 0) {
      setImages((prevImages) => [...prevImages, ...newImages]);
      currentPage.current = nextPage;
      setVisibleImagesCount((prevCount) => prevCount + newImages.length);
    }
  }, []);

  const lastImageElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && images.length < allExtractedImages.current.length) {
          loadMoreImages();
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, loadMoreImages, images.length]
  );

  const filteredImages = images.filter(imgUrl => {
    const ext = imgUrl.split('.').pop().toLowerCase();
    return filter[ext];
  });

  const openFullscreen = (imageSrc) => {
    setFullscreenImage(imageSrc);
  };

  const closeFullscreen = () => {
    setFullscreenImage(null);
  };

  const navigateFullscreen = (direction) => {
    const currentIndex = filteredImages.indexOf(fullscreenImage);
    if (direction === 'left') {
      const prevIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length;
      setFullscreenImage(filteredImages[prevIndex]);
    } else {
      const nextIndex = (currentIndex + 1) % filteredImages.length;
      setFullscreenImage(filteredImages[nextIndex]);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (fullscreenImage) {
        if (e.key === 'Escape') closeFullscreen();
        if (e.key === 'ArrowLeft') navigateFullscreen('left');
        if (e.key === 'ArrowRight') navigateFullscreen('right');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullscreenImage, navigateFullscreen]);

  return (
    <div className="min-h-screen p-5 box-border transition-colors duration-300 ease-in-out bg-[var(--background-color)] text-[var(--text-color)]">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 border-b border-[var(--card-border)] mb-5 bg-[var(--header-bg)] rounded-lg">
        <h1 className="text-2xl font-bold m-0">Image Gallery Scraper</h1>
        <div className="flex items-center mt-3 sm:mt-0">
          <label htmlFor="theme-toggle" className="mr-2">Dark Mode</label>
          <input
            type="checkbox"
            id="theme-toggle"
            checked={theme === 'dark'}
            onChange={toggleTheme}
          />
        </div>
      </header>

      <div className="flex flex-col sm:flex-row gap-2.5 mb-5">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter website URL (e.g., https://example.com)"
          className="flex-grow p-2.5 border border-[var(--input-border)] rounded-md bg-[var(--input-bg)] text-[var(--text-color)]"
        />
        <button onClick={() => fetchImages()} disabled={loading} className="px-4 py-2.5 bg-[var(--button-bg)] text-[var(--button-text)] border-none rounded-md cursor-pointer transition-colors duration-200 ease-in-out hover:bg-[var(--button-hover-bg)] disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? 'Fetching...' : 'Fetch Images'}
        </button>
      </div>

      {error && <p className="text-[var(--error-color)] mb-5">Error: {error}</p>}

      {images.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 flex-wrap gap-2.5">
          <p>Showing {visibleImagesCount} of {allExtractedImages.current.length} images</p>
          <div className="flex items-center gap-2.5">
            <label htmlFor="columns">Columns:</label>
            <input
              type="range"
              id="columns"
              min="1"
              max="5"
              value={columns}
              onChange={(e) => setColumns(Number(e.target.value))}
            />
            <span>{columns}</span>
          </div>
          <div className="flex items-center gap-2.5">
            {Object.keys(filter).map(ext => (
              <label key={ext} className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={filter[ext]}
                  onChange={() => setFilter(prev => ({ ...prev, [ext]: !prev[ext] }))}
                />
                .{ext}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {filteredImages.map((image, index) => {
          if (filteredImages.length === index + 1) {
            return (
              <div ref={lastImageElementRef} key={index} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg overflow-hidden shadow-md transition-transform duration-200 ease-in-out hover:-translate-y-1">
                <img
                  src={image}
                  alt={`Scraped image ${index}`}
                  loading="lazy"
                  onClick={() => openFullscreen(image)}
                  className="w-full object-cover block cursor-pointer"
                />
              </div>
            );
          } else {
            return (
              <div key={index} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg overflow-hidden shadow-md transition-transform duration-200 ease-in-out hover:-translate-y-1">
                <img
                  src={image}
                  alt={`Scraped image ${index}`}
                  loading="lazy"
                  onClick={() => openFullscreen(image)}
                  className="w-full object-cover block cursor-pointer"
                />
              </div>
            );
          }
        })}
      </div>

      {fullscreenImage && (
        <div className="fixed inset-0 w-screen h-screen bg-black bg-opacity-90 flex justify-center items-center z-50" onClick={closeFullscreen}>
          <button className="absolute top-5 right-5 bg-none border-none text-white text-4xl cursor-pointer" onClick={closeFullscreen}>&times;</button>
          <button className="absolute top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white border-none px-4 py-2.5 cursor-pointer text-2xl left-2.5" onClick={(e) => { e.stopPropagation(); navigateFullscreen('left'); }}>&#10094;</button>
          <img src={fullscreenImage} alt="Fullscreen" onClick={(e) => e.stopPropagation()} className="max-w-[90%] max-h-[90%] object-contain" />
          <button className="absolute top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white border-none px-4 py-2.5 cursor-pointer text-2xl right-2.5" onClick={(e) => { e.stopPropagation(); navigateFullscreen('right'); }}>&#10095;</button>
        </div>
      )}
    </div>
  );
};

export default App;
