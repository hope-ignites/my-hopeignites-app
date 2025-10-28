// ===== CONFIGURATION CONSTANTS =====
const CONFIG = {
    DEBUG_MODE: false, // Set to true for development logging
    CACHE_DURATION_MS: 1000 * 60 * 60, // 1 hour for IP cache
    ICON_BASE_PATH: 'assets/app-icons/',
    STORAGE_KEYS: {
        DARK_MODE: 'darkMode',
        FAVORITES: 'app_launcher_favorites',
        IP_CACHE: 'user_ip_data'
    },
    API_ENDPOINTS: {
        IP_SERVICES: [
            'https://api.ipify.org?format=json',
            'https://api64.ipify.org?format=json'
        ]
    }
};

/**
 * Logging utility that respects DEBUG_MODE setting
 */
const logger = {
    log: (...args) => CONFIG.DEBUG_MODE && logger.log(...args),
    warn: (...args) => CONFIG.DEBUG_MODE && logger.warn(...args),
    error: (...args) => logger.error(...args) // Always log errors
};

/**
 * Validates and sanitizes URLs to prevent XSS attacks
 * @param {string} url - URL to validate
 * @returns {boolean} True if URL is safe
 */
function isValidUrl(url) {
    if (!url || typeof url !== 'string') {
        return false;
    }
    
    // Block javascript: protocol and other dangerous protocols
    const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
    const lowerUrl = url.toLowerCase().trim();
    
    if (dangerousProtocols.some(protocol => lowerUrl.startsWith(protocol))) {
        logger.warn('Blocked dangerous URL protocol:', url);
        return false;
    }
    
    // Only allow http: and https: protocols
    if (!lowerUrl.startsWith('http://') && !lowerUrl.startsWith('https://') && !lowerUrl.startsWith('/')) {
        logger.warn('Invalid URL protocol:', url);
        return false;
    }
    
    return true;
}

/**
 * Sanitizes a string for safe use in HTML
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Debounces a function to limit how often it can be called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== PWA SERVICE WORKER REGISTRATION =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
                logger.log('PWA: Service Worker registered successfully:', registration.scope);
            })
            .catch((error) => {
                logger.error('PWA: Service Worker registration failed:', error);
            });
    });
}

// ===== DARK MODE TOGGLE =====
/**
 * Updates the header logo based on the current theme
 * @param {boolean} isDarkMode - Whether dark mode is enabled
 */
function updateLogo(isDarkMode) {
    const headerLogo = document.getElementById('header-logo');
    if (headerLogo) {
        headerLogo.src = isDarkMode ? 'assets/dark-logo.png' : 'assets/light-logo.png';
    }
}

(function() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;

    // Check for saved preference or default to light mode
    const savedMode = localStorage.getItem(CONFIG.STORAGE_KEYS.DARK_MODE);
    if (savedMode === 'enabled') {
        body.classList.add('dark-mode');
        darkModeToggle.textContent = '☀️';
        updateLogo(true);
    }

    darkModeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');

        if (body.classList.contains('dark-mode')) {
            darkModeToggle.textContent = '☀️';
            localStorage.setItem(CONFIG.STORAGE_KEYS.DARK_MODE, 'enabled');
            updateLogo(true);
        } else {
            darkModeToggle.textContent = '🌙';
            localStorage.setItem(CONFIG.STORAGE_KEYS.DARK_MODE, 'disabled');
            updateLogo(false);
        }

        // Update card icons for new theme (optimized - no full re-render)
        updateCardIcons();
    });
})();

/**
 * Updates only the card icons for theme changes without full re-render
 * More efficient than renderCards() for theme switching
 */
function updateCardIcons() {
    const cards = document.querySelectorAll('.portal-card');
    
    cards.forEach(card => {
        const iconContainer = card.querySelector('.portal-icon');
        if (!iconContainer) return;
        
        // Get the card URL to find the original data
        const cardUrl = card.href;
        if (!cardUrl || !portalData) return;
        
        // Find the card data
        let cardData = null;
        for (const category of portalData.categories) {
            cardData = category.cards.find(c => c.url === cardUrl);
            if (cardData) break;
        }
        
        if (!cardData || !cardData.icon) return;
        
        // Get theme-appropriate icon
        const iconValue = getIconForTheme(cardData.icon);
        
        // Update icon HTML
        if (iconValue && iconValue.includes('.png')) {
            const fullPath = `${CONFIG.ICON_BASE_PATH}${iconValue}`;
            iconContainer.innerHTML = `<img src="${fullPath}" alt="${cardData.title} icon" style="width: 46px; height: 46px; object-fit: contain;">`;
        } else {
            iconContainer.innerHTML = iconValue;
        }
    });
}

