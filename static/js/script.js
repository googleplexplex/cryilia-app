// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scroll for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add scroll effect to header
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 2px 30px rgba(0, 0, 0, 0.15)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        }
    });

    // Animate elements on scroll
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

    // Observe elements for animation (excluding specialist cards to show buttons)
    const animateElements = document.querySelectorAll('.service-card, .feature, .contact-item');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Set current year in footer
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
});

// Scroll to sections
function scrollToSpecialists() {
    const targetSection = document.getElementById('specialists');
    if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function scrollToServices() {
    const targetSection = document.getElementById('services');
    if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function redirectToBooking() {
    window.open('https://dikidi.app/1806947?p=0.pi', '_blank');
}

function scrollToContacts() {
    const targetSection = document.getElementById('contacts');
    if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Phone number formatting
document.addEventListener('DOMContentLoaded', function() {
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 0) {
                if (value.length <= 1) {
                    value = `+7 (${value}`;
                } else if (value.length <= 4) {
                    value = `+7 (${value.slice(1)}`;
                } else if (value.length <= 7) {
                    value = `+7 (${value.slice(1, 4)}) ${value.slice(4)}`;
                } else if (value.length <= 9) {
                    value = `+7 (${value.slice(1, 4)}) ${value.slice(4, 7)}-${value.slice(7)}`;
                } else if (value.length <= 11) {
                    value = `+7 (${value.slice(1, 4)}) ${value.slice(4, 7)}-${value.slice(7, 9)}-${value.slice(9)}`;
                }
            }
            e.target.value = value;
        });
    });
});

// Ensure images are always visible
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        // Force images to be visible
        img.style.opacity = '1';
        img.style.transition = 'none';

        // Remove any existing transition
        img.style.removeProperty('transition');
    });
});

// Ensure specialist cards and all their content are ALWAYS visible
document.addEventListener('DOMContentLoaded', function() {
    // Force all specialist cards to be visible
    const specialistCards = document.querySelectorAll('.specialist-card');
    specialistCards.forEach(card => {
        card.style.opacity = '1';
        card.style.visibility = 'visible';
        card.style.transform = 'none';
    });

    // Force all specialist card content to be visible
    const specialistContent = document.querySelectorAll('.specialist-card__info, .specialist-card__name, .specialist-card__position, .specialist-card__experience, .specialist-card__link, .experience-item');
    specialistContent.forEach(element => {
        element.style.opacity = '1';
        element.style.visibility = 'visible';
        element.style.display = '';
        element.style.transform = 'none';
    });

    // Force experience item children (p and span) to be stable
    const experienceItemChildren = document.querySelectorAll('.experience-item p, .experience-item span');
    experienceItemChildren.forEach(element => {
        element.style.opacity = '1';
        element.style.visibility = 'visible';
        element.style.transform = 'none';
        element.style.transition = 'none';
    });
});

// Testimonials slider functionality
let currentTestimonial = 0;
const testimonials = [];

// Initialize testimonials
function initTestimonials() {
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    testimonialCards.forEach((card, index) => {
        testimonials.push(card);
    });

    // Show first testimonial and update dots
    showTestimonial(0);
}

// Show specific testimonial (show 3 at once)
function showTestimonial(index) {
    console.log('showTestimonial called with index:', index);
    console.log('Total testimonials:', testimonials.length);

    // Hide all testimonials and reset animation
    testimonials.forEach((testimonial, i) => {
        testimonial.classList.remove('active');
        // Reset to initial state for animation
        testimonial.style.opacity = '0';
        testimonial.style.transform = 'translateY(20px)';
    });

    // Show exactly 3 testimonials starting from index
    const activeCards = [];
    for (let i = 0; i < 3; i++) {
        let cardIndex;

        // Handle edge cases for proper circular navigation
        if (index + i >= testimonials.length) {
            // When we go past the end, wrap to beginning
            cardIndex = (index + i) % testimonials.length;
        } else {
            cardIndex = index + i;
        }

        console.log(`Position ${i}: showing card ${cardIndex} (calc: ${index} + ${i})`);
        if (testimonials[cardIndex]) {
            testimonials[cardIndex].classList.add('active');
            activeCards.push(cardIndex);
        }
    }

    // Trigger animation for all active cards simultaneously
    setTimeout(() => {
        activeCards.forEach(cardIndex => {
            testimonials[cardIndex].style.opacity = '1';
            testimonials[cardIndex].style.transform = 'translateY(0)';
        });
    }, 10);

    currentTestimonial = index;
    updateDots();
    console.log('Active cards:', activeCards);
    console.log('Current testimonial set to:', currentTestimonial);
}

