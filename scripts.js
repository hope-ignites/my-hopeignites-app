(function() {
    // Toast Notification Configuration
    const NOTIFICATION_CONFIG = {
        enabled: false, // Set to false to disable notification
        message: "It's time for FSA Open Enrollment!",
        linkText: "Learn more →",
        linkUrl: "https://hopeignites1977.sharepoint.com/sites/Hub/SitePages/All-Team-News---November-7,-2025.aspx?from=SendByEmail&e=vDTtnzmF1UeY_-BFnwP6Bg&at=121#flexible-spending-accounts-open-enrollment-november-17-through-december-1",
        icon: "💳", // Emoji or text icon
        id: "update-nov-2025", // Change this ID to show notification again
        displayDuration: 8000, // How long to show (milliseconds)
        autoHide: true // Automatically hide after displayDuration
    };

    function shouldShowNotification() {
        if (!NOTIFICATION_CONFIG.enabled) return false;
        const dismissedNotifications = JSON.parse(localStorage.getItem('dismissed_notifications') || '[]');
        return !dismissedNotifications.includes(NOTIFICATION_CONFIG.id);
    }

    function showToastNotification() {
        if (!shouldShowNotification()) return;
        const toast = document.createElement('div');
        toast.className = 'toast-notification peek';
        toast.innerHTML = `
            <span class="toast-icon">${NOTIFICATION_CONFIG.icon}</span>
            <div class="toast-content">
                <p class="toast-message">${NOTIFICATION_CONFIG.message}</p>
                <a href="${NOTIFICATION_CONFIG.linkUrl}" class="toast-link" target="_blank" rel="noopener noreferrer">
                    ${NOTIFICATION_CONFIG.linkText}
                </a>
            </div>
            <button class="toast-close" aria-label="Close notification">&times;</button>
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        // Unfurl on hover/focus, peek on mouseleave/blur
        function unfurl() {
            toast.classList.remove('peek');
            toast.classList.add('unfurled');
        }
        function peek() {
            toast.classList.remove('unfurled');
            toast.classList.add('peek');
        }
        toast.addEventListener('mouseenter', unfurl);
        toast.addEventListener('focusin', unfurl);
        toast.addEventListener('mouseleave', peek);
        toast.addEventListener('focusout', peek);

        // Start peeking, then auto-unfurl after 2s if not hovered
        let autoUnfurlTimeout = setTimeout(() => {
            unfurl();
        }, 2000);

        // Close button handler
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dismissNotification(toast);
        });
        // Dismiss when link is clicked
        const link = toast.querySelector('.toast-link');
        link.addEventListener('click', () => {
            setTimeout(() => {
                dismissNotification(toast);
            }, 500);
        });
        // Prevent auto-hide, but allow manual close
    }

    function dismissNotification(toastElement) {
        toastElement.classList.remove('show');
        toastElement.classList.add('hide');
        // Save dismissal to localStorage
        const dismissedNotifications = JSON.parse(localStorage.getItem('dismissed_notifications') || '[]');
        if (!dismissedNotifications.includes(NOTIFICATION_CONFIG.id)) {
            dismissedNotifications.push(NOTIFICATION_CONFIG.id);
            localStorage.setItem('dismissed_notifications', JSON.stringify(dismissedNotifications));
        }
        // Remove from DOM after animation
        setTimeout(() => {
            toastElement.remove();
        }, 400);
    }

    // Show toast notification after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(showToastNotification, 1500));
    } else {
        setTimeout(showToastNotification, 1500);
    }
})();
// ===== PWA SERVICE WORKER REGISTRATION =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
                console.log('PWA: Service Worker registered successfully:', registration.scope);
            })
            .catch((error) => {
                console.log('PWA: Service Worker registration failed:', error);
            });
    });
}

// ===== DARK MODE TOGGLE =====
// Global updateLogo function so mobile menu can access it
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
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'enabled') {
        body.classList.add('dark-mode');
        darkModeToggle.textContent = '☀️';
        updateLogo(true);
    }

    darkModeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');

        if (body.classList.contains('dark-mode')) {
            darkModeToggle.textContent = '☀️';
            localStorage.setItem('darkMode', 'enabled');
            updateLogo(true);
        } else {
            darkModeToggle.textContent = '🌙';
            localStorage.setItem('darkMode', 'disabled');
            updateLogo(false);
        }

        // Re-render cards to update icons for new theme
        if (typeof renderCards === 'function') {
            renderCards();
        }
    });
})();

// ===== FAVORITES/PINNING FUNCTIONALITY =====
const FavoritesManager = (function() {
    const STORAGE_KEY = 'app_launcher_favorites';
    const DEFAULT_TAB_KEY = 'app_launcher_default_tab';

    function getFavorites() {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    function saveFavorites(favorites) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    }

    function isFavorite(url) {
        const favorites = getFavorites();
        return favorites.includes(url);
    }

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

    function getDefaultTab() {
        const stored = localStorage.getItem(DEFAULT_TAB_KEY);
        return stored || 'all';
    }

    function setDefaultTab(tabId) {
        localStorage.setItem(DEFAULT_TAB_KEY, tabId);
    }

    return {
        getFavorites,
        isFavorite,
        toggleFavorite,
        getDefaultTab,
        setDefaultTab
    };
})();

// ===== RECENTLY USED FUNCTIONALITY =====
const RecentlyUsedManager = (function() {
    const STORAGE_KEY = 'app_launcher_recently_used';
    const MAX_RECENT_APPS = 8;
    const MAX_AGE_DAYS = 30;

    function getRecentlyUsed() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        
        const apps = JSON.parse(stored);
        const now = Date.now();
        const maxAge = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
        
        // Filter out apps older than MAX_AGE_DAYS
        return apps.filter(app => (now - app.timestamp) < maxAge);
    }

    function saveRecentlyUsed(apps) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
    }

    function addRecentApp(cardData) {
        let recentApps = getRecentlyUsed();
        
        // Remove existing entry if present (we'll re-add at top)
        recentApps = recentApps.filter(app => app.url !== cardData.url);
        
        // Add to beginning
        recentApps.unshift({
            url: cardData.url,
            title: cardData.title,
            description: cardData.description,
            icon: cardData.icon,
            universal: cardData.universal,
            sso: cardData.sso,
            nhqOnly: cardData.nhqOnly,
            timestamp: Date.now()
        });
        
        // Keep only MAX_RECENT_APPS
        if (recentApps.length > MAX_RECENT_APPS) {
            recentApps = recentApps.slice(0, MAX_RECENT_APPS);
        }
        
        saveRecentlyUsed(recentApps);
    }

    function clearHistory() {
        localStorage.removeItem(STORAGE_KEY);
    }

    return {
        getRecentlyUsed,
        addRecentApp,
        clearHistory
    };
})();

// ===== APPLICATION LAUNCHER RENDERING FROM JSON =====
// Global variables so mobile menu can access them
let portalData = null; // Keep variable name for compatibility
let currentCategory = FavoritesManager.getDefaultTab(); // Load saved preference or default to 'all'
const ICON_BASE_PATH = 'assets/app-icons/';
let renderCards; // Will be defined below
let renderTabs; // Will be defined below

// Detect if we're on /tech path
const isTechMode = window.location.pathname.includes('/tech');

// Check for tech mode default preference on page load
(function checkTechModeDefault() {
    const techModeDefault = localStorage.getItem('tech_mode_default');
    const isOnRootPath = window.location.pathname === '/' || window.location.pathname === '/index.html';
    
    // If tech mode is set as default and we're on the root path, redirect to /tech
    if (techModeDefault === 'enabled' && isOnRootPath && !isTechMode) {
        window.location.href = '/tech';
    }
})();

// Initialize tech mode banner and toggle
function initTechMode() {
    if (!isTechMode) return;
    
    const techBanner = document.getElementById('tech-mode-banner');
    if (techBanner) {
        techBanner.style.display = 'flex';
    }
    
    // Initialize tech mode default toggle
    const techModeToggle = document.getElementById('tech-mode-default-toggle');
    if (techModeToggle) {
        // Set initial state based on localStorage
        const techModeDefault = localStorage.getItem('tech_mode_default');
        techModeToggle.checked = techModeDefault === 'enabled';
        
        console.log('Tech Mode Toggle Initialized:', {
            checked: techModeToggle.checked,
            localStorage: techModeDefault
        });
        
        // Handle toggle change
        techModeToggle.addEventListener('change', () => {
            if (techModeToggle.checked) {
                localStorage.setItem('tech_mode_default', 'enabled');
                console.log('Tech mode set as default');
            } else {
                localStorage.removeItem('tech_mode_default');
                console.log('Tech mode default disabled');
            }
        });
    }
}

// Helper function to check if a date is within X days of today
function isWithinDays(dateString, days) {
    if (!dateString) return false;
    const addedDate = new Date(dateString);
    const today = new Date();
    const diffTime = today - addedDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= days;
}

// Helper function to get theme-appropriate icon
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

    // Fetch portal data from JSON file (always fetches fresh data)
    async function loadPortalData() {
        try {
            // Add cache-busting timestamp to ensure fresh data on every load
            const timestamp = new Date().getTime();
            const response = await fetch(`portal-data.json?v=${timestamp}`, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache'
                }
            });
            if (!response.ok) {
                throw new Error('Failed to load portal data');
            }
            portalData = await response.json();
            // Make data available globally for search feature
            window.portalDataCache = portalData;
            console.log('Application Launcher data loaded successfully (fresh from server)');
            return portalData;
        } catch (error) {
            console.error('Error loading Application Launcher data:', error);
            // Display error message to user
            const grid = document.getElementById('portal-grid');
            grid.innerHTML = '<p style="color: white; text-align: center;">Unable to load applications. Please refresh the page.</p>';
            return null;
        }
    }

    // Refresh portal data - clears cache and fetches fresh data
    async function refreshPortalData() {
        try {
            // Clear cache for portal-data.json
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                for (const cacheName of cacheNames) {
                    const cache = await caches.open(cacheName);
                    await cache.delete('/portal-data.json');
                    await cache.delete('portal-data.json');
                }
                console.log('Cache cleared for portal-data.json');
            }

            // Fetch fresh data with cache-busting
            const timestamp = new Date().getTime();
            const response = await fetch(`portal-data.json?v=${timestamp}`, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to refresh portal data');
            }

            portalData = await response.json();
            window.portalDataCache = portalData;
            console.log('Application Launcher data refreshed successfully');
            
            // Re-render cards (favorites are preserved in localStorage)
            renderCards();
            renderTabs();
            
            return true;
        } catch (error) {
            console.error('Error refreshing Application Launcher data:', error);
            throw error;
        }
    }

    // Get all new apps across all categories
    function getNewApps() {
        const newApps = [];
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
                    // Skip tech-only cards if not in tech mode
                    if (!isTechMode && card.tech === true) {
                        return;
                    }
                    // Check if card is new
                    const isNew = card.isNew === true || 
                        (card.addedDate && isWithinDays(card.addedDate, 14));
                    if (isNew) {
                        newApps.push(card);
                    }
                });
            }
        });
        return newApps;
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

        // Add "New Apps" category after favorites if there are new apps
        const newApps = getNewApps();
        if (newApps.length > 0) {
            const favoritesIndex = categoriesToRender.findIndex(cat => cat.id === 'favorites');
            if (favoritesIndex !== -1) {
                // Insert "New Apps" category right after favorites
                categoriesToRender.splice(favoritesIndex + 1, 0, {
                    id: 'new',
                    name: '❇️  New Apps',
                    cards: newApps
                });
            }
        }

        // Add "Recently Used" category after favorites
        const recentApps = RecentlyUsedManager.getRecentlyUsed();
        if (recentApps.length > 0) {
            const favoritesIndex = categoriesToRender.findIndex(cat => cat.id === 'favorites');
            if (favoritesIndex !== -1) {
                // Insert right after favorites (before New Apps if it exists)
                categoriesToRender.splice(favoritesIndex + 1, 0, {
                    id: 'recently-used',
                    name: '🕐 Recently Used',
                    cards: recentApps
                });
            }
        }

        categoriesToRender.forEach(category => {
            // Filter out tech-only categories if not in tech mode
            const hasTechCards = category.cards && category.cards.some(card => card.tech === true);
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
                updateDefaultTabSettingVisibility();
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
                        // Skip tech-only cards if not in tech mode
                        if (!isTechMode && card.tech === true) {
                            return;
                        }
                        if (favoriteUrls.includes(card.url)) {
                            cardsToDisplay.push(card);
                        }
                    });
                }
            });
        } else if (currentCategory === 'recently-used') {
            // Show recently used apps
            const recentApps = RecentlyUsedManager.getRecentlyUsed();
            cardsToDisplay = recentApps;
        } else if (currentCategory === 'new') {
            // Show only new apps
            cardsToDisplay = getNewApps();
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
                        if (card.nhqOnly && !isNHQIP) {
                            return;
                        }
                        // Skip tech-only cards if not in tech mode
                        if (!isTechMode && card.tech === true) {
                            return;
                        }
                        cardsToDisplay.push(card);
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
                    if (card.nhqOnly && !isNHQIP) {
                        return false;
                    }
                    // Skip tech-only cards if not in tech mode
                    if (!isTechMode && card.tech === true) {
                        return false;
                    }
                    return true;
                });
            }
        }

        // Create card elements
        cardsToDisplay.forEach(card => {
            const cardWrapper = document.createElement('div');
            cardWrapper.style.position = 'relative';

            const cardLink = document.createElement('a');
            cardLink.href = card.url;
            cardLink.className = 'portal-card';

            const isFav = FavoritesManager.isFavorite(card.url);

            // Get theme-appropriate icon
            const iconValue = getIconForTheme(card.icon);

            // Determine if icon is an image filename or emoji
            console.log('DEBUG - Card:', card.title);
            console.log('DEBUG - Icon value:', iconValue);
            console.log('DEBUG - Icon type:', typeof iconValue);
            console.log('DEBUG - Has .png?', iconValue && iconValue.includes('.png'));
            console.log('DEBUG - ICON_BASE_PATH:', ICON_BASE_PATH);

            let iconHtml;
            if (iconValue && iconValue.includes('.png')) {
                const fullPath = `${ICON_BASE_PATH}${iconValue}`;
                console.log('DEBUG - Full image path:', fullPath);
                iconHtml = `<img src="${fullPath}" alt="${card.title} icon" style="width: 46px; height: 46px; object-fit: contain;">`;
                console.log('DEBUG - iconHtml (img):', iconHtml);
            } else {
                iconHtml = iconValue;
                console.log('DEBUG - iconHtml (emoji):', iconHtml);
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

            // Check for NEW indicator (supports boolean flag or date-based)
            // Future: if card.addedDate exists, compare to current date (e.g., within 14 days)
            const isNewApp = card.isNew === true || 
                (card.addedDate && isWithinDays(card.addedDate, 14));
            const newIndicator = isNewApp
                ? `<div class="new-indicator" title="Recently added">New</div>`
                : '';

            cardLink.innerHTML = `
                <button class="favorite-btn ${isFav ? 'favorited' : ''}"
                        data-url="${card.url}"
                        aria-label="${isFav ? 'Remove from favorites' : 'Add to favorites'}"
                        title="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
                    ${isFav ? '⭐' : '☆'}
                </button>
                ${newIndicator}
                <div class="portal-icon">${iconHtml}</div>
                <h3>${card.title}</h3>
                <p>${card.description}</p>
                ${universalIndicator}
                ${nhqIndicator}
                ${ssoIndicator}
            `;
            console.log('DEBUG - Final card HTML:', cardLink.innerHTML);

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

            // Add click handler for tracking recently used apps
            cardLink.addEventListener('click', () => {
                RecentlyUsedManager.addRecentApp(card);
            });

            grid.appendChild(cardLink);
        });

        // Show message if favorites is empty
        if (currentCategory === 'favorites' && cardsToDisplay.length === 0) {
            grid.innerHTML = '<p style="color: var(--text-light); text-align: center; grid-column: 1/-1;">No favorites yet. Click the ☆ on any card to add it to your favorites!</p>';
        }

        // Show message if recently used is empty
        if (currentCategory === 'recently-used' && cardsToDisplay.length === 0) {
            grid.innerHTML = '<p style="color: var(--text-light); text-align: center; grid-column: 1/-1;">No recently used apps yet. Click on any app to get started!</p>';
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

    // Default tab setting toggle
    function initDefaultTabToggle() {
        const defaultTabSetting = document.getElementById('default-tab-setting');
        const defaultTabToggle = document.getElementById('default-tab-toggle');

        if (!defaultTabToggle) return;

        // Set initial toggle state
        const currentDefault = FavoritesManager.getDefaultTab();
        defaultTabToggle.checked = currentDefault === 'favorites';

        // Handle toggle change
        defaultTabToggle.addEventListener('change', () => {
            if (defaultTabToggle.checked) {
                FavoritesManager.setDefaultTab('favorites');
            } else {
                FavoritesManager.setDefaultTab('all');
            }
        });
    }

    // Update visibility of default tab setting based on current category
    function updateDefaultTabSettingVisibility() {
        const defaultTabSetting = document.getElementById('default-tab-setting');
        if (defaultTabSetting) {
            defaultTabSetting.style.display = currentCategory === 'favorites' ? 'block' : 'none';
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
            initDefaultTabToggle();
            updateDefaultTabSettingVisibility();
            initTechMode();
            initTechModeIndicator();
        }
    }

    // Listen for refresh events
    document.addEventListener('refreshPortalData', async () => {
        try {
            await refreshPortalData();
        } catch (error) {
            console.error('Failed to refresh portal data:', error);
            throw error;
        }
    });

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
                    console.log('IP Detection: Using cached IP:', data.ip);
                    return data.ip;
                }
            } catch (e) {
                console.warn('IP Detection: Invalid cache data');
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

                console.log('IP Detection: Fetched fresh IP:', ip);
                return ip;
            } catch (error) {
                console.warn(`IP Detection: Failed to fetch from ${service}:`, error);
                continue;
            }
        }

        console.error('IP Detection: All services failed');
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

        console.log('IP Detection: Message displayed for IP:', userIP);
    }

    // Main function: Check IP and display message if needed
    async function checkAndDisplayMessage() {
        try {
            const userIP = await getCachedOrFetchIP();

            if (!userIP) {
                console.warn('IP Detection: Could not determine IP address');
                return;
            }

            // Check if IP matches allowed list (NHQ IPs)
            if (checkIP(userIP)) {
                isNHQIP = true;
                showIPMessage(userIP);
                console.log('IP Detection: NHQ IP detected, isNHQIP =', isNHQIP);
            } else {
                isNHQIP = false;
                console.log('IP Detection: IP not in allowed list:', userIP);
            }
        } catch (error) {
            console.error('IP Detection: Error:', error);
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

// ===== CACHE REFRESH FUNCTIONALITY =====
(function() {
    const refreshBtn = document.getElementById('refresh-apps');
    const mobileRefreshBtn = document.getElementById('mobile-refresh-apps');

    // Show success notification
    function showRefreshNotification(success = true) {
        const notification = document.createElement('div');
        notification.className = 'refresh-notification';
        notification.innerHTML = success 
            ? '✓ App list refreshed successfully!' 
            : '✗ Failed to refresh app list';
        notification.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: ${success ? '#10b981' : '#ef4444'};
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            font-size: 0.95rem;
            font-weight: 500;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            animation: slideInUp 0.3s ease;
        `;
        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutDown 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Handle refresh click
    async function handleRefresh(button) {
        // Don't allow double-clicking
        if (button.classList.contains('refreshing')) {
            return;
        }

        button.classList.add('refreshing');
        button.disabled = true;

        try {
            // Dispatch custom event to trigger refresh
            const refreshEvent = new CustomEvent('refreshPortalData');
            document.dispatchEvent(refreshEvent);

            // Wait a moment for the refresh to complete
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            showRefreshNotification(true);
        } catch (error) {
            console.error('Refresh failed:', error);
            showRefreshNotification(false);
        } finally {
            button.classList.remove('refreshing');
            button.disabled = false;
        }
    }

    // Desktop refresh button
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => handleRefresh(refreshBtn));
    }

    // Mobile refresh button  
    if (mobileRefreshBtn) {
        mobileRefreshBtn.addEventListener('click', () => handleRefresh(mobileRefreshBtn));
    }
})();

