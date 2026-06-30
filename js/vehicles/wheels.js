// js/vehicles/wheels.js

import { escapeHtml } from './helpers.js';
import { addImageModal, initImageModalClicks } from './image-modal.js';

export function renderWheelsPage(container) {
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
    initImageModalClicks();
}