// ===== FAVORITES/PINNING FUNCTIONALITY =====
/**
 * Manager for handling favorites/pinned applications
 * Uses localStorage to persist user preferences
 */
const FavoritesManager = (function() {
    /**
     * Retrieves favorites from localStorage
     * @returns {string[]} Array of favorited application URLs
     */
    function getFavorites() {
        try {
            const stored = localStorage.getItem(CONFIG.STORAGE_KEYS.FAVORITES);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            logger.error('Error loading favorites:', error);
            return [];
        }
    }

    /**
     * Saves favorites to localStorage
     * @param {string[]} favorites - Array of application URLs to save
     */
    function saveFavorites(favorites) {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
        } catch (error) {
            logger.error('Error saving favorites:', error);
        }
    }

    /**
     * Checks if an application is favorited
     * @param {string} url - Application URL to check
     * @returns {boolean} True if application is favorited
     */
    function isFavorite(url) {
        const favorites = getFavorites();
        return favorites.includes(url);
    }

    /**
     * Toggles favorite status for an application
     * @param {string} url - Application URL to toggle
     * @returns {boolean} New favorite status
     */
    function toggleFavorite(url) {
        let favorites = getFavorites();
        const index = favorites.indexOf(url);

        if (index > -1) {
            favorites.splice(index, 1);
        } else {
            favorites.push(url);
        }

        saveFavorites(favorites);
        return favorites.includes(url);
    }

    return {
        getFavorites,
        isFavorite,
        toggleFavorite
    };
})();

// ===== APPLICATION LAUNCHER RENDERING FROM JSON =====
// Global variables so mobile menu can access them
let portalData = null;
let currentCategory = 'all';
let renderCards; // Will be defined below
let renderTabs; // Will be defined below

// Detect if we're on /tech path
const isTechMode = window.location.pathname.includes('/tech');

// Show tech mode banner if in tech mode
if (isTechMode) {
    const techBanner = document.getElementById('tech-mode-banner');
    if (techBanner) {
        techBanner.style.display = 'block';
    }
}

// Helper function to get theme-appropriate icon
/**
 * Returns the appropriate icon based on current theme
 * @param {string|Object} iconData - Icon filename or object with light/dark properties
 * @returns {string} Icon filename or emoji
 */
function getIconForTheme(iconData) {
    const isDarkMode = document.body.classList.contains('dark-mode');

    // If icon is a string, use it directly (backward compatibility)
    if (typeof iconData === 'string') {
        return iconData;
    }

    // If icon is an object with light/dark properties
    if (typeof iconData === 'object' && iconData !== null) {
        // Use dark mode icon if available and in dark mode, otherwise use light icon
        if (isDarkMode && iconData.dark) {
            return iconData.dark;
        }
        // Always fallback to light icon
        return iconData.light || iconData.dark || '📦';
    }

    // Fallback to generic emoji if no icon data
    return '📦';
}

