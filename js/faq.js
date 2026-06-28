function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

const FAQ_DATA = [
    {
        category: "Управление автомобилем",
        questions: [
            {
                q: "Как завести двигатель?",
                a: "Вставьте ключ (клавиша CTRL) и нажмите клавишу"
            },
            {
                q: "Как включить фары? Открыть капот/багажник?",
                a: "Нажмите клавишу Y"
            },
            {
                q: "Как включить поворотники?",
                a: "Используйте клавиши NUM 4 (левый), NUM 6 (правый). Аварийная сигнализация - NUM 5"
            },
            {
                q: "Как настроить коробку передач?",
                a: "Введите /kpp. Информация по механической КПП - /kpp 1, по автоматической - /kpp 2, по настройке клавиш - /kpp 3"
            },
            {
                q: "Как открыть инвентарь?",
                a: "Нажмите клавишу I (русская Ш) или введите команду /inv. Закрыть - кнопка 'Отмена' или ESC"
            }
        ]
    },
    {
        category: "Призыв / Повестки / Армия",
        questions: [
            {
                q: "Когда и где проводится призыв?",
                a: "Призыв проводится с 17:00 часов по субботам в военкомате пгт. Батырево. Найти военкомат - /gps → 1 → 10 (Гос. учреждения - Военкомат)."
            },
            {
                q: "Как получить военный билет?",
                a: "Для получения военного билета нужно отслужить 2 недели и сдать экзамен."
            },
            {
                q: "Как показать повестку или военный билет?",
                a: "Используйте команды /povestka или /showbil"
            }
        ]
    },
    {
        category: "ПДД и транспорт",
        questions: [
            {
                q: "Где сдать экзамен на права?",
                a: "Для сдачи экзаменов и получения водительского удостоверения нужно приехать в МРЭО ГАИ. Найти МРЭО - /gps → 1 → 11 (Гос. учреждения - МРЭО)."
            },
            {
                q: "Сколько стоят категории прав в автошколе?",
                a: "Категория А - 8000₽, Категория B - 12000₽, Категория C - 14000₽, Категория D - 14000₽"
            },
            {
                q: "Где находится автошкола?",
                a: "Автошкола находится в городе Арзамас, рядом с автовокзалом. /gps → 1 → 6 (Автошкола). Добраться можно на самокате, такси (/call 065) или автобусе."
            },
            {
                q: "Где получить номера на транспорт?",
                a: "Получить номера на транспорт можно в ГАИ (Нижегородск). /gps → 5 → 3. Получить номера может только основной владелец транспорта."
            },
            {
                q: "Где грузовики/автобусы?",
                a: "Скорее всего весь транспорт находится в работе, ожидайте свободного транспорта."
            },
            {
                q: "Как вызвать такси?",
                a: "Вызвать такси можно с помощью телефона - используйте /call 065"
            }
        ]
    },
    {
        category: "Автомобиль",
        questions: [
            {
                q: "Что делать, если пропало авто?",
                a: "Возможно произошел респавн - авто переместилось на место парковки, либо его эвакуировали на штрафстоянку. Найти авто: /cars → выбрать авто → 'Найти транспортное средство'. Авто отметится красным маркером на карте. Если его там нет - обратитесь к администрации (/report)."
            },
            {
                q: "Как продать авто?",
                a: "1) Сдать в утилизацию (пробег >500 км) - /gps → 4 → 2, цена 1/4 от стоимости. 2) Продать скупщику (бот) в пгт. Батырево напротив автовокзала, на рынке 'GreenShop' (нужно минимум 2 владельца по ПТС, отсутствие штрафов)."
            },
            {
                q: "Когда респавн автомобилей?",
                a: "Респавн автомобилей проводится в начале каждого часа Администрацией."
            },
            {
                q: "Нужен ли дом для покупки авто?",
                a: "Для приобретения автомобиля не требуется наличие дома или квартиры."
            },
            {
                q: "Что делать, если автомобиль полностью сломался (550 dl)?",
                a: "Отыграйте все необходимые действия, вызовите ЦОРДД (/call 3210) либо остановите игрока на автомобиле и отыграйте трос. После отыгровок вызовите администратора и попросите выдать 600 dl (/report)."
            }
        ]
    },
    {
        category: "Работа и фракции",
        questions: [
            {
                q: "Как устроиться на работу?",
                a: "Устроиться на работу можно в центре занятости (Мои Документы). /gps → 1 → 2/3/4 (в зависимости от города). Для устройства во фракцию - свяжитесь с лидером организации."
            },
            {
                q: "Какая работа самая прибыльная?",
                a: "Все работы сбалансированы по доходу. Доход зависит от опыта. Одни из самых прибыльных - дальнобойщик и водитель автобуса."
            },
            {
                q: "Есть ли свободные места на лидерство?",
                a: "Узнать, есть ли свободное место на лидерство, можно на форуме: forum.greentech-rp.com"
            },
            {
                q: "Что такое черный список фракций?",
                a: "Выдается лидерами организаций на срок 14 дней. Дата истечения указана в меню (клавиша М). После истечения срока Вы автоматически удаляетесь из списка."
            }
        ]
    },
    {
        category: "Скины и внешность",
        questions: [
            {
                q: "Где взять скин?",
                a: "Купить скин можно в магазине одежды (/gps → 9) либо через /donate. Список скинов за донат - /donate → Скин (одежда)."
            }
        ]
    },
    {
        category: "Администрация и наказания",
        questions: [
            {
                q: "Посадили просто так? Что делать?",
                a: "Если вы считаете, что вас наказали незаслуженно, обратитесь на форум с жалобой на администратора (forum.greentech-rp.com). Для подачи жалобы необходимо предоставить доказательства необоснованного наказания."
            },
            {
                q: "Как вызвать администратора?",
                a: "Используйте команду /report"
            }
        ]
    },
    {
        category: "Донат и VIP",
        questions: [
            {
                q: "Как посмотреть список донат-привилегий?",
                a: "Введите /donate. Посмотреть количество доната - /stats или в меню (клавиша М). Пополнить донат можно на сайте: greentech-rp.com/store"
            },
            {
                q: "Что дает VIP?",
                a: "Третий слот для автомобиля, дополнительный слот для бизнеса и дома. В тюнинг-ателье доступны рамки с названиями стран и цветная тонировка."
            },
            {
                q: "Что дает VIP+?",
                a: "Четвертый слот для автомобиля, x2 PayDay, x2 опыта на работах, вызов администрации без ограничений, оплата штрафов с 50% скидкой, возможность смены дисков на авто (один раз), возможность поставить рамки на авто со своим текстом."
            }
        ]
    },
    {
        category: "Безопасность аккаунта",
        questions: [
            {
                q: "Как обезопасить аккаунт?",
                a: "Установите код доступа - введите /code. При входе на сервер будет запрашиваться данный код. Запишите его - восстановлению не подлежит. Никому не передавайте коды доступа и пароли. Администрация не несет ответственность за сохранность Вашего аккаунта."
            }
        ]
    },
    {
        category: "Полезные команды",
        questions: [
            {
                q: "Кто сейчас онлайн?",
                a: "Используйте команду /online"
            },
            {
                q: "Как сменить время или погоду?",
                a: "Введите /wt, затем выберите нужный пункт - 'Выбрать время' или 'Выбрать погоду'"
            },
            {
                q: "Функции гаража",
                a: "/gamenu - меню гаража. /fixcar - ремонт авто с помощью инструментов в гараже."
            },
            {
                q: "Где взять канистру для заправки?",
                a: "Канистру можно приобрести на любой АЗС (/gps → 6). Чтобы заправиться - откройте инвентарь, выберите канистру, нажмите 'Использовать', находясь в авто или рядом. Перед использованием не забывайте отыгрывать действия."
            },
            {
                q: "Где получить медицинскую книжку?",
                a: "Медицинскую книжку можно получить в больнице города Арзамаса (/gps → 1 → 8). Показать - /showmedcard."
            },
            {
                q: "Я нашел баг. Куда обратиться?",
                a: "Обратитесь на форум: forum.greentech-rp.com → Технический раздел → Баги и недоработки."
            }
        ]
    }
];

function renderFAQPage(container) {
    const faqHtml = FAQ_DATA.map(category => {
        const questionsHtml = category.questions.map(item => `
            <div class="faq-item">
                <div class="faq-question">
                    <i class="fas fa-question-circle"></i>
                    <span>${escapeHtml(item.q)}</span>
                    <i class="fas fa-chevron-down faq-toggle-icon"></i>
                </div>
                <div class="faq-answer">
                    <i class="fas fa-reply-all"></i>
                    <p>${escapeHtml(item.a).replace(/\n/g, '<br>')}</p>
                </div>
            </div>
        `).join('');

        return `
            <div class="info-block faq-category">
                <h3><i class="${category.icon}"></i> ${escapeHtml(category.category)}</h3>
                <div class="faq-list">
                    ${questionsHtml}
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <h1 class="page-title">Часто задаваемые вопросы (FAQ)</h1>
        <p class="page-subtitle">Ответы на самые популярные вопросы игроков GreenTech RolePlay</p>
       
        
        <div id="faqCategoriesContainer">
            ${faqHtml}
        </div>
    `;

    addFAQStyles(container);

    attachFAQAccordionHandlers(container);

    attachFAQSearchHandler(container);
}

function addFAQStyles(container) {
    if (document.getElementById('faq-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'faq-styles';
    style.textContent = `
        .faq-category h3 {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 2px solid var(--accent);
        }
        
        .faq-category h3 i {
            color: var(--accent);
            font-size: 1.3rem;
        }
        
        .faq-item {
            border: 1px solid var(--border);
            border-radius: 10px;
            margin-bottom: 12px;
            overflow: hidden;
            transition: all 0.2s ease;
        }
        
        .faq-item:hover {
            border-color: var(--accent);
        }
        
        .faq-question {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px 20px;
            cursor: pointer;
            background: rgba(255, 255, 255, 0.02);
            transition: background 0.2s ease;
        }
        
        .faq-question:hover {
            background: rgba(46, 164, 79, 0.1);
        }
        
        .faq-question i:first-child {
            color: var(--accent);
            font-size: 1.1rem;
        }
        
        .faq-question span {
            flex: 1;
            font-weight: 500;
            font-size: 1rem;
        }
        
        .faq-toggle-icon {
            transition: transform 0.3s ease;
            color: var(--text-secondary);
        }
        
        .faq-item.open .faq-toggle-icon {
            transform: rotate(180deg);
        }
        
        .faq-answer {
            display: none;
            padding: 10px 10px 10px 10px;
            background: rgba(0, 0, 0, 0.2);
            border-top: 1px solid var(--border);
            animation: fadeIn 0.3s ease;
        }
        
        .faq-item.open .faq-answer {
            display: flex;
            gap: 14px;
        }
        
        .faq-answer i {
            color: var(--accent);
            font-size: 0.9rem;
            margin-top: 4px;
        }
        
        .faq-answer p {
            flex: 1;
            line-height: 1.6;
            color: var(--text);
            margin: 0;
        }
        
        .faq-search-block {
            margin-bottom: 24px;
        }
        
        .faq-search-block input {
            width: 100%;
        }
        
        .faq-no-results {
            text-align: center;
            padding: 40px;
            color: var(--text-secondary);
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @media (max-width: 600px) {
            .faq-question {
                padding: 12px 16px;
            }
            .faq-question span {
                font-size: 0.85rem;
            }
            .faq-answer {
                flex-direction: column;
                gap: 8px;
            }
            .faq-answer i {
                margin-top: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

function attachFAQAccordionHandlers(container) {
    const faqItems = container.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            const newQuestion = question.cloneNode(true);
            question.parentNode.replaceChild(newQuestion, question);
            
            newQuestion.addEventListener('click', () => {
                item.classList.toggle('open');
            });
        }
    });
}

function attachFAQSearchHandler(container) {
    const searchInput = container.querySelector('#faqSearchInput');
    if (!searchInput) return;

    const newSearchInput = searchInput.cloneNode(true);
    searchInput.parentNode.replaceChild(newSearchInput, searchInput);
    
    newSearchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        const categories = container.querySelectorAll('.faq-category');
        let hasAnyResults = false;
        
        categories.forEach(category => {
            const items = category.querySelectorAll('.faq-item');
            let categoryHasResults = false;
            
            items.forEach(item => {
                const questionText = item.querySelector('.faq-question span')?.innerText.toLowerCase() || '';
                const answerText = item.querySelector('.faq-answer p')?.innerText.toLowerCase() || '';
                
                if (searchTerm === '') {
                    item.style.display = '';
                    categoryHasResults = true;
                } else if (questionText.includes(searchTerm) || answerText.includes(searchTerm)) {
                    item.style.display = '';
                    categoryHasResults = true;
                } else {
                    item.style.display = 'none';
                }
            });
            
            if (categoryHasResults && searchTerm !== '') {
                category.style.display = '';
                hasAnyResults = true;
            } else if (searchTerm === '') {
                category.style.display = '';
                hasAnyResults = true;
            } else {
                category.style.display = 'none';
            }
        });
        
     
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('faqContent');
    if (container) {
        renderFAQPage(container);
    }
});