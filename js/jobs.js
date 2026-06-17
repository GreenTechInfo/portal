function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ============================================================
// ПОЛНЫЕ ДАННЫЕ О РАБОТАХ
// ============================================================
const JOBS_DATA = {
    transport: [
        {
            id: 'mechanic',
            name: 'Механик',
            icon: 'fa-wrench',
            shortDesc: 'Ремонт и обслуживание автомобилей игроков',
            fullDesc: 'Работа механика — одна из самых востребованных профессий на сервере. Вы будете ремонтировать автомобили других игроков, менять колёса, проводить техническое обслуживание. Работа требует внимательности и знания устройства автомобилей.',
            requirements: 'Водительские права категории B',
            commands: [
                { cmd: '/work', desc: 'Начать/закончить смену' },
                { cmd: '/repair [ID]', desc: 'Починить автомобиль игрока' },
                { cmd: '/change_wheel [ID]', desc: 'Заменить колесо' }
            ],
            salary: 'от 50 000 ₽ за смену',
            features: [
                'Ремонт двигателя, коробки передач и других узлов',
                'Замена колёс',
                'Техническое обслуживание автомобилей',
                'Возможность открыть свою СТО'
            ],
            tip: 'Для качественной работы всегда имейте при себе набор инструментов. Не забывайте отыгрывать процесс ремонта — это повышает уровень RP.'
        },
        {
            id: 'cargo',
            name: 'Грузоперевозки',
            icon: 'fa-boxes',
            shortDesc: 'Доставка грузов между городами на грузовом транспорте',
            fullDesc: 'Грузоперевозки — одна из самых высокооплачиваемых работ на сервере. Вы будете перевозить различные грузы между городами на грузовых автомобилях. Работа требует аккуратности, знания маршрутов и умения управлять крупногабаритным транспортом.',
            requirements: 'Водительские права категории C, грузовой автомобиль',
            commands: [
                { cmd: '/work', desc: 'Начать/закончить смену' },
                { cmd: '/load_cargo', desc: 'Загрузить товар' },
                { cmd: '/unload_cargo', desc: 'Выгрузить товар' },
                { cmd: '/route', desc: 'Показать маршрут доставки' }
            ],
            salary: 'от 80 000 ₽ за рейс',
            features: [
                'Перевозка различных типов грузов',
                'Дальние и ближние маршруты',
                'Работа на личном или служебном транспорте',
                'Возможность создания логистической компании'
            ],
            tip: 'Всегда проверяйте целостность груза перед отправкой. Соблюдайте ПДД — штрафы могут съесть всю прибыль.'
        },
        {
            id: 'taxi',
            name: 'Таксист',
            icon: 'fa-taxi',
            shortDesc: 'Перевозка игроков по городу и за его пределы',
            fullDesc: 'Работа таксиста — отличный способ заработать и познакомиться с другими игроками. Вы будете перевозить пассажиров по городу и за его пределы. Работа требует хорошего знания города и вежливого общения с клиентами.',
            requirements: 'Водительские права категории B, личный или служебный автомобиль',
            commands: [
                { cmd: '/work', desc: 'Начать/закончить смену' },
                { cmd: '/taxi [ID]', desc: 'Принять заказ такси' },
                { cmd: '/call 065', desc: 'Вызвать такси (для пассажиров)' }
            ],
            salary: 'от 30 000 ₽ за смену + чаевые',
            features: [
                'Работа на личном или служебном автомобиле',
                'Возможность получать чаевые от пассажиров',
                'Гибкий график работы',
                'Знакомство с новыми игроками'
            ],
            tip: 'Будьте вежливы с пассажирами — хорошие чаевые и постоянные клиенты зависят от вашего общения.'
        },
        {
            id: 'bus',
            name: 'Водитель автобуса',
            icon: 'fa-bus',
            shortDesc: 'Перевозка пассажиров по маршрутам на служебном автобусе',
            fullDesc: 'Работа водителя автобуса — отличный способ заработать и познакомиться с другими игроками. Вы будете перевозить пассажиров по городским и междугородним маршрутам. Работа требует пунктуальности и знания маршрутов.',
            requirements: 'Водительские права категории D',
            commands: [
                { cmd: '/work', desc: 'Начать/закончить смену' },
                { cmd: '/route', desc: 'Показать маршрут' },
                { cmd: '/open_doors', desc: 'Открыть/закрыть двери' }
            ],
            salary: 'от 40 000 ₽ за смену',
            features: [
                'Работа на служебном автобусе',
                'Городские и междугородние маршруты',
                'Фиксированный график работы',
                'Возможность работать в транспортной компании'
            ],
            tip: 'Соблюдайте расписание движения — опоздания влияют на репутацию. Всегда проверяйте пассажиров перед закрытием дверей.'
        },
        {
            id: 'loggers',
            name: 'Водитель лесовоза',
            icon: 'fa-tree',
            shortDesc: 'Перевозка леса и древесины на специальном транспорте',
            fullDesc: 'Работа водителя лесовоза связана с перевозкой леса и древесины. Вы будете работать на специальном транспорте, перевозить лес с лесоповала на пилораму и обратно. Работа требует аккуратности и знания маршрутов.',
            requirements: 'Водительские права категории C, лесовоз',
            commands: [
                { cmd: '/work', desc: 'Начать/закончить смену' },
                { cmd: '/load_logs', desc: 'Загрузить лес' },
                { cmd: '/unload_logs', desc: 'Выгрузить лес' }
            ],
            salary: 'от 60 000 ₽ за рейс',
            features: [
                'Перевозка леса и древесины',
                'Работа на специальном транспорте',
                'Взаимодействие с лесоповалом и пилорамой'
            ],
            tip: 'Проверяйте крепление груза перед каждой поездкой. Лес — опасный груз, требует осторожности.'
        },
        {
            id: 'tram',
            name: 'Водитель трамвая',
            icon: 'fa-subway',
            shortDesc: 'Управление трамваем по городским маршрутам',
            fullDesc: 'Работа водителя трамвая — одна из самых спокойных и размеренных работ на сервере. Вы будете управлять трамваем по городским маршрутам, перевозить пассажиров. Работа требует соблюдения графика и внимательности на дороге.',
            requirements: 'Водительские права категории D',
            commands: [
                { cmd: '/work', desc: 'Начать/закончить смену' },
                { cmd: '/route', desc: 'Показать маршрут' },
                { cmd: '/open_doors', desc: 'Открыть/закрыть двери' }
            ],
            salary: 'от 35 000 ₽ за смену',
            features: [
                'Работа на служебном трамвае',
                'Городские маршруты',
                'Спокойная и размеренная работа',
                'Фиксированный график'
            ],
            tip: 'Соблюдайте дистанцию и скоростной режим. Трамвай — это общественный транспорт, не забывайте о пассажирах.'
        },
        {
            id: 'fuel_truck',
            name: 'Водитель бензовоза',
            icon: 'fa-gas-pump',
            shortDesc: 'Доставка топлива на АЗС',
            fullDesc: 'Работа водителя бензовоза связана с доставкой топлива на автозаправочные станции. Вы будете перевозить опасный груз, поэтому требуется особая осторожность и внимание. Работа высокооплачиваемая, но опасная.',
            requirements: 'Водительские права категории C, бензовоз',
            commands: [
                { cmd: '/work', desc: 'Начать/закончить смену' },
                { cmd: '/load_fuel', desc: 'Загрузить топливо' },
                { cmd: '/unload_fuel', desc: 'Выгрузить топливо' },
                { cmd: '/route', desc: 'Показать маршрут' }
            ],
            salary: 'от 70 000 ₽ за рейс',
            features: [
                'Перевозка опасного груза',
                'Высокая оплата',
                'Сотрудничество с АЗС'
            ],
            tip: 'Никогда не курите и не используйте открытый огонь во время работы с топливом. Это может привести к фатальным последствиям.'
        },
        {
            id: 'delivery',
            name: 'Развозчик товара',
            icon: 'fa-shopping-cart',
            shortDesc: 'Развозка товаров по магазинам и торговым точкам',
            fullDesc: 'Работа развозчика товара — это доставка товаров из распределительных центров в магазины и торговые точки. Вы будете работать на фургоне, развозить различные товары. Работа требует хорошего знания города и пунктуальности.',
            requirements: 'Водительские права категории B, фургон',
            commands: [
                { cmd: '/work', desc: 'Начать/закончить смену' },
                { cmd: '/load_goods', desc: 'Загрузить товар' },
                { cmd: '/unload_goods', desc: 'Выгрузить товар' },
                { cmd: '/route', desc: 'Показать маршрут' }
            ],
            salary: 'от 45 000 ₽ за смену',
            features: [
                'Развозка товаров по магазинам',
                'Работа на фургоне',
                'Городские маршруты'
            ],
            tip: 'Следите за сохранностью товара. Аккуратно загружайте и выгружайте груз, чтобы не повредить его.'
        },
        {
            id: 'train_driver',
            name: 'Машинист',
            icon: 'fa-train',
            shortDesc: 'Управление поездом. Строгое соблюдение маршрута и дистанции.',
            fullDesc: 'Работа машиниста — одна из самых ответственных на сервере. Вы будете управлять поездом, перевозить пассажиров и грузы. Работа требует строгого соблюдения маршрута, дистанции и правил безопасности.',
            requirements: 'Водительские права категории D',
            commands: [
                { cmd: '/work', desc: 'Начать/закончить смену' },
                { cmd: '/route', desc: 'Показать маршрут' },
                { cmd: '/speed', desc: 'Установить скорость' }
            ],
            salary: 'от 55 000 ₽ за смену',
            features: [
                'Управление поездом',
                'Перевозка пассажиров и грузов',
                'Строгое соблюдение маршрута'
            ],
            tip: 'Никогда не превышайте скорость на поворотах. Соблюдайте дистанцию между составами.'
        }
    ],
    other: [
        {
            id: 'logging',
            name: 'Лесоповал',
            icon: 'fa-forest',
            shortDesc: 'Заготовка древесины в лесу. Требуется физическая выносливость.',
            fullDesc: 'Лесоповал — это тяжёлая физическая работа по заготовке древесины. Вы будете работать в лесу, валить деревья, распиливать их и готовить к вывозу. Работа требует хорошей физической подготовки и выносливости.',
            requirements: 'Отсутствуют',
            commands: [
                { cmd: '/work', desc: 'Начать/закончить смену' },
                { cmd: '/cut_tree', desc: 'Срубить дерево' },
                { cmd: '/saw_log', desc: 'Распилить бревно' }
            ],
            salary: 'от 40 000 ₽ за смену',
            features: [
                'Заготовка древесины',
                'Физическая работа на свежем воздухе',
                'Сотрудничество с пилорамой и лесовозами'
            ],
            tip: 'Используйте защитную экипировку. Будьте осторожны при работе с бензопилой.'
        },
        {
            id: 'miner',
            name: 'Шахтёр',
            icon: 'fa-hard-hat',
            shortDesc: 'Добыча полезных ископаемых в шахте. Высокооплачиваемая, но тяжёлая работа.',
            fullDesc: 'Работа шахтёра — одна из самых опасных и высокооплачиваемых на сервере. Вы будете работать в шахте, добывать полезные ископаемые: уголь, железную руду, золото и другие ресурсы. Работа требует выносливости и внимательности.',
            requirements: 'Отсутствуют',
            commands: [
                { cmd: '/work', desc: 'Начать/закончить смену' },
                { cmd: '/mine', desc: 'Начать добычу ресурсов' },
                { cmd: '/inventory', desc: 'Проверить добытые ресурсы' }
            ],
            salary: 'от 60 000 ₽ за смену',
            features: [
                'Добыча полезных ископаемых',
                'Высокая оплата',
                'Возможность продажи ресурсов на рынке'
            ],
            tip: 'Всегда проверяйте крепление свода шахты перед началом работы. Используйте защитную каску.'
        },
        {
            id: 'sawmill',
            name: 'Пилорама',
            icon: 'fa-industry',
            shortDesc: 'Переработка древесины на пилораме. Следующий этап после лесоповала.',
            fullDesc: 'Работа на пилораме — это переработка древесины, полученной с лесоповала. Вы будете работать на пилораме, распиливать брёвна на доски и другие пиломатериалы. Работа требует внимательности и умения обращаться с оборудованием.',
            requirements: 'Отсутствуют',
            commands: [
                { cmd: '/work', desc: 'Начать/закончить смену' },
                { cmd: '/process_logs', desc: 'Переработать брёвна' },
                { cmd: '/inventory', desc: 'Проверить готовую продукцию' }
            ],
            salary: 'от 35 000 ₽ за смену',
            features: [
                'Переработка древесины',
                'Производство пиломатериалов',
                'Сотрудничество с лесоповалом'
            ],
            tip: 'Следите за состоянием пильного оборудования. Вовремя меняйте изношенные детали.'
        }
    ],
    seasonal: [
        {
            id: 'snow_removal',
            name: 'Снегоуборщик',
            icon: 'fa-snowplow',
            shortDesc: 'Уборка снега с городских улиц. Сезонная работа (зима).',
            fullDesc: 'Работа снегоуборщика — это сезонная работа, доступная только в зимний период. Вы будете убирать снег с городских улиц и тротуаров. Работа требует наличия специального транспорта и аккуратности.',
            requirements: 'Водительские права категории B, снегоуборочная техника',
            commands: [
                { cmd: '/work', desc: 'Начать/закончить смену' },
                { cmd: '/clean', desc: 'Начать уборку снега' },
                { cmd: '/route', desc: 'Показать маршрут уборки' }
            ],
            salary: 'от 50 000 ₽ за смену',
            features: [
                'Уборка снега с улиц',
                'Сезонная работа (зима)',
                'Работа на специальной технике'
            ],
            tip: 'Будьте осторожны на дорогах — снег снижает сцепление колёс с дорогой. Убирайте снег аккуратно, чтобы не повредить автомобили и имущество.'
        }
    ]
};

