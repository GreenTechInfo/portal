// js/vehicles/vehicle-list.js

import { escapeHtml, getValue, getDealerDisplay, getNumericValue } from './helpers.js';
import { initVehicleModalClicks } from './vehicle-modal.js';

let currentVehicles = [];
let currentSort = { field: 'price', order: 'asc' };
let currentSearchTerm = '';

/**
 * Нормализует данные автомобиля, добавляя значения по умолчанию для отсутствующих полей
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

export function renderVehicleList(container) {
    currentVehicles = [...VEHICLES_DATA.vehicles];

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

    const renderVehiclesList = () => {
        const vehicles = filterAndSortVehicles();
        const grid = container.querySelector('.vehicles-grid');

        if (!grid) return;

        if (vehicles.length === 0) {
            grid.innerHTML = '<p style="text-align: center; padding: 40px;">Транспорт не найден</p>';
            return;
        }

        const vehiclesHtml = vehicles.map(v => {
            // Нормализуем данные для отображения в карточке
            const normalizedV = normalizeVehicle(v);
            
            const maxSpeed = getValue(v.maxSpeed);
            const zeroToHundred = getValue(normalizedV.zeroToHundred);
            const maxAccel = getValue(normalizedV.maxAcceleration);
            const fuelType = getValue(v.fuel);
            const consumption = getValue(v.consumption);
            const power = getValue(v.power);
            
            let priceDisplay = "";

            if (v.saleType === "Правительство") {
                priceDisplay = "Правительство";
            } else if (!v.price || v.price === 0) {
                priceDisplay = "Недоступно для покупки";
            } else {
                priceDisplay = v.price.toLocaleString() + " ₽";
            }
            
            const year = getValue(v.year);
            const seats = getValue(normalizedV.seats);

            const fuelIcon = fuelType === "Электро" ? "fa-bolt" : "fa-gas-pump";

            const imagePath = v.id ? `../images/vehicles/${v.id}.png` : null;

            return `
                <div class="vehicle-card" data-name="${v.name.toLowerCase()}">
                    <div class="vehicle-card-image">
                        ${imagePath ? 
                            `<img src="${imagePath}" alt="${escapeHtml(v.name)}" 
                                 onerror="this.onerror=null; this.parentElement.innerHTML='<div class=&quot;vehicle-img-placeholder&quot; style=&quot;height: 160px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #0d1117, #161c24); color: var(--text-secondary);&quot;>Фото пока нет</div>'"
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
                                <span class="spec-value">${fuelType !== "н/д" ? fuelType : "н/д"}</span>
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
        
        // Инициализируем клики для открытия модального окна
        initVehicleModalClicks();
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
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
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