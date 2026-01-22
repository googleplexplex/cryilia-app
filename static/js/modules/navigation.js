// ============================================
// NAVIGATION MODULE
// Навигация и скролл
// ============================================

/**
 * Initialize smooth scrolling for navigation links
 */
export function initSmoothScroll() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

/**
 * Add scroll effect to header
 */
export function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;

    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 2px 30px rgba(0, 0, 0, 0.15)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        }
    });
}

/**
 * Scroll to sections
 */
export function scrollToSpecialists() {
    const section = document.getElementById('specialists');
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

export function scrollToServices() {
    const section = document.getElementById('services');
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

export function scrollToContacts() {
    const section = document.getElementById('contacts');
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Redirect to booking system
 */
export function redirectToBooking() {
    window.open('https://dikidi.app/1806947?p=0.pi', '_blank');
}

/**
 * Set current year in footer
 */
export function setCurrentYear() {
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
}
