import * as THREE from "three";

export class AccessorySystem {
    constructor(viewer) {
        this.viewer = viewer;
        this.accessories = [];
        this.activeAccessories = new Map(); 
        this.slots = {
            head: null,
            body: null
        };
        this.slotGroups = {};
    }

    async loadAccessory(config, onProgress) {
        const { id, name, slot, dffPath, txdPath, position, rotation, scale } = config;
        
        try {
            const txdResponse = await fetch(txdPath);
            if (!txdResponse.ok) throw new Error(`TXD not found: ${txdPath}`);
            const txdBuffer = await txdResponse.arrayBuffer();

            const dffResponse = await fetch(dffPath);
            if (!dffResponse.ok) throw new Error(`DFF not found: ${dffPath}`);
            const dffBuffer = await dffResponse.arrayBuffer();

            const tempViewer = this.viewer;

            const currentModel = tempViewer.currentModel;

            const dff = new DFFReader().parse(dffBuffer);
            if (!dff) throw new Error("Failed to parse DFF");
            
            const meshGroup = tempViewer.createMesh(dff);

            const txd = new TXDReader().parse(txdBuffer);
            for (const tex of txd.textures) {
                if (tex.imageData) {
                    const texture = tempViewer.createTexture(tex);
                    tempViewer.textures.set(tex.name.toLowerCase(), texture);
                }
            }
            tempViewer.applyTexturesToModel(meshGroup);
            tempViewer.makeMatte(meshGroup);

            if (position) {
                meshGroup.position.set(position.x, position.y, position.z);
            }
            if (rotation) {
                meshGroup.rotation.set(rotation.x, rotation.y, rotation.z);
            }
            if (scale) {
                meshGroup.scale.set(scale.x, scale.y, scale.z);
            }

            const accessoryGroup = new THREE.Group();
            accessoryGroup.add(meshGroup);

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

    equip(accessoryId) {
        const accessory = this.accessories.find(a => a.id === accessoryId);
        if (!accessory) {
            console.error(`Accessory "${accessoryId}" not found`);
            return false;
        }

        const slot = accessory.slot;

        if (this.slots[slot]) {
            this.unequip(this.slots[slot]);
        }

        accessory.group.visible = true;
        this.slots[slot] = accessoryId;
        this.activeAccessories.set(accessoryId, accessory);
        
        return true;
    }

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

    toggle(accessoryId) {
        if (this.activeAccessories.has(accessoryId)) {
            return this.unequip(accessoryId);
        } else {
            return this.equip(accessoryId);
        }
    }

    updatePosition(accessoryId, position) {
        const accessory = this.accessories.find(a => a.id === accessoryId);
        if (!accessory) return false;
        
        accessory.group.position.set(position.x, position.y, position.z);
        return true;
    }

    updateRotation(accessoryId, rotation) {
        const accessory = this.accessories.find(a => a.id === accessoryId);
        if (!accessory) return false;
        
        accessory.group.rotation.set(rotation.x, rotation.y, rotation.z);
        return true;
    }

    updateScale(accessoryId, scale) {
        const accessory = this.accessories.find(a => a.id === accessoryId);
        if (!accessory) return false;
        
        accessory.group.scale.set(scale.x, scale.y, scale.z);
        return true;
    }

    getAccessories() {
        return this.accessories.map(a => ({
            id: a.id,
            name: a.name,
            slot: a.slot,
            equipped: this.activeAccessories.has(a.id)
        }));
    }

    getActiveAccessories() {
        return Array.from(this.activeAccessories.keys());
    }

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

import { DFFReader } from "./DFFReader.js";
import { TXDReader } from "./TXDReader.js";