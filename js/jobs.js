function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function formatDurationFromSeconds(seconds) {
    if (seconds < 60) {
        return `${seconds} сек`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds === 0) {
        return `${minutes} мин`;
    }
    return `${minutes} мин ${remainingSeconds} сек`;
}

const JOBS_DATA = [
    {
        id: 'logging',
        name: 'Лесоповал',
        icon: 'fa-tree',
        shortDesc: 'Заготовка древесины в лесу.',
        fullDesc: 'Лесоповал — это тяжёлая физическая работа по заготовке древесины. Вы будете работать в лесу, валить деревья, распиливать их и готовить к вывозу. Работа требует хорошей физической подготовки и выносливости.',
        requirements: '',
        city: 'ЮКАД-2',
        level: 1,
        commands: [],
        salary: 'зависит от выработки',
        image: 'logging.png',
        salaryData: {
            default: { name: 'Лесоруб', time: 25, pay: 120 }
        },
        howToWork: `
            <p>Для трудоустройства Вам нужно прибыть на лесоповал.</p>
            <p><strong>Навигация на карте:</strong> <code>/gps → 2. Работы → 3. Лесоповал</code></p>
            <p>Лесоповал находится в лесах недалеко от ЮКАД-2.</p>

            <h4 style="color: var(--accent); margin: 16px 0 8px;">Принцип работы:</h4>
            
            <p><strong>Шаг 1:</strong> Для трудоустройства зайдите в вагончик, который находится на въезде.</p>
            <p><strong>Шаг 2:</strong> Внутри вагончика встаньте на пикап, нажмите <strong>ALT</strong> и выберите «Устроиться».</p>
            <p><strong>Шаг 3:</strong> После трудоустройства Вам нужно подойти к любому свободному дереву и нажать <strong>ALT</strong>.</p>
            <p><strong>Шаг 4:</strong> Дождитесь, пока дерево будет спилено и упадет, после подойдите к чекпоинту в виде пилы, затем нажмите <strong>ALT</strong>.</p>
            <p><strong>Шаг 5:</strong> Пройдите мини-игру по очистке ствола дерева от веток, нажимая <strong>ЛКМ</strong> по участкам веток.</p>
            <p><strong>Шаг 6:</strong> После окончания мини-игры перейдите к следующему дереву и продолжайте работать.</p>
            <p><strong>Шаг 7:</strong> Чтобы получить вознаграждение за работу - встаньте на пикап трудоустройства и увольтесь.</p>
        `
    },
    {
        id: 'miner',
        name: 'Шахтёр',
        icon: 'fa-hard-hat',
        shortDesc: 'Добыча полезных ископаемых в шахте.',
        fullDesc: 'Вы будете работать в шахте, устранять неполадки и добаывать руду. В зависимости от выбранной специальности, процесс и оплата труда отличаются.',
        requirements: '',
        city: 'Трасса Арзамас — Батырево',
        level: 1,
        commands: [],
        salary: 'зависит от специальности',
        image: 'miner.png',
        salaryData: {
            slesar: { name: 'Слесарь', time: 40, pay: 400 },
            electroslesar: { name: 'Электрослесарь', time: 44, pay: 400 },
            prohodchik: { name: 'Проходчик', time: 35, pay: 450 },
            kombayner: { name: 'Комбайнер', time: 60, pay: 532 }
        },
        howToWork: `
            <p>Для трудоустройства на шахту вам необходимо добраться до неё. Шахта находится на трассе Арзамас — Батырево.</p>
            <p><strong>Навигация на карте:</strong> <code>/gps → 2. Работы → 14. Шахта</code></p>

            <h4 style="color: var(--accent); margin: 16px 0 8px;">Принцип работы:</h4>
            <p>Зайдите в здание шахты. Внутри раздевалки встаньте на пикап, нажмите <strong>ALT</strong> и выберите «Устроиться». Затем выберите направление, в котором хотите работать. После трудоустройства зайдите в соседнюю комнату и спуститесь в шахту на лифте.</p>

            <details style="margin-top: 16px;">
                <summary style="cursor: pointer; color: var(--accent); font-weight: 600; padding: 8px 0;">Слесарь</summary>
                <div style="margin-top: 12px; padding-left: 20px; border-left: 2px solid var(--accent);">
                    <p>Во время работы слесарем вам будут поступать заявки на ремонт лопнувших труб вдоль шахты. Встаньте на чекпоинт поломки и устраните неисправность.</p>
                    <p><strong>Оплата:</strong> За каждую устранённую неисправность вы получаете вознаграждение.</p>
                </div>
            </details>

            <details style="margin-top: 16px;">
                <summary style="cursor: pointer; color: var(--accent); font-weight: 600; padding: 8px 0;">Электрослесарь</summary>
                <div style="margin-top: 12px; padding-left: 20px; border-left: 2px solid var(--accent);">
                    <p>Во время работы электрослесарем вам будут поступать заявки на ремонт повреждённых кабелей вдоль шахты. Встаньте на чекпоинт поломки и устраните неисправность.</p>
                    <p><strong>Оплата:</strong> За каждую устранённую неисправность вы получаете вознаграждение.</p>
                </div>
            </details>

            <details style="margin-top: 16px;">
                <summary style="cursor: pointer; color: var(--accent); font-weight: 600; padding: 8px 0;">Проходчик</summary>
                <div style="margin-top: 12px; padding-left: 20px; border-left: 2px solid var(--accent);">
                    <p>Во время работы проходчиком вам нужно добывать уголь и погружать его в вагонетки. Придите на метку и с помощью клавиши <strong>ALT</strong> начните добычу угля. После этого возьмите лопату и загрузите уголь в вагонетку с помощью клавиши <strong>ALT</strong>.</p>
                    <p><strong>Оплата:</strong> За каждую загруженную партию угля вы получаете вознаграждение.</p>
                </div>
            </details>

            <details style="margin-top: 16px;">
                <summary style="cursor: pointer; color: var(--accent); font-weight: 600; padding: 8px 0;">Комбайнер</summary>
                <div style="margin-top: 12px; padding-left: 20px; border-left: 2px solid var(--accent);">
                    <p>Во время работы комбайнером вам нужно с помощью комбайна добывать уголь и загружать его. Придите на метку и с помощью клавиши <strong>ALT</strong> начните управление комбайном. С помощью <strong>ЛКМ</strong> управляйте комбайном (кнопки «Вперёд» и «Назад»). После того как уголь будет добыт, возьмите лопату, стоящую у стены, и погрузите добытый уголь в вагонетку.</p>
                    <p><strong>Оплата:</strong> За каждую загруженную партию угля вы получаете вознаграждение.</p>
                </div>
            </details>
        `
    },
    {
        id: 'sawmill',
        name: 'Пилорама',
        icon: 'fa-industry',
        shortDesc: 'Переработка древесины на пилораме.',
        fullDesc: 'Работа на пилораме — это переработка древесины, полученной с лесоповала. Вы будете работать на пилораме, распиливать брёвна на доски и другие пиломатериалы. Работа требует внимательности и умения обращаться с оборудованием.',
        requirements: '',
        city: 'Трасса Арзамас — Батырево',
        level: 1,
        commands: [],
        salary: 'зависит от выработки',
        image: 'sawmill.png',
        salaryData: {
            default: { 
                name: 'Рабочий пилорамы', 
                time: 87, 
                pay: 1140
            }
        },
        howToWork: `
            <p>Для трудоустройства на пилораму Вам нужно прибыть туда.</p>
            <p><strong>Навигация на карте:</strong> <code>/gps → 2. Работы → 4. Пилорама</code></p>
            <p>Пилорама находится на трассе Арзамас — Батырево.</p>

            <h4 style="color: var(--accent); margin: 16px 0 8px;">Принцип работы:</h4>
            
            <p><strong>Шаг 1:</strong> Для трудоустройства зайдите в ангар, после чего зайдите в раздевалку.</p>
            <p><strong>Шаг 2:</strong> Внутри раздевалки встаньте на пикап, нажмите <strong>ALT</strong> и выберите «Работа на конвейере».</p>
            <p><strong>Шаг 3:</strong> Затем выберите «Устроиться».</p>
            <p><strong>Шаг 4:</strong> После трудоустройства подойдите к свободному конвейеру и нажмите <strong>ALT</strong>.</p>
            <p><strong>Шаг 5:</strong> После того, как на конвейере появится ствол дерева, двигайтесь вдоль конвейера и на каждом этапе нажимайте <strong>ALT</strong>. На первом этапе выберите тип обрезки.</p>
            <p><strong>Шаг 6:</strong> После окончания распила ствола - вернитесь в начало конвейера и начните распил снова.</p>
            <p><strong>Шаг 7:</strong> Чтобы получить вознаграждение за работу - встаньте на пикап трудоустройства и увольтесь.</p>
            
            <div style="margin-top: 12px; padding: 12px 16px; background: rgba(46, 164, 79, 0.08); border-left: 3px solid var(--accent); border-radius: 8px;">
                <i class="fas fa-info-circle" style="color: var(--accent); margin-right: 8px;"></i>
                <span style="color: var(--text-secondary); font-size: 0.85rem;">
                    За время работы Вам случайным образом выпадает одна из трёх требуемых длин досок:<br>
                    <strong>3 см</strong> — 900 ₽<br>
                    <strong>5 см</strong> — 1170 ₽<br>
                    <strong>8 см</strong> — 1350 ₽
                </span>
            </div>
        `
    },
    {
        id: 'loggers',
        name: 'Водитель лесовоза',
        icon: 'fa-tree',
        shortDesc: 'Перевозка леса и древесины на специальном транспорте.',
        fullDesc: 'Работа водителя лесовоза связана с перевозкой леса и древесины. Вы будете работать на специальном транспорте, перевозить лес с лесоповала на пилораму и обратно. Работа требует аккуратности и знания маршрутов.',
        requirements: 'Водительские права категории D',
        city: 'пгт. Бусаево',
        level: 1,
        commands: [
            { cmd: '/dl', desc: 'Узнать ID прицепа' },
            { cmd: '/towncar [ID]', desc: 'Прицепить прицеп к лесовозу' }
        ],
        salary: 'зависит от выработки',
        image: 'loggers.png',
        salaryData: {
            default: { name: 'Водитель лесовоза', time: 141, pay: 1100 }
        },
        showMeasurementNote: true,
        howToWork: `
            <p>Для трудоустройства в качестве водителя лесовоза Вам необходимо приехать на базу лесовозов.</p>
            <p><strong>Навигация на карте:</strong> <code>/gps → 2. Работы → 5. Водитель лесовоза</code></p>
            <p>База лесовозов находится в пгт. Бусаево, недалеко от штрафстоянки ГИБДД.</p>

            <h4 style="color: var(--accent); margin: 16px 0 8px;">Принцип работы:</h4>
            
            <p><strong>Шаг 1:</strong> Для трудоустройства зайдите в вагончик, который находится на въезде на базу.</p>
            <p><strong>Шаг 2:</strong> Внутри вагончика встаньте на пикап, нажмите <strong>ALT</strong> и выберите «Устроиться».</p>
            <p><strong>Шаг 3:</strong> После трудоустройства сядьте в любой из доступных лесовозов.</p>
            <p><strong>Шаг 4:</strong> Вам нужно закрепить прицеп, для этого задним ходом подъедьте к нему, введите команду <code>/dl</code>.</p>
            <p><strong>Шаг 5:</strong> После этого введите <code>/towncar [ID прицепа]</code> (ID прицепа Вы увидите после ввода команды <code>/dl</code>).</p>
            <p><strong>Шаг 6:</strong> Затем вновь введите команду <code>/dl</code>, чтобы убрать лишние надписи и двигайтесь на лесоповал.</p>
            <p><strong>Шаг 7:</strong> Введите <code>/gps → 2. Работы → 3. Лесоповал</code>.</p>
            <p><strong>Шаг 8:</strong> Приехав туда, встаньте на чекпоинт и посигнальте. Бревна загрузятся в лесовоз.</p>
            <p><strong>Шаг 9:</strong> После этого вернитесь на базу лесовозов, чтобы разгрузить бревна.</p>
            <p><strong>Шаг 10:</strong> На базе лесовозов встаньте на чекпоинт «Точка разгрузки» и посигнальте. Бревна разгрузятся.</p>
            <p><strong>Шаг 11:</strong> Если желаете продолжить работу — двигайтесь вновь на лесоповал.</p>
            
            <div style="margin-top: 12px; padding: 12px 16px; background: rgba(46, 164, 79, 0.08); border-left: 3px solid var(--accent); border-radius: 8px;">
                <i class="fas fa-info-circle" style="color: var(--accent); margin-right: 8px;"></i>
                <span style="color: var(--text-secondary); font-size: 0.85rem;">
                    <strong>Важно:</strong><br>
                    • Для получения прицепления прицепа требуется <strong>500 очков опыта</strong> на работе.<br>
                    • За одну доставку Вы получаете <strong>+2 очка опыта</strong>.<br>
                </span>
            </div>
        `
    },
    {
        id: 'fuel_truck',
        name: 'Водитель бензовоза',
        icon: 'fa-gas-pump',
        shortDesc: 'Доставка топлива на АЗС.',
        fullDesc: 'Работа водителя бензовоза связана с доставкой топлива на автозаправочные станции. Вы будете перевозить опасный груз, поэтому требуется особая осторожность и внимание. Работа высокооплачиваемая, но опасная.',
        requirements: 'Водительские права категории C',
        city: 'Нефтезавод, Арзамас',
        level: 1,
        commands: [
        ],
        salary: 'зависит от выработки',
        image: 'fuel_truck.png',
        salaryData: {
            default: { name: 'Водитель бензовоза', time: 300, pay: 6200 }
        },
        howToWork: `
            <p>Для трудоустройства в качестве водителя бензовоза Вам необходимо приехать на базу бензовозов.</p>
            <p><strong>Навигация на карте:</strong> <code>/gps → 2. Работы → 12. База бензовозов</code></p>
            <p>База бензовозов находится на нефтезаводе вблизи Ж/Д Вокзала Арзамаса.</p>

            <h4 style="color: var(--accent); margin: 16px 0 8px;">Принцип работы:</h4>
            
            <p><strong>Шаг 1:</strong> Для трудоустройства подойдите на соответствующий пикап со значком одежды.</p>
            <p><strong>Шаг 2:</strong> Встаньте на него, нажмите <strong>ALT</strong> и выберите «Устроиться».</p>
            <p><strong>Шаг 3:</strong> После трудоустройства подойдите на соседний пикап с информацией и примите заказ на доставку топлива.</p>
            <p><strong>Шаг 4:</strong> Сядьте в любой свободный бензовоз, после подъедьте к месту заправки топливом.</p>
            <p><strong>Шаг 5:</strong> Посигнальте и выберите тип топлива, который хотите заправить в цистерну.</p>
            <p><strong>Шаг 6:</strong> После этого двигайтесь на АЗС, для которой выполняете заказ.</p>
            <p><strong>Шаг 7:</strong> Находясь у АЗС, подъедьте на чекпоинт и посигнальте, чтобы разгрузить топливо.</p>
            <p><strong>Шаг 8:</strong> После разгрузки Вы получите оплату за доставку. Для повторного заказа вернитесь на базу.</p>
        `
    },
    {
        id: 'bus',
        name: 'Водитель автобуса',
        icon: 'fa-bus',
        shortDesc: 'Перевозка пассажиров по городским маршрутам.',
        fullDesc: 'Работа водителем автобуса — это ответственная и востребованная профессия. Вы будете перевозить пассажиров по установленным маршрутам, строго следуя расписанию и правилам дорожного движения.',
        requirements: 'Паспорт гражданина РФ, Водительское удостоверение с категорией D, Наличие мобильного телефона',
        city: 'Арзамас, Южный',
        level: 1,
        commands: [
            { cmd: '/busstart', desc: 'Начать смену или выбрать маршрут' }
        ],
        salary: 'от 40 000 ₽ за смену',
        image: 'bus.png',
        salaryData: {
            paz: { 
                name: 'ПАЗ-3205', 
                routes: [
                    { name: 'Южный → Батырево → Южный', time: 513, pay: 14800 },
                    { name: 'Южный → Малиновка → Южный', time: 636, pay: 6770 },
                    { name: 'Арзамас → Батырево → Арзамас', time: 500, pay: 13500 }
                ]
            },
            nefaz: { 
                name: 'НЕФАЗ', 
                routes: [
                    { name: 'Южный → Арзамас → Нижегородск → Арзамас → Южный', time: 824, pay: 15800 },
                    { name: 'Южный → Батырево → Арзамас → Батырево → Южный', time: 740, pay: 15500 },
                    { name: 'Арзамас → Эдово → Нижегородск → Эдово → Арзамас', time: 628, pay: 12000 }
                ]
            },
			maz: {
				name: 'МАЗ', 
				routes: [
					{ name: 'Арзамас → Нижегородск → Арзамас', time: 722, pay: 14300 },
					{ name: 'Южный → Арзамас → Южный', time: 1020, pay: 14600 },
					{ name: 'Южный → Нижегородск → Южный', time: 958, pay: 10500 },
					{ name: 'Южный → Эдово → Южный', time: 972, pay: 12400 }
				]
			},
			liaz: {
				name: 'Лиаз', 
				routes: [
					{ name: '[Арз] Автовокзал → Парк Горького → Автовокзал', time: 461, pay: 13100 },
					{ name: '[Арз] Автовокзал → Угольная шахта → Автовокзал', time: 390, pay: 10700 },
					{ name: '[Арз] Автовокзал → Ж/Д вокзал → Автовокзал', time: 510, pay: 9500 },
					{ name: '[Арз] Ж/Д вокзал → Угольная шахта → Ж/Д вокзал', time: 379, pay: 12500 },
					{ name: '[Южн] Автовокзал → АТП №2 → Автовокзал', time: 387, pay: 13700 }
				]
			},
        },
        howToWork: `
            <h4 style="color: var(--accent); margin: 16px 0 8px;">Как устроиться:</h4>
            <p><strong>Шаг 1:</strong> Прибыть в МФЦ <em>"Мои документы"</em>.</p>
            <p><strong>Шаг 2:</strong> В меню трудоустройства выбрать <strong>"Водитель автобуса"</strong>.</p>
            <p><strong>Шаг 3:</strong> Убедиться, что Вы подходите по требованиям, и нажать кнопку <strong>"Принять"</strong>.</p>

            <h4 style="color: var(--accent); margin: 16px 0 8px;">Начало работы:</h4>
            <p><strong>Шаг 1:</strong> Введите <code>/gps → 2. Работы → 2. Водитель автобуса (Южный)</code> или <code>16. Водитель автобуса (Арзамас)</code>.</p>
            <p><strong>Шаг 2:</strong> Прибудьте в АТП (Автотранспортное предприятие) по указанной на карте отметке.</p>
            <p><strong>Шаг 3:</strong> Встаньте на чекпоинт у входа в главное здание и выберите <strong>"Рабочая одежда"</strong>.</p>
            <p><strong>Шаг 4:</strong> После переодевания выберите автобус — от этого выбора зависит доступные маршруты.</p>
            <p><strong>Шаг 5:</strong> Вас автоматически переместит в выбранный автобус. Введите <code>/busstart</code> и выберите маршрут.</p>

            <h4 style="color: var(--accent); margin: 16px 0 8px;">Принцип работы:</h4>
            <p>Во время движения по маршруту следуйте по чекпоинтам. В конце маршрута введите <code>/busstart</code> и выберите следующий маршрут, если желаете продолжить работу.</p>
            
            <div style="margin-top: 12px; padding: 12px 16px; background: rgba(46, 164, 79, 0.08); border-left: 3px solid var(--accent); border-radius: 8px;">
                <i class="fas fa-info-circle" style="color: var(--accent); margin-right: 8px;"></i>
                <span style="color: var(--text-secondary); font-size: 0.85rem;">
                    <strong>Важно:</strong> Автотранспортные предприятия расположены в двух городах: <strong>Арзамас</strong> и <strong>Южный</strong>.
                </span>
            </div>
        `
    },
	{
		id: 'delivery',
		name: 'Развозчик товара',
		icon: 'fa-shopping-cart',
		shortDesc: 'Доставка товаров по магазинам и торговым точкам',
		fullDesc: 'Работа развозчика товара — это доставка товаров из распределительных центров в магазины и торговые точки. Вы будете работать на фургоне, развозить различные товары. Работа требует хорошего знания города и пунктуальности.',
		requirements: 'Паспорт гражданина РФ, Водительские права категории C, Отсутствие работы',
		city: 'п. Люблино',
		level: 1,
		salary: 'зависит от количества доставленных ящиков',
		image: 'delivery.png',
		salaryData: {
			default: { name: 'Развозчик товара', time: 1072, pay: 18900 }
		},
		howToWork: `
			<p>Для трудоустройства в качестве развозчика товара Вам необходимо приехать в <strong>МФЦ "Мои документы"</strong> и выбрать в меню трудоустройства <strong>"Развозчик товара"</strong>.</p>
			<p>Убедитесь, что Вы подходите по требованиям, и нажмите кнопку <strong>"Принять"</strong>.</p>

			<h4 style="color: var(--accent); margin: 16px 0 8px;">Начало работы:</h4>
			
			<p><strong>Шаг 1:</strong> После успешного трудоустройства введите <code>/gps → 2. Работы → 6. База развозчиков товара</code>.</p>
			<p><strong>Шаг 2:</strong> База развозчиков товара находится у поселка <strong>Люблино</strong> на трассе Арзамас-Нижегородск.</p>
			<p><strong>Шаг 3:</strong> Для начала работы подойдите к ангару, встаньте на чекпоинт и нажмите <strong>ALT</strong>.</p>
			
			<h4 style="color: var(--accent); margin: 16px 0 8px;">Принцип работы:</h4>
			
			<p><strong>Шаг 1:</strong> В меню выберите <strong>"Заказы"</strong> и ознакомьтесь со списком заказов.</p>
			<p><strong>Шаг 2:</strong> Выберите <strong>"Принять заказ"</strong> и введите номер заказа, который хотите доставить.</p>
			<p><strong>Шаг 3:</strong> Возьмите доступный рабочий транспорт, который находится за складом.</p>
			<p><strong>Шаг 4:</strong> Выберите тип груза, который будете доставлять.</p>
			<p><strong>Шаг 5:</strong> Заедьте на транспорте в ангар для загрузки товара.</p>
			<p><strong>Шаг 6:</strong> Подойдите к стеллажу, нажмите <strong>ALT</strong> и возьмите ящик, затем подойдите к задней части автомобиля, нажмите <strong>ALT</strong> и загрузите ящик. <strong>Повторяйте до полной загрузки транспорта.</strong></p>
			<p><strong>Шаг 7:</strong> После полной загрузки выдвигайтесь на чекпоинт бизнеса, которому доставляете заказ.</p>
			<p><strong>Шаг 8:</strong> Припаркуйте транспорт в удобном месте, подойдите к задней части, нажмите <strong>ALT</strong>, чтобы взять коробку. Затем подойдите к месту разгрузки и нажмите <strong>ALT</strong>, чтобы оставить ящик. <strong>Повторяйте до полной разгрузки.</strong></p>
			
			<div style="margin-top: 12px; padding: 12px 16px; background: rgba(46, 164, 79, 0.08); border-left: 3px solid var(--accent); border-radius: 8px;">
				<i class="fas fa-info-circle" style="color: var(--accent); margin-right: 8px;"></i>
				<span style="color: var(--text-secondary); font-size: 0.85rem;">
					<strong>Оплата:</strong> За каждый выгруженный ящик Вы будете получать награду. Чтобы доставить ещё заказы — вернитесь на базу и примите новый заказ.
				</span>
			</div>
		`
	},
	{
		id: 'cargo',
		name: 'Грузоперевозки',
		icon: 'fa-boxes',
		shortDesc: 'Доставка грузов между городами на грузовом транспорте',
		fullDesc: 'Грузоперевозки — одна из самых высокооплачиваемых работ на сервере. Вы будете перевозить различные грузы между городами на грузовых автомобилях. Работа требует аккуратности, знания маршрутов и умения управлять крупногабаритным транспортом.',
		requirements: 'Паспорт гражданина РФ, Водительские права категории C, Отсутствие работы',
		city: 'д. Роговичи',
		level: 1,
		commands: [
			{ cmd: 'P или /phone', desc: 'Открыть телефон' },
			{ cmd: 'Приложение "TruckJob"', desc: 'Выбрать и взять заказ, посмотреть профиль' }
		],
		salary: 'Зависит от типа груза и дальности рейса.',
		image: 'cargo.png',
		salaryData: null,
		howToWork: `
			<h4 style="color: var(--accent); margin: 16px 0 8px;">Как устроиться:</h4>
			
			<p><strong>Шаг 1:</strong> Прибыть в <strong>МФЦ "Мои документы"</strong>.</p>
			<p><strong>Шаг 2:</strong> В меню трудоустройства выбрать <strong>"Вакансия Грузоперевозки"</strong>.</p>
			<p><strong>Шаг 3:</strong> Убедиться, что Вы подходите по требованиям, и нажать кнопку <strong>"Принять"</strong>.</p>

			<h4 style="color: var(--accent); margin: 16px 0 8px;">Начало работы:</h4>
			
			<p><strong>Шаг 1:</strong> Введите <code>/gps → 2. Работы → 8. Хаб Грузоперевозок</code>.</p>
			<p><strong>Шаг 2:</strong> Хаб Грузоперевозок находится в поселке <strong>Роговичи</strong> недалеко от пгт. Батырево.</p>
			<p><strong>Шаг 3:</strong> Вам нужно выбрать желаемый тягач/фургон. От выбора типа транспортного средства зависят грузы, которые Вы можете перевезти.</p>

			<h4 style="color: var(--accent); margin: 16px 0 8px;">Доступные транспортные средства:</h4>
			
			<div style="overflow-x: auto; margin: 12px 0;">
				<table class="info-table">
					<thead>
						<tr>
							<th>Транспорт</th>
							<th>Требуемый опыт</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td><strong>Газель Бизнес</strong></td>
							<td>0 опыта</td>
						</tr>
						<tr>
							<td><strong>Gazel Next</strong></td>
							<td>50 опыта</td>
						</tr>
						<tr>
							<td><strong>ГАЗель (тент)</strong></td>
							<td>600 опыта</td>
						</tr>
						<tr>
							<td><strong>Gazon Next</strong></td>
							<td>750 опыта</td>
						</tr>
						<tr>
							<td><strong>MAN TGL</strong></td>
							<td>1200 опыта</td>
						</tr>
						<tr>
							<td><strong>Scania R620</strong></td>
							<td>1500 опыта</td>
						</tr>
						<tr>
							<td><strong>Renault Premium</strong></td>
							<td>2000 опыта</td>
						</tr>
						<tr>
							<td><strong>Kamaz</strong></td>
							<td>2000 опыта</td>
						</tr>
						<tr>
							<td><strong>Volvo FH 750</strong></td>
							<td>2200 опыта</td>
						</tr>
					</tbody>
				</table>
			</div>

			<div style="margin: 12px 0; padding: 12px 16px; background: rgba(255, 193, 7, 0.1); border-left: 3px solid #ffc107; border-radius: 8px;">
				<i class="fas fa-percent" style="color: #ffc107; margin-right: 8px;"></i>
				<span style="color: var(--text-secondary); font-size: 0.85rem;">
					<strong>Комиссия:</strong> При аренде транспортного средства для доставки с Вас будет удержано <strong>30%</strong> от стоимости груза после успешного завершения заказа.
				</span>
			</div>

			<div style="margin: 12px 0; padding: 12px 16px; background: rgba(46, 164, 79, 0.08); border-left: 3px solid var(--accent); border-radius: 8px;">
				<i class="fas fa-info-circle" style="color: var(--accent); margin-right: 8px;"></i>
				<span style="color: var(--text-secondary); font-size: 0.85rem;">
					<strong>Важно:</strong> Также имеется возможность выполнять работу по доставке груза, приобретя <strong>личный тягач или фургон</strong> — тогда комиссия не взимается!
				</span>
			</div>

			<p><strong>Шаг 4:</strong> После выбора транспортного средства откройте телефон клавишей <strong>P</strong> или командой <code>/phone</code>, затем откройте приложение <strong>"TruckJob"</strong>.</p>

			<h4 style="color: var(--accent); margin: 16px 0 8px;">Принцип работы:</h4>
			
			<p><strong>Шаг 1:</strong> Перед Вами откроется меню с доступными заказами. После выбора нажмите <strong>"Взять заказ"</strong>.</p>
			<p><strong>Шаг 2:</strong> У Вас появится уведомление о выбранном заказе.</p>
			<p><strong>Шаг 3:</strong> Направьтесь к точке погрузки, встаньте на маркер и дождитесь загрузки транспортного средства.</p>
			<p><strong>Шаг 4:</strong> Следуйте к метке на карте.</p>
			<p><strong>Шаг 5:</strong> По прибытию на место наедьте на метку и разгрузитесь. После выгрузки появится уведомление о выполненном рейсе.</p>
			<p><strong>Шаг 6:</strong> Чтобы начать новый рейс, повторно откройте телефон и выберите новый заказ.</p>

			<h4 style="color: var(--accent); margin: 16px 0 8px;">Статистика:</h4>
			
			<p>Информацию о количестве имеющегося опыта можно посмотреть, открыв приложение <strong>"TruckJob"</strong> и нажав на вкладку <strong>"Профиль"</strong>.</p>
		`
	},
    {
		id: 'mechanic',
		name: 'Механик',
		icon: 'fa-wrench',
		shortDesc: 'Ремонт и обслуживание автомобилей игроков',
		fullDesc: 'Работа механика — одна из самых востребованных профессий на сервере. Вы будете ремонтировать автомобили других игроков, заправлять их топливом, проводить техническое обслуживание. Работа требует внимательности и знания устройства автомобилей.',
		requirements: 'Паспорт гражданина РФ, Водительские права категории C, Отсутствие работы, Наличие мобильного телефона и симкарты',
		city: 'Южный',
		level: 1,
		commands: [
			{ cmd: '/p', desc: 'Ответить на звонок игрока' },
			{ cmd: '/repairveh [ID] [Стоимость]', desc: 'Починить автомобиль игрока' },
			{ cmd: '/fillveh [ID] [Цена/л] [Кол-во]', desc: 'Заправить автомобиль игрока' }
		],
		salary: 'Зависит от количества выполненных заказов и установленной цены на каждый заказ.',
		image: 'mechanic.png',
		salaryData: null,
		howToWork: `
			<h4 style="color: var(--accent); margin: 16px 0 8px;">Как устроиться:</h4>
			
			<p><strong>Шаг 1:</strong> Прибыть в <strong>МФЦ "Мои документы"</strong>.</p>
			<p><strong>Шаг 2:</strong> В меню трудоустройства выбрать <strong>"Вакансия механика"</strong>.</p>
			<p><strong>Шаг 3:</strong> Убедиться, что Вы подходите по требованиям, и нажать кнопку <strong>"Принять"</strong>.</p>

			<h4 style="color: var(--accent); margin: 16px 0 8px;">Начало работы:</h4>
			
			<p><strong>Шаг 1:</strong> Введите <code>/gps → 2. Работы → 1. База механиков</code>.</p>
			<p><strong>Шаг 2:</strong> База механиков расположена в городе <strong>Южный</strong> напротив набережной.</p>
			<p><strong>Шаг 3:</strong> Подойдите ко входу в здание, встаньте на чекпоинт одежды и нажмите <strong>ALT</strong>.</p>
			<p><strong>Шаг 4:</strong> В открывшемся меню выберите <strong>"Начать рабочий день" → "Принять"</strong>.</p>
			
			<div style="margin: 12px 0; padding: 12px 16px; background: rgba(46, 164, 79, 0.08); border-left: 3px solid var(--accent); border-radius: 8px;">
				<i class="fas fa-info-circle" style="color: var(--accent); margin-right: 8px;"></i>
				<span style="color: var(--text-secondary); font-size: 0.85rem;">
					В общем чате появится сообщение о том, что Вы начали рабочий день. Игроки смогут вызвать Вас с помощью связи по Вашему телефону.
				</span>
			</div>

			<h4 style="color: var(--accent); margin: 16px 0 8px;">Принцип работы:</h4>
			
			<p><strong>Шаг 1:</strong> Подойдите к свободному рабочему транспорту (ГАЗели) и сядьте в неё.</p>
			<p><strong>Шаг 2:</strong> При получении звонка от игрока ответьте на него командой <code>/p</code> и следуйте в назначенное игроком место.</p>
			<p><strong>Шаг 3:</strong> По прибытию на место приблизьтесь на рабочем транспорте к транспорту игрока.</p>
			<p><strong>Шаг 4:</strong> Уточните у игрока в IC-чат о том, что у него случилось и что ему нужно.</p>

			<h4 style="color: var(--accent); margin: 16px 0 8px;">Услуги механика:</h4>
			
			<div style="margin: 12px 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px;">
				<div style="padding: 16px; background: var(--card-bg); border-radius: 8px; border: 1px solid var(--border);">
					<div style="font-weight: 700; color: var(--accent); margin-bottom: 8px;">
						<i class="fas fa-tools"></i> Ремонт
					</div>
					<p style="margin: 0; font-size: 0.9rem; color: var(--text-secondary);">
						Сядьте в рабочий транспорт и введите команду:<br>
						<code style="display: inline-block; margin-top: 6px; padding: 4px 10px; background: var(--bg); border-radius: 4px;">/repairveh [ID] [Стоимость ремонта]</code>
					</p>
				</div>
				<div style="padding: 16px; background: var(--card-bg); border-radius: 8px; border: 1px solid var(--border);">
					<div style="font-weight: 700; color: var(--accent); margin-bottom: 8px;">
						<i class="fas fa-gas-pump"></i> Заправка
					</div>
					<p style="margin: 0; font-size: 0.9rem; color: var(--text-secondary);">
						Сядьте в рабочий транспорт и введите команду:<br>
						<code style="display: inline-block; margin-top: 6px; padding: 4px 10px; background: var(--bg); border-radius: 4px;">/fillveh [ID] [Цена за литр] [Количество бензина]</code>
					</p>
				</div>
			</div>

			<div style="margin-top: 12px; padding: 12px 16px; background: rgba(46, 164, 79, 0.08); border-left: 3px solid var(--accent); border-radius: 8px;">
				<i class="fas fa-info-circle" style="color: var(--accent); margin-right: 8px;"></i>
				<span style="color: var(--text-secondary); font-size: 0.85rem;">
					<strong>Важно:</strong> Цены на услуги механик устанавливает самостоятельно. Заработок зависит от количества выполненных заказов.
				</span>
			</div>
		`
	},
	{
		id: 'tram',
		name: 'Водитель трамвая',
		icon: 'fa-subway',
		shortDesc: 'Управление трамваем по городским маршрутам',
		fullDesc: 'Работа водителя трамвая — одна из самых спокойных и размеренных работ на сервере. Вы будете управлять трамваем по городским маршрутам, перевозить пассажиров. Работа требует соблюдения графика и внимательности на дороге.',
		requirements: 'Паспорт гражданина РФ, Уровень 2 и выше, Отсутствие работы',
		city: 'Арзамас',
		level: 2,
		salary: 'зависит от маршрута',
		image: 'tram.png',
		salaryData: {
			default: { 
				name: 'Водитель трамвая',
				routes: [
					{ name: 'Маршрут 1 (ч/з ProCustom)', time: 399, pay: 9000 },
					{ name: 'Маршрут 2 (ч/з больницу и ГАИ)', time: 804, pay: 15000 }
				]
			}
		},
		howToWork: `
			<h4 style="color: var(--accent); margin: 16px 0 8px;">Как устроиться:</h4>
			<p><strong>Шаг 1:</strong> Прибыть в МФЦ <em>"Мои документы"</em>.</p>
			<p><strong>Шаг 2:</strong> В меню трудоустройства выбрать <strong>"Водитель трамвая"</strong>.</p>
			<p><strong>Шаг 3:</strong> Убедиться, что Вы подходите по требованиям, и нажать кнопку <strong>"Принять"</strong>.</p>

			<h4 style="color: var(--accent); margin: 16px 0 8px;">Начало работы:</h4>
			<p><strong>Шаг 1:</strong> Введите <code>/gps → 2. Работы → 15. Водитель трамвая</code>.</p>
			<p><strong>Шаг 2:</strong> На карте появится отметка депо трамваев (находится в городе Арзамас, рядом с Автошколой).</p>
			<p><strong>Шаг 3:</strong> Подойдите ко входу в депо, встаньте на чекпоинт и нажмите <strong>ALT</strong>.</p>
			<p><strong>Шаг 4:</strong> Вы переместитесь внутрь депо. Поднимитесь по лестнице на второй этаж, встаньте на чекпоинт и нажмите <strong>ALT</strong>.</p>
			<p><strong>Шаг 5:</strong> В открывшемся меню выберите <strong>"Начать работу"</strong>.</p>
			<p><strong>Шаг 6:</strong> В следующем окне выберите маршрут, по которому хотите поехать, а затем доступный трамвай.</p>
			<p><strong>Шаг 7:</strong> Вы переместитесь в трамвай. Начинайте движение по маршруту по маркерам.</p>

			<h4 style="color: var(--accent); margin: 16px 0 8px;">Система светофоров для трамваев:</h4>
			<div style="margin: 12px 0;">
				<img src="../images/jobs/tram_signal.png" 
					 alt="Сигналы светофора для трамваев" 
					 style="max-width: 100%; border-radius: 12px; border: 1px solid var(--border);"
					 onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\'padding: 20px; background: var(--card-bg); border-radius: 12px; border: 1px solid var(--border); color: var(--text-secondary);\'><i class=\'fas fa-image\' style=\'font-size: 32px; display: block; margin-bottom: 12px;\'></i>Изображение светофора не найдено</div>'">
			</div>
		`
	},
    {
		id: 'train_driver',
		name: 'Машинист',
		icon: 'fa-train',
		shortDesc: 'Управление поездом и перевозка пассажиров.',
		fullDesc: 'Работа машиниста — одна из самых ответственных на сервере. Вы будете управлять поездом и перевозить пассажиров. Работа требует строгого соблюдения маршрута, дистанции и правил безопасности.',
		requirements: 'Паспорт гражданина РФ, Уровень 2 и выше, Отсутствие работы',
		city: 'д. Михайловка',
		level: 2,
		commands: [
			{ cmd: '/startjob', desc: 'Начать смену (после посадки в поезд)' },
			{ cmd: 'N', desc: 'Запустить поезд (клавиша N)' }
		],
		salary: 'зависит от маршрута',
		image: 'train_driver.png',
		salaryData: {
			default: { 
				name: 'Машинист', 
				time: 1136, 
				pay: 30000 
			}
		},
		howToWork: `
			<h4 style="color: var(--accent); margin: 16px 0 8px;">Как устроиться:</h4>
			<p><strong>Шаг 1:</strong> Прибыть в МФЦ <em>"Мои документы"</em>.</p>
			<p><strong>Шаг 2:</strong> В меню трудоустройства выбрать <strong>"Машинист"</strong>.</p>
			<p><strong>Шаг 3:</strong> Убедиться, что Вы подходите по требованиям, и нажать кнопку <strong>"Принять"</strong>.</p>

			<h4 style="color: var(--accent); margin: 16px 0 8px;">Начало работы:</h4>
			<p><strong>Шаг 1:</strong> Введите <code>/gps → 2. Работы → 11. Депо РЖД</code>.</p>
			<p><strong>Шаг 2:</strong> На карте появится отметка депо РЖД (находится рядом с <strong>д. Михайловка</strong>).</p>
			<p><strong>Шаг 3:</strong> Подойдите ко входу в главное здание, встаньте на чекпоинт одежды и нажмите <strong>ALT</strong>.</p>
			<p><strong>Шаг 4:</strong> В открывшемся меню выберите <strong>"Форма машиниста"</strong>.</p>
			<p><strong>Шаг 5:</strong> После переодевания подойдите к зданию напротив, нажмите <strong>ALT</strong> на чекпоинте, чтобы встать в очередь.</p>
			<p><strong>Шаг 6:</strong> Когда подойдёт Ваша очередь — Вас автоматически переместит в поезд.</p>

			<h4 style="color: var(--accent); margin: 16px 0 8px;">Принцип работы:</h4>
			<p><strong>Шаг 1:</strong> Введите команду <code>/startjob</code>, затем нажмите клавишу <strong>N</strong>, чтобы запустить поезд.</p>
			<p><strong>Шаг 2:</strong> Следуйте по меткам на карте по маршруту. Маршрут кольцевой.</p>
			
			<div style="margin-top: 12px; padding: 12px 16px; background: rgba(46, 164, 79, 0.08); border-left: 3px solid var(--accent); border-radius: 8px;">
            <i class="fas fa-info-circle" style="color: var(--accent); margin-right: 8px;"></i>
            <span style="color: var(--text-secondary); font-size: 0.85rem;">
                <strong>Ограничения скорости:</strong><br>
                • На железнодорожных переездах — <strong>не более 40 км/ч</strong><br>
                • На остальных участках маршрута — <strong>не более 90 км/ч</strong>
            </span>
        </div>
		`
	},
    {
		id: 'taxi',
		name: 'Таксист',
		icon: 'fa-taxi',
		shortDesc: 'Перевозка игроков и NPC по городу и за его пределы',
		fullDesc: 'Работа таксиста — отличный способ заработать и познакомиться с другими игроками. Вы будете перевозить пассажиров по городу и за его пределы. Работа требует хорошего знания города и вежливого общения с клиентами. Доступны автомобили разных классов: эконом, комфорт и комфорт+.',
		requirements: 'Паспорт гражданина РФ, Водительские права категории B, Отсутствие работы, Уровень 2 и выше',
		city: 'пгт. Батырево',
		level: 2,
		commands: [
			{ cmd: 'P или /phone', desc: 'Открыть телефон' },
			{ cmd: 'Приложение "ТаксиPRO"', desc: 'Начать/закончить работу, принимать заказы' }
		],
		salary: 'Зависит от класса авто, количества и дальности поездок.',
		image: 'taxi.png',
		salaryData: null,
		howToWork: `
			<h4 style="color: var(--accent); margin: 16px 0 8px;">Как устроиться:</h4>
			
			<p><strong>Шаг 1:</strong> Прибыть в <strong>МФЦ "Мои документы"</strong>.</p>
			<p><strong>Шаг 2:</strong> В меню трудоустройства выбрать <strong>"Вакансия Таксиста"</strong>.</p>
			<p><strong>Шаг 3:</strong> Убедиться, что Вы подходите по требованиям, и нажать кнопку <strong>"Принять"</strong>.</p>

			<h4 style="color: var(--accent); margin: 16px 0 8px;">Начало работы:</h4>
			
			<p><strong>Шаг 1:</strong> Введите <code>/gps → 2. Работы → 10. Таксопарк</code>.</p>
			<p><strong>Шаг 2:</strong> Таксопарк расположен в <strong>пгт. Батырево</strong> напротив автовокзала.</p>
			<p><strong>Шаг 3:</strong> Подойдите к заднему входу в здание, встаньте на чекпоинт и нажмите <strong>ALT</strong>.</p>

			<h4 style="color: var(--accent); margin: 16px 0 8px;">Выбор автомобиля и классы:</h4>
			
			<p>Все автомобили в таксопарке разделены на классы. Система классов напрямую зависит от вашего опыта:</p>
			
			<div style="margin: 12px 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
				<div style="padding: 12px 16px; background: var(--card-bg); border-radius: 8px; border: 1px solid var(--border);">
					<div style="font-weight: 700; color: #4CAF50;">Эконом</div>
					<div style="font-size: 0.85rem; color: var(--text-secondary);">Доступен с <strong>0</strong> поездок</div>
				</div>
				<div style="padding: 12px 16px; background: var(--card-bg); border-radius: 8px; border: 1px solid var(--border);">
					<div style="font-weight: 700; color: #2196F3;">Комфорт</div>
					<div style="font-size: 0.85rem; color: var(--text-secondary);">Доступен с <strong>250</strong> поездок</div>
				</div>
				<div style="padding: 12px 16px; background: var(--card-bg); border-radius: 8px; border: 1px solid var(--border);">
					<div style="font-weight: 700; color: #9C27B0;">Комфорт+</div>
					<div style="font-size: 0.85rem; color: var(--text-secondary);">Доступен с <strong>500</strong> поездок</div>
				</div>
				<div style="padding: 12px 16px; background: var(--card-bg); border-radius: 8px; border: 1px solid var(--border);">
					<div style="font-weight: 700; color: #FF9800;">Личный транспорт</div>
					<div style="font-size: 0.85rem; color: var(--text-secondary);">Доступен с <strong>750+</strong> поездок</div>
				</div>
			</div>

			<div style="margin: 12px 0; padding: 12px 16px; background: rgba(255, 193, 7, 0.1); border-left: 3px solid #ffc107; border-radius: 8px;">
				<i class="fas fa-percent" style="color: #ffc107; margin-right: 8px;"></i>
				<span style="color: var(--text-secondary); font-size: 0.85rem;">
					<strong>Комиссия сервиса:</strong><br>
					• Обычные пользователи — <strong>15%</strong><br>
					• VIP — <strong>10%</strong><br>
					• VIP+ — <strong>5%</strong>
				</span>
			</div>
			
			<h4 style="color: var(--accent); margin: 16px 0 8px;">Доступные автомобили:</h4>
        
			<ul style="margin: 12px 0; padding-left: 20px; columns: 1; column-gap: 30px;">
				<li style="margin-bottom: 6px;">KIA Rio</li>
				<li style="margin-bottom: 6px;">Opel Astra</li>
				<li style="margin-bottom: 6px;">Volkswagen Polo</li>
				<li style="margin-bottom: 6px;">Renault Logan</li>
				<li style="margin-bottom: 6px;">Lada Vesta</li>
			</ul>
			
			<p><strong>Шаг 4:</strong> После выбора автомобиля проследуйте к нему, сядьте в него и нажмите клавишу <strong>P</strong> или введите <code>/phone</code>, затем откройте приложение <strong>"ТаксиPRO"</strong>.</p>
			
			<p><strong>Шаг 5:</strong> Нажмите кнопку <strong>"Начать работу"</strong> — начнётся поиск заказов от игроков или NPC.</p>
			
			<div style="margin: 12px 0; padding: 12px 16px; background: rgba(46, 164, 79, 0.08); border-left: 3px solid var(--accent); border-radius: 8px;">
				<i class="fas fa-info-circle" style="color: var(--accent); margin-right: 8px;"></i>
				<span style="color: var(--text-secondary); font-size: 0.85rem;">
					<strong>Важно:</strong> Если заказы от игроков не поступают, водитель получает заказы от NPC. Такие заказы генерируются в случайных точках в определённом радиусе от водителя.
				</span>
			</div>

			<h4 style="color: var(--accent); margin: 16px 0 8px;">Выполнение заказа:</h4>
			
			<p><strong>Шаг 1:</strong> После успешного поиска заказа нажмите кнопку <strong>"Принять"</strong>. На карте появится метка с местом нахождения пассажира.</p>
			<p><strong>Шаг 2:</strong> Прибудьте к месту, откройте телефон (<strong>P</strong> или <code>/phone</code>) и нажмите <strong>"На месте"</strong>. Ожидайте посадки пассажира.</p>
			<p><strong>Шаг 3:</strong> После посадки нажмите <strong>"Поехали"</strong> и следуйте к точке назначения.</p>
			<p><strong>Шаг 4:</strong> По прибытию на место завершения заказа нажмите <strong>"Приехали"</strong> — в приложении начислится сумма заработка.</p>
			<p><strong>Шаг 5:</strong> Поездка завершится автоматически, когда пассажир выйдет из автомобиля.</p>

			<div style="margin: 12px 0; padding: 12px 16px; background: rgba(46, 164, 79, 0.08); border-left: 3px solid var(--accent); border-radius: 8px;">
				<i class="fas fa-star" style="color: var(--accent); margin-right: 8px;"></i>
				<span style="color: var(--text-secondary); font-size: 0.85rem;">
					<strong>Бонус:</strong> За выполнение заказов на автомобилях классов <strong>Комфорт</strong> и <strong>Комфорт+</strong> предусмотрена небольшая доплата.
				</span>
			</div>

			<h4 style="color: var(--accent); margin: 16px 0 8px;">Как заказать такси (для пассажиров):</h4>
			
			<p>Откройте приложение <strong>"GreenGO"</strong>, укажите на карте точку назначения и оформите заказ. Дождитесь автомобиль такси и наслаждайтесь поездкой.</p>

			<h4 style="color: var(--accent); margin: 16px 0 8px;">Статистика:</h4>
			
			<p>Для получения информации о количестве опыта откройте телефон (<strong>P</strong> или <code>/phone</code>), откройте приложение <strong>"ТаксиPRO"</strong> и нажмите на свою фотографию.</p>
		`
	}
];

function getJobById(jobId) {
    return JOBS_DATA.find(job => job.id === jobId) || null;
}

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

function renderJobsList(container) {
    const jobsHtml = JOBS_DATA.map(job => {
        const imagePath = `../images/jobs/${job.image}`;
        const levelText = `${job.level} уровень`;
        
        return `
            <div class="job-card" data-job-id="${job.id}">
                <div class="job-card-image">
                    <img src="${imagePath}" 
                         alt="${escapeHtml(job.name)}" 
                         loading="lazy"
                         onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\'job-img-placeholder\'><i class=\'fas ${job.icon}\'></i></div>'">
                </div>
                <div class="job-card-content">
                    <div class="job-card-name">
                        <span class="job-title-link" style="cursor: pointer;">${escapeHtml(job.name)}</span>
                    </div>
                    <div class="job-card-info">
                        <div class="job-info-item">
                            <i class="fas fa-star"></i>
                            <span class="job-info-value">${levelText}</span>
                        </div>
                        <div class="job-info-item">
                            <i class="fas fa-location-dot"></i>
                            <span class="job-info-value">${escapeHtml(job.city)}</span>
                        </div>
                        <div class="job-info-item job-info-desc">
                            <i class="fas fa-circle-info"></i>
                            <span class="job-info-value">${escapeHtml(job.shortDesc)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <h1 class="page-title">Работы на сервере</h1>
        <p class="page-subtitle">Все доступные профессии для заработка в GreenTech RolePlay</p>
        
        <div class="jobs-grid" id="jobsGridContainer">
            ${jobsHtml}
        </div>
    `;

    document.querySelectorAll('.job-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.job-title-link')) {
                return;
            }
            const jobId = card.dataset.jobId;
            if (jobId) {
                const job = getJobById(jobId);
                if (job) {
                    updateURLForJob(jobId);
                    renderJobDetail(container, job);
                }
            }
        });
    });

    document.querySelectorAll('.job-title-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = link.closest('.job-card');
            if (card) {
                const jobId = card.dataset.jobId;
                if (jobId) {
                    const job = getJobById(jobId);
                    if (job) {
                        updateURLForJob(jobId);
                        renderJobDetail(container, job);
                    }
                }
            }
        });
    });
}

function renderJobDetail(container, job) {
	window.scrollTo({
        top: 0,
        behavior: 'instant'
    });
	
    let commandsHtml = '';
    if (job.commands && job.commands.length > 0) {
        commandsHtml = `
            <div class="system-section">
                <h3>Команды</h3>
                <div style="overflow-x: auto;">
                    <table class="info-table">
                        <thead><tr><th>Команда</th><th>Описание</th></tr></thead>
                        <tbody>${job.commands.map(cmd => `
                            <tr><td><code>${escapeHtml(cmd.cmd)}</code></td><td>${escapeHtml(cmd.desc)}</td></tr>
                        `).join('')}</tbody>
                    </table>
                </div>
            </div>
        `;
    }

    let requirementsHtml = '';
    if (job.requirements && job.requirements.trim() !== '') {
        const reqItems = job.requirements.split(',').map(item => item.trim());
        let reqListHtml = '';
        
        if (reqItems.length > 1) {
            reqListHtml = `
                <ul style="margin: 0; padding-left: 20px;">
                    ${reqItems.map(item => `<li style="margin-bottom: 6px;">${escapeHtml(item)}</li>`).join('')}
                </ul>
            `;
        } else {
            reqListHtml = `<p style="margin: 0;">${escapeHtml(job.requirements)}</p>`;
        }
        
        requirementsHtml = `
            <div class="system-section">
                <h3>Требования</h3>
                ${reqListHtml}
            </div>
        `;
    }

    let howToWorkHtml = '';
    if (job.howToWork) {
        howToWorkHtml = `
            <div class="system-section">
                <h3>Как устроиться и работать</h3>
                ${job.howToWork}
            </div>
        `;
    }

    let salaryBlockHtml = '';
    if (job.salaryData && Object.keys(job.salaryData).length > 0) {
        const jobKeys = Object.keys(job.salaryData);
        
        const hasRoutes = jobKeys.some(key => job.salaryData[key].routes);
        
        if (hasRoutes) {
            function calcEarnings(timePerRoute, payPerRoute, durationSeconds) {
                const routesCount = Math.floor(durationSeconds / timePerRoute);
                return routesCount * payPerRoute;
            }
            
            function generateTable(transportKey) {
                const transportData = job.salaryData[transportKey];
                if (!transportData || !transportData.routes) return '';
                
                let rowsHtml = '';
                transportData.routes.forEach(route => {
                    const timeStr = formatDurationFromSeconds(route.time);
                    const payPerHour = calcEarnings(route.time, route.pay, 3600);
                    const payPer2Hours = calcEarnings(route.time, route.pay, 7200);
                    
                    rowsHtml += `
                        <tr>
                            <td>${escapeHtml(route.name)}</td>
                            <td>${timeStr}</td>
                            <td>${route.pay.toLocaleString()} ₽</td>
                            <td>${payPerHour.toLocaleString()} ₽</td>
                            <td>${payPer2Hours.toLocaleString()} ₽</td>
                        </tr>
                    `;
                });
                
                return rowsHtml;
            }
            
            const firstKey = jobKeys[0];
            let initialRowsHtml = generateTable(firstKey);
            
            let selectHtml = '';
            if (job.id === 'bus') {
                let busOptionsHtml = jobKeys.map(key => `
                    <option value="${key}">${job.salaryData[key].name}</option>
                `).join('');
                
                selectHtml = `
                    <div class="salary-control">
                        <label for="transportSelect" style="margin-right: 12px; font-weight: 500; color: var(--text);">Автобус:</label>
                        <select id="transportSelect" class="uniform-select" style="min-width: 200px;">
                            ${busOptionsHtml}
                        </select>
                    </div>
                `;
            }
            
            let noteHtml = '';
            if (job.id === 'tram') {
                noteHtml = `
                    <div style="margin-top: 12px; padding: 12px 16px; background: rgba(46, 164, 79, 0.08); border-left: 3px solid var(--accent); border-radius: 8px;">
                        <i class="fas fa-info-circle" style="color: var(--accent); margin-right: 8px;"></i>
                        <span style="color: var(--text-secondary); font-size: 0.85rem;">Обратите внимание, что значения в таблице носят средний характер и могут незначительно отличаться от ваших конкретных результатов.</span>
                    </div>
                `;
            } else {
                noteHtml = `
                    <div style="margin-top: 12px; padding: 12px 16px; background: rgba(46, 164, 79, 0.08); border-left: 3px solid var(--accent); border-radius: 8px;">
                        <i class="fas fa-info-circle" style="color: var(--accent); margin-right: 8px;"></i>
                        <span style="color: var(--text-secondary); font-size: 0.85rem;">
                            Цена после каждого рейса изменяется, поэтому указаны средние значения.
                            Замеры производились на круговых маршрутах (конечная 1 → конечная 2 → конечная 1).
                        </span>
                    </div>
                `;
            }
            
            salaryBlockHtml = `
                <div class="system-section">
                    <h3>Заработок</h3>
                    ${selectHtml}
                    <div style="overflow-x: auto; margin-top: 16px;">
                        <table class="info-table" id="salaryTable">
                            <thead>
                                <tr>
                                    <th>Маршрут</th>
                                    <th>Время</th>
                                    <th>Оплата</th>
                                    <th>Оплата за час</th>
                                    <th>Оплата за 2 часа</th>
                                </tr>
                            </thead>
                            <tbody id="salaryBody">
                                ${initialRowsHtml}
                            </tbody>
                        </table>
                    </div>
                    ${noteHtml}
                </div>
            `;
            
            if (job.id === 'bus') {
                setTimeout(() => {
                    const transportSelect = document.getElementById('transportSelect');
                    if (transportSelect) {
                        transportSelect.addEventListener('change', function() {
                            const selected = this.value;
                            const newRowsHtml = generateTable(selected);
                            document.getElementById('salaryBody').innerHTML = newRowsHtml;
                        });
                    }
                }, 50);
            }
        } else {
            const jobKeys = Object.keys(job.salaryData);
            let optionsHtml = '';
            let showSelect = false;
            
            if (jobKeys.length > 1) {
                showSelect = true;
                optionsHtml = jobKeys.map(key => `
                    <option value="${key}">${job.salaryData[key].name}</option>
                `).join('');
            }

            const firstKey = jobKeys[0];
            const firstData = job.salaryData[firstKey];
            const { time, pay } = firstData;

            function formatDuration(seconds) {
                if (seconds < 60) {
                    return `${seconds} сек.`;
                }
                const minutes = Math.floor(seconds / 60);
                const remainingSeconds = seconds % 60;
                if (remainingSeconds === 0) {
                    return `${minutes} мин.`;
                }
                return `${minutes} мин. ${remainingSeconds} сек.`;
            }

            const durations = [
                { label: formatDuration(time), seconds: time },
                { label: '1 час', seconds: 3600 },
                { label: '2 часа', seconds: 7200 }
            ];

            let rowsHtml = '';
            durations.forEach(d => {
                const tasksCount = Math.floor(d.seconds / time);
                const earnings = tasksCount * pay;
                rowsHtml += `
                    <tr>
                        <td>${d.label}</td>
                        <td>${earnings.toLocaleString()} ₽</td>
                    </tr>
                `;
            });

            let selectHtml = '';
            if (showSelect) {
                selectHtml = `
                    <div class="salary-control">
                        <label for="jobSelect" style="margin-right: 12px; font-weight: 500; color: var(--text);">Специальность:</label>
                        <select id="jobSelect" class="uniform-select" style="min-width: 200px;">
                            ${optionsHtml}
                        </select>
                    </div>
                `;
            }

            let measurementNoteHtml = '';
            if (job.id === 'loggers' && job.showMeasurementNote) {
                measurementNoteHtml = `
                    <div style="margin-top: 8px; padding: 8px 12px; background: rgba(255, 193, 7, 0.1); border-left: 3px solid #ffc107; border-radius: 6px; font-size: 0.85rem; color: var(--text-secondary);">
                        <span><strong>Примечание:</strong> Данные в таблице замерены на грузовике <strong>БЕЗ прицепа</strong>.</span>
                    </div>
                `;
            }

            salaryBlockHtml = `
                <div class="system-section">
                    <h3>Заработок</h3>
                    ${selectHtml}
                    <div style="overflow-x: auto; margin-top: 16px;">
                        <table class="info-table" id="salaryTable">
                            <thead>
                                <tr>
                                    <th>Длительность</th>
                                    <th>Заработок</th>
                                </tr>
                            </thead>
                            <tbody id="salaryBody">
                                ${rowsHtml}
                            </tbody>
                        </table>
                    </div>
                    ${measurementNoteHtml}
                    <div style="margin-top: 12px; padding: 12px 16px; background: rgba(46, 164, 79, 0.08); border-left: 3px solid var(--accent); border-radius: 8px;">
                        <i class="fas fa-info-circle" style="color: var(--accent); margin-right: 8px;"></i>
                        <span style="color: var(--text-secondary); font-size: 0.85rem;">Обратите внимание, что значения в таблице носят средний характер и могут незначительно отличаться от ваших конкретных результатов.</span>
                    </div>
                </div>
            `;

            if (showSelect) {
                setTimeout(() => {
                    const jobSelect = document.getElementById('jobSelect');
                    if (jobSelect) {
                        jobSelect.addEventListener('change', (e) => {
                            const key = e.target.value;
                            const data = job.salaryData[key];
                            if (!data) return;
                            const { time, pay } = data;
                            const durations = [
                                { label: formatDuration(time), seconds: time },
                                { label: '1 час', seconds: 3600 },
                                { label: '2 часа', seconds: 7200 }
                            ];
                            let newRowsHtml = '';
                            durations.forEach(d => {
                                const tasksCount = Math.floor(d.seconds / time);
                                const earnings = tasksCount * pay;
                                newRowsHtml += `
                                    <tr>
                                        <td>${d.label}</td>
                                        <td>${earnings.toLocaleString()} ₽</td>
                                    </tr>
                                `;
                            });
                            document.getElementById('salaryBody').innerHTML = newRowsHtml;
                        });
                    }
                }, 50);
            }
        }
    } else if (job.salary) {
        salaryBlockHtml = `
            <div class="system-section">
                <h3>Зарплата</h3>
                <p><strong>${escapeHtml(job.salary)}</strong></p>
            </div>
        `;
    }

    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
            <button class="back-button" id="backToJobsBtn">
                <i class="fas fa-arrow-left"></i> Назад к списку работ
            </button>
        </div>

        <div class="system-detail-card">
            <div class="system-detail-header">
                <div class="system-detail-title">
                    <div class="system-detail-icon" style="background: var(--accent)20;">
                        <i class="fas ${job.icon}" style="color: var(--accent); font-size: 32px;"></i>
                    </div>
                    <div class="system-detail-name">${escapeHtml(job.name)}</div>
                </div>
                <div class="system-detail-desc">${escapeHtml(job.shortDesc)}</div>
            </div>
            
            <div class="system-detail-body">
                <div class="system-section">
                    <h3>Описание работы</h3>
                    <p>${escapeHtml(job.fullDesc)}</p>
                </div>

                ${requirementsHtml}
                ${howToWorkHtml}
                ${commandsHtml}
                ${salaryBlockHtml}
            </div>
        </div>
    `;

    document.getElementById('backToJobsBtn').addEventListener('click', () => {
        updateURLForJob(null);
        renderJobsList(container);
    });
}

function initHashChangeListener(container) {
    window.addEventListener('hashchange', () => {
        const jobId = getJobIdFromURL();
        if (jobId) {
            const job = getJobById(jobId);
            if (job) {
                renderJobDetail(container, job);
                return;
            }
        }
        renderJobsList(container);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('jobsDynamicContent');
    if (!container) return;

    const jobIdFromURL = getJobIdFromURL();
    if (jobIdFromURL) {
        const job = getJobById(jobIdFromURL);
        if (job) {
            renderJobDetail(container, job);
            initHashChangeListener(container);
            return;
        }
        window.location.hash = '';
    }

    renderJobsList(container);
    initHashChangeListener(container);
});