// ===== WELCOME MODAL (FIRST-TIME VISITORS) =====
(function () {
    const WELCOME_DISMISSED_KEY = 'welcomeModalDismissed';
    const welcomeModal = document.getElementById('welcome-modal');
    const welcomeDismissBtn = document.getElementById('welcome-dismiss');
    const closeBtn = welcomeModal.querySelector('.modal-close');

    function openWelcomeModal() {
        welcomeModal.classList.add('open');
        welcomeModal.setAttribute('aria-hidden', 'false');
    }

    function closeWelcomeModal() {
        welcomeModal.classList.remove('open');
        welcomeModal.setAttribute('aria-hidden', 'true');
        // Remember that user dismissed the welcome modal
        localStorage.setItem(WELCOME_DISMISSED_KEY, 'true');
    }

    // Check if user has seen the welcome modal before
    const hasSeenWelcome = localStorage.getItem(WELCOME_DISMISSED_KEY);

    if (!hasSeenWelcome) {
        // Show welcome modal after a short delay (500ms) for better UX
        setTimeout(() => {
            openWelcomeModal();
        }, 500);
    }

    // Event listeners
    welcomeDismissBtn.addEventListener('click', closeWelcomeModal);
    closeBtn.addEventListener('click', closeWelcomeModal);

    welcomeModal.addEventListener('click', function (e) {
        if (e.target && e.target.hasAttribute('data-close')) closeWelcomeModal();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && welcomeModal.classList.contains('open')) closeWelcomeModal();
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

    searchInput.addEventListener('input', (e) => {
        performSearch(e.target.value);
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
            console.error('Error fetching commit ID:', error);
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
        console.error('Mobile menu elements not found');
        return;
    }

    console.log('Mobile menu initialized');

    function openDrawer() {
        console.log('Opening drawer');
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
        console.log('Closing drawer');
        drawer.classList.remove('open');
        overlay.classList.remove('open');
        menuToggle.classList.remove('open');
        document.body.style.overflow = ''; // Restore scrolling
    }

    // Populate mobile categories
    function populateMobileCategories() {
        console.log('Populating mobile categories...');
        console.log('portalData:', portalData);
        console.log('mobileCategories element:', mobileCategories);

        if (!portalData || !portalData.categories) {
            console.error('No portal data available');
            return;
        }

        mobileCategories.innerHTML = '';

        // Build categories list
        let categoriesToShow = portalData.categories.filter(cat => {
            // Skip "all" category
            if (cat.id === 'all') return false;
            // Skip tech-only categories if not in tech mode
            if (!isTechMode && cat.id === 'tech-tools') return false;
            return true;
        });

        // Add "Recently Used" after favorites if there are recent apps
        const recentApps = RecentlyUsedManager.getRecentlyUsed();
        if (recentApps.length > 0) {
            const favoritesIndex = categoriesToShow.findIndex(cat => cat.id === 'favorites');
            if (favoritesIndex !== -1) {
                categoriesToShow.splice(favoritesIndex + 1, 0, {
                    id: 'recently-used',
                    name: '🕐 Recently Used',
                    cards: recentApps
                });
            }
        }

        // Add "New Apps" category if there are new apps
        const newApps = getNewApps();
        if (newApps.length > 0) {
            const favoritesIndex = categoriesToShow.findIndex(cat => cat.id === 'favorites');
            if (favoritesIndex !== -1) {
                // Insert after favorites (and recently-used if it exists)
                let insertIndex = favoritesIndex + 1;
                if (categoriesToShow[insertIndex]?.id === 'recently-used') {
                    insertIndex++;
                }
                categoriesToShow.splice(insertIndex, 0, {
                    id: 'new',
                    name: '❇️  New Apps',
                    cards: newApps
                });
            }
        }

        console.log('Categories to show:', categoriesToShow);

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
                updateDefaultTabSettingVisibility();

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
            console.log('Mobile search clicked');

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
                    console.error('Search overlay or input not found');
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

            // Re-render cards to update icons for new theme
            if (typeof renderCards === 'function') {
                renderCards();
            }
        });
    }

    // Event listeners
    menuToggle.addEventListener('click', (e) => {
        console.log('Menu toggle clicked');
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