(async function() {

    /**
     * Fetches and validates portal data from JSON file
     * @returns {Promise<Object|null>} Portal data or null on error
     */
    async function loadPortalData() {
        try {
            const response = await fetch('portal-data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            // Validate data structure
            if (!data || !Array.isArray(data.categories)) {
                throw new Error('Invalid portal data structure');
            }
            
            portalData = data;
            // Make data available globally for search feature
            window.portalDataCache = portalData;
            logger.log('Application Launcher data loaded successfully');
            return portalData;
        } catch (error) {
            logger.error('Error loading Application Launcher data:', error);
            // Display user-friendly error message
            const grid = document.getElementById('portal-grid');
            if (grid) {
                grid.innerHTML = `
                    <div style="color: white; text-align: center; padding: 40px; grid-column: 1/-1;">
                        <p style="font-size: 1.2rem; margin-bottom: 12px;">⚠️ Unable to load applications</p>
                        <p style="font-size: 0.9rem; opacity: 0.9;">Please check your internet connection and refresh the page.</p>
                        <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 24px; background: var(--accent-primary); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem;">
                            Refresh Page
                        </button>
                    </div>
                `;
            }
            return null;
        }
    }

    // Render tab buttons
    renderTabs = function() {
        const tabContainer = document.getElementById('tab-container');
        const mobileToggle = document.getElementById('category-mobile-toggle');
        const currentCategoryName = document.getElementById('current-category-name');
        tabContainer.innerHTML = '';

        // Reorder categories if in tech mode - put tech-tools after favorites
        let categoriesToRender = [...portalData.categories];
        if (isTechMode) {
            const techToolsIndex = categoriesToRender.findIndex(cat => cat.id === 'tech-tools');
            const favoritesIndex = categoriesToRender.findIndex(cat => cat.id === 'favorites');

            if (techToolsIndex !== -1 && favoritesIndex !== -1) {
                // Remove tech-tools from its current position
                const [techTools] = categoriesToRender.splice(techToolsIndex, 1);
                // Insert it right after favorites
                categoriesToRender.splice(favoritesIndex + 1, 0, techTools);
            }
        }

        categoriesToRender.forEach(category => {
            // Filter out tech-only categories if not in tech mode
            const hasTechCards = category.cards.some(card => card.tech === true);
            if (!isTechMode && hasTechCards && category.id === 'tech-tools') {
                return; // Skip this category
            }

            const button = document.createElement('button');
            button.className = 'tab-button';
            button.textContent = category.name;
            button.setAttribute('role', 'tab');
            button.setAttribute('aria-selected', category.id === currentCategory ? 'true' : 'false');
            button.setAttribute('data-category', category.id);

            if (category.id === currentCategory) {
                button.classList.add('active');
                // Update mobile toggle button text with current category
                if (currentCategoryName) {
                    currentCategoryName.textContent = category.name;
                }
            }

            button.addEventListener('click', () => {
                currentCategory = category.id;
                renderTabs();
                renderCards();
                // Close mobile menu after selection
                if (tabContainer.classList.contains('mobile-open')) {
                    tabContainer.classList.remove('mobile-open');
                    mobileToggle.classList.remove('open');
                }
            });

            tabContainer.appendChild(button);
        });
    };

    // Render portal cards
    renderCards = function() {
        const grid = document.getElementById('portal-grid');
        grid.innerHTML = '';

        // Get cards for current category
        let cardsToDisplay = [];

        if (currentCategory === 'favorites') {
            // Show only favorited cards
            const favoriteUrls = FavoritesManager.getFavorites();
            portalData.categories.forEach(category => {
                if (category.id !== 'all' && category.id !== 'favorites') {
                    // Skip tech-only categories if not in tech mode
                    if (!isTechMode && category.id === 'tech-tools') {
                        return;
                    }
                    category.cards.forEach(card => {
                        // Skip NHQ-only cards if not at NHQ
                        if (card.nhqOnly && !isNHQIP) {
                            return;
                        }
                        if (favoriteUrls.includes(card.url)) {
                            cardsToDisplay.push(card);
                        }
                    });
                }
            });
        } else if (currentCategory === 'all') {
            // Show all cards from all categories (except "all" and "favorites" itself)
            portalData.categories.forEach(category => {
                if (category.id !== 'all' && category.id !== 'favorites') {
                    // Skip tech-only categories if not in tech mode
                    if (!isTechMode && category.id === 'tech-tools') {
                        return;
                    }
                    category.cards.forEach(card => {
                        // Skip NHQ-only cards if not at NHQ
                        if (!card.nhqOnly || isNHQIP) {
                            cardsToDisplay.push(card);
                        }
                    });
                }
            });
            // Sort alphabetically by title for "All Applications" view
            cardsToDisplay.sort((a, b) => a.title.localeCompare(b.title));
        } else {
            // Show cards from selected category
            const category = portalData.categories.find(cat => cat.id === currentCategory);
            if (category) {
                cardsToDisplay = category.cards.filter(card => {
                    // Skip NHQ-only cards if not at NHQ
                    return !card.nhqOnly || isNHQIP;
                });
            }
        }

        // Create card elements
        cardsToDisplay.forEach(card => {
            // Validate URL for security
            if (!isValidUrl(card.url)) {
                logger.error('Skipping card with invalid URL:', card.title, card.url);
                return;
            }

            const cardWrapper = document.createElement('div');
            cardWrapper.style.position = 'relative';

            const cardLink = document.createElement('a');
            cardLink.href = card.url;
            cardLink.className = 'portal-card';

            const isFav = FavoritesManager.isFavorite(card.url);

            // Get theme-appropriate icon
            const iconValue = getIconForTheme(card.icon);

            // Determine if icon is an image filename or emoji
            let iconHtml;
            if (iconValue && iconValue.includes('.png')) {
                const fullPath = `${CONFIG.ICON_BASE_PATH}${iconValue}`;
                iconHtml = `<img src="${fullPath}" alt="${card.title} icon" style="width: 46px; height: 46px; object-fit: contain;">`;
            } else {
                iconHtml = iconValue;
            }

            // Check for universal app indicator
            const universalIndicator = card.universal
                ? `<div class="universal-indicator" title="Available to all team members"><img src="assets/universal.png" alt="Universal" /></div>`
                : '';

            // Check for NHQ-only indicator
            const nhqIndicator = card.nhqOnly
                ? `<div class="nhq-indicator" title="Only available from NHQ office"><img src="assets/hq-badge.png" alt="NHQ Only" /></div>`
                : '';

            // Check for SSO indicator
            const ssoIndicator = card.sso
                ? `<div class="sso-indicator" title="Single Sign-On enabled"><img src="assets/sso-badge.png" alt="SSO" /></div>`
                : '';

            cardLink.innerHTML = `
                <button class="favorite-btn ${isFav ? 'favorited' : ''}"
                        data-url="${card.url}"
                        aria-label="${isFav ? 'Remove from favorites' : 'Add to favorites'}"
                        title="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
                    ${isFav ? '⭐' : '☆'}
                </button>
                <div class="portal-icon">${iconHtml}</div>
                <h3>${card.title}</h3>
                <p>${card.description}</p>
                ${universalIndicator}
                ${nhqIndicator}
                ${ssoIndicator}
            `;

            // Add click handler for favorite button
            const favBtn = cardLink.querySelector('.favorite-btn');
            favBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const nowFavorited = FavoritesManager.toggleFavorite(card.url);
                favBtn.textContent = nowFavorited ? '⭐' : '☆';
                favBtn.classList.toggle('favorited', nowFavorited);
                favBtn.setAttribute('aria-label', nowFavorited ? 'Remove from favorites' : 'Add to favorites');
                favBtn.setAttribute('title', nowFavorited ? 'Remove from favorites' : 'Add to favorites');

                // If we're on favorites tab, re-render to remove unfavorited cards
                if (currentCategory === 'favorites') {
                    renderCards();
                }
            });

            grid.appendChild(cardLink);
        });

        // Show message if favorites is empty
        if (currentCategory === 'favorites' && cardsToDisplay.length === 0) {
            grid.innerHTML = '<p style="color: var(--text-light); text-align: center; grid-column: 1/-1;">No favorites yet. Click the ☆ on any card to add it to your favorites!</p>';
        }
    };

    // Render quick links
    function renderQuickLinks() {
        const quickLinkGrid = document.getElementById('quick-link-grid');
        quickLinkGrid.innerHTML = '';

        portalData.quickLinks.forEach(link => {
            const linkElement = document.createElement('a');
            linkElement.href = link.url;
            linkElement.className = 'quick-link';
            linkElement.textContent = link.title;
            quickLinkGrid.appendChild(linkElement);
        });
    }

    // Mobile category toggle
    function initMobileToggle() {
        const mobileToggle = document.getElementById('category-mobile-toggle');
        const tabContainer = document.getElementById('tab-container');

        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                tabContainer.classList.toggle('mobile-open');
                mobileToggle.classList.toggle('open');
            });
        }
    }

    // Tab scroll arrows functionality
    function initTabScrollArrows() {
        const tabContainer = document.getElementById('tab-container');
        const leftArrow = document.querySelector('.tab-scroll-left');
        const rightArrow = document.querySelector('.tab-scroll-right');

        if (!tabContainer || !leftArrow || !rightArrow) return;

        const scrollAmount = 200; // pixels to scroll
        let scrollInterval;

        // Scroll left
        leftArrow.addEventListener('mouseenter', () => {
            scrollInterval = setInterval(() => {
                tabContainer.scrollLeft -= 5;
                updateArrowVisibility();
            }, 20);
        });

        leftArrow.addEventListener('mouseleave', () => {
            clearInterval(scrollInterval);
        });

        // Scroll right
        rightArrow.addEventListener('mouseenter', () => {
            scrollInterval = setInterval(() => {
                tabContainer.scrollLeft += 5;
                updateArrowVisibility();
            }, 20);
        });

        rightArrow.addEventListener('mouseleave', () => {
            clearInterval(scrollInterval);
        });

        // Click handlers for single scroll
        leftArrow.addEventListener('click', () => {
            tabContainer.scrollLeft -= scrollAmount;
        });

        rightArrow.addEventListener('click', () => {
            tabContainer.scrollLeft += scrollAmount;
        });

        // Update arrow visibility based on scroll position
        function updateArrowVisibility() {
            const isAtStart = tabContainer.scrollLeft <= 0;
            const isAtEnd = tabContainer.scrollLeft >= tabContainer.scrollWidth - tabContainer.clientWidth - 1;

            leftArrow.classList.toggle('hidden', isAtStart);
            rightArrow.classList.toggle('hidden', isAtEnd);
        }

        // Update on scroll
        tabContainer.addEventListener('scroll', updateArrowVisibility);

        // Initial check
        setTimeout(updateArrowVisibility, 100);
    }

    // Show tech mode indicator if on /tech path
    function initTechModeIndicator() {
        const techModeIndicator = document.getElementById('tech-mode-indicator');
        if (techModeIndicator && isTechMode) {
            techModeIndicator.style.display = 'flex';
        }
    }

    // Initialize portal
    async function initPortal() {
        const data = await loadPortalData();
        if (data) {
            renderTabs();
            renderCards();
            renderQuickLinks();
            initMobileToggle();
            initTabScrollArrows();
            initTechModeIndicator();
        }
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPortal);
    } else {
        initPortal();
    }
})();

