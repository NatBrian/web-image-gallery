# Web Image Gallery

A lightweight web application to extract all image URLs from a given website and display them in a dynamic, responsive gallery with infinite scrolling and several UX features.

## Architecture
- **Frontend**: React (Vite)
- **Backend**: Netlify Function (Node.js + Cheerio) for scraping
- **Styling**: Custom CSS
- **Deployment**: Netlify (single `netlify.toml` configuration)

## Core Features
1.  **Extract Image URLs**: User inputs a website URL, Netlify Function fetches HTML, parses with Cheerio, extracts `<img>` `src`, `data-src`, and `srcset` URLs, resolves relative paths, and returns as JSON.
2.  **Dynamic Gallery**: Responsive grid, adjustable columns (1-5), lazy-loading (`loading="lazy"`), image counter.
3.  **Infinite Scrolling**: Loads images incrementally (20 per batch) using `IntersectionObserver`.
4.  **Dark / Light Mode Toggle**: Theme switcher using CSS variables, persists in `localStorage`.
5.  **Fullscreen Viewer**: Clicking an image opens it in fullscreen/lightbox mode with keyboard navigation (left/right arrows) and close button.
6.  **Filter by File Type**: Checkboxes to filter images by file extension (client-side).
7.  **Image Counter**: Shows visible vs total extracted images.

## Local Development

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/web-image-gallery.git
    cd web-image-gallery
    ```

2.  **Install frontend dependencies:**
    ```bash
    npm install
    ```

3.  **Install Netlify Function dependencies:**
    ```bash
    cd netlify/functions
    npm install
    cd ../..
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:5173/`.

5.  **To test Netlify Functions locally:**
    You'll need the Netlify CLI.
    ```bash
    npm install netlify-cli -g
    netlify dev
    ```
    This will start a local server that proxies requests to your Netlify Functions. The app will typically be available at `http://localhost:8888/`.

## Deployment to Netlify

1.  **Ensure you have a Netlify account.**
2.  **Install Netlify CLI (if not already installed):**
    ```bash
    npm install netlify-cli -g
    ```
3.  **Login to Netlify:**
    ```bash
    netlify login
    ```
4.  **Initialize a new Netlify project (if not already linked):**
    ```bash
    netlify init
    ```
    Follow the prompts. Netlify will detect the `netlify.toml` file and suggest appropriate build settings.
    -   **Build command**: `npm run build`
    -   **Publish directory**: `dist`
    -   **Functions directory**: `netlify/functions`
5.  **Deploy manually (for testing):**
    ```bash
    netlify deploy --prod
    ```
    Or, connect your Git repository (GitHub, GitLab, Bitbucket) to Netlify for continuous deployment. Netlify will automatically build and deploy your site on every push to your main branch.

## Project Structure

```
.
├── public/
├── src/
│   ├── assets/
│   ├── components/ (if needed for more complex components)
│   ├── App.jsx
│   ├── index.css
│   ├── main.jsx
│   └── styles.css
├── netlify/
│   └── functions/
│       └── extract-images.js
├── .gitignore
├── index.html
├── netlify.toml
├── package.json
├── vite.config.js
└── README.md
