// city      - Город
// town      - ПГТ
// village   - Село
// hamlet    - Деревня
// settlement - Посёлок
// station   - 
// suburb    - 

const CITIES_POLYGONS = [
    {
        name: 'Арзамас',
        type: 'city',
        color: '#2ecc71',
        points: [
            [1119, 1030], [1104, 1147], [1067, 1155], [1067, 1189], [1105, 1195], [1111, 1303], [1225, 1365], [1222, 1389], [1233, 1405], [1245, 1408],
            [1264, 1374], [1482, 1419], [1525, 1418], [1544, 1454], [1575, 1439], [1557, 1408], [1620, 1408], [1661, 1388], [1927, 1302], [2006, 1125],
			[1997, 983], [1971, 822], [1877, 673], [1816, 498], [1559, 525], [1422, 587], [1446, 900], [1352, 994]
        ]
    },
	{
        name: 'Южный',
        type: 'city',
        color: '#2ecc71',
        points: [
            [2891, 2951], [2891, 2985], [2917, 2985], [2943, 3004], [2959, 3004], [2959, 2948], [2966, 2944], [2975, 2936], [2980, 2922], [2980, 2860],
			[2989, 2860], [2989, 2838], [2979, 2834], [2980, 2219], [2918, 2219], [2718, 2287], [2477, 2482], [2335, 2830], [2334, 2951]
        ]
    },
	{
        name: 'Нижегородск',
        type: 'city',
        color: '#2ecc71',
        points: [
            [36, 478], [13, 612], [25, 726], [61, 872], [193, 929], [388, 842], [459, 710], [452, 561], [479, 393], [466, 283], [44, 283]
        ]
    },
	{
        name: 'Эдово',
        type: 'town',
        color: '#3498db',
        points: [
            [322, 158], [402, 107], [402, 12], [91, 12], [63, 20], [35, 40], [20, 64], [15, 94], [23, 126], [33, 158]
        ]
    },
	{
        name: 'Бусаево',
        type: 'town',
        color: '#3498db',
        points: [
            [1203, 2249], [1132, 2439], [1296, 2450], [1387, 2293], [1372, 2160], [1269, 2116]
        ]
    },
	{
        name: 'Корякино',
        type: 'hamlet',
        color: '#e67e22',
        points: [
            [1746, 2227], [1968, 2298], [2022, 2255], [2003, 2200], [1778, 2139], [1722, 2169]
        ]
    },
	{
        name: 'Солнечный',
        type: 'settlement',
        color: '#1abc9c',
        points: [
            [2533, 2026], [2751, 2026], [2751, 2140], [2533, 2140]
        ]
    },
	{
        name: 'Гарель',
        type: 'hamlet',
        color: '#e67e22',
        points: [
            [2647.5, 1612.5], [2920.5, 1612.5], [2920.5, 1685.5], [2647.5, 1685.5]
        ]
    },
	{
        name: 'Малиновка',
        type: 'hamlet',
        color: '#e67e22',
        points: [
            [345, 2291], [293, 2322], [369, 2467], [399, 2508], [424, 2538], [479, 2502]
        ]
    },
	{
        name: 'Михайловка',
        type: 'hamlet',
        color: '#e67e22',
        points: [
            [0, 1179], [44, 1129], [71, 1113], [139, 1171], [140, 1190], [134, 1262], [134, 1391], [126, 1424], [97, 1500], [77, 1582], [0, 1582]
        ]
    },
	{
        name: 'Сосновка',
        type: 'hamlet',
        color: '#e67e22',
        points: [
            [776, 1605], [999, 1571], [1343, 1562], [1446, 1610], [1424, 1772], [1308, 1825], [823, 1788], [741, 1697]
        ]
    },
	{
        name: 'Батырево',
        type: 'town',
        color: '#3498db',
        points: [
            [2500, 139], [2579, 199], [2531, 250], [2567, 306], [2542, 353], [2554, 544], [2581, 646], [2526, 657], [2511, 602], [2472, 590],
			[2472, 520], [2417, 507], [2401, 311], [2379, 272], [2415, 190]
        ]
    },
	{
        name: 'Роговичи',
        type: 'hamlet',
        color: '#e67e22',
        points: [
            [2469, 793], [2730, 793], [2730, 874], [2421, 874], [2421, 834], [2469, 834]
        ]
    },
];

function pixelToLatLng(pixelX, pixelY, mapWidth, mapHeight) {
    const x = pixelX - mapWidth / 2;
    const y = mapHeight / 2 - pixelY;
    return [y, x];
}

function getTypeColor(type) {
    const colors = {
        'city': '#2ecc71',   
        'town': '#3498db',     
        'village': '#f39c12', 
        'hamlet': '#e67e22',    
        'settlement': '#1abc9c', 
        'station': '#9b59b6',   
        'suburb': '#e74c3c'   
    };
    return colors[type] || '#95a5a6';
}

