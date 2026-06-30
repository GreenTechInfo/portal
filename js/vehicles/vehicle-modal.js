// js/vehicles/vehicle-modal.js

import { escapeHtml, getValue, getDealerDisplay } from './helpers.js';

/**
 * Проверка на мобильное устройство
 */
function isMobileDevice() {
    return window.innerWidth < 768;
}

/**
 * Нормализует данные автомобиля для отображения в модальном окне
 */
function normalizeVehicle(vehicle) {
    return {
        ...vehicle,
        drive: vehicle.drive || 'н/д',
        transmission: vehicle.transmission || 'н/д',
        tankCapacity: vehicle.tankCapacity || 'н/д',
        tuningAvailable: vehicle.tuningAvailable !== undefined ? vehicle.tuningAvailable : true,
        seats: vehicle.seats || 'н/д',
        zeroToHundred: vehicle.zeroToHundred || 'н/д',
        maxAcceleration: vehicle.maxAcceleration || 'н/д'
    };
}

/**
 * Создает модальное окно для детального просмотра автомобиля
 */
export function createVehicleModal(vehicle) {
    // Удаляем предыдущее модальное окно если есть
    let modal = document.getElementById('vehicleDetailModal');
    if (modal) {
        modal.remove();
    }

    const v = normalizeVehicle(vehicle);
    const isMobile = isMobileDevice();

    // Подготовка данных
    const name = escapeHtml(v.name);
    const maxSpeed = getValue(v.maxSpeed);
    const zeroToHundred = getValue(v.zeroToHundred);
    const maxAccel = getValue(v.maxAcceleration);
    const fuelType = getValue(v.fuel);
    const consumption = getValue(v.consumption);
    const dealer = getDealerDisplay(v);
    const seats = getValue(v.seats);
    const power = getValue(v.power);
    const vehicleClass = getValue(v.class);
    const year = getValue(v.year);
    const drive = getValue(v.drive);
    const transmission = getValue(v.transmission);
    const tankCapacity = getValue(v.tankCapacity);
    const tuningStatus = v.tuningAvailable ? 'Доступен' : 'Недоступен';
    const tuningColor = v.tuningAvailable ? 'var(--accent, #3fb950)' : 'var(--danger, #f85149)';
	
	const defaultTuning = [];
	const tuningList = v.tuningTypes && Array.isArray(v.tuningTypes) && v.tuningTypes.length > 0 
		? v.tuningTypes 
		: defaultTuning;

    // Расчет цен
    let priceDisplay = '';
    let minPrice = 'н/д';
    let maxPrice = 'н/д';
    
	if (v.saleType === "Правительство") {
        priceDisplay = 'Правительство';
    } else if (!v.price || v.price === 0) {
        priceDisplay = 'Недоступно для покупки';
    } else {
        priceDisplay = v.price.toLocaleString() + ' ₽';
        const minSell = Math.floor(v.price * 0.475);
		const maxSell = Math.floor(v.price * 0.95);
        minPrice = minSell.toLocaleString() + ' ₽';
        maxPrice = maxSell.toLocaleString() + ' ₽';
    }

    const fuelIcon = fuelType === "Электро" ? 'fa-bolt' : 'fa-gas-pump';
    const imagePath = v.id ? `../images/vehicles/${v.id}.png` : null;

    // Создаем модальное окно
    modal = document.createElement('div');
    modal.id = 'vehicleDetailModal';
    modal.className = 'vehicle-modal-overlay';
    
    // Сохраняем данные автомобиля для возможного пересоздания при ресайзе
    modal._vehicleData = vehicle;
    
    // Базовые стили модального окна
    modal.style.cssText = `
        display: flex;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(6px);
        z-index: 10001;
        align-items: center;
        justify-content: center;
        animation: modalFadeIn 0.25s ease;
        ${isMobile ? 'padding: 0;' : ''}
    `;

    // Контент модального окна
    const contentStyles = isMobile ? `
        background: var(--card-bg, #181f2a);
        border-radius: 0;
        width: 100%;
        height: 100%;
        max-height: 100vh;
        overflow-y: auto;
        overflow-x: hidden;
        border: none;
        box-shadow: none;
        position: relative;
    ` : `
        background: var(--card-bg, #181f2a);
        border-radius: 20px;
        max-width: 1100px;
        width: 94%;
        max-height: 90vh;
        overflow-y: auto;
        border: 1px solid var(--border, #21262d);
        box-shadow: 0 24px 64px rgba(0, 0, 0, 0.7);
        position: relative;
    `;

    // Единый стиль заголовка для всех версий - год и класс ПОД названием
    const headerStyles = isMobile ? `
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 0 0 12px 0;
        border-bottom: 1px solid var(--border, #21262d);
    ` : `
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 0 0 16px 0;
        border-bottom: 1px solid var(--border, #21262d);
    `;

    const titleSize = isMobile ? '1.3rem' : '1.8rem';
    const badgeSize = isMobile ? '0.75rem' : '0.8rem';

    modal.innerHTML = `
        <div style="${contentStyles}">
            <!-- Кнопка закрытия - абсолютное позиционирование, не занимает места в потоке -->
            <button id="closeVehicleModal" class="modal-close-btn" style="
                position: absolute;
                top: ${isMobile ? '12px' : '20px'};
                right: ${isMobile ? '12px' : '20px'};
                z-index: 20;
                background: rgba(255,255,255,0.05);
                border: 1px solid var(--border, #21262d);
                color: var(--text-secondary);
                font-size: 18px;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            " 
            onmouseover="this.style.background='rgba(248,81,73,0.2)'; this.style.color='#fff'" 
            onmouseout="this.style.background='rgba(255,255,255,0.05)'; this.style.color='var(--text-secondary)'">
                ✕
            </button>

            <div style="padding: ${isMobile ? '16px 16px 20px 16px' : '28px 32px 28px 32px'};">
                
                <!-- Заголовок -->
                <div style="${headerStyles}">
                    <h2 style="color: #fff; font-size: ${titleSize}; font-weight: 700; margin: 0; line-height: 1.3;">${name}</h2>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <span style="
                            background: rgba(46, 164, 79, 0.12);
                            color: var(--accent, #3fb950);
                            padding: 3px 16px;
                            border-radius: 20px;
                            font-size: ${badgeSize};
                            font-weight: 500;
                            border: 1px solid rgba(46, 164, 79, 0.15);
                            letter-spacing: 0.3px;
                        ">${year}</span>
                        <span style="
                            background: rgba(255,255,255,0.04);
                            color: var(--text-secondary);
                            padding: 3px 16px;
                            border-radius: 20px;
                            font-size: ${badgeSize};
                            font-weight: 500;
                            border: 1px solid var(--border, #21262d);
                            letter-spacing: 0.3px;
                        ">${vehicleClass}</span>
                    </div>
                </div>

                <!-- Изображение + краткие характеристики -->
                <div style="
                    display: ${isMobile ? 'flex' : 'grid'};
                    ${isMobile ? 'flex-direction: column;' : 'grid-template-columns: 1fr 1fr;'}
                    gap: ${isMobile ? '12px' : '24px'};
                    margin: ${isMobile ? '12px 0' : '20px 0 24px 0'};
                ">
                    <!-- Изображение -->
                    <div style="
                        background: #0a0e14;
                        border-radius: 14px;
                        overflow: hidden;
                        border: 1px solid var(--border, #21262d);
                        aspect-ratio: ${isMobile ? '16/9' : '16/10'};
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">
                        ${imagePath ? 
                            `<img src="${imagePath}" alt="${name}" style="width: 100%; object-fit: contain;">` :
                            `<div style="color: var(--text-secondary); font-size: 0.9rem; opacity: 0.4;">Фото отсутствует</div>`
                        }
                    </div>

                    <!-- Краткие характеристики -->
                    <div style="
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: ${isMobile ? '6px' : '10px'};
                        align-content: start;
                    ">
                        ${createStatCard('Макс. скорость', maxSpeed, 'км/ч', isMobile)}
                        ${createStatCard('Разгон 0-100', zeroToHundred, 'сек', isMobile)}
                        ${createStatCard('Мощность', power, 'кВт/л.с.', isMobile)}
                        ${createStatCard('Топливо', fuelType, consumption !== 'н/д' ? consumption : '', isMobile, fuelIcon)}
                    </div>
                </div>

                <!-- Детальные характеристики -->
                <div style="
                    display: ${isMobile ? 'flex' : 'grid'};
                    ${isMobile ? 'flex-direction: column;' : 'grid-template-columns: 1fr 1fr 1fr;'}
                    gap: ${isMobile ? '16px' : '20px'};
                    padding: ${isMobile ? '12px 0' : '18px 0'};
                ">
                    <!-- Технические -->
                    <div>
                        <div style="color: var(--accent, #3fb950); font-size: ${isMobile ? '0.6rem' : '0.65rem'}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 10px;">
                            Технические
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            ${createDetailRow('Разгон 0-MAX', `${maxAccel} с`, isMobile)}
                            ${createDetailRow('Класс', vehicleClass, isMobile)}
                            ${createDetailRow('Привод', drive, isMobile)}
                            ${createDetailRow('КПП', transmission, isMobile)}
                        </div>
                    </div>

                    <!-- Общее -->
                    <div>
                        <div style="color: var(--accent, #3fb950); font-size: ${isMobile ? '0.6rem' : '0.65rem'}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 10px;">
                            Общее
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            ${createDetailRow('Место покупки', dealer, isMobile)}
                            ${createDetailRow('Мест', seats, isMobile)}
                            ${createDetailRow('Бак', v.fuel === "Электро" ? `${tankCapacity}%` : `${tankCapacity} л`, isMobile)}
                            ${createDetailRow('Тюнинг', tuningStatus, isMobile, tuningColor)}
                        </div>
                    </div>

                    <!-- Стоимость -->
                    <div>
                        <div style="color: var(--accent, #3fb950); font-size: ${isMobile ? '0.6rem' : '0.65rem'}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 10px;">
                            Стоимость
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            ${createDetailRow('Покупка', priceDisplay, isMobile, '#50C878')}
                            ${createDetailRow('Продажа (мин)', minPrice, isMobile)}
                            ${createDetailRow('Продажа (макс)', maxPrice, isMobile)}
                        </div>
                    </div>
                </div>

                ${v.tuningAvailable ? `
				<div style="
					margin-top: ${isMobile ? '12px' : '18px'};
					padding-top: ${isMobile ? '12px' : '16px'};
				">
					<div style="color: var(--accent, #3fb950); font-size: ${isMobile ? '0.6rem' : '0.65rem'}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 10px;">
						Доступный тюнинг
					</div>
					<div style="display: flex; flex-wrap: wrap; gap: 8px;">
						${tuningList.map(item => `
							<span style="
								background: rgba(255,255,255,0.04);
								color: var(--text-secondary);
								padding: ${isMobile ? '6px 14px' : '5px 16px'};
								border-radius: 16px;
								font-size: ${isMobile ? '0.8rem' : '0.78rem'};
								border: 1px solid var(--border, #21262d);
								transition: all 0.2s ease;
							">${item}</span>
						`).join('')}
					</div>
				</div>
				` : ''}
                
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Закрытие по клику на оверлей
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeVehicleModal();
        }
    });

    // Закрытие по кнопке
    const closeBtn = document.getElementById('closeVehicleModal');
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeVehicleModal();
        });
    }

    // Закрытие по Escape
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closeVehicleModal();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);

    // Блокировка скролла body
    document.body.style.overflow = 'hidden';
    
    // Предотвращение скролла body на iOS
    if (isMobile) {
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
    }

    function closeVehicleModal() {
        const modalEl = document.getElementById('vehicleDetailModal');
        if (modalEl) {
            modalEl.style.opacity = '0';
            modalEl.style.transition = 'opacity 0.2s ease';
            setTimeout(() => {
                modalEl.remove();
                document.body.style.overflow = '';
                if (isMobile) {
                    document.body.style.position = '';
                    document.body.style.width = '';
                }
            }, 200);
        } else {
            document.body.style.overflow = '';
            if (isMobile) {
                document.body.style.position = '';
                document.body.style.width = '';
            }
        }
    }

    // Добавляем стили если их еще нет
    if (!document.getElementById('vehicleModalStyles')) {
        const style = document.createElement('style');
        style.id = 'vehicleModalStyles';
        style.textContent = `
            @keyframes modalFadeIn {
                from { opacity: 0; transform: scale(0.96); }
                to { opacity: 1; transform: scale(1); }
            }
            
            @keyframes modalFadeInMobile {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .vehicle-modal-overlay {
                -webkit-overflow-scrolling: touch;
            }
            
            @media (max-width: 767px) {
                .vehicle-modal-overlay {
                    animation: modalFadeInMobile 0.25s ease !important;
                }
                
                .vehicle-modal-overlay * {
                    -webkit-tap-highlight-color: transparent;
                }
                
                .modal-close-btn {
                    width: 44px !important;
                    height: 44px !important;
                    font-size: 20px !important;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Создает карточку характеристики
 */
function createStatCard(label, value, unit, isMobile, icon = null) {
    return `
        <div style="
            background: rgba(255,255,255,0.03);
            border-radius: 10px;
            padding: ${isMobile ? '10px 12px' : '12px 14px'};
            border: 1px solid var(--border, #21262d);
            text-align: center;
            transition: all 0.2s ease;
        ">
            <div style="color: var(--text-secondary); font-size: ${isMobile ? '0.55rem' : '0.6rem'}; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 2px;">${label}</div>
            <div style="color: #fff; font-size: ${isMobile ? '1.1rem' : '1.3rem'}; font-weight: 600;">
                ${icon ? `<i class="fas ${icon}" style="font-size: ${isMobile ? '0.8rem' : '0.9rem'}; margin-right: 4px; color: var(--accent, #3fb950);"></i>` : ''}
                ${value}
            </div>
            ${unit ? `<div style="color: var(--text-secondary); font-size: ${isMobile ? '0.6rem' : '0.65rem'};">${unit}</div>` : ''}
        </div>
    `;
}

/**
 * Создает строку детальной характеристики
 */
function createDetailRow(label, value, isMobile, valueColor = '#fff') {
    return `
        <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: ${isMobile ? '0.8rem' : '0.85rem'}; border-bottom: 1px solid rgba(255,255,255,0.04);">
            <span style="color: var(--text-secondary);">${label}</span>
            <span style="color: ${valueColor}; ${label === 'Покупка' ? 'font-weight: 600;' : ''}">${value}</span>
        </div>
    `;
}

/**
 * Инициализирует клики на карточках автомобилей
 */
export function initVehicleModalClicks() {
    const cards = document.querySelectorAll('.vehicle-card');
    
    cards.forEach(card => {
        const newCard = card.cloneNode(true);
        card.parentNode.replaceChild(newCard, card);

        newCard.addEventListener('click', (e) => {
            // Игнорируем клики по ссылкам и кнопкам внутри карточки
            if (e.target.closest('a') || e.target.closest('button')) return;
            
            const vehicleName = newCard.dataset.name;
            if (!vehicleName) return;

            // Проверяем наличие глобального объекта с данными
            if (typeof VEHICLES_DATA === 'undefined') {
                console.error('VEHICLES_DATA не найден');
                return;
            }

            const vehicle = VEHICLES_DATA.vehicles.find(v => 
                v.name.toLowerCase() === vehicleName.toLowerCase()
            );

            if (vehicle) {
                createVehicleModal(vehicle);
            } else {
                console.error(`Автомобиль "${vehicleName}" не найден в данных`);
            }
        });

        newCard.style.cursor = 'pointer';
    });
}

// Обработчик изменения размера окна для адаптивности
window.addEventListener('resize', () => {
    const modal = document.getElementById('vehicleDetailModal');
    if (modal) {
        const wasMobile = !modal.classList.contains('desktop-modal');
        const isMobile = isMobileDevice();
        
        if (wasMobile !== isMobile) {
            // Если режим изменился, пересоздаем модальное окно
            const vehicleData = modal._vehicleData;
            if (vehicleData) {
                createVehicleModal(vehicleData);
            }
        }
    }
});