// Manual testimonial navigation (stops autoplay)
function showTestimonialManual(index) {
    stopTestimonialAutoplay(); // Stop autoplay when user manually navigates
    showTestimonial(index);
}

// Update dots
function updateDots() {
    const dots = document.querySelectorAll('.testimonials__dot');
    const totalDots = dots.length;
    const totalTestimonials = testimonials.length;
    const maxValidIndex = totalTestimonials - 3; // Maximum starting index

    dots.forEach((dot, index) => {
        // Only show dots for valid starting positions (0 to maxValidIndex)
        if (index <= maxValidIndex) {
            if (index === currentTestimonial) {
                dot.classList.add('active');
                dot.style.display = 'block';
            } else {
                dot.classList.remove('active');
                dot.style.display = 'block';
            }
        } else {
            // Hide extra dots that don't have corresponding starting positions
            dot.style.display = 'none';
        }
    });
}

// Previous testimonial (move by 1)
function previousTestimonial() {
    // When going backwards from first (index 0), go to last valid starting position
    // Last valid starting position is testimonials.length - 3 (to show last 3 cards)
    const lastIndex = testimonials.length - 3;
    const newIndex = currentTestimonial === 0 ? lastIndex : currentTestimonial - 1;
    console.log('previousTestimonial: from', currentTestimonial, 'to', newIndex);
    currentTestimonial = newIndex;
    showTestimonial(currentTestimonial);
}

// Manual previous testimonial (stops autoplay)
function previousTestimonialManual() {
    stopTestimonialAutoplay(); // Stop autoplay when user manually navigates
    console.log('Manual previous navigation');
    previousTestimonial();
}

// Next testimonial (move by 1)
function nextTestimonial() {
    // When going forward from last valid starting position, go to first (index 0)
    // Last valid starting position is testimonials.length - 3
    const lastIndex = testimonials.length - 3;
    const newIndex = currentTestimonial >= lastIndex ? 0 : currentTestimonial + 1;
    console.log('nextTestimonial: from', currentTestimonial, 'to', newIndex, '(lastIndex:', lastIndex, ')');
    currentTestimonial = newIndex;
    showTestimonial(currentTestimonial);
}

// Manual next testimonial (stops autoplay)
function nextTestimonialManual() {
    stopTestimonialAutoplay(); // Stop autoplay when user manually navigates
    console.log('Manual next navigation');
    nextTestimonial();
}

// Auto-play testimonials
let testimonialInterval;
let autoplayStopped = false;
function startTestimonialAutoplay() {
    if (!autoplayStopped) {
        testimonialInterval = setInterval(nextTestimonial, 5000);
    }
}

function stopTestimonialAutoplay() {
    autoplayStopped = true;
    clearInterval(testimonialInterval);
}

// Initialize testimonials when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize testimonials
    setTimeout(() => {
        initTestimonials();

        // Start auto-play
        startTestimonialAutoplay();

        // Setup initial transition for testimonial cards
        const testimonialCards = document.querySelectorAll('.testimonial-card');
        testimonialCards.forEach(card => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        });
    }, 100);
});

