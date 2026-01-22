// ============================================
// TESTIMONIALS MODULE
// Слайдер отзывов
// ============================================

let currentTestimonial = 0;
const testimonials = [];
let testimonialInterval;
let autoplayStopped = false;

/**
 * Initialize testimonials slider
 */
export function initTestimonials() {
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    testimonialCards.forEach((card, index) => {
        testimonials.push(card);
    });

    // Show first testimonial
    showTestimonial(0);

    // Setup transitions
    testimonialCards.forEach(card => {
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    });

    // Start autoplay
    startTestimonialAutoplay();
}

/**
 * Show specific testimonial (show 3 at once)
 */
function showTestimonial(index) {
    // Hide all testimonials
    testimonials.forEach((testimonial) => {
        testimonial.classList.remove('active');
        testimonial.style.opacity = '0';
        testimonial.style.transform = 'translateY(20px)';
    });

    // Show exactly 3 testimonials starting from index
    const activeCards = [];
    for (let i = 0; i < 3; i++) {
        let cardIndex;
        if (index + i >= testimonials.length) {
            cardIndex = (index + i) % testimonials.length;
        } else {
            cardIndex = index + i;
        }

        if (testimonials[cardIndex]) {
            testimonials[cardIndex].classList.add('active');
            activeCards.push(cardIndex);
        }
    }

    // Trigger animation
    setTimeout(() => {
        activeCards.forEach(cardIndex => {
            testimonials[cardIndex].style.opacity = '1';
            testimonials[cardIndex].style.transform = 'translateY(0)';
        });
    }, 10);

    currentTestimonial = index;
    updateDots();
}

/**
 * Update dots
 */
function updateDots() {
    const dots = document.querySelectorAll('.testimonials__dot');
    const totalDots = dots.length;
    const totalTestimonials = testimonials.length;
    const maxValidIndex = totalTestimonials - 3;

    dots.forEach((dot, index) => {
        if (index <= maxValidIndex) {
            if (index === currentTestimonial) {
                dot.classList.add('active');
                dot.style.display = 'block';
            } else {
                dot.classList.remove('active');
                dot.style.display = 'block';
            }
        } else {
            dot.style.display = 'none';
        }
    });
}

/**
 * Previous testimonial
 */
function previousTestimonial() {
    const lastIndex = testimonials.length - 3;
    const newIndex = currentTestimonial === 0 ? lastIndex : currentTestimonial - 1;
    currentTestimonial = newIndex;
    showTestimonial(currentTestimonial);
}

/**
 * Next testimonial
 */
function nextTestimonial() {
    const lastIndex = testimonials.length - 3;
    const newIndex = currentTestimonial >= lastIndex ? 0 : currentTestimonial + 1;
    currentTestimonial = newIndex;
    showTestimonial(currentTestimonial);
}

/**
 * Start auto-play
 */
function startTestimonialAutoplay() {
    if (!autoplayStopped) {
        testimonialInterval = setInterval(nextTestimonial, 5000);
    }
}

/**
 * Stop auto-play
 */
function stopTestimonialAutoplay() {
    autoplayStopped = true;
    clearInterval(testimonialInterval);
}

// Export manual navigation functions
export function previousTestimonialManual() {
    stopTestimonialAutoplay();
    previousTestimonial();
}

export function nextTestimonialManual() {
    stopTestimonialAutoplay();
    nextTestimonial();
}

export function showTestimonialManual(index) {
    stopTestimonialAutoplay();
    showTestimonial(index);
}
