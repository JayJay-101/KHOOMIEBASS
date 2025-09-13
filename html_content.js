import crypto from 'crypto';

export default async function handler(req, res) {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Extension-Auth, X-Timestamp, X-Nonce',
    'Access-Control-Max-Age': '86400'
  };

  // Set CORS headers
  Object.keys(corsHeaders).forEach(key => {
    res.setHeader(key, corsHeaders[key]);
  });

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    // Basic rate limiting (simple in-memory, you can enhance this)
    const ip = req.headers['x-forwarded-for'] ||
      req.headers['x-real-ip'] ||
      req.connection?.remoteAddress ||
      'unknown';

    console.log(`📥 Library download request from IP: ${ip}`);

    // Extension authentication
    const extAuth = req.headers['x-extension-auth'];
    const timestamp = req.headers['x-timestamp'];
    const nonce = req.headers['x-nonce'];

    if (!extAuth || !timestamp || !nonce) {
      return res.status(403).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Check timestamp (30 seconds tolerance)
    const now = Date.now();
    const headerTime = parseInt(timestamp);
    if (isNaN(headerTime) || now - headerTime > 30000) {
      return res.status(403).json({
        success: false,
        error: 'Request expired'
      });
    }

    // Decrypt extension header (simplified version)
    function decryptExtensionHeader(authHeader, timestamp, nonce) {
      try {
        const decoded = Buffer.from(authHeader, 'base64').toString();
        const parts = decoded.split('__SENTINEL__');
        if (parts.length !== 2) return null;
        
        const encryptedData = parts[0];
        const timestampCheck = parts[1];
        
        // Verify timestamp
        if (parseInt(timestampCheck, 36).toString() !== timestamp) return null;
        
        // Reverse the encoding process
        const step2 = encryptedData.replace(/./g, c => String.fromCharCode(c.charCodeAt(0) - 3));
        const step1 = step2.split('').reverse().join('');
        const originalData = Buffer.from(step1, 'base64').toString();
        
        const [extensionId, ts, n] = originalData.split('|');
        
        if (ts === timestamp && n === nonce) {
          return extensionId;
        }
        
        return null;
      } catch (error) {
        console.error('Decryption error:', error);
        return null;
      }
    }

    // Validate extension
    const decryptedExtensionId = decryptExtensionHeader(extAuth, timestamp, nonce);
    const expectedExtensionId = process.env.EXPECTED_EXTENSION_ID;

    if (!decryptedExtensionId || decryptedExtensionId !== expectedExtensionId) {
      return res.status(403).json({
        success: false,
        error: 'Invalid extension'
      });
    }

    console.log(`✅ Authentication successful for extension: ${decryptedExtensionId}`);

    // 📝 PASTE YOUR HTML STRING VARIABLE HERE
    const HTML_CONTENT = String.raw`
    <!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Digital Book Library</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
    
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: #f8f9fa;
                min-height: 100vh;
                padding: 20px;
            }
    
            .library-container {
                max-width: 1800px;
                margin: 0 auto;
                background: white;
                border-radius: 8px;
                padding: 30px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
    
            .library-header {
                text-align: center;
                margin-bottom: 40px;
            }
    
            .library-title {
                font-size: 2.2rem;
                color: #252525;
                margin-bottom: 10px;
                font-weight: 400;
            }
    
            .library-subtitle {
                color: #7a7a7a;
                font-size: 1rem;
            }
    
            .stats {
                display: flex;
                justify-content: center;
                gap: 30px;
                margin-bottom: 20px;
                flex-wrap: wrap;
            }
    
            .stat-item {
                text-align: center;
            }
    
            .stat-number {
                font-size: 1.8rem;
                font-weight: 600;
                color: #047a9c;
                display: block;
            }
    
            .stat-label {
                color: #7a7a7a;
                font-size: 0.9rem;
            }
    
            .search-container {
                margin-bottom: 30px;
                display: flex;
                justify-content: center;
            }
    
            .search-input {
                width: 100%;
                max-width: 400px;
                padding: 10px 20px;
                border: 1px solid #d5d5d5;
                border-radius: 4px;
                font-size: 14px;
            }
    
            .search-input:focus {
                outline: none;
                border-color: #047a9c;
            }
    
            .books-grid {
                display: grid;
                grid-template-columns: repeat(3, 370px);
                gap: 35px 50px;
                justify-content: center;
            }
    
            .opr-bookself-item {
                width: 370px;
                height: 176px;
                box-shadow: 0px 3px 6px #e5e7ee;
                padding: 0;
                border-radius: 5px;
            }
    
            @media (min-width: 1600px) {
                .books-grid {
                    grid-template-columns: repeat(4, 370px);
                }
            }
    
            @media (max-width: 1200px) {
                .books-grid {
                    grid-template-columns: repeat(2, 370px);
                }
            }
    
            @media (max-width: 800px) {
                .books-grid {
                    grid-template-columns: 370px;
                }
            }
    
            .opr-booklist-wrapper {
                display: block;
                position: relative;
                padding: 20px 20px 0 20px;
                height: 100%;
            }
    
            .opr-thumbnail-data {
                float: left;
                width: 100%;
                text-align: left;
            }
    
            .opr-cover-space {
                margin-left: 114px;
                position: relative;
                min-height: 125px;
            }
    
            .opr-cover-space h2 {
                font-size: 16px;
                word-wrap: break-word;
                color: #252525;
                margin-bottom: 5px;
                line-height: 22px;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                font-weight: 500;
            }
    
            .opr-author {
                font-size: 14px;
                color: #7a7a7a;
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
                margin-bottom: 5px;
            }
    
            .opr-lastread {
                font-size: 10px;
                color: rgba(68, 68, 68, 0.87);
                position: absolute;
                bottom: 40px;
            }
    
            .cover-img-block {
                border: 1px solid #d5d5d5;
                width: 92px;
                height: 125px;
                background-color: #fff;
                float: left;
                margin-left: -100%;
                position: relative;
                cursor: pointer;
            }
    
            .cover-img-middle {
                display: table;
                width: 100%;
                height: 127px;
                vertical-align: middle;
            }
    
            .cover-img-center {
                display: table-cell;
                vertical-align: middle;
                max-width: 100%;
                max-height: 125px;
            }
    
            .cover-img-center img {
                max-width: 100%;
                max-height: 123px;
                display: block;
                margin: 0 auto;
            }
    
            .opr-lib-btn-holder {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
            }
    
            .btn {
                font-size: 12px;
                width: 128px;
                padding: 0;
                height: 32px;
                line-height: 32px;
                border-radius: 40px;
                margin-right: 15px;
                border: none;
                cursor: pointer;
                text-decoration: none;
                display: inline-block;
                text-align: center;
            }
    
            .btn-primary {
                background-color: #047a9c;
                border-color: #047a9c;
                color: white;
            }
    
            .btn-primary:hover,
            .btn-primary:focus {
                border-color: #ffb81c;
                background-color: #ffb81c;
                color: #252525 !important;
            }
    
            .btn.added-btn {
                width: 140px;
            }
    
            .loading {
                text-align: center;
                padding: 40px;
                color: #7a7a7a;
                width: 100%;
            }
    
            .no-results {
                text-align: center;
                padding: 60px;
                color: #7a7a7a;
                width: 100%;
            }
    
            /* Zoom-based responsive behavior */
    
            /* 4 columns for 25%-80% zoom */
            @media screen and (min-width: 1800px) {
                .opr-bookself-item {
                    flex: 0 0 calc(25% - 40px);
                }
            }
    
            /* 3 columns for 90%-110% zoom (default) */
            @media screen and (max-width: 1799px) and (min-width: 1200px) {
                .opr-bookself-item {
                    flex: 0 0 calc(33.333% - 35px);
                }
            }
    
            /* 2 columns for 125%-150% zoom */
            @media screen and (max-width: 1199px) and (min-width: 800px) {
                .opr-bookself-item {
                    flex: 0 0 calc(50% - 25px);
                    margin-right: 25px;
                }
            }
    
            /* 1 column for >150% zoom */
            @media screen and (max-width: 799px) {
                .opr-bookself-item {
                    flex: 0 0 100%;
                    margin-right: 0;
                    max-width: 370px;
                    margin: 0 auto 35px auto;
                }
            }
    
            /* Mobile adjustments */
            @media screen and (max-width: 420px) {
                .opr-bookself-item {
                    width: 100%;
                    margin: 0 0 35px 0;
                }
    
                .library-container {
                    padding: 15px;
                }
    
                .library-title {
                    font-size: 1.8rem;
                }
            }
    
            .book-index {
                position: absolute;
                top: -10px;
                right: -10px;
                background: #047a9c;
                color: white;
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 10px;
                font-weight: 600;
            }
    
            .lazy-load {
                opacity: 0;
                transition: opacity 0.3s;
            }
    
            .book-cover {
                width: 100%;
                height: auto;
                display: block;
            }
    
            /* Lightbox overlay */
            .img-modal {
                display: none;
                position: fixed;
                z-index: 9999;
                top: 0; left: 0;
                width: 100%; height: 100%;
                background: rgba(0,0,0,0.85);
                justify-content: center;
                align-items: center;
                cursor: zoom-out;
            }
    
            /* Enlarged image */
            .img-modal img {
                max-width: 90%;
                max-height: 90%;
                border-radius: 6px;
                background: #fff;
                box-shadow: 0 4px 15px rgba(0,0,0,0.6);
                animation: zoomIn .3s ease;
            }
    
            @keyframes zoomIn {
                from { transform: scale(0.7); opacity: 0; }
                to   { transform: scale(1); opacity: 1; }
            }
        </style>
    </head>
    
    <body>
        <div class="library-container">
            <div class="library-header">
                <h1 class="library-title">Digital Book Library</h1>
                <p class="library-subtitle">Discover your next great read</p>
    
                <div class="stats">
                    <div class="stat-item">
                        <span class="stat-number" id="total-books">0</span>
                        <span class="stat-label">Total Books</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number" id="unique-authors">0</span>
                        <span class="stat-label">Authors</span>
                    </div>
                </div>
            </div>
    
            <div class="search-container">
                <input type="text" class="search-input" id="search-input" placeholder="Search books or authors...">
            </div>
    
            <div class="books-grid" id="books-grid">
                <div class="loading">Loading your library...</div>
            </div>
        </div>
    
        <div class="img-modal" id="imgModal">
            <img id="modalImg" src="" alt="">
        </div>
    
        <script>
    
            let allBooks = [];
            let filteredBooks = [];

            async function initializeLibrary() {
                try {
                    const response = await fetch('books.json');
                    if (!response.ok) throw new Error('Network response was not ok');
                    allBooks = await response.json();
                    filteredBooks = [...allBooks];
                    updateStats();
                    renderBooks();
                    setupSearch();
                } catch (error) {
                    console.error('Failed to load books:', error);
                    const grid = document.getElementById('books-grid');
                    grid.innerHTML = `
                        <div class="no-results">
                            <h3>Error loading books</h3>
                            <p>${error.message}</p>
                        </div>
                    `;
                }
            }
    
            function updateStats() {
                document.getElementById('total-books').textContent = allBooks.length;
    
                const uniqueAuthors = new Set(allBooks.map(book => book.author));
                document.getElementById('unique-authors').textContent = uniqueAuthors.size;
            }
    
            function renderBooks() {
                const grid = document.getElementById('books-grid');
    
                if (filteredBooks.length === 0) {
                    grid.innerHTML = \`
                        <div class="no-results">
                            <h3>No books found</h3>
                            <p>Try adjusting your search terms</p>
                        </div>
                    \`;
                    return;
                }
    
                const booksHTML = filteredBooks.map(book => \`
                    <div class="opr-bookself-item">
                        <div class="opr-booklist-wrapper">
                            <div class="opr-thumbnail-data">
                                <div class="opr-cover-space">
                                    <div class="book-index">#\${book.index}</div>
                                    <h2>\${escapeHtml(book.title)}</h2>
                                    <div class="opr-author">\${escapeHtml(book.author)}</div>
                                    <div class="opr-lastread">Available now</div>
                                    <div class="opr-lib-btn-holder">
                                        <a href="javascript:void(0)" class="btn btn-primary" onclick="readBook(\${book.index})">Read</a>
                                    </div>
                                </div>
                            </div>
                            <div class="cover-img-block">
                                <div class="cover-img-middle">
                                    <div class="cover-img-center">
                                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTIiIGhlaWdodD0iMTI1IiB2aWV3Qm94PSIwIDAgOTIgMTI1IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iOTIiIGhlaWdodD0iMTI1IiBmaWxsPSIjRjBGMEYwIiBzdHJva2U9IiNENUQ1RDUiLz4KPHN2ZyB4PSIyNiIgeT0iMzUiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNDQ0NDQ0MiIHN0cm9rZS13aWR0aD0iMSI+CjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiIHJ5PSIyIi8+CjxjaXJjbGUgY3g9IjguNSIgY3k9IjguNSIgcj0iMS41Ii8+CjxwYXRoIGQ9Im0yMSAxNS0zLjA4Ni0zLjA4NmEyIDIgMCAwIDAtMi44MjggMEwxMiAxNSIvPgo8L3N2Zz4KPHRleHQgeD0iNDYiIHk9IjEwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSIjOTk5OTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Mb2FkaW5nLi4uPC90ZXh0Pgo8L3N2Zz4K"
                                            data-src="https://forestily.com/image/\${book.index}.webp"
                                             alt="\${escapeHtml(book.title)}"
                                             class="book-cover lazy-load"
                                             loading="lazy">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                \`).join('');
    
                grid.innerHTML = booksHTML;
    
                // Implement lazy loading
                implementLazyLoading();
            }
    
            function implementLazyLoading() {
                const lazyImages = document.querySelectorAll('.lazy-load');
    
                if ('IntersectionObserver' in window) {
                    const imageObserver = new IntersectionObserver((entries, observer) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                const img = entry.target;
                                img.src = img.dataset.src;
                                img.classList.remove('lazy-load');
    
                                img.onload = () => {
                                    img.style.opacity = '1';
                                };
    
                                img.onerror = () => {
                                    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTIiIGhlaWdodD0iMTI1IiB2aWV3Qm94PSIwIDAgOTIgMTI1IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iOTIiIGhlaWdodD0iMTI1IiBmaWxsPSIjRjBGMEYwIiBzdHJva2U9IiNENUQ1RDUiLz4KPHN2ZyB4PSIyNiIgeT0iMzUiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNDQ0NDQ0MiIHN0cm9rZS13aWR0aD0iMSI+CjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiIHJ5PSIyIi8+CjxjaXJjbGUgY3g9IjguNSIgY3k9IjguNSIgcj0iMS41Ii8+CjxwYXRoIGQ9Im0yMSAxNS0zLjA4Ni0zLjA4NmEyIDIgMCAwIDAtMi44MjggMEwxMiAxNSIvPgo8L3N2Zz4KPHRleHQgeD0iNDYiIHk9IjEwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSIjOTk5OTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+Cg=='
                                };
    
                                observer.unobserve(img);
                            }
                        });
                    }, {
                        rootMargin: '50px'
                    });
    
                    lazyImages.forEach(img => imageObserver.observe(img));
                } else {
                    lazyImages.forEach(img => {
                        img.src = img.dataset.src;
                    });
                }
            }
    
            function setupSearch() {
                const searchInput = document.getElementById('search-input');
                searchInput.addEventListener('input', (e) => {
                    const query = e.target.value.toLowerCase();
                    filteredBooks = allBooks.filter(book =>
                        book.title.toLowerCase().includes(query) ||
                        book.author.toLowerCase().includes(query)
                    );
                    renderBooks();
                });
            }
    
            function escapeHtml(text) {
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            }
    
            function readBook(index) {
                alert(\`Opening book #\${index} for reading...\`);
                // You can load the corresponding JSON text file: \${index}.json
                // window.open(\`texts/\${index}.json\`, '_blank');
            }
    
            // Zoom-in modal for cover images
            document.addEventListener('click', function(e) {
                if (e.target.tagName === 'IMG' && e.target.closest('.cover-img-block')) {
                    const modal = document.getElementById('imgModal');
                    const modalImg = document.getElementById('modalImg');
                    modalImg.src = e.target.src;  // uses your folder image directly
                    modal.style.display = 'flex';
                }
            });
    
            // Close modal when clicking overlay or pressing Escape
            document.getElementById('imgModal').addEventListener('click', function(e) {
                this.style.display = 'none';
            });
    
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    document.getElementById('imgModal').style.display = 'none';
                }
            });
    
            // Initialize the library when the page loads
            document.addEventListener('DOMContentLoaded', initializeLibrary);
        </script>
    </body>
    
    </html>
    
    `;
     
    
    const startTime = Date.now();
    
    const htmlResult = {
      html: HTML_CONTENT
    };

    const generationTime = Date.now() - startTime;

    console.log(`📚 Library content prepared in ${generationTime}ms`);

    // Return the exact format that the extension expects
    res.status(200).json({
      success: true,
      htmlResult: htmlResult,
      cached: false,
      generationTime: generationTime,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Library download failed:', error);

    res.status(500).json({
      success: false,
      error: 'Library download failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};