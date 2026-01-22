// ============================================
// SERVICES MODAL MODULE
// Модальные окна услуг
// ============================================

const servicesData = {
    consultation: {
        icon: 'fa-brain',
        title: 'Консультации психиатра',
        description: `
            <p>Первичная консультация психиатра — важный шаг на пути к психологическому здоровью. Наш врач проведет полную диагностику вашего состояния, соберет детальный анамнез и поставит точный диагноз.</p>
        `,
        details: `
            <div class="service-modal__section">
                <h3><i class="fas fa-stethoscope"></i> Что включает консультация:</h3>
                <ul>
                    <li><strong>Первичный прием (60 минут)</strong> — полное обследование, сбор анамнеза, постановка предварительного диагноза</li>
                    <li><strong>Диагностика</strong> — оценка психического состояния, выявление симптомов и расстройств</li>
                    <li><strong>План лечения</strong> — индивидуальная схема терапии с учетом ваших особенностей</li>
                    <li><strong>Медикаментозная терапия</strong> — подбор современных препаратов с минимальными побочными эффектами</li>
                </ul>
            </div>
            <div class="service-modal__section">
                <h3><i class="fas fa-user-md"></i> Показания для консультации:</h3>
                <ul>
                    <li>Депрессивные состояния и апатия</li>
                    <li>Тревожные расстройства и панические атаки</li>
                    <li>Расстройства сна</li>
                    <li>Навязчивые мысли и действия</li>
                    <li>Психосоматические расстройства</li>
                    <li>Кризисные ситуации и стресс</li>
                </ul>
            </div>
        `
    },
    psychotherapy: {
        icon: 'fa-heart',
        title: 'Психотерапия',
        description: `
            <p>Психотерапия — это метод лечения психологических проблем через беседу и специализированные техники. Наши психологи и психотерапевты помогут вам разобраться в себе, преодолеть трудности и найти пути к гармоничной жизни.</p>
        `,
        details: `
            <div class="service-modal__section">
                <h3><i class="fas fa-hands-helping"></i> Виды психотерапии:</h3>
                <ul>
                    <li><strong>Индивидуальная психотерапия</strong> — личная работа с психологом над вашими проблемами</li>
                    <li><strong>Семейная психотерапия</strong> — решение конфликтов в семье, улучшение отношений</li>
                    <li><strong>Когнитивно-поведенческая терапия</strong> — изменение негативных мыслительных паттернов</li>
                    <li><strong>Транзактный анализ</strong> — анализ и изменение сценариев поведения</li>
                    <li><strong>Гештальт-терапия</strong> — осознание и проработка незавершенных ситуаций</li>
                </ul>
            </div>
            <div class="service-modal__section">
                <h3><i class="fas fa-lightbulb"></i> Что мы лечим:</h3>
                <ul>
                    <li>Депрессия и тревожность</li>
                    <li>Проблемы в отношениях</li>
                    <li>Низкая самооценка</li>
                    <li>Последствия травм</li>
                    <li>Созависимость</li>
                    <li>Проблемы с сексуальностью</li>
                </ul>
            </div>
        `
    },
    child: {
        icon: 'fa-child',
        title: 'Детская психиатрия и психология',
        description: `
            <p>Мы специализируемся на помощи детям и подросткам. Наши специалисты с бережностью и профессионализмом подходят к работе с юными пациентами, создавая комфортную и безопасную атмосферу.</p>
        `,
        details: `
            <div class="service-modal__section">
                <h3><i class="fas fa-baby-carriage"></i> Услуги для детей:</h3>
                <ul>
                    <li><strong>Диагностика</strong> — выявление отклонений в развитии, оценка психологического состояния</li>
                    <li><strong>Коррекция поведения</strong> — работа с гиперактивностью, агрессией, упрямством</li>
                    <li><strong>Детская психотерапия</strong> — игровые методики, арт-терапия, сказкотерапия</li>
                    <li><strong>Помощь подросткам</strong> — поддержка в переходном возрасте, решение проблем самоопределения</li>
                    <li><strong>Работа с родителями</strong> — консультации по воспитанию и детско-родительским отношениям</li>
                </ul>
            </div>
            <div class="service-modal__section">
                <h3><i class="fas fa-exclamation-triangle"></i> Когда нужна помощь:</h3>
                <ul>
                    <li>Проблемы в школе (низкая успеваемость, конфликты)</li>
                    <li>Эмоциональные трудности (страхи, тревожность)</li>
                    <li>Поведенческие проблемы (агрессия, замкнутость)</li>
                    <li>Трудности в общении со сверстниками</li>
                    <li>Семейные конфликты</li>
                    <li>Подготовка к школе</li>
                </ul>
            </div>
        `
    },
    home: {
        icon: 'fa-home',
        title: 'Выезд на дом',
        description: `
            <p>Понимаем, что не всем комфортно посещать клинику. Мы предлагаем услуги выезда квалифицированного специалиста на дом для проведения консультации в комфортной для вас обстановке.</p>
        `,
        details: `
            <div class="service-modal__section">
                <h3><i class="fas fa-car"></i> Условия выезда:</h3>
                <ul>
                    <li><strong>По Туле</strong> — выезд специалиста в удобное для вас время</li>
                    <li><strong>Продолжительность</strong> — консультация 60 минут</li>
                    <li><strong>Специалисты</strong> — психиатр или психолог на ваш выбор</li>
                    <li><strong>Оборудование</strong> — все необходимое для проведения консультации</li>
                </ul>
            </div>
            <div class="service-modal__section">
                <h3><i class="fas fa-users"></i> Кому подходит услуга:</h3>
                <ul>
                    <li>Людям с ограниченной подвижностью</li>
                    <li>Пациентам с сильной тревожностью</li>
                    <li>Мамам с маленькими детьми</li>
                    <li>Пожилым людям</li>
                    <li>Тем, кто ценит комфорт и приватность</li>
                </ul>
            </div>
            <div class="service-modal__section">
                <h3><i class="fas fa-info-circle"></i> Дополнительная информация:</h3>
                <ul>
                    <li>Предварительная запись по телефону</li>
                    <li>Оплата услуги включает работу специалиста и дорогу</li>
                    <li>Возможна первичная консультация онлайн для оценки ситуации</li>
                </ul>
            </div>
        `
    }
};