// Service Modal functionality
const servicesData = {
    'group-therapy': {
        icon: 'fa-users',
        title: 'Групповая терапия',
        description: `
            <p>Групповая психотерапия — это эффективный формат работы, где участники получают поддержку от терапевта и друг от друга. В группе вы поймете, что не одни в своих переживаниях, и получите новые инструменты для решения проблем.</p>
        `,
        details: `
            <div class="service-modal__section">
                <h3><i class="fas fa-comments"></i> С чем можно обратиться:</h3>
                <ul>
                    <li>Трудности в общении и одиночество</li>
                    <li>Низкая самооценка и неуверенность в себе</li>
                    <li>Тревожность и страхи</li>
                    <li>Проблемы в отношениях</li>
                    <li>Последствия травмирующих ситуаций</li>
                    <li>Эмоциональное выгорание</li>
                </ul>
            </div>
            <div class="service-modal__section">
                <h3><i class="fas fa-heart"></i> Преимущества групповой терапии:</h3>
                <ul>
                    <li><strong>Поддержка группы</strong> — вы видите, что другие переживают похожие переживания</li>
                    <li><strong>Обратная связь</strong> — получаете разные точки зрения на вашу ситуацию</li>
                    <li><strong>Социальные навыки</strong> — тренируете общение в безопасной обстановке</li>
                    <li><strong>Доступная стоимость</strong> — групповые занятия дешевле индивидуальных</li>
                </ul>
            </div>
        `
    },
    'individual-therapy': {
        icon: 'fa-user',
        title: 'Индивидуальная терапия',
        description: `
            <p>Индивидуальная психотерапия — это конфиденциальная работа с психологом один на один. Это пространство, где вы можете открыто обсудить свои переживания, найти новые способы решения проблем и развить личностный потенциал.</p>
        `,
        details: `
            <div class="service-modal__section">
                <h3><i class="fas fa-comments"></i> С чем можно обратиться:</h3>
                <ul>
                    <li>Тревога и депрессия</li>
                    <li>Кризисные ситуации и потери</li>
                    <li>Проблемы в отношениях (с партнером, родителями, коллегами)</li>
                    <li>Низкая самооценка</li>
                    <li>Травмы детского и взрослого опыта</li>
                    <li>Созависимые отношения</li>
                    <li>Поиск смысла жизни и самореализация</li>
                </ul>
            </div>
            <div class="service-modal__section">
                <h3><i class="fas fa-lightbulb"></i> Что вы получите:</h3>
                <ul>
                    <li>Глубокое понимание себя и своих эмоций</li>
                    <li>Новые способы справляться со стрессом</li>
                    <li>Инструменты для улучшения отношений</li>
                    <li>Поддержку в сложных жизненных ситуациях</li>
                    <li>Ресурсы для достижения личных целей</li>
                </ul>
            </div>
        `
    },
    'teenagers': {
        icon: 'fa-user-graduate',
        title: 'Работа с подростками',
        description: `
            <p>Подростковый возраст — сложный период и для самих подростков, и для их родителей. Мы помогаем наладить отношения в семье, поддерживаем подростков в решении их проблем и помогаем родителям лучше понимать своих детей.</p>
        `,
        details: `
            <div class="service-modal__section">
                <h3><i class="fas fa-comments"></i> С чем можно обратиться:</h3>
                <ul>
                    <li>Конфликты с родителями и сверстниками</li>
                    <li>Проблемы с самооценкой и неуверенность в себе</li>
                    <li>Трудности с учебой и мотивацией</li>
                    <li>Агрессия, замкнутость, "бунт"</li>
                    <li>Первый роман, сложные отношения</li>
                    <li>Сомнения в выборе будущего</li>
                </ul>
            </div>
            <div class="service-modal__section">
                <h3><i class="fas fa-users"></i> Форматы работы:</h3>
                <ul>
                    <li><strong>Индивидуальные консультации</strong> — с подростком</li>
                    <li><strong>Консультации для родителей</strong> — помощь в воспитании</li>
                    <li><strong>Семейная терапия</strong> — налаживание отношений в семье</li>
                </ul>
            </div>
        `
    },
    'psychiatry': {
        icon: 'fa-brain',
        title: 'Психиатрическая помощь',
        description: `
            <p>Консультация психиатра — это медицинская помощь при психических расстройствах. Наш врач проведет диагностику, поставит точный диагноз и подберет эффективное лечение.</p>
        `,
        details: `
            <div class="service-modal__section">
                <h3><i class="fas fa-question-circle"></i> Вопросы, с которыми можно обратиться:</h3>
                <ul>
                    <li>Депрессивные состояния, потеря интереса к жизни</li>
                    <li>Тревога, панические атаки, фобии</li>
                    <li>Расстройства сна (бессонница, nightmares)</li>
                    <li>Навязчивые мысли и действия</li>
                    <li>Психосоматические симптомы</li>
                    <li>Резкие перепады настроения</li>
                    <li>Проблемы с памятью и вниманием</li>
                </ul>
            </div>
            <div class="service-modal__section">
                <h3><i class="fas fa-stethoscope"></i> Что включает прием:</h3>
                <ul>
                    <li><strong>Диагностика</strong> — клиническое интервью, оценка состояния</li>
                    <li><strong>Постановка диагноза</strong> — согласно МКБ-10</li>
                    <li><strong>Лечение</strong> — медикаментозная терапия, психотерапия</li>
                    <li><strong>Наблюдение</strong> — контроль динамики состояния</li>
                </ul>
            </div>
        `
    },
    'family': {
        icon: 'fa-home',
        title: 'Семейное консультирование',
        description: `
            <p>Семейная терапия помогает участникам семьи услышать и понять друг друга, разрешить конфликты и наладить теплые отношения. Мы работаем со всеми типами семей и помогаем найти конструктивные решения.</p>
        `,
        details: `
            <div class="service-modal__section">
                <h3><i class="fas fa-question-circle"></i> Вопросы, с которыми можно обратиться:</h3>
                <ul>
                    <li>Постоянные конфликты и ссоры в семье</li>
                    <li>Проблемы в общении между супругами</li>
                    <li>Детско-родительские отношения</li>
                    <li>Кризисные ситуации (измена, развод, потеря)</li>
                    <li>Проблемы с воспитанием детей</li>
                    <li>Сложности в отношениях с родственителями</li>
                    <li>Адаптация к изменениям (рождение ребенка, переезд)</li>
                </ul>
            </div>
            <div class="service-modal__section">
                <h3><i class="fas fa-heart"></i> Цели семейной терапии:</h3>
                <ul>
                    <li>Улучшение понимания между участниками семьи</li>
                    <li>Обучение конструктивному общению</li>
                    <li>Разрешение застарелых конфликтов</li>
                    <li>Поддержка в сложные периоды</li>
                </ul>
            </div>
        `
    },
    'complex': {
        icon: 'fa-user-md',
        title: 'Комплексная консультация',
        description: `
            <p>Совместный прием психолога и психиатра дает наиболее полную картину вашего состояния и позволяет разработать комплексную программу помощи, сочетающую медикаментозное лечение и психотерапию.</p>
        `,
        details: `
            <div class="service-modal__section">
                <h3><i class="fas fa-question-circle"></i> Вопросы, с которыми можно обратиться:</h3>
                <ul>
                    <li>Неясность диагноза или сложные случаи</li>
                    <li>Неэффективность предыдущего лечения</li>
                    <li>Потребность в комплексной оценке состояния</li>
                    <li>Сочетание психических и психологических проблем</li>
                    <li>Подбор комплексной схемы лечения</li>
                </ul>
            </div>
            <div class="service-modal__section">
                <h3><i class="fas fa-users"></i> Преимущества комплексного приема:</h3>
                <ul>
                    <li>Двое специалистов оценивают ситуацию с разных сторон</li>
                    <li>Глубокая диагностика и точный диагноз</li>
                    <li>Комплексный план лечения (медикаменты + психотерапия)</li>
                    <li>Согласованная работа специалистов</li>
                </ul>
            </div>
        `
    },
    'home-visit': {
        icon: 'fa-car',
        title: 'Выезд психиатра на дом',
        description: `
            <p>Если вам трудно посетить клинику, мы готовы приехать к вам. Психиатр проведет консультацию в домашних условиях в комфортной для вас обстановке.</p>
        `,
        details: `
            <div class="service-modal__section">
                <h3><i class="fas fa-question-circle"></i> Вопросы, с которыми можно обратиться:</h3>
                <ul>
                    <li>Любые психические расстройства и состояния</li>
                    <li>Депрессия и тревожные расстройства</li>
                    <li>Психосоматические симптомы</li>
                    <li>Расстройства сна и аппетита</li>
                    <li>Навязчивые состояния</li>
                </ul>
            </div>
            <div class="service-modal__section">
                <h3><i class="fas fa-info-circle"></i> Условия:</h3>
                <ul>
                    <li><strong>Выезд по Туле</strong> — в удобное для вас время</li>
                    <li><strong>Продолжительность</strong> — 60 минут</li>
                    <li><strong>Кому подходит</strong> — людям с ограниченной подвижностью, сильной тревогой, пожилым</li>
                    <li><strong>Стоимость</strong> — включает работу специалиста и дорогу</li>
                </ul>
            </div>
        `
    }
};

