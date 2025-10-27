import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import './styles.css'; // Custom styles

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
    <div className="app-container">
      <header className="header">
        <h1>Image Gallery Scraper</h1>
        <div className="theme-switcher">
          <label htmlFor="theme-toggle">Dark Mode</label>
          <input
            type="checkbox"
            id="theme-toggle"
            checked={theme === 'dark'}
            onChange={toggleTheme}
          />
        </div>
      </header>

      <div className="controls">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter website URL (e.g., https://example.com)"
          className="url-input"
        />
        <button onClick={() => fetchImages()} disabled={loading} className="fetch-button">
          {loading ? 'Fetching...' : 'Fetch Images'}
        </button>
      </div>

      {error && <p className="error-message">Error: {error}</p>}

      {images.length > 0 && (
        <div className="gallery-info">
          <p>Showing {visibleImagesCount} of {allExtractedImages.current.length} images</p>
          <div className="column-control">
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
          <div className="filter-controls">
            {Object.keys(filter).map(ext => (
              <label key={ext}>
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

      <div className="image-grid" style={{ '--columns': columns }}>
        {filteredImages.map((image, index) => {
          if (filteredImages.length === index + 1) {
            return (
              <div ref={lastImageElementRef} key={index} className="image-item">
                <img
                  src={image}
                  alt={`Scraped image ${index}`}
                  loading="lazy"
                  onClick={() => openFullscreen(image)}
                />
              </div>
            );
          } else {
            return (
              <div key={index} className="image-item">
                <img
                  src={image}
                  alt={`Scraped image ${index}`}
                  loading="lazy"
                  onClick={() => openFullscreen(image)}
                />
              </div>
            );
          }
        })}
      </div>

      {fullscreenImage && (
        <div className="fullscreen-viewer" onClick={closeFullscreen}>
          <button className="close-button" onClick={closeFullscreen}>&times;</button>
          <button className="nav-button left" onClick={(e) => { e.stopPropagation(); navigateFullscreen('left'); }}>&#10094;</button>
          <img src={fullscreenImage} alt="Fullscreen" onClick={(e) => e.stopPropagation()} />
          <button className="nav-button right" onClick={(e) => { e.stopPropagation(); navigateFullscreen('right'); }}>&#10095;</button>
        </div>
      )}
    </div>
  );
};

export default App;