// ===== OPEN ALL LINKS IN NEW TAB =====
(function() {
    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        // Delay to ensure portal cards are rendered first
        setTimeout(() => {
            // Get all links on the page
            const links = document.querySelectorAll('a');

            links.forEach(link => {
                // Skip links that are internal page anchors (starting with #)
                if (!link.getAttribute('href') || link.getAttribute('href').startsWith('#')) {
                    return;
                }

                // Set target to _blank if not already set
                if (!link.hasAttribute('target')) {
                    link.setAttribute('target', '_blank');
                }

                // Add rel="noopener noreferrer" for security if not present
                if (!link.hasAttribute('rel')) {
                    link.setAttribute('rel', 'noopener noreferrer');
                }
            });
        }, 100); // Small delay to let portal cards render
    });
})();

// ===== IP DETECTION AND CONDITIONAL MESSAGE DISPLAY =====
// Global variable to track NHQ IP status
let isNHQIP = false;

(function() {
    // CONFIGURATION: Define your IP addresses or ranges here (NHQ IPs)
    const ALLOWED_IPS = [
        '24.207.150.155',        // Pete Home IP
        '35.134.139.202',            // Shaw FIA IP
        '162.235.104.1',            // Shaw FIA IP
        // Add more specific IPs here
    ];

    // CONFIGURATION: Define IP ranges if needed (optional)
    const ALLOWED_IP_RANGES = [
        // Example: { start: '192.168.1.1', end: '192.168.1.254' }
        // Add IP ranges here if needed
    ];

    // CONFIGURATION: Cache settings (reduces API calls)
    const CACHE_KEY = 'user_ip_data';
    const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

    // Helper function: Convert IP to number for range comparison
    function ipToNumber(ip) {
        return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0);
    }

    // Helper function: Check if IP is in range
    function isIPInRange(ip, start, end) {
        const ipNum = ipToNumber(ip);
        const startNum = ipToNumber(start);
        const endNum = ipToNumber(end);
        return ipNum >= startNum && ipNum <= endNum;
    }

    // Check if IP matches allowed list or ranges
    function checkIP(userIP) {
        // Check single IPs
        if (ALLOWED_IPS.includes(userIP)) {
            return true;
        }

        // Check IP ranges
        for (const range of ALLOWED_IP_RANGES) {
            if (isIPInRange(userIP, range.start, range.end)) {
                return true;
            }
        }

        return false;
    }

    // Get cached IP or fetch fresh
    async function getCachedOrFetchIP() {
        // Check cache first
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            try {
                const data = JSON.parse(cached);
                const age = Date.now() - data.timestamp;

                // If cache is less than 1 hour old, use it
                if (age < CACHE_DURATION) {
                    logger.log('IP Detection: Using cached IP:', data.ip);
                    return data.ip;
                }
            } catch (e) {
                logger.warn('IP Detection: Invalid cache data');
            }
        }

        // Fetch fresh IP (try multiple services for reliability)
        const services = [
            'https://api.ipify.org?format=json',
            'https://api64.ipify.org?format=json',
        ];

        for (const service of services) {
            try {
                const response = await fetch(service);
                const data = await response.json();
                const ip = data.ip;

                // Cache it
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    ip: ip,
                    timestamp: Date.now()
                }));

                logger.log('IP Detection: Fetched fresh IP:', ip);
                return ip;
            } catch (error) {
                logger.warn(`IP Detection: Failed to fetch from ${service}:`, error);
                continue;
            }
        }

        logger.error('IP Detection: All services failed');
        return null;
    }

    // Display the IP-specific message
    function showIPMessage(userIP) {
        const container = document.querySelector('.container');
        const messageDiv = document.createElement('div');

        // CONFIGURATION: Customize your message here
        messageDiv.className = 'ip-notice';
        messageDiv.innerHTML = `
            <strong>🏢 Hope On The Hill Network Detected</strong>
            <p>
                You are accessing from an authorized Hope Ignites location. </br>
                You may see additional resources here that you would not otherwise see off-network.
            </p>
        `;

        // Insert at the top of the container
        container.insertBefore(messageDiv, container.firstChild);

        logger.log('IP Detection: Message displayed for IP:', userIP);
    }

    // Main function: Check IP and display message if needed
    async function checkAndDisplayMessage() {
        try {
            const userIP = await getCachedOrFetchIP();

            if (!userIP) {
                logger.warn('IP Detection: Could not determine IP address');
                return;
            }

            // Check if IP matches allowed list (NHQ IPs)
            if (checkIP(userIP)) {
                isNHQIP = true;
                showIPMessage(userIP);
                logger.log('IP Detection: NHQ IP detected, isNHQIP =', isNHQIP);
            } else {
                isNHQIP = false;
                logger.log('IP Detection: IP not in allowed list:', userIP);
            }
        } catch (error) {
            logger.error('IP Detection: Error:', error);
            // Fail silently - don't show message if detection fails
        }
    }

    // Run IP detection when page loads
    checkAndDisplayMessage();
})();

