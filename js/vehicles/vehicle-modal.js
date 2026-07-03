import { escapeHtml, getValue, getDealerDisplay } from './helpers.js';
import { GTACharacterViewer } from '../gta-viewer.js';

function isMobileDevice() {
    return window.innerWidth < 768;
}

function normalizeVehicle(vehicle) {
    return {
        ...vehicle,
        drive: vehicle.drive || 'н/д',
        transmission: vehicle.transmission || 'н/д',
        tankCapacity: vehicle.tankCapacity || 'н/д',
        tuningAvailable: vehicle.tuningAvailable !== undefined ? vehicle.tuningAvailable : true,
        seats: vehicle.seats || 'н/д',
        zeroToHundred: vehicle.zeroToHundred || 'н/д',
        maxAcceleration: vehicle.maxAcceleration || 'н/д',
        doorAngles: vehicle.doorAngles || {},
        enableDoors: vehicle.enableDoors !== undefined ? vehicle.enableDoors : true
    };
}

let activeViewer = null;

export function createVehicleModal(vehicle) {
    let modal = document.getElementById('vehicleDetailModal');
    if (modal) {
        modal.remove();
    }

    const v = normalizeVehicle(vehicle);
    const isMobile = isMobileDevice();

    const name = escapeHtml(v.name);
    const modelId = v.id || 'н/д';
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
    const showDoorsButton = v.enableDoors !== false;

    modal = document.createElement('div');
    modal.id = 'vehicleDetailModal';
    modal.className = 'vehicle-modal-overlay';
    modal._vehicleData = vehicle;

    modal.style.cssText = `
        display: flex;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(8px);
        z-index: 10001;
        align-items: center;
        justify-content: center;
        animation: modalFadeIn 0.25s ease;
        ${isMobile ? 'padding: 0;' : ''}
    `;

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
        max-width: 1200px;
        width: 94%;
        max-height: 92vh;
        overflow-y: auto;
        border: 1px solid var(--border, #21262d);
        box-shadow: 0 24px 64px rgba(0, 0, 0, 0.7);
        position: relative;
    `;

    modal.innerHTML = `
        <div style="${contentStyles}">
            <button id="closeVehicleModal" class="modal-close-btn" style="
                position: absolute;
                top: ${isMobile ? '12px' : '16px'};
                right: ${isMobile ? '12px' : '16px'};
                z-index: 20;
                background: rgba(255,255,255,0.08);
                border: 1px solid var(--border, #21262d);
                color: var(--text-secondary);
                font-size: 18px;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            " 
            onmouseover="this.style.background='rgba(248,81,73,0.25)'; this.style.color='#fff'; this.style.borderColor='#f85149'" 
            onmouseout="this.style.background='rgba(255,255,255,0.08)'; this.style.color='var(--text-secondary)'; this.style.borderColor='var(--border, #21262d)'">
                ✕
            </button>

            <div style="padding: ${isMobile ? '16px 16px 20px 16px' : '24px 28px 28px 28px'};">
                <div style="display: flex; flex-direction: column; gap: 8px; padding-bottom: 14px; border-bottom: 1px solid var(--border, #21262d);">
                    <h2 style="color: #fff; font-size: ${isMobile ? '1.3rem' : '1.6rem'}; font-weight: 700; margin: 0; line-height: 1.3;">${name}</h2>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
                        <span style="
                            background: rgba(46, 164, 79, 0.12);
                            color: var(--accent, #3fb950);
                            padding: 3px 16px;
                            border-radius: 20px;
                            font-size: ${isMobile ? '0.7rem' : '0.75rem'};
                            font-weight: 500;
                            border: 1px solid rgba(46, 164, 79, 0.15);
                        ">${year}</span>
                        <span style="
                            background: rgba(255,255,255,0.04);
                            color: var(--text-secondary);
                            padding: 3px 16px;
                            border-radius: 20px;
                            font-size: ${isMobile ? '0.7rem' : '0.75rem'};
                            font-weight: 500;
                            border: 1px solid var(--border, #21262d);
                        ">${vehicleClass}</span>
                        <span style="
                            background: rgba(255,255,255,0.04);
                            color: var(--text-secondary);
                            padding: 3px 12px;
                            border-radius: 20px;
                            font-size: ${isMobile ? '0.65rem' : '0.7rem'};
                            font-weight: 500;
                            border: 1px solid var(--border, #21262d);
                            font-family: monospace;
                        ">ID: ${modelId}</span>
                    </div>
                </div>

                <div style="
                    display: ${isMobile ? 'flex' : 'grid'};
                    ${isMobile ? 'flex-direction: column;' : 'grid-template-columns: 1.2fr 1fr;'}
                    gap: ${isMobile ? '12px' : '20px'};
                    margin: ${isMobile ? '12px 0' : '16px 0'};
                ">
                    <div style="position: relative;">
                        <div id="vehicle3dViewerContainer" style="
                            background: #0a0e14;
                            border-radius: 14px;
                            overflow: hidden;
                            border: 1px solid var(--border, #21262d);
                            aspect-ratio: ${isMobile ? '4/3' : '4/3'};
                            min-height: ${isMobile ? '200px' : '300px'};
                            position: relative;
                        ">
                            <div id="vehicle3dLoader" style="
                                position: absolute;
                                top: 0;
                                left: 0;
                                width: 100%;
                                height: 100%;
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                justify-content: center;
                                background: #0a0e14;
                                color: var(--text-secondary);
                                gap: 12px;
                                z-index: 5;
                                border-radius: 14px;
                            ">
                                <i class="fas fa-car" style="font-size: 36px; opacity: 0.3;"></i>
                                <span>Загрузка 3D модели...</span>
                            </div>
                        </div>
                        
                        ${showDoorsButton ? `
                            <button id="toggleDoorsBtn" style="
                                position: absolute;
                                bottom: 16px;
                                left: 16px;
                                z-index: 10;
                                background: rgba(0,0,0,0.7);
                                border: 1px solid rgba(255,255,255,0.15);
                                color: #fff;
                                padding: 8px 16px;
                                border-radius: 8px;
                                cursor: pointer;
                                font-size: 0.75rem;
                                display: flex;
                                align-items: center;
                                gap: 6px;
                                transition: all 0.2s ease;
                                backdrop-filter: blur(4px);
                            "
                            onmouseover="this.style.borderColor='rgba(255,255,255,0.4)'"
                            onmouseout="if(!this.dataset.open) { this.style.borderColor='rgba(255,255,255,0.15)' }">
                                <i class="fas fa-door-open"></i>
                                <span>Открыть двери</span>
                            </button>
                        ` : ''}
                    </div>

                    <div style="
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: ${isMobile ? '6px' : '8px'};
                        align-content: start;
                    ">
                        ${createStatCard('Макс. скорость', maxSpeed, 'км/ч', isMobile)}
                        ${createStatCard('Разгон 0-100', zeroToHundred, 'сек', isMobile)}
                        ${createStatCard('Мощность', power, 'кВт/л.с.', isMobile)}
                        ${createStatCard('Топливо', fuelType, consumption !== 'н/д' ? consumption : '', isMobile, fuelIcon)}
                    </div>
                </div>

                <div style="
                    display: ${isMobile ? 'flex' : 'grid'};
                    ${isMobile ? 'flex-direction: column;' : 'grid-template-columns: 1fr 1fr 1fr;'}
                    gap: ${isMobile ? '12px' : '16px'};
                    padding: ${isMobile ? '8px 0' : '12px 0'};
                    border-top: 1px solid var(--border, #21262d);
                    margin-top: 4px;
                ">
                    <div>
                        <div style="color: var(--accent, #3fb950); font-size: ${isMobile ? '0.55rem' : '0.6rem'}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 8px;">
                            Технические
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 3px;">
                            ${createDetailRow('Разгон 0-MAX', `${maxAccel} с`, isMobile)}
                            ${createDetailRow('Класс', vehicleClass, isMobile)}
                            ${createDetailRow('Привод', drive, isMobile)}
                            ${createDetailRow('КПП', transmission, isMobile)}
                        </div>
                    </div>

                    <div>
                        <div style="color: var(--accent, #3fb950); font-size: ${isMobile ? '0.55rem' : '0.6rem'}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 8px;">
                            Общее
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 3px;">
                            ${createDetailRow('Место покупки', dealer, isMobile)}
                            ${createDetailRow('Мест', seats, isMobile)}
                            ${createDetailRow('Бак', v.fuel === "Электро" ? `${tankCapacity}%` : `${tankCapacity} л`, isMobile)}
                            ${createDetailRow('Тюнинг', tuningStatus, isMobile, tuningColor)}
                        </div>
                    </div>

                    <div>
                        <div style="color: var(--accent, #3fb950); font-size: ${isMobile ? '0.55rem' : '0.6rem'}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 8px;">
                            Стоимость
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 3px;">
                            ${createDetailRow('Покупка', priceDisplay, isMobile, '#50C878')}
                            ${createDetailRow('Продажа (мин)', minPrice, isMobile)}
                            ${createDetailRow('Продажа (макс)', maxPrice, isMobile)}
                        </div>
                    </div>
                </div>

                ${v.tuningAvailable && tuningList.length > 0 ? `
                <div style="
                    margin-top: ${isMobile ? '10px' : '14px'};
                    padding-top: ${isMobile ? '10px' : '12px'};
                    border-top: 1px solid var(--border, #21262d);
                ">
                    <div style="color: var(--accent, #3fb950); font-size: ${isMobile ? '0.55rem' : '0.6rem'}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 8px;">
                        Доступный тюнинг
                    </div>
                    <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                        ${tuningList.map(item => `
                            <span style="
                                background: rgba(255,255,255,0.04);
                                color: var(--text-secondary);
                                padding: ${isMobile ? '4px 12px' : '4px 14px'};
                                border-radius: 14px;
                                font-size: ${isMobile ? '0.7rem' : '0.75rem'};
                                border: 1px solid var(--border, #21262d);
                            ">${item}</span>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const viewerContainer = document.getElementById('vehicle3dViewerContainer');
    const loaderEl = document.getElementById('vehicle3dLoader');
    const toggleBtn = document.getElementById('toggleDoorsBtn');
    
    if (toggleBtn) {
        let isOpen = false;
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (activeViewer) {
                isOpen = !isOpen;
                const icon = toggleBtn.querySelector('i');
                const span = toggleBtn.querySelector('span');
                
                if (isOpen) {
                    activeViewer.openAllDoors();
                    span.textContent = 'Закрыть двери';
                    if (icon) {
                        icon.className = 'fas fa-door-closed';
                    }
                    toggleBtn.style.borderColor = 'rgba(255,255,255,0.3)';
                    toggleBtn.style.background = 'rgba(0,0,0,0.7)';
                    toggleBtn.dataset.open = 'true';
                } else {
                    activeViewer.closeAllDoors();
                    span.textContent = 'Открыть двери';
                    if (icon) {
                        icon.className = 'fas fa-door-open';
                    }
                    toggleBtn.style.borderColor = 'rgba(255,255,255,0.15)';
                    toggleBtn.style.background = 'rgba(0,0,0,0.7)';
                    toggleBtn.dataset.open = 'false';
                }
            }
        });
    }

    if (viewerContainer) {
        if (activeViewer) {
            if (activeViewer.container) {
                while (activeViewer.container.firstChild) {
                    activeViewer.container.removeChild(activeViewer.container.firstChild);
                }
            }
            activeViewer = null;
        }

        setTimeout(async () => {
            try {
                activeViewer = new GTACharacterViewer(viewerContainer);

                if (loaderEl) loaderEl.style.display = 'none';

                const dffPath = v.id ? `../models/vehicles/${v.id}.dff` : null;
                const txdPath = v.id ? `../models/vehicles/${v.id}.txd` : null;
                
                if (dffPath && txdPath) {
                    await activeViewer.loadModel(dffPath, txdPath, null, v);
                    
                    if (activeViewer.currentModel) {
                        activeViewer.currentModel.rotation.x = 90 * Math.PI / 180;
                        activeViewer.currentModel.rotation.y = 180 * Math.PI / 180;
                        activeViewer.currentModel.rotation.z = 90 * Math.PI / 180;

                        activeViewer.resetCamera();
                    }
                } else {
                    if (loaderEl) {
                        loaderEl.innerHTML = `
                            <i class="fas fa-car" style="font-size: 36px; opacity: 0.3;"></i>
                            <span style="font-size: 0.85rem;">3D модель временно недоступна</span>
                        `;
                        loaderEl.style.display = 'flex';
                    }
                }
            } catch (error) {
                console.error('Ошибка инициализации 3D просмотрщика:', error);
                if (loaderEl) {
                    loaderEl.innerHTML = `
                        <i class="fas fa-exclamation-triangle" style="font-size: 28px; color: #f85149; opacity: 0.6;"></i>
                        <span style="font-size: 0.85rem;">Ошибка загрузки 3D</span>
                    `;
                    loaderEl.style.display = 'flex';
                }
            }
        }, 100);
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeVehicleModal();
        }
    });

    const closeBtn = document.getElementById('closeVehicleModal');
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeVehicleModal();
        });
    }

    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closeVehicleModal();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);

    document.body.style.overflow = 'hidden';
    if (isMobile) {
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
    }

    function closeVehicleModal() {
        if (activeViewer) {
            if (typeof activeViewer.destroy === 'function') {
                activeViewer.destroy();
            } else {
                if (activeViewer.container) {
                    while (activeViewer.container.firstChild) {
                        activeViewer.container.removeChild(activeViewer.container.firstChild);
                    }
                }
            }
            activeViewer = null;
        }
        
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
        }
    }

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

function createDetailRow(label, value, isMobile, valueColor = '#fff') {
    return `
        <div style="display: flex; justify-content: space-between; padding: 3px 0; font-size: ${isMobile ? '0.78rem' : '0.82rem'}; border-bottom: 1px solid rgba(255,255,255,0.03);">
            <span style="color: var(--text-secondary);">${label}</span>
            <span style="color: ${valueColor}; ${label === 'Покупка' ? 'font-weight: 600;' : ''}">${value}</span>
        </div>
    `;
}

export function initVehicleModalClicks() {
    const cards = document.querySelectorAll('.vehicle-card');
    
    cards.forEach(card => {
        const newCard = card.cloneNode(true);
        card.parentNode.replaceChild(newCard, card);

        newCard.addEventListener('click', (e) => {
            if (e.target.closest('a') || e.target.closest('button')) return;
            
            const vehicleName = newCard.dataset.name;
            if (!vehicleName) return;

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

window.addEventListener('resize', () => {
    const modal = document.getElementById('vehicleDetailModal');
    if (modal) {
        const wasMobile = !modal.classList.contains('desktop-modal');
        const isMobile = isMobileDevice();
        
        if (wasMobile !== isMobile) {
            const vehicleData = modal._vehicleData;
            if (vehicleData) {
                createVehicleModal(vehicleData);
            }
        }
    }
});