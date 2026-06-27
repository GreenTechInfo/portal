function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Функция для вставки изображения с подписью
function renderImage(src, caption, width = "100%") {
    if (!src) return '';
    // Генерируем уникальный ID для этого изображения
    const imgId = 'img_' + Math.random().toString(36).substr(2, 9);
    
    return `
        <div style="margin: 16px 0; text-align: center;" id="container_${imgId}">
            <img id="${imgId}" 
                 src="${src}" 
                 alt="${escapeHtml(caption)}" 
                 style="max-width: ${width}; border-radius: 12px; border: 1px solid var(--border); cursor: pointer;"
                 onclick="openImageModal('${src}', '${escapeHtml(caption)}')"
                 onerror="this.onerror=null; this.style.display='none'; document.getElementById('container_${imgId}').innerHTML = '<div style=\\'color: var(--text-secondary); font-size: 0.8rem; padding: 20px; text-align: center; border: 1px dashed var(--border); border-radius: 12px;\\'>Изображение временно недоступно</span></div>'">
            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 6px;">${escapeHtml(caption)}</div>
        </div>
    `;
}

// Данные о системе документов
const SYSTEMS_DATA = [
    {
        id: "documents",
        name: "Система документов персонажа",
        icon: "fa-id-card",
        color: "#3b82f6",
        description: "Перечень всех документов персонажа и инструкция к их оформлению",
        details: {
            overview: "Для более глубокого погружения в игровой процесс на сервере существует система документов игрока. Для того, чтобы посмотреть свои основные документы: паспорт, водительское удостоверение, медицинскую карту, военный билет - откройте меню на клавишу <b>М</b> и перейдите во вкладку <b>\"Документы\"</b>." +
            renderImage('../images/systems/documents/documents_tab.png', null, '800px'),
            
            sections: [
                {
					title: "Паспорт",
					icon: "fa-passport",
					content: renderImage("../images/systems/documents/passport.png", null, '400px'),
					commands: [
						{ cmd: "/sp [ID]", desc: "Показать паспорт игроку" }
					],
					steps: [
						"Для получения паспорта Вам нужно проследовать в МФЦ.",
						'Отметьте МФЦ на карте: /gps → 1 "Государственные учреждения" → 2 "Мои документы г. Южный", 3 "Мои документы г. Арзамас", 4 "Мои документы г. Нижегородск"',
						`<div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin: 16px 0;">
							${renderImage("../images/systems/documents/mfc_gps1.png", null, '300px')}
							${renderImage("../images/systems/documents/mfc_gps2.png", null, '300px')}
						</div>`,
						"Подойдите к двери МФЦ и нажмите ALT, чтобы зайти внутрь."
					],
					locations: [
						{ 
							city: "Арзамас", 
							desc: "МФЦ в Арзамасе",
							image: "../images/systems/documents/mfc_arzamas.png",
							mapImage: "../images/systems/documents/mfc_arzamas_map.png"
						},
						{ 
							city: "Нижегородск", 
							desc: "МФЦ в Нижегородске",
							image: "../images/systems/documents/mfc_nizhny.png",
							mapImage: "../images/systems/documents/mfc_nizhny_map.png"
						},
						{ 
							city: "Южный", 
							desc: "МФЦ в Южном",
							image: "../images/systems/documents/mfc_south.png",
							mapImage: "../images/systems/documents/mfc_south_map.png"
						}
					],
					extraStep: "Находясь внутри, подойдите к левой метке и нажмите ALT." +
					renderImage("../images/systems/documents/mfc_interior.png", null, '800px') +
					"Заполните информацию о Вашем персонаже по примеру и получите паспорт." +
					`<div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin: 16px 0;">
						${renderImage("../images/systems/documents/passport_step1.png", null, '350px')}
						${renderImage("../images/systems/documents/passport_step2.png", null, '350px')}
						${renderImage("../images/systems/documents/passport_step3.png", null, '350px')}
						${renderImage("../images/systems/documents/passport_step4.png", null, '350px')}
						${renderImage("../images/systems/documents/passport_step5.png", null, '350px')}
						${renderImage("../images/systems/documents/passport_step6.png", null, '350px')}
					</div>`
				},
                {
                    title: "Водительское удостоверение",
                    icon: "fa-id-card",
                    content: renderImage("../images/systems/documents/driver_license.png", null, '400px' ),
                    commands: [
                        { cmd: "/vu [ID]", desc: "Показать водительское удостоверение" }
                    ],
                    steps: [
                        "Для открытия категорий в водительском удостоверении Вам нужно проследовать в Автошколу.",
                        'Отметьте автошколу на карте: /gps → 1 "Государственные учреждения" → 6 "Автошкола"',
						`<div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin: 16px 0;">
							${renderImage("../images/systems/documents/mfc_gps1.png",  null, '300px')}
							${renderImage("../images/systems/documents/driving_school_gps2.png", null, '300px')}
						</div>`,
                        "Зайдите внутрь автошколы и подойдите к стойке информации. Выберите категорию, которую хотите открыть.",
						`<div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin: 16px 0;">
							${renderImage("../images/systems/documents/driving_school_exterior.png", null, '400px')}
							${renderImage("../images/systems/documents/driving_school_interior.png", null, '400px')}
							${renderImage("../images/systems/documents/driving_school_category.png", null, '300px')}
						</div>`,
                        'Нажмите "Выбор" и пройдите в учебный класс, встаньте на чекпоинт "Начать обучение".',
                        "В учебном классе также доступна тестовая сдача экзамена для подготовки к экзамену в ГИБДД.",
						`<div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin: 16px 0;">
							${renderImage("../images/systems/documents/driving_school_classroom.png", null, '800px')}
						</div>`,
                        "После окончания обучения пройдите на полигон автошколы, сядьте в свободный транспорт открываемой категории и пройдите маршрут.",
						`<div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin: 16px 0;">
							${renderImage("../images/systems/documents/driving_school_polygon.png", null, '800px')}
						</div>`,
                        "После сдачи практического экзамена направляйтесь в ГИБДД.",
                        'Отметьте отделение ГИБДД на карте: /gps → 1 "Государственные учреждения" → 11 "МРЭО (Экзамены)"',
                        `<div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin: 16px 0;">
							${renderImage("../images/systems/documents/mfc_gps1.png",  null, '300px')}
							${renderImage("../images/systems/documents/gibdd_gps_2.png", null, '300px')}
						</div>`,
						"Зайдите внутрь и пройдите в комнату сдачи экзаменов.",
						`<div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin: 16px 0;">
							${renderImage("../images/systems/documents/gibdd_exterior.png", null, '400px')}
							${renderImage("../images/systems/documents/gibdd_interior.png", null, '400px')}
						</div>`,
                        "Подойдите к компьютеру в соответствии со сдаваемой категорией и нажмите ALT.",
						`<div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin: 16px 0;">
							${renderImage("../images/systems/documents/gibdd_computer.png", null, '800px')}
						</div>`,
                        "После успешной сдачи экзамена у вас откроется категория в Вашем ВУ."
                    ],
                    note: "В учебном классе также доступна тестовая сдача экзамена для подготовки"
                },
                {
                    title: "Медицинская карта",
                    icon: "fa-notes-medical",
                    content: renderImage("../images/systems/documents/medcard.png", null, "400px"),
                    commands: [
                        { cmd: "/showmedcard [ID]", desc: "Показать медицинскую карту" }
                    ],
                    steps: [
                        "Для получения медицинской карты Вам нужно проследовать в городскую больницу Арзамаса.",
                        'Отметьте больницу на карте: /gps → 1 "Государственные учреждения" → 8 "Городская больница"',
						`<div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin: 16px 0;">
							${renderImage("../images/systems/documents/mfc_gps1.png",  null, '300px')}
							${renderImage("../images/systems/documents/hospital_gps2.png", null, '300px')}
						</div>`,
						"Зайдите внутрь больницы, подойдите к регистратуре и нажмите ALT. Медицинская карта будет получена.",
						`<div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin: 16px 0;">
							${renderImage("../images/systems/documents/hospital_exterior.png", null, '400px')}
							${renderImage("../images/systems/documents/hospital_interior.png", null, '400px')}
							${renderImage("../images/systems/documents/hospital_checkpoint.png", null, '400px')}
						</div>`
                    ]
                },
                {
                    title: "Повестка",
                    icon: "fa-envelope",
                    content: renderImage("../images/systems/documents/povestka.png", null, "600px"),
                    commands: [
                        { cmd: "/povestka [ID]", desc: "Показать повестку игроку или посмотреть самому" }
                    ],
                    steps: [
                        "Для получения повестки Вам нужно проследовать в военкомат.",
                        'Отметьте военкомат на карте: /gps → 1 "Государственные учреждения" → 10 "Военкомат"',
						`<div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin: 16px 0;">
							${renderImage("../images/systems/documents/mfc_gps1.png",  null, '300px')}
							${renderImage("../images/systems/documents/voenkomat_gps2.png", null, '300px')}
						</div>`,
						"Зайдите внутрь военкомата, подойдите к дежурному и нажмите ALT. Повестка будет получена.",
						`<div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin: 16px 0;">
							${renderImage("../images/systems/documents/voenkomat_exterior.png", null, '400px')}
							${renderImage("../images/systems/documents/voenkomat_duty.png", null, '400px')}
						</div>`
                    ],
                    note: "Призыв в Вооружённые силы каждую субботу в 17:00 часов"
                },
                {
                    title: "Военный билет",
                    icon: "fa-medal",
                    content: renderImage("../images/systems/documents/army_billet.png", null, "450px"),
                    commands: [
                        { cmd: "/showbil [ID]", desc: "Показать военный билет" }
                    ],
                    note: "Военный билет выдается лидером фракции ВС РФ после успешного прохождения срочной службы (2 недели)"
                },
                {
                    title: "СТС (Свидетельство о регистрации ТС)",
                    icon: "fa-file-alt",
                    content: "Свидетельство о регистрации транспортного средства содержит сведения о транспортном средстве, его VIN номер и сведения о владельце." +
                    renderImage("../images/systems/documents/sts.png", null, "450px"),
                    commands: [
                        { cmd: "/sts [ID]", desc: "Просмотреть СТС самому или показать игроку" }
                    ]
                },
                {
                    title: "ПТС (Паспорт транспортного средства)",
                    icon: "fa-file",
                    content: "Паспорт на техническое средство содержит сведения о дате покупки, прохождении Т/О, страховке и налоге на транспортное средство." +
                    renderImage("../images/systems/documents/pts.png", null, "450px"),
                    commands: [
                        { cmd: "/tehpass [ID]", desc: "Просмотреть ПТС самому или показать игроку" }
                    ]
                },
                {
                    title: "Полис ОСАГО",
					icon: "fa-shield-alt",
					content: `Для оформления электронных страховых полисов обязательного страхования гражданской ответственности владельцев транспортных средств (ОСАГО) на карте расположено три офиса страховой компании. Оформление страхового полиса на автомобиль дает игроку следующие преимущества:<br><b>1.</b> Скидку на ремонт во всех станциях технического обслуживания;<br><b>2.</b> При попадании в ДТП, если виновник признает вину, возможность получить справку от сотрудников ГИБДД/ЦОРДД для проведения бесплатного ремонта автомобиля в автосервисах 'PROcustom', 'RedLine', 'Автоклимат'.`+
					renderImage("../images/systems/documents/insurance_polis.png", null, "500px"),
					commands: [
						{ cmd: "/polis [ID]", desc: "Показать страховой полис" }
					],
                    steps: [
                        "Для получения страхового полиса Вам нужно проследовать в любой из трёх доступных офисов страховых компаний.",
                        'Найти офис на карте: /gps → 16 "Найти ближайшую страховую компанию"',
						`<div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin: 16px 0;">
							${renderImage("../images/systems/documents/insurance_gps.png",  null, '300px')}
						</div>`,
                        "После прибытия в офис страховой компании Вам нужно подойти к пикапу оформления полисов и нажать ALT.",
						`<div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin: 16px 0;">
							${renderImage("../images/systems/documents/insurance_office_interior.png", null, '400px')}
							${renderImage("../images/systems/documents/insurance_checkpoint.png", null, '400px')}
						</div>`,
                        "После нажатия клавиши ALT у Вас появится меню выбора автомобиля, который Вы хотите застраховать.",
						`<div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin: 16px 0;">
							${renderImage("../images/systems/documents/insurance_car_select.png",  null, '300px')}
						</div>`,
                        "Выберите нужный автомобиль, после выберите период, на который Вы хотите застраховать автомобиль. В окне будет указана цена за один день страховки, а также период, до какого у Вас уже имеется страховка.",
                        `<div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin: 16px 0;">
							${renderImage("../images/systems/documents/insurance_period_select.png",  null, '300px')}
						</div>`,
						"Далее нужно выбрать способ оплаты страховки: либо наличными, либо банковской картой.",
						`<div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin: 16px 0;">
							${renderImage("../images/systems/documents/insurance_payment_select.png",  null, '300px')}
						</div>`,
                        "При выборе оплаты банковской картой у Вас отобразится терминал, где ЛКМ нужно будет ввести пин-код банковской карты и нажать на кнопку с зеленым кругом.",
						`<div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin: 16px 0;">
							${renderImage("../images/systems/documents/insurance_terminal.png",  null, '200px')}
						</div>`,
                        'После успешной оплаты страховки у Вас в чате появится надпись "Вы успешно застраховали ТС."',
						`<div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin: 16px 0;">
							${renderImage("../images/systems/documents/insurance_success_chat.png",  null, '500px')}
						</div>`
                    ],
                    locations: [
                        {
                            city: "Южный",
                            desc: "Офис страховой компании",
                            image: "../images/systems/documents/insurance_south.png",
                            mapImage: "../images/systems/documents/insurance_south_map.png"
                        },
                        {
                            city: "Арзамас",
                            desc: "Офис страховой компании",
                            image: "../images/systems/documents/insurance_arzamas.png",
                            mapImage: "../images/systems/documents/insurance_arzamas_map.png"
                        },
                        {
                            city: "Нижегородск",
                            desc: "Офис страховой компании",
                            image: "../images/systems/documents/insurance_nizhny.png",
                            mapImage: "../images/systems/documents/insurance_nizhny_map.png"
                        }
                    ]
                },
                {
                    title: "Сервисная книжка",
                    icon: "fa-tools",
                    content: "Сервисная книжка служит для просмотра информации о техническом состоянии автомобиля и напоминании о своевременной замене деталей." +
                    renderImage("../images/systems/documents/service_book.png", null, "450px"),
                    commands: [
                        { cmd: "/serviceveh [ID]", desc: "Просмотреть сервисную книжку самому или показать игроку" }
                    ]
                }
            ]
        }
    },
	
	{
		id: "atm",
		name: "Система банкоматов",
		icon: "fa-credit-card",
		color: "#10b981",
		description: "Управление финансами: банковские карты, платежи, налоги и ипотека",
		details: {
			overview: `Для удобного хранения денежных средств, оплаты налогов, ипотеки, штрафов и мобильной связи на сервере представлена система банкоматов и терминалов.
			<div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin: 16px 0;">
				${renderImage("../images/systems/atm/atm_machine.png",  null, '500px')}
			</div>
			<p><strong>Банкомат (слева)</strong> — для проверки баланса и снятия денежных средств.<br>
			<strong>Терминал (справа)</strong> — для оплаты налогов, ипотеки, штрафов, мобильной связи и зачисления наличных.</p>`,
			sections: [
				{
					title: "Оформление карты в банке",
					icon: "fa-id-card",
					content: `<p>Для того, чтобы пользоваться банкоматом или терминалом, Вам понадобится <strong>банковская карта</strong>.</p>
					<p>Чтобы оформить её - Вам нужно проследовать в один из четырех банков</p>`,
					locations: [
						{ city: "Батырево", desc: "Здание банка", image: "../images/systems/atm/bank_batyrevo.png", mapImage: "../images/systems/atm/bank_batyrevo_map.png" },
						{ city: "Арзамас", desc: "Здание банка", image: "../images/systems/atm/bank_arzamas.png", mapImage: "../images/systems/atm/bank_arzamas_map.png" },
						{ city: "Нижегородск", desc: "Здание банка", image: "../images/systems/atm/bank_nizhny.png", mapImage: "../images/systems/atm/bank_nizhny_map.png" },
						{ city: "Арзамасский коттеджный посёлок", desc: "Здание банка", image: "../images/systems/atm/bank_cottage.png", mapImage: "../images/systems/atm/bank_cottage_map.png" }
					],
					steps: [
						'Найти банк на карте: <code>/gps → 10 "Найти ближайший банк"</code>',
						"После прибытия в банк Вам нужно подойти к пикапу и нажать ALT.",
						`<div style="margin: 16px 0;">${renderImage("../images/systems/atm/bank_interior.png", null, "800px")}</div>`,
						"У Вас появится меню взаимодействия с банком:",
						`<div style="margin: 16px 0;">${renderImage("../images/systems/atm/bank_menu.png", null, "800px")}</div>`,
						"Выберите вкладку <strong>«Оформить карту»</strong>, после чего оформите её.",
						"После оформления у Вас появится постоянная банковская карта со своим пин-кодом."
					],
					note: "Банковская карта также отображается в меню документов (клавиша M)."
				},
				{
					title: "Как узнать PIN-код от банковской карты",
					icon: "fa-question-circle",
					content: `<p>Если вдруг забыли пин-код от Вашей банковской карты - его можно узнать с помощью меню.</p>
					<h4 style="color: var(--accent); margin: 16px 0 8px;">Вариант №1</h4>
					<p>Введите в чат <code>/menu</code> - выберите пункт <strong>«10. Банковская карта»</strong>.</p>
					${renderImage("../images/systems/atm/menu_bankcard.png", null, "400px")}
					<p>На экране высветится банковская карта, а в чате отобразится строка с пин-кодом Вашей карты. Чтобы скрыть карту - нажмите ESC.</p>

					<h4 style="color: var(--accent); margin: 16px 0 8px;">Вариант №2</h4>
					<p>Нажмите кнопку <strong>M</strong> (русская — <strong>Ь</strong>) для открытия меню. Сверху найдите вкладку <strong>«Документы»</strong> и нажмите на неё.</p>
					${renderImage("../images/systems/atm/menu_documents_tab.png", null, "800px")}
					<p>У вас откроется меню Ваших документов. Нажмите на банковскую карту.</p>
					${renderImage("../images/systems/atm/documents_bankcard.png", null, "800px")}
					<p>На экране высветится банковская карта, а в чате отобразится строка с пин-кодом Вашей карты. Чтобы скрыть карту - нажмите ESC.</p>`
				},
				{
					title: "Проверка баланса банковской карты",
					icon: "fa-chart-line",
					content: `<p>Чтобы отобразить баланс банковской карты в меню банкомата:</p>
					<ul class="info-list">
						<li><strong>В банкомате</strong> — нажать кнопку <strong>«Узнать баланс»</strong>, после чего слева отобразится Ваш баланс.</li>
						<div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin: 16px 0;">
							${renderImage("../images/systems/atm/atm_menu.png", null, "500px")}
							${renderImage("../images/systems/atm/atm_balance.png", null, "500px")}
						</div>
						<li><strong>В терминале</strong> — нажать кнопку <strong>«Баланс»</strong>, после чего слева отобразится Ваш баланс.</li>
						<div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin: 16px 0;">
							${renderImage("../images/systems/atm/terminal_menu.png", null, "500px")}
							${renderImage("../images/systems/atm/terminal_balance.png", null, "500px")}
						</div>
					</ul>`
				},
				{
					title: "Пополнение банковского счета",
					icon: "fa-arrow-up",
					content: `<p>Для зачисления денежных средств на свой банковский счет Вам необходимо подойти к <strong>терминалу</strong>.</p>
					<ul class="info-list">
						<li>Подойдите к терминалу и нажмите клавишу ALT.</li>
						<li>Введите пин-код от Вашей банковской карты на клавиатуре.</li>
						${renderImage("../images/systems/atm/terminal_pin.png", null, "500px")}
						<li>Нажмите на кнопку <strong>«Пополнение»</strong></li>
						${renderImage("../images/systems/atm/terminal_menu_topup.png", null, "500px")}
						<li>В появившейся вкладке введите сумму, которую хотите зачислить на банковский счет и нажмите <strong>«Пополнить»</strong>.</li>
						${renderImage("../images/systems/atm/terminal_topup_amount.png", null, "500px")}
						<li>При наличии указанной суммы на руках — деньги зачислятся на счёт, а у Вас появится подтверждающая надпись.</li>
						${renderImage("../images/systems/atm/terminal_topup_success.png", null, "500px")}
					</ul>`
				},
				{
					title: "Снятие наличных",
					icon: "fa-arrow-down",
					content: `<p>Для снятия наличных со своего банковского счета Вам необходимо подойти к <strong>банкомату</strong>.</p>
					<ul class="info-list">
						<li>Подойдите к банкомату и нажмите клавишу ALT.</li>
						<li>Введите пин-код от Вашей банковской карты на клавиатуре.</li>
						${renderImage("../images/systems/atm/terminal_pin.png", null, "500px")}
						<li>Нажмите на кнопку <strong>«Снять наличные»</strong>.</li>
						${renderImage("../images/systems/atm/atm_menu_withdraw.png", null, "500px")}
						<li>В появившейся вкладке введите сумму, которую хотите снять с банковского счета и нажмите <strong>«Снять наличные»</strong>.</li>
						${renderImage("../images/systems/atm/atm_withdraw_amount.png", null, "500px")}
						<li>При наличии указанной суммы на банковском счету деньги снимутся, а у Вас появится подтверждающая надпись.</li>
						${renderImage("../images/systems/atm/atm_withdraw_success.png", null, "500px")}
					</ul>`
				},
				{
					title: "Оплата налогов и ипотеки",
					icon: "fa-file-invoice-dollar",
					content: `<p>Для оплаты налогов Вам необходимо воспользоваться <strong>терминалом</strong>.</p>
					<ul class="info-list">
						<li>Подойдите к терминалу и нажмите клавишу ALT.</li>
						<li>Введите пин-код от Вашей банковской карты на клавиатуре.</li>
						<li>В появившемся меню выберите вкладку <strong>«Налоги»</strong>.</li>
						${renderImage("../images/systems/atm/terminal_menu_taxes.png",null, "500px")}
						<li>В данной вкладке можно оплатить налоги на имущество и ипотеку.</li>
						${renderImage("../images/systems/atm/terminal_taxes_menu.png", null, "500px")}
					</ul>
					<h4 style="color: var(--accent); margin: 16px 0 8px;">Оплата налогов</h4>
					<p>Выберите нужную категорию:</p>
					<div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin: 16px 0;">
							${renderImage("../images/systems/atm/category_1.png", null, "350px")}
							${renderImage("../images/systems/atm/category_2.png", null, "350px")}
							${renderImage("../images/systems/atm/category_3.png", null, "350px")}
							${renderImage("../images/systems/atm/category_4.png", null, "350px")}
						</div>
					<p>Выбрав нужное имущество — у Вас появится вкладка выбора дней, на сколько Вы хотите оплатить налог. Также будет указан период, до которого уже оплачен налог, и стоимость налога за день. Введите нужное количество дней и нажмите <strong>«Оплатить»</strong>.</p>
					${renderImage("../images/systems/atm/terminal_taxes_days.png", null, "500px")}
					<p>После нажатия кнопки «Оплатить» деньги автоматически спишутся с Вашего банковского счета, и появится вкладка с подтверждением оплаты.</p>
					${renderImage("../images/systems/atm/terminal_taxes_success.png", null, "500px")}
					
					<h4 style="color: var(--accent); margin: 16px 0 8px;">Оплата ипотеки</h4>
					<p>В этой вкладке Вам необходимо выбрать недвижимость, которая находится в ипотеке.</p>
					${renderImage("../images/systems/atm/terminal_mortgage_list.png", null, "500px")}
					<p>В следующей вкладке выберите сумму, которую нужно внести в качестве платежа по ипотеке, затем нажмите <strong>«Внести»</strong>. После этого отобразится дата следующего платежа.</p>
					${renderImage("../images/systems/atm/terminal_mortgage_payment.png", null, "500px")}`
				},
				{
					title: "Оплата штрафов",
					icon: "fa-gavel",
					content: `<ul class="info-list">
						<li>Подойдите к терминалу, нажмите ALT, введите пин-код.</li>
						<li>В меню выберите вкладку <strong>«Оплата штрафов»</strong>.</li>
						${renderImage("../images/systems/atm/terminal_menu_fines.png", null, "500px")}
						<li>Отобразится вкладка с неоплаченными штрафами. Выделите галочкой нужный штраф и нажмите <strong>«Оплатить»</strong>.</li>
						${renderImage("../images/systems/atm/terminal_fines_list.png", null, "500px")}
						<li>При наличии денег на счёте штраф оплатится.</li>
						${renderImage("../images/systems/atm/terminal_fines_success.png", null, "500px")}
					</ul>`
				},
				{
					title: "Пополнение баланса мобильного телефона",
					icon: "fa-mobile-alt",
					content: `<ul class="info-list">
						<li>Подойдите к терминалу, нажмите ALT, введите пин-код.</li>
						<li>В меню выберите вкладку <strong>«Мобильный»</strong>.</li>
						${renderImage("../images/systems/atm/terminal_menu_mobile.png", null, "500px")}
						<li>После выбора у Вас отобразится вкладка пополнения баланса сим-карты. На данной вкладке также отображается баланс Вашего мобильного телефона.</li>
						<li>Введите нужную сумму, на которую хотите пополнить, после чего нажмите кнопку <strong>"Пополнить"</strong>.</li>
						${renderImage("../images/systems/atm/terminal_mobile_topup.png", null, "500px")}
						<li>После нажатия деньги спишутся со счёта.</li>
						${renderImage("../images/systems/atm/terminal_mobile_success.png", null, "500px")}
					</ul>`
				}
			]
		}
	},
	
	{
        id: "relax",
        name: "Система отдыха",
        icon: "fa-campground",
        color: "#f59e0b",
        description: "Рыбалка, грибы, палатки, гитара, костры и мангалы — всё для уютного времяпровождения",
        details: {
            overview: `<p>Система отдыха на сервере позволяет разнообразить игровой процесс и насладиться природой. Вы можете отправиться на рыбалку, собрать грибы в лесу, разбить палатку, поиграть на гитаре у костра или устроить пикник с шашлыками. Все необходимые предметы продаются в круглосуточных магазинах <strong>24/7</strong> (<code>/gps → 8. Круглосуточный магазин (24/7)</code>).</p>
            <p>Специальные зоны для отдыха отмечены на карте. Собранные ресурсы можно продать на рынке в Батырево или использовать для приготовления еды.</p>`,
            
            sections: [
                {
                    title: "Рыбалка",
                    icon: "fa-fish",
                    content: `<p>Рыбалка — это не только способ расслабиться, но и хороший заработок. Процесс требует подготовки и сноровки.</p>`,
                    steps: [
                        "<strong>1. Покупка снаряжения:</strong> Приезжаем в 24/7 (<code>/gps → 8</code>) и покупаем рыболовные снасти: <strong>удилище</strong> или <strong>спиннинг 1 уровня</strong>, <strong>подсадок</strong> и <strong>садок для рыбы</strong>.",
                        "<strong>2. Выбор места:</strong> Отправляемся на одно из рыболовных мест (<code>/gps → 20</code>):",
                        `<div style="margin: 8px 0 16px 24px;">
                            • <code>/gps 20 → 1</code> - Южный<br>
                            • <code>/gps 20 → 2</code> - Озёрное<br>
                            • <code>/gps 20 → 3</code> - Батырево<br>
                            • <code>/gps 20 → 4</code> - Роговичи
                        </div>`,
                        `<strong>3. Процесс рыбалки:</strong> Подходим к воде и прописываем команду <code>/fish</code>.`,
                        `<strong>4. Выбор снасти:</strong> В появившемся меню выбираем, чем будем рыбачить ("удилище" или "спиннинг 1 уровня").`,
                        `<strong>5. Выбор наживки:</strong> Выбираем наживку из доступных: "червь", "хлеб", "тесто", "опарыш" или "лягушка".`,
                        `<strong>6. Поклёвка:</strong> Дожидаемся появления надписи в чате <strong>«НАЖИМАЙТЕ 'Y'»</strong>. После этого зажимаем и держим клавишу <strong>Y</strong> до тех пор, пока полоса не заполнится до конца.`,
                        `<strong>7. Результат:</strong> Выбираем действие с пойманной рыбой: "отпустить" или "положить в садок".`,
                        `<strong>8. Продажа улова:</strong> Едем на рынок скупки рыбы (находится в Батырево). Подходим к пикапу, нажимаем <strong>L.ALT</strong> и выбираем "Продать". Цена — <strong>100₽ за 1 кг</strong>. Рыбу также можно положить в холодильник в доме или квартире.`
                    ],
                    note: "Внимание! Рыбалка требует терпения. Удерживайте клавишу Y до конца, иначе рыба сорвётся."
                },
                {
                    title: "Сбор грибов",
                    icon: "fa-leaf",
                    content: `<p>Тихая охота — отличный способ провести время в лесу и заработать.</p>`,
                    steps: [
                        "<strong>1. Покупка инвентаря:</strong> Приезжаем в 24/7 (<code>/gps → 8</code>) и покупаем <strong>грибную корзинку</strong>.",
                        "<strong>2. Поиск грибов:</strong> Направляемся в лесной массив. Грибы появляются в случайных местах.",
                        "<strong>3. Сбор:</strong> Открываем инвентарь (<code>/inv</code> или клавиша <strong>I</strong>), выбираем <strong>«Грибную корзинку»</strong> и нажимаем «Использовать».",
                        "<strong>4. Взаимодействие:</strong> Подходим к найденному грибу и нажимаем <strong>L.ALT</strong>.",
                        "<strong>5. Продажа:</strong> Едем на рынок скупки грибов в Батырево. Подходим к пикапу, нажимаем <strong>L.ALT</strong> и жмем «Продать». Цена — <strong>50₽ за 1 гриб</strong>. Грибы также можно хранить в холодильнике."
                    ]
                },
                {
                    title: "Палатка",
                    icon: "fa-campground",
                    content: `<p>Установите палатку в живописном месте, чтобы переночевать или просто отдохнуть.</p>`,
                    steps: [
                        "<strong>1. Покупка:</strong> Приобретаем <strong>палатку</strong> в любом магазине 24/7 (<code>/gps → 8</code>).",
                        "<strong>2. Установка:</strong> Едем в разрешённое для установки место (например, в лес или на берег озера).",
                        "<strong>3. Размещение:</strong> Открываем инвентарь (<code>/inv</code> или <strong>I</strong>), выбираем «Палатку» и нажимаем «Использовать».",
                        "<strong>4. Удаление:</strong> Чтобы убрать палатку, подходим к её входу и прописываем команду <code>/dellpalatka</code>."
                    ],
                    note: "Палатка автоматически удаляется через 30 минут после установки."
                },
                {
                    title: "Гитара и костёр",
                    icon: "fa-fire",
                    content: `<p>Создайте уютную атмосферу у костра под живую музыку.</p>`,
                    steps: [
                        "<strong>1. Покупка гитары:</strong> Покупаем <strong>гитару</strong> в 24/7 (<code>/gps → 8</code>).",
                        "<strong>2. Транспортировка:</strong> Кладём гитару в багажник автомобиля: <code>/object → Положить в багажник</code>.",
                        "<strong>3. Подготовка к костру:</strong> В том же магазине покупаем <strong>дрова, зажигалку и розжиг для костра</strong>. Дрова также кладём в багажник.",
                        "<strong>4. Разведение костра:</strong> Едем в разрешённое место. Открываем багажник (<code>/trunk [ID авто]</code>), выбираем <strong>«Дрова»</strong> и нажимаем «Взять». Затем прописываем команду <code>/object → Зажечь</code>.",
                        "<strong>5. Игра на гитаре:</strong> Достаём гитару из багажника. Прописываем <code>/object → Сыграть</code> и выбираем мелодию. Остановить игру — <code>/object → Остановить</code>."
                    ],
                    note: "Костёр автоматически удаляется через 40 минут после поджога."
                },
                {
                    title: "Мангал и шашлыки",
                    icon: "fa-utensils",
                    content: `<p>Приготовьте вкусный ужин на природе. Для этого на озере в Роговичах есть специальные мангалы.</p>`,
                    steps: [
                        "<strong>1. Покупка мангала (опционально):</strong> Вы можете купить свой мангал в 24/7, но на озере есть бесплатные стационарные.",
                        "<strong>2. Покупка продуктов:</strong> Едем в продуктовый магазин <strong>«Пятерочка»</strong> и покупаем <strong>шампура, решётку-гриль, свинину или овощи</strong>.",
                        "<strong>3. Приготовление:</strong> Едем на озеро в Роговичах (<code>/gps → 20 → 4</code>). Подходим к свободному мангалу.",
                        "<strong>4. Начало готовки:</strong> Нажимаем <strong>L.ALT</strong> и выбираем блюдо: «Рыба на мангале», «Овощи гриль» или «Шашлык».",
                        "<strong>5. Процесс:</strong> Выбираем количество шампуров (от 1 до 5) и ждём 5 минут до полного приготовления.",
                        "<strong>6. Завершение:</strong> Подходим к мангалу и прописываем команду <code>/eatsha</code>, чтобы съесть готовое блюдо."
                    ],
                    note: "Если вы купили свой мангал, его можно установить в любом разрешённом месте командой /object → Собрать. Он также удаляется через 40 минут."
                }
            ]
        }
    },
	
	{
		id: "houses",
		name: "Система домов и прописки",
		icon: "fa-home",
		color: "#e67e22", 
		description: "Приобретение недвижимости, управление домом, прописка игроков, сейфы и ипотека",
		details: {
			overview: `<p>На сервере GreenTech RP вы можете приобрести собственное жильё — дом или квартиру. Владение недвижимостью открывает множество возможностей: от безопасного хранения вещей и денег до создания уютного уголка для отдыха и встреч с друзьями.</p>
			<p>Управление недвижимостью осуществляется через специальное меню, которое вызывается у входной двери.</p>
			<div style="margin: 16px 0; text-align: center;">
				${renderImage("../images/systems/houses/house_menu.png", null, "450px")}
			</div>`,
			
			sections: [
				{
					title: "Основное меню управления",
					icon: "fa-door-open",
					content: `<p>Для открытия меню управления домом или квартирой подойдите к входной двери и введите команду <code>/housemenu</code>.</p>
					<p>Меню предоставляет доступ ко всем функциям управления недвижимостью:</p>`,
					commands: [
						{ cmd: "/housemenu", desc: "Открыть меню управления домом/квартирой" }
					],
					steps: [] 
				},
				{
					title: "Закрыть/открыть дверь",
					icon: "fa-lock",
					content: `<p>С помощью данного пункта вы можете закрыть свой дом/квартиру от посторонних лиц. Внутрь смогут зайти только владелец и прописанные игроки. Это базовая функция безопасности вашего жилья.</p>`
				},
				{
					title: "Продажа недвижимости",
					icon: "fa-hand-holding-usd",
					content: `<p>Существует два способа продать недвижимость:</p>
					<ul class="info-list">
						<li><strong>Продажа государству</strong> — вы получите 50% от государственной цены недвижимости. Для этого выберите пункт "Продать государству" в меню дома.</li>
						${renderImage("../images/systems/houses/sell_to_state.png", null, "450px")}
						<li><strong>Продажа другому игроку</strong> — возможна только через нотариуса.</li>
					</ul>
					<p><strong>Как найти нотариуса:</strong> <code>/gps → 19. Найти ближайшего нотариуса</code></p>
					${renderImage("../images/systems/houses/notary_gps.png", null, "450px")}
					<p>У нотариуса вы можете продать свой дом другому игроку, либо обменять его на другой дом или бизнес.</p>
					<div style="display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; margin: 16px 0;">
						${renderImage("../images/systems/houses/notary_interior.png", null, "500px")}
					</div>
					<div style="display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; margin: 16px 0;">
						${renderImage("../images/systems/houses/notary_menu_1.png", null, "300px")}
						${renderImage("../images/systems/houses/notary_menu_2.png", null, "300px")}
						${renderImage("../images/systems/houses/notary_menu_3.png", null, "300px")}
						${renderImage("../images/systems/houses/notary_menu_4.png", null, "300px")}
					</div>`
				},
				{
					title: "Включить/выключить свет",
					icon: "fa-lightbulb",
					content: `<p>С помощью данного пункта вы можете управлять освещением в вашем доме или квартире, создавая нужную атмосферу.</p>`
				},
				{
					title: "Налоги и ипотека",
					icon: "fa-file-invoice-dollar",
					content: `<p><strong>Налоги:</strong> Оплата налогов на недвижимость доступна через банковские терминалы (подробнее в разделе "<a href="systems.html#atm" target="_blank" style="color: var(--accent); text-decoration: none; border-bottom: 1px dashed var(--accent);">Система банкоматов</a>").</p>
					<p><strong>Ипотека:</strong> В меню управления домом есть пункт "Ипотека", где отображается информация о вашем ипотечном кредите, если недвижимость приобретена в ипотеку.</p>`
				},
				{
					title: "Установить улицу",
					icon: "fa-map-signs",
					content: `<p>Здесь вы можете установить желаемую улицу, которая будет отображаться в сведениях о доме/квартире. Это удобно для настройки адреса вашей недвижимости.</p>
					<div style="display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; margin: 16px 0;">
						${renderImage("../images/systems/houses/set_street_menu.png", null, "400px")}
						${renderImage("../images/systems/houses/set_street_success.png", null, "400px")}
					</div>`
				},
				{
					title: "Статистика дома",
					icon: "fa-chart-simple",
					content: `<p>С помощью статистики можно узнать:</p>
					<ul class="info-list">
						<li>Государственную стоимость дома</li>
						<li>Срок уплаты налога</li>
						<li>Интерьер дома/квартиры</li>
						<li>ID дома/квартиры</li>
					</ul>
					${renderImage("../images/systems/houses/house_stats.png", null, "450px")}`
				},
				{
					title: "Расширение шкафа",
					icon: "fa-tshirt",
					content: `<p>Вы можете докупить дополнительные слоты в шкаф для одежды, чтобы хранить больше скинов.</p>
					<p><strong>Стоимость одного слота:</strong> 50 000 ₽</p>`
				},
				{
					title: "Сейф",
					icon: "fa-vault",
					content: `<p>В доме можно безопасно хранить свои денежные средства при помощи сейфа.</p>
					<ul class="info-list">
						<li><strong>Покупка:</strong> Стоимость сейфа — 100 000 ₽. Приобрести его можно через меню управления домом.</li>
						${renderImage("../images/systems/houses/safe_buy.png", null, "450px")}
						<li><strong>Использование:</strong> После покупки вы сможете хранить денежные средства в сейфе или забирать их оттуда.</li>
					</ul>
					<div style="display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; margin: 16px 0;">
						${renderImage("../images/systems/houses/safe_menu_1.png", null, "300px")}
						${renderImage("../images/systems/houses/safe_menu_2.png", null, "300px")}
						${renderImage("../images/systems/houses/safe_menu_3.png", null, "300px")}
					</div>`
				},
				{
					title: "Прописка и выписка игроков",
					icon: "fa-users",
					content: `<p>Вы можете прописать игрока у себя дома / в квартире. Прописанный игрок получает следующие возможности:</p>
					<ul class="info-list">
						<li>Спавниться у вас дома</li>
						<li>Открывать/закрывать ворота</li>
						<li>Свободно заходить внутрь</li>
					</ul>
					<p>Управление пропиской осуществляется через соответствующие пункты меню.</p>
					<div style="display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; margin: 16px 0;">
						${renderImage("../images/systems/houses/propiska_menu.png", null, "400px")}
						${renderImage("../images/systems/houses/vypiska_menu.png", null, "400px")}
					</div>`
				},
				{
					title: "Праздничные функции",
					icon: "fa-tree",
					content: `<p>Во время новогодних праздников вы можете установить в свой дом/квартиру ёлку через специальный пункт меню "Установить ёлку".</p>`
				}
			]
		}
	},
	
	{
		id: "garages",
		name: "Система гаражей",
		icon: "fa-warehouse",
		color: "#8b5cf6", 
		description: "Покупка гаражей, хранение автомобилей, ремонт и обслуживание транспорта",
		details: {
			overview: `<p>Для хранения автомобилей и их починки на сервере имеется система гаражей. Вы можете приобрести гараж с разным количеством машиномест, ремонтировать свои автомобили и поддерживать их в исправном состоянии.</p>
			<div style="margin: 16px 0; text-align: center;">
				${renderImage("../images/systems/garages/garage_exterior.png", null, "800px")}
			</div>`,
			
			sections: [
				{
					title: "Покупка гаража",
					icon: "fa-shopping-cart",
					content: `<p>Для покупки вам необходимо найти гараж на продаже, подойти к нему и встать на метку.</p>
					${renderImage("../images/systems/garages/garage_marker.png", null, "500px")}
					<p>Находясь на метке, нажмите <strong>ALT</strong>, после нажмите <strong>"Купить"</strong>.</p>
					<p>Существует <strong>три типа гаражей</strong>:</p>
					<ul class="info-list">
						<li><strong>Гараж за 200 000 ₽</strong> — рассчитан на 1 машиноместо.</li>
						${renderImage("../images/systems/garages/garage_buy_1car.png", null, "500px")}
						<li><strong>Гараж за 700 000 ₽</strong> — рассчитан на 2 машиноместа.</li>
						${renderImage("../images/systems/garages/garage_buy_2car.png", null, "500px")}
						<li><strong>Гараж за 1 400 000 ₽</strong> — рассчитан на 3 машиноместа.</li>
						${renderImage("../images/systems/garages/garage_buy_3car.png", null, "500px")}
					</ul>
					<p>После успешной покупки на метке гаража будет указан владелец, также информация о владельце будет отображена в меню гаража.</p>`,
					commands: [
						{ cmd: "/gamenu", desc: "Открыть меню управления гаражом" }
					]
				},
				{
					title: "Починка автомобиля в гараже",
					icon: "fa-wrench",
					content: `<p>В гараже имеется функционал починки автотранспорта. Для осуществления ремонта вам нужно заехать в гараж на автомобиле.</p>
					<h4 style="color: var(--accent); margin: 16px 0 8px;">Пошаговая инструкция:</h4>
					<ul class="info-list">
						<li><strong>Шаг 1:</strong> Подъедьте на транспорте к метке гаража.</li>
						<li><strong>Шаг 2:</strong> Введите команду <code>/gamenu</code> и выберите <strong>"1. Заехать / Выехать"</strong>.</li>
					</ul>
					${renderImage("../images/systems/garages/garage_menu.png", null, "800px")}
					<ul class="info-list">
						<li><strong>Шаг 3:</strong> Автомобиль переместится вместе с вами внутрь гаража.</li>
					</ul>
					${renderImage("../images/systems/garages/car_inside_garage.png", null, "800px")}
					<ul class="info-list">
						<li><strong>Шаг 4:</strong> Откройте капот автомобиля с помощью меню транспорта (клавиша <strong>Y</strong>).</li>
						<li><strong>Шаг 5:</strong> Выйдите из автомобиля и подойдите к капоту.</li>
						<li><strong>Шаг 6:</strong> Введите команду <code>/dl</code>, чтобы узнать ID вашего автомобиля.</li>
						<li><strong>Шаг 7:</strong> Введите команду <code>/fixcar [ID car]</code>.</li>
					</ul>
					${renderImage("../images/systems/garages/hood_open.png", null, "800px")}
					<ul class="info-list">
						<li><strong>Шаг 8:</strong> У вас откроется меню ремонта автомобиля.</li>
					</ul>
					${renderImage("../images/systems/garages/repair_menu.png", null, "400px")}
					<ul class="info-list">
						<li><strong>Шаг 9:</strong> Выберите деталь, которую хотите починить, после нажмите кнопку <strong>"Принять"</strong>.</li>
					</ul>
					${renderImage("../images/systems/garages/repair_process.png", null, "800px")}
					<ul class="info-list">
						<li><strong>Шаг 10:</strong> В случае необходимости повторите те же действия с остальными деталями.</li>
					</ul>
					<p><strong>Важно:</strong> Не забудьте вовремя пополнять количество инструментов в гараже!</p>`,
					commands: [
						{ cmd: "/gamenu", desc: "Открыть меню управления гаражом" },
						{ cmd: "/dl", desc: "Узнать ID автомобиля" },
						{ cmd: "/fixcar [ID]", desc: "Открыть меню ремонта автомобиля" }
					]
				},
				{
					title: "Статистика гаража и инструменты",
					icon: "fa-chart-simple",
					content: `<p>Чтобы посмотреть количество инструментов в гараже, введите <code>/gamenu</code> и выберите <strong>"2. Просмотр информации о гараже"</strong>.</p>
					<p>У вас откроется статистика вашего гаража, где будет указана информация о владельце, количестве машиномест и доступных инструментах для ремонта.</p>
					${renderImage("../images/systems/garages/garage_stats.png", null, "195px")}
					<p><strong>Пополнить количество инструментов</strong> можно в автомагазине. Найти его можно при помощи <code>/gps</code>.</p>
					<div style="margin-top: 16px; padding: 12px; background: rgba(59, 130, 246, 0.1); border-left: 3px solid var(--accent); border-radius: 8px;">
						<i class="fas fa-lightbulb"></i> <strong>Совет:</strong> Регулярно проверяйте количество инструментов в гараже, чтобы всегда иметь возможность отремонтировать автомобиль в случае поломки.
					</div>`,
					commands: [
						{ cmd: "/gamenu → 2", desc: "Просмотр информации о гараже (статистика)" },
						{ cmd: "/gps", desc: "Найти автомагазин для покупки инструментов" }
					]
				}
			]
		}
	},
	
	{
		id: "business",
		name: "Система бизнесов",
		icon: "fa-store",
		color: "#06b6d4",
		description: "Управление собственным делом: покупка, продажа, ценообразование и финансы",
		details: {
			overview: `<p>На сервере GreenTech RP вы можете приобрести собственный бизнес и стать предпринимателем. Управление бизнесом открывает возможности для заработка, взаимодействия с игроками и развития собственного дела.</p>
			<p>Управление бизнесом осуществляется через специальное меню, которое вызывается у чекпоинта бизнеса.</p>
			<div style="margin: 16px 0; text-align: center;">
				${renderImage("../images/systems/business/business_menu.png", null, "450px")}
			</div>`,
			
			sections: [
				{
					title: "Закрыть/открыть дверь",
					icon: "fa-door-closed",
					content: `<p>С помощью данного пункта Вы можете закрыть свой бизнес на время. Когда бизнес закрыт, игроки не могут заходить внутрь и пользоваться его услугами.</p>`
				},
				{
					title: "Продажа бизнеса",
					icon: "fa-hand-holding-usd",
					content: `<p>Существует два способа продать бизнес:</p>
					<ul class="info-list">
						<li><strong>Продажа государству</strong> — вы получите 50% от государственной цены бизнеса. Для этого выберите пункт "Продать государству" в меню бизнеса.</li>
					</ul>
					${renderImage("../images/systems/business/sell_to_state.png", null, "450px")}
					<ul class="info-list">
						<li><strong>Продажа другому игроку</strong> — возможна только через нотариуса.</li>
					</ul>
					<p><strong>Как найти нотариуса:</strong> <code>/gps → 19. Найти ближайшего нотариуса</code></p>
					${renderImage("../images/systems/business/notary_gps.png", null, "450px")}
					<p>У нотариуса Вы можете продать свой бизнес другому игроку, либо же обменять на другой бизнес.</p>
					<div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin: 16px 0;">
						${renderImage("../images/systems/business/notary_interior.png", null, "600px")}
						${renderImage("../images/systems/business/notary_menu.png", null, "350px")}
					</div>`,
					commands: [
						{ cmd: "/gps → 19", desc: "Найти ближайшего нотариуса" }
					]
				},
				{
					title: "Установка цен на товары",
					icon: "fa-tags",
					content: `<p>С помощью данного пункта Вы можете установить свои расценки на продаваемый товар. Это позволяет гибко подходить к ценообразованию в зависимости от рыночной ситуации.</p>
					${renderImage("../images/systems/business/set_prices.png", null, "450px")}`,
					steps: [
						"Откройте меню бизнеса через чекпоинт",
						'Выберите пункт "Поставить свои цены"',
						"В появившемся окне введите желаемую цену для каждого товара",
						'Нажмите "Сохранить" для применения изменений'
					]
				},
				{
					title: "Налоги на бизнес",
					icon: "fa-file-invoice-dollar",
					content: `<p>Оплата налогов за бизнес доступна через банковские терминалы (подробнее в разделе "<a href="systems.html#atm" target="_blank" style="color: var(--accent); text-decoration: none; border-bottom: 1px dashed var(--accent);">Система банкоматов</a>").</p>
					<p>Своевременная оплата налогов позволяет избежать штрафов и проблем с бизнесом.</p>`
				},
				{
					title: "Финансы бизнеса (Банк)",
					icon: "fa-university",
					content: `<p>С помощью данного пункта Вы можете узнать баланс Вашего бизнеса и снять с него деньги.</p>
					${renderImage("../images/systems/business/business_bank.png", null, "450px")}`,
					steps: [
						"Откройте меню бизнеса",
						'Выберите пункт "Банк"',
						"Вы увидите текущий баланс бизнеса",
						"Введите сумму для снятия и подтвердите действие"
					]
				},
				{
					title: "Статистика бизнеса",
					icon: "fa-chart-simple",
					content: `<p>С помощью статистики можно получить полную информацию о бизнесе:</p>
					<ul class="info-list">
						<li><strong>Тип бизнеса</strong> — какая деятельность осуществляется</li>
						<li><strong>Банк бизнеса</strong> — текущий баланс на счёте</li>
						<li><strong>Оплаченный налог</strong> — до какой даты оплачен налог</li>
						<li><strong>Количество товара</strong> — остаток товара на складе</li>
						<li><strong>Посетителей за последний час</strong> — статистика посещаемости</li>
					</ul>
					${renderImage("../images/systems/business/business_stats.png", null, "450px")}`,
					commands: [
						{ cmd: "/bizzmenu", desc: "Открыть меню управления бизнесом" }
					]
				}
			]
		}
	},

	    {
        id: "phone",
        name: "Система телефона",
        icon: "fa-mobile-alt",
        color: "#ec4899",
        description: "Звонки, СМС, контакты, электронная почта, GreenShop, BoxBet и оплата штрафов через QR",
        details: {
            overview: `<p>На сервере GreenTech RP имеется полноценная система смартфона, с помощью которой вы можете совершать звонки, отправлять СМС-сообщения, добавлять контакты, пользоваться электронной почтой, проверять автомобили через GreenShop, делать ставки в BoxBet и даже оплачивать штрафы через QR-код.</p>
            <div style="text-align: center; margin: 16px 0;">
                ${renderImage("../images/systems/phone/phone_interface.png", null, "300px")}
            </div>
            <p><strong>Как открыть телефон:</strong> Используйте команду <code>/phone</code> или клавишу U.</p>`,

            sections: [
                {
                    title: "Контакты",
                    icon: "fa-address-book",
                    content: `<p>Приложение "Контакты" позволяет сохранять номера телефонов других игроков для быстрого доступа к звонкам и сообщениям.</p>
                    ${renderImage("../images/systems/phone/contacts_icon.png", null, "300px")}
                    <p><strong>Добавление контакта:</strong></p>
                    <ul class="info-list">
                        <li>Нажмите на иконку приложения «Контакты».</li>
                        <li>В открывшемся приложении нажмите на значок «+» в правом верхнем углу.</li>
                    </ul>
					
					<ul class="info-list">
                        <li>Заполните карточку контакта — введите имя и номер телефона.</li>
                        <li>Нажмите кнопку «Готово» в правом верхнем углу. Контакт будет сохранен.</li>
                    </ul>
					<p>ㅤ</p>
                    <p><strong>Редактирование или удаление контакта:</strong></p>
                    <ul class="info-list">
                        <li>Откройте приложение «Контакты» и выберите нужный контакт.</li>
                        <li>В правом верхнем углу нажмите кнопку «Править».</li>
                        <li>Для редактирования — измените поля и нажмите «Готово».</li>
						<li>Для удаления — нажмите «Удалить контакт» и подтвердите действие.</li>
                    </ul>`
                },
                {
                    title: "СМС сообщения",
                    icon: "fa-envelope",
                    content: `<p>Приложение "Сообщения" позволяет отправлять и получать текстовые сообщения.</p>
                    ${renderImage("../images/systems/phone/sms_icon.png", null, "300px")}
                    <p><strong>Отправка СМС контакту:</strong></p>
                    <ul class="info-list">
                        <li>Откройте приложение «Контакты» и выберите нужный контакт.</li>
                        <li>Нажмите кнопку «Написать».</li>
						<li>Введите текст сообщения и нажмите кнопку отправки.</li>
                    </ul>
					<p>ㅤ</p>
                    <p><strong>Отправка СМС по номеру телефона:</strong></p>
                    <ul class="info-list">
                        <li>Откройте приложение «Сообщения».</li>
                        <li>Нажмите на иконку создания нового сообщения.</li>
                        <li>Введите номер телефона в поле «Кому» и текст сообщения ниже.</li>
						<li>Нажмите кнопку отправки.</li>
                    </ul>`
                },
                {
                    title: "Звонки",
                    icon: "fa-phone-alt",
                    content: `<p>Приложение "Телефон" позволяет совершать голосовые звонки другим игрокам.</p>
					${renderImage("../images/systems/phone/call_icon.png", null, "300px")}
                    <p><strong>Звонок контакту:</strong></p>
                    <ul class="info-list">
                        <li>Откройте приложение «Контакты» и выберите нужный контакт.</li>
                        <li>Нажмите кнопку «Вызов».</li>
						<li>После окончания разговора нажмите красную кнопку завершения вызова.</li>
                    </ul>
					<p>ㅤ</p>
                    <p><strong>Звонок по номеру:</strong></p>
                    <ul class="info-list">
                        <li>Откройте приложение «Телефон».</li>
                        <li>Введите номер телефона на цифровой клавиатуре.</li>
						<li>Нажмите зеленую кнопку вызова.</li>
						<li>После окончания разговора нажмите красную кнопку завершения.</li>
                    </ul>`
                },
                {
                    title: "Электронная почта",
                    icon: "fa-inbox",
                    content: `<p>Электронная почта используется для общения с друзьями, а также для получения писем от органов власти (штрафы, повестки и другие рассылки).</p>
                    ${renderImage("../images/systems/phone/mail_icon.png", null, "300px")}
                    <p><strong>Просмотр входящих писем:</strong></p>
                    <ul class="info-list">
                        <li>Откройте приложение «Электронная почта».</li>
                        <li>Папка «Входящие» открывается автоматически.</li>
						<li>Нажмите на нужное письмо, чтобы прочитать его.</li>
                        <li>Для возврата нажмите «< Входящие».</li>
                    </ul>
					<p>ㅤ</p>
                    <p><strong>Отправка письма:</strong></p>
                    <ul class="info-list">
                        <li>В приложении нажмите кнопку «Написать письмо».</li>
                        <li>Заполните поля: электронная почта получателя, тема (по желанию), текст письма.</li>
                        <li>Нажмите «Отправить» в правом верхнем углу.</li>
						<li>Исходящие письма доступны в разделе «Исходящие».</li>
                    </ul>`
                },
                {
                    title: "GreenShop — проверка автомобиля по VIN",
                    icon: "fa-car",
                    content: `<p>Приложение «GreenShop» предназначено для проверки истории автомобиля перед покупкой. С его помощью можно узнать:</p>
                    <ul class="info-list">
                        <li>Реальный пробег</li>
                        <li>Участие в ДТП</li>
						<li>Ограничения на регистрацию</li>
                        <li>Историю обслуживания</li>
                        <li>Наличие ОСАГО</li>
						<li>Среднюю стоимость автомобиля</li>
						<li>Неоплаченные штрафы</li>
                    </ul>
					${renderImage("../images/systems/phone/greenshop_icon.png", null, "300px")}
                    <ul class="info-list">
                        <li>Нажмите на иконку приложения «GreenShop».</li>
                        <li>Введите VIN номер автомобиля (можно узнать командой <code>/sts [ID]</code>).</li>
                        <li>Нажмите "Поиск" и смотрите полную информацию.</li>
                    </ul>
                    <div style="display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; margin: 16px 0;">
						${renderImage("../images/systems/phone/GreenShop_1.png", null, "400px")}
						${renderImage("../images/systems/phone/GreenShop_2.png", null, "400px")}
						${renderImage("../images/systems/phone/GreenShop_3.png", null, "400px")}
						${renderImage("../images/systems/phone/GreenShop_4.png", null, "400px")}
						${renderImage("../images/systems/phone/GreenShop_5.png", null, "400px")}
					</div>`
                },
                {
                    title: "BoxBet — ставки на матчи",
                    icon: "fa-dice",
                    content: `<p>Приложение «BoxBet» позволяет делать ставки на матчи, а также пополнять и выводить средства со счета.</p>
                    ${renderImage("../images/systems/phone/boxbet_icon.png", null, "300px")}
                    <p><strong>Пополнение счета / вывод средств:</strong></p>
                    <ul class="info-list">
                        <li>Откройте приложение «BoxBet».</li>
                        <li>Нажмите «Пополнить» или «Снять».</li>
						<li>Введите сумму и подтвердите операцию. Деньги спишутся/зачислятся на банковский счет.</li>
                    </ul>
					<p>ㅤ</p>
                    <p><strong>Создание новой ставки:</strong></p>
                    <ul class="info-list">
                        <li>Перейдите на вкладку со списком матчей.</li>
                        <li>Выберите матч и исход: П1 (победа первой команды), П2 (победа второй команды) или Нич.</li>
                        <li>Введите сумму и подтвердите ставку.</li>
                    </ul>
					<p>ㅤ</p>
                    <p><strong>Просмотр своих ставок:</strong></p>
					<ul class="info-list">
						<li>Нажмите на иконку справа снизу.</li>
						<li>Откроется список всех сделанных вами ставок с информацией о статусе.</li>
					</ul>`
                },
                {
                    title: "Оплата штрафов по QR-коду",
                    icon: "fa-qrcode",
                    content: `<p>Вы можете оплатить административный штраф с помощью телефона, отсканировав QR-код из письма на электронной почте.</p>
                    <ul class="info-list">
                        <li>Откройте "Электронную почту", найдите письмо со штрафом.</li>
                        <li>Пролистайте письмо до QR-кода.</li>
                        <li>Отсканируйте QR-код реальным телефоном (через камеру или приложение-сканер).</li>
                        <li>На открывшейся странице нажмите "Оплатить".</li>
                        <li>Дождитесь подтверждения оплаты — деньги спишутся с игрового счета.</li>
						<li>В игре появится уведомление об успешной оплате.</li>
                    </ul>
                    <div class="note-block"><i class="fas fa-info-circle"></i> Для оплаты нужно быть авторизованным в личном кабинете на сайте проекта.</div>`
                }
            ]
        }
    },
	
	{
        id: "vehicle-trade",
        name: "Продажа и обмен ТС между игроками",
        icon: "fa-car-side",
        color: "#ef4444",
        description: "Официальная продажа, покупка и обмен автомобилями с другими игроками через МРЭО ГИБДД",
        details: {
            overview: `<p>На сервере GreenTech RP существует возможность не только покупать транспорт в автосалонах, но и совершать сделки напрямую с другими игроками. Вы можете продать свой автомобиль, купить машину у другого игрока или обменяться транспортными средствами.</p>
            <p>Все законные сделки купли-продажи и обмена транспортными средствами между игроками проводятся исключительно в здании <strong>МРЭО ГИБДД</strong>.</p>
            
            <h4 style="color: var(--accent); margin: 20px 0 10px;">Как найти МРЭО (Переоформление):</h4>
            <ul class="info-list">
                <li>Откройте навигатор: <code>/gps</code></li>
                <li>Выберите раздел: <strong>1. Государственные учреждения</strong></li>
                <li>Выберите пункт: <strong>11. МРЭО (Переоформление)</strong></li>
            </ul>
            
            <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin: 16px 0;">
                ${renderImage("../images/systems/vehicle_trade/mreo_gps_1.png", null, "300px")}
                ${renderImage("../images/systems/vehicle_trade/mreo_gps_2.png", null, "300px")}
            </div>
            
            <p>Здание МРЭО находится у автовокзала в Батырево.</p>
            ${renderImage("../images/systems/vehicle_trade/mreo_exterior.png", null, "600px")}
            
            <h4 style="color: var(--accent); margin: 20px 0 10px;">Процесс оформления:</h4>
            <ul class="info-list">
                <li>Зайдите внутрь здания МРЭО.</li>
                <li>Подойдите к основной стойке и встаньте на чекпоинт.</li>
                <li>Нажмите клавишу <strong>ALT</strong>, чтобы открыть меню оформления.</li>
            </ul>
            ${renderImage("../images/systems/vehicle_trade/mreo_interior.png", null, "600px")}
            
            <div class="note-block">
                <i class="fas fa-info-circle"></i> 
                <strong>Важно!</strong> Перед началом сделки второй игрок (покупатель или участник обмена) должен прописать команду <code>/dogovor [Ваш ID]</code>, чтобы подтвердить готовность к сделке.
            </div>`,
            
            sections: [
                {
                    title: "Продажа автомобиля",
                    icon: "fa-coins",
                    content: `<p>Продажа своего автомобиля другому игроку — самый распространённый тип сделки.</p>
                    <p><strong>Минимальная и максимальная цена автомобиля</strong> указаны на странице со <a href="vehicles.html" target="_blank" style="color: var(--accent);">списком всех автомобилей</a>.</p>
					<p>ㅤ</p>
					<strong>Шаг 1:</strong> В меню МРЭО выберите пункт <strong>«Продажа Т/С»</strong>.
                    ${renderImage("../images/systems/vehicle_trade/mreo_menu.png", null, "400px")}
                    <strong>Шаг 2:</strong> Выберите из списка автомобиль, который хотите продать.
                    ${renderImage("../images/systems/vehicle_trade/sell_select_car.png", null, "400px")}
					<strong>Шаг 3:</strong> Введите ID игрока-покупателя.
					${renderImage("../images/systems/vehicle_trade/sell_enter_id.png", null, "400px")}
					<strong>Шаг 4:</strong> Укажите стоимость продажи.
					${renderImage("../images/systems/vehicle_trade/sell_enter_price.png", null, "400px")}
					<strong>Шаг 5:</strong> Внимательно проверьте все данные сделки и нажмите <strong>«Да»</strong>.
					${renderImage("../images/systems/vehicle_trade/sell_confirm.png",null, "400px")}
					<strong>Шаг 6:</strong> Дождитесь, пока покупатель подтвердит сделку. После подтверждения деньги поступят на ваш счёт, а автомобиль переместится на парковку МРЭО.`,
                },
                {
                    title: "Обмен автомобилями (без доплаты)",
                    icon: "fa-arrows-alt-h",
                    content: `<p>Равноценный обмен автомобилями между двумя игроками.</p>
					<p>ㅤ</p>
					<strong>Шаг 1:</strong> В меню МРЭО выберите пункт <strong>«Обмен Т/С»</strong>.
					${renderImage("../images/systems/vehicle_trade/Obm1.png", null, "400px")}
					<strong>Шаг 2:</strong> Выберите свой автомобиль, который хотите обменять.
					${renderImage("../images/systems/vehicle_trade/Obm2.png", null, "400px")}
					<strong>Шаг 3:</strong> Введите ID игрока, с которым хотите совершить обмен.
					${renderImage("../images/systems/vehicle_trade/Obm3.png", null, "400px")}
					<strong>Шаг 4:</strong> Выберите автомобиль второго игрока, который хотите получить.
					${renderImage("../images/systems/vehicle_trade/Obm4.png", null, "400px")}
					<strong>Шаг 5:</strong> Проверьте детали обмена и нажмите <strong>«Да»</strong>.
					${renderImage("../images/systems/vehicle_trade/Obm5.png", null, "400px")}
					<strong>Шаг 6:</strong> Дождитесь согласия второго игрока. После подтверждения оба автомобиля переместятся на парковку МРЭО.`,
                },
                {
                    title: "Обмен автомобилями с доплатой",
                    icon: "fa-exchange-alt",
                    content: `<p>Если автомобили имеют разную стоимость, один из участников сделки доплачивает другому.</p>
					<p>ㅤ</p>
					<strong>Шаг 1:</strong> В меню МРЭО выберите пункт <strong>«Обмен Т/С»</strong>.",
					${renderImage("../images/systems/vehicle_trade/Obmd1.png", null, "400px")}
					<strong>Шаг 2:</strong> Выберите свой автомобиль.
					${renderImage("../images/systems/vehicle_trade/Obm2.png", null, "400px")}
					<strong>Шаг 3:</strong> Введите ID игрока для обмена.
					${renderImage("../images/systems/vehicle_trade/Obm3.png", null, "400px")}
					<strong>Шаг 4:</strong> Выберите автомобиль второго игрока.
					${renderImage("../images/systems/vehicle_trade/Obm4.png", null, "400px")}
					<strong>Шаг 5:</strong> Введите сумму доплаты.
					${renderImage("../images/systems/vehicle_trade/Obmd5.png", null, "400px")}
					<strong>Шаг 6:</strong> Выберите, кто будет доплачивать: <strong>«Я доплачиваю»</strong> или <strong>«Мне доплачивают»</strong>.
					${renderImage("../images/systems/vehicle_trade/Obmd6.png", null, "400px")}
					<strong>Шаг 7:</strong> Проверьте все данные и нажмите <strong>«Да»</strong>.
					${renderImage("../images/systems/vehicle_trade/Obmd7.png", null, "400px")}
					<strong>Шаг 8:</strong> Дождитесь согласия второго игрока. После подтверждения автомобили переместятся на парковку, а доплата перейдёт соответствующему игроку.`,
                    note: "Будьте внимательны при совершении сделок! Всегда проверяйте ID игрока, стоимость автомобиля и условия обмена перед подтверждением. Администрация не возвращает ошибочно проданные или обменянные автомобили."
                }
            ]
        }
    },
	
	{
        id: "car-dealerships",
        name: "Покупка автомобилей",
        icon: "fa-car",
        color: "#14b8a6",
        description: "Где и как купить машину или лодку: два автосалона, тест-драйв, выбор цвета и оплата",
        details: {
            overview: `<p>Для покупки транспорта на сервере доступны два автосалона, расположенных в Южном и Арзамасе. Здесь вы можете приобрести автомобили, мотоциклы и даже лодки.</p>
            <p><strong>Важно:</strong> Узнать, в каком автосалоне продается конкретный автомобиль, можно на странице со <a href="vehicles.html" target="_blank" style="color: var(--accent);">списком всех автомобилей</a>.</p>`,

            sections: [
                {
                    title: "Автосалон «Южный»",
                    icon: "fa-building",
                    content: `<p>Автосалон в Южном находится рядом с АЗС у Макдональдса. В этом салоне вы можете купить основную часть автомобилей, представленных на сервере, а также мототранспорт.</p>
                    ${renderImage("../images/systems/car-dealerships/dealership_south.png", null, "800px")}
                    <p><strong>Как купить автомобиль в Южном:</strong></p>
                    <ul class="info-list">
                        <li><strong>Шаг 1:</strong> Зайдите внутрь автосалона.</li>
                        <li><strong>Шаг 2:</strong> Подойдите к стойке и нажмите клавишу <strong>ALT</strong>.</li>
                    </ul>
                    ${renderImage("../images/systems/car-dealerships/dealership_south_interior.png", null, "800px")}
                    <ul class="info-list">
                        <li><strong>Шаг 3:</strong> Перед вами откроется меню выбора транспорта.</li>
                    </ul>
                    ${renderImage("../images/systems/car-dealerships/dealership_menu.png", null, "800px")}
                    <ul class="info-list">
                        <li><strong>Шаг 4:</strong> Используйте стрелочки по бокам от названия автомобиля, чтобы выбрать желаемую модель. В меню отображаются основные характеристики.</li>
                        <li><strong>Шаг 5:</strong> Справа выберите желаемый цвет автомобиля.</li>
                        <li><strong>Шаг 6:</strong> Нажмите кнопку <strong>«Тест-драйв»</strong>, чтобы протестировать автомобиль в течение 3-х минут.</li>
                        ${renderImage("../images/systems/car-dealerships/test_drive.png", null, "800px")}
                        <li><strong>Шаг 7:</strong> Чтобы завершить тест-драйв досрочно, нажмите <strong>ALT</strong> и выберите кнопку <strong>«Завершить»</strong>.</li>
                        <li><strong>Шаг 8:</strong> Выбрав автомобиль и цвет, нажмите кнопку <strong>«Купить»</strong>.</li>
                        <li><strong>Шаг 9:</strong> Выберите способ оплаты (наличные или с банковской карты).</li>
                        <li><strong>Шаг 10:</strong> После успешной оплаты автомобиль появится в автосалоне.</li>
                    </ul>`,
					note: "Обратите внимание, в режиме Тест-драйва необходимо соблюдать правила Проекта и не совершать неролевого вождения."
                },
                {
                    title: "Автосалон «Арзамас»",
                    icon: "fa-building",
                    content: `<p>Автосалон в Арзамасе находится рядом с МУ МВД, напротив Набережной. Здесь можно приобрести дорогостоящие автомобили.</p>
                    ${renderImage("../images/systems/car-dealerships/dealership_arzamas.png", null, "800px")}
                    <p><strong>Как купить автомобиль в Арзамасе:</strong></p>
                    <ul class="info-list">
                        <li><strong>Шаг 1:</strong> Зайдите внутрь автосалона.</li>
                        <li><strong>Шаг 2:</strong> Подойдите к стойке и нажмите клавишу <strong>ALT</strong>.</li>
                    </ul>
                    ${renderImage("../images/systems/car-dealerships/dealership_arzamas_interior.png", null, "800px")}
                    <ul class="info-list">
                        <li><strong>Шаг 3:</strong> Выберите пункт <strong>«Автомобили»</strong>.</li>
                    </ul>
                    ${renderImage("../images/systems/car-dealerships/dealership_arzamas_menu.png", null, "450px")}
                     <ul class="info-list">
                        <li><strong>Шаг 4:</strong> Далее процесс идентичен покупке в Южном: выберите авто с помощью стрелок, цвет и нажмите <strong>«Купить»</strong>.</li>
                        <li><strong>Шаг 5:</strong> Для покупки лодки нажмите <strong>«Лодки»</strong> в главном меню и повторите шаги.</li>
                    </ul>
                    ${renderImage("../images/systems/car-dealerships/dealership_arzamas_menu.png", null, "450px")}`
                }
            ]
        }
    },
	
	{
        id: "car-selling",
        name: "Продажа автомобиля (утилизация и скупщик)",
        icon: "fa-hand-holding-usd",
        color: "#f97316", // ← Оранжевый (не используется: у отдыха #f59e0b - другой оттенок)
        description: "Как продать автомобиль: сдать в утилизацию или продать скупщику на Б/У рынке",
        details: {
            overview: `<p>Помимо продажи или обмена автомобиля с другим игроком, на сервере есть два способа быстро продать транспорт государству — сдать в утилизацию или продать специальному скупщику на рынке б/у автомобилей.</p>
            <div class="note-block">
                <i class="fas fa-info-circle"></i> 
                <strong>Важно!</strong> Перед продажей рекомендуется ознакомиться с факторами, влияющими на цену автомобиля.
            </div>`,

            sections: [
                {
                    title: "Сдача автомобиля в утилизацию",
                    icon: "fa-recycle",
                    content: `<p>Пункт приема автомобилей в утилизацию находится на въезде в Батырево со стороны дамбы.</p>
                    ${renderImage("../images/systems/car-selling/utilization_point.png", null, "800px")}
                    
                    <p><strong>Как найти на карте:</strong></p>
                    <ul class="info-list">
                        <li>Введите <code>/gps</code></li>
                        <li>Выберите <strong>4. Прочее</strong></li>
                        <li>Выберите <strong>2. Утилизация авто</strong></li>
                    </ul>
                    <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin: 16px 0;">
                        ${renderImage("../images/systems/car-selling/utilization_gps_1.png", null, "300px")}
                        ${renderImage("../images/systems/car-selling/utilization_gps_2.png", null, "300px")}
                    </div>
                    
                    <div class="note-block">
                        <i class="fas fa-exclamation-triangle"></i> 
                        <strong>Важно!</strong> Сдать в утилизацию можно только автомобили, у которых <strong>БОЛЕЕ 500 километров</strong> пробега. <strong>После утилизации автомобиль назад НЕ ВЕРНУТЬ!</strong>
                    </div>
                    <p>ㅤ</p>
                    <p><strong>Процесс утилизации:</strong></p>
                    <ul class="info-list">
                        <li><strong>Шаг 1:</strong> Заедьте внутрь пункта утилизации.</li>
                        <li><strong>Шаг 2:</strong> Подъедьте на автомобиле к надписи <strong>«Посигнальте, чтобы сдать т/с на утилизацию»</strong>.</li>
                        ${renderImage("../images/systems/car-selling/utilization_checkpoint.png", null, "800px")}
                        <li><strong>Шаг 3:</strong> Находясь на чекпоинте, посигнальте (клавиша <strong>H</strong>).</li>
                        <li><strong>Шаг 4:</strong> У вас высветится окошко с предлагаемой стоимостью автомобиля.</li>
                        ${renderImage("../images/systems/car-selling/utilization_offer.png", null, "800px")}
                        <li><strong>Шаг 5:</strong> Если стоимость устраивает — нажмите <strong>«Принять»</strong>. Автомобиль утилизируется, а вам зачислится указанная сумма.</li>
                        <li><strong>Шаг 6:</strong> Если стоимость не устраивает — нажмите <strong>«Отмена»</strong>.</li>
                    </ul>`
                },
                {
                    title: "Продажа автомобиля скупщику (Б/У рынок)",
                    icon: "fa-hand-holding-usd",
                    content: `<p>Скупщик находится на рынке б/у автомобилей в Батырево напротив автовокзала.</p>
                    <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin: 16px 0;">
                        ${renderImage("../images/systems/car-selling/buyer_market.png", null, "600px")}
                        ${renderImage("../images/systems/car-selling/buyer_location.png", null, "600px")}
                    </div>
                    
                    <p><strong>Как найти на карте:</strong></p>
                    <ul class="info-list">
                        <li>Введите <code>/gps</code></li>
                        <li>Выберите <strong>4. Прочее</strong></li>
                        <li>Выберите <strong>3. БУ Рынок</strong></li>
                    </ul>
                    <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin: 16px 0;">
                        ${renderImage("../images/systems/car-selling/buyer_gps_1.png", null, "300px")}
                        ${renderImage("../images/systems/car-selling/buyer_gps_2.png", null, "300px")}
                    </div>
                    
                    <p><strong>Процесс продажи скупщику:</strong></p>
                    <ul class="info-list">
                        <li><strong>Шаг 1:</strong> Заедьте внутрь рынка.</li>
                        <li><strong>Шаг 2:</strong> Встаньте автомобилем на синий чекпоинт, заглушив двигатель.</li>
                        ${renderImage("../images/systems/car-selling/buyer_checkpoint.png", null, "800px")}
                        <li><strong>Шаг 3:</strong> Чтобы вызвать меню скупщика — посигнальте (клавиша <strong>H</strong>).</li>
                        ${renderImage("../images/systems/car-selling/buyer_menu.png", null, "800px")}
                        <li><strong>Шаг 4:</strong> Ознакомьтесь с предложенной ценой.</li>
                        <li><strong>Шаг 5 (Опционально):</strong> Нажмите кнопку <strong>«Торговаться»</strong>, чтобы попытаться повысить цену.</li>
                        ${renderImage("../images/systems/car-selling/buyer_haggle.png", null, "800px")}
                        <li><strong>Шаг 6:</strong> Если цена устраивает — нажмите <strong>«Продать»</strong>. Скупщик передаст вам деньги.</li>
                        <li><strong>Шаг 7:</strong> Если цена не устраивает — нажмите <strong>«Отказать»</strong>.</li>
                    </ul>
                    
                    <div class="note-block">
                        <i class="fas fa-info-circle"></i> 
                        <strong>Особенности торговли со скупщиком:</strong><br>
                        — Торговаться можно только один раз в 30 минут.<br>
                        — С определенной вероятностью скупщик может повысить, снизить или оставить цену прежней.<br>
                        — После нажатия кнопки «Торговаться» вернуть первоначальную цену нельзя.<br>
                        — Повторно совершить попытку торговли можно через 30 минут.
                    </div>
                    
                    ${renderImage("../images/systems/car-selling/buyer_timeout.png", null, "400px")}
                    
                    <h4 style="color: var(--accent); margin: 20px 0 10px;">Из чего складывается цена автомобиля:</h4>
                    <div style="display: flex; gap: 20px; flex-wrap: wrap; margin-top: 10px;">
                        <div style="flex: 1; background: rgba(46, 164, 79, 0.1); border-left: 3px solid var(--accent); padding: 12px; border-radius: 8px;">
                            <strong style="color: var(--accent);"><i class="fas fa-plus-circle"></i> Повышает стоимость:</strong>
                            <ul style="margin-top: 8px; list-style: none; padding-left: 0;">
                                <li>· Наличие дисков на автомобиле</li>
                                <li>· Наличие покрасочных работ (винил)</li>
                                <li>· Повышенная максимальная скорость</li>
                                <li>· Повышенный разгон автомобиля</li>
                            </ul>
                        </div>
                        <div style="flex: 1; background: rgba(248, 81, 73, 0.1); border-left: 3px solid var(--danger); padding: 12px; border-radius: 8px;">
                            <strong style="color: var(--danger);"><i class="fas fa-minus-circle"></i> Снижает стоимость:</strong>
                            <ul style="margin-top: 8px; list-style: none; padding-left: 0;">
                                <li>· Дальность пробега автомобиля</li>
                                <li>· Износ автомобиля (количество ремонтов)</li>
                                <li>· Техническое состояние (поломки)</li>
                                <li>· Участие автомобиля в ДТП</li>
                            </ul>
                        </div>
                    </div>`
                }
            ]
        }
    },
    {
		id: "sgu",
		name: "СГУ и проблесковые маячки",
		icon: "fa-solid fa-lightbulb",
		color: "#dc2626",
		description: "Управление спецсигналами на патрульных автомобилях: маячки, сирена, мегафон",
		details: {
			overview: `<p>СГУ (Сигнальная громкоговорящая установка) и проблесковые маячки предназначены для использования на служебных автомобилях экстренных служб. Система позволяет подавать звуковые и световые сигналы для обозначения приоритетного проезда и привлечения внимания.</p>
			<div style="margin: 16px 0; text-align: center;">
				${renderImage("../images/systems/sgu/pult.png", null, "300px")}
			</div>
			<p><strong>Как открыть пульт управления:</strong> Нажмите клавишу <kbd>P</kbd> (русская <kbd>З</kbd>), находясь в автомобиле.</p>
			`,
			
			sections: [
				{
					title: "Управление СГУ",
					icon: "fa-gamepad",
					content: `<p>Управление осуществляется с помощью клавиш, когда открыт пульт СГУ:</p>
					<table class="commands-table" style="margin-top: 12px;">
						<thead>
							<tr>
								<th>Клавиша</th>
								<th>Действие</th>
							</tr>
						</thead>
						<tbody>
							<tr><td><kbd>1</kbd></td><td>Кратковременная сирена (завывающая)</td></tr>
							<tr><td><kbd>2</kbd></td><td>Активация проблескового маячка</td></tr>
							<tr><td><kbd>[</kbd> (рус. <kbd>Х</kbd>)</td><td>Переключение режимов маячка вперёд</td></tr>
							<tr><td><kbd>]</kbd> (рус. <kbd>Ъ</kbd>)</td><td>Переключение режимов маячка назад</td></tr>
							<tr><td><kbd>3</kbd></td><td>Кратковременный звуковой сигнал ("крякалка")</td></tr>
							<tr><td><kbd>4</kbd></td><td>Непрерывная сирена</td></tr>
						</tbody>
					</table>
					<p style="margin-top: 12px; color: var(--text-secondary); font-size: 0.85rem;">
						Закрыть пульт СГУ можно повторным нажатием клавиши <kbd>P</kbd>.
					</p>`
				},
				{
					title: "Режимы проблесковых маячков",
					icon: "fa-lightbulb",
					content: `<p>Переключайте режимы маячов клавишами <kbd>[</kbd> и <kbd>]</kbd> (рус. <kbd>Х</kbd> и <kbd>Ъ</kbd>). Все режимы показаны ниже:</p>
					<div style="margin: 16px 0; text-align: center;">
						<video autoplay loop muted playsinline disablePictureInPicture style="width: 100%; max-width: 900px; border-radius: 12px; border: 1px solid var(--border); background: #0a0e14; box-shadow: 0 8px 30px rgba(0,0,0,0.5); pointer-events: none;">
							<source src="../images/systems/sgu/modes.mp4" type="video/mp4">
							<div style="padding: 40px; color: var(--text-secondary);">⚠️ Ваш браузер не поддерживает видео.</div>
						</video>
					</div>`
				},
				{
					title: "Настройка звуков СГУ",
					icon: "fa-music",
					content: `<p>Вы можете изменить звук сирены на свой вкус с помощью команды:</p>
					<div style="background: var(--bg); padding: 12px 16px; border-radius: 8px; margin: 12px 0;">
						<code style="color: var(--accent); font-size: 1rem;">/sgu_sound [номер]</code>
					</div>
					<p>Доступно 3 варианта звуков:</p>
					<ul class="info-list" style="margin: 12px 0;">
						<li>Элина №1</li>
						<li>Элина №2</li>
						<li>Элект</li>
					</ul>
					<p style="margin-top: 12px;">Нажмите на видео, чтобы прослушать звук:</p>
					<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-top: 12px;">
						<div style="background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; padding: 12px; text-align: center;">
							<div style="font-weight: 600; color: #fff; margin-bottom: 8px;">Элина №1</div>
							<video playsinline disablePictureInPicture style="width: 100%; border-radius: 8px; background: #0a0e14; cursor: pointer;" data-sound="1">
								<source src="../images/systems/sgu/sound1.mp4" type="video/mp4">
							</video>
						</div>
						<div style="background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; padding: 12px; text-align: center;">
							<div style="font-weight: 600; color: #fff; margin-bottom: 8px;">Элина №2</div>
							<video playsinline disablePictureInPicture style="width: 100%; border-radius: 8px; background: #0a0e14; cursor: pointer;" data-sound="2">
								<source src="../images/systems/sgu/sound2.mp4" type="video/mp4">
							</video>
						</div>
						<div style="background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; padding: 12px; text-align: center;">
							<div style="font-weight: 600; color: #fff; margin-bottom: 8px;">Элект</div>
							<video playsinline disablePictureInPicture style="width: 100%; border-radius: 8px; background: #0a0e14; cursor: pointer;" data-sound="3">
								<source src="../images/systems/sgu/sound3.mp4" type="video/mp4">
							</video>
						</div>
					</div>`
				}
			]
		}
	}
];

