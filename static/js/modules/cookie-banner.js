/**
 * Cookie Consent Banner Module
 * Handles display and acceptance of cookie consent banner
 */

(function() {
    'use strict';

    const COOKIE_CONSENT_KEY = 'cookieConsent';
    const BANNER_ID = 'cookieBanner';
    const ACCEPT_BUTTON_ID = 'cookieAccept';

    /**
     * Check if user has already consented to cookies
     * @returns {boolean} True if consent was given
     */
    function hasConsented() {
        try {
            return localStorage.getItem(COOKIE_CONSENT_KEY) === 'accepted';
        } catch (e) {
            console.warn('localStorage is not available');
            return false;
        }
    }

    /**
     * Save user's consent to localStorage
     */
    function saveConsent() {
        try {
            localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
        } catch (e) {
            console.warn('Unable to save to localStorage');
        }
    }

    /**
     * Show the cookie banner with animation
     */
    function showBanner() {
        const banner = document.getElementById(BANNER_ID);
        if (banner) {
            // Small delay for smooth animation
            setTimeout(() => {
                banner.classList.add('cookie-banner--show');
            }, 500);
        }
    }

    /**
     * Hide the cookie banner with animation
     */
    function hideBanner() {
        const banner = document.getElementById(BANNER_ID);
        if (banner) {
            banner.classList.remove('cookie-banner--show');
            // Remove from DOM after animation completes
            setTimeout(() => {
                banner.style.display = 'none';
            }, 400);
        }
    }

    /**
     * Handle accept button click
     */
    function handleAccept() {
        saveConsent();
        hideBanner();
    }

    /**
     * Initialize cookie banner
     */
    function init() {
        // Check if user already consented
        if (hasConsented()) {
            // User already consented, don't show banner
            const banner = document.getElementById(BANNER_ID);
            if (banner) {
                banner.style.display = 'none';
            }
            return;
        }

        // Show banner after a short delay
        showBanner();

        // Attach event listener to accept button
        const acceptButton = document.getElementById(ACCEPT_BUTTON_ID);
        if (acceptButton) {
            acceptButton.addEventListener('click', handleAccept);
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose functions globally (for debugging or manual control)
    window.CookieBanner = {
        show: showBanner,
        hide: hideBanner,
        reset: function() {
            try {
                localStorage.removeItem(COOKIE_CONSENT_KEY);
                location.reload();
            } catch (e) {
                console.warn('Unable to reset cookie consent');
            }
        }
    };
})();