// ===== HELP MODAL =====
(function () {
    const helpBtn = document.getElementById('help-btn');
    const modal = document.getElementById('help-modal');
    const closeBtn = modal.querySelector('.modal-close');

    function openModal() {
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        closeBtn.focus();
    }

    function closeModal() {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        helpBtn.focus();
    }

    helpBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', function (e) {
        if (e.target && e.target.hasAttribute('data-close')) closeModal();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });
})();

// ===== KEYBOARD SHORTCUTS MODAL =====
(function() {
    const shortcutsModal = document.getElementById('shortcuts-modal');
    
    if (!shortcutsModal) return;
    
    const closeBtn = shortcutsModal.querySelector('.modal-close');
    
    function openShortcutsModal() {
        shortcutsModal.classList.add('open');
        shortcutsModal.setAttribute('aria-hidden', 'false');
        closeBtn.focus();
    }
    
    function closeShortcutsModal() {
        shortcutsModal.classList.remove('open');
        shortcutsModal.setAttribute('aria-hidden', 'true');
    }
    
    closeBtn.addEventListener('click', closeShortcutsModal);
    
    shortcutsModal.addEventListener('click', function(e) {
        if (e.target && e.target.hasAttribute('data-close')) closeShortcutsModal();
    });
    
    // Listen for ? key to open shortcuts
    document.addEventListener('keydown', function(e) {
        // Close on ESC
        if (e.key === 'Escape' && shortcutsModal.classList.contains('open')) {
            closeShortcutsModal();
            return;
        }
        
        // Open on ? key (Shift + /)
        if (e.key === '?' && !shortcutsModal.classList.contains('open')) {
            // Don't trigger if typing in an input
            if (document.activeElement.tagName === 'INPUT' ||
                document.activeElement.tagName === 'TEXTAREA') {
                return;
            }
            e.preventDefault();
            openShortcutsModal();
        }
    });
})();