// Функция для получения работы по ID
function getJobById(jobId) {
    for (const category of ['transport', 'other', 'seasonal']) {
        const found = JOBS_DATA[category].find(j => j.id === jobId);
        if (found) return found;
    }
    return null;
}

// ============================================================
// РЕНДЕРИНГ СПИСКА РАБОТ (главная страница)
// ============================================================
function renderJobsList(container) {
    // Рендерим карточки для транспорта
    const transportHtml = JOBS_DATA.transport.map(job => `
        <div class="card job-card" data-job-id="${job.id}" style="cursor: pointer;">
            <div class="card-icon"><i class="fas ${job.icon}"></i></div>
            <h3>${escapeHtml(job.name)}</h3>
            <p>${escapeHtml(job.shortDesc)}</p>
            <div style="margin-top: 12px; font-size: 0.8rem; color: var(--text-secondary);">
                <i class="fas fa-id-card"></i> ${escapeHtml(job.requirements)}
            </div>
        </div>
    `).join('');

    const otherHtml = JOBS_DATA.other.map(job => `
        <div class="card job-card" data-job-id="${job.id}" style="cursor: pointer;">
            <div class="card-icon"><i class="fas ${job.icon}"></i></div>
            <h3>${escapeHtml(job.name)}</h3>
            <p>${escapeHtml(job.shortDesc)}</p>
            <div style="margin-top: 12px; font-size: 0.8rem; color: var(--text-secondary);">
                <i class="fas fa-id-card"></i> ${escapeHtml(job.requirements)}
            </div>
        </div>
    `).join('');

    const seasonalHtml = JOBS_DATA.seasonal.map(job => `
        <div class="card job-card" data-job-id="${job.id}" style="cursor: pointer;">
            <div class="card-icon"><i class="fas ${job.icon}"></i></div>
            <h3>${escapeHtml(job.name)}</h3>
            <p>${escapeHtml(job.shortDesc)}</p>
            <div style="margin-top: 12px; font-size: 0.8rem; color: var(--text-secondary);">
                <i class="fas fa-id-card"></i> ${escapeHtml(job.requirements)}
            </div>
        </div>
    `).join('');

    container.innerHTML = `
        <h1 class="page-title">Работы на сервере</h1>
        <p class="page-subtitle">Все доступные профессии для заработка в GreenTech RolePlay</p>

        <!-- Работы на транспорте -->
        <div class="info-block">
            <h3><i class="fas fa-truck"></i> Работы на транспорте</h3>
            <div class="card-grid" id="transportJobsGrid">${transportHtml}</div>
        </div>

        <!-- Работы не на транспорте -->
        <div class="info-block">
            <h3><i class="fas fa-tools"></i> Работы не на транспорте</h3>
            <div class="card-grid" id="otherJobsGrid">${otherHtml}</div>
        </div>

        <!-- Сезонные работы -->
        <div class="info-block">
            <h3><i class="fas fa-snowflake"></i> Сезонные работы</h3>
            <div class="card-grid" id="seasonalJobsGrid">${seasonalHtml}</div>
        </div>

        <!-- Как устроиться на работу -->
        <div class="info-block">
            <h3>Как устроиться на работу?</h3>
            <ul class="info-list">
                <li>Откройте меню <strong>M</strong> (русская <strong>Ь</strong>).</li>
                <li>Выберите вкладку <strong>«Работа»</strong>.</li>
                <li>Выберите интересующую вас профессию и нажмите <strong>«Устроиться»</strong>.</li>
                <li>Для работы на транспорте — подойдите к нужному транспорту и сядьте в него.</li>
            </ul>
            <p><strong>📍 Центр занятости:</strong> <code>/gps → 1. Государственные учреждения → 2/3/4. Мои документы (МФЦ)</code></p>
        </div>
    `;

    // Обработчики клика по карточкам
    container.querySelectorAll('.job-card').forEach(card => {
        card.addEventListener('click', () => {
            const jobId = card.dataset.jobId;
            if (jobId) {
                updateURLForJob(jobId);
                renderJobDetail(container, jobId);
            }
        });
    });
}

// ============================================================
// РЕНДЕРИНГ ДЕТАЛЬНОЙ СТРАНИЦЫ РАБОТЫ
// ============================================================
function renderJobDetail(container, jobId) {
    const job = getJobById(jobId);
    if (!job) {
        container.innerHTML = `<p>Работа не найдена</p>`;
        return;
    }

    const commandsHtml = job.commands.map(cmd => `
        <tr><td><code>${escapeHtml(cmd.cmd)}</code></td><td>${escapeHtml(cmd.desc)}</td></tr>
    `).join('');

    const featuresHtml = job.features.map(f => `<li>${escapeHtml(f)}</li>`).join('');

    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
            <button class="back-button" id="backToJobsBtn" style="display: inline-flex; align-items: center; gap: 8px; background: rgba(139, 148, 158, 0.15); border: 1px solid var(--border); color: var(--text-secondary); padding: 10px 20px; border-radius: 30px; cursor: pointer; font-size: 0.9rem; font-weight: 500; transition: all 0.2s ease;">
                <i class="fas fa-arrow-left"></i> Назад к списку работ
            </button>
        </div>

        <div class="info-block">
            <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 20px; flex-wrap: wrap;">
                <i class="fas ${job.icon}" style="font-size: 48px; color: var(--accent);"></i>
                <div>
                    <h1 style="margin: 0; color: #fff;">${escapeHtml(job.name)}</h1>
                    <p style="margin: 4px 0 0; color: var(--text-secondary);">${escapeHtml(job.shortDesc)}</p>
                </div>
            </div>

            <h3>Описание работы</h3>
            <p>${escapeHtml(job.fullDesc)}</p>

            <h3 style="margin-top: 24px;">Требования</h3>
            <ul class="info-list">
                <li>${escapeHtml(job.requirements)}</li>
            </ul>

            <h3 style="margin-top: 24px;">Команды</h3>
            <div style="overflow-x: auto;">
                <table class="info-table">
                    <thead><tr><th>Команда</th><th>Описание</th></tr></thead>
                    <tbody>${commandsHtml}</tbody>
                </table>
            </div>

            <h3 style="margin-top: 24px;">Зарплата</h3>
            <p><strong>${escapeHtml(job.salary)}</strong></p>

            <h3 style="margin-top: 24px;">Особенности работы</h3>
            <ul class="info-list">${featuresHtml}</ul>

            <div style="margin-top: 24px; background: rgba(46, 164, 79, 0.1); border-left: 3px solid var(--accent); padding: 12px 16px; border-radius: 8px;">
                <i class="fas fa-lightbulb" style="color: var(--accent); margin-right: 8px;"></i>
                <strong style="color: var(--accent);">Совет:</strong>
                <p style="margin-top: 8px; font-size: 0.85rem; color: var(--text-secondary);">${escapeHtml(job.tip)}</p>
            </div>
        </div>
    `;

    // Обработчик кнопки "Назад"
    const backBtn = document.getElementById('backToJobsBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            updateURLForJob(null);
            renderJobsList(container);
        });
    }
}


// ============================================================
// РАБОТА С URL ХЕШАМИ
// ============================================================
function getJobIdFromURL() {
    const hash = window.location.hash.substring(1);
    if (hash && hash.startsWith('job-')) {
        return hash.replace('job-', '');
    }
    return null;
}

function updateURLForJob(jobId) {
    if (jobId) {
        window.location.hash = `job-${jobId}`;
    } else {
        window.location.hash = '';
    }
}

// ============================================================
// ОБРАБОТЧИК ИЗМЕНЕНИЯ ХЕША
// ============================================================
function initHashChangeListener(container) {
    window.addEventListener('hashchange', () => {
        const jobId = getJobIdFromURL();
        if (jobId) {
            const job = getJobById(jobId);
            if (job) {
                renderJobDetail(container, jobId);
                return;
            }
        }
        // Если хеш невалидный или пустой — показываем список
        renderJobsList(container);
    });
}

// ============================================================
// ЗАПУСК
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('jobsDynamicContent');
    if (!container) return;

    const jobIdFromURL = getJobIdFromURL();
    if (jobIdFromURL) {
        const job = getJobById(jobIdFromURL);
        if (job) {
            renderJobDetail(container, jobIdFromURL);
            initHashChangeListener(container);
            return;
        }
        // Если работа не найдена — чистим хеш
        window.location.hash = '';
    }

    renderJobsList(container);
    initHashChangeListener(container);
});