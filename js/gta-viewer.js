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
