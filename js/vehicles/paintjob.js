import { escapeHtml } from './helpers.js';
import { GTACharacterViewer } from '../gta-viewer.js';

let activeViewer = null;

const VINYL_CARS_DATA = [
    { name: "Audi Q7", imageCount: 3, vehicleId: 400, doorAngles: null, enableDoors: true },
    { name: "Lexus IS-F", imageCount: 3, vehicleId: 402, doorAngles: null, enableDoors: true },
    { name: "Mitsubishi Lancer Evo X", imageCount: 3, vehicleId: 415, doorAngles: null, enableDoors: true },
    { name: "Bentley Continental", imageCount: 3, vehicleId: 451, doorAngles: null, enableDoors: true },
    { name: "BMW M5 E60", imageCount: 3, vehicleId: 466, doorAngles: null, enableDoors: true },
    { name: "BMW 525 e34", imageCount: 3, vehicleId: 567, doorAngles: { bonnet: { angle: 270, axis: 'x' } }, enableDoors: true },
    { name: "BMW X5M", imageCount: 3, vehicleId: 429, doorAngles: null, enableDoors: true },
    { name: "BMW M5 F90", imageCount: 3, vehicleId: 605, doorAngles: null, enableDoors: true },
    { name: "Mazda RX-7", imageCount: 3, vehicleId: 477, doorAngles: null, enableDoors: true },
    { name: "Mercedes-Benz AMG GT 63s", imageCount: 3, vehicleId: 503, doorAngles: null, enableDoors: true },
    { name: "Mercedes-Benz G65", imageCount: 3, vehicleId: 495, doorAngles: null, enableDoors: true },
    { name: "Dodge Challenger SRT", imageCount: 3, vehicleId: 535, doorAngles: null, enableDoors: true },
    { name: "Nissan Silvia s15", imageCount: 3, vehicleId: 542, doorAngles: null, enableDoors: true },
    { name: "Nissan Skyline R33", imageCount: 3, vehicleId: 562, doorAngles: null, enableDoors: true },
    { name: "Toyota Supra", imageCount: 3, vehicleId: 559, doorAngles: null, enableDoors: true },
    { name: "ВАЗ-2114", imageCount: 3, vehicleId: 526, doorAngles: null, enableDoors: true },
    { name: "ВАЗ 2107", imageCount: 3, vehicleId: 404, doorAngles: null, enableDoors: true },
    { name: "Lada Granta", imageCount: 1, vehicleId: 529, doorAngles: null, enableDoors: true },
    { name: "Nissan GT-R", imageCount: 3, vehicleId: 541, doorAngles: null, enableDoors: true },
];

export function renderPaintJobPage(container) {
    const carsGalleryHtml = VINYL_CARS_DATA.map(car => {
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
                         class="clickable-image vinyl-img paintjob-preview"
                         data-vehicle="${car.vehicleId}"
                         data-vinyl-index="${i}"
                         data-vinyl-count="${car.imageCount}"
                         data-name="${escapeHtml(car.name)}"
                         data-full-img="${imagePath}"
                         data-caption="${escapeHtml(car.name)} - вариант винила ${i}"
                         onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'vehicle-img-placeholder\\'>Изображение не найдено</div>'">
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
            <p><strong>Нажмите на изображение винила</strong>, чтобы увидеть его на 3D модели автомобиля.</p>
        </div>
        
        <div class="info-block">
            <h3>Доступные винилы по моделям</h3>
            <p>Ниже представлены автомобили, для которых на сервере доступны кастомные винилы. Нажмите на изображение, чтобы рассмотреть его в 3D.</p>
        </div>

        ${carsGalleryHtml}
    `;

    document.querySelectorAll('.paintjob-preview').forEach(img => {
        const newImg = img.cloneNode(true);
        img.parentNode.replaceChild(newImg, img);

        newImg.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            
            const vehicleId = parseInt(newImg.dataset.vehicle);
            const vinylIndex = parseInt(newImg.dataset.vinylIndex);
            const vinylCount = parseInt(newImg.dataset.vinylCount);
            const carName = newImg.dataset.name;

            const carData = VINYL_CARS_DATA.find(c => c.vehicleId === vehicleId);
            openPaintjobModal(vehicleId, vinylIndex, vinylCount, carName, carData);
        });

        newImg.style.cursor = 'pointer';
    });

    const style = document.createElement('style');
    style.textContent = `
        .paintjob-modal-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.92);
            backdrop-filter: blur(8px);
            z-index: 10001;
            align-items: center;
            justify-content: center;
            animation: modalFadeIn 0.25s ease;
        }
        .paintjob-modal-content {
            background: var(--card-bg, #181f2a);
            border-radius: 20px;
            max-width: 1200px;
            width: 94%;
            max-height: 92vh;
            border: 1px solid var(--border, #21262d);
            box-shadow: 0 24px 64px rgba(0, 0, 0, 0.7);
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        .paintjob-modal-header {
            padding: 16px 24px;
            border-bottom: 1px solid var(--border, #21262d);
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-shrink: 0;
            flex-wrap: wrap;
            gap: 8px;
        }
        .paintjob-modal-header h2 {
            margin: 0;
            color: #fff;
            font-size: 1.3rem;
        }
        .paintjob-modal-controls {
            display: flex;
            gap: 12px;
            align-items: center;
            flex-wrap: wrap;
        }
        .paintjob-modal-controls select {
            background: var(--card-bg);
            color: #fff;
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 6px 12px;
            cursor: pointer;
            font-size: 0.9rem;
        }
        .paintjob-modal-controls select:focus {
            outline: none;
            border-color: var(--accent);
        }
        .paintjob-modal-close {
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
            flex-shrink: 0;
        }
        .paintjob-modal-close:hover {
            background: rgba(248,81,73,0.25);
            color: #fff;
            border-color: #f85149;
        }
        .paintjob-modal-body {
            flex: 1;
            min-height: 400px;
            position: relative;
            background: #0a0e14;
        }
        .paintjob-modal-body canvas {
            width: 100% !important;
            height: 100% !important;
            display: block;
        }
        .paintjob-modal-loader {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: var(--text-secondary);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            pointer-events: none;
            z-index: 5;
        }
        .paintjob-modal-loader i {
            font-size: 32px;
        }
        .paintjob-modal-footer {
            padding: 12px 24px;
            border-top: 1px solid var(--border, #21262d);
            color: var(--text-secondary);
            font-size: 0.8rem;
            text-align: center;
            flex-shrink: 0;
        }
        .paintjob-doors-btn {
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
        }
        .paintjob-doors-btn:hover {
            border-color: rgba(255,255,255,0.4);
        }
        @keyframes modalFadeIn {
            from { opacity: 0; transform: scale(0.96); }
            to { opacity: 1; transform: scale(1); }
        }
        @media (max-width: 768px) {
            .paintjob-modal-content {
                width: 100%;
                max-height: 100vh;
                border-radius: 0;
                max-width: 100%;
            }
            .paintjob-modal-header {
                padding: 12px 16px;
            }
            .paintjob-modal-header h2 {
                font-size: 1rem;
            }
            .paintjob-modal-body {
                min-height: 250px;
            }
            .paintjob-modal-close {
                width: 36px;
                height: 36px;
                font-size: 16px;
            }
            .paintjob-doors-btn {
                bottom: 12px;
                left: 12px;
                padding: 6px 12px;
                font-size: 0.7rem;
            }
        }
    `;
    document.head.appendChild(style);
}

function openPaintjobModal(vehicleId, vinylIndex, vinylCount, carName, carData) {
    closePaintjobModal();

    const modal = document.createElement('div');
    modal.className = 'paintjob-modal-overlay';
    modal.id = 'paintjobModal';

    let vinylOptions = '';
    for (let i = 1; i <= vinylCount; i++) {
        vinylOptions += `<option value="${i}" ${i === vinylIndex ? 'selected' : ''}>Винил ${i}</option>`;
    }

    modal.innerHTML = `
        <div class="paintjob-modal-content" id="paintjobModalContent">
            <div class="paintjob-modal-header">
                <h2>${carName}</h2>
                <div class="paintjob-modal-controls">
                    <label style="color: var(--text-secondary); font-size: 0.9rem;">
                        Винил:
                        <select id="paintjobVinylSelect">
                            ${vinylOptions}
                        </select>
                    </label>
                    <button class="paintjob-modal-close" id="paintjobModalClose">✕</button>
                </div>
            </div>
            <div class="paintjob-modal-body" id="paintjobModalBody">
                <div class="paintjob-modal-loader" id="paintjobModalLoader">
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>Загрузка 3D модели...</span>
                </div>
            </div>
            <div class="paintjob-modal-footer">
                <i class="fas fa-mouse"></i> ЛКМ — вращение, ПКМ — перемещение, колесо — масштаб
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    const bodyEl = document.getElementById('paintjobModalBody');
    const loaderEl = document.getElementById('paintjobModalLoader');
    
    if (bodyEl) {
        activeViewer = new GTACharacterViewer(bodyEl);

        const basePath = `../models/vehicles/${vehicleId}`;
        let currentVinyl = vinylIndex;
        let doorsOpen = false;

        const doorsBtn = document.createElement('button');
        doorsBtn.className = 'paintjob-doors-btn';
        doorsBtn.id = 'paintjobDoorsBtn';
        doorsBtn.innerHTML = `
            <i class="fas fa-door-open"></i>
            <span>Открыть двери</span>
        `;
        bodyEl.appendChild(doorsBtn);

        doorsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!activeViewer) return;
            
            doorsOpen = !doorsOpen;
            const icon = doorsBtn.querySelector('i');
            const span = doorsBtn.querySelector('span');
            
            if (doorsOpen) {
                activeViewer.openAllDoors();
                icon.className = 'fas fa-door-closed';
                span.textContent = 'Закрыть двери';
                doorsBtn.style.borderColor = 'rgba(255,255,255,0.3)';
            } else {
                activeViewer.closeAllDoors();
                icon.className = 'fas fa-door-open';
                span.textContent = 'Открыть двери';
                doorsBtn.style.borderColor = 'rgba(255,255,255,0.15)';
            }
        });

        const loadVinyl = async (index) => {
            if (loaderEl) {
                loaderEl.style.display = 'flex';
                loaderEl.innerHTML = `
                    <i class="fas fa-spinner fa-spin" style="font-size: 32px;"></i>
                    <span>Загрузка винила ${index}...</span>
                `;
            }

            doorsOpen = false;
            if (doorsBtn) {
                const icon = doorsBtn.querySelector('i');
                const span = doorsBtn.querySelector('span');
                icon.className = 'fas fa-door-open';
                span.textContent = 'Открыть двери';
                doorsBtn.style.borderColor = 'rgba(255,255,255,0.15)';
            }

            try {
                const doorAngles = carData ? carData.doorAngles : null;
                const enableDoors = carData ? carData.enableDoors : true;

                const dffPath = `${basePath}.dff`;
                const baseTxdPath = `${basePath}.txd`;

                await activeViewer.loadModel(dffPath, baseTxdPath, null, { 
                    enableDoors: enableDoors,
                    doorAngles: doorAngles 
                });

                const vinylTxdPath = `../models/vehicles/vinyls/${vehicleId}_${index}.txd`;

                try {
                    const response = await fetch(vinylTxdPath);
                    if (response.ok) {
                        const vinylBuffer = await response.arrayBuffer();
                        const txdReader = new (await import('../TXDReader.js')).TXDReader();
                        const vinylTxd = txdReader.parse(vinylBuffer);

                        for (const tex of vinylTxd.textures) {
                            if (tex.imageData) {
                                const texture = activeViewer.createTexture(tex);
                                activeViewer.textures.set(tex.name.toLowerCase(), texture);
                            }
                        }

                        activeViewer.applyTexturesToModel(activeViewer.currentModel);
                    } else {
                        console.warn(`Винил ${index} не найден, используем стоковую текстуру`);
                    }
                } catch (vinylError) {
                    console.warn(`Ошибка загрузки винила ${index}:`, vinylError);
                }

                if (activeViewer.currentModel) {
                    activeViewer.currentModel.rotation.x = 90 * Math.PI / 180;
                    activeViewer.currentModel.rotation.y = 180 * Math.PI / 180;
                    activeViewer.currentModel.rotation.z = 90 * Math.PI / 180;

                    setTimeout(() => {
                        if (activeViewer) {
                            activeViewer.resetCamera();
                        }
                    }, 100);
                }
                
            } catch (err) {
                console.error('Ошибка загрузки:', err);
                if (loaderEl) {
                    loaderEl.innerHTML = `
                        <i class="fas fa-exclamation-triangle" style="font-size: 32px; color: #f85149;"></i>
                        <span>Ошибка загрузки модели</span>
                    `;
                }
                return;
            }

            if (loaderEl) {
                setTimeout(() => {
                    loaderEl.style.display = 'none';
                }, 300);
            }
        };

        loadVinyl(vinylIndex);

        const select = document.getElementById('paintjobVinylSelect');
        if (select) {
            select.addEventListener('change', async (e) => {
                const newIndex = parseInt(e.target.value);
                if (!activeViewer || newIndex === currentVinyl) return;
                currentVinyl = newIndex;
                await loadVinyl(newIndex);
            });
        }
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closePaintjobModal();
        }
    });

    const closeBtn = document.getElementById('paintjobModalClose');
    if (closeBtn) {
        closeBtn.addEventListener('click', closePaintjobModal);
    }

    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closePaintjobModal();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

function closePaintjobModal() {
    if (activeViewer) {
        if (typeof activeViewer.destroy === 'function') {
            activeViewer.destroy();
        }
        activeViewer = null;
    }

    const modal = document.getElementById('paintjobModal');
    if (modal) {
        modal.style.opacity = '0';
        modal.style.transition = 'opacity 0.2s ease';
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = '';
        }, 200);
    }
}

export function cleanupPaintjobViewers() {
    closePaintjobModal();
}