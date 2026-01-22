// ============================================
// ANIMATIONS MODULE
// Анимации при скролле
// ============================================

/**
 * Initialize scroll animations
 */
export function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.service-card, .feature, .contact-item, .gallery');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    return observer;
}

/**
 * Ensure images are always visible
 */
export function ensureImagesVisible() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.style.opacity = '1';
        img.style.transition = 'none';
        img.style.removeProperty('transition');
    });
}

/**
 * Ensure specialist cards are always visible
 */
export function ensureSpecialistCardsVisible() {
    const specialistCards = document.querySelectorAll('.specialist-card');
    specialistCards.forEach(card => {
        card.style.opacity = '1';
        card.style.visibility = 'visible';
        card.style.transform = 'none';
    });

    const specialistContent = document.querySelectorAll('.specialist-card__info, .specialist-card__name, .specialist-card__position, .specialist-card__experience, .specialist-card__link, .experience-item');
    specialistContent.forEach(element => {
        element.style.opacity = '1';
        element.style.visibility = 'visible';
        element.style.display = '';
        element.style.transform = 'none';
    });

    const experienceItemChildren = document.querySelectorAll('.experience-item p, .experience-item span');
    experienceItemChildren.forEach(element => {
        element.style.opacity = '1';
        element.style.visibility = 'visible';
        element.style.transform = 'none';
        element.style.transition = 'none';
    });
}