function getTypeName(type) {
    const names = {
        'city': 'Город',
        'town': 'Посёлок городского типа',
        'village': 'Село',
        'hamlet': 'Деревня',
        'settlement': 'Посёлок',
        'station': 'Станция / Разъезд',
        'suburb': 'Пригород / Рабочий посёлок'
    };
    return names[type] || type;
}

function getTypeIcon(type) {
    const icons = {
        'city': 'fa-city',
        'town': 'fa-building',
        'village': 'fa-home',
        'hamlet': 'fa-tree',
        'settlement': 'fa-house',
        'station': 'fa-train',
        'suburb': 'fa-subway'
    };
    return icons[type] || 'fa-circle';
}


const GOVERNMENT_INSTITUTIONS = [
    {
        name: 'Правительство',
        icon: 'fa-landmark',
        coords: [295, 680],
        address: 'г. Нижегородск, Нижегородский Кремль'
    },
    {
        name: 'Мои документы',
        icon: 'fa-passport',
        coords: [2694, 2651],
        address: 'г. Южный, ул. Заводская'
    },
    {
        name: 'Мои документы',
        icon: 'fa-passport',
        coords: [1708, 1282],
        address: 'г. Арзамас, ул. Ленина'
    }, 
    {
        name: 'Мои документы',
        icon: 'fa-passport',
        coords: [420, 575],
        address: 'г. Нижегородск, ул. Пожарского'
    },
    {
        name: 'МВД',
        icon: 'fa-shield-halved',
        coords: [1192, 1260],
        address: 'г. Арзамас, ул. Кирова'
    },
    {
        name: 'МВД',
        icon: 'fa-shield-halved',
        coords: [2855, 2775],
        address: 'г. Южный, пр-кт. Ленина'
    },
    {
        name: 'ГИБДД',
        icon: 'fa-traffic-light',
        coords: [242, 386],
        address: 'г. Нижегородск, ул. Пожарского'
    },
    {
        name: 'Армия',
        icon: 'fa-shield',
        coords: [1026, 2725],
        address: 'пгт. Бусаево, трасса Р-7'
    },
    {
        name: 'Пожарная часть',
        icon: 'fa-fire-extinguisher',
        coords: [2443, 389],
        address: 'пгт. Батырево, ул. Мирного'
    },
    {
        name: 'Прокуратура',
        icon: 'fa-scale-balanced',
        coords: [357, 519],
        address: 'г. Нижегородск, ул. Ульянова'
    },
    {
        name: 'Следственный комитет',
        icon: 'fa-magnifying-glass',
        coords: [1464, 1228],
        address: 'г. Арзамас, ул. Кирова'
    },
    {
        name: 'Автошкола',
        icon: 'fa-car',
        coords: [1928, 1085],
        address: 'г. Арзамас, ул. Калинина'
    },
    {
        name: 'Городской суд',
        icon: 'fa-gavel',
        coords: [240, 490],
        address: 'г. Нижегородск, ул. Минина'
    },
    {
        name: 'Городская больница',
        icon: 'fa-heart-pulse',
        coords: [1385, 1239],
        address: 'г. Арзамас, ул. Кирова'
    },
    {
        name: 'Городской банк',
        icon: 'fa-building-columns',
        coords: [2485, 495],
        address: 'пгт. Батырево, ул. Мирного'
    },
    {
        name: 'Военкомат',
        icon: 'fa-flag',
        coords: [2508, 360],
        address: 'пгт. Батырево, ул. Советская'
    },
    {
        name: 'МРЭО (Экзамены)',
        icon: 'fa-clipboard-check',
        coords: [1601, 907],
        address: 'г. Арзамас, б-р. Комсомольский'
    },
    { 
        name: 'МРЭО (Переоформление)',
        icon: 'fa-file-pen',
        coords: [2442, 224],
        address: 'пгт. Батырево, ул. Советская'
    }
];

const JOBS = [
    {
        name: 'База механиков',
        icon: 'fa-wrench',
        coords: [2908, 2657],
        address: 'г. Южный, ул. Набережная'
    },
    {
        name: 'Водитель автобуса',
        icon: 'fa-bus',
        coords: [2953, 2723],
        address: 'г. Южный, ул. Набережная'
    },
    {
        name: 'Лесоповал',
        icon: 'fa-tree',
        coords: [1848, 2596],
        address: ''
    },
    {
        name: 'Пилорама',
        icon: 'fa-industry',
        coords: [1848, 161],
        address: 'Область, трасса Р-2'
    },
    {
        name: 'Водитель лесовоза',
        icon: 'fa-truck',
        coords: [1244, 2556],
        address: 'Склад брёвен'
    },
    {
        name: 'База развозчик товара',
        icon: 'fa-box',
        coords: [981, 420],
        address: 'Склады'
    },
    {
        name: 'Склад',
        icon: 'fa-warehouse',
        coords: [1004, 415],
        address: 'Область, ул. Складская'
    },
    {
        name: 'Хаб грузоперевозок',
        icon: 'fa-truck-fast',
        coords: [2338, 922],
        address: ''
    },
    {
        name: 'Погрузочная база',
        icon: 'fa-truck-loading',
        coords: [2328, 926],
        address: ''
    },
    {
        name: 'Таксопарк',
        icon: 'fa-taxi',
        coords: [2492, 232],
        address: 'пгт. Батырево, ул. Советская'
    },
    {
        name: 'Депо РЖД',
        icon: 'fa-train',
        coords: [186, 1475],
        address: 'г. Лыткарино, трасса Р-1'
    },
    {
        name: 'База бензовозов',
        icon: 'fa-gas-pump',
        coords: [1086, 930],
        address: 'РосНефть'
    },
    {
        name: 'Склад брёвен',
        icon: 'fa-cubes',
        coords: [1270, 2579]
    },
    {
        name: 'Шахта',
        icon: 'fa-mountain',
        coords: [1469, 412],
        address: 'Область, трасса Р-2'
    },
    {
        name: 'Водитель трамвая',
        icon: 'fa-tram',
        coords: [1928, 1138],
        address: 'г. Арзамас, ул. Калинина'
    },
    {
        name: 'Водитель автобуса',
        icon: 'fa-bus',
        coords: [1205, 1058],
        address: 'г. Арзамас, ул. Жуковского'
    }
];

const CAR_DEALERSHIPS = [
    {
        name: 'Автосалон',
        icon: 'fa-car-side',
        coords: [2725, 2459],
        address: 'г. Южный, ул. Советская',
        description: 'Низкий/средний класс, мотоциклы'
    },
    {
        name: 'Автосалон',
        icon: 'fa-car-side',
        coords: [1225, 1283],
        address: 'г. Арзамас',
        description: 'Высокий класс, лодки'
    },
    {
        name: 'Автосалон',
        icon: 'fa-car-side',
        coords: [2530, 201],
        address: 'пгт. Батырево',
        description: 'Грузовой транспорт'
    }
];

const FISHING_SPOTS = [
    {
        name: 'Место для рыбалки №1',
        icon: 'fa-fish',
        coords: [2910, 3032]
    },
    {
        name: 'Место для рыбалки №2',
        icon: 'fa-fish',
        coords: [429, 2002]
    },
    {
        name: 'Место для рыбалки №3',
        icon: 'fa-fish',
        coords: [2834, 404]
    },
    {
        name: 'Место для рыбалки №4',
        icon: 'fa-fish',
        coords: [2604, 993]
    }
];

const OTHER_PLACES = [
    {
        name: 'Штрафстоянка ГИБДД',
        icon: 'fa-lock',
        coords: [1155, 2665],
        address: 'пгт. Бусаево, трасса Р-7'
    },
    {
        name: 'Утилизация авто',
        icon: 'fa-recycle',
        coords: [2877, 616]
    },
    {
        name: 'БУ рынок',
        icon: 'fa-store',
        coords: [2431, 273],
        address: 'пгт. Батырево, ул. Советская'
    },
    {
        name: 'Спортзал',
        icon: 'fa-dumbbell',
        coords: [1573, 1334],
        address: 'г. Арзамас, ул. Заводская'
    },
    {
        name: 'Автосервис ProCustom',
        icon: 'fa-screwdriver-wrench',
        coords: [1708, 936],
        address: 'г. Арзамас, ул. Достоевского'
    },
    {
        name: 'Клуб BlackRoom',
        icon: 'fa-music',
        coords: [1577, 1370],
        address: 'г. Арзамас, ул. Заводская'
    },
    {
        name: 'Ресторан Морской Бриз',
        icon: 'fa-utensils',
        coords: [1971, 1490],
        address: 'г. Арзамас, ул. Гоголя'
    },
    {
        name: 'Автосервис Автоклимат',
        icon: 'fa-screwdriver-wrench',
        coords: [2525, 173],
        address: 'пгт. Батырево'
    },
    {
        name: 'Автосервис RedLine',
        icon: 'fa-screwdriver-wrench',
        coords: [1833, 1178],
        address: 'г. Арзамас, ул. Севастопольская'
    },
    {
        name: 'Казино (не работает)',
        icon: 'fa-dice',
        coords: [1487, 1031],
        address: 'г. Арзамас, ул. Севастопольская'
    },
    {
        name: 'Тюнинг центр',
        icon: 'fa-gears',
        coords: [1766, 1137],
        address: 'г. Арзамас, ул. Севастопольская'
    },
    {
        name: 'Ресторан Velissea',
        icon: 'fa-utensils',
        coords: [2728, 2102],
        address: 'пос. Солнечный, ул. Достоевского'
    },
    {
        name: 'The Vouge Bar',
        icon: 'fa-champagne-glasses',
        coords: [245, 457],
        address: 'г. Нижегородск, ул. Минина',
        description: 'Стрип-клуб'
    }
];


const INSTITUTION_COLOR = '#e74c3c';

const JOB_COLOR = '#3498db';

const DEALERSHIP_COLOR = '#f39c12';

const FISHING_COLOR = '#1abc9c';

const OTHER_COLOR = '#9b59b6';