// ===== SPOTLIGHT-STYLE SEARCH =====
(function() {
    const searchOverlay = document.getElementById('search-overlay');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const searchTrigger = document.getElementById('search-trigger');

    let allApps = [];
    let selectedIndex = -1;

    // Collect all apps from portal data
    function collectAllApps() {
        if (!window.portalDataCache) {
            // Wait for portal data to load
            setTimeout(collectAllApps, 100);
            return;
        }

        const data = window.portalDataCache;
        allApps = [];

        data.categories.forEach(category => {
            if (category.id !== 'all' && category.id !== 'favorites') {
                category.cards.forEach(card => {
                    allApps.push({
                        ...card,
                        category: category.name
                    });
                });
            }
        });
    }

    // Open search
    function openSearch() {
        searchOverlay.classList.add('active');
        searchInput.focus();
        searchInput.value = '';
        selectedIndex = -1;
        renderResults([]);
    }

    // Close search
    function closeSearch() {
        searchOverlay.classList.remove('active');
        searchInput.value = '';
        selectedIndex = -1;
        renderResults([]);
    }

    // Search function
    function performSearch(query) {
        if (!query.trim()) {
            renderResults([]);
            return;
        }

        const lowerQuery = query.toLowerCase();
        const results = allApps.filter(app => {
            return (
                app.title.toLowerCase().includes(lowerQuery) ||
                app.description.toLowerCase().includes(lowerQuery) ||
                app.category.toLowerCase().includes(lowerQuery)
            );
        });

        // Sort by relevance (title matches first)
        results.sort((a, b) => {
            const aTitleMatch = a.title.toLowerCase().startsWith(lowerQuery);
            const bTitleMatch = b.title.toLowerCase().startsWith(lowerQuery);
            if (aTitleMatch && !bTitleMatch) return -1;
            if (!aTitleMatch && bTitleMatch) return 1;
            return 0;
        });

        selectedIndex = results.length > 0 ? 0 : -1;
        renderResults(results);
    }

    // Render search results
    function renderResults(results) {
        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="search-empty">
                    <div class="search-empty-icon">🔍</div>
                    <p>${searchInput.value.trim() ? 'No applications found' : 'Start typing to search...'}</p>
                </div>
            `;
            return;
        }

        searchResults.innerHTML = results.map((app, index) => {
            // Get theme-appropriate icon
            const iconValue = getIconForTheme(app.icon);

            // Determine if icon is an image filename or emoji
            let iconHtml;
            if (iconValue && iconValue.includes('.png')) {
                const fullPath = `${ICON_BASE_PATH}${iconValue}`;
                iconHtml = `<img src="${fullPath}" alt="${app.title} icon" style="width: 40px; height: 40px; object-fit: contain;">`;
            } else {
                iconHtml = iconValue;
            }

            return `
                <a href="${app.url}"
                   class="search-result-item ${index === selectedIndex ? 'selected' : ''}"
                   data-index="${index}"
                   target="_blank"
                   rel="noopener noreferrer">
                    <div class="search-result-icon">${iconHtml}</div>
                    <div class="search-result-content">
                        <div class="search-result-title">${app.title}</div>
                        <div class="search-result-description">${app.description}</div>
                        <div class="search-result-category">${app.category}</div>
                    </div>
                </a>
            `;
        }).join('');

        // Add click handlers to results
        const resultItems = searchResults.querySelectorAll('.search-result-item');
        resultItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                closeSearch();
            });
            item.addEventListener('mouseenter', () => {
                selectedIndex = index;
                updateSelectedItem();
            });
        });
    }

    // Update selected item styling
    function updateSelectedItem() {
        const items = searchResults.querySelectorAll('.search-result-item');
        items.forEach((item, index) => {
            if (index === selectedIndex) {
                item.classList.add('selected');
                item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            } else {
                item.classList.remove('selected');
            }
        });
    }

    // Keyboard navigation
    function handleKeyNavigation(e) {
        const items = searchResults.querySelectorAll('.search-result-item');

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (selectedIndex < items.length - 1) {
                selectedIndex++;
                updateSelectedItem();
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (selectedIndex > 0) {
                selectedIndex--;
                updateSelectedItem();
            }
        } else if (e.key === 'Enter' && selectedIndex >= 0 && items[selectedIndex]) {
            e.preventDefault();
            items[selectedIndex].click();
        }
    }

    // Event listeners
    searchTrigger.addEventListener('click', openSearch);

    // Debounced search for better performance
    const debouncedSearch = debounce((value) => {
        performSearch(value);
    }, 200); // Wait 200ms after user stops typing

    searchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value);
    });

    searchInput.addEventListener('keydown', handleKeyNavigation);

    // Click outside to close
    searchOverlay.addEventListener('click', (e) => {
        if (e.target === searchOverlay) {
            closeSearch();
        }
    });

    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Cmd+K or Ctrl+K to open search
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            openSearch();
        }

        // / to open search (like GitHub)
        if (e.key === '/' && !searchOverlay.classList.contains('active')) {
            // Don't trigger if typing in an input
            if (document.activeElement.tagName === 'INPUT' ||
                document.activeElement.tagName === 'TEXTAREA') {
                return;
            }
            e.preventDefault();
            openSearch();
        }

        // ESC to close search
        if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
            closeSearch();
        }
    });

    // Initialize
    collectAllApps();
})();

// ===== VERSION/COMMIT ID DISPLAY =====
(function() {
    const commitIdElement = document.getElementById('commit-id');

    // Configuration - Update these values with your GitHub repo info
    const GITHUB_REPO_OWNER = 'hope-ignites';
    const GITHUB_REPO_NAME = 'my-hopeignites-app';
    const BRANCH = 'main';

    async function fetchCommitId() {
        try {
            const response = await fetch(
                `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/commits/${BRANCH}`,
                {
                    headers: {
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch commit data');
            }

            const data = await response.json();
            const commitSha = data.sha.substring(0, 7); // Short commit hash
            const commitDate = new Date(data.commit.author.date);
            const commitMessage = data.commit.message.split('\n')[0]; // First line only

            // Format date
            const formattedDate = commitDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });

            // Create clickable link to commit on GitHub
            const commitUrl = `https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/commit/${data.sha}`;
            commitIdElement.innerHTML = `Version: <a href="${commitUrl}" target="_blank" rel="noopener noreferrer" title="${commitMessage}" style="color: inherit; text-decoration: underline;">${commitSha}</a> (${formattedDate})`;

        } catch (error) {
            logger.error('Error fetching commit ID:', error);
            commitIdElement.textContent = 'Version: unknown';
        }
    }

    // Fetch commit ID on page load
    fetchCommitId();
})();

// ===== MOBILE HAMBURGER MENU =====
(function() {
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const drawer = document.getElementById('mobile-drawer');
    const overlay = document.getElementById('mobile-drawer-overlay');
    const drawerClose = document.getElementById('mobile-drawer-close');
    const mobileCategories = document.getElementById('mobile-categories');
    const mobileSearchTrigger = document.getElementById('mobile-search-trigger');
    const mobileDarkModeToggle = document.getElementById('mobile-dark-mode-toggle');

    // Check if elements exist
    if (!menuToggle || !drawer || !overlay) {
        logger.error('Mobile menu elements not found');
        return;
    }

    logger.log('Mobile menu initialized');

    function openDrawer() {
        logger.log('Opening drawer');
        drawer.classList.add('open');
        overlay.classList.add('open');
        menuToggle.classList.add('open');
        document.body.style.overflow = 'hidden'; // Prevent scrolling

        // Populate categories when opening (in case they weren't loaded yet)
        populateMobileCategories();
    }

    function closeDrawer() {
        if (!drawer.classList.contains('open')) {
            return; // Already closed, don't do anything
        }
        logger.log('Closing drawer');
        drawer.classList.remove('open');
        overlay.classList.remove('open');
        menuToggle.classList.remove('open');
        document.body.style.overflow = ''; // Restore scrolling
    }

    // Populate mobile categories
    function populateMobileCategories() {
        logger.log('Populating mobile categories...');
        logger.log('portalData:', portalData);
        logger.log('mobileCategories element:', mobileCategories);

        if (!portalData || !portalData.categories) {
            logger.error('No portal data available');
            return;
        }

        mobileCategories.innerHTML = '';

        const categoriesToShow = portalData.categories.filter(cat => {
            // Skip "all" category
            if (cat.id === 'all') return false;
            // Skip tech-only categories if not in tech mode
            if (!isTechMode && cat.id === 'tech-tools') return false;
            return true;
        });

        logger.log('Categories to show:', categoriesToShow);

        categoriesToShow.forEach(category => {
            const btn = document.createElement('button');
            btn.className = 'mobile-category-btn';
            btn.textContent = category.name;
            btn.dataset.categoryId = category.id;

            // Mark active category
            if (category.id === currentCategory) {
                btn.classList.add('active');
            }

            btn.addEventListener('click', () => {
                currentCategory = category.id;
                renderCards();

                // Update active state
                document.querySelectorAll('.mobile-category-btn').forEach(b => {
                    b.classList.remove('active');
                });
                btn.classList.add('active');

                // Update desktop tabs too
                document.querySelectorAll('.tab-button').forEach(b => {
                    b.classList.remove('active');
                    if (b.dataset.category === category.id) {
                        b.classList.add('active');
                    }
                });

                closeDrawer();
            });

            mobileCategories.appendChild(btn);
        });
    }

    // Mobile search trigger
    if (mobileSearchTrigger) {
        mobileSearchTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            logger.log('Mobile search clicked');

            // Close drawer first
            closeDrawer();

            // Trigger desktop search with correct class
            setTimeout(() => {
                const searchOverlay = document.getElementById('search-overlay');
                const searchInput = document.getElementById('search-input');

                if (searchOverlay && searchInput) {
                    searchOverlay.classList.add('active');
                    setTimeout(() => searchInput.focus(), 100);
                } else {
                    logger.error('Search overlay or input not found');
                }
            }, 300); // Wait for drawer to close
        });
    }

    // Mobile dark mode toggle
    if (mobileDarkModeToggle) {
        mobileDarkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');

            // Update icon
            const icon = mobileDarkModeToggle.querySelector('.mobile-dark-mode-icon');
            if (icon) {
                icon.textContent = isDark ? '☀️' : '🌙';
            }

            // Update desktop button too
            const desktopBtn = document.getElementById('dark-mode-toggle');
            if (desktopBtn) {
                desktopBtn.textContent = isDark ? '☀️' : '🌙';
            }

            // Update logo
            updateLogo(isDark);

            // Update card icons for new theme (optimized)
            updateCardIcons();
        });
    }

    // Event listeners
    menuToggle.addEventListener('click', (e) => {
        logger.log('Menu toggle clicked');
        e.preventDefault();
        e.stopPropagation();
        openDrawer();
    });

    if (drawerClose) {
        drawerClose.addEventListener('click', closeDrawer);
    }

    overlay.addEventListener('click', closeDrawer);

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && drawer.classList.contains('open')) {
            closeDrawer();
        }
    });
})();
