import * as THREE from "three";

export class AccessorySystem {
    constructor(viewer) {
        this.viewer = viewer;
        this.accessories = [];
        this.activeAccessories = new Map(); // accessoryId -> { group, config }
        this.slots = {
            head: null,
            body: null
        };
        this.slotGroups = {};
    }

    // Загрузка аксессуара из файлов
    async loadAccessory(config, onProgress) {
        const { id, name, slot, dffPath, txdPath, position, rotation, scale } = config;
        
        try {
            // Загружаем TXD
            const txdResponse = await fetch(txdPath);
            if (!txdResponse.ok) throw new Error(`TXD not found: ${txdPath}`);
            const txdBuffer = await txdResponse.arrayBuffer();
            
            // Загружаем DFF
            const dffResponse = await fetch(dffPath);
            if (!dffResponse.ok) throw new Error(`DFF not found: ${dffPath}`);
            const dffBuffer = await dffResponse.arrayBuffer();

            // Создаем временный объект для загрузки
            const tempViewer = this.viewer;
            
            // Сохраняем текущую модель
            const currentModel = tempViewer.currentModel;
            
            // Загружаем DFF через существующий метод
            const dff = new DFFReader().parse(dffBuffer);
            if (!dff) throw new Error("Failed to parse DFF");
            
            const meshGroup = tempViewer.createMesh(dff);
            
            // Применяем текстуры
            const txd = new TXDReader().parse(txdBuffer);
            for (const tex of txd.textures) {
                if (tex.imageData) {
                    const texture = tempViewer.createTexture(tex);
                    tempViewer.textures.set(tex.name.toLowerCase(), texture);
                }
            }
            tempViewer.applyTexturesToModel(meshGroup);
            tempViewer.makeMatte(meshGroup);

            // Настраиваем позицию и поворот
            if (position) {
                meshGroup.position.set(position.x, position.y, position.z);
            }
            if (rotation) {
                meshGroup.rotation.set(rotation.x, rotation.y, rotation.z);
            }
            if (scale) {
                meshGroup.scale.set(scale.x, scale.y, scale.z);
            }

            // Создаем группу для аксессуара
            const accessoryGroup = new THREE.Group();
            accessoryGroup.add(meshGroup);
            
            // Добавляем к сцене
            tempViewer.scene.add(accessoryGroup);

            const accessoryData = {
                id,
                name,
                slot,
                config,
                group: accessoryGroup,
                mesh: meshGroup,
                loaded: true
            };

            this.accessories.push(accessoryData);
            return accessoryData;

        } catch (error) {
            console.error(`Failed to load accessory "${name}":`, error);
            throw error;
        }
    }

    // Надеть аксессуар
    equip(accessoryId) {
        const accessory = this.accessories.find(a => a.id === accessoryId);
        if (!accessory) {
            console.error(`Accessory "${accessoryId}" not found`);
            return false;
        }

        const slot = accessory.slot;
        
        // Если уже есть аксессуар в этом слоте - снимаем его
        if (this.slots[slot]) {
            this.unequip(this.slots[slot]);
        }

        // Показываем аксессуар
        accessory.group.visible = true;
        this.slots[slot] = accessoryId;
        this.activeAccessories.set(accessoryId, accessory);
        
        return true;
    }

    // Снять аксессуар
    unequip(accessoryId) {
        const accessory = this.accessories.find(a => a.id === accessoryId);
        if (!accessory) return false;

        accessory.group.visible = false;
        
        const slot = accessory.slot;
        if (this.slots[slot] === accessoryId) {
            this.slots[slot] = null;
        }
        this.activeAccessories.delete(accessoryId);
        
        return true;
    }

    // Переключить аксессуар (надеть/снять)
    toggle(accessoryId) {
        if (this.activeAccessories.has(accessoryId)) {
            return this.unequip(accessoryId);
        } else {
            return this.equip(accessoryId);
        }
    }

    // Обновить позицию аксессуара
    updatePosition(accessoryId, position) {
        const accessory = this.accessories.find(a => a.id === accessoryId);
        if (!accessory) return false;
        
        accessory.group.position.set(position.x, position.y, position.z);
        return true;
    }

    // Обновить поворот аксессуара
    updateRotation(accessoryId, rotation) {
        const accessory = this.accessories.find(a => a.id === accessoryId);
        if (!accessory) return false;
        
        accessory.group.rotation.set(rotation.x, rotation.y, rotation.z);
        return true;
    }

    // Обновить масштаб аксессуара
    updateScale(accessoryId, scale) {
        const accessory = this.accessories.find(a => a.id === accessoryId);
        if (!accessory) return false;
        
        accessory.group.scale.set(scale.x, scale.y, scale.z);
        return true;
    }

    // Получить список загруженных аксессуаров
    getAccessories() {
        return this.accessories.map(a => ({
            id: a.id,
            name: a.name,
            slot: a.slot,
            equipped: this.activeAccessories.has(a.id)
        }));
    }

    // Получить активные аксессуары
    getActiveAccessories() {
        return Array.from(this.activeAccessories.keys());
    }

    // Очистить все аксессуары
    clearAll() {
        for (const [id, accessory] of this.activeAccessories) {
            accessory.group.visible = false;
            const slot = accessory.slot;
            if (this.slots[slot] === id) {
                this.slots[slot] = null;
            }
        }
        this.activeAccessories.clear();
    }

    // Удалить аксессуар из сцены
    removeAccessory(accessoryId) {
        const accessory = this.accessories.find(a => a.id === accessoryId);
        if (!accessory) return false;
        
        if (this.activeAccessories.has(accessoryId)) {
            this.unequip(accessoryId);
        }
        
        this.viewer.scene.remove(accessory.group);
        const index = this.accessories.indexOf(accessory);
        if (index !== -1) {
            this.accessories.splice(index, 1);
        }
        return true;
    }

    // Загрузить несколько аксессуаров
    async loadAccessories(accessoriesConfig, onProgress) {
        const results = [];
        for (let i = 0; i < accessoriesConfig.length; i++) {
            const config = accessoriesConfig[i];
            try {
                const result = await this.loadAccessory(config);
                results.push(result);
                if (onProgress) {
                    onProgress(i + 1, accessoriesConfig.length);
                }
            } catch (error) {
                console.error(`Failed to load ${config.name}:`, error);
                if (onProgress) {
                    onProgress(i + 1, accessoriesConfig.length);
                }
            }
        }
        return results;
    }
}

// Класс DFFReader и TXDReader нужны для работы
// Они импортируются из существующих файлов
import { DFFReader } from "./DFFReader.js";
import { TXDReader } from "./TXDReader.js";