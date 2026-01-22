// ============================================
// UTILS MODULE
// Утилиты и вспомогательные функции
// ============================================

/**
 * Calculate experience based on start date
 * @param {number} startYear - Year when career started
 * @param {string} startDate - Full start date in format 'YYYY-MM-DD'
 * @returns {object} Object with formatted experience strings
 */
export function calculateExperience(startYear, startDate) {
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
export function getYearSuffix(years) {
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
export function getMonthSuffix(months) {
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
export function updateAllExperiences() {
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
