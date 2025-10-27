const cheerio = require('cheerio');
let fetch; // Declare fetch here

exports.handler = async function(event, context) {
  const { url } = event.queryStringParameters;

  if (!url) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing URL parameter' })
    };
  }

  try {
    if (!fetch) {
      fetch = (await import('node-fetch')).default;
    }
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const imageUrls = [];
    $('img').each((i, element) => {
      if (imageUrls.length >= 200) return false; // Limit to first 200 images

      const src = $(element).attr('src');
      const dataSrc = $(element).attr('data-src');
      const srcset = $(element).attr('srcset');

      if (src) imageUrls.push(resolveUrl(src, url));
      if (dataSrc) imageUrls.push(resolveUrl(dataSrc, url));
      if (srcset) {
        srcset.split(',').forEach(set => {
          const parts = set.trim().split(' ');
          if (parts.length > 0) {
            imageUrls.push(resolveUrl(parts[0], url));
          }
        });
      }
    });

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Allow from anywhere
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTION"
      },
      body: JSON.stringify(imageUrls.slice(0, 200)) // Ensure limit
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to extract images', details: error.message })
    };
  }
};

function resolveUrl(relativeUrl, baseUrl) {
  try {
    return new URL(relativeUrl, baseUrl).href;
  } catch (error) {
    console.warn(`Could not resolve URL: ${relativeUrl} with base ${baseUrl}. Error: ${error.message}`);
    return relativeUrl; // Return original if resolution fails
  }
}