function openServiceModal(serviceKey) {
    const modal = document.getElementById('serviceModal');
    const service = servicesData[serviceKey];

    if (!service) return;

    // Update modal content
    document.getElementById('modalIcon').innerHTML = `<i class="fas ${service.icon}"></i>`;
    document.getElementById('modalTitle').textContent = service.title;
    document.getElementById('modalDescription').innerHTML = service.description;
    document.getElementById('modalDetails').innerHTML = service.details;

    // Show modal with animation
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('service-modal--active');
    }, 10);

    // Prevent body scroll (simple approach without position: fixed)
    document.body.style.overflow = 'hidden';
}

function closeServiceModal() {
    const modal = document.getElementById('serviceModal');

    modal.classList.remove('service-modal--active');

    setTimeout(() => {
        modal.style.display = 'none';
        // Restore body scroll
        document.body.style.overflow = '';
    }, 300);
}

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeServiceModal();
    }
});

// ============================================
// EXPERIENCE CALCULATOR
// ============================================

/**
 * Calculate experience based on start date
 * @param {number} startYear - Year when career started
 * @param {string} startDate - Full start date in format 'YYYY-MM-DD'
 * @returns {object} Object with formatted experience strings
 */
function calculateExperience(startYear, startDate) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const start = new Date(startDate);

    // Calculate total experience in years
    const totalYears = currentYear - startYear;

    // Calculate clinic experience
    const clinicStart = new Date(startDate);
    const clinicYears = now.getFullYear() - clinicStart.getFullYear();
    const clinicMonths = now.getMonth() - clinicStart.getMonth();

    let clinicExperienceText = '';

    if (clinicYears < 1) {
        if (clinicMonths <= 0) {
            clinicExperienceText = 'менее месяца';
        } else {
            const months = clinicMonths + (clinicYears < 0 ? 0 : 12);
            clinicExperienceText = months + ' ' + getMonthSuffix(months);
        }
    } else {
        clinicExperienceText = clinicYears + ' ' + getYearSuffix(clinicYears);
    }

    return {
        total: totalYears + ' ' + getYearSuffix(totalYears),
        clinic: clinicExperienceText
    };
}