/**
 * Open service modal
 */
export function openServiceModal(serviceKey) {
    const modal = document.getElementById('serviceModal');
    const service = servicesData[serviceKey];

    if (!service || !modal) return;

    // Update modal content
    const modalIcon = document.getElementById('modalIcon');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const modalDetails = document.getElementById('modalDetails');

    if (modalIcon) modalIcon.innerHTML = `<i class="fas ${service.icon}"></i>`;
    if (modalTitle) modalTitle.textContent = service.title;
    if (modalDescription) modalDescription.innerHTML = service.description;
    if (modalDetails) modalDetails.innerHTML = service.details;

    // Show modal with animation
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('service-modal--active');
    }, 10);

    // Prevent body scroll
    const scrollY = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = `-${scrollY}px`;
}

/**
 * Close service modal
 */
export function closeServiceModal() {
    const modal = document.getElementById('serviceModal');
    if (!modal) return;

    modal.classList.remove('service-modal--active');

    setTimeout(() => {
        modal.style.display = 'none';

        // Restore scroll position
        const scrollY = document.body.style.top;
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }, 300);
}

/**
 * Initialize service modal (Escape key to close)
 */
export function initServiceModal() {
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeServiceModal();
        }
    });

    // Close modal when clicking outside
    const modal = document.getElementById('serviceModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal || e.target.classList.contains('service-modal__overlay')) {
                closeServiceModal();
            }
        });
    }
}
