function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

const FRACTIONS_DATA = {
    ufsb: {
        name: "УФСБ",
        description: "Федеральная служба безопасности — обеспечение государственной безопасности, борьба с терроризмом и экстремизмом.",
        color: "#2c3e50",
        hasCustomPage: true
    },
    pravitelstvo: {
        name: "Правительство",
        description: "Высший исполнительный орган государственной власти, управляющий экономикой и социальной сферой.",
        color: "#1a5276"
    },
    sud: {
        name: "Суд",
        description: "Судебная власть — осуществление правосудия, рассмотрение уголовных и гражданских дел.",
        color: "#7d3c98"
    },
    gu_fsin: {
        name: "ГУ ФСИН",
        description: "Федеральная служба исполнения наказаний — исполнение уголовных наказаний, содержание осуждённых.",
        color: "#c0392b"
    },
    prokuratura: {
        name: "Прокуратура",
        description: "Надзор за соблюдением законности, поддержание государственного обвинения в суде.",
        color: "#2e86c1"
    },
    sledstvennii_komitet: {
        name: "Следственный комитет",
        description: "Расследование наиболее тяжких преступлений, оперативное сопровождение дел.",
        color: "#1f618d"
    },
    gu_mvd: {
        name: "ГУ МВД",
        description: "Охрана общественного порядка, раскрытие преступлений, обеспечение безопасности граждан.",
        color: "#1b4f72"
    },
    ugibdd: {
        name: "УГИБДД",
        description: "Контроль безопасности дорожного движения, выдача водительских удостоверений, регистрация ТС.",
        color: "#239b56"
    },
    ufsvng: {
        name: "УФСВНГ",
        description: "Войска национальной гвардии — охрана общественного порядка, борьба с терроризмом.",
        color: "#707b7c"
    },
    mz: {
        name: "Министерство Здравоохранения",
        description: "Охрана здоровья граждан, организация медицинской помощи, санитарный надзор.",
        color: "#48c9b0"
    },
    mchs: {
        name: "МЧС",
        description: "Ликвидация чрезвычайных ситуаций, пожарная безопасность, спасение людей.",
        color: "#e67e22"
    },
    tsordd: {
        name: "ЦОРДД",
        description: "Центр организации дорожного движения — управление транспортными потоками, оптимизация дорожной сети.",
        color: "#f39c12"
    },
    opg: {
        name: "ОПГ 'Курганская'",
        description: "Организованная преступная группировка — криминальная деятельность, контроль теневого бизнеса.",
        color: "#7b241c"
    }
};

const FractionsManager = {
    getFractionById(id) {
        return FRACTIONS_DATA[id];
    },
    
    renderSimpleFraction(container, fractionId) {
        const fraction = this.getFractionById(fractionId);
        if (fraction) {
            if (fraction.hasCustomPage) {
                container.innerHTML = `
                    <div class="info-block" style="text-align: center; padding: 40px;">
                        <i class="fas fa-arrow-right" style="font-size: 48px; color: var(--accent); margin-bottom: 20px; display: inline-block;"></i>
                        <h3 style="margin-bottom: 10px;">Страница фракции была обновлена</h3>
                        <p style="margin-bottom: 20px;">Вы будете перенаправлены на актуальную страницу через несколько секунд...</p>
                        <a href="fraction-ufsb.html" class="about-site-btn" style="display: inline-block; padding: 10px 25px; background: var(--accent); color: #fff; border-radius: 8px; text-decoration: none;">Перейти сейчас →</a>
                    </div>
                `;
                setTimeout(() => {
                    window.location.href = 'fraction-ufsb.html';
                }, 2000);
                return;
            }
            
            container.innerHTML = `
                <h1 class="page-title">${escapeHtml(fraction.name)}</h1>
                <div class="info-block">
                    <h3>О фракции</h3>
                    <p>${escapeHtml(fraction.description)}</p>
                </div>
                <div class="info-block">
                    <h3>Подробная информация</h3>
                    <p>Страница данной фракции находится в разработке. Следите за обновлениями!</p>
                    <ul class="info-list">
                        <li>Данные о требованиях скоро появятся</li>
                        <li>Информация о командах будет добавлена позже</li>
                        <li>Актуальный список техники уточняйте у руководства фракции</li>
                    </ul>
                </div>
            `;
        } else {
            container.innerHTML = `<div class="info-block"><p>Информация о фракции не найдена.</p></div>`;
        }
    },
    
    renderArmyFraction(container, level = 3) {
        const army = ARMY_DATA;

        const calculateSalaryWithBonus = (salary, seniorityYears = 0) => {
            let bonusPercent = 0;
            if (seniorityYears >= 2 && seniorityYears < 5) bonusPercent = 10;
            else if (seniorityYears >= 5 && seniorityYears < 10) bonusPercent = 20;
            else if (seniorityYears >= 10 && seniorityYears < 15) bonusPercent = 25;
            else if (seniorityYears >= 15 && seniorityYears < 20) bonusPercent = 30;
            else if (seniorityYears >= 20 && seniorityYears < 25) bonusPercent = 35;
            else if (seniorityYears >= 25) bonusPercent = 40;
            
            return Math.floor(salary * (1 + bonusPercent / 100));
        };

        const commandRows = army.salaryData.command.map(item => {
            const salary = item.salary > 0 ? item.salary.toLocaleString() + " ₽" : "—";
            return `<tr><td>${escapeHtml(item.title)}</td><td>${salary}</td></tr>`;
        }).join('');

        const medicalRows = army.salaryData.medical.map(item => {
            return `<tr><td>${escapeHtml(item.title)}</td><td>${item.salary.toLocaleString()} ₽</td></tr>`;
        }).join('');

        const personnelRows = army.salaryData.personnel.map(item => {
            return `<tr><td>${escapeHtml(item.title)}</td><td>${item.salary.toLocaleString()} ₽</td></tr>`;
        }).join('');

        const rankRows = army.salaryData.ranks.map(rank => {
            return `<tr><td>${escapeHtml(rank.rank)}</td><td>${rank.salary.toLocaleString()} ₽</td></tr>`;
        }).join('');

        const bonusRows = army.salaryData.seniorityBonuses.map(bonus => {
            return `<tr><td>${escapeHtml(bonus.years)}</td><td>+${bonus.percent}%</td></tr>`;
        }).join('');

        const armyWeapons = army.weapons.filter(w => w.category === 'army');
        const vaiWeapons = army.weapons.filter(w => w.category === 'vai');

        const renderWeaponCard = (weapon) => {
            const imagePath = `../images/weapons/${weapon.image}`;
            return `
                <div class="weapon-card">
                    <div class="weapon-card-image">
                        <img src="${imagePath}" 
                             alt="${escapeHtml(weapon.name)}"
                             onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\'weapon-img-placeholder\'><i class=\'fas fa-gun\'></i><br>${escapeHtml(weapon.name)}</div>'">
                    </div>
                    <div class="weapon-card-name">${escapeHtml(weapon.name)}</div>
                </div>
            `;
        };
        
        const armyWeaponsHtml = armyWeapons.map(w => renderWeaponCard(w)).join('');
        const vaiWeaponsHtml = vaiWeapons.map(w => renderWeaponCard(w)).join('');
        
        const commandsHtml = army.commands.map(c => `<tr><td><code>${escapeHtml(c.cmd)}</code></td><td>${escapeHtml(c.desc)}</td></tr>`).join('');

        const uniforms = [
            { name: "Форма №5", file: "forma5", label: "Форма №5" },
            { name: "Офисная форма", file: "office_form", label: "Офисная форма" },
            { name: "Боевое снаряжение", file: "combat_gear", label: "Боевое снаряжение" },
            { name: "Офицерская форма", file: "officer_form", label: "Офицерская форма" },
            { name: "Боевое снаряжение №2", file: "combat_gear2", label: "Боевое снаряжение №2" },
            { name: "Генеральская форма", file: "general_form", label: "Генеральская форма" },
            { name: "[ВП] Форма №4", file: "forma4", label: "[ВП] Форма №4" },
            { name: "[ВП] Офисная форма", file: "office_form_VP", label: "[ВП] Офисная форма" },
            { name: "[ВП] Офицерская форма", file: "officer_form_VP", label: "[ВП] Офицерская форма" },
            { name: "[ВАИ] Форма ВАИ", file: "VAI_form", label: "[ВАИ] Форма ВАИ" },
        ];
        
        const uniformsSelectHtml = uniforms.map((uniform, index) => `
            <option value="${uniform.file}" data-name="${uniform.name}">${uniform.label}</option>
        `).join('');
        
        container.innerHTML = `
            <h1 class="page-title">${army.name}</h1>
			<p class="page-subtitle"></p>
            <div class="info-block"><p>${army.description}</p></div>
            
            <div class="info-block">
                <h3>Требования для вступления</h3>
                <b style="color: #e67e22;">IC:</b>
                <ul class="info-list">${army.requirements.ic.map(r => `<li>${escapeHtml(r)}</li>`).join('')}</ul>
                <b style="color: #27ae60;">ООС:</b>
                <ul class="info-list">${army.requirements.ooc.map(r => `<li>${escapeHtml(r)}</li>`).join('')}</ul>
            </div>
            
            <div class="info-block">
                <h3>Срочная служба</h3>
                <p>За время срочной службы, которая длится всего 2 реальные недели, вам предстоит ежедневно с 17 до 20 часов посещать обязательные занятия, где вы будете получать необходимые знания, при этом на весь период действует строгий запрет на самовольное покидание воинской части. Служба проходится в звании рядового, однако за особые отличия (успехи в учёбе, дисциплину, выполнение специальных заданий) вы можете быть повышены до ефрейтора. По окончании срочной службы вам будет выдан военный билет.</p>
            </div>
            
            <div class="info-block">
                <h3>Команды</h3>
                <div style="overflow-x: auto;">
                    <table class="info-table"><thead><tr><th>Команда</th><th>Назначение</th></tr></thead>
                    <tbody>${commandsHtml}</tbody>
                    </table>
                </div>
            </div>
            
            <div class="info-block">
                <h3>Денежное довольствие военнослужащих</h3>
                <p style="margin-bottom: 20px; font-size: 0.9rem;">* Указаны базовые оклады. Итоговая сумма формируется с учетом всех надбавок.</p>
                
                <details style="margin-bottom: 24px;">
                    <summary style="cursor: pointer; color: var(--accent); font-weight: 600; padding: 8px 0;"></i> Надбавка за выслугу лет</summary>
                    <div style="margin-top: 16px; overflow-x: auto;">
                        <table class="info-table">
                            <thead><tr><th>Стаж службы</th><th>Надбавка</th></tr></thead>
                            <tbody>${bonusRows}</tbody>
                        </table>
                    </div>
                </details>
                
                <details style="margin-bottom: 24px;">
                    <summary style="cursor: pointer; color: var(--accent); font-weight: 600; padding: 8px 0;"></i> Начальствующий состав отряда</summary>
                    <div style="margin-top: 16px; overflow-x: auto;">
                        <table class="info-table">
                            <thead><tr><th>Должность</th><th>Оклад</th></tr></thead>
                            <tbody>${commandRows}</tbody>
                        </table>
                    </div>
                </details>

                <details style="margin-bottom: 24px;">
                    <summary style="cursor: pointer; color: var(--accent); font-weight: 600; padding: 8px 0;"></i> Медицинская служба</summary>
                    <div style="margin-top: 16px; overflow-x: auto;">
                        <table class="info-table">
                            <thead><tr><th>Должность</th><th>Оклад</th></tr></thead>
                            <tbody>${medicalRows}</tbody>
                        </table>
                    </div>
                </details>

                <details style="margin-bottom: 24px;">
                    <summary style="cursor: pointer; color: var(--accent); font-weight: 600; padding: 8px 0;"></i> Личный состав (Разведывательная рота)</summary>
                    <div style="margin-top: 16px; overflow-x: auto;">
                        <table class="info-table">
                            <thead><tr><th>Должность</th><th>Оклад</th></tr></thead>
                            <tbody>${personnelRows}</tbody>
                        </table>
                    </div>
                </details>

                <details style="margin-bottom: 8px;">
                    <summary style="cursor: pointer; color: var(--accent); font-weight: 600; padding: 8px 0;"></i> Оклады по званиям (контрактная служба)</summary>
                    <div style="margin-top: 16px; overflow-x: auto;">
                        <table class="info-table">
                            <thead><tr><th>Звание</th><th>Базовый оклад</th></tr></thead>
                            <tbody>${rankRows}</tbody>
                        </table>
                    </div>
                </details>
            </div>     
            
            <div class="info-block uniform-3d-block">
                <h3>Доступаня форма</h3>
                <div class="uniform-controls">
                    <select id="uniformSelect" class="uniform-select">
                        ${uniformsSelectHtml}
                    </select>
                    <button id="resetUniformCamera" class="uniform-reset-btn">
                        <i class="fas fa-sync-alt"></i> Сброс камеры
                    </button>
                </div>
                <div id="uniform3dContainer" class="uniform-3d-container">
                    <div id="uniform3dLoading" class="uniform-3d-loading">
                        <i class="fas fa-cube"></i>
                        <p>Загрузка 3D просмотрщика...</p>
                    </div>
                </div>
            </div>
            
            <!-- ОБНОВЛЕННАЯ ОРУЖЕЙНАЯ С КАРТИНКАМИ -->
            <div class="info-block">
                <h3>Оружейная (Армия)</h3>
                <div class="weapons-grid">
                    ${armyWeaponsHtml || '<p>Нет данных</p>'}
                </div>
            </div>
            
            <div class="info-block">
                <h3>Оружейная (ВП и ВАИ)</h3>
                <div class="weapons-grid">
                    ${vaiWeaponsHtml || '<p>Нет данных</p>'}
                </div>
            </div>
        `;

        this.init3DSystem(uniforms);
    },

    init3DSystem(uniforms) {
        if (typeof THREE === 'undefined') {
            this.loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js', () => {
                this.loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js', () => {
                    this.loadScript('https://unpkg.com/dff-loader@1.0.1', () => {
                        this.setup3DScene(uniforms);
                    });
                });
            });
        } else {
            this.setup3DScene(uniforms);
        }
    },
    
    loadScript(src, callback) {
        const script = document.createElement('script');
        script.src = src;
        script.onload = callback;
        document.head.appendChild(script);
    },
    
    setup3DScene(uniforms) {
        const originalConsoleLog = console.log;
        console.log = function(...args) {
            if (args[0] && typeof args[0] === 'string' && 
                (args[0].includes('TXDLoader') || 
                 args[0].includes('DFFLoader') ||
                 args[0].includes('Triangle'))) {
                return;
            }
            originalConsoleLog.apply(console, args);
        };
        
        const container = document.getElementById('uniform3dContainer');
        if (!container) return;

        const loadingEl = document.getElementById('uniform3dLoading');
        if (loadingEl) loadingEl.style.display = 'none';

        const MODEL_ROTATION_DEGREES = {
            x: -90,
            y: 90,
            z: 0
        };
        const MODEL_ROTATION = {
            x: MODEL_ROTATION_DEGREES.x * Math.PI / 180,
            y: MODEL_ROTATION_DEGREES.y * Math.PI / 180,
            z: MODEL_ROTATION_DEGREES.z * Math.PI / 180
        };
        
        let scene, camera, renderer, controls, currentModel = null;
        let modelCenterY = 0, modelSize = 1;
        let isPanning = false; 

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0e14);

        camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.set(5, 3, 8);

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.shadowMap.enabled = false;
        container.innerHTML = '';
        container.appendChild(renderer.domElement);

        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.rotateSpeed = 1.0;
        controls.zoomSpeed = 1.2;
        controls.enableZoom = true;
        controls.enablePan = true;      
        controls.panSpeed = 0.8;     
        controls.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE, 
            MIDDLE: THREE.MOUSE.ZOOM,  
            RIGHT: THREE.MOUSE.PAN      
        };
        controls.target.set(0, 0, 0);
        

        const ambientLight = new THREE.AmbientLight(0x606080, 0.7);
        scene.add(ambientLight);

        const mainLight = new THREE.DirectionalLight(0xfff5e6, 0.9);
        mainLight.position.set(2, 5, 3);
        scene.add(mainLight);

        const backFillLight = new THREE.DirectionalLight(0x88aaff, 0.6);
        backFillLight.position.set(-2, 3, -4);
        scene.add(backFillLight);

        const leftLight = new THREE.DirectionalLight(0xffcc88, 0.6);
        leftLight.position.set(-4, 2, 2);
        scene.add(leftLight);

        const rightLight = new THREE.DirectionalLight(0x88ccff, 0.6);
        rightLight.position.set(4, 2, 2);
        scene.add(rightLight);

        const bottomLight = new THREE.PointLight(0x6688aa, 0.4);
        bottomLight.position.set(0, -3, 0);
        scene.add(bottomLight);

        const topLight = new THREE.PointLight(0xffccaa, 0.5);
        topLight.position.set(0, 5, 0);
        scene.add(topLight);

        const ringColors = [0xffaa66, 0xff6688, 0x66ffaa, 0x66aaff, 0xaa66ff, 0xffaa88];
        const ringPositions = [
            { x: 4, z: 0, y: 2 },    
            { x: -4, z: 0, y: 2 },   
            { x: 0, z: 4, y: 2 },
            { x: 0, z: -4, y: 2 },   
            { x: 2.8, z: 2.8, y: 2 }, 
            { x: -2.8, z: -2.8, y: 2 } 
        ];
        
        ringPositions.forEach((pos, i) => {
            const ringLight = new THREE.PointLight(ringColors[i % ringColors.length], 0.35);
            ringLight.position.set(pos.x, pos.y, pos.z);
            scene.add(ringLight);
        });
        
        const fillAmbient = new THREE.AmbientLight(0x445566, 0.3);
        scene.add(fillAmbient);

        function fixSkinnedMeshMaterials(modelGroup) {
            modelGroup.traverse((child) => {
                if (child.isSkinnedMesh) {
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(mat => {
                                mat.skinning = true;
                                mat.shadowSide = THREE.FrontSide;
                            });
                        } else {
                            child.material.skinning = true;
                            child.material.shadowSide = THREE.FrontSide;
                        }
                    }
                    child.castShadow = false;
                    child.receiveShadow = false;
                } else if (child.isMesh) {
                    child.castShadow = false;
                    child.receiveShadow = false;
                }
            });
        }

        async function loadUniformModel(uniformFile, uniformName) {
            if (currentModel) {
                scene.remove(currentModel);
                if (currentModel.traverse) {
                    currentModel.traverse((child) => {
                        if (child.isMesh && child.material) {
                            if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
                            else child.material.dispose();
                        }
                    });
                }
            }
            
            try {
                const dffUrl = `../models/uniforms/army/${uniformFile}.dff`;
                const txdUrl = `../models/uniforms/army/${uniformFile}.txd`;    
                
                const dffResponse = await fetch(dffUrl);
                if (!dffResponse.ok) throw new Error(`DFF файл не найден: ${uniformFile}.dff`);
                const dffData = await dffResponse.arrayBuffer();
                
                const txdResponse = await fetch(txdUrl);
                if (!txdResponse.ok) throw new Error(`TXD файл не найден: ${uniformFile}.txd`);
                const txdData = await txdResponse.arrayBuffer();
                
                const { TXDLoader, DFFLoader } = window.DFFLoader;
                
                const txdLoader = new TXDLoader();
                const texturesMap = txdLoader.parse(txdData);
                
                const dffLoader = new DFFLoader();
                dffLoader.setTextureDictionary(texturesMap);
                const modelGroup = dffLoader.parse(dffData);
                
                fixSkinnedMeshMaterials(modelGroup);
                
                modelGroup.rotation.x = MODEL_ROTATION.x;
                modelGroup.rotation.y = MODEL_ROTATION.y;
                modelGroup.rotation.z = MODEL_ROTATION.z;
                
                const box = new THREE.Box3().setFromObject(modelGroup);
                const center = box.getCenter(new THREE.Vector3());
                const minY = box.min.y;
                const size = box.getSize(new THREE.Vector3());
                
                modelSize = Math.max(size.x, size.y, size.z);
                modelCenterY = size.y / 2;
                
                modelGroup.position.x = -center.x;
                modelGroup.position.z = -center.z;
                modelGroup.position.y = -minY;
                
                const distance = modelSize * 1.5;
                camera.position.set(distance * 0.8, distance * 0.6, distance);
                controls.target.set(0, modelCenterY, 0);
                controls.update();
                
                scene.add(modelGroup);
                currentModel = modelGroup;
                
            } catch (error) {
                console.error('Ошибка загрузки формы:', error);
            }
        }

        function resetCamera() {
            if (currentModel) {
                const distance = modelSize * 1.5;
                camera.position.set(distance * 0.8, distance * 0.6, distance);
                controls.target.set(0, modelCenterY, 0);
                controls.update();
            } else {
                camera.position.set(5, 3, 8);
                controls.target.set(0, 0, 0);
                controls.update();
            }
        }

        const uniformSelect = document.getElementById('uniformSelect');
        if (uniformSelect) {
            uniformSelect.addEventListener('change', (e) => {
                const selectedOption = e.target.options[e.target.selectedIndex];
                const uniformFile = e.target.value;
                const uniformName = selectedOption.getAttribute('data-name') || selectedOption.textContent;
                loadUniformModel(uniformFile, uniformName);
            });

            if (uniforms.length > 0) {
                setTimeout(() => {
                    loadUniformModel(uniforms[0].file, uniforms[0].name);
                }, 500);
            }
        }

        const resetBtn = document.getElementById('resetUniformCamera');
        if (resetBtn) {
            resetBtn.addEventListener('click', resetCamera);
        }

        function animate() {
            requestAnimationFrame(animate);
            if (controls) controls.update();
            if (renderer && scene && camera) renderer.render(scene, camera);
        }
        animate();

        window.addEventListener('resize', () => {
            if (!container) return;
            const width = container.clientWidth;
            const height = container.clientHeight;
            if (camera) {
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
            }
            if (renderer) renderer.setSize(width, height);
        });
    }
};