/**
 * Get correct suffix for years in Russian
 * @param {number} years - Number of years
 * @returns {string} Correct suffix
 */
function getYearSuffix(years) {
    const lastTwo = years % 100;
    const lastOne = years % 10;

    if (lastTwo >= 11 && lastTwo <= 19) {
        return 'лет';
    }

    if (lastOne === 1) {
        return 'год';
    } else if (lastOne >= 2 && lastOne <= 4) {
        return 'года';
    } else {
        return 'лет';
    }
}

/**
 * Get correct suffix for months in Russian
 * @param {number} months - Number of months
 * @returns {string} Correct suffix
 */
function getMonthSuffix(months) {
    const lastOne = months % 10;

    if (months >= 11 && months <= 19) {
        return 'месяцев';
    }

    if (lastOne === 1) {
        return 'месяц';
    } else if (lastOne >= 2 && lastOne <= 4) {
        return 'месяца';
    } else {
        return 'месяцев';
    }
}

/**
 * Update all experience displays on the page
 */
function updateAllExperiences() {
    // Find all specialist cards with data attributes
    const specialistCards = document.querySelectorAll('[data-career-start][data-clinic-start]');

    specialistCards.forEach(card => {
        const careerStart = parseInt(card.getAttribute('data-career-start'));
        const clinicStart = card.getAttribute('data-clinic-start');

        const experience = calculateExperience(careerStart, clinicStart);

        // Update experience displays
        const totalExpElements = card.querySelectorAll('.experience-total');
        const clinicExpElements = card.querySelectorAll('.experience-clinic');

        totalExpElements.forEach(el => {
            el.textContent = experience.total;
        });

        clinicExpElements.forEach(el => {
            el.textContent = experience.clinic;
        });
    });
}

// Initialize experience calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    updateAllExperiences();

    // Update every minute to keep experiences accurate
    setInterval(updateAllExperiences, 60000);
});

// Owl Carousel Gallery functionality
$(document).ready(function() {
    let $owl = $('.carousel-2');
    let autoplayEnabled = true;
    let autoplayInterval;

    $owl.children().each(function(index) {
        $(this).attr('data-position', index);
    });

    // Carousel navigation works via arrow buttons and touch gestures only

    $owl.owlCarousel({
        loop: true,
        center: true,
        stagePadding: 70,
        nav: true,
        dots: false,
        navText: ['&lsaquo;', '&rsaquo;'],
        responsive: {
            0: { items: 1 },
            600: { items: 2 },
            992: { items: 3 },
            1200: { items: 4 },
            1600: { items: 5 }
        }
    });

    // Функции для управления автолистанием
    function startGalleryAutoplay() {
        if (autoplayEnabled) {
            autoplayInterval = setInterval(function() {
                $owl.trigger('next.owl.carousel');
            }, 5000); // Каждые 5 секунд
        }
    }

    function stopGalleryAutoplay() {
        autoplayEnabled = false;
        clearInterval(autoplayInterval);
    }

    // Останавливаем автолистание при наведении мыши на кнопки навигации
    $('.owl-prev, .owl-next').on('click', function() {
        stopGalleryAutoplay();
    });

    // Останавливаем автолистание при наведении мыши на карусель
    $owl.on('mouseenter', function() {
        clearInterval(autoplayInterval);
    });

    // Возобновляем автолистание когда мышь уходит с карусели
    $owl.on('mouseleave', function() {
        if (autoplayEnabled) {
            startGalleryAutoplay();
        }
    });

    // Запускаем автолистание
    startGalleryAutoplay();

    // Add gallery to observer for animations
    const gallerySection = document.querySelector('.gallery');
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    if (gallerySection) {
        gallerySection.style.opacity = '0';
        gallerySection.style.transform = 'translateY(30px)';
        gallerySection.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(gallerySection);
    }
});
// ============================================
// AJAX API MODULE
// Динамическая подгрузка данных
// ============================================

/**
 * AJAX API Client for fetching specialist data
 */
const API = {
    baseURL: window.location.origin,

    /**
     * Fetch all specialists
     * @returns {Promise<Array>} List of specialists
     */
    async getSpecialists() {
        try {
            const response = await fetch(`${this.baseURL}/api/specialists`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            if (result.success) {
                return result.data;
            } else {
                throw new Error(result.error || 'Failed to fetch specialists');
            }
        } catch (error) {
            console.error('Error fetching specialists:', error);
            throw error;
        }
    },

    /**
     * Fetch specialist by ID
     * @param {string} specialistId - Specialist ID
     * @returns {Promise<Object>} Specialist data
     */
    async getSpecialist(specialistId) {
        try {
            const response = await fetch(`${this.baseURL}/api/specialist/${specialistId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            if (result.success) {
                return result.data;
            } else {
                throw new Error(result.error || 'Failed to fetch specialist');
            }
        } catch (error) {
            console.error('Error fetching specialist:', error);
            throw error;
        }
    }
};

// Example usage (commented out - can be enabled for dynamic loading):
/*
// Dynamically load specialist cards
async function loadSpecialistCards() {
    try {
        const specialists = await API.getSpecialists();
        const container = document.querySelector('.specialists__grid');
        if (container && specialists.length > 0) {
            // Clear loading indicator
            container.innerHTML = '';
            // Render specialist cards
            specialists.forEach(specialist => {
                const card = createSpecialistCard(specialist);
                container.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Failed to load specialists:', error);
        // Fallback: reload page or show error message
    }
}
*/
