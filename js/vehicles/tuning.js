import { escapeHtml, getValue, getDealerDisplay, getNumericValue } from './helpers.js';
import { addImageModal, initImageModalClicks } from './image-modal.js';
import { getVehicleTuningData, TUNING_DATA } from '/data/tuning-data.js';
import { GTACharacterViewer } from '../gta-viewer.js';

function highlightMatch(text, query) {
    if (!query) return escapeHtml(text);
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return escapeHtml(text).replace(regex, '<span class="highlight">$1</span>');
}

class CustomSelect {
    constructor(wrapperElement, options, onChange) {
        this.wrapper = wrapperElement;
        this.options = options;
        this.onChange = onChange;
        this.isOpen = false;
        this.searchTerm = '';
        this.selectedValue = null;
        this.selectedLabel = null;
        
        this.render();
        this.attachEvents();
    }
    
    render() {
        this.wrapper.innerHTML = `
            <div class="custom-select tuning-custom-select">
                <div class="custom-select-trigger" tabindex="0">
                    <span class="trigger-text placeholder">— Выберите автомобиль —</span>
                    <i class="fas fa-chevron-down arrow"></i>
                </div>
                <div class="custom-options">
                    <div class="custom-select-search">
                        <i class="fas fa-search search-icon"></i>
                        <input type="text" class="custom-search-input" placeholder="Поиск автомобиля...">
                    </div>
                    <div class="custom-options-list">
                        ${this.options.map(opt => `
                            <div class="custom-option" data-value="${escapeHtml(opt.value)}" data-label="${escapeHtml(opt.label)}">
                                <span class="option-name">${escapeHtml(opt.label)}</span>
                            </div>
                        `).join('')}
                        <div class="no-results" style="display: none;">
                            <i class="fas fa-search"></i> Ничего не найдено
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    attachEvents() {
        const trigger = this.wrapper.querySelector('.custom-select-trigger');
        const optionsContainer = this.wrapper.querySelector('.custom-options');
        const searchInput = this.wrapper.querySelector('.custom-search-input');
        const optionsList = this.wrapper.querySelector('.custom-options-list');
        
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });
        
        optionsList.addEventListener('click', (e) => {
            const option = e.target.closest('.custom-option');
            if (!option) return;
            
            const value = option.dataset.value;
            const label = option.dataset.label;
            
            this.select(value, label);
            this.close();
        });
        
        searchInput.addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.filterOptions();
        });
        
        document.addEventListener('click', (e) => {
            if (!this.wrapper.contains(e.target)) {
                this.close();
            }
        });
        
        trigger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggle();
            }
        });
        
        searchInput.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }
    
    toggle() {
        this.isOpen ? this.close() : this.open();
    }
    
    open() {
        this.isOpen = true;
        const trigger = this.wrapper.querySelector('.custom-select-trigger');
        const optionsContainer = this.wrapper.querySelector('.custom-options');
        const searchInput = this.wrapper.querySelector('.custom-search-input');
        
        trigger.classList.add('active');
        optionsContainer.classList.add('open');
        
        searchInput.value = '';
        this.searchTerm = '';
        this.filterOptions();
        
        setTimeout(() => searchInput.focus(), 100);
    }
    
    close() {
        this.isOpen = false;
        const trigger = this.wrapper.querySelector('.custom-select-trigger');
        const optionsContainer = this.wrapper.querySelector('.custom-options');
        
        trigger.classList.remove('active');
        optionsContainer.classList.remove('open');
    }
    
    select(value, label) {
        this.selectedValue = value;
        this.selectedLabel = label;
        
        const trigger = this.wrapper.querySelector('.trigger-text');
        trigger.textContent = label;
        trigger.classList.remove('placeholder');
        
        const allOptions = this.wrapper.querySelectorAll('.custom-option');
        allOptions.forEach(opt => {
            opt.classList.toggle('selected', opt.dataset.value === value);
        });
        
        if (this.onChange) {
            this.onChange(value);
        }
    }
    
    filterOptions() {
        const term = this.searchTerm;
        const options = this.wrapper.querySelectorAll('.custom-option');
        const noResults = this.wrapper.querySelector('.no-results');
        
        let visibleCount = 0;
        
        options.forEach(option => {
            const label = option.dataset.label || '';
            const name = label.toLowerCase();
            const matches = !term || name.includes(term);
            
            if (matches) {
                option.classList.remove('hidden');
                const nameElement = option.querySelector('.option-name');
                if (term && nameElement) {
                    nameElement.innerHTML = highlightMatch(label, term);
                } else if (nameElement) {
                    nameElement.textContent = label;
                }
                visibleCount++;
            } else {
                option.classList.add('hidden');
            }
        });
        
        if (noResults) {
            noResults.style.display = visibleCount === 0 ? 'block' : 'none';
        }
    }
    
    getValue() {
        return this.selectedValue;
    }
    
    setValue(value) {
        const option = this.wrapper.querySelector(`.custom-option[data-value="${value}"]`);
        if (option) {
            const label = option.dataset.label;
            this.select(value, label);
        }
    }
    
    clear() {
        this.selectedValue = null;
        this.selectedLabel = null;
        const trigger = this.wrapper.querySelector('.trigger-text');
        trigger.textContent = '— Выберите автомобиль —';
        trigger.classList.add('placeholder');
        
        const allOptions = this.wrapper.querySelectorAll('.custom-option');
        allOptions.forEach(opt => opt.classList.remove('selected'));
    }
    
    updateOptions(newOptions) {
        this.options = newOptions;
        const optionsList = this.wrapper.querySelector('.custom-options-list');
        const searchWrapper = this.wrapper.querySelector('.custom-select-search');
        const noResults = this.wrapper.querySelector('.no-results');
        
        optionsList.innerHTML = `
            ${this.options.map(opt => `
                <div class="custom-option" data-value="${escapeHtml(opt.value)}" data-label="${escapeHtml(opt.label)}">
                    <span class="option-name">${escapeHtml(opt.label)}</span>
                </div>
            `).join('')}
        `;
        optionsList.appendChild(noResults);
        if (searchWrapper) {
            optionsList.prepend(searchWrapper);
        }
        
        this.attachEvents();
    }
}

export function renderTuningPage(container) {
    const visualTuningCars = [
        "BMW G90", "Lada Vesta", "Lada Kalina", "GAZ Volga 24", "Dodge Challenger",
        "Porsche 911", "BMW X5 E53", "Lada Priora", "Skoda Octavia", "BMW i8",
        "BMW E36 Coupe", "BMW M5 E60", "Subaru BRZ", "Nissan GT-R", "Toyota Mark II",
        "Lada Niva", "Mercedes G-Class", "Lexus GS F", "Ford Mustang Shelby", "Mercedes C63 AMG",
        "BMW M2", "BMW M3 E46", "Toyota Land Cruiser 300", "BMW 5 Series E39", "Toyota Land Cruiser 200",
        "BMW 5 Series E34", "Lada 2106", "Mercedes E-Class W210", "Lexus IS", "Cadillac Escalade",
        "Ford F-150 Raptor", "Mercedes AMG GT",
        "Audi RS6", "Toyota Camry V70", "Mitsubishi Lancer Evo X", "Mazda RX-7",
        "Subaru Impreza WRX STI Sedan", "Subaru Impreza WRX STI Hatchback", "Lexus LX570",
        "Nissan Silvia S15", "BMW 750e xDrive G70", "BMW M5 F90", "Nissan Skyline R34"
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
    `;

    addImageModal();
    initImageModalClicks();

    renderTuningViewerBlock(container);
}

function renderTuningViewerBlock(container) {
    let viewerBlock = container.querySelector('.tuning-viewer-block');
    if (!viewerBlock) {
        viewerBlock = document.createElement('div');
        viewerBlock.className = 'info-block tuning-viewer-block';
        container.appendChild(viewerBlock);
    }

    viewerBlock.innerHTML = `
        <h3>Просмотр тюнинга</h3>
        <div class="tuning-controls">
            <div class="custom-select-wrapper tuning-select-wrapper" id="tuningSelectWrapper"></div>
            <button id="resetTuningBtn" class="tuning-reset-btn">
                <i class="fas fa-undo-alt"></i> Сброс
            </button>
        </div>
        <div id="tuningViewerWrapper" style="display: grid; grid-template-columns: 280px 1fr; gap: 20px; margin-top: 16px;">
            <div style="display: flex; flex-direction: column; gap: 16px;">
                <div id="tuningCategoriesContainer" style="background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid var(--border); overflow: hidden; display: flex; flex-direction: column; height: 450px;">
                    <div style="padding: 12px 16px; background: rgba(255,255,255,0.04); border-bottom: 1px solid var(--border); font-weight: 600; font-size: 0.85rem; color: var(--accent); flex-shrink: 0;">
                        <i class="fas fa-sliders-h" style="margin-right: 8px;"></i> Детали тюнинга
                    </div>
                    <div id="tuningCategoriesList" style="flex: 1; overflow-y: auto; padding: 8px 0;">
                        <div style="color: var(--text-secondary); font-size: 0.85rem; text-align: center; padding: 30px 0;">
                            <i class="fas fa-car" style="display: block; font-size: 32px; margin-bottom: 12px; opacity: 0.3;"></i>
                            Выберите автомобиль
                        </div>
                    </div>
                </div>
                <div id="tuningTotalCost" style="padding: 14px 20px; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid var(--border);">
                    <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 6px;">
                        <i class="fas fa-shopping-cart" style="margin-right: 8px;"></i> Итоговая стоимость:
                    </div>
                    <div id="tuningTotalPrice" style="font-size: 1.3rem; font-weight: 700; color: var(--accent);">0 ₽</div>
                </div>
            </div>
            <div id="tuning3dContainer" class="uniform-3d-container" style="min-height: 450px; border-radius: 12px; overflow: hidden; border: 1px solid var(--border); background: #0a0e14; position: relative;">
                <div id="tuning3dLoading" class="uniform-3d-loading">
                    <i class="fas fa-cube"></i>
                    <p>Загрузка 3D просмотрщика...</p>
                </div>
            </div>
        </div>
        <div class="uniform-3d-note">
            Управление: ЛКМ - вращение, ПКМ - перемещение, колесо - масштаб
        </div>
    `;

    initTuningViewerLogic(viewerBlock);
}

function getVehicleNameById(vehicleId) {
    if (typeof VEHICLES_DATA !== 'undefined' && VEHICLES_DATA.vehicles) {
        const vehicle = VEHICLES_DATA.vehicles.find(v => v.id === parseInt(vehicleId));
        if (vehicle && vehicle.name) {
            return vehicle.name;
        }
    }
    return `Автомобиль ${vehicleId}`;
}

function initTuningViewerLogic(block) {
    let viewer = null;
    let currentVehicleId = null;
    let currentVehicleData = null;
    let selectedParts = {};
    let customSelect = null;
    let tuningPartsCache = {};

    const selectWrapper = block.querySelector('#tuningSelectWrapper');
    const categoriesList = block.querySelector('#tuningCategoriesList');
    const viewerContainer = block.querySelector('#tuning3dContainer');
    const loadingEl = block.querySelector('#tuning3dLoading');
    const resetBtn = block.querySelector('#resetTuningBtn');

    function getVehicleOptions() {
        return TUNING_DATA
            .map(vehicle => {
                const name = getVehicleNameById(vehicle.id);
                return {
                    value: vehicle.id,
                    label: name || `Автомобиль ${vehicle.id}`
                };
            })
            .sort((a, b) => a.label.localeCompare(b.label));
    }

    function initCustomSelect() {
        if (!selectWrapper) return;
        const options = getVehicleOptions();
        
        customSelect = new CustomSelect(selectWrapper, options, (value) => {
            if (value) {
                handleVehicleSelect(value);
            }
        });
    }

    function updateTotalCost() {
        const totalPriceEl = document.getElementById('tuningTotalPrice');
        
        if (!totalPriceEl) return;
        
        let total = 0;
        
        for (const [categoryKey, partName] of Object.entries(selectedParts)) {
            if (!currentVehicleData) continue;
            
            const category = currentVehicleData.categories.find(c => c.key === categoryKey);
            if (!category) continue;
            
            const item = category.items.find(i => i.partName === partName);
            if (item) {
                total += item.price;
            }
        }

        totalPriceEl.textContent = total.toLocaleString() + ' ₽';
    }

    function findTuningPartsForDummy(model, dummyName) {
        const parts = [];
        const dummyLower = dummyName.toLowerCase();
        
        model.traverse((child) => {
            if ((child.isMesh || child.isSkinnedMesh) && child.name) {
                const name = child.name.toLowerCase();
                if (name.includes('_tun') && name.includes(dummyLower)) {
                    parts.push(child);
                }
            }
        });
        
        return parts;
    }

    function attachTuningPartsToDummies(model) {
        const dummyGroups = {};

        model.traverse((child) => {
            if (child.isGroup && child.name) {
                const name = child.name.toLowerCase();
                if (name.includes('door') || 
                    name.includes('bonnet') || 
                    name.includes('boot') || 
                    name.includes('trunk')) {
                    dummyGroups[name] = child;
                }
            }
        });

        for (const [dummyName, group] of Object.entries(dummyGroups)) {
            const tuningParts = findTuningPartsForDummy(model, dummyName);
            
            for (const part of tuningParts) {
                const originalParent = part.parent;

                if (originalParent) {
                    const worldMatrix = part.matrixWorld.clone();

                    originalParent.remove(part);

                    group.add(part);
                    part.matrixWorld.copy(worldMatrix);
                    part.matrix.decompose(part.position, part.quaternion, part.scale);
                }
            }
        }
    }

    async function loadVehicleModel(vehicleId) {
        if (viewer) {
            if (typeof viewer.destroy === 'function') {
                viewer.destroy();
            }
            viewer = null;
        }

        if (!vehicleId) return;

        if (loadingEl) loadingEl.style.display = 'flex';

        try {
            viewer = new GTACharacterViewer(viewerContainer);
            
            const dffPath = `../models/vehicles/${vehicleId}.dff`;
            const txdPath = `../models/vehicles/${vehicleId}.txd`;
            
            await viewer.loadModel(dffPath, txdPath, null, { 
                enableDoors: false,
                doorAngles: currentVehicleData?.doorAngles || {}
            });

            if (viewer.currentModel) {
                attachTuningPartsToDummies(viewer.currentModel);
                
                viewer.currentModel.rotation.x = 90 * Math.PI / 180;
                viewer.currentModel.rotation.y = 180 * Math.PI / 180;
                viewer.currentModel.rotation.z = 90 * Math.PI / 180;
                viewer.resetCamera();
            }

            applySelectedParts();

        } catch (error) {
            console.error('Ошибка загрузки модели:', error);
            if (loadingEl) {
                loadingEl.innerHTML = `
                    <i class="fas fa-exclamation-triangle" style="font-size: 32px; color: #f85149;"></i>
                    <p>Ошибка загрузки модели</p>
                `;
                loadingEl.style.display = 'flex';
            }
        } finally {
            if (loadingEl) loadingEl.style.display = 'none';
        }
    }

    function applySelectedParts() {
    if (!viewer || !viewer.currentModel) return;

    const selectedPartNames = Object.values(selectedParts);

    const standardPartsToHide = new Set();

    for (const partName of selectedPartNames) {
        const category = currentVehicleData?.categories.find(c => 
            c.items.some(i => i.partName === partName)
        );
        const item = category?.items.find(i => i.partName === partName);
        if (!item) continue;

        if (item.removeStandard && item.dummyName && item.dummyName !== 'none') {
            standardPartsToHide.add(item.dummyName.toLowerCase());
        }
    }

    viewer.currentModel.traverse((child) => {
        const name = child.name?.toLowerCase() || '';

        if (name.includes('_vlo')) {
            child.visible = false;
            return;
        }
        
        const isTuningPart = name.includes('_tun');
        
        if (isTuningPart) {
            let isSelected = false;
            for (const partName of selectedPartNames) {
                if (name.includes(partName.toLowerCase())) {
                    isSelected = true;
                    break;
                }
            }
            child.visible = isSelected;
        } else {
            let shouldHide = false;
            for (const dummyName of standardPartsToHide) {
                if (name === dummyName || name.includes(dummyName)) {
                    shouldHide = true;
                    break;
                }
            }
            child.visible = !shouldHide;
        }
    });
}
    
    function renderTuningCategories(vehicleId) {
        currentVehicleData = getVehicleTuningData(vehicleId);
        if (!currentVehicleData) {
            categoriesList.innerHTML = `
                <div style="color: var(--text-secondary); font-size: 0.85rem; text-align: center; padding: 30px 0;">
                    <i class="fas fa-exclamation-circle" style="display: block; font-size: 28px; margin-bottom: 10px; opacity: 0.4;"></i>
                    Данные тюнинга не найдены
                </div>
            `;
            selectedParts = {};
            updateTotalCost();
            return;
        }

        selectedParts = {};

        let html = '';
        for (const category of currentVehicleData.categories) {
            html += `
                <div class="tuning-category-item">
                    <div class="tuning-category-header" data-category="${category.key}">
                        <span class="arrow">▶</span>
                        <span class="name">${escapeHtml(category.name)}</span>
                        <span class="badge">${category.items.length}</span>
                    </div>
                    <div class="tuning-items-list" data-category="${category.key}">
                        ${category.items.map((item, index) => {
                            const isStandard = index === 0;
                            const isStandardByName = item.name.toLowerCase().includes('стандарт') || item.name.toLowerCase().includes('стандартный');
                            const checkedAttr = (isStandard || isStandardByName) ? 'checked' : '';
                            
                            return `
                                <div class="tuning-item" data-category="${category.key}" data-part="${item.partName}" data-price="${item.price}">
                                    <label>
                                        <input type="radio" name="tuning_${category.key}" value="${item.partName}" ${checkedAttr}>
                                        <span>${escapeHtml(item.name)}</span>
                                    </label>
                                    <span class="price ${(isStandard || isStandardByName) ? 'selected' : ''}">${item.price.toLocaleString()} ₽</span>
                                    <span class="check ${(isStandard || isStandardByName) ? 'visible' : ''}">✓</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        categoriesList.innerHTML = html;

        const allRadios = categoriesList.querySelectorAll('input[type="radio"]');
        allRadios.forEach(radio => {
            if (radio.checked) {
                const category = radio.name.replace('tuning_', '');
                selectedParts[category] = radio.value;
            }
        });

        const headers = categoriesList.querySelectorAll('.tuning-category-header');
        headers.forEach(header => {
            header.addEventListener('click', () => {
                const categoryKey = header.dataset.category;
                const itemsList = categoriesList.querySelector(`.tuning-items-list[data-category="${categoryKey}"]`);
                const arrow = header.querySelector('.arrow');
                
                if (itemsList.classList.contains('expanded')) {
                    itemsList.classList.remove('expanded');
                    arrow.classList.remove('expanded');
                } else {
                    itemsList.classList.add('expanded');
                    arrow.classList.add('expanded');
                }
            });
        });

        const radios = categoriesList.querySelectorAll('input[type="radio"]');
        radios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const category = e.target.name.replace('tuning_', '');
                const partName = e.target.value;
                const itemEl = e.target.closest('.tuning-item');
                const allItems = categoriesList.querySelectorAll(`.tuning-item[data-category="${category}"]`);
                
                allItems.forEach(item => {
                    item.querySelector('.check').classList.remove('visible');
                    item.querySelector('.price').classList.remove('selected');
                });
                
                if (e.target.checked) {
                    selectedParts[category] = partName;
                    if (itemEl) {
                        itemEl.querySelector('.check').classList.add('visible');
                        itemEl.querySelector('.price').classList.add('selected');
                    }
                } else {
                    delete selectedParts[category];
                }
                
                applySelectedParts();
                updateTotalCost();
            });
        });

        setTimeout(() => {
            const firstHeader = headers[0];
            if (firstHeader) {
                firstHeader.click();
            }
            applySelectedParts();
            updateTotalCost();
        }, 100);
    }
    
    function resetEverything() {
        if (viewer) {
            viewer.resetCamera();
        }
        
        selectedParts = {};
        
        const radios = categoriesList.querySelectorAll('input[type="radio"]');
        radios.forEach(radio => {
            radio.checked = false;
        });
        
        const items = categoriesList.querySelectorAll('.tuning-item');
        items.forEach(item => {
            item.querySelector('.check').classList.remove('visible');
            item.querySelector('.price').classList.remove('selected');
        });
        
        applySelectedParts();
        updateTotalCost();
    }

    function handleVehicleSelect(vehicleId) {
        if (!vehicleId) {
            categoriesList.innerHTML = `
                <div style="color: var(--text-secondary); font-size: 0.85rem; text-align: center; padding: 30px 0;">
                    <i class="fas fa-car" style="display: block; font-size: 32px; margin-bottom: 12px; opacity: 0.3;"></i>
                    Выберите автомобиль
                </div>
            `;
            if (viewer) {
                if (typeof viewer.destroy === 'function') {
                    viewer.destroy();
                }
                viewer = null;
            }
            selectedParts = {};
            updateTotalCost();
            return;
        }
        currentVehicleId = vehicleId;
        renderTuningCategories(vehicleId);
        loadVehicleModel(vehicleId);
    }

    resetBtn.addEventListener('click', resetEverything);

    initCustomSelect();

    setTimeout(() => {
        if (customSelect && customSelect.options.length > 0) {
            const firstOption = customSelect.options[0];
            customSelect.setValue(firstOption.value);
        }
    }, 100);
}