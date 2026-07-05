function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

let currentSearchTerm = "";
let currentCategory = "all";
let mainContainer = null;

function renderAnimationsPage(container) {
    if (typeof ANIMATIONS_DATA === 'undefined') {
        container.innerHTML = `<div class="info-block"><p>❌ Ошибка: Данные анимаций не загружены.</p></div>`;
        return;
    }
    
    mainContainer = container;
    
    const filteredAnims = getFilteredAnimations();
    const visibleAnims = filteredAnims.filter(anim => !anim.hidden);
    const matureAnims = filteredAnims.filter(anim => anim.hidden);
    
    const categoriesList = Object.entries(ANIMATION_CATEGORIES).map(([key, name]) => 
        `<option value="${key}" ${currentCategory === key ? 'selected' : ''}>${name}</option>`
    ).join('');
    
    const animsHtml = visibleAnims.map(anim => {
        let subitemsHtml = "";
        if (anim.subitems && anim.subitems.length) {
            subitemsHtml = `<div class="anim-subitems">
                <div class="anim-subitems-title">Подробнее:</div>
                <ul class="info-list">${anim.subitems.map(si => `<li>${escapeHtml(si)}</li>`).join('')}</ul>
            </div>`;
        }
        return `
            <div class="anim-card">
                <div class="anim-card-header">
                    <code class="anim-command">${escapeHtml(anim.cmd)}</code>
                    <span class="anim-category-tag tag-${anim.category}">${ANIMATION_CATEGORIES[anim.category] || anim.category}</span>
                </div>
                <div class="anim-description">${escapeHtml(anim.desc)}</div>
                ${subitemsHtml}
            </div>
        `;
    }).join('');
    
    const matureHtml = matureAnims.length ? `
        <div class="info-block mature-block">
            <details>
                <summary><span class="mature-warning">🔞 Контент 18+ (нажмите чтобы раскрыть)</span></summary>
                <div style="margin-top: 16px;">
                    ${matureAnims.map(anim => `
                        <div class="anim-card mature">
                            <div class="anim-card-header">
                                <code class="anim-command">${escapeHtml(anim.cmd)}</code>
                                <span class="anim-category-tag tag-mature">18+</span>
                            </div>
                            <div class="anim-description">${escapeHtml(anim.desc)}</div>
                        </div>
                    `).join('')}
                </div>
            </details>
        </div>
    ` : "";
    
    container.innerHTML = `
        <h1 class="page-title">Анимации GreenTech RP</h1>
        <p class="page-subtitle">Полный список доступных анимаций на сервере</p>
        
        <div class="info-block">
            <div class="anim-search-bar">
                <input type="text" id="animSearchInput" placeholder="Поиск анимаций по команде или описанию..." value="${escapeHtml(currentSearchTerm)}">
                <select id="animCategorySelect">${categoriesList}</select>
            </div>
        </div>
        
        <div class="anims-grid">
            ${animsHtml || '<div class="info-block"><p>😔 По вашему запросу ничего не найдено. Попробуйте изменить поиск или категорию.</p></div>'}
        </div>
        
        ${matureHtml}
        
        <div class="info-block">
            <h3>Как использовать анимации</h3>
            <ul class="info-list">
                <li><code>/animlist</code> или <code>/anims</code> - показать список доступных анимаций в игре</li>
                <li><code>/sa</code> или <code>/animstop</code> - остановить текущую анимацию</li>
                <li>Для анимаций с параметрами используйте команду с номером, например: <code>/sit 1</code></li>
                <li>Некоторые анимации можно комбинировать с движением (WASD)</li>
            </ul>
        </div>
    `;

    attachEventListeners();
}

function attachEventListeners() {
    const searchInput = document.getElementById('animSearchInput');
    const categorySelect = document.getElementById('animCategorySelect');
    
    if (searchInput) {
        const newSearchInput = searchInput.cloneNode(true);
        searchInput.parentNode.replaceChild(newSearchInput, searchInput);
        
        newSearchInput.addEventListener('input', (e) => {
            currentSearchTerm = e.target.value;
            updateAnimationsList(); 
        });
    }
    
    if (categorySelect) {
        const newCategorySelect = categorySelect.cloneNode(true);
        categorySelect.parentNode.replaceChild(newCategorySelect, categorySelect);
        
        newCategorySelect.addEventListener('change', (e) => {
            currentCategory = e.target.value;
            updateAnimationsList();
        });
    }
}

function updateAnimationsList() {
    if (!mainContainer) return;
    
    const filteredAnims = getFilteredAnimations();
    const visibleAnims = filteredAnims.filter(anim => !anim.hidden);
    const matureAnims = filteredAnims.filter(anim => anim.hidden);
    
    const animsHtml = visibleAnims.map(anim => {
        let subitemsHtml = "";
        if (anim.subitems && anim.subitems.length) {
            subitemsHtml = `<div class="anim-subitems">
                <div class="anim-subitems-title">Подробнее:</div>
                <ul class="info-list">${anim.subitems.map(si => `<li>${escapeHtml(si)}</li>`).join('')}</ul>
            </div>`;
        }
        return `
            <div class="anim-card">
                <div class="anim-card-header">
                    <code class="anim-command">${escapeHtml(anim.cmd)}</code>
                    <span class="anim-category-tag tag-${anim.category}">${ANIMATION_CATEGORIES[anim.category] || anim.category}</span>
                </div>
                ${subitemsHtml}
            </div>
        `;
    }).join('');
    
    const matureHtml = matureAnims.length ? `
        <div class="info-block mature-block">
            <details>
                <summary><span class="mature-warning">🔞 Контент 18+ (нажмите чтобы раскрыть)</span></summary>
                <div style="margin-top: 16px;">
                    ${matureAnims.map(anim => `
                        <div class="anim-card mature">
                            <div class="anim-card-header">
                                <code class="anim-command">${escapeHtml(anim.cmd)}</code>
                                <span class="anim-category-tag tag-mature">18+</span>
                            </div>
                            <div class="anim-description">${escapeHtml(anim.desc)}</div>
                        </div>
                    `).join('')}
                </div>
            </details>
        </div>
    ` : "";

    const animsGrid = mainContainer.querySelector('.anims-grid');
    const matureBlock = mainContainer.querySelector('.mature-block');
    
    if (animsGrid) {
        animsGrid.innerHTML = animsHtml || '<div class="info-block"><p>😔 По вашему запросу ничего не найдено. Попробуйте изменить поиск или категорию.</p></div>';
    }
    
    if (matureHtml) {
        if (matureBlock) {
            matureBlock.outerHTML = matureHtml;
        } else {
            if (animsGrid && animsGrid.nextSibling) {
                animsGrid.insertAdjacentHTML('afterend', matureHtml);
            } else if (animsGrid) {
                animsGrid.insertAdjacentHTML('afterend', matureHtml);
            }
        }
    } else if (matureBlock) {
        matureBlock.remove();
    }
}

function getFilteredAnimations() {
    let filtered = [...ANIMATIONS_DATA];
    
    if (currentCategory !== "all") {
        filtered = filtered.filter(anim => anim.category === currentCategory);
    }
    
    if (currentSearchTerm) {
    const term = currentSearchTerm.toLowerCase();
    filtered = filtered.filter(anim => {
        if (anim.cmd.toLowerCase().includes(term) || 
            anim.desc.toLowerCase().includes(term)) {
            return true;
        }

        if (anim.subitems && anim.subitems.length) {
            return anim.subitems.some(subitem => 
                subitem.toLowerCase().includes(term)
            );
        }
        
        return false;
    });
}
    
    return filtered;
}

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('animationsContent');
    if (container) {
        renderAnimationsPage(container);
    }
});