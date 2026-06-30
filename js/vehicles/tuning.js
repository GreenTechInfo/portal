// js/vehicles/tuning.js

import { escapeHtml, getValue, getDealerDisplay, getNumericValue } from './helpers.js';
import { addImageModal, initImageModalClicks } from './image-modal.js';

export function renderTuningPage(container) {
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

    // Инициализируем модальное окно
    addImageModal();
    initImageModalClicks();
}