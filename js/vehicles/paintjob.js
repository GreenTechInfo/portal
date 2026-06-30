// js/vehicles/paintjob.js

import { escapeHtml } from './helpers.js';
import { addImageModal, initImageModalClicks } from './image-modal.js';

export function renderPaintJobPage(container) {
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
    initImageModalClicks();
}