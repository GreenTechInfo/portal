function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

let currentVehicles = [];
let currentSort = { field: 'price', order: 'asc' }; 
let currentSearchTerm = '';

function renderVehicleList(container) {
    currentVehicles = [...VEHICLES_DATA.vehicles];
    
    const getValue = (value) => {
        return value && value !== "" ? value : "н/д";
    };

    const getNumericValue = (vehicle, field) => {
        if (field === 'price') {
            return vehicle.price || Infinity;
        } else if (field === 'maxSpeed') {
            const speed = parseFloat(vehicle.maxSpeed);
            return isNaN(speed) ? -Infinity : speed;
        }
        return 0;
    };

    const filterAndSortVehicles = () => {
        let filtered = [...currentVehicles];

        if (currentSearchTerm.trim() !== '') {
            const searchLower = currentSearchTerm.toLowerCase();
            filtered = filtered.filter(v => v.name.toLowerCase().includes(searchLower));
        }

        filtered.sort((a, b) => {
            let aVal = getNumericValue(a, currentSort.field);
            let bVal = getNumericValue(b, currentSort.field);
            
            if (currentSort.order === 'asc') {
                return aVal - bVal;
            } else {
                return bVal - aVal;
            }
        });
        
        return filtered;
    };
	
	const getDealerDisplay = (vehicle) => {
		if (vehicle.saleType === "Эксклюзив") return "Эксклюзив";
		if (vehicle.saleType === "Донат") return "Донат";
		if (vehicle.saleType === "Нет в продаже") return "Нет в продаже";
		if (vehicle.saleType === "Правительство") return "Правительство";
		if (vehicle.dealer === "south") return "Южный";
		if (vehicle.dealer === "arzamas") return "Арзамас";
		if (vehicle.dealer === "boats") return "Лодочный";
		return "н/д";
	};

    const renderVehiclesList = () => {
        const vehicles = filterAndSortVehicles();
        const grid = container.querySelector('.vehicles-grid');
        
        if (!grid) return;
        
        if (vehicles.length === 0) {
            grid.innerHTML = '<p style="text-align: center; padding: 40px;">Транспорт не найден</p>';
            return;
        }
        
        const vehiclesHtml = vehicles.map(v => {
            const maxSpeed = getValue(v.maxSpeed);
            const zeroToHundred = getValue(v.zeroToHundred);
            const maxAccel = getValue(v.maxAcceleration);
            const fuelType = getValue(v.fuel);
            const consumption = getValue(v.consumption);
            const power = getValue(v.power);
            let priceDisplay = "";
			if (v.saleType === "Эксклюзив") {
				priceDisplay = "Эксклюзив";
			} else if (!v.price || v.price === 0) {
				priceDisplay = "Недоступно для покупки";
			} else {
				priceDisplay = v.price.toLocaleString() + " ₽";
			}
            const year = getValue(v.year);
            const seats = getValue(v.seats);
            
            const fuelIcon = fuelType === "Электро" ? "fa-bolt" : "fa-gas-pump";

            const imagePath = v.id ? `../images/vehicles/${v.id}.png` : null;
            
            return `
                <div class="vehicle-card" data-name="${v.name.toLowerCase()}">
                    <div class="vehicle-card-image">
                        ${imagePath ? 
                            `<img src="${imagePath}" alt="${escapeHtml(v.name)}" 
                                 onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\'vehicle-img-placeholder\' style=\'height: 160px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #0d1117, #161c24); color: var(--text-secondary);\'>Фото пока нет</div>'"
                                 style="width: 100%; height: 160px; object-fit: cover; border-radius: 8px;">` :
                            `<div class="vehicle-img-placeholder" style="height: 160px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #0d1117, #161c24); color: var(--text-secondary);">Фото пока нет</div>`
                        }
                    </div>
                    
                    <div class="vehicle-card-name">
                        <span class="vehicle-title-link">${escapeHtml(v.name)}</span>
                        <span class="vehicle-year">${year}</span>
                    </div>
                    
                    <div class="vehicle-card-body">
                        <div class="vehicle-specs-left">
                            <div class="spec-item">
                                <i class="fas fa-tachometer-alt"></i>
                                <span class="spec-value">${maxSpeed} км/ч</span>
                            </div>
                            <div class="spec-item">
                                <i class="fas fa-stopwatch"></i>
                                <span class="spec-label">0-100</span>
                                <span class="spec-value">${zeroToHundred}</span>
                            </div>
                            <div class="spec-item">
                                <i class="fas fa-stopwatch-20"></i>
                                <span class="spec-label">0-MAX</span>
                                <span class="spec-value">${maxAccel}</span>
                            </div>
							<div class="spec-item">
                                <i class="fas ${fuelIcon}"></i>
                                <span class="spec-value">${fuelType} ${consumption !== "н/д" ? `(${consumption})` : ""}</span>
                            </div>
                        </div>
                        
                        <div class="vehicle-specs-right">
                            
                            <div class="spec-item">
								<i class="fa-solid fa-location-dot"></i>
								<span class="spec-value">${getDealerDisplay(v)}</span>
							</div>
                            <div class="spec-item">
                                <i class="fa fa-users"></i>
                                <span class="spec-label">мест</span>
                                <span class="spec-value">${seats}</span>
                            </div>
                            <div class="spec-item">
                                <i class="fas fa-horse-head"></i>
                                <span class="spec-value">${power} л.с.</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="vehicle-card-price">
						<span class="price-value">${priceDisplay}</span>
					</div>
                </div>
            `;
        }).join('');
        
        grid.innerHTML = vehiclesHtml;
    };

    const updateSort = (field, order) => {
        currentSort = { field, order };
        renderVehiclesList();

        const buttons = container.querySelectorAll('.sort-btn');
        buttons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.field === field && btn.dataset.order === order) {
                btn.classList.add('active');
            }
        });
    };
    
    const updateSearch = (term) => {
        currentSearchTerm = term;
        renderVehiclesList();
    };

    container.innerHTML = `
		<h1 class="page-title">Список автомобилей</h1>
		<p class="page-subtitle">Все доступные транспортные средства на сервере GreenTech RP</p>
		
		<div class="info-block">
			<div class="anim-search-bar">
				<input type="text" 
					   id="vehicleSearchInput" 
					   placeholder="Поиск по названию автомобиля...">
				<div style="display: flex; gap: 8px;">
					<button class="sort-btn active" data-field="price" data-order="asc" style="background: transparent; border: 1px solid var(--border); color: var(--text-secondary); padding: 8px 16px; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; font-size: 0.9rem;">
						Цена ↑
					</button>
					<button class="sort-btn" data-field="price" data-order="desc" style="background: transparent; border: 1px solid var(--border); color: var(--text-secondary); padding: 8px 16px; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; font-size: 0.9rem;">
						Цена ↓
					</button>
					<button class="sort-btn" data-field="maxSpeed" data-order="asc" style="background: transparent; border: 1px solid var(--border); color: var(--text-secondary); padding: 8px 16px; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; font-size: 0.9rem;">
						Скорость ↑
					</button>
					<button class="sort-btn" data-field="maxSpeed" data-order="desc" style="background: transparent; border: 1px solid var(--border); color: var(--text-secondary); padding: 8px 16px; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; font-size: 0.9rem;">
						Скорость ↓
					</button>
				</div>
			</div>

			<div class="vehicles-grid"></div>
		</div>
	`;

    renderVehiclesList();

    const searchInput = container.querySelector('#vehicleSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            updateSearch(e.target.value);
        });
    }
    
    const sortButtons = container.querySelectorAll('.sort-btn');
    sortButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const field = btn.dataset.field;
            const order = btn.dataset.order;
            updateSort(field, order);
        });
    });
}

function renderTuningPage(container) {
    const visualTuningCars = [
        "BMW G90", "Lada Vesta", "Lada Kalina", "GAZ Volga 24", "Dodge Challenger",
        "Porsche 911", "BMW X5 E53", "Lada Priora", "Skoda Octavia", "BMW i8",
        "BMW E36 Coupe", "BMW M5 E60", "Subaru BRZ", "Nissan GT-R", "Toyota Mark II",
        "Lada Niva", "Mercedes G-Class", "Lexus GS F", "Ford Mustang Shelby", "Mercedes C63 AMG",
        "BMW M2", "BMW M3 E46", "Toyota Land Cruiser 300", "BMW 5 Series E39", "Toyota Land Cruiser 200",
        "BMW 5 Series E34", "Lada 2106", "Mercedes E-Class W210", "Lexus IS", "Cadillac Escalade",
        "Ford F-150 Raptor", "Mercedes AMG GT"
    ];

    const visualItems = [
        "Решётка радиатора", "Юбки (пороги)", "Диффузор / Выхлопная система",
        "Сплиттер", "Крылья", "Капоты", "Спойлеры"
    ];

    const techItems = [
        "Двигатель — максимальная скорость и ускорение",
        "Подвеска — занижение и смещение колёс",
        "Колёса — выворот, развал и другие углы",
        "Тонировка — затемнение стёкол"
    ];

    const carsListHtml = visualTuningCars.map(car => `<li>${escapeHtml(car)}</li>`).join('');

    container.innerHTML = `
        <h1 class="page-title">Тюнинг ателье</h1>
        <p class="page-subtitle">Сделай свой автомобиль уникальным — от технических улучшений до визуального стайлинга</p>

        <div class="info-block">
            <h3>О тюнинг ателье</h3>
            <p>Тюнинг ателье — это главное место для всех автолюбителей, которые хотят сделать свой автомобиль быстрее, красивее и комфортнее. Оно расположено в центре Арзамаса, на улице Севастопольской.</p>
            <p>В ателье доступен широкий спектр улучшений: вы сможете повысить максимальную скорость и динамику автомобиля, затонировать стёкла, изменить внешний облик машины с помощью различных элементов тюнинга, настроить развал колёс для лучшей управляемости, отрегулировать подвеску под свой стиль езды и выполнить множество других доработок. Это идеальное место как для любителей дрифта, так и для тех, кто ценит комфортную и стабильную езду по городу.</p>
            <p><strong>📍 Как найти:</strong> <code>/gps → 4. Прочее → 11. Тюнинг центр</code></p>
        </div>

        <div class="info-block" style="text-align: center;">
            <img src="../images/tuning/tuning_center.png" 
                 alt="Тюнинг ателье" 
                 class="clickable-image"
                 data-full-img="../images/tuning/tuning_center.png"
				 data-caption="Тюнинг ателье на улице Севастопольской, Арзамас"
                 style="max-width: 1000px; width: 100%; border-radius: 12px; border: 1px solid var(--border); margin: 0 auto; display: block; cursor: pointer; transition: opacity 0.2s;"
                 onmouseover="this.style.opacity='0.9'"
                 onmouseout="this.style.opacity='1'"
                 onerror="this.onerror=null; this.style.display='none'; this.parentElement.innerHTML='<div class=\'vehicle-img-placeholder\' style=\'padding: 30px; text-align: center; max-width: 400px; margin: 0 auto; cursor: pointer;\'>Изображение тюнинг временно недоступно</div>'">
        </div>

        <div class="info-block">
            <h3>Технический тюнинг (Бокс №2)</h3>
            <p>В боксе №2 доступен технический тюнинг <strong>всех</strong> автомобилей.</p>
            <ul class="info-list">
                ${techItems.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
            </ul>
            <div style="margin-top: 16px; text-align: center;">
                <img src="../images/tuning/tech_box.png" 
                     alt="Бокс технического тюнинга" 
                     class="clickable-image"
                     data-full-img="../images/tuning/tech_box.png"
					 data-caption="Бокс №2 — технический тюнинг"
                     style="max-width: 800px; width: 100%; border-radius: 12px; border: 1px solid var(--border); display: block; margin: 0 auto; cursor: pointer; transition: opacity 0.2s;"
                     onmouseover="this.style.opacity='0.9'"
                     onmouseout="this.style.opacity='1'"
                     onerror="this.onerror=null; this.style.display='none'; this.parentElement.innerHTML='<div class=\'vehicle-img-placeholder\' style=\'padding: 20px; text-align: center; max-width: 350px; margin: 0 auto; cursor: pointer;\'>Изображение временно недоступно</div>'">
            </div>
        </div>

        <div class="info-block">
            <h3>Визуальный тюнинг (Бокс №1)</h3>
            <p>В боксе №1 доступен визуальный тюнинг для <strong>отдельных моделей</strong> автомобилей.</p>
            <ul class="info-list">
                ${visualItems.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
            </ul>
            <div style="margin-top: 16px; text-align: center;">
                <img src="../images/tuning/visual_box.png" 
                     alt="Бокс визуального тюнинга" 
                     class="clickable-image"
                     data-full-img="../images/tuning/visual_box.png"
					 data-caption="Бокс №1 — визуальный тюнинг"
                     style="max-width: 800px; width: 100%; border-radius: 12px; border: 1px solid var(--border); display: block; margin: 0 auto; cursor: pointer; transition: opacity 0.2s;"
                     onmouseover="this.style.opacity='0.9'"
                     onmouseout="this.style.opacity='1'"
                     onerror="this.onerror=null; this.style.display='none'; this.parentElement.innerHTML='<div class=\'vehicle-img-placeholder\' style=\'padding: 20px; text-align: center; max-width: 350px; margin: 0 auto; cursor: pointer;\'>Изображение временно недоступно</div>'">
            </div>
        </div>

        <div class="info-block">
            <h3>Модели, на которые доступен визуальный тюнинг</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 8px;">
                <ul class="info-list" style="margin: 0;">
                    ${carsListHtml}
                </ul>
            </div>
        </div>
    `;

    addImageModal();
}

function addImageModal() {
    if (document.getElementById('imageModal')) return;

    const modal = document.createElement('div');
    modal.id = 'imageModal';
    modal.style.cssText = `
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        z-index: 10000;
        cursor: pointer;
        align-items: center;
        justify-content: center;
        flex-direction: column;
    `;

    modal.innerHTML = `
        <div style="position: relative; max-width: 90%; max-height: 85vh;">
            <img id="modalImage" src="" alt="Увеличенное изображение" style="max-width: 100%; max-height: 85vh; object-fit: contain; border-radius: 8px;">
            <button id="closeModalBtn" style="
                position: absolute;
                top: -50px;
                right: 50;
                background: none;
                border: none;
                color: white;
                font-size: 32px;
                cursor: pointer;
                padding: 8px;
                transition: transform 0.2s;
                z-index: 10001;
            " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">✕</button>
        </div>
        <div id="modalCaption" style="
            margin-top: 16px;
            color: var(--text-secondary);
            font-size: 0.9rem;
            text-align: center;
            max-width: 80%;
            background: rgba(0,0,0,0.6);
            padding: 8px 16px;
            border-radius: 8px;
        "></div>
    `;

    document.body.appendChild(modal);

    const modalImg = document.getElementById('modalImage');
    const modalCaption = document.getElementById('modalCaption');
    const closeBtn = document.getElementById('closeModalBtn');

    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        modalCaption.textContent = '';
    }

    modal.addEventListener('click', closeModal);

    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeModal();
        }
    });

    const images = document.querySelectorAll('.clickable-image');
    images.forEach(img => {
        const newImg = img.cloneNode(true);
        img.parentNode.replaceChild(newImg, img);
        
        newImg.addEventListener('click', (e) => {
            e.stopPropagation();
            const fullImgSrc = newImg.getAttribute('data-full-img') || newImg.src;
            if (fullImgSrc && fullImgSrc !== '') {
                modalImg.src = fullImgSrc;
                const caption = newImg.getAttribute('data-caption') || newImg.alt;
                modalCaption.textContent = caption;
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden'; 
            }
        });
    });
}

function renderPaintJobPage(container) {
    const vinylCarsData = [
        { name: "Audi Q7", imageCount: 3 },
        { name: "Lexus IS-F", imageCount: 3 },
        { name: "Mitsubishi Lancer Evo X", imageCount: 3 },
        { name: "Bentley Continental", imageCount: 3 },
        { name: "BMW M5 E60", imageCount: 3 },
        { name: "BMW 525 e34", imageCount: 3 },
        { name: "BMW X5M", imageCount: 3 },
        { name: "BMW M5 F90", imageCount: 3 },
        { name: "Mazda RX-7", imageCount: 3 },
        { name: "Mercedes-Benz AMG GT 63s", imageCount: 3 },
        { name: "Mercedes-Benz G65", imageCount: 3 },
        { name: "Dodge Challenger SRT", imageCount: 3 },
        { name: "Nissan Silvia s15", imageCount: 3 },
        { name: "Nissan Skyline R33", imageCount: 3 },
        { name: "Toyota Supra", imageCount: 3 },
        { name: "ВАЗ-2114", imageCount: 3 },
        { name: "ВАЗ 2107", imageCount: 3 },
        { name: "Lada Granta", imageCount: 1 }
    ];

    const carsGalleryHtml = vinylCarsData.map(car => {
        let sanitizedName = car.name.replace(/\s+/g, '_').replace(/[^\w\-]/g, '');

        if (car.name === "ВАЗ-2114") sanitizedName = "VAZ-2114";
        if (car.name === "ВАЗ 2107") sanitizedName = "VAZ_2107";
        
        let imagesHtml = '';
        for (let i = 1; i <= car.imageCount; i++) {
            const imagePath = `../images/paintjob/${sanitizedName}_${i}.png`;
            imagesHtml += `
                <div class="vinyl-image-item">
                    <img src="${imagePath}" 
                         alt="${escapeHtml(car.name)} винил ${i}" 
                         class="clickable-image vinyl-img"
                         data-full-img="${imagePath}"
                         data-caption="${escapeHtml(car.name)} - вариант винила ${i}"
                         onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\'vehicle-img-placeholder\'>Изображение не найдено</div>'">
                </div>
            `;
        }

        return `
            <div class="info-block vinyl-car-section">
                <h3>${escapeHtml(car.name)}</h3>
                <div class="vinyl-gallery">
                    ${imagesHtml || '<p>Изображения винилов временно недоступны.</p>'}
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <h1 class="page-title">Покрасочные работы (винилы)</h1>
        <p class="page-subtitle">Уникальные винилы для вашего автомобиля</p>
        
        <div class="info-block">
            <h3>Что такое винилы?</h3>
            <p>Винилы — это уникальные графические наклейки и ливреи, которые полностью меняют внешний вид автомобиля. В отличие от обычной покраски, винилы позволяют создать неповторимый стиль и выделиться среди других игроков. На нашем сервере винилы доступны для целого ряда популярных автомобилей.</p>
        </div>
        
        <div class="info-block">
            <h3>Доступные винилы по моделям</h3>
            <p>Ниже представлены автомобили, для которых на сервере доступны кастомные винилы. Нажмите на изображение, чтобы рассмотреть его в деталях.</p>
        </div>

        ${carsGalleryHtml}

        <div class="info-block">
            <h3>Важная информация</h3>
            <ul class="info-list">
                <li>Тут может быть важная информация.</li>
            </ul>
        </div>
    `;
    addImageModal();
}

function renderWheelsPage(container) {
    const wheelsList = [
        { id: 1, name: "TSW Trackstar"},
        { id: 2, name: "LS 1330"},
        { id: 3, name: "Lexani"},
        { id: 4, name: "Advan RG3"},
        { id: 5, name: "BBS STI"},
        { id: 6, name: "Oettinger SWS" },
        { id: 7, name: "Vossen CV3"},
        { id: 8, name: "Vossen SVT (Metallic Gloss)"},
        { id: 9, name: "BBS RS 242" },
        { id: 10, name: "Vossen CV5"},
        { id: 11, name: "IPW Style"},
        { id: 12, name: "Vossen CV1"},
        { id: 13, name: "Vossen CV7"},
        { id: 14, name: "5Zigen Pro Racer ZR+520"},
        { id: 15, name: "Oettinger RXX"},
        { id: 16, name: "HAMANN UNIQUE"}
    ];

    const wheelsHtml = wheelsList.map(wheel => {
        const imagePath = `../images/wheels/${wheel.id}.png`;
        
        return `
            <div class="vehicle-card wheel-card" style="display: flex; flex-direction: column; overflow: hidden;">
                <div class="vehicle-card-image" style="background: #0a0e14; display: flex; align-items: center; justify-content: center; min-height: 160px; cursor: pointer;">
                    <img src="${imagePath}" 
                         alt="${escapeHtml(wheel.name)}" 
                         class="clickable-image"
                         data-full-img="${imagePath}"
                         data-caption="${escapeHtml(wheel.name)} (ID: ${wheel.id})"
                         style="width: 100%; height: auto; max-height: 160px; object-fit: contain; padding: 16px;"
                         onerror="this.onerror=null; this.parentElement.innerHTML='<div style=\'height: 160px; display: flex; align-items: center; justify-content: center; background: var(--card-bg); color: var(--text-secondary); cursor: pointer;\' class=\'clickable-image\' data-full-img=\'${imagePath}\' data-caption=\'${escapeHtml(wheel.name)} (ID: ${wheel.id})\'>🛞 Фото нет</div>'">
                </div>
                <div class="vehicle-card-name" style="justify-content: space-between; align-items: center; padding: 12px 16px;">
                    <span class="vehicle-title-link" style="font-size: 0.95rem; font-weight: 600;">${escapeHtml(wheel.name)}</span>
                    <span class="vehicle-year" style="background: var(--accent); color: #000; padding: 2px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">ID: ${wheel.id}</span>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <h1 class="page-title">Диски</h1>
        <p class="page-subtitle">Подберите идеальный стиль для своего автомобиля — полный каталог дисков на сервере GreenTech RP</p>
        
        <div class="vehicles-grid" style="grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px;">
            ${wheelsHtml}
        </div>
    `;

    addImageModal();
}

document.addEventListener('DOMContentLoaded', () => {
    const vehiclesContainer = document.getElementById('vehiclesContent');
    const tuningContainer = document.getElementById('tuningContent');
    const paintjobContainer = document.getElementById('paintjobContent');
    const wheelsContainer = document.getElementById('wheelsContent');
    
    if (vehiclesContainer && typeof VEHICLES_DATA !== 'undefined') {
        renderVehicleList(vehiclesContainer);
    }
    if (tuningContainer && typeof VEHICLES_DATA !== 'undefined') {
        renderTuningPage(tuningContainer);
    }
    if (paintjobContainer && typeof VEHICLES_DATA !== 'undefined') {
        renderPaintJobPage(paintjobContainer);
    }
    if (wheelsContainer && typeof VEHICLES_DATA !== 'undefined') {
        renderWheelsPage(wheelsContainer);
    }
});