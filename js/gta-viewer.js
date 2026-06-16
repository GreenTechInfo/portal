import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DFFReader } from "./DFFReader.js";
import { TXDReader } from "./TXDReader.js";
import { IFPReader } from "./IFPReader.js";

const ALPHA_THRESHOLD = 10 / 255;
const BG_COLOR = 0x0a0e14;

export class GTACharacterViewer {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.currentModel = null;
        this.bones = new Map();
        this.bonesById = new Map();
        this.textures = new Map();
        this.animations = [];
        this.currentAnim = null;
        this.mixer = null;
        this.clock = new THREE.Clock();
        this.skeleton = null;
        this.frameObjects = null;
        this.modelHasSkin = false;
        this.nonSkinnedMeshes = [];
        this.skeletonBones = [];
        this.boneHierarchyRoot = null;
        this.modelCenterY = 0;
        this.modelSize = 1;
        
        this.init();
    }
    
    init() {
        this.container.innerHTML = '';
        
        const canvas = document.createElement('canvas');
        canvas.id = 'gta-viewer-canvas';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';
        this.container.appendChild(canvas);
        
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(BG_COLOR);

        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        this.camera.position.set(5, 3, 8);
        
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;

        this.controls = new OrbitControls(this.camera, canvas);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.rotateSpeed = 1.0;
        this.controls.zoomSpeed = 1.2;
        this.controls.enableZoom = true;
        this.controls.enablePan = true;
        this.controls.panSpeed = 0.8;
        this.controls.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.ZOOM,
            RIGHT: THREE.MOUSE.PAN
        };
        this.controls.target.set(0, 0, 0);
        
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
        this.scene.add(ambientLight);
        
        const frontLight = new THREE.DirectionalLight(0xffffff, 0.4);
        frontLight.position.set(0, 2, 5);
        this.scene.add(frontLight);
        
        const backLight = new THREE.DirectionalLight(0xffffff, 0.4);
        backLight.position.set(0, 2, -5);
        this.scene.add(backLight);
        
        const leftLight = new THREE.DirectionalLight(0xffffff, 0.4);
        leftLight.position.set(-5, 2, 0);
        this.scene.add(leftLight);
        
        const rightLight = new THREE.DirectionalLight(0xffffff, 0.4);
        rightLight.position.set(5, 2, 0);
        this.scene.add(rightLight);
        
        const topLight = new THREE.DirectionalLight(0xffffff, 0.4);
        topLight.position.set(0, 5, 0);
        this.scene.add(topLight);
        
        const bottomLight = new THREE.DirectionalLight(0xffffff, 0.2);
        bottomLight.position.set(0, -3, 0);
        this.scene.add(bottomLight);
		
        const fillLight1 = new THREE.PointLight(0xffffff, 0.25);
        fillLight1.position.set(3, 2, 3);
        this.scene.add(fillLight1);
        
        const fillLight2 = new THREE.PointLight(0xffffff, 0.25);
        fillLight2.position.set(-3, 2, -3);
        this.scene.add(fillLight2);
        
        const fillLight3 = new THREE.PointLight(0xffffff, 0.25);
        fillLight3.position.set(3, 1, -3);
        this.scene.add(fillLight3);
        
        const fillLight4 = new THREE.PointLight(0xffffff, 0.25);
        fillLight4.position.set(-3, 1, 3);
        this.scene.add(fillLight4);

        window.addEventListener('resize', () => this.onResize());

        this.animate();
    }
    
    onResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();
        if (this.mixer) {
            this.mixer.update(delta);
        }
        
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
    
    async loadModel(dffPath, txdPath, ifpPath) {
        if (this.currentModel) {
            this.scene.remove(this.currentModel);
            this.currentModel = null;
        }
        if (this.mixer) {
            this.mixer.stopAllAction();
            this.mixer = null;
        }
        
        this.bones.clear();
        this.bonesById.clear();
        this.textures.clear();
        this.animations = [];
        this.currentAnim = null;
        
        try {
            if (txdPath) {
                await this.loadTXD(txdPath);
            }

            if (dffPath) {
                await this.loadDFF(dffPath);
            }

            if (ifpPath) {
                await this.loadIFP(ifpPath);
            }
            
        } catch (error) {
            console.error('Error loading model:', error);
            throw error;
        }
    }
    
    async loadTXD(path) {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`TXD not found: ${path}`);
        
        const buffer = await response.arrayBuffer();
        const txd = new TXDReader().parse(buffer);
        
        for (const tex of txd.textures) {
            if (tex.imageData) {
                const texture = this.createTexture(tex);
                this.textures.set(tex.name.toLowerCase(), texture);
            }
        }
        
        if (this.currentModel) {
            this.applyTexturesToModel(this.currentModel);
        }
    }
    
    createTexture(texData) {
        const texture = new THREE.DataTexture(
            texData.imageData, texData.width, texData.height,
            THREE.RGBAFormat, THREE.UnsignedByteType
        );
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.generateMipmaps = true;
        texture.flipY = false;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.hasAlpha = !!texData.hasAlpha;
        texture.needsUpdate = true;
        return texture;
    }
    
    applyTexturesToModel(model) {
        model.traverse((child) => {
            if (!child.isMesh && !child.isSkinnedMesh) return;
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            for (const mat of materials) {
                if (mat.userData?.textureName && this.textures.has(mat.userData.textureName)) {
                    mat.map = this.textures.get(mat.userData.textureName);
                    mat.color.setRGB(1, 1, 1);
                    mat.vertexColors = false;
                }
                if (mat.userData?.maskName && this.textures.has(mat.userData.maskName)) {
                    mat.alphaMap = this.textures.get(mat.userData.maskName);
                }
                mat.roughness = 0.9;
                mat.metalness = 0.0;
                this.updateMaterialAlpha(mat);
            }
        });
    }
    
    updateMaterialAlpha(material) {
        const hasAlphaMap = !!material.map?.hasAlpha;
        const hasMask = !!material.alphaMap;
        const isTranslucent = (material.opacity ?? 1) < 1;
        const needsTransparency = hasAlphaMap || hasMask;
        
        material.transparent = isTranslucent || needsTransparency;
        material.alphaTest = needsTransparency ? ALPHA_THRESHOLD : 0;
        material.needsUpdate = true;
    }
    
    async loadDFF(path) {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`DFF not found: ${path}`);
        
        const buffer = await response.arrayBuffer();
        const dff = new DFFReader().parse(buffer);
        if (!dff) throw new Error("Failed to parse DFF");
        
        this.displayModel(this.createMesh(dff));
    }

    makeMatte(modelGroup) {
        modelGroup.traverse((child) => {
            if (child.isMesh || child.isSkinnedMesh) {
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                for (const mat of materials) {
                    if (mat) {
                        mat.vertexColors = false;
                        mat.roughness = 0.9;
                        mat.metalness = 0.0;
                        if (!mat.map) {
                            mat.color.setRGB(1, 1, 1);
                        }
                        mat.needsUpdate = true;
                    }
                }
            }
        });
    }
    
    createMesh(dff) {
        const group = new THREE.Group();
        this.bones.clear();
        this.bonesById.clear();
        this.skeleton = null;
        this.modelHasSkin = false;
        this.nonSkinnedMeshes = [];
        this.frameObjects = null;

        const nodeIdToFrame = new Map();
        const frameToNodeId = new Map();
        let rootHANodes = null;
        
        for (let i = 0; i < dff.RWFrameList.length; i++) {
            const frame = dff.RWFrameList[i];
            const hanim = frame.RWExtension?.CHUNK_HANIM;
            if (hanim) {
                if (hanim.nodeId !== undefined) {
                    nodeIdToFrame.set(hanim.nodeId, i);
                    frameToNodeId.set(i, hanim.nodeId);
                }
                if (hanim.numNodes > 0 && hanim.nodes) {
                    rootHANodes = hanim.nodes;
                }
            }
        }
        
        const skinBoneToFrame = [];
        if (rootHANodes) {
            for (const node of rootHANodes) {
                const frameIdx = nodeIdToFrame.get(node.nodeId);
                skinBoneToFrame.push(frameIdx !== undefined ? frameIdx : node.nodeIndex);
            }
        }
        
        const rootBones = [];
        const allBones = [];
        
        if (dff.RWFrameList?.length > 0) {
            dff.RWFrameList.forEach((frame, idx) => {
                const bone = new THREE.Bone();
                const boneName = frame.RWExtension?.CHUNK_FRAME || `bone_${idx}`;
                bone.name = boneName;
                
                const { rotationMatrix, position } = frame.RWFrame;
                const matrix = new THREE.Matrix4();
                matrix.set(
                    rotationMatrix[0], rotationMatrix[3], rotationMatrix[6], position[0],
                    rotationMatrix[1], rotationMatrix[4], rotationMatrix[7], position[1],
                    rotationMatrix[2], rotationMatrix[5], rotationMatrix[8], position[2],
                    0, 0, 0, 1
                );
                bone.applyMatrix4(matrix);
                allBones[idx] = bone;
                
                const nodeId = frameToNodeId.get(idx);
                const boneInfo = { index: idx, name: boneName, bone, parentIndex: frame.parentIndex, nodeId };
                this.bones.set(boneName.toLowerCase(), boneInfo);
                if (nodeId !== undefined) this.bonesById.set(nodeId, boneInfo);
            });
            
            dff.RWFrameList.forEach((frame, idx) => {
                const bone = allBones[idx];
                const parentIdx = frame.RWFrame.parentIndex;
                if (parentIdx >= 0 && allBones[parentIdx]) {
                    allBones[parentIdx].add(bone);
                } else {
                    rootBones.push(bone);
                }
            });
            
            this.skeletonBones = skinBoneToFrame.length > 0 
                ? skinBoneToFrame.map(fi => allBones[fi]).filter(b => b)
                : allBones.slice(1);
            this.boneHierarchyRoot = rootBones[0];
        }

        for (const geom of dff.RWGeometryList) {
            const geo = new THREE.BufferGeometry();
            const skin = geom.RWExtension?.CHUNK_SKIN;
            const hasSkin = skin && skin.numBones > 0;
            const binMesh = geom.RWExtension?.CHUNK_BINMESH;
            
            const matTriangles = {};
            if (binMesh?.splits?.length > 0 && binMesh.splits[0].indices) {
                const isStrip = binMesh.faceType === 1;
                for (const split of binMesh.splits) {
                    if (!matTriangles[split.matIndex]) matTriangles[split.matIndex] = [];
                    if (isStrip) {
                        for (let i = 0; i < split.indices.length - 2; i++) {
                            const a = split.indices[i], b = split.indices[i + 1], c = split.indices[i + 2];
                            if (a === b || b === c || a === c) continue;
                            matTriangles[split.matIndex].push(i % 2 === 0 ? [a, c, b] : [a, b, c]);
                        }
                    } else {
                        for (let i = 0; i < split.indices.length; i += 3) {
                            matTriangles[split.matIndex].push([split.indices[i], split.indices[i + 1], split.indices[i + 2]]);
                        }
                    }
                }
            } else {
                for (const tri of geom.triangles) {
                    if (!matTriangles[tri.materialId]) matTriangles[tri.materialId] = [];
                    matTriangles[tri.materialId].push([tri.vertex1, tri.vertex2, tri.vertex3]);
                }
            }
            
            const totalTris = Object.values(matTriangles).reduce((a, b) => a + b.length, 0);
            const posArray = new Float32Array(totalTris * 9);
            const normArray = geom.morphTargets[0]?.hasNormals ? new Float32Array(totalTris * 9) : null;
            const uvArray = geom.texCoords ? new Float32Array(totalTris * 6) : null;
            const colArray = null;
            const skinIdxArray = hasSkin ? new Float32Array(totalTris * 12) : null;
            const skinWgtArray = hasSkin ? new Float32Array(totalTris * 12) : null;
            
            let vi = 0;
            for (const matId of Object.keys(matTriangles)) {
                const tris = matTriangles[matId];
                geo.addGroup(vi, tris.length * 3, Number(matId));
                
                for (const [v1, v2, v3] of tris) {
                    for (const viLocal of [v1, v2, v3]) {
                        const vert = geom.morphTargets[0].vertices[viLocal];
                        posArray[vi * 3] = vert.x;
                        posArray[vi * 3 + 1] = vert.y;
                        posArray[vi * 3 + 2] = vert.z;
                        
                        if (normArray && geom.morphTargets[0].normals) {
                            const n = geom.morphTargets[0].normals[viLocal];
                            normArray[vi * 3] = n.x;
                            normArray[vi * 3 + 1] = n.y;
                            normArray[vi * 3 + 2] = n.z;
                        }
                        
                        if (uvArray && geom.texCoords[0]) {
                            const uv = geom.texCoords[0][viLocal];
                            uvArray[vi * 2] = uv.u;
                            uvArray[vi * 2 + 1] = uv.v;
                        }
                        
                        if (hasSkin && skin.vertexBoneIndices[viLocal]) {
                            const result = this.sanitizeSkinWeights(
                                skin.vertexBoneIndices[viLocal],
                                skin.vertexBoneWeights[viLocal]
                            );
                            for (let b = 0; b < 4; b++) {
                                skinIdxArray[vi * 4 + b] = result.indices[b];
                                skinWgtArray[vi * 4 + b] = result.weights[b];
                            }
                        }
                        vi++;
                    }
                }
            }
            
            geo.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
            if (normArray) geo.setAttribute("normal", new THREE.BufferAttribute(normArray, 3));
            else geo.computeVertexNormals();
            if (uvArray) geo.setAttribute("uv", new THREE.BufferAttribute(uvArray, 2));
            
            if (hasSkin) {
                geo.setAttribute("skinIndex", new THREE.BufferAttribute(skinIdxArray, 4));
                geo.setAttribute("skinWeight", new THREE.BufferAttribute(skinWgtArray, 4));
            }
            geo.computeBoundingSphere();

            const materials = geom.RWMaterialList.map((matData) => {
                const mat = new THREE.MeshStandardMaterial({
                    vertexColors: false,
                    roughness: 0.9, 
                    metalness: 0.0,     
                    emissive: 0x000000, 
                    side: THREE.DoubleSide
                });
                if (matData.RWMaterial.color) {
                    mat.color = new THREE.Color(
                        matData.RWMaterial.color.r / 255,
                        matData.RWMaterial.color.g / 255,
                        matData.RWMaterial.color.b / 255
                    );
                    mat.opacity = (matData.RWMaterial.color.a ?? 255) / 255;
                }
                if (matData.RWMaterial.isTextured && matData.RWMaterial.RWTexture) {
                    const texName = matData.RWMaterial.RWTexture.name?.toLowerCase();
                    const maskName = matData.RWMaterial.RWTexture.maskName?.toLowerCase();
                    mat.userData.textureName = texName;
                    mat.userData.maskName = maskName;
                    if (texName && this.textures.has(texName)) {
                        mat.map = this.textures.get(texName);
                        mat.color.setRGB(1, 1, 1);
                    }
                    if (maskName && this.textures.has(maskName)) {
                        mat.alphaMap = this.textures.get(maskName);
                    }
                }
                this.updateMaterialAlpha(mat);
                return mat;
            });
            
            let mesh;
            if (hasSkin && this.skeletonBones?.length > 0) {
                mesh = new THREE.SkinnedMesh(geo, materials);
                
                if (this.boneHierarchyRoot) mesh.add(this.boneHierarchyRoot);
                else if (this.skeletonBones[0]) mesh.add(this.skeletonBones[0]);
                
                group.add(mesh);
                mesh.updateMatrixWorld(true);
                
                if (skin.skinToBoneMatrix?.length > 0) {
                    const inverses = [];
                    const targetWorlds = [];
                    
                    for (const stb of skin.skinToBoneMatrix) {
                        const m = new THREE.Matrix4();
                        m.set(
                            stb[0], stb[4], stb[8],  stb[12],
                            stb[1], stb[5], stb[9],  stb[13],
                            stb[2], stb[6], stb[10], stb[14],
                            stb[3], stb[7], stb[11], stb[15]
                        );
                        inverses.push(m.clone());
                        targetWorlds.push(m.clone().invert());
                    }
                    
                    const boneToHAIndex = new Map();
                    for (let i = 0; i < this.skeletonBones.length; i++) {
                        boneToHAIndex.set(this.skeletonBones[i], i);
                    }
                    
                    for (let i = 0; i < this.skeletonBones.length && i < targetWorlds.length; i++) {
                        const bone = this.skeletonBones[i];
                        const targetWorld = targetWorlds[i];
                        
                        let parentWorld = new THREE.Matrix4();
                        if (bone.parent) {
                            const parentIdx = boneToHAIndex.get(bone.parent);
                            if (parentIdx !== undefined && parentIdx < targetWorlds.length) {
                                parentWorld = targetWorlds[parentIdx];
                            }
                        }
                        
                        const local = parentWorld.clone().invert().multiply(targetWorld);
                        const pos = new THREE.Vector3();
                        const quat = new THREE.Quaternion();
                        const scl = new THREE.Vector3();
                        local.decompose(pos, quat, scl);
                        bone.position.copy(pos);
                        bone.quaternion.copy(quat);
                        bone.scale.copy(scl);
                    }
                }
                
                mesh.updateMatrixWorld(true);
                this.skeleton = new THREE.Skeleton(this.skeletonBones);
                mesh.bind(this.skeleton);
                this.modelHasSkin = true;
            } else {
                mesh = new THREE.Mesh(geo, materials);
                group.add(mesh);
                this.nonSkinnedMeshes.push({ mesh, geomIndex: dff.RWGeometryList.indexOf(geom) });
            }
        }

        this.makeMatte(group);
        
        group.rotation.set(-Math.PI / 2, 0, 0);
        return group;
    }
    
    sanitizeSkinWeights(indices, weights) {
        const idx = [
            indices?.x ?? 0, indices?.y ?? 0,
            indices?.z ?? 0, indices?.w ?? 0
        ];
        const wgt = [
            Number.isFinite(weights?.x) && weights.x > 0 ? weights.x : 0,
            Number.isFinite(weights?.y) && weights.y > 0 ? weights.y : 0,
            Number.isFinite(weights?.z) && weights.z > 0 ? weights.z : 0,
            Number.isFinite(weights?.w) && weights.w > 0 ? weights.w : 0
        ];
        
        const sum = wgt[0] + wgt[1] + wgt[2] + wgt[3];
        if (sum <= 1e-8) {
            return { indices: idx, weights: [1, 0, 0, 0], rawSum: sum, normalized: true, fallback: true };
        }
        
        for (let i = 0; i < 4; i++) wgt[i] /= sum;
        return { indices: idx, weights: wgt, rawSum: sum, normalized: true, fallback: false };
    }
    
    displayModel(model) {
        if (this.currentModel) this.scene.remove(this.currentModel);
        this.currentModel = model;
        
        if (this.modelHasSkin) {
            model.rotation.set(-Math.PI / 2, 0, 4.75);
        }
        
        this.scene.add(model);

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const minY = box.min.y;
        const size = box.getSize(new THREE.Vector3());
        
        this.modelSize = Math.max(size.x, size.y, size.z);
        this.modelCenterY = size.y / 2;

        model.position.x = -center.x;
        model.position.z = -center.z;
        model.position.y = -minY;
		

        const distance = this.modelSize * 1.5;
        this.camera.position.set(distance * 0.7, distance * 0.7, distance * 0.5);
        this.controls.target.set(0, this.modelCenterY, 0);
        this.controls.update();
    }
    
    async loadIFP(path) {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`IFP not found: ${path}`);
        
        const buffer = await response.arrayBuffer();
        const ifp = new IFPReader().parse(buffer);
        this.animations = ifp.animations;

        if (this.currentModel && this.animations.length > 0) {
            this.playAnimation(this.animations[0].name);
        }
    }
    
    getAnimationNames() {
        return this.animations.map(anim => anim.name);
    }
    
    playAnimation(animName) {
        const anim = this.animations.find(a => a.name === animName);
        if (!anim) {
            console.warn(`Animation "${animName}" not found`);
            return false;
        }
        
        if (!this.currentModel) return false;
        
        const canAnimate = this.skeleton || (this.frameObjects && this.bones.size > 0);
        if (!canAnimate) return false;
        
        this.currentAnim = anim;
        if (this.mixer) this.mixer.stopAllAction();
        
        let mixerRoot = this.currentModel;
        this.currentModel.traverse((child) => {
            if (child.isSkinnedMesh) mixerRoot = child;
        });
        
        this.mixer = new THREE.AnimationMixer(mixerRoot);
        const tracks = [];
        let matchedBones = 0;
        
        for (const bone of anim.bones) {
            if (bone.keyframes.length === 0) continue;
            
            const boneName = bone.name.toLowerCase().trim().replace(/~/g, " ");
            
            let boneInfo = this.bones.get(boneName);
            if (!boneInfo?.bone) {
                for (const [name, info] of this.bones) {
                    const normalized = name.replace(/~/g, " ").trim();
                    if (normalized === boneName) { boneInfo = info; break; }
                }
            }
            if (!boneInfo?.bone) {
                for (const [name, info] of this.bones) {
                    const normalized = name.replace(/~/g, " ").trim();
                    if (normalized.endsWith(boneName) || boneName.endsWith(normalized)) {
                        boneInfo = info; break;
                    }
                }
            }
            if (!boneInfo?.bone && bone.boneId !== undefined) {
                boneInfo = this.bonesById.get(bone.boneId);
            }
            if (!boneInfo?.bone) continue;
            
            matchedBones++;
            const targetBone = boneInfo.bone;
            const times = bone.keyframes.map((kf) => kf.time);
            
            const quatValues = [];
            for (const kf of bone.keyframes) {
                quatValues.push(kf.rotation.x, kf.rotation.y, kf.rotation.z, kf.rotation.w);
            }
            tracks.push(new THREE.QuaternionKeyframeTrack(`${targetBone.name}.quaternion`, times, quatValues));
            
            if (bone.isRoot) {
                const posValues = [];
                let hasPos = false;
                for (const kf of bone.keyframes) {
                    if (kf.position) {
                        hasPos = true;
                        posValues.push(kf.position.x, kf.position.y, kf.position.z);
                    }
                }
                if (hasPos && posValues.length === times.length * 3) {
                    tracks.push(new THREE.VectorKeyframeTrack(`${targetBone.name}.position`, times, posValues));
                }
            }
        }
        
        if (tracks.length > 0) {
            const clip = new THREE.AnimationClip(anim.name, -1, tracks);
            this.mixer.clipAction(clip).play();
            return true;
        }
        
        return false;
    }
        
    resetCamera() {
        if (this.currentModel) {
            const distance = this.modelSize * 1.5;
            this.camera.position.set(distance * 0.7, distance * 0.7, distance * 0.5);
            this.controls.target.set(0, this.modelCenterY, 0);
        } else {
            this.camera.position.set(5, 3, 8);
            this.controls.target.set(0, 0, 0);
        }
        this.controls.update();
    }

    createMeshFromDFF(dffPath, txdPath) {
    }

    getTextureManager() {
        return {
            textures: this.textures,
            applyTexturesToModel: (model) => this.applyTexturesToModel(model),
            createTexture: (texData) => this.createTexture(texData),
            makeMatte: (model) => this.makeMatte(model)
        };
    }
	
	attachAccessoryToBone(accessoryGroup, boneName) {
		if (!this.currentModel) {
			console.warn('No model loaded');
			return false;
		}

		let targetBone = null;
		
		// Ищем в скелете
		if (this.skeleton) {
			for (const bone of this.skeleton.bones) {
				if (bone.name.toLowerCase() === boneName.toLowerCase()) {
					targetBone = bone;
					break;
				}
			}
		}
		
		// Если не нашли, ищем в иерархии модели
		if (!targetBone) {
			this.currentModel.traverse((child) => {
				if (child.isBone && child.name.toLowerCase() === boneName.toLowerCase()) {
					targetBone = child;
				}
			});
		}
		
		if (!targetBone) {
			console.warn(`Bone "${boneName}" not found. Available bones:`, 
				this.skeleton ? this.skeleton.bones.map(b => b.name) : 'no skeleton');
			return false;
		}
		
		// Сохраняем текущую локальную позицию (относительно текущего родителя)
		const localPos = accessoryGroup.position.clone();
		const localQuat = accessoryGroup.quaternion.clone();
		const localScl = accessoryGroup.scale.clone();
		
		// Открепляем от текущего родителя
		if (accessoryGroup.parent) {
			accessoryGroup.parent.remove(accessoryGroup);
		}
		
		// Прикрепляем к кости
		targetBone.add(accessoryGroup);
		
		// Восстанавливаем локальную позицию (теперь она локальна относительно кости)
		accessoryGroup.position.copy(localPos);
		accessoryGroup.quaternion.copy(localQuat);
		accessoryGroup.scale.copy(localScl);
		
		return true;
	}
	
	detachAccessoryFromBone(accessoryGroup) {
		if (!accessoryGroup.parent) return false;
		
		// Открепляем от кости и добавляем обратно в сцену
		const parent = accessoryGroup.parent;
		const worldPos = new THREE.Vector3();
		const worldQuat = new THREE.Quaternion();
		const worldScale = new THREE.Vector3();
		
		accessoryGroup.getWorldPosition(worldPos);
		accessoryGroup.getWorldQuaternion(worldQuat);
		accessoryGroup.getWorldScale(worldScale);
		
		parent.remove(accessoryGroup);
		this.scene.add(accessoryGroup);
		
		accessoryGroup.position.copy(worldPos);
		accessoryGroup.quaternion.copy(worldQuat);
		accessoryGroup.scale.copy(worldScale);
		
		return true;
	}
}