let showingDetail = false;
let currentSystem = null;

function initImageModal() {
    if (document.getElementById('imageModal')) return;
    
    const modal = document.createElement('div');
    modal.id = 'imageModal';
    modal.className = 'image-modal';
    modal.innerHTML = `
        <div class="image-modal-content">
            <button class="image-modal-close">✕</button>
            <img id="modalImage" src="" alt="">
        </div>
        <div class="image-modal-caption" id="modalCaption"></div>
    `;
    document.body.appendChild(modal);
    
    const closeBtn = modal.querySelector('.image-modal-close');
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        modal.classList.remove('active');
        document.body.style.overflow = '';
    });
    
    modal.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

window.openImageModal = (src, caption) => {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const modalCaption = document.getElementById('modalCaption');
    if (modal && modalImg) {
        modalImg.src = src;
        modalCaption.textContent = caption || '';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
};

function renderSystemsGrid(container) {

    initImageModal();
    
    const systemIdFromURL = getSystemIdFromURL();

    if (systemIdFromURL) {
        const system = SYSTEMS_DATA.find(s => s.id === systemIdFromURL);
        if (system) {
            showingDetail = true;
            currentSystem = system;
            renderSystemDetail(container, system);
            return;
        }
        window.location.hash = '';
    }

    const cardsHtml = SYSTEMS_DATA.map(system => `
        <div class="system-card" data-system-id="${system.id}">
            <div class="system-card-icon" style="
                background: ${system.color}20;
                width: 70px;
                height: 70px;
                border-radius: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 18px;
            ">
                <i class="fas ${system.icon}" style="font-size: 34px; color: ${system.color};"></i>
            </div>
            <h3 class="system-card-title" style="color: #fff; margin-bottom: 12px; font-size: 1.1rem; font-weight: 600;">${escapeHtml(system.name)}</h3>
            <p class="system-card-description" style="color: var(--text-secondary); font-size: 0.85rem; line-height: 1.5;">${escapeHtml(system.description)}</p>
        </div>
    `).join('');
    
    container.innerHTML = `
        <h1 class="page-title">Системы сервера</h1>
        <p class="page-subtitle">Все игровые механики и возможности GreenTech RolePlay</p>
        
        <div class="info-block" style="margin-bottom: 32px;">
            <p>На сервере GreenTech RP реализовано множество уникальных систем, которые делают игровой процесс максимально реалистичным и увлекательным. Нажмите на любую карточку, чтобы узнать подробности о системе, её возможностях и командах.</p>
        </div>
        
        <div class="systems-grid" id="systemsGrid">
            ${cardsHtml}
        </div>
    `;
    
    // Эффект свечения при движении мыши
    const cards = container.querySelectorAll('.system-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--mouse-x', `${x}%`);
            card.style.setProperty('--mouse-y', `${y}%`);
        });
    });
    
    attachSystemCardHandlers(container);
}

// Рендер детальной информации
function renderSystemDetail(container, system) {
     if (!system) return;

    updateURLForSystem(system.id);
    
    const sectionsHtml = system.details.sections.map(section => {
        // Команды
        let commandsHtml = '';
        if (section.commands && section.commands.length > 0) {
            commandsHtml = `
                <div style="margin-top: 16px;">
                    <strong><i class="fas fa-terminal"></i> Команды:</strong>
                    <table class="commands-table" style="margin-top: 8px;">
                        <tbody>
                            ${section.commands.map(cmd => `
                                <tr>
                                    <td>${escapeHtml(cmd.cmd)}</td>
                                    <td>${escapeHtml(cmd.desc)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }
        
        // Шаги с фото
        let stepsHtml = '';
        if (section.steps && section.steps.length > 0) {
            stepsHtml = `
                <div style="margin-top: 16px;">
                    <strong><i class="fas fa-shoe-prints"></i> Как получить:</strong>
                    <div style="margin-top: 12px;">
                        ${section.steps.map(step => {
                            if (step.startsWith("<div")) {
                                return step;
                            }
                            return `<div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;"><i class="fas fa-arrow-right" style="color: var(--accent); margin-top: 3px;"></i> <span>${step}</span></div>`;
                        }).join('')}
                    </div>
                </div>
            `;
        }
        
        // Локации с фото
        let locationsHtml = '';
        if (section.locations && section.locations.length > 0) {
            locationsHtml = `
                <div style="margin-top: 16px;">
                    <strong><i class="fas fa-map-marker-alt"></i> Расположение офисов:</strong>
                    <div class="locations-grid">
                        ${section.locations.map(loc => `
                            <div class="location-card">
                                <strong>${escapeHtml(loc.city)}</strong>
                                <div>${escapeHtml(loc.desc)}</div>
                                <img src="${loc.image}" alt="${escapeHtml(loc.city)}" style="width: 100%; border-radius: 8px; margin-top: 8px; cursor: pointer;" onclick="openImageModal('${loc.image}', '${escapeHtml(loc.city)} - вид снаружи')" onerror="this.style.display='none'">
                                <img src="${loc.mapImage}" alt="${escapeHtml(loc.city)} карта" style="width: 100%; border-radius: 8px; margin-top: 8px; cursor: pointer;" onclick="openImageModal('${loc.mapImage}', '${escapeHtml(loc.city)} - расположение на карте')" onerror="this.style.display='none'">
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        // Дополнительный шаг
        let extraStepHtml = '';
        if (section.extraStep) {
            extraStepHtml = `<div style="margin-top: 12px;">${section.extraStep}</div>`;
        }
        
        // Заметка
        let noteHtml = '';
        if (section.note) {
            noteHtml = `<div class="note-block"><i class="fas fa-info-circle"></i> ${escapeHtml(section.note)}</div>`;
        }
        
        return `
            <div class="system-section">
                <h3><i class="fas ${section.icon}"></i> ${escapeHtml(section.title)}</h3>
                <div>${section.content}</div>
                ${commandsHtml}
                ${stepsHtml}
                ${locationsHtml}
                ${extraStepHtml}
                ${noteHtml}
            </div>
        `;
    }).join('');
    
    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
            <button class="back-button" id="backToSystemsBtn">
                <i class="fas fa-arrow-left"></i> Назад к списку систем
            </button>
        </div>
        
        <div class="system-detail-card">
            <div class="system-detail-header">
                <div class="system-detail-title">
                    <div class="system-detail-icon" style="background: ${system.color}20;">
                        <i class="fas ${system.icon}" style="color: ${system.color}; font-size: 32px;"></i>
                    </div>
                    <div class="system-detail-name">${escapeHtml(system.name)}</div>
                </div>
                <div class="system-detail-desc">${escapeHtml(system.description)}</div>
            </div>
            
            <div class="system-detail-body">
                <div class="system-section">
                    <h3><i class="fas fa-info-circle"></i> Обзор</h3>
                    <div>${system.details.overview}</div>
                </div>
                
                ${sectionsHtml}
            </div>
        </div>
    `;
    
    const backBtn = document.getElementById('backToSystemsBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            showingDetail = false;
            currentSystem = null;
            updateURLForSystem(null); 
            renderSystemsGrid(container);
        });
    }
    
    const shareBtn = document.getElementById('shareSystemBtn');
    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            const shareUrl = window.location.href;
            try {
                if (navigator.share) {
                    await navigator.share({
                        title: system.name,
                        text: `Информация о системе "${system.name}" на GreenTech RP`,
                        url: shareUrl
                    });
                } else {
                    await navigator.clipboard.writeText(shareUrl);
                    const originalText = shareBtn.innerHTML;
                    shareBtn.innerHTML = '<i class="fas fa-check"></i> Ссылка скопирована!';
                    setTimeout(() => {
                        shareBtn.innerHTML = originalText;
                    }, 2000);
                }
            } catch (err) {
                console.log('Ошибка при попытке поделиться:', err);
            }
        });
    }
}

function attachSystemCardHandlers(container) {
    const cards = container.querySelectorAll('.system-card');
    cards.forEach(card => {
        const newCard = card.cloneNode(true);
        card.parentNode.replaceChild(newCard, card);
        
        newCard.addEventListener('click', () => {
            const systemId = newCard.dataset.systemId;
            const system = SYSTEMS_DATA.find(s => s.id === systemId);
            if (system) {
                showingDetail = true;
                currentSystem = system;
                updateURLForSystem(systemId);
                renderSystemDetail(container, system);
            }
        });
    });
}

function initHashChangeListener(container) {
    window.addEventListener('hashchange', () => {
        const systemId = getSystemIdFromURL();
        
        if (systemId) {
            const system = SYSTEMS_DATA.find(s => s.id === systemId);
            if (system && (!showingDetail || currentSystem?.id !== systemId)) {
                showingDetail = true;
                currentSystem = system;
                renderSystemDetail(container, system);
            }
        } else if (showingDetail) {
            showingDetail = false;
            currentSystem = null;
            renderSystemsGrid(container);
        }
    });
}

// Запуск
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('systemsContent');
    if (container) {
        renderSystemsGrid(container);
        initHashChangeListener(container);
    }
});

function getSystemIdFromURL() {
    const hash = window.location.hash.substring(1); 
    if (hash) {
        return hash;
    }
    return null;
}

function updateURLForSystem(systemId) {
    if (systemId) {
        window.location.hash = systemId; 
    } else {
        window.location.hash = '';
    }
}


document.addEventListener('click', function(e) {
    const video = e.target.closest('video[data-sound]');
    if (!video) return;
    
    // Находим все видео с data-sound и их родительские контейнеры
    const allSoundVideos = document.querySelectorAll('video[data-sound]');
    
    // Сбрасываем подсветку и превью у всех видео
    allSoundVideos.forEach(v => {
        const parent = v.closest('div[style*="background: var(--card-bg)"]');
        if (parent) {
            parent.style.border = '1px solid var(--border)';
            parent.style.boxShadow = 'none';
        }
        if (v !== video) {
            v.pause();
            v.currentTime = 0;
            // Не используем load() - просто сбрасываем время
        }
    });
    
    // Запускаем или останавливаем текущее
    const parent = video.closest('div[style*="background: var(--card-bg)"]');
    if (video.paused) {
        video.play().catch(e => console.log('Ошибка воспроизведения:', e));
        // Подсвечиваем зелёным
        if (parent) {
            parent.style.border = '2px solid var(--accent)';
            parent.style.boxShadow = '0 0 20px rgba(46, 164, 79, 0.3)';
        }
    } else {
        video.pause();
        // Снимаем подсветку
        if (parent) {
            parent.style.border = '1px solid var(--border)';
            parent.style.boxShadow = 'none';
        }
        // Сбрасываем на первый кадр без перезагрузки
        video.currentTime = 0;
    }
});

// Обработчик окончания видео
document.addEventListener('ended', function(e) {
    const video = e.target.closest('video[data-sound]');
    if (!video) return;
    
    const parent = video.closest('div[style*="background: var(--card-bg)"]');
    if (parent) {
        parent.style.border = '1px solid var(--border)';
        parent.style.boxShadow = 'none';
    }
    // Сбрасываем на первый кадр без перезагрузки
    video.currentTime = 0;
}, true);