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
		this.isDestroyed = false;
		this.animationId = null; 
        
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
		if (this.isDestroyed) return;
		
        requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();
        if (this.mixer) {
            this.mixer.update(delta);
        }
        
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
    
    async loadModel(dffPath, txdPath, ifpPath, modelData = null) {
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
			
			if (modelData) {
				this.modelData = modelData;
				if (this.currentModel) {
					this.currentModel.userData.modelData = modelData;
				}
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
		if (!model) return;
		
		let textureCount = 0;
		let missingCount = 0;
		
		model.traverse((child) => {
			if (!child.isMesh && !child.isSkinnedMesh) return;
			
			const materials = Array.isArray(child.material) ? child.material : [child.material];
			for (const mat of materials) {
				if (mat.userData?.textureName) {
					const texName = mat.userData.textureName;
					if (this.textures.has(texName)) {
						const texture = this.textures.get(texName);
						mat.map = texture;
						mat.color.setRGB(1, 1, 1);
						mat.vertexColors = false;
						textureCount++;
					} else {
						missingCount++;
						console.warn(`Текстура не найдена: ${texName}`);
					}
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
		
		const fileName = path.split('/').pop();
		dff.name = fileName.replace(/\.dff$/i, '');

		const model = this.createMesh(dff);

		this.applyTexturesToModel(model);
		
		this.displayModel(model);
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

		const frameObjects = [];
		const frameNames = [];
		
		if (dff.RWFrameList) {
			for (let i = 0; i < dff.RWFrameList.length; i++) {
				const frame = dff.RWFrameList[i];
				const name = frame.RWExtension?.CHUNK_FRAME || `frame_${i}`;
				frameNames.push(name);
				
				const frameObj = new THREE.Object3D();
				frameObj.name = name;
				
				const { rotationMatrix, position } = frame.RWFrame;
				const matrix = new THREE.Matrix4();
				matrix.set(
					rotationMatrix[0], rotationMatrix[3], rotationMatrix[6], position[0],
					rotationMatrix[1], rotationMatrix[4], rotationMatrix[7], position[1],
					rotationMatrix[2], rotationMatrix[5], rotationMatrix[8], position[2],
					0, 0, 0, 1
				);
				
				const pos = new THREE.Vector3();
				const quat = new THREE.Quaternion();
				const scl = new THREE.Vector3();
				matrix.decompose(pos, quat, scl);
				
				frameObj.position.copy(pos);
				frameObj.quaternion.copy(quat);
				frameObj.scale.copy(scl);
				
				frameObjects.push(frameObj);
			}
		}

		if (dff.RWFrameList) {
			for (let i = 0; i < dff.RWFrameList.length; i++) {
				const parentIndex = dff.RWFrameList[i].RWFrame.parentIndex;
				if (parentIndex >= 0 && parentIndex < frameObjects.length) {
					frameObjects[parentIndex].add(frameObjects[i]);
				} else {
					group.add(frameObjects[i]);
				}
			}
		}

		this.frameObjects = frameObjects;

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
				const boneName = frameNames[idx] || frame.RWExtension?.CHUNK_FRAME || `bone_${idx}`;
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

		for (let geomIdx = 0; geomIdx < dff.RWGeometryList.length; geomIdx++) {
			const geom = dff.RWGeometryList[geomIdx];
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

			let targetFrame = null;
			let meshName = `geometry_${geomIdx}`;
			
			if (dff.RWAtomicList) {
				for (const atomic of dff.RWAtomicList) {
					if (atomic.geometryIndex === geomIdx) {
						const frameIdx = atomic.frameIndex;
						if (frameIdx !== undefined && frameIdx < frameObjects.length) {
							targetFrame = frameObjects[frameIdx];
							meshName = frameNames[frameIdx] || `frame_${frameIdx}`;
							break;
						}
					}
				}
			}
			
			if (!targetFrame) {
				targetFrame = group;
			}

			const materials = geom.RWMaterialList.map((matData) => {
				const texName = matData.RWMaterial.RWTexture?.name?.toLowerCase() || '';
				const color = matData.RWMaterial.color;
				const isGlass = texName.includes('glass') || 
								texName.includes('window') || 
								texName.includes('windscreen') ||
								texName.includes('glass') ||
								(color && color.a < 250);
				
				const mat = new THREE.MeshStandardMaterial({
					vertexColors: false,
					roughness: isGlass ? 0.1 : 0.9,
					metalness: isGlass ? 0.3 : 0.0,
					emissive: 0x000000,
					side: THREE.DoubleSide,
					transparent: isGlass,
					depthWrite: !isGlass,
					renderOrder: isGlass ? 1 : 0,
					opacity: isGlass ? 0.6 : 1.0
				});
				
				if (color) {
					mat.color = new THREE.Color(color.r / 255, color.g / 255, color.b / 255);
					if (!isGlass) {
						mat.opacity = (color.a ?? 255) / 255;
					}
				}

				if (matData.RWMaterial.isTextured && matData.RWMaterial.RWTexture) {
					const texNameLower = texName;
					const maskName = matData.RWMaterial.RWTexture.maskName?.toLowerCase();
					mat.userData.textureName = texNameLower;
					mat.userData.maskName = maskName;
					
					if (texNameLower && this.textures.has(texNameLower)) {
						const texture = this.textures.get(texNameLower);
						mat.map = texture;
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
				mesh.name = meshName;
				
				if (this.boneHierarchyRoot) mesh.add(this.boneHierarchyRoot);
				else if (this.skeletonBones[0]) mesh.add(this.skeletonBones[0]);
				
				targetFrame.add(mesh);
				mesh.updateMatrixWorld(true);
				
				if (skin.skinToBoneMatrix?.length > 0) {
					const targetWorlds = [];
					for (const stb of skin.skinToBoneMatrix) {
						const m = new THREE.Matrix4();
						m.set(
							stb[0], stb[4], stb[8],  stb[12],
							stb[1], stb[5], stb[9],  stb[13],
							stb[2], stb[6], stb[10], stb[14],
							stb[3], stb[7], stb[11], stb[15]
						);
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
				mesh.name = meshName;
				targetFrame.add(mesh);
				this.nonSkinnedMeshes.push({ mesh, geomIndex: geomIdx });
			}
		}

		const dffName = dff.name || 'model';
		group.name = dffName;

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

		let vloFound = false;
		let damFound = false;
		
		model.traverse((child) => {
			if (child.isMesh || child.isSkinnedMesh) {
				let obj = child;
				let shouldHide = false;
				let reason = '';
				
				while (obj && obj !== model) {
					const name = obj.name?.toLowerCase() || '';
					if (name.includes('_vlo')) {
						shouldHide = true;
						reason = '_vlo';
						break;
					}
					if (name.includes('_tun')) {
						shouldHide = true;
						reason = '_tun';
						break;
					}
					if (name.includes('_dam')) {
						shouldHide = true;
						reason = '_dam';
						break;
					}
					obj = obj.parent;
				}
				
				if (shouldHide) {
					child.visible = false;
					if (reason === '_vlo') vloFound = true;
					if (reason === '_dam') damFound = true;
				}
			}
		});
		
		if (!this.modelHasSkin) {
			this.cloneWheels(model);
		}

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
		this.camera.position.set(0, this.modelCenterY+0.450, distance-0.4);
		this.controls.target.set(0, this.modelCenterY-0.05, 0);
		this.controls.update();
	}
	
	cloneWheels(model) {
		const wheelDummies = [];
		const dummyNames = ['wheel_lf_dummy', 'wheel_rf_dummy', 'wheel_lb_dummy', 'wheel_rb_dummy'];
		
		model.traverse((child) => {
			if (child.isObject3D && dummyNames.includes(child.name?.toLowerCase())) {
				wheelDummies.push(child);
			}
		});

		if (wheelDummies.length === 0) {
			const frameNames = ['wheel_lf', 'wheel_rf', 'wheel_lb', 'wheel_rb'];
			model.traverse((child) => {
				if (child.isObject3D && frameNames.includes(child.name?.toLowerCase())) {
					wheelDummies.push(child);
				}
			});
		}
		
		if (wheelDummies.length === 0) {
			return;
		}

		let wheelMesh = null;
		let wheelFrame = null;

		model.traverse((child) => {
			if (child.isMesh || child.isSkinnedMesh) {
				const name = child.name?.toLowerCase() || '';
				let parent = child.parent;
				let isInsideWheelDummy = false;
				while (parent) {
					const parentName = parent.name?.toLowerCase() || '';
					if (parentName.includes('wheel_') && parentName.includes('_dummy')) {
						isInsideWheelDummy = true;
						break;
					}
					parent = parent.parent;
				}
				
				if (isInsideWheelDummy && !child.userData.isClonedWheel) {
					wheelMesh = child;
					wheelFrame = child.parent;
				}
			}
		});
		
		if (!wheelMesh) {
			return;
		}


		const originalMesh = wheelMesh;
		const originalParent = wheelFrame;

		let clonedCount = 0;
		for (const dummy of wheelDummies) {
			let hasWheel = false;
			dummy.children.forEach(child => {
				if (child.isMesh || child.isSkinnedMesh) {
					const name = child.name?.toLowerCase() || '';
					if (name === 'wheel' || name.includes('wheel')) {
						hasWheel = true;
					}
				}
			});

			if (hasWheel) continue;

			if (dummy === originalParent) continue;

			const clonedMesh = originalMesh.clone();
			clonedMesh.name = originalMesh.name;
			clonedMesh.userData.isClonedWheel = true;
			clonedMesh.userData.originalWheel = true;

			clonedMesh.position.set(0, 0, 0);
			clonedMesh.rotation.set(0, 0, 0);
			clonedMesh.scale.set(1, 1, 1);

			const isLeft = dummy.name.toLowerCase().includes('_lf') || dummy.name.toLowerCase().includes('_lb');
			if (isLeft) {
				clonedMesh.scale.x = -1;
			}

			dummy.add(clonedMesh);
			clonedCount++;
		}

		if (clonedCount > 0 && originalParent) {
			let wheelCount = 0;
			model.traverse((child) => {
				if (child.isMesh || child.isSkinnedMesh) {
					const name = child.name?.toLowerCase() || '';
					if (name === 'wheel' || name.includes('wheel')) {
						if (!child.userData.isClonedWheel) {
							wheelCount++;
						}
					}
				}
			});

			if (wheelCount > 0 && originalMesh.visible) {
				if (clonedCount >= 3) {
					originalMesh.visible = false;
				}
			}
		}

	}
    
	fixMaskGlass(accessoryGroup) {
		if (!accessoryGroup) return;
		
		accessoryGroup.traverse((child) => {
			if (!child.isMesh && !child.isSkinnedMesh) return;
			
			const materials = Array.isArray(child.material) ? child.material : [child.material];
			for (const mat of materials) {
				const texName = mat.userData?.textureName?.toLowerCase() || '';
				const isGlass = texName.includes('glass') || 
								texName.includes('window') || 
								texName.includes('windscreen') ||
								texName.includes('visir') ||
								texName.includes('visor') ||
								texName.includes('lens') ||
								mat.opacity < 0.95;
				
				if (isGlass) {
					mat.transparent = true;
					mat.depthWrite = false;    
					mat.renderOrder = 1;       
					mat.depthTest = true;     
					mat.roughness = 0.1;         
					mat.metalness = 0.3;       
					mat.opacity = 0.4;          
					mat.alphaTest = 0.1;       
					mat.side = THREE.DoubleSide; 
					mat.needsUpdate = true;
				} else {
					mat.transparent = false;
					mat.depthWrite = true;
					mat.renderOrder = 0;
					mat.opacity = 1.0;
					mat.needsUpdate = true;
				}
			}
		});
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
        
	playAnimationOnce(animName, onComplete, stopFrame) {
		const anim = this.animations.find(a => a.name === animName);
		if (!anim) {
			return false;
		}
		
		if (!this.currentModel) return false;
		
		const canAnimate = this.skeleton || (this.frameObjects && this.bones.size > 0);
		if (!canAnimate) return false;
		
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
			const action = this.mixer.clipAction(clip);
			action.setLoop(THREE.LoopOnce);
			action.clampWhenFinished = true;
			action.play();

			let stopTime;
			if (stopFrame !== undefined) {
				const totalFrames = anim.bones[0]?.keyframes?.length || 0;
				if (stopFrame >= 0 && stopFrame < totalFrames) {
					stopTime = anim.bones[0].keyframes[stopFrame]?.time || 0;
				} else {
					stopTime = clip.duration;
				}
			} else {
				stopTime = clip.duration;
			}

			const mixer = this.mixer;

			setTimeout(() => {
				action.time = stopTime;

				mixer.update(0);
								
				if (onComplete) onComplete();
			}, (stopTime * 1000) + 100);
			
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
            this.camera.position.set(0, 0, 0);
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

		if (this.skeleton) {
			for (const bone of this.skeleton.bones) {
				if (bone.name.toLowerCase() === boneName.toLowerCase()) {
					targetBone = bone;
					break;
				}
			}
		}

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

		const localPos = accessoryGroup.position.clone();
		const localQuat = accessoryGroup.quaternion.clone();
		const localScl = accessoryGroup.scale.clone();

		if (accessoryGroup.parent) {
			accessoryGroup.parent.remove(accessoryGroup);
		}

		targetBone.add(accessoryGroup);

		accessoryGroup.position.copy(localPos);
		accessoryGroup.quaternion.copy(localQuat);
		accessoryGroup.scale.copy(localScl);
		
		return true;
	}
	
	detachAccessoryFromBone(accessoryGroup) {
		if (!accessoryGroup.parent) return false;

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
	
	destroy() {
		this.isDestroyed = true;

		if (this.animationId) {
			cancelAnimationFrame(this.animationId);
			this.animationId = null;
		}

		if (this.mixer) {
			this.mixer.stopAllAction();
			this.mixer = null;
		}

		if (this.scene) {
			this.scene.traverse((child) => {
				if (child.isMesh || child.isSkinnedMesh) {
					if (child.geometry) child.geometry.dispose();
					if (Array.isArray(child.material)) {
						child.material.forEach(mat => mat.dispose());
					} else if (child.material) {
						child.material.dispose();
					}
				}
			});
			while (this.scene.children.length > 0) {
				this.scene.remove(this.scene.children[0]);
			}
			this.scene = null;
		}

		for (const texture of this.textures.values()) {
			texture.dispose();
		}
		this.textures.clear();

		if (this.renderer) {
			this.renderer.dispose();
			if (this.renderer.domElement && this.renderer.domElement.parentNode) {
				this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
			}
			this.renderer = null;
		}

		if (this.container) {
			while (this.container.firstChild) {
				this.container.removeChild(this.container.firstChild);
			}
			this.container = null;
		}

		if (this.controls) {
			this.controls.dispose();
			this.controls = null;
		}

		this.camera = null;
		this.currentModel = null;
		this.bones.clear();
		this.bonesById.clear();
		this.skeleton = null;
		this.skeletonBones = [];
		this.nonSkinnedMeshes = [];
		this.boneHierarchyRoot = null;

		window.removeEventListener('resize', this.resizeHandler);
	}
	
	openAllDoors() {
		if (!this.currentModel) return false;
		
		const modelData = this.modelData || this.currentModel?.userData?.modelData || {};
		if (modelData.enableDoors === false) {
			return false;
		}
		
		const partsToAnimate = [];
		const targetNames = [
			'door_lf_dummy', 'door_lr_dummy', 'door_rr_dummy', 'door_rf_dummy',
			'bonnet_dummy', 'boot_dummy'
		];
		
		this.currentModel.traverse((child) => {
			if (child.isObject3D) {
				const name = child.name?.toLowerCase() || '';
				if (targetNames.includes(name)) {
					const isOpen = child.userData?.isOpen || false;
					if (!isOpen) {
						partsToAnimate.push({
							object: child,
							name: name,
							originalRotation: child.rotation.clone(),
							originalPosition: child.position.clone()
						});
					}
				}
			}
		});

		if (partsToAnimate.length === 0) {
			return false;
		}

		partsToAnimate.forEach((part, index) => {
			this.animateDoor(part, true, index * 100);
		});

		return true;
	}

	closeAllDoors() {
		if (!this.currentModel) return false;

		const modelData = this.modelData || this.currentModel?.userData?.modelData || {};
		if (modelData.enableDoors === false) {
			return false;
		}

		const openParts = [];
		this.currentModel.traverse((child) => {
			if (child.userData?.isOpen) {
				openParts.push({
					object: child,
					name: child.name?.toLowerCase() || '',
					originalRotation: child.userData.originalRotation || child.rotation.clone(),
					originalPosition: child.userData.originalPosition || child.position.clone()
				});
			}
		});

		if (openParts.length === 0) return false;

		openParts.forEach((part, index) => {
			this.animateDoorClose(part, index * 100);
		});

		return true;
	}
	
	animateDoor(partData, open, delay = 0) {
		const object = partData.object;
		const name = partData.name.toLowerCase();

		const modelData = this.modelData || this.currentModel?.userData?.modelData || {};
		const doorAngles = modelData.doorAngles || {};

		const defaults = {
			'door_lf_dummy': { angle: -60, axis: 'z', offset: 0 },
			'door_rf_dummy': { angle: 60, axis: 'z', offset: 0 },
			'door_lr_dummy': { angle: -60, axis: 'z', offset: 0 },
			'door_rr_dummy': { angle: 60, axis: 'z', offset: 0 },
			'bonnet_dummy': { angle: 45, axis: 'x', offset: 0 },
			'boot_dummy': { angle: -45, axis: 'x', offset: 0 }
		};

		let partType = name;
		if (partType.endsWith('_dummy')) {
			partType = partType.slice(0, -6);
		}

		let config = null;

		if (doorAngles[name]) {
			config = doorAngles[name];
		} else if (doorAngles[partType]) {
			config = doorAngles[partType];
		}

		if (!config && defaults[name]) {
			config = defaults[name];
		}

		if (!config) {
			return;
		}
		
		const axis = config.axis || 'y';
		const angle = open ? config.angle * Math.PI / 180 : 0;
		const offset = config.offset || 0;

		if (open) {
			object.userData.originalRotation = object.rotation.clone();
			object.userData.originalPosition = object.position.clone();
			object.userData.originalScale = object.scale.clone();
		}

		const startTime = Date.now() + delay;
		const duration = 500;
		const startAngle = object.rotation[axis] || 0;
		const targetAngle = angle;
		
		object.userData.isOpen = open;
		object.userData.animating = true;

		const animate = () => {
			const elapsed = Date.now() - startTime;
			const progress = Math.min(elapsed / duration, 1);
			
			const ease = progress < 0.5 
				? 2 * progress * progress 
				: 1 - Math.pow(-2 * progress + 2, 2) / 2;
			
			const currentAngle = startAngle + (targetAngle - startAngle) * ease;

			if (axis === 'x') {
				object.rotation.x = currentAngle;
			} else if (axis === 'y') {
				object.rotation.y = currentAngle;
			} else if (axis === 'z') {
				object.rotation.z = currentAngle;
			}

			if (offset !== 0) {
				object.position.y = (object.userData.originalPosition?.y || 0) + offset * ease;
			}

			if (progress < 1) {
				requestAnimationFrame(animate);
			} else {
				object.userData.animating = false;
				if (axis === 'x') {
					object.rotation.x = targetAngle;
				} else if (axis === 'y') {
					object.rotation.y = targetAngle;
				} else if (axis === 'z') {
					object.rotation.z = targetAngle;
				}
			}
		};

		setTimeout(animate, delay);
	}
	
    animateDoorClose(partData, delay = 0) {
		const object = partData.object;
		const name = partData.name.toLowerCase();
		
		const startTime = Date.now() + delay;
		const duration = 500;
		
		const startRotX = object.rotation.x;
		const startRotY = object.rotation.y;
		const startRotZ = object.rotation.z;
		const startPosY = object.position.y;
		
		const targetRotX = partData.originalRotation?.x || 0;
		const targetRotY = partData.originalRotation?.y || 0;
		const targetRotZ = partData.originalRotation?.z || 0;
		const targetPosY = partData.originalPosition?.y || object.position.y;

		object.userData.animating = true;

		const animate = () => {
			const elapsed = Date.now() - startTime;
			const progress = Math.min(elapsed / duration, 1);
			
			const ease = progress < 0.5 
				? 2 * progress * progress 
				: 1 - Math.pow(-2 * progress + 2, 2) / 2;
			
			object.rotation.x = startRotX + (targetRotX - startRotX) * ease;
			object.rotation.y = startRotY + (targetRotY - startRotY) * ease;
			object.rotation.z = startRotZ + (targetRotZ - startRotZ) * ease;
			object.position.y = startPosY + (targetPosY - startPosY) * ease;

			if (progress < 1) {
				requestAnimationFrame(animate);
			} else {
				object.rotation.x = targetRotX;
				object.rotation.y = targetRotY;
				object.rotation.z = targetRotZ;
				object.position.y = targetPosY;
				object.userData.isOpen = false;
				object.userData.animating = false;
				delete object.userData.originalRotation;
				delete object.userData.originalPosition;
				delete object.userData.originalScale;
			}
		};

		setTimeout(animate, delay);
	}

	areDoorsOpen() {
		let openCount = 0;
		this.currentModel?.traverse((child) => {
			if (child.userData?.isOpen) openCount++;
		});
		return openCount > 0;
	}

	toggleDoors() {
		if (this.areDoorsOpen()) {
			return this.closeAllDoors();
		} else {
			return this.openAllDoors();
		}
	}
	
	captureTransparentScreenshot(width = 1920, height = 1080, scale = 2) {
    // Сохраняем текущие настройки камеры
    const originalAspect = this.camera.aspect;
    const originalSize = {
        width: this.renderer.domElement.width,
        height: this.renderer.domElement.height
    };
    const originalPixelRatio = this.renderer.getPixelRatio();
    const originalClearColor = this.renderer.getClearColor(new THREE.Color());
    const originalClearAlpha = this.renderer.getClearAlpha();
    const originalBackground = this.scene.background;

    // Вычисляем целевые размеры с учётом масштаба
    const renderWidth = Math.round(width * scale);
    const renderHeight = Math.round(height * scale);
    const targetAspect = renderWidth / renderHeight;

    // Сохраняем текущую позицию камеры и target
    const cameraPos = this.camera.position.clone();
    const cameraTarget = this.controls.target.clone();

    // Временно меняем aspect камеры под целевое разрешение
    this.camera.aspect = targetAspect;
    this.camera.updateProjectionMatrix();

    // Меняем размер рендера
    this.renderer.setSize(renderWidth, renderHeight, false);
    this.renderer.setPixelRatio(1);

    // Устанавливаем прозрачный фон
    this.scene.background = null;
    this.renderer.setClearColor(0x000000, 0);

    // Рендерим в основной буфер (он уже имеет нужный размер)
    this.renderer.render(this.scene, this.camera);

    // Читаем пиксели напрямую из основного рендера
    const pixels = new Uint8Array(renderWidth * renderHeight * 4);
    const gl = this.renderer.getContext();
    gl.readPixels(0, 0, renderWidth, renderHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    // Восстанавливаем настройки
    this.camera.aspect = originalAspect;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(originalSize.width, originalSize.height, false);
    this.renderer.setPixelRatio(originalPixelRatio);
    this.scene.background = originalBackground;
    this.renderer.setClearColor(originalClearColor, originalClearAlpha);

    // Создаём Canvas
    const canvas = document.createElement('canvas');
    canvas.width = renderWidth;
    canvas.height = renderHeight;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(renderWidth, renderHeight);

    // Копируем пиксели (переворачиваем по Y, т.к. WebGL хранит снизу вверх)
    for (let y = 0; y < renderHeight; y++) {
        for (let x = 0; x < renderWidth; x++) {
            const srcIdx = ((renderHeight - 1 - y) * renderWidth + x) * 4;
            const dstIdx = (y * renderWidth + x) * 4;
            imageData.data[dstIdx] = pixels[srcIdx];
            imageData.data[dstIdx + 1] = pixels[srcIdx + 1];
            imageData.data[dstIdx + 2] = pixels[srcIdx + 2];
            imageData.data[dstIdx + 3] = pixels[srcIdx + 3];
        }
    }
    ctx.putImageData(imageData, 0, 0);

    // Масштабируем до нужного размера с сглаживанием
    const resultCanvas = document.createElement('canvas');
    resultCanvas.width = width;
    resultCanvas.height = height;
    const resultCtx = resultCanvas.getContext('2d');
    resultCtx.imageSmoothingEnabled = true;
    resultCtx.imageSmoothingQuality = 'high';
    resultCtx.drawImage(canvas, 0, 0, renderWidth, renderHeight, 0, 0, width, height);

    return resultCanvas;
}

async captureAndDownloadScreenshot(filename = 'skin.png') {
    // scale = 2 даёт хорошее сглаживание, scale = 4 - суперсэмплинг
    const canvas = this.captureTransparentScreenshot(1920, 1080, 2);
    
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}
}


/*
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
		this.isDestroyed = false;
		this.animationId = null; 
        
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
		if (this.isDestroyed) return;
		
        requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();
        if (this.mixer) {
            this.mixer.update(delta);
        }
        
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
    
    async loadModel(dffPath, txdPath, ifpPath, modelData = null) {
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
			
			if (modelData) {
				this.modelData = modelData;
				if (this.currentModel) {
					this.currentModel.userData.modelData = modelData;
				}
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
		if (!model) return;
		
		let textureCount = 0;
		let missingCount = 0;
		
		model.traverse((child) => {
			if (!child.isMesh && !child.isSkinnedMesh) return;
			
			const materials = Array.isArray(child.material) ? child.material : [child.material];
			for (const mat of materials) {
				if (mat.userData?.textureName) {
					const texName = mat.userData.textureName;
					if (this.textures.has(texName)) {
						const texture = this.textures.get(texName);
						mat.map = texture;
						mat.color.setRGB(1, 1, 1);
						mat.vertexColors = false;
						textureCount++;
					} else {
						missingCount++;
						console.warn(`Текстура не найдена: ${texName}`);
					}
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
		
		const fileName = path.split('/').pop();
		dff.name = fileName.replace(/\.dff$/i, '');

		const model = this.createMesh(dff);

		this.applyTexturesToModel(model);
		
		this.displayModel(model);
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

		const frameObjects = [];
		const frameNames = [];
		
		if (dff.RWFrameList) {
			for (let i = 0; i < dff.RWFrameList.length; i++) {
				const frame = dff.RWFrameList[i];
				const name = frame.RWExtension?.CHUNK_FRAME || `frame_${i}`;
				frameNames.push(name);
				
				const frameObj = new THREE.Object3D();
				frameObj.name = name;
				
				const { rotationMatrix, position } = frame.RWFrame;
				const matrix = new THREE.Matrix4();
				matrix.set(
					rotationMatrix[0], rotationMatrix[3], rotationMatrix[6], position[0],
					rotationMatrix[1], rotationMatrix[4], rotationMatrix[7], position[1],
					rotationMatrix[2], rotationMatrix[5], rotationMatrix[8], position[2],
					0, 0, 0, 1
				);
				
				const pos = new THREE.Vector3();
				const quat = new THREE.Quaternion();
				const scl = new THREE.Vector3();
				matrix.decompose(pos, quat, scl);
				
				frameObj.position.copy(pos);
				frameObj.quaternion.copy(quat);
				frameObj.scale.copy(scl);
				
				frameObjects.push(frameObj);
			}
		}

		if (dff.RWFrameList) {
			for (let i = 0; i < dff.RWFrameList.length; i++) {
				const parentIndex = dff.RWFrameList[i].RWFrame.parentIndex;
				if (parentIndex >= 0 && parentIndex < frameObjects.length) {
					frameObjects[parentIndex].add(frameObjects[i]);
				} else {
					group.add(frameObjects[i]);
				}
			}
		}

		this.frameObjects = frameObjects;

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
				const boneName = frameNames[idx] || frame.RWExtension?.CHUNK_FRAME || `bone_${idx}`;
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

		for (let geomIdx = 0; geomIdx < dff.RWGeometryList.length; geomIdx++) {
			const geom = dff.RWGeometryList[geomIdx];
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

			let targetFrame = null;
			let meshName = `geometry_${geomIdx}`;
			
			if (dff.RWAtomicList) {
				for (const atomic of dff.RWAtomicList) {
					if (atomic.geometryIndex === geomIdx) {
						const frameIdx = atomic.frameIndex;
						if (frameIdx !== undefined && frameIdx < frameObjects.length) {
							targetFrame = frameObjects[frameIdx];
							meshName = frameNames[frameIdx] || `frame_${frameIdx}`;
							break;
						}
					}
				}
			}
			
			if (!targetFrame) {
				targetFrame = group;
			}

			const materials = geom.RWMaterialList.map((matData) => {
				const texName = matData.RWMaterial.RWTexture?.name?.toLowerCase() || '';
				const color = matData.RWMaterial.color;
				const isGlass = texName.includes('glass') || 
								texName.includes('window') || 
								texName.includes('windscreen') ||
								texName.includes('glass') ||
								(color && color.a < 250);
				
				const mat = new THREE.MeshStandardMaterial({
					vertexColors: false,
					roughness: isGlass ? 0.1 : 0.9,
					metalness: isGlass ? 0.3 : 0.0,
					emissive: 0x000000,
					side: THREE.DoubleSide,
					transparent: isGlass,
					depthWrite: !isGlass,
					renderOrder: isGlass ? 1 : 0,
					opacity: isGlass ? 0.6 : 1.0
				});
				
				if (color) {
					mat.color = new THREE.Color(color.r / 255, color.g / 255, color.b / 255);
					if (!isGlass) {
						mat.opacity = (color.a ?? 255) / 255;
					}
				}

				if (matData.RWMaterial.isTextured && matData.RWMaterial.RWTexture) {
					const texNameLower = texName;
					const maskName = matData.RWMaterial.RWTexture.maskName?.toLowerCase();
					mat.userData.textureName = texNameLower;
					mat.userData.maskName = maskName;
					
					if (texNameLower && this.textures.has(texNameLower)) {
						const texture = this.textures.get(texNameLower);
						mat.map = texture;
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
				mesh.name = meshName;
				
				if (this.boneHierarchyRoot) mesh.add(this.boneHierarchyRoot);
				else if (this.skeletonBones[0]) mesh.add(this.skeletonBones[0]);
				
				targetFrame.add(mesh);
				mesh.updateMatrixWorld(true);
				
				if (skin.skinToBoneMatrix?.length > 0) {
					const targetWorlds = [];
					for (const stb of skin.skinToBoneMatrix) {
						const m = new THREE.Matrix4();
						m.set(
							stb[0], stb[4], stb[8],  stb[12],
							stb[1], stb[5], stb[9],  stb[13],
							stb[2], stb[6], stb[10], stb[14],
							stb[3], stb[7], stb[11], stb[15]
						);
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
				mesh.name = meshName;
				targetFrame.add(mesh);
				this.nonSkinnedMeshes.push({ mesh, geomIndex: geomIdx });
			}
		}

		const dffName = dff.name || 'model';
		group.name = dffName;

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

		let vloFound = false;
		let damFound = false;
		
		model.traverse((child) => {
			if (child.isMesh || child.isSkinnedMesh) {
				let obj = child;
				let shouldHide = false;
				let reason = '';
				
				while (obj && obj !== model) {
					const name = obj.name?.toLowerCase() || '';
					if (name.includes('_vlo')) {
						shouldHide = true;
						reason = '_vlo';
						break;
					}
					if (name.includes('_tun')) {
						shouldHide = true;
						reason = '_tun';
						break;
					}
					if (name.includes('_dam')) {
						shouldHide = true;
						reason = '_dam';
						break;
					}
					obj = obj.parent;
				}
				
				if (shouldHide) {
					child.visible = false;
					if (reason === '_vlo') vloFound = true;
					if (reason === '_dam') damFound = true;
				}
			}
		});
		
		if (!this.modelHasSkin) {
			this.cloneWheels(model);
		}

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
	
	cloneWheels(model) {
		const wheelDummies = [];
		const dummyNames = ['wheel_lf_dummy', 'wheel_rf_dummy', 'wheel_lb_dummy', 'wheel_rb_dummy'];
		
		model.traverse((child) => {
			if (child.isObject3D && dummyNames.includes(child.name?.toLowerCase())) {
				wheelDummies.push(child);
			}
		});

		if (wheelDummies.length === 0) {
			const frameNames = ['wheel_lf', 'wheel_rf', 'wheel_lb', 'wheel_rb'];
			model.traverse((child) => {
				if (child.isObject3D && frameNames.includes(child.name?.toLowerCase())) {
					wheelDummies.push(child);
				}
			});
		}
		
		if (wheelDummies.length === 0) {
			return;
		}

		let wheelMesh = null;
		let wheelFrame = null;

		model.traverse((child) => {
			if (child.isMesh || child.isSkinnedMesh) {
				const name = child.name?.toLowerCase() || '';
				let parent = child.parent;
				let isInsideWheelDummy = false;
				while (parent) {
					const parentName = parent.name?.toLowerCase() || '';
					if (parentName.includes('wheel_') && parentName.includes('_dummy')) {
						isInsideWheelDummy = true;
						break;
					}
					parent = parent.parent;
				}
				
				if (isInsideWheelDummy && !child.userData.isClonedWheel) {
					wheelMesh = child;
					wheelFrame = child.parent;
				}
			}
		});
		
		if (!wheelMesh) {
			return;
		}


		const originalMesh = wheelMesh;
		const originalParent = wheelFrame;

		let clonedCount = 0;
		for (const dummy of wheelDummies) {
			let hasWheel = false;
			dummy.children.forEach(child => {
				if (child.isMesh || child.isSkinnedMesh) {
					const name = child.name?.toLowerCase() || '';
					if (name === 'wheel' || name.includes('wheel')) {
						hasWheel = true;
					}
				}
			});

			if (hasWheel) continue;

			if (dummy === originalParent) continue;

			const clonedMesh = originalMesh.clone();
			clonedMesh.name = originalMesh.name;
			clonedMesh.userData.isClonedWheel = true;
			clonedMesh.userData.originalWheel = true;

			clonedMesh.position.set(0, 0, 0);
			clonedMesh.rotation.set(0, 0, 0);
			clonedMesh.scale.set(1, 1, 1);

			const isLeft = dummy.name.toLowerCase().includes('_lf') || dummy.name.toLowerCase().includes('_lb');
			if (isLeft) {
				clonedMesh.scale.x = -1;
			}

			dummy.add(clonedMesh);
			clonedCount++;
		}

		if (clonedCount > 0 && originalParent) {
			let wheelCount = 0;
			model.traverse((child) => {
				if (child.isMesh || child.isSkinnedMesh) {
					const name = child.name?.toLowerCase() || '';
					if (name === 'wheel' || name.includes('wheel')) {
						if (!child.userData.isClonedWheel) {
							wheelCount++;
						}
					}
				}
			});

			if (wheelCount > 0 && originalMesh.visible) {
				if (clonedCount >= 3) {
					originalMesh.visible = false;
				}
			}
		}

	}
    
	fixMaskGlass(accessoryGroup) {
		if (!accessoryGroup) return;
		
		accessoryGroup.traverse((child) => {
			if (!child.isMesh && !child.isSkinnedMesh) return;
			
			const materials = Array.isArray(child.material) ? child.material : [child.material];
			for (const mat of materials) {
				const texName = mat.userData?.textureName?.toLowerCase() || '';
				const isGlass = texName.includes('glass') || 
								texName.includes('window') || 
								texName.includes('windscreen') ||
								texName.includes('visir') ||
								texName.includes('visor') ||
								texName.includes('lens') ||
								mat.opacity < 0.95;
				
				if (isGlass) {
					mat.transparent = true;
					mat.depthWrite = false;    
					mat.renderOrder = 1;       
					mat.depthTest = true;     
					mat.roughness = 0.1;         
					mat.metalness = 0.3;       
					mat.opacity = 0.4;          
					mat.alphaTest = 0.1;       
					mat.side = THREE.DoubleSide; 
					mat.needsUpdate = true;
				} else {
					mat.transparent = false;
					mat.depthWrite = true;
					mat.renderOrder = 0;
					mat.opacity = 1.0;
					mat.needsUpdate = true;
				}
			}
		});
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
        
	playAnimationOnce(animName, onComplete, stopFrame) {
		const anim = this.animations.find(a => a.name === animName);
		if (!anim) {
			return false;
		}
		
		if (!this.currentModel) return false;
		
		const canAnimate = this.skeleton || (this.frameObjects && this.bones.size > 0);
		if (!canAnimate) return false;
		
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
			const action = this.mixer.clipAction(clip);
			action.setLoop(THREE.LoopOnce);
			action.clampWhenFinished = true;
			action.play();

			let stopTime;
			if (stopFrame !== undefined) {
				const totalFrames = anim.bones[0]?.keyframes?.length || 0;
				if (stopFrame >= 0 && stopFrame < totalFrames) {
					stopTime = anim.bones[0].keyframes[stopFrame]?.time || 0;
				} else {
					stopTime = clip.duration;
				}
			} else {
				stopTime = clip.duration;
			}

			const mixer = this.mixer;

			setTimeout(() => {
				action.time = stopTime;

				mixer.update(0);
								
				if (onComplete) onComplete();
			}, (stopTime * 1000) + 100);
			
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

		if (this.skeleton) {
			for (const bone of this.skeleton.bones) {
				if (bone.name.toLowerCase() === boneName.toLowerCase()) {
					targetBone = bone;
					break;
				}
			}
		}

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

		const localPos = accessoryGroup.position.clone();
		const localQuat = accessoryGroup.quaternion.clone();
		const localScl = accessoryGroup.scale.clone();

		if (accessoryGroup.parent) {
			accessoryGroup.parent.remove(accessoryGroup);
		}

		targetBone.add(accessoryGroup);

		accessoryGroup.position.copy(localPos);
		accessoryGroup.quaternion.copy(localQuat);
		accessoryGroup.scale.copy(localScl);
		
		return true;
	}
	
	detachAccessoryFromBone(accessoryGroup) {
		if (!accessoryGroup.parent) return false;

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
	
	destroy() {
		this.isDestroyed = true;

		if (this.animationId) {
			cancelAnimationFrame(this.animationId);
			this.animationId = null;
		}

		if (this.mixer) {
			this.mixer.stopAllAction();
			this.mixer = null;
		}

		if (this.scene) {
			this.scene.traverse((child) => {
				if (child.isMesh || child.isSkinnedMesh) {
					if (child.geometry) child.geometry.dispose();
					if (Array.isArray(child.material)) {
						child.material.forEach(mat => mat.dispose());
					} else if (child.material) {
						child.material.dispose();
					}
				}
			});
			while (this.scene.children.length > 0) {
				this.scene.remove(this.scene.children[0]);
			}
			this.scene = null;
		}

		for (const texture of this.textures.values()) {
			texture.dispose();
		}
		this.textures.clear();

		if (this.renderer) {
			this.renderer.dispose();
			if (this.renderer.domElement && this.renderer.domElement.parentNode) {
				this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
			}
			this.renderer = null;
		}

		if (this.container) {
			while (this.container.firstChild) {
				this.container.removeChild(this.container.firstChild);
			}
			this.container = null;
		}

		if (this.controls) {
			this.controls.dispose();
			this.controls = null;
		}

		this.camera = null;
		this.currentModel = null;
		this.bones.clear();
		this.bonesById.clear();
		this.skeleton = null;
		this.skeletonBones = [];
		this.nonSkinnedMeshes = [];
		this.boneHierarchyRoot = null;

		window.removeEventListener('resize', this.resizeHandler);
	}
	
	openAllDoors() {
		if (!this.currentModel) return false;
		
		const modelData = this.modelData || this.currentModel?.userData?.modelData || {};
		if (modelData.enableDoors === false) {
			return false;
		}
		
		const partsToAnimate = [];
		const targetNames = [
			'door_lf_dummy', 'door_lr_dummy', 'door_rr_dummy', 'door_rf_dummy',
			'bonnet_dummy', 'boot_dummy'
		];
		
		this.currentModel.traverse((child) => {
			if (child.isObject3D) {
				const name = child.name?.toLowerCase() || '';
				if (targetNames.includes(name)) {
					const isOpen = child.userData?.isOpen || false;
					if (!isOpen) {
						partsToAnimate.push({
							object: child,
							name: name,
							originalRotation: child.rotation.clone(),
							originalPosition: child.position.clone()
						});
					}
				}
			}
		});

		if (partsToAnimate.length === 0) {
			return false;
		}

		partsToAnimate.forEach((part, index) => {
			this.animateDoor(part, true, index * 100);
		});

		return true;
	}

	closeAllDoors() {
		if (!this.currentModel) return false;

		const modelData = this.modelData || this.currentModel?.userData?.modelData || {};
		if (modelData.enableDoors === false) {
			return false;
		}

		const openParts = [];
		this.currentModel.traverse((child) => {
			if (child.userData?.isOpen) {
				openParts.push({
					object: child,
					name: child.name?.toLowerCase() || '',
					originalRotation: child.userData.originalRotation || child.rotation.clone(),
					originalPosition: child.userData.originalPosition || child.position.clone()
				});
			}
		});

		if (openParts.length === 0) return false;

		openParts.forEach((part, index) => {
			this.animateDoorClose(part, index * 100);
		});

		return true;
	}
	
	animateDoor(partData, open, delay = 0) {
		const object = partData.object;
		const name = partData.name.toLowerCase();

		const modelData = this.modelData || this.currentModel?.userData?.modelData || {};
		const doorAngles = modelData.doorAngles || {};

		const defaults = {
			'door_lf_dummy': { angle: -60, axis: 'z', offset: 0 },
			'door_rf_dummy': { angle: 60, axis: 'z', offset: 0 },
			'door_lr_dummy': { angle: -60, axis: 'z', offset: 0 },
			'door_rr_dummy': { angle: 60, axis: 'z', offset: 0 },
			'bonnet_dummy': { angle: 45, axis: 'x', offset: 0 },
			'boot_dummy': { angle: -45, axis: 'x', offset: 0 }
		};

		let partType = name;
		if (partType.endsWith('_dummy')) {
			partType = partType.slice(0, -6);
		}

		let config = null;

		if (doorAngles[name]) {
			config = doorAngles[name];
		} else if (doorAngles[partType]) {
			config = doorAngles[partType];
		}

		if (!config && defaults[name]) {
			config = defaults[name];
		}

		if (!config) {
			return;
		}
		
		const axis = config.axis || 'y';
		const angle = open ? config.angle * Math.PI / 180 : 0;
		const offset = config.offset || 0;

		if (open) {
			object.userData.originalRotation = object.rotation.clone();
			object.userData.originalPosition = object.position.clone();
			object.userData.originalScale = object.scale.clone();
		}

		const startTime = Date.now() + delay;
		const duration = 500;
		const startAngle = object.rotation[axis] || 0;
		const targetAngle = angle;
		
		object.userData.isOpen = open;
		object.userData.animating = true;

		const animate = () => {
			const elapsed = Date.now() - startTime;
			const progress = Math.min(elapsed / duration, 1);
			
			const ease = progress < 0.5 
				? 2 * progress * progress 
				: 1 - Math.pow(-2 * progress + 2, 2) / 2;
			
			const currentAngle = startAngle + (targetAngle - startAngle) * ease;

			if (axis === 'x') {
				object.rotation.x = currentAngle;
			} else if (axis === 'y') {
				object.rotation.y = currentAngle;
			} else if (axis === 'z') {
				object.rotation.z = currentAngle;
			}

			if (offset !== 0) {
				object.position.y = (object.userData.originalPosition?.y || 0) + offset * ease;
			}

			if (progress < 1) {
				requestAnimationFrame(animate);
			} else {
				object.userData.animating = false;
				if (axis === 'x') {
					object.rotation.x = targetAngle;
				} else if (axis === 'y') {
					object.rotation.y = targetAngle;
				} else if (axis === 'z') {
					object.rotation.z = targetAngle;
				}
			}
		};

		setTimeout(animate, delay);
	}
	
    animateDoorClose(partData, delay = 0) {
		const object = partData.object;
		const name = partData.name.toLowerCase();
		
		const startTime = Date.now() + delay;
		const duration = 500;
		
		const startRotX = object.rotation.x;
		const startRotY = object.rotation.y;
		const startRotZ = object.rotation.z;
		const startPosY = object.position.y;
		
		const targetRotX = partData.originalRotation?.x || 0;
		const targetRotY = partData.originalRotation?.y || 0;
		const targetRotZ = partData.originalRotation?.z || 0;
		const targetPosY = partData.originalPosition?.y || object.position.y;

		object.userData.animating = true;

		const animate = () => {
			const elapsed = Date.now() - startTime;
			const progress = Math.min(elapsed / duration, 1);
			
			const ease = progress < 0.5 
				? 2 * progress * progress 
				: 1 - Math.pow(-2 * progress + 2, 2) / 2;
			
			object.rotation.x = startRotX + (targetRotX - startRotX) * ease;
			object.rotation.y = startRotY + (targetRotY - startRotY) * ease;
			object.rotation.z = startRotZ + (targetRotZ - startRotZ) * ease;
			object.position.y = startPosY + (targetPosY - startPosY) * ease;

			if (progress < 1) {
				requestAnimationFrame(animate);
			} else {
				object.rotation.x = targetRotX;
				object.rotation.y = targetRotY;
				object.rotation.z = targetRotZ;
				object.position.y = targetPosY;
				object.userData.isOpen = false;
				object.userData.animating = false;
				delete object.userData.originalRotation;
				delete object.userData.originalPosition;
				delete object.userData.originalScale;
			}
		};

		setTimeout(animate, delay);
	}

	areDoorsOpen() {
		let openCount = 0;
		this.currentModel?.traverse((child) => {
			if (child.userData?.isOpen) openCount++;
		});
		return openCount > 0;
	}

	toggleDoors() {
		if (this.areDoorsOpen()) {
			return this.closeAllDoors();
		} else {
			return this.openAllDoors();
		}
	}
}
*/



/////////////////////////




/*
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Скины — GreenTech Wiki</title>
    <link rel="icon" type="image/png" sizes="16x16" href="../images/icons/favicon.png" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
    <link rel="stylesheet" href="../css/style.css" />
</head>
<body>
    <header class="header">
        <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Меню">☰</button>
        <div class="logo" id="logo">
            <img src="../images/icons/logo.png" alt="GreenTech RP" style="height: 40px; width: auto;" />
        </div>
    </header>

    <div class="sidebar-overlay" id="sidebarOverlay"></div>

    <div class="main-layout">
        <nav class="sidebar" id="sidebar"></nav>

        <main class="content">
            <h1 class="page-title">Скины</h1>
            <p class="page-subtitle">В данном разделе вы можете посмотреть все скины, которые есть на сервере GreenTech RP</p>

            <div class="info-block uniform-3d-block">
                <div class="skin-controls">
                    <button id="prevSkinBtn" class="skin-nav-btn" aria-label="Предыдущий скин">
                        <i class="fas fa-chevron-left"></i>
                    </button>

                    <div class="skin-info">
                        <div class="skin-info-item">
                            <span class="label">ID:</span>
                            <span class="value" id="skinIdDisplay">—</span>
                        </div>
                    </div>

                    <div class="skin-id-input-wrap">
                        <input type="number" id="skinIdInput" placeholder="ID" min="1" max="9999" />
                        <button id="goToSkinBtn" class="skin-nav-btn" style="width:40px;height:40px;font-size:0.9rem;">
                            <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>

                    <button id="nextSkinBtn" class="skin-nav-btn" aria-label="Следующий скин">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>

                <div id="skin3dContainer" class="uniform-3d-container">
                    <div id="skin3dLoading" class="uniform-3d-loading">
                        <i class="fas fa-cube"></i>
                        <p>Загрузка 3D просмотрщика...</p>
                    </div>
                </div>

                <div class="uniform-3d-note">Управление: ЛКМ — вращение, ПКМ — перемещение, колесо — масштаб</div>
            </div>
        </main>
    </div>

    <button class="scroll-top-btn" id="scrollTopBtn" aria-label="Наверх">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
    </button>

    <footer class="footer">
        <div class="footer-copyright">© 2026 GreenTech Wiki. Информационный портал.</div>
        <div class="footer-right">
            <a href="about-site.html" class="about-site-btn">О сайте</a>
        </div>
    </footer>

    <script type="importmap">
        {
            "imports": {
                "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
                "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"
            }
        }
    </script>

    <script src="../js/common.js"></script>
    <script src="../js/navigation.js"></script>

    <script type="module">
        import { GTACharacterViewer } from '../js/gta-viewer.js';

        const SKIN_DATA = [
            { id: 1, name: "truth", dff: "../models/skins/truth.dff", txd: "../models/skins/truth.txd", gender: "male" },
            { id: 2, name: "maccer", dff: "../models/skins/maccer.dff", txd: "../models/skins/maccer.txd", gender: "male" },
            { id: 3, name: "andre", dff: "../models/skins/andre.dff", txd: "../models/skins/andre.txd", gender: "male" },
            { id: 4, name: "bbthin", dff: "../models/skins/bbthin.dff", txd: "../models/skins/bbthin.txd", gender: "male" },
            { id: 5, name: "bb", dff: "../models/skins/bb.dff", txd: "../models/skins/bb.txd", gender: "male" },
            { id: 6, name: "emmet", dff: "../models/skins/emmet.dff", txd: "../models/skins/emmet.txd", gender: "male" },
            { id: 7, name: "male01", dff: "../models/skins/male01.dff", txd: "../models/skins/male01.txd", gender: "male" },
            { id: 8, name: "janitor", dff: "../models/skins/janitor.dff", txd: "../models/skins/janitor.txd", gender: "male" },
            { id: 9, name: "bfori", dff: "../models/skins/bfori.dff", txd: "../models/skins/bfori.txd", gender: "male" },
            { id: 10, name: "bfost", dff: "../models/skins/bfost.dff", txd: "../models/skins/bfost.txd", gender: "male" },
            { id: 11, name: "vbfycrp", dff: "../models/skins/vbfycrp.dff", txd: "../models/skins/vbfycrp.txd", gender: "male" },
            { id: 12, name: "bfyri", dff: "../models/skins/bfyri.dff", txd: "../models/skins/bfyri.txd", gender: "female" },
            { id: 13, name: "bfyst", dff: "../models/skins/bfyst.dff", txd: "../models/skins/bfyst.txd", gender: "female" },
            { id: 14, name: "bmori", dff: "../models/skins/bmori.dff", txd: "../models/skins/bmori.txd", gender: "male" },
            { id: 15, name: "bmost", dff: "../models/skins/bmost.dff", txd: "../models/skins/bmost.txd", gender: "male" },
            { id: 16, name: "bmyap", dff: "../models/skins/bmyap.dff", txd: "../models/skins/bmyap.txd", gender: "male" },
            { id: 17, name: "bmybu", dff: "../models/skins/bmybu.dff", txd: "../models/skins/bmybu.txd", gender: "male" },
            { id: 18, name: "bmybe", dff: "../models/skins/bmybe.dff", txd: "../models/skins/bmybe.txd", gender: "male" },
            { id: 19, name: "bmydj", dff: "../models/skins/bmydj.dff", txd: "../models/skins/bmydj.txd", gender: "male" },
            { id: 20, name: "bmyri", dff: "../models/skins/bmyri.dff", txd: "../models/skins/bmyri.txd", gender: "male" },
            // НЕ РАБОТАЕТ { id: 21, name: "bmycr", dff: "../models/skins/bmycr.dff", txd: "../models/skins/bmycr.txd", gender: "male" },
            { id: 22, name: "bmyst", dff: "../models/skins/bmyst.dff", txd: "../models/skins/bmyst.txd", gender: "male" },
            { id: 23, name: "wmybmx", dff: "../models/skins/wmybmx.dff", txd: "../models/skins/wmybmx.txd", gender: "male" },
            { id: 24, name: "wbdyg1", dff: "../models/skins/wbdyg1.dff", txd: "../models/skins/wbdyg1.txd", gender: "male" },
            { id: 25, name: "wbdyg2", dff: "../models/skins/wbdyg2.dff", txd: "../models/skins/wbdyg2.txd", gender: "male" },
            { id: 26, name: "wmybp", dff: "../models/skins/wmybp.dff", txd: "../models/skins/wmybp.txd", gender: "male" },
            { id: 27, name: "wmycon", dff: "../models/skins/wmycon.dff", txd: "../models/skins/wmycon.txd", gender: "male" },
            { id: 28, name: "bmydrug", dff: "../models/skins/bmydrug.dff", txd: "../models/skins/bmydrug.txd", gender: "male" },
            { id: 29, name: "wmydrug", dff: "../models/skins/wmydrug.dff", txd: "../models/skins/wmydrug.txd", gender: "male" },
            { id: 30, name: "hmydrug", dff: "../models/skins/hmydrug.dff", txd: "../models/skins/hmydrug.txd", gender: "female" },
            { id: 31, name: "dwfolc", dff: "../models/skins/dwfolc.dff", txd: "../models/skins/dwfolc.txd", gender: "female" },
            { id: 32, name: "dwmolc1", dff: "../models/skins/dwmolc1.dff", txd: "../models/skins/dwmolc1.txd", gender: "male" },
            { id: 33, name: "dwmolc2", dff: "../models/skins/dwmolc2.dff", txd: "../models/skins/dwmolc2.txd", gender: "male" },
            { id: 34, name: "dwmylc1", dff: "../models/skins/dwmylc1.dff", txd: "../models/skins/dwmylc1.txd", gender: "male" },
            { id: 35, name: "hmogar", dff: "../models/skins/hmogar.dff", txd: "../models/skins/hmogar.txd", gender: "male" },
            { id: 36, name: "wmygol1", dff: "../models/skins/wmygol1.dff", txd: "../models/skins/wmygol1.txd", gender: "male" },
            { id: 37, name: "wmygol2", dff: "../models/skins/wmygol2.dff", txd: "../models/skins/wmygol2.txd", gender: "male" },
            { id: 38, name: "hfori", dff: "../models/skins/hfori.dff", txd: "../models/skins/hfori.txd", gender: "male" },
            { id: 40, name: "hfyri", dff: "../models/skins/hfyri.dff", txd: "../models/skins/hfyri.txd", gender: "female" },
            { id: 41, name: "hfyst", dff: "../models/skins/hfyst.dff", txd: "../models/skins/hfyst.txd", gender: "female" },
            { id: 42, name: "jethro", dff: "../models/skins/jethro.dff", txd: "../models/skins/jethro.txd", gender: "male" },
            { id: 43, name: "hmori", dff: "../models/skins/hmori.dff", txd: "../models/skins/hmori.txd", gender: "female" },
            { id: 44, name: "hmost", dff: "../models/skins/hmost.dff", txd: "../models/skins/hmost.txd", gender: "male" },
            { id: 45, name: "hmybe", dff: "../models/skins/hmybe.dff", txd: "../models/skins/hmybe.txd", gender: "male" },
            { id: 46, name: "hmyri", dff: "../models/skins/hmyri.dff", txd: "../models/skins/hmyri.txd", gender: "male" },
            { id: 47, name: "hmycr", dff: "../models/skins/hmycr.dff", txd: "../models/skins/hmycr.txd", gender: "male" },
            { id: 48, name: "hmyst", dff: "../models/skins/hmyst.dff", txd: "../models/skins/hmyst.txd", gender: "male" },
            { id: 49, name: "omokung", dff: "../models/skins/omokung.dff", txd: "../models/skins/omokung.txd", gender: "male" },
            { id: 51, name: "bmymoun", dff: "../models/skins/bmymoun.dff", txd: "../models/skins/bmymoun.txd", gender: "male" },
            { id: 52, name: "wmymoun", dff: "../models/skins/wmymoun.dff", txd: "../models/skins/wmymoun.txd", gender: "male" },
            { id: 53, name: "ofori", dff: "../models/skins/ofori.dff", txd: "../models/skins/ofori.txd", gender: "female" },
            { id: 54, name: "ofost", dff: "../models/skins/ofost.dff", txd: "../models/skins/ofost.txd", gender: "male" },
            { id: 55, name: "ofyri", dff: "../models/skins/ofyri.dff", txd: "../models/skins/ofyri.txd", gender: "female" },
            { id: 56, name: "ofyst", dff: "../models/skins/ofyst.dff", txd: "../models/skins/ofyst.txd", gender: "female" },
            { id: 57, name: "omori", dff: "../models/skins/omori.dff", txd: "../models/skins/omori.txd", gender: "male" },
            { id: 58, name: "omost", dff: "../models/skins/omost.dff", txd: "../models/skins/omost.txd", gender: "male" },
            { id: 59, name: "omyri", dff: "../models/skins/omyri.dff", txd: "../models/skins/omyri.txd", gender: "male" },
            { id: 60, name: "omyst", dff: "../models/skins/omyst.dff", txd: "../models/skins/omyst.txd", gender: "female" },
            { id: 61, name: "wmyplt", dff: "../models/skins/wmyplt.dff", txd: "../models/skins/wmyplt.txd", gender: "male" },
            { id: 62, name: "wmopj", dff: "../models/skins/wmopj.dff", txd: "../models/skins/wmopj.txd", gender: "male" },
            { id: 63, name: "bfypro", dff: "../models/skins/bfypro.dff", txd: "../models/skins/bfypro.txd", gender: "male" },
            { id: 64, name: "hfypro", dff: "../models/skins/hfypro.dff", txd: "../models/skins/hfypro.txd", gender: "male" },
            { id: 65, name: "kendl", dff: "../models/skins/kendl.dff", txd: "../models/skins/kendl.txd", gender: "male" },
            { id: 66, name: "bmypol1", dff: "../models/skins/bmypol1.dff", txd: "../models/skins/bmypol1.txd", gender: "male" },
            { id: 67, name: "bmypol2", dff: "../models/skins/bmypol2.dff", txd: "../models/skins/bmypol2.txd", gender: "male" },
            { id: 68, name: "wmoprea", dff: "../models/skins/wmoprea.dff", txd: "../models/skins/wmoprea.txd", gender: "male" },
            { id: 69, name: "sbfyst", dff: "../models/skins/sbfyst.dff", txd: "../models/skins/sbfyst.txd", gender: "female" },
            { id: 70, name: "wmosci", dff: "../models/skins/wmosci.dff", txd: "../models/skins/wmosci.txd", gender: "male" },
            { id: 71, name: "wmysgrd", dff: "../models/skins/wmysgrd.dff", txd: "../models/skins/wmysgrd.txd", gender: "male" },
            { id: 72, name: "swmyhp1", dff: "../models/skins/swmyhp1.dff", txd: "../models/skins/swmyhp1.txd", gender: "male" },
            { id: 73, name: "swmyhp2", dff: "../models/skins/swmyhp2.dff", txd: "../models/skins/swmyhp2.txd", gender: "male" },
            { id: 75, name: "swfopro", dff: "../models/skins/swfopro.dff", txd: "../models/skins/swfopro.txd", gender: "male" },
            { id: 76, name: "wfystew", dff: "../models/skins/wfystew.dff", txd: "../models/skins/wfystew.txd", gender: "female" },
            { id: 77, name: "swmotr1", dff: "../models/skins/swmotr1.dff", txd: "../models/skins/swmotr1.txd", gender: "female" },
            { id: 78, name: "wmotr1", dff: "../models/skins/wmotr1.dff", txd: "../models/skins/wmotr1.txd", gender: "male" },
            { id: 79, name: "bmotr1", dff: "../models/skins/bmotr1.dff", txd: "../models/skins/bmotr1.txd", gender: "male" },
            { id: 80, name: "vbmybox", dff: "../models/skins/vbmybox.dff", txd: "../models/skins/vbmybox.txd", gender: "male" },
            { id: 81, name: "vwmybox", dff: "../models/skins/vwmybox.dff", txd: "../models/skins/vwmybox.txd", gender: "male" },
            // НЕ РАБОТАЕТ { id: 82, name: "vhmyelv", dff: "../models/skins/vhmyelv.dff", txd: "../models/skins/vhmyelv.txd", gender: "male" },
            { id: 83, name: "vbmyelv", dff: "../models/skins/vbmyelv.dff", txd: "../models/skins/vbmyelv.txd", gender: "male" },
            { id: 84, name: "vimyelv", dff: "../models/skins/vimyelv.dff", txd: "../models/skins/vimyelv.txd", gender: "male" },
            { id: 85, name: "vwfypro", dff: "../models/skins/vwfypro.dff", txd: "../models/skins/vwfypro.txd", gender: "male" },
            { id: 86, name: "ryder3", dff: "../models/skins/ryder3.dff", txd: "../models/skins/ryder3.txd", gender: "male" },
            { id: 87, name: "vwfyst1", dff: "../models/skins/vwfyst1.dff", txd: "../models/skins/vwfyst1.txd", gender: "male" },
            { id: 88, name: "wfori", dff: "../models/skins/wfori.dff", txd: "../models/skins/wfori.txd", gender: "female" },
            { id: 89, name: "wfost", dff: "../models/skins/wfost.dff", txd: "../models/skins/wfost.txd", gender: "male" },
            { id: 90, name: "wfyjg", dff: "../models/skins/wfyjg.dff", txd: "../models/skins/wfyjg.txd", gender: "female" },
            { id: 91, name: "wfyri", dff: "../models/skins/wfyri.dff", txd: "../models/skins/wfyri.txd", gender: "female" },
            { id: 93, name: "wfyst", dff: "../models/skins/wfyst.dff", txd: "../models/skins/wfyst.txd", gender: "female" },
            { id: 95, name: "wmost", dff: "../models/skins/wmost.dff", txd: "../models/skins/wmost.txd", gender: "male" },
            { id: 96, name: "wmyjg", dff: "../models/skins/wmyjg.dff", txd: "../models/skins/wmyjg.txd", gender: "male" },
            { id: 97, name: "wmylg", dff: "../models/skins/wmylg.dff", txd: "../models/skins/wmylg.txd", gender: "male" },
            { id: 98, name: "wmyri", dff: "../models/skins/wmyri.dff", txd: "../models/skins/wmyri.txd", gender: "male" },
            { id: 99, name: "wmyro", dff: "../models/skins/wmyro.dff", txd: "../models/skins/wmyro.txd", gender: "male" },
            { id: 100, name: "wmycr", dff: "../models/skins/wmycr.dff", txd: "../models/skins/wmycr.txd", gender: "male" },
            { id: 101, name: "wmyst", dff: "../models/skins/wmyst.dff", txd: "../models/skins/wmyst.txd", gender: "male" },
            { id: 102, name: "ballas1", dff: "../models/skins/ballas1.dff", txd: "../models/skins/ballas1.txd", gender: "male" },
            { id: 103, name: "ballas2", dff: "../models/skins/ballas2.dff", txd: "../models/skins/ballas2.txd", gender: "male" },
            { id: 104, name: "ballas3", dff: "../models/skins/ballas3.dff", txd: "../models/skins/ballas3.txd", gender: "male" },
            { id: 105, name: "fam1", dff: "../models/skins/fam1.dff", txd: "../models/skins/fam1.txd", gender: "male" },
            { id: 106, name: "fam2", dff: "../models/skins/fam2.dff", txd: "../models/skins/fam2.txd", gender: "male" },
            { id: 107, name: "fam3", dff: "../models/skins/fam3.dff", txd: "../models/skins/fam3.txd", gender: "male" },
            { id: 108, name: "lsv1", dff: "../models/skins/lsv1.dff", txd: "../models/skins/lsv1.txd", gender: "male" },
            { id: 109, name: "lsv2", dff: "../models/skins/lsv2.dff", txd: "../models/skins/lsv2.txd", gender: "male" },
            { id: 110, name: "lsv3", dff: "../models/skins/lsv3.dff", txd: "../models/skins/lsv3.txd", gender: "male" },
            { id: 111, name: "maffa", dff: "../models/skins/maffa.dff", txd: "../models/skins/maffa.txd", gender: "male" },
            { id: 112, name: "maffb", dff: "../models/skins/maffb.dff", txd: "../models/skins/maffb.txd", gender: "male" },
            { id: 113, name: "mafboss", dff: "../models/skins/mafboss.dff", txd: "../models/skins/mafboss.txd", gender: "male" },
            { id: 114, name: "vla1", dff: "../models/skins/vla1.dff", txd: "../models/skins/vla1.txd", gender: "male" },
            { id: 115, name: "vla2", dff: "../models/skins/vla2.dff", txd: "../models/skins/vla2.txd", gender: "male" },
            { id: 116, name: "vla3", dff: "../models/skins/vla3.dff", txd: "../models/skins/vla3.txd", gender: "male" },
            { id: 117, name: "triada", dff: "../models/skins/triada.dff", txd: "../models/skins/triada.txd", gender: "male" },
            { id: 118, name: "triadb", dff: "../models/skins/triadb.dff", txd: "../models/skins/triadb.txd", gender: "male" },
            { id: 119, name: "sindaco", dff: "../models/skins/sindaco.dff", txd: "../models/skins/sindaco.txd", gender: "male" },
            { id: 120, name: "triboss", dff: "../models/skins/triboss.dff", txd: "../models/skins/triboss.txd", gender: "male" },
            { id: 121, name: "dnb1", dff: "../models/skins/dnb1.dff", txd: "../models/skins/dnb1.txd", gender: "male" },
            { id: 122, name: "dnb2", dff: "../models/skins/dnb2.dff", txd: "../models/skins/dnb2.txd", gender: "male" },
            { id: 123, name: "dnb3", dff: "../models/skins/dnb3.dff", txd: "../models/skins/dnb3.txd", gender: "male" },
            { id: 124, name: "vmaff1", dff: "../models/skins/vmaff1.dff", txd: "../models/skins/vmaff1.txd", gender: "male" },
            { id: 125, name: "vmaff2", dff: "../models/skins/vmaff2.dff", txd: "../models/skins/vmaff2.txd", gender: "male" },
            { id: 126, name: "vmaff3", dff: "../models/skins/vmaff3.dff", txd: "../models/skins/vmaff3.txd", gender: "male" },
            { id: 127, name: "vmaff4", dff: "../models/skins/vmaff4.dff", txd: "../models/skins/vmaff4.txd", gender: "male" },
            { id: 128, name: "dnmylc", dff: "../models/skins/dnmylc.dff", txd: "../models/skins/dnmylc.txd", gender: "male" },
            { id: 129, name: "dnfolc1", dff: "../models/skins/dnfolc1.dff", txd: "../models/skins/dnfolc1.txd", gender: "male" },
            { id: 130, name: "dnfolc2", dff: "../models/skins/dnfolc2.dff", txd: "../models/skins/dnfolc2.txd", gender: "male" },
            { id: 131, name: "dnfylc", dff: "../models/skins/dnfylc.dff", txd: "../models/skins/dnfylc.txd", gender: "male" },
            { id: 132, name: "dnmolc1", dff: "../models/skins/dnmolc1.dff", txd: "../models/skins/dnmolc1.txd", gender: "male" },
            { id: 133, name: "dnmolc2", dff: "../models/skins/dnmolc2.dff", txd: "../models/skins/dnmolc2.txd", gender: "male" },
            { id: 134, name: "sbmotr2", dff: "../models/skins/sbmotr2.dff", txd: "../models/skins/sbmotr2.txd", gender: "male" },
            { id: 135, name: "swmotr2", dff: "../models/skins/swmotr2.dff", txd: "../models/skins/swmotr2.txd", gender: "male" },
            { id: 136, name: "sbmytr3", dff: "../models/skins/sbmytr3.dff", txd: "../models/skins/sbmytr3.txd", gender: "male" },
            { id: 137, name: "swmotr3", dff: "../models/skins/swmotr3.dff", txd: "../models/skins/swmotr3.txd", gender: "male" },
            { id: 138, name: "wfybe", dff: "../models/skins/wfybe.dff", txd: "../models/skins/wfybe.txd", gender: "female" },
            { id: 139, name: "bfybe", dff: "../models/skins/bfybe.dff", txd: "../models/skins/bfybe.txd", gender: "female" },
            { id: 140, name: "hfybe", dff: "../models/skins/hfybe.dff", txd: "../models/skins/hfybe.txd", gender: "female" },
            { id: 141, name: "sofybu", dff: "../models/skins/sofybu.dff", txd: "../models/skins/sofybu.txd", gender: "female" },
            { id: 142, name: "sbmyst", dff: "../models/skins/sbmyst.dff", txd: "../models/skins/sbmyst.txd", gender: "male" },
            { id: 143, name: "sbmycr", dff: "../models/skins/sbmycr.dff", txd: "../models/skins/sbmycr.txd", gender: "male" },
            { id: 146, name: "hmycm", dff: "../models/skins/hmycm.dff", txd: "../models/skins/hmycm.txd", gender: "female" },
            { id: 147, name: "wmybu", dff: "../models/skins/wmybu.dff", txd: "../models/skins/wmybu.txd", gender: "male" },
            { id: 148, name: "bfybu", dff: "../models/skins/bfybu.dff", txd: "../models/skins/bfybu.txd", gender: "female" },
            { id: 149, name: "smokev", dff: "../models/skins/smokev.dff", txd: "../models/skins/smokev.txd", gender: "male" },
            { id: 150, name: "wfybu", dff: "../models/skins/wfybu.dff", txd: "../models/skins/wfybu.txd", gender: "female" },
            { id: 151, name: "dwfylc1", dff: "../models/skins/dwfylc1.dff", txd: "../models/skins/dwfylc1.txd", gender: "female" },
            { id: 152, name: "wfypro", dff: "../models/skins/wfypro.dff", txd: "../models/skins/wfypro.txd", gender: "male" },
            { id: 153, name: "wmyconb", dff: "../models/skins/wmyconb.dff", txd: "../models/skins/wmyconb.txd", gender: "male" },
            { id: 154, name: "wmybe", dff: "../models/skins/wmybe.dff", txd: "../models/skins/wmybe.txd", gender: "male" },
            { id: 155, name: "wmypizz", dff: "../models/skins/wmypizz.dff", txd: "../models/skins/wmypizz.txd", gender: "male" },
            { id: 156, name: "bmobar", dff: "../models/skins/bmobar.dff", txd: "../models/skins/bmobar.txd", gender: "male" },
            { id: 157, name: "cwfyhb", dff: "../models/skins/cwfyhb.dff", txd: "../models/skins/cwfyhb.txd", gender: "female" },
            { id: 158, name: "cwmofr", dff: "../models/skins/cwmofr.dff", txd: "../models/skins/cwmofr.txd", gender: "male" },
            { id: 159, name: "cwmohb1", dff: "../models/skins/cwmohb1.dff", txd: "../models/skins/cwmohb1.txd", gender: "male" },
            { id: 160, name: "cwmohb2", dff: "../models/skins/cwmohb2.dff", txd: "../models/skins/cwmohb2.txd", gender: "male" },
            { id: 161, name: "cwmyfr", dff: "../models/skins/cwmyfr.dff", txd: "../models/skins/cwmyfr.txd", gender: "male" },
            { id: 162, name: "cwmyhb1", dff: "../models/skins/cwmyhb1.dff", txd: "../models/skins/cwmyhb1.txd", gender: "male" },
            { id: 163, name: "bmyboun", dff: "../models/skins/bmyboun.dff", txd: "../models/skins/bmyboun.txd", gender: "male" },
            { id: 164, name: "wmyboun", dff: "../models/skins/wmyboun.dff", txd: "../models/skins/wmyboun.txd", gender: "male" },
            { id: 165, name: "wmomib", dff: "../models/skins/wmomib.dff", txd: "../models/skins/wmomib.txd", gender: "male" },
            { id: 166, name: "bmymib", dff: "../models/skins/bmymib.dff", txd: "../models/skins/bmymib.txd", gender: "male" },
            { id: 167, name: "wmybell", dff: "../models/skins/wmybell.dff", txd: "../models/skins/wmybell.txd", gender: "male" },
            { id: 168, name: "bmochil", dff: "../models/skins/bmochil.dff", txd: "../models/skins/bmochil.txd", gender: "male" },
            { id: 169, name: "sofyri", dff: "../models/skins/sofyri.dff", txd: "../models/skins/sofyri.txd", gender: "female" },
            { id: 170, name: "somyst", dff: "../models/skins/somyst.dff", txd: "../models/skins/somyst.txd", gender: "male" },
            { id: 171, name: "vwmybjd", dff: "../models/skins/vwmybjd.dff", txd: "../models/skins/vwmybjd.txd", gender: "male" },
            { id: 172, name: "vwfycrp", dff: "../models/skins/vwfycrp.dff", txd: "../models/skins/vwfycrp.txd", gender: "female" },
            { id: 173, name: "sfr1", dff: "../models/skins/sfr1.dff", txd: "../models/skins/sfr1.txd", gender: "male" },
            { id: 174, name: "sfr2", dff: "../models/skins/sfr2.dff", txd: "../models/skins/sfr2.txd", gender: "male" },
            { id: 175, name: "sfr3", dff: "../models/skins/sfr3.dff", txd: "../models/skins/sfr3.txd", gender: "male" },
            { id: 176, name: "bmybar", dff: "../models/skins/bmybar.dff", txd: "../models/skins/bmybar.txd", gender: "male" },
            { id: 177, name: "wmybar", dff: "../models/skins/wmybar.dff", txd: "../models/skins/wmybar.txd", gender: "male" },
            { id: 178, name: "wfysex", dff: "../models/skins/wfysex.dff", txd: "../models/skins/wfysex.txd", gender: "male" },
            { id: 179, name: "wmyammo", dff: "../models/skins/wmyammo.dff", txd: "../models/skins/wmyammo.txd", gender: "male" },
            { id: 180, name: "bmytatt", dff: "../models/skins/bmytatt.dff", txd: "../models/skins/bmytatt.txd", gender: "male" },
            { id: 181, name: "vwmycr", dff: "../models/skins/vwmycr.dff", txd: "../models/skins/vwmycr.txd", gender: "male" },
            { id: 182, name: "vbmocd", dff: "../models/skins/vbmocd.dff", txd: "../models/skins/vbmocd.txd", gender: "male" },
            { id: 183, name: "vbmycr", dff: "../models/skins/vbmycr.dff", txd: "../models/skins/vbmycr.txd", gender: "male" },
            { id: 184, name: "vhmycr", dff: "../models/skins/vhmycr.dff", txd: "../models/skins/vhmycr.txd", gender: "male" },
            { id: 185, name: "sbmyri", dff: "../models/skins/sbmyri.dff", txd: "../models/skins/sbmyri.txd", gender: "male" },
            { id: 186, name: "somyri", dff: "../models/skins/somyri.dff", txd: "../models/skins/somyri.txd", gender: "male" },
            { id: 187, name: "somybu", dff: "../models/skins/somybu.dff", txd: "../models/skins/somybu.txd", gender: "male" },
            { id: 188, name: "swmyst", dff: "../models/skins/swmyst.dff", txd: "../models/skins/swmyst.txd", gender: "male" },
            { id: 189, name: "wmyva", dff: "../models/skins/wmyva.dff", txd: "../models/skins/wmyva.txd", gender: "male" },
            { id: 190, name: "copgrl3", dff: "../models/skins/copgrl3.dff", txd: "../models/skins/copgrl3.txd", gender: "female" },
            { id: 191, name: "gungrl3", dff: "../models/skins/gungrl3.dff", txd: "../models/skins/gungrl3.txd", gender: "female" },
            { id: 192, name: "mecgrl3", dff: "../models/skins/mecgrl3.dff", txd: "../models/skins/mecgrl3.txd", gender: "female" },
            { id: 193, name: "nurgrl3", dff: "../models/skins/nurgrl3.dff", txd: "../models/skins/nurgrl3.txd", gender: "female" },
            { id: 194, name: "crogrl3", dff: "../models/skins/crogrl3.dff", txd: "../models/skins/crogrl3.txd", gender: "male" },
            { id: 195, name: "gangrl3", dff: "../models/skins/gangrl3.dff", txd: "../models/skins/gangrl3.txd", gender: "female" },
            { id: 196, name: "cwfofr", dff: "../models/skins/cwfofr.dff", txd: "../models/skins/cwfofr.txd", gender: "male" },
            { id: 197, name: "cwfohb", dff: "../models/skins/cwfohb.dff", txd: "../models/skins/cwfohb.txd", gender: "female" },
            { id: 198, name: "cwfyfr1", dff: "../models/skins/cwfyfr1.dff", txd: "../models/skins/cwfyfr1.txd", gender: "female" },
            { id: 199, name: "cwfyfr2", dff: "../models/skins/cwfyfr2.dff", txd: "../models/skins/cwfyfr2.txd", gender: "male" },
            { id: 200, name: "cwmyhb2", dff: "../models/skins/cwmyhb2.dff", txd: "../models/skins/cwmyhb2.txd", gender: "female" },
            { id: 201, name: "dwfylc2", dff: "../models/skins/dwfylc2.dff", txd: "../models/skins/dwfylc2.txd", gender: "female" },
            { id: 202, name: "dwmylc2", dff: "../models/skins/dwmylc2.dff", txd: "../models/skins/dwmylc2.txd", gender: "male" },
            { id: 203, name: "omykara", dff: "../models/skins/omykara.dff", txd: "../models/skins/omykara.txd", gender: "male" },
            { id: 204, name: "wmykara", dff: "../models/skins/wmykara.dff", txd: "../models/skins/wmykara.txd", gender: "male" },
            { id: 205, name: "wfyburg", dff: "../models/skins/wfyburg.dff", txd: "../models/skins/wfyburg.txd", gender: "male" },
            { id: 206, name: "vwmycd", dff: "../models/skins/vwmycd.dff", txd: "../models/skins/vwmycd.txd", gender: "male" },
            { id: 207, name: "vhfypro", dff: "../models/skins/vhfypro.dff", txd: "../models/skins/vhfypro.txd", gender: "female" },
            { id: 208, name: "susie", dff: "../models/skins/susie.dff", txd: "../models/skins/susie.txd", gender: "female" },
            { id: 209, name: "omonood", dff: "../models/skins/omonood.dff", txd: "../models/skins/omonood.txd", gender: "male" },
            { id: 210, name: "omoboat", dff: "../models/skins/omoboat.dff", txd: "../models/skins/omoboat.txd", gender: "male" },
            { id: 211, name: "wfyclot", dff: "../models/skins/wfyclot.dff", txd: "../models/skins/wfyclot.txd", gender: "female" },
            { id: 212, name: "vwmotr1", dff: "../models/skins/vwmotr1.dff", txd: "../models/skins/vwmotr1.txd", gender: "male" },
            { id: 213, name: "vwmotr2", dff: "../models/skins/vwmotr2.dff", txd: "../models/skins/vwmotr2.txd", gender: "male" },
            { id: 214, name: "vwfywai", dff: "../models/skins/vwfywai.dff", txd: "../models/skins/vwfywai.txd", gender: "female" },
            { id: 215, name: "sbfori", dff: "../models/skins/sbfori.dff", txd: "../models/skins/sbfori.txd", gender: "male" },
            { id: 216, name: "swfyri", dff: "../models/skins/swfyri.dff", txd: "../models/skins/swfyri.txd", gender: "female" },
            { id: 217, name: "wmyclot", dff: "../models/skins/wmyclot.dff", txd: "../models/skins/wmyclot.txd", gender: "male" },
            { id: 218, name: "sbfost", dff: "../models/skins/sbfost.dff", txd: "../models/skins/sbfost.txd", gender: "male" },
            { id: 219, name: "sbfyri", dff: "../models/skins/sbfyri.dff", txd: "../models/skins/sbfyri.txd", gender: "female" },
            { id: 220, name: "sbmocd", dff: "../models/skins/sbmocd.dff", txd: "../models/skins/sbmocd.txd", gender: "male" },
            { id: 221, name: "sbmori", dff: "../models/skins/sbmori.dff", txd: "../models/skins/sbmori.txd", gender: "male" },
            { id: 222, name: "sbmost", dff: "../models/skins/sbmost.dff", txd: "../models/skins/sbmost.txd", gender: "male" },
            { id: 223, name: "shmycr", dff: "../models/skins/shmycr.dff", txd: "../models/skins/shmycr.txd", gender: "male" },
            { id: 224, name: "sofori", dff: "../models/skins/sofori.dff", txd: "../models/skins/sofori.txd", gender: "male" },
            { id: 225, name: "sofost", dff: "../models/skins/sofost.dff", txd: "../models/skins/sofost.txd", gender: "male" },
            { id: 226, name: "sofyst", dff: "../models/skins/sofyst.dff", txd: "../models/skins/sofyst.txd", gender: "female" },
            { id: 227, name: "somobu", dff: "../models/skins/somobu.dff", txd: "../models/skins/somobu.txd", gender: "male" },
            { id: 228, name: "somori", dff: "../models/skins/somori.dff", txd: "../models/skins/somori.txd", gender: "male" },
            { id: 229, name: "somost", dff: "../models/skins/somost.dff", txd: "../models/skins/somost.txd", gender: "male" },
            { id: 230, name: "swmotr5", dff: "../models/skins/swmotr5.dff", txd: "../models/skins/swmotr5.txd", gender: "male" },
            { id: 231, name: "swfori", dff: "../models/skins/swfori.dff", txd: "../models/skins/swfori.txd", gender: "male" },
            { id: 232, name: "swfost", dff: "../models/skins/swfost.dff", txd: "../models/skins/swfost.txd", gender: "male" },
            { id: 233, name: "swfyst", dff: "../models/skins/swfyst.dff", txd: "../models/skins/swfyst.txd", gender: "female" },
            { id: 234, name: "swmocd", dff: "../models/skins/swmocd.dff", txd: "../models/skins/swmocd.txd", gender: "male" },
            { id: 235, name: "swmori", dff: "../models/skins/swmori.dff", txd: "../models/skins/swmori.txd", gender: "male" },
            { id: 236, name: "swmost", dff: "../models/skins/swmost.dff", txd: "../models/skins/swmost.txd", gender: "male" },
            { id: 237, name: "shfypro", dff: "../models/skins/shfypro.dff", txd: "../models/skins/shfypro.txd", gender: "male" },
            { id: 238, name: "sbfypro", dff: "../models/skins/sbfypro.dff", txd: "../models/skins/sbfypro.txd", gender: "male" },
            { id: 239, name: "swmotr4", dff: "../models/skins/swmotr4.dff", txd: "../models/skins/swmotr4.txd", gender: "male" },
            { id: 240, name: "swmyri", dff: "../models/skins/swmyri.dff", txd: "../models/skins/swmyri.txd", gender: "male" },
            { id: 241, name: "smyst", dff: "../models/skins/smyst.dff", txd: "../models/skins/smyst.txd", gender: "male" },
            { id: 242, name: "smyst2", dff: "../models/skins/smyst2.dff", txd: "../models/skins/smyst2.txd", gender: "male" },
            { id: 243, name: "sfypro", dff: "../models/skins/sfypro.dff", txd: "../models/skins/sfypro.txd", gender: "male" },
            { id: 244, name: "vbfyst2", dff: "../models/skins/vbfyst2.dff", txd: "../models/skins/vbfyst2.txd", gender: "male" },
            { id: 245, name: "vbfypro", dff: "../models/skins/vbfypro.dff", txd: "../models/skins/vbfypro.txd", gender: "male" },
            { id: 246, name: "vhfyst3", dff: "../models/skins/vhfyst3.dff", txd: "../models/skins/vhfyst3.txd", gender: "male" },
            { id: 247, name: "bikera", dff: "../models/skins/bikera.dff", txd: "../models/skins/bikera.txd", gender: "male" },
            { id: 248, name: "bikerb", dff: "../models/skins/bikerb.dff", txd: "../models/skins/bikerb.txd", gender: "male" },
            { id: 249, name: "bmypimp", dff: "../models/skins/bmypimp.dff", txd: "../models/skins/bmypimp.txd", gender: "male" },
            { id: 250, name: "swmycr", dff: "../models/skins/swmycr.dff", txd: "../models/skins/swmycr.txd", gender: "male" },
            { id: 251, name: "wfylg", dff: "../models/skins/wfylg.dff", txd: "../models/skins/wfylg.txd", gender: "female" },
            { id: 252, name: "wmyva2", dff: "../models/skins/wmyva2.dff", txd: "../models/skins/wmyva2.txd", gender: "male" },
            { id: 253, name: "bmosec", dff: "../models/skins/bmosec.dff", txd: "../models/skins/bmosec.txd", gender: "male" },
            { id: 254, name: "bikdrug", dff: "../models/skins/bikdrug.dff", txd: "../models/skins/bikdrug.txd", gender: "male" },
            { id: 255, name: "wmych", dff: "../models/skins/wmych.dff", txd: "../models/skins/wmych.txd", gender: "male" },
            { id: 256, name: "sbfystr", dff: "../models/skins/sbfystr.dff", txd: "../models/skins/sbfystr.txd", gender: "male" },
            { id: 257, name: "swfystr", dff: "../models/skins/swfystr.dff", txd: "../models/skins/swfystr.txd", gender: "male" },
            { id: 258, name: "heck1", dff: "../models/skins/heck1.dff", txd: "../models/skins/heck1.txd", gender: "male" },
            { id: 259, name: "heck2", dff: "../models/skins/heck2.dff", txd: "../models/skins/heck2.txd", gender: "male" },
            { id: 260, name: "bmycon", dff: "../models/skins/bmycon.dff", txd: "../models/skins/bmycon.txd", gender: "male" },
            { id: 261, name: "wmycd1", dff: "../models/skins/wmycd1.dff", txd: "../models/skins/wmycd1.txd", gender: "male" },
            { id: 262, name: "bmocd", dff: "../models/skins/bmocd.dff", txd: "../models/skins/bmocd.txd", gender: "male" },
            { id: 263, name: "vwfywa2", dff: "../models/skins/vwfywa2.dff", txd: "../models/skins/vwfywa2.txd", gender: "female" },
            { id: 264, name: "wmoice", dff: "../models/skins/wmoice.dff", txd: "../models/skins/wmoice.txd", gender: "male" },
            { id: 265, name: "tenpen", dff: "../models/skins/tenpen.dff", txd: "../models/skins/tenpen.txd", gender: "male" },
            { id: 266, name: "pulaski", dff: "../models/skins/pulaski.dff", txd: "../models/skins/pulaski.txd", gender: "male" },
            { id: 267, name: "hern", dff: "../models/skins/hern.dff", txd: "../models/skins/hern.txd", gender: "male" },
            { id: 268, name: "dwayne", dff: "../models/skins/dwayne.dff", txd: "../models/skins/dwayne.txd", gender: "male" },
            { id: 269, name: "smoke", dff: "../models/skins/smoke.dff", txd: "../models/skins/smoke.txd", gender: "female" },
            { id: 270, name: "sweet", dff: "../models/skins/sweet.dff", txd: "../models/skins/sweet.txd", gender: "male" },
            { id: 271, name: "ryder", dff: "../models/skins/ryder.dff", txd: "../models/skins/ryder.txd", gender: "male" },
            { id: 272, name: "forelli", dff: "../models/skins/forelli.dff", txd: "../models/skins/forelli.txd", gender: "male" },
            { id: 273, name: "tbone", dff: "../models/skins/tbone.dff", txd: "../models/skins/tbone.txd", gender: "male" },
            { id: 274, name: "laemt1", dff: "../models/skins/laemt1.dff", txd: "../models/skins/laemt1.txd", gender: "male" },
            { id: 275, name: "lvemt1", dff: "../models/skins/lvemt1.dff", txd: "../models/skins/lvemt1.txd", gender: "male" },
            { id: 277, name: "lafd1", dff: "../models/skins/lafd1.dff", txd: "../models/skins/lafd1.txd", gender: "male" },
            { id: 278, name: "lvfd1", dff: "../models/skins/lvfd1.dff", txd: "../models/skins/lvfd1.txd", gender: "male" },
            { id: 279, name: "sffd1", dff: "../models/skins/sffd1.dff", txd: "../models/skins/sffd1.txd", gender: "male" },
            { id: 280, name: "lapd1", dff: "../models/skins/lapd1.dff", txd: "../models/skins/lapd1.txd", gender: "male" },
            { id: 281, name: "sfpd1", dff: "../models/skins/sfpd1.dff", txd: "../models/skins/sfpd1.txd", gender: "male" },
            { id: 282, name: "lvpd1", dff: "../models/skins/lvpd1.dff", txd: "../models/skins/lvpd1.txd", gender: "male" },
            { id: 283, name: "csher", dff: "../models/skins/csher.dff", txd: "../models/skins/csher.txd", gender: "male" },
            { id: 284, name: "lapdm1", dff: "../models/skins/lapdm1.dff", txd: "../models/skins/lapdm1.txd", gender: "male" },
            { id: 285, name: "swat", dff: "../models/skins/swat.dff", txd: "../models/skins/swat.txd", gender: "male" },
            { id: 286, name: "fbi", dff: "../models/skins/fbi.dff", txd: "../models/skins/fbi.txd", gender: "male" },
            { id: 287, name: "army", dff: "../models/skins/army.dff", txd: "../models/skins/army.txd", gender: "male" },
            { id: 288, name: "dsher", dff: "../models/skins/dsher.dff", txd: "../models/skins/dsher.txd", gender: "male" },
            { id: 289, name: "zero", dff: "../models/skins/zero.dff", txd: "../models/skins/zero.txd", gender: "male" },
            { id: 290, name: "rose", dff: "../models/skins/rose.dff", txd: "../models/skins/rose.txd", gender: "female" },
            { id: 291, name: "paul", dff: "../models/skins/paul.dff", txd: "../models/skins/paul.txd", gender: "male" },
            { id: 292, name: "cesar", dff: "../models/skins/cesar.dff", txd: "../models/skins/cesar.txd", gender: "male" },
            { id: 293, name: "ogloc", dff: "../models/skins/ogloc.dff", txd: "../models/skins/ogloc.txd", gender: "male" },
            { id: 294, name: "wuzimu", dff: "../models/skins/wuzimu.dff", txd: "../models/skins/wuzimu.txd", gender: "male" },
            { id: 295, name: "torino", dff: "../models/skins/torino.dff", txd: "../models/skins/torino.txd", gender: "male" },
            { id: 296, name: "jizzy", dff: "../models/skins/jizzy.dff", txd: "../models/skins/jizzy.txd", gender: "male" },
            { id: 297, name: "maddogg", dff: "../models/skins/maddogg.dff", txd: "../models/skins/maddogg.txd", gender: "male" },
            { id: 298, name: "cat", dff: "../models/skins/cat.dff", txd: "../models/skins/cat.txd", gender: "male" },
            { id: 299, name: "claude", dff: "../models/skins/claude.dff", txd: "../models/skins/claude.txd", gender: "male" },


            { id: 1000, name: "fsinboevka", dff: "../models/skins/fsinboevka.dff", txd: "../models/skins/fsinboevka.txd", gender: "male", unknownId: true },
			{ id: 1001, name: "janitor", dff: "../models/skins/janitor.dff", txd: "../models/skins/janitor.txd", gender: "male", unknownId: true },
			{ id: 1002, name: "nadziratel", dff: "../models/skins/nadziratel.dff", txd: "../models/skins/nadziratel.txd", gender: "male", unknownId: true },
			{ id: 1003, name: "pilot1", dff: "../models/skins/pilot1.dff", txd: "../models/skins/pilot1.txd", gender: "male", unknownId: true },
			{ id: 1004, name: "pilot2", dff: "../models/skins/pilot2.dff", txd: "../models/skins/pilot2.txd", gender: "male", unknownId: true },
			{ id: 1005, name: "razmin", dff: "../models/skins/razmin.dff", txd: "../models/skins/razmin.txd", gender: "male", unknownId: true },
			{ id: 1006, name: "sfemt1", dff: "../models/skins/sfem t1.dff", txd: "../models/skins/sfem t1.txd", gender: "female", unknownId: true },
			{ id: 1007, name: "skitgt1", dff: "../models/skins/skitgt1.dff", txd: "../models/skins/skitgt1.txd", gender: "male", unknownId: true },
			{ id: 1008, name: "skitgt2", dff: "../models/skins/skitgt2.dff", txd: "../models/skins/skitgt2.txd", gender: "male", unknownId: true }
        ];

        let viewer = null;
        let currentIndex = 0;
        const ANIM_IFP_PATH = "../models/skins/anim.ifp";

        const container = document.getElementById('skin3dContainer');
        const loadingEl = document.getElementById('skin3dLoading');
        const prevBtn = document.getElementById('prevSkinBtn');
        const nextBtn = document.getElementById('nextSkinBtn');
        const skinIdDisplay = document.getElementById('skinIdDisplay');

        async function initViewer() {
            viewer = new GTACharacterViewer(container);
            setTimeout(() => {
                if (loadingEl) loadingEl.style.display = 'none';
            }, 500);
            await loadSkin(currentIndex);
            updateUI();
        }

        async function loadSkin(index) {
			const skin = SKIN_DATA[index];
			if (!skin) {
				console.warn('Скин не найден:', index);
				return;
			}
			if (loadingEl) loadingEl.style.display = 'flex';
			try {
				await viewer.loadModel(skin.dff, skin.txd, ANIM_IFP_PATH);
				if (viewer.currentModel) {
					const pos = viewer.currentModel.position.clone();

					if (skin.rotation) {
						viewer.currentModel.rotation.set(
							skin.rotation.x || 0,
							skin.rotation.y || 0,
							skin.rotation.z || 0
						);
					} else {
						viewer.currentModel.rotation.set(-Math.PI / 2, 0, Math.PI );
					}
					
					viewer.currentModel.position.copy(pos);
					viewer.controls.target.set(0, viewer.modelCenterY || 0, 0);
					viewer.controls.update();
				}
                if (skin.id === 21) {
                    console.log('Анимация отключена для скина ID 21');
                } else {
                    const availableAnims = viewer.getAnimationNames();
                    let targetAnim = null;
                    if (skin.gender === "female") {
                        const femaleAnims = ["woman_idlestance", "woman_idle", "idle_female", "female_idle", "IDLE"];
                        for (const anim of femaleAnims) {
                            if (availableAnims.includes(anim)) { targetAnim = anim; break; }
                        }
                    } else {
                        const maleAnims = ["IDLE_stance", "idle", "stand_idle", "idle_armed", "IDLE"];
                        for (const anim of maleAnims) {
                            if (availableAnims.includes(anim)) { targetAnim = anim; break; }
                        }
                    }
                    if (!targetAnim && availableAnims.length > 0) {
                        targetAnim = availableAnims[0];
                    }
                    if (targetAnim) {
                        viewer.playAnimation(targetAnim);
                    }
                }
            } catch (error) {
                console.error('Ошибка загрузки скина:', error);
            } finally {
                if (loadingEl) loadingEl.style.display = 'none';
            }
        }

        function updateUI() {
			const skin = SKIN_DATA[currentIndex];
			if (!skin) return;

			if (skin.unknownId) {
				skinIdDisplay.textContent = 'Неизвестно';
			} else {
				skinIdDisplay.textContent = skin.id;
			}
			
			prevBtn.disabled = false;
			nextBtn.disabled = false;
		}

        function goToPrev() {
            currentIndex = (currentIndex - 1 + SKIN_DATA.length) % SKIN_DATA.length;
            loadSkin(currentIndex);
            updateUI();
        }

        function goToNext() {
            currentIndex = (currentIndex + 1) % SKIN_DATA.length;
            loadSkin(currentIndex);
            updateUI();
        }

        function resetCamera() {
            if (viewer) {
                viewer.resetCamera();
                if (viewer.currentModel) {
                    const pos = viewer.currentModel.position.clone();
                    viewer.currentModel.rotation.set(-Math.PI / 2, 0, -Math.PI / 2);
                    viewer.currentModel.position.copy(pos);
                    viewer.controls.target.set(0, viewer.modelCenterY || 0, 0);
                    viewer.controls.update();
                }
            }
        }

        const skinIdInput = document.getElementById('skinIdInput');
        const goToSkinBtn = document.getElementById('goToSkinBtn');

        function goToSkinById() {
            const val = parseInt(skinIdInput.value);
            if (isNaN(val)) return;
            const foundIndex = SKIN_DATA.findIndex(s => s.id === val);
            if (foundIndex === -1) {
                skinIdInput.style.borderColor = '#ff4444';
                setTimeout(() => skinIdInput.style.borderColor = '', 600);
                return;
            }
            currentIndex = foundIndex;
            loadSkin(currentIndex);
            updateUI();
            skinIdInput.value = '';
            skinIdInput.blur();
        }

        goToSkinBtn.addEventListener('click', goToSkinById);
        skinIdInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                goToSkinById();
            }
        });

        document.addEventListener('DOMContentLoaded', () => {
            initViewer();
            prevBtn.addEventListener('click', goToPrev);
            nextBtn.addEventListener('click', goToNext);
            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') { e.preventDefault();
                    goToPrev(); } else if (e.key === 'ArrowRight') { e.preventDefault();
                    goToNext(); }
            });
            container.addEventListener('dblclick', resetCamera);
        });
    </script>
</body>
</html>
*/