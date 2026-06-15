import { ChunkType, GeometryFlag, getChunkName } from "./ChunkType.js";

export class DFFReader {
  constructor() {
    this.data = null;
    this.position = 0;
    this.isLocked = false;
  }

  /**
   * Основной метод парсинга DFF-файла
   * @param {ArrayBuffer} buffer - бинарные данные файла
   * @returns {Object|null} - распарсенные данные модели
   */
  parse(buffer) {
    this.data = new DataView(buffer);
    this.position = 0;
    this.length = buffer.byteLength;
    this.isLocked = false;

    // Проверка на "заблокированный" DFF (от некоторых игр)
    if (buffer.byteLength > 20) {
      if ((this.data.getUint32(16, true) >> 16 & 65535) > 255) {
        this.isLocked = true;
        console.warn("Detected locked DFF file - applying size field corrections");
      }
    }

    let clumpData = null;
    const uvAnimations = [];

    // Основной цикл чтения чанков
    while (this.position < buffer.byteLength - 12) {
      const chunkStart = this.position;
      const chunkType = this.data.getUint32(this.position, true);
      const chunkSize = this.fixSize(this.data.getUint32(this.position + 4, true));

      // Проверка выхода за границы
      if (this.position + 12 + chunkSize > buffer.byteLength) {
        break;
      }

      if (chunkType === ChunkType.CHUNK_CLUMP) {
        clumpData = this.readChunk(ChunkType.CHUNK_CLUMP);
      } else if (chunkType === ChunkType.CHUNK_UVANIMDICT) {
        const animations = this.readUVAnimDict();
        if (animations && animations.length > 0) {
          uvAnimations.push(...animations);
        }
      } else {
        const header = this.readHeader();
        if (header.type !== 0 && header.length > 0) {
        }
        this.position += header.length;
      }

      // Защита от бесконечного цикла
      if (this.position <= chunkStart) {
        this.position = chunkStart + 12;
      }

      if (clumpData && this.position >= buffer.byteLength - 12) {
        break;
      }
    }

    // Прикрепляем UV-анимации к clump, если они есть
    if (clumpData && uvAnimations.length > 0) {
      clumpData.uvAnimDict = uvAnimations;
    }

    return clumpData;
  }

  /**
   * Корректировка размера для "заблокированных" файлов
   */
  fixSize(size) {
    if (!this.isLocked) {
      return size;
    }
    if ((size >> 16 & 65535) > 255) {
      return size & 65535;
    }
    return size;
  }

  /**
   * Проверка возможности чтения указанного количества байт
   */
  canRead(bytes) {
    return this.position + bytes <= this.length;
  }

  /**
   * Чтение заголовка чанка
   */
  readHeader(parent) {
    const header = {
      type: this.readUInt32()
    };
    header.name = getChunkName(header.type);

    const rawLength = this.readUInt32();
    header.length = this.fixSize(rawLength);
    header.build = this.readUInt32();

    // Определение версии
    if (header.build & -65536) {
      header.version = header.build >> 14 & 261888 | header.build >> 16 & 63 | 196608;
    } else {
      header.version = header.build << 8;
    }

    if (parent !== undefined) {
      header.parent = parent;
    }

    return header;
  }

  // Базовые методы чтения примитивных типов

  readInt32() {
    if (this.position + 4 > this.length) {
      throw new Error("Out of bounds at position " + this.position);
    }
    const value = this.data.getInt32(this.position, true);
    this.position += 4;
    return value;
  }

  readUInt32() {
    if (this.position + 4 > this.length) {
      throw new Error("Out of bounds at position " + this.position);
    }
    const value = this.data.getUint32(this.position, true);
    this.position += 4;
    return value;
  }

  readUInt16() {
    if (this.position + 2 > this.length) {
      throw new Error("Out of bounds at position " + this.position);
    }
    const value = this.data.getUint16(this.position, true);
    this.position += 2;
    return value;
  }

  readUInt8() {
    if (this.position + 1 > this.length) {
      throw new Error("Out of bounds at position " + this.position);
    }
    const value = this.data.getUint8(this.position);
    this.position += 1;
    return value;
  }

  readInt8() {
    if (this.position + 1 > this.length) {
      throw new Error("Out of bounds at position " + this.position);
    }
    const value = this.data.getInt8(this.position);
    this.position += 1;
    return value;
  }

  readFloat32() {
    if (this.position + 4 > this.length) {
      throw new Error("Out of bounds at position " + this.position);
    }
    const value = this.data.getFloat32(this.position, true);
    this.position += 4;
    return value;
  }

  /**
   * Чтение строки заданной длины
   */
  readString(maxLength) {
    let result = "";
    const endPos = Math.min(this.position + maxLength, this.length);

    while (this.position < endPos) {
      const charCode = this.data.getUint8(this.position++);
      if (charCode === 0) {
        this.position = endPos;
        break;
      }
      result += String.fromCharCode(charCode);
    }

    this.position = endPos;
    return result.trim();
  }

  /**
   * Определение количества UV-каналов в геометрии
   */
  getGeometryNumUVs(geometry) {
    if (!geometry) {
      return 0;
    }

    let numUVs = (geometry.format & 0xFF0000) >> 16;

    if (geometry.format & GeometryFlag.rwTEXTURED) {
      numUVs = Math.max(1, numUVs);
    }
    if (geometry.format & GeometryFlag.rwTEXTURED2) {
      numUVs = Math.max(2, numUVs);
    }

    return numUVs;
  }

  /**
   * Чтение значения в нативном формате
   */
  readNativeValue(dataType, normalized, offset) {
    switch (dataType) {
      case 0: // Float
        return {
          value: this.data.getFloat32(offset, true),
          byteSize: 4
        };

      case 1: // Int8
        {
          const rawValue = this.data.getInt8(offset);
          return {
            value: normalized ? Math.max(-1, rawValue / 127) : rawValue,
            byteSize: 1
          };
        }

      case 2: // UInt8
        {
          const rawValue = this.data.getUint8(offset);
          return {
            value: normalized ? rawValue / 255 : rawValue,
            byteSize: 1
          };
        }

      case 3: // Int16
        {
          const rawValue = this.data.getInt16(offset, true);
          return {
            value: normalized ? Math.max(-1, rawValue / 32767) : rawValue,
            byteSize: 2
          };
        }

      case 4: // UInt16
        {
          const rawValue = this.data.getUint16(offset, true);
          return {
            value: normalized ? rawValue / 65535 : rawValue,
            byteSize: 2
          };
        }

      default:
        return {
          value: 0,
          byteSize: 0
        };
    }
  }

  /**
   * Парсинг нативных данных OpenGL
   */
  parseOpenGLNativeData(geometry, startOffset, availableSize) {
    const endOffset = Math.min(startOffset + availableSize, this.length);

    if (!geometry || startOffset + 4 > endOffset) {
      return null;
    }

    const numAttributes = this.data.getUint32(startOffset, true);
    let currentOffset = startOffset + 4;
    const attributes = [];

    // Чтение атрибутов
    for (let i = 0; i < numAttributes; i++) {
      if (currentOffset + 24 > endOffset) {
        return null;
      }

      attributes.push({
        index: this.data.getUint32(currentOffset, true),
        type: this.data.getInt32(currentOffset + 4, true),
        normalized: this.data.getUint32(currentOffset + 8, true) !== 0,
        size: this.data.getInt32(currentOffset + 12, true),
        stride: this.data.getUint32(currentOffset + 16, true),
        offset: this.data.getUint32(currentOffset + 20, true)
      });

      currentOffset += 24;
    }

    const stride = attributes[0]?.stride ?? 0;
    if (stride <= 0) {
      return null;
    }

    if (endOffset - currentOffset < geometry.numVertices * stride) {
      return null;
    }

    const numUVs = this.getGeometryNumUVs(geometry);
    const texCoords = numUVs > 0 ? Array.from({ length: numUVs }, () => []) : [];

    const vertices = [];
    const normals = [];
    const prelitColors = [];
    const extraVertColor = [];
    const vertexBoneWeights = [];
    const vertexBoneIndices = [];

    // Чтение вершинных данных
    for (let vertexIdx = 0; vertexIdx < geometry.numVertices; vertexIdx++) {
      const vertexOffset = currentOffset + vertexIdx * stride;

      for (const attrib of attributes) {
        const values = [];
        let dataOffset = vertexOffset + attrib.offset;
        let byteSize = 0;

        for (let component = 0; component < attrib.size; component++) {
          const nativeValue = this.readNativeValue(attrib.type, attrib.normalized, dataOffset);
          values.push(nativeValue.value);
          byteSize = nativeValue.byteSize;
          dataOffset += nativeValue.byteSize;
        }

        // Распределение по семантике атрибутов
        switch (attrib.index) {
          case 0: // Позиция
            if (values.length >= 3) {
              vertices.push({
                x: values[0],
                y: values[1],
                z: values[2]
              });
            }
            break;

          case 1: // UV координаты
            if (texCoords.length > 0 && values.length >= 2) {
              const scale = attrib.type === 3 || attrib.type === 4 ? 1 / 1024 : 1;
              texCoords[0].push({
                u: values[0] * scale,
                v: values[1] * scale
              });
            }
            break;

          case 2: // Нормали
            if (values.length >= 3) {
              normals.push({
                x: values[0],
                y: values[1],
                z: values[2]
              });
            }
            break;

          case 3: // Цвет вершин
            if (values.length >= 4) {
              prelitColors.push({
                r: attrib.normalized ? Math.round(values[0] * 255) : values[0],
                g: attrib.normalized ? Math.round(values[1] * 255) : values[1],
                b: attrib.normalized ? Math.round(values[2] * 255) : values[2],
                a: attrib.normalized ? Math.round(values[3] * 255) : values[3]
              });
            }
            break;

          case 4: // Веса костей
            if (values.length >= 4) {
              vertexBoneWeights.push({
                x: values[0],
                y: values[1],
                z: values[2],
                w: values[3]
              });
            }
            break;

          case 5: // Индексы костей
            if (values.length >= 4) {
              vertexBoneIndices.push({
                x: values[0],
                y: values[1],
                z: values[2],
                w: values[3]
              });
            }
            break;

          case 6: // Дополнительный цвет вершин
            if (values.length >= 4) {
              extraVertColor.push({
                r: attrib.normalized ? Math.round(values[0] * 255) : values[0],
                g: attrib.normalized ? Math.round(values[1] * 255) : values[1],
                b: attrib.normalized ? Math.round(values[2] * 255) : values[2],
                a: attrib.normalized ? Math.round(values[3] * 255) : values[3]
              });
            }
            break;
        }

        if (byteSize === 0) {
          return null;
        }
      }
    }

    // Сохранение результатов в геометрию
    if (vertices.length === geometry.numVertices) {
      const defaultBoundingSphere = {
        x: 0,
        y: 0,
        z: 0,
        radius: 0
      };

      const morphTarget = geometry.morphTargets?.[0] || {
        boundingSphere: defaultBoundingSphere,
        hasVertices: 1,
        hasNormals: normals.length === geometry.numVertices ? 1 : 0
      };

      morphTarget.vertices = vertices;
      morphTarget.hasVertices = 1;

      if (normals.length === geometry.numVertices) {
        morphTarget.normals = normals;
        morphTarget.hasNormals = 1;
      }

      if (geometry.morphTargets && geometry.morphTargets.length !== 0) {
        geometry.morphTargets[0] = morphTarget;
      } else {
        geometry.morphTargets = [morphTarget];
      }
    }

    if (texCoords.length > 0 && texCoords[0].length === geometry.numVertices) {
      geometry.texCoords = texCoords;
    }

    if (prelitColors.length === geometry.numVertices) {
      geometry.prelitcolor = prelitColors;
    }

    if (vertexBoneIndices.length === geometry.numVertices) {
      geometry.nativeVertexBoneIndices = vertexBoneIndices;
    }

    if (vertexBoneWeights.length === geometry.numVertices) {
      geometry.nativeVertexBoneWeights = vertexBoneWeights;
    }

    if (extraVertColor.length === geometry.numVertices) {
      geometry.extraVertColor = extraVertColor;
    }

    geometry.nativeData = {
      format: "opengl",
      numAttribs: numAttributes,
      stride: stride,
      attributes: attributes
    };

    return {
      numAttribs: numAttributes,
      stride: stride,
      attributes: attributes
    };
  }

  /**
   * Чтение чанка определенного типа
   */
  readChunk(expectedType, parent, endBoundary) {
    if (endBoundary !== undefined && this.position + 12 > endBoundary) {
      return null;
    }

    const header = this.readHeader(parent);

    if (expectedType !== header.type) {
      this.position += Math.max(header.length, 1);
      return null;
    }

    const dataStart = this.position;
    const chunkData = this.readData(header);
    const dataEnd = dataStart + header.length;

    if (this.position < dataEnd || this.position > dataEnd) {
      this.position = dataEnd;
    }

    return chunkData;
  }

  /**
   * Чтение чанка в сыром виде
   */
  readRawChunk(expectedType, parent, endBoundary) {
    if (endBoundary !== undefined && this.position + 12 > endBoundary) {
      return null;
    }

    const startPos = this.position;
    const header = this.readHeader(parent);
    const endPos = Math.min(startPos + 12 + header.length, this.length);

    if (expectedType !== undefined && expectedType !== header.type) {
      this.position = endPos;
      return null;
    }

    const rawData = new Uint8Array(endPos - startPos);
    rawData.set(new Uint8Array(this.data.buffer, this.data.byteOffset + startPos, endPos - startPos));
    this.position = endPos;

    return {
      chunkType: header.type,
      build: header.build,
      version: header.version,
      rawData: rawData
    };
  }

  /**
   * Чтение данных в зависимости от типа чанка
   */
  readData(header) {
    let result = null;

    switch (header.type) {
      case ChunkType.CHUNK_CLUMP:
        {
          const clumpEnd = this.position + header.length;
          const structHeader = this.readHeader();
          const isVersion3 = structHeader.version >= 0x30400; // 197632
          const numAtomics = this.readUInt32();
          let numLights = 0;
          let numCameras = 0;

          if (structHeader.length === 12) {
            numLights = this.readUInt32();
            numCameras = this.readUInt32();
          }

          result = {};
          result.rwBuild = header.build;
          result.rwVersion = header.version;
          result.isLockedDFF = this.isLocked;
          result.RWFrameList = this.readChunk(ChunkType.CHUNK_FRAMELIST);
          result.RWGeometryList = isVersion3 && this.readChunk(ChunkType.CHUNK_GEOMETRYLIST) || [];
          result.RWLightList = [];
          result.RWCameraList = [];
          result.RWAtomicList = [];

          // Чтение атомиков
          for (let i = 0; i < numAtomics && (!this.isLocked || !(this.position >= clumpEnd)); i++) {
            if (this.isLocked && this.canRead(4)) {
              if (this.data.getUint32(this.position, true) === 65054) { // Маркер окончания
                break;
              }
            }

            const atomic = this.readChunk(ChunkType.CHUNK_ATOMIC);
            if (atomic) {
              if (!isVersion3 && atomic.inlineGeometry) {
                atomic.geometryIndex = result.RWGeometryList.length;
                result.RWGeometryList.push(atomic.inlineGeometry);
                delete atomic.inlineGeometry;
              }
              result.RWAtomicList.push(atomic);
            }
          }

          // Чтение источников света
          for (let i = 0; i < numLights; i++) {
            const lightHeader = this.readHeader();
            if (lightHeader.type !== ChunkType.CHUNK_STRUCT || lightHeader.length < 4) {
              this.position = Math.min(this.position + Math.max(lightHeader.length, 0), clumpEnd);
              continue;
            }

            const frameIndex = this.readInt32();
            const skipEnd = Math.min(this.position + Math.max(lightHeader.length - 4, 0), clumpEnd);
            this.position = skipEnd;

            const rawLight = this.readRawChunk(ChunkType.CHUNK_LIGHT, undefined, clumpEnd);
            if (rawLight) {
              result.RWLightList.push({
                frameIndex: frameIndex,
                rawData: rawLight.rawData
              });
            }
          }

          // Чтение камер
          for (let i = 0; i < numCameras; i++) {
            const cameraHeader = this.readHeader();
            if (cameraHeader.type !== ChunkType.CHUNK_STRUCT || cameraHeader.length < 4) {
              this.position = Math.min(this.position + Math.max(cameraHeader.length, 0), clumpEnd);
              continue;
            }

            const frameIndex = this.readInt32();
            const skipEnd = Math.min(this.position + Math.max(cameraHeader.length - 4, 0), clumpEnd);
            this.position = skipEnd;

            const rawCamera = this.readRawChunk(ChunkType.CHUNK_CAMERA, undefined, clumpEnd);
            if (rawCamera) {
              result.RWCameraList.push({
                frameIndex: frameIndex,
                rawData: rawCamera.rawData
              });
            }
          }

          // Коррекция для заблокированных DFF
          if (this.isLocked && result.RWGeometryList && result.RWAtomicList.length < result.RWGeometryList.length) {
            const numGeometries = result.RWGeometryList.length;
            const numAtomicsFound = result.RWAtomicList.length;
            console.warn("Locked DFF: generating " + numGeometries + " root-frame atomics (had " + numAtomicsFound + " incomplete)");

            result.RWAtomicList = [];
            for (let i = 0; i < numGeometries; i++) {
              result.RWAtomicList.push({
                frameIndex: 0,
                geometryIndex: i,
                flags: 5,
                synthetic: true
              });
            }
            result.isLockedDFF = true;
          }

          this.readExtension(result, clumpEnd);
          break;
        }

      case ChunkType.CHUNK_FRAMELIST:
        {
          this.readHeader();
          const numFrames = this.readUInt32();
          result = [];

          // Чтение фреймов
          for (let i = 0; i < numFrames; i++) {
            const frameData = {
              rotationMatrix: [
                this.readFloat32(), this.readFloat32(), this.readFloat32(),
                this.readFloat32(), this.readFloat32(), this.readFloat32(),
                this.readFloat32(), this.readFloat32(), this.readFloat32()
              ],
              position: [this.readFloat32(), this.readFloat32(), this.readFloat32()],
              parentIndex: this.readInt32(),
              flags: this.readUInt32()
            };

            result.push({ RWFrame: frameData });
          }

          // Чтение расширений для каждого фрейма
          for (let i = 0; i < numFrames; i++) {
            this.readExtension(result[i]);
          }
          break;
        }

      case ChunkType.CHUNK_GEOMETRYLIST:
        {
          this.readHeader();
          const numGeometries = this.readUInt32();
          result = [];

          for (let i = 0; i < numGeometries; i++) {
            result.push(this.readChunk(ChunkType.CHUNK_GEOMETRY));
          }
          break;
        }

      case ChunkType.CHUNK_GEOMETRY:
        {
          const structHeader = this.readHeader();
          result = {};
          result.format = this.readUInt32();
          result.numTriangles = this.readUInt32();
          result.numVertices = this.readUInt32();
          result.numMorphTargets = this.readUInt32();

          let numUVs = (result.format & 0xFF0000) >> 16;
          if (result.format & GeometryFlag.rwTEXTURED) {
            numUVs = Math.max(1, numUVs);
          }

          // Для старых версий читаем материал
          if (structHeader.version < 0x34000) { // 212992
            result.ambient = this.readFloat32();
            result.specular = this.readFloat32();
            result.diffuse = this.readFloat32();
          }

          // Не-нативная геометрия
          if ((result.format & GeometryFlag.rwNATIVE) === 0) {
            if (result.format & GeometryFlag.rwPRELIT) {
              result.prelitcolor = [];
              for (let i = 0; i < result.numVertices; i++) {
                result.prelitcolor.push({
                  r: this.readUInt8(),
                  g: this.readUInt8(),
                  b: this.readUInt8(),
                  a: this.readUInt8()
                });
              }
            }

            if (result.format & (GeometryFlag.rwTEXTURED | GeometryFlag.rwTEXTURED2)) {
              result.texCoords = [];
              for (let uvIdx = 0; uvIdx < numUVs; uvIdx++) {
                result.texCoords[uvIdx] = [];
                for (let vertIdx = 0; vertIdx < result.numVertices; vertIdx++) {
                  result.texCoords[uvIdx].push({
                    u: this.readFloat32(),
                    v: this.readFloat32()
                  });
                }
              }
            }

            result.triangles = [];
            for (let i = 0; i < result.numTriangles; i++) {
              result.triangles.push({
                vertex2: this.readUInt16(),
                vertex1: this.readUInt16(),
                materialId: this.readUInt16(),
                vertex3: this.readUInt16()
              });
            }
          }

          // Морф-таргеты
          result.morphTargets = [];
          for (let targetIdx = 0; targetIdx < result.numMorphTargets; targetIdx++) {
            const morphTarget = {
              boundingSphere: {
                x: this.readFloat32(),
                y: this.readFloat32(),
                z: this.readFloat32(),
                radius: this.readFloat32()
              },
              hasVertices: this.readUInt32(),
              hasNormals: this.readUInt32()
            };

            if (morphTarget.hasVertices) {
              morphTarget.vertices = [];
              for (let vertIdx = 0; vertIdx < result.numVertices; vertIdx++) {
                morphTarget.vertices.push({
                  x: this.readFloat32(),
                  y: this.readFloat32(),
                  z: this.readFloat32()
                });
              }
            }

            if (morphTarget.hasNormals) {
              morphTarget.normals = [];
              for (let vertIdx = 0; vertIdx < result.numVertices; vertIdx++) {
                morphTarget.normals.push({
                  x: this.readFloat32(),
                  y: this.readFloat32(),
                  z: this.readFloat32()
                });
              }
            }

            result.morphTargets.push(morphTarget);
          }

          result.RWMaterialList = this.readChunk(ChunkType.CHUNK_MATERIALLIST);
          this.readExtension(result);
          break;
        }

      case ChunkType.CHUNK_MATERIALLIST:
        {
          this.readHeader();
          const numMaterials = this.readUInt32();
          result = [];

          // Чтение индексов материалов
          for (let i = 0; i < numMaterials; i++) {
            result.push({ id: this.readUInt32() });
          }

          // Чтение данных материалов
          for (let i = 0; i < numMaterials; i++) {
            result[i].RWMaterial = this.readChunk(ChunkType.CHUNK_MATERIAL);
          }
          break;
        }

      case ChunkType.CHUNK_MATERIAL:
        {
          const structHeader = this.readHeader();
          result = {};
          result.flags = this.readUInt32();
          result.color = {
            r: this.readUInt8(),
            g: this.readUInt8(),
            b: this.readUInt8(),
            a: this.readUInt8()
          };
          this.readUInt32(); // Пропускаем unused
          result.isTextured = this.readUInt32();

          if (structHeader.version > 0x30400) { // 197632
            result.ambient = this.readFloat32();
            result.specular = this.readFloat32();
            result.diffuse = this.readFloat32();
          }

          if (result.isTextured) {
            result.RWTexture = this.readChunk(ChunkType.CHUNK_TEXTURE);
          }

          this.readExtension(result);
          break;
        }

      case ChunkType.CHUNK_TEXTURE:
        {
          this.readHeader();
          result = {};
          result.filterFlags = this.readUInt16();
          this.readUInt16(); // Пропускаем unused

          const nameHeader = this.readHeader();
          result.nameOffset = this.position;
          result.nameLength = nameHeader.length;
          result.name = this.readString(nameHeader.length);

          const maskHeader = this.readHeader();
          result.maskNameOffset = this.position;
          result.maskNameLength = maskHeader.length;
          result.maskName = this.readString(maskHeader.length);

          this.readExtension(result);
          break;
        }

      case ChunkType.CHUNK_STRING:
        result = this.readString(header.length);
        break;

      case ChunkType.CHUNK_ATOMIC:
        {
          const structHeader = this.readHeader();
          result = {};
          result.frameIndex = this.readUInt32();

          if (structHeader.version < 0x30400) { // 197632
            result.flags = this.readUInt32();
            this.readUInt32(); // Пропускаем unused
            result.inlineGeometry = this.readChunk(ChunkType.CHUNK_GEOMETRY);
            result.geometryIndex = -1;
          } else {
            result.geometryIndex = this.readUInt32();
            result.flags = this.readUInt32();
            this.readUInt32(); // Пропускаем unused
          }

          this.readExtension(result);
          break;
        }

      case ChunkType.CHUNK_EXTENSION:
        {
          result = {};
          const extensionEnd = this.position + header.length;

          while (this.position + 12 <= extensionEnd && this.position + 12 <= this.length) {
            const extHeader = this.readHeader();

            if (extHeader.length > this.length - this.position) {
              this.position = Math.min(extensionEnd, this.length);
              break;
            }

            let extData = {};
            const extDataStart = this.position;

            switch (extHeader.type) {
              case ChunkType.CHUNK_HANIM:
                extData.header = {
                  version: this.readUInt32(),
                  id: this.readUInt32(),
                  boneCount: this.readUInt32()
                };
                extData.bones = [];

                if (extData.header.boneCount > 0) {
                  extData.flags = this.readUInt32();
                  extData.keyFrameSize = this.readUInt32();

                  for (let i = 0; i < extData.header.boneCount; i++) {
                    const nodeId = this.readUInt32();
                    const nodeIndex = this.readUInt32();
                    const flags = this.readUInt32();

                    extData.bones.push({
                      id: nodeId,
                      index: nodeIndex,
                      type: flags & 3,
                      flags: flags
                    });
                  }
                }

                // Алиасы для совместимости
                extData.hAnimVersion = extData.header.version;
                extData.nodeId = extData.header.id;
                extData.numNodes = extData.header.boneCount;
                extData.nodes = extData.bones.map(bone => ({
                  nodeId: bone.id,
                  nodeIndex: bone.index,
                  flags: bone.flags
                }));
                break;

              case ChunkType.CHUNK_FRAME:
                extData = this.readString(extHeader.length);
                break;

              case ChunkType.CHUNK_BINMESH:
                {
                  extData.faceType = this.readUInt32();
                  const numSplits = this.readUInt32();
                  extData.numIndices = this.readUInt32();
                  extData.splits = [];

                  const hasSplitIndices = extHeader.length > 12 + numSplits * 8;
                  const sizeWith32bit = 12 + numSplits * 8 + extData.numIndices * 4;
                  const sizeWith16bit = 12 + numSplits * 8 + extData.numIndices * 2;
                  const parentGeometry = header.parent;

                  let indexSize = 4;
                  if (extHeader.length === sizeWith16bit) {
                    indexSize = 2;
                  } else if (extHeader.length !== sizeWith32bit && parentGeometry && parentGeometry.format & GeometryFlag.rwNATIVE) {
                    indexSize = sizeWith16bit <= extHeader.length ? 2 : 4;
                  }

                  extData.indexSize = indexSize;

                  for (let splitIdx = 0; splitIdx < numSplits; splitIdx++) {
                    const numIndicesInSplit = this.readUInt32();
                    const split = {
                      matIndex: this.readUInt32()
                    };

                    if (hasSplitIndices) {
                      split.indices = [];
                      for (let idx = 0; idx < numIndicesInSplit; idx++) {
                        split.indices.push(indexSize === 2 ? this.readUInt16() : this.readUInt32());
                      }
                    }

                    extData.splits.push(split);
                  }
                  break;
                }

              case ChunkType.CHUNK_NATIVEDATA:
                {
                  const parentGeometry = header.parent;
                  let dataSize = Math.min(extHeader.length, this.length - extDataStart, extensionEnd - extDataStart);

                  // Попытка определить реальный размер данных
                  if (parentGeometry && parentGeometry.format & GeometryFlag.rwNATIVE && extDataStart + 4 <= this.length) {
                    const numAttribs = this.data.getUint32(extDataStart, true);
                    const headerSize = 4 + numAttribs * 24;

                    if (numAttribs > 0 && extDataStart + headerSize <= this.length) {
                      const stridePos = extDataStart + 4 + 16;
                      const vertexStride = this.data.getUint32(stridePos, true);
                      const totalSize = headerSize + parentGeometry.numVertices * vertexStride;

                      if (vertexStride > 0 && totalSize > dataSize && extDataStart + totalSize <= extensionEnd && extDataStart + totalSize <= this.length) {
                        dataSize = totalSize;
                      }
                    }
                  }

                  const nativeResult = this.parseOpenGLNativeData(parentGeometry, extDataStart, dataSize);

                  if (nativeResult) {
                    extData = nativeResult;
                    extData.rawData = new Uint8Array(dataSize);
                    extData.rawData.set(new Uint8Array(this.data.buffer, this.data.byteOffset + extDataStart, dataSize));
                  } else {
                    extData = {
                      rawData: new Uint8Array(dataSize),
                      chunkType: extHeader.type
                    };
                    if (dataSize > 0) {
                      extData.rawData.set(new Uint8Array(this.data.buffer, this.data.byteOffset + extDataStart, dataSize));
                    }
                  }

                  this.position = Math.min(extDataStart + dataSize, extensionEnd, this.length);
                  break;
                }

              case ChunkType.CHUNK_SKIN:
                {
                  extData.numBones = this.readUInt8();
                  extData.numUsedBones = this.readUInt8();
                  extData.maxWeightsPerVertex = this.readUInt8();
                  this.readUInt8(); // Пропускаем padding

                  const isEmptyBones = extData.numUsedBones === 0;

                  // Используемые кости
                  extData.bonesUsed = [];
                  for (let i = 0; i < extData.numUsedBones; i++) {
                    extData.bonesUsed.push(this.readUInt8());
                  }

                  // Индексы костей для вершин
                  extData.vertexBoneIndices = [];
                  for (let vertIdx = 0; vertIdx < header.parent.numVertices; vertIdx++) {
                    extData.vertexBoneIndices.push({
                      x: this.readUInt8(),
                      y: this.readUInt8(),
                      z: this.readUInt8(),
                      w: this.readUInt8()
                    });
                  }

                  // Веса костей для вершин
                  extData.vertexBoneWeights = [];
                  for (let vertIdx = 0; vertIdx < header.parent.numVertices; vertIdx++) {
                    extData.vertexBoneWeights.push({
                      x: this.readFloat32(),
                      y: this.readFloat32(),
                      z: this.readFloat32(),
                      w: this.readFloat32()
                    });
                  }

                  // Матрицы костей
                  extData.skinToBoneMatrix = [];
                  for (let boneIdx = 0; boneIdx < extData.numBones; boneIdx++) {
                    if (isEmptyBones) {
                      this.position += 4; // Пропускаем индекс
                    }

                    const matrix = [];
                    for (let i = 0; i < 16; i++) {
                      matrix.push(this.readFloat32());
                    }

                    // Нормализация матрицы 4x4
                    matrix[3] = 0;
                    matrix[7] = 0;
                    matrix[11] = 0;
                    matrix[15] = 1;

                    extData.skinToBoneMatrix.push(matrix);
                  }
                  break;
                }

              case ChunkType.CHUNK_UVANIMPLG:
                {
                  const animSlotsMask = this.readUInt32();
                  extData.animSlotsMap = animSlotsMask;
                  extData.animNames = [];

                  for (let slot = 0; slot < 8; slot++) {
                    if (animSlotsMask & (1 << slot)) {
                      const animName = this.readString(32);
                      extData.animNames.push({
                        slot: slot,
                        name: animName
                      });
                    }
                  }
                  break;
                }

              case ChunkType.CHUNK_MESHEXTENSION:
                if (this.position + 4 <= this.length && this.position + 4 <= extensionEnd) {
                  this.readUInt32(); // Пропускаем unknown
                }
                this.position = Math.min(extDataStart + extHeader.length, extensionEnd, this.length);
                break;

              case ChunkType.CHUNK_COLLISIONMODEL:
                {
                  const dataSize = Math.min(extHeader.length, this.length - extDataStart, extensionEnd - extDataStart);

                  if (dataSize >= 60) {
                    try {
                      extData = this.readCollisionModel(dataSize, extDataStart);
                    } catch (error) {
                      this.position = extDataStart;
                      if (dataSize > 0) {
                        const rawBytes = new Uint8Array(dataSize);
                        rawBytes.set(new Uint8Array(this.data.buffer, this.data.byteOffset + extDataStart, dataSize));
                        extData = {
                          rawData: rawBytes,
                          chunkType: extHeader.type,
                          parseError: true
                        };
                      } else {
                        extData = {
                          rawData: new Uint8Array(0),
                          chunkType: extHeader.type,
                          parseError: true
                        };
                      }
                    }
                  } else if (dataSize > 0) {
                    const rawBytes = new Uint8Array(dataSize);
                    rawBytes.set(new Uint8Array(this.data.buffer, this.data.byteOffset + extDataStart, dataSize));
                    extData = {
                      rawData: rawBytes,
                      chunkType: extHeader.type
                    };
                  } else {
                    extData = {
                      rawData: new Uint8Array(0),
                      chunkType: extHeader.type
                    };
                  }

                  this.position = Math.min(extDataStart + extHeader.length, extensionEnd, this.length);
                  break;
                }

              case ChunkType.CHUNK_2DFX:
                {
                  const dataSize = Math.min(extHeader.length, this.length - extDataStart, extensionEnd - extDataStart);

                  if (dataSize > 4) {
                    try {
                      extData = this.read2DFX(dataSize, extDataStart);
                    } catch (error) {
                      this.position = extDataStart;
                      const rawBytes = new Uint8Array(dataSize);
                      rawBytes.set(new Uint8Array(this.data.buffer, this.data.byteOffset + extDataStart, dataSize));
                      extData = {
                        rawData: rawBytes,
                        chunkType: extHeader.type
                      };
                    }
                  } else {
                    extData = {
                      effects: [],
                      rawData: new Uint8Array(0)
                    };
                  }

                  this.position = Math.min(extDataStart + extHeader.length, extensionEnd, this.length);
                  break;
                }

              case ChunkType.CHUNK_NIGHTVERTEXCOLOR:
                {
                  const dataSize = Math.min(extHeader.length, this.length - extDataStart, extensionEnd - extDataStart);

                  if (dataSize >= 4) {
                    const flag = this.readUInt32();
                    extData = { flag: flag };

                    if (flag !== 0 && dataSize > 4) {
                      const remainingSize = dataSize - 4;
                      const numColors = Math.floor(remainingSize / 4);

                      extData.colors = [];
                      for (let i = 0; i < numColors; i++) {
                        extData.colors.push({
                          r: this.readUInt8(),
                          g: this.readUInt8(),
                          b: this.readUInt8(),
                          a: this.readUInt8()
                        });
                      }

                      // Сохраняем сырые данные
                      const rawBytes = new Uint8Array(dataSize);
                      new DataView(rawBytes.buffer).setUint32(0, flag, true);
                      for (let i = 0; i < extData.colors.length; i++) {
                        rawBytes[4 + i * 4] = extData.colors[i].r;
                        rawBytes[4 + i * 4 + 1] = extData.colors[i].g;
                        rawBytes[4 + i * 4 + 2] = extData.colors[i].b;
                        rawBytes[4 + i * 4 + 3] = extData.colors[i].a;
                      }
                      extData.rawData = rawBytes;
                    } else {
                      const rawBytes = new Uint8Array(4);
                      new DataView(rawBytes.buffer).setUint32(0, flag, true);
                      extData.rawData = rawBytes;
                    }
                  } else {
                    extData = {
                      flag: 0,
                      rawData: new Uint8Array(0)
                    };
                  }

                  this.position = Math.min(extDataStart + dataSize, extensionEnd, this.length);
                  break;
                }

              case ChunkType.CHUNK_UVANIMDICT:
                {
                  this.position = extDataStart - 12;
                  const animations = this.readUVAnimDict();

                  if (animations && animations.length > 0) {
                    extData = { animations: animations };
                  }

                  this.position = extDataStart + extHeader.length;
                  break;
                }

              default:
                {
                  const dataSize = Math.min(extHeader.length, this.length - extDataStart, extensionEnd - extDataStart);

                  if (extHeader.type !== 0) {
                  }

                  if (dataSize > 0) {
                    const rawBytes = new Uint8Array(dataSize);
                    rawBytes.set(new Uint8Array(this.data.buffer, this.data.byteOffset + extDataStart, dataSize));
                    extData = {
                      rawData: rawBytes,
                      chunkType: extHeader.type
                    };
                  } else {
                    extData = {
                      rawData: new Uint8Array(0),
                      chunkType: extHeader.type
                    };
                  }

                  this.position = extDataStart + dataSize;
                  break;
                }
            }

            // Выравнивание позиции
            const expectedEnd = extDataStart + extHeader.length;
            if (this.position < expectedEnd) {
              this.position = Math.min(expectedEnd, extensionEnd, this.length);
            } else if (this.position > expectedEnd) {
              this.position = Math.min(extensionEnd, this.length);
            }

            result[extHeader.name] = extData;
          }

          this.position = Math.min(extensionEnd, this.length);
          break;
        }

      default:
        throw new Error("Chunk type " + header.name + " not implemented");
    }

    return result;
  }

  /**
   * Чтение расширения для объекта
   */
  readExtension(parent, endBoundary) {
    parent.RWExtension = this.readChunk(ChunkType.CHUNK_EXTENSION, parent, endBoundary);
  }

  /**
   * Чтение модели коллизий
   */
  readCollisionModel(dataSize, startOffset) {
    const endOffset = startOffset + dataSize;
    const rawData = new Uint8Array(dataSize);
    rawData.set(new Uint8Array(this.data.buffer, this.data.byteOffset + startOffset, dataSize));

    const colData = { rawData: rawData };

    const canRead = (bytes) => this.position + bytes <= endOffset;

    if (!canRead(8)) {
      throw new Error("Not enough data for COL header");
    }

    const version = this.readString(4);
    colData.version = version;

    if (!["COLL", "COL2", "COL3", "COL4"].includes(version)) {
      console.warn("[DFF Import] Unknown COL fourcc:", version);
      this.position = endOffset;
      return colData;
    }

    const structStart = startOffset + 4;
    const sectionsEnd = startOffset + 8 + this.readUInt32();

    if (!canRead(24)) {
      throw new Error("Not enough data for COL name and bounds");
    }

    colData.name = this.readString(22);
    colData.modelId = this.readInt16();
    colData.boundingSphere = {
      radius: this.readFloat32(),
      x: this.readFloat32(),
      y: this.readFloat32(),
      z: this.readFloat32()
    };
    colData.boundingBox = {
      minX: this.readFloat32(),
      minY: this.readFloat32(),
      minZ: this.readFloat32(),
      maxX: this.readFloat32(),
      maxY: this.readFloat32(),
      maxZ: this.readFloat32()
    };

    colData.spheres = [];
    colData.boxes = [];
    colData.lines = [];
    colData.vertices = [];
    colData.triangles = [];

    if (version === "COLL") {
      this.readCOL1(colData, sectionsEnd);
    } else {
      this.readCOL234(colData, version, structStart, sectionsEnd);
    }

    this.position = endOffset;
    return colData;
  }

  /**
   * Чтение COL1 формата коллизий
   */
  readCOL1(colData, endOffset) {
    const canRead = (bytes) => this.position + bytes <= endOffset;

    if (!(this.position + 4 <= endOffset)) {
      return;
    }

    const numSpheres = this.readUInt32();
    for (let i = 0; i < numSpheres && this.position + 20 <= endOffset; i++) {
      colData.spheres.push({
        radius: this.readFloat32(),
        x: this.readFloat32(),
        y: this.readFloat32(),
        z: this.readFloat32(),
        surface: this.readUInt8(),
        piece: this.readUInt8()
      });
      this.position += 2;
    }

    if (!(this.position + 4 <= endOffset)) {
      return;
    }

    this.readUInt32(); // Пропускаем unknown

    if (!canRead(4)) {
      return;
    }

    const numBoxes = this.readUInt32();
    for (let i = 0; i < numBoxes && this.position + 28 <= endOffset; i++) {
      colData.boxes.push({
        minX: this.readFloat32(),
        minY: this.readFloat32(),
        minZ: this.readFloat32(),
        maxX: this.readFloat32(),
        maxY: this.readFloat32(),
        maxZ: this.readFloat32(),
        surface: this.readUInt8(),
        piece: this.readUInt8()
      });
      this.position += 2;
    }

    if (!canRead(4)) {
      return;
    }

    const numVertices = this.readUInt32();
    for (let i = 0; i < numVertices && this.position + 12 <= endOffset; i++) {
      colData.vertices.push({
        x: this.readFloat32(),
        y: this.readFloat32(),
        z: this.readFloat32()
      });
    }

    if (!canRead(4)) {
      return;
    }

    const numTriangles = this.readUInt32();
    for (let i = 0; i < numTriangles && this.position + 16 <= endOffset; i++) {
      colData.triangles.push({
        a: this.readUInt32(),
        b: this.readUInt32(),
        c: this.readUInt32(),
        surface: this.readUInt8(),
        light: this.readUInt8()
      });
      this.position += 2;
    }
  }

  /**
   * Чтение COL2/COL3/COL4 формата коллизий
   */
  readCOL234(colData, version, structStart, endOffset) {
    const canRead = (bytes) => this.position + bytes <= endOffset;

    if (!(this.position + 12 <= endOffset)) {
      return;
    }

    const numSpheres = this.readUInt16();
    const numBoxes = this.readUInt16();
    const numTriangles = this.readUInt16();
    const numLines = this.readUInt8();
    this.position += 1; // Выравнивание

    if (!canRead(24)) {
      return;
    }

    this.readUInt32(); // Пропускаем
    const sphereOffset = this.readUInt32();
    const boxOffset = this.readUInt32();
    const lineOffset = this.readUInt32();
    const vertexOffset = this.readUInt32();
    const triangleOffset = this.readUInt32();
    this.readUInt32(); // Пропускаем

    let numShadowVertices = 0;
    let numShadowFaces = 0;
    let shadowVertexOffset = 0;
    let shadowFaceOffset = 0;

    if ((version === "COL3" || version === "COL4") && this.position + 16 <= endOffset) {
      numShadowVertices = this.readUInt32();
      numShadowFaces = this.readUInt32();
      shadowVertexOffset = this.readUInt32();
      shadowFaceOffset = this.readUInt32();
    }

    // Сферы
    if (numSpheres > 0 && sphereOffset > 0) {
      this.position = structStart + sphereOffset;
      for (let i = 0; i < numSpheres && this.position + 20 <= endOffset; i++) {
        colData.spheres.push({
          x: this.readFloat32(),
          y: this.readFloat32(),
          z: this.readFloat32(),
          radius: this.readFloat32(),
          surface: this.readUInt8(),
          piece: this.readUInt8()
        });
        this.position += 2;
      }
    }

    // Боксы
    if (numBoxes > 0 && boxOffset > 0) {
      this.position = structStart + boxOffset;
      for (let i = 0; i < numBoxes && this.position + 28 <= endOffset; i++) {
        colData.boxes.push({
          minX: this.readFloat32(),
          minY: this.readFloat32(),
          minZ: this.readFloat32(),
          maxX: this.readFloat32(),
          maxY: this.readFloat32(),
          maxZ: this.readFloat32(),
          surface: this.readUInt8(),
          piece: this.readUInt8()
        });
        this.position += 2;
      }
    }

    // Линии
    if (numLines > 0 && lineOffset > 0) {
      this.position = structStart + lineOffset;
      for (let i = 0; i < numLines && this.position + 24 <= endOffset; i++) {
        colData.lines.push({
          startX: this.readFloat32(),
          startY: this.readFloat32(),
          startZ: this.readFloat32(),
          endX: this.readFloat32(),
          endY: this.readFloat32(),
          endZ: this.readFloat32()
        });
      }
    }

    // Треугольники
    let maxVertexIndex = 0;
    if (numTriangles > 0 && triangleOffset > 0) {
      this.position = structStart + triangleOffset;
      for (let i = 0; i < numTriangles && this.position + 8 <= endOffset; i++) {
        const triangle = {
          a: this.readUInt16(),
          b: this.readUInt16(),
          c: this.readUInt16(),
          surface: this.readUInt8(),
          light: this.readUInt8()
        };
        colData.triangles.push(triangle);
        maxVertexIndex = Math.max(maxVertexIndex, triangle.a, triangle.b, triangle.c);
      }
    }

    // Вершины
    if (numTriangles > 0 && vertexOffset > 0) {
      const numVertices = maxVertexIndex + 1;
      this.position = structStart + vertexOffset;
      for (let i = 0; i < numVertices && this.position + 6 <= endOffset; i++) {
        colData.vertices.push({
          x: this.readInt16() / 128,
          y: this.readInt16() / 128,
          z: this.readInt16() / 128
        });
      }
    }

    // Тени для COL3/COL4
    if ((version === "COL3" || version === "COL4") && numShadowFaces > 0) {
      colData.shadowVertices = [];
      colData.shadowFaces = [];

      if (shadowVertexOffset > 0) {
        this.position = structStart + shadowVertexOffset;
        for (let i = 0; i < numShadowVertices && this.position + 6 <= endOffset; i++) {
          colData.shadowVertices.push({
            x: this.readInt16() / 128,
            y: this.readInt16() / 128,
            z: this.readInt16() / 128
          });
        }
      }

      if (shadowFaceOffset > 0) {
        this.position = structStart + shadowFaceOffset;
        for (let i = 0; i < numShadowFaces && this.position + 8 <= endOffset; i++) {
          colData.shadowFaces.push({
            a: this.readUInt16(),
            b: this.readUInt16(),
            c: this.readUInt16()
          });
          this.position += 2;
        }
      }
    }
  }

  /**
   * Чтение Int16
   */
  readInt16() {
    if (this.position + 2 > this.length) {
      throw new Error("Out of bounds at position " + this.position);
    }
    const value = this.data.getInt16(this.position, true);
    this.position += 2;
    return value;
  }

  /**
   * Чтение 2DFX эффектов
   */
  read2DFX(dataSize, startOffset) {
    const endOffset = startOffset + dataSize;
    const rawData = new Uint8Array(dataSize);
    rawData.set(new Uint8Array(this.data.buffer, this.data.byteOffset + startOffset, dataSize));

    const fxData = {
      effects: [],
      rawData: rawData
    };

    const numEffects = this.readUInt32();
    const typeNames = [
      "LIGHT", "PARTICLE", "UNKNOWN", "ATTRACTOR", "SUN_GLARE",
      "INTERIOR", "ENEX", "ROADSIGN", "TRIGGER_POINT",
      "COVER_POINT", "ESCALATOR"
    ];

    for (let i = 0; i < numEffects && this.position < endOffset; i++) {
      const effect = {};
      effect.x = this.readFloat32();
      effect.y = this.readFloat32();
      effect.z = this.readFloat32();
      effect.type = this.readUInt32();
      const size = this.readUInt32();
      effect.typeName = typeNames[effect.type] || "TYPE_" + effect.type;

      const dataStart = this.position;

      try {
        switch (effect.type) {
          case 0: // Light
            effect.color = {
              r: this.readUInt8(),
              g: this.readUInt8(),
              b: this.readUInt8(),
              a: this.readUInt8()
            };
            effect.coronaFarClip = this.readFloat32();
            effect.pointlightRange = this.readFloat32();
            effect.coronaSize = this.readFloat32();
            effect.shadowSize = this.readFloat32();
            effect.coronaShowMode = this.readUInt8();
            effect.coronaEnableReflection = this.readUInt8();
            effect.coronaFlareType = this.readUInt8();
            effect.shadowColorMultiplier = this.readUInt8();
            effect.flags1 = this.readUInt8();
            effect.coronaTexName = this.readString(24);
            effect.shadowTexName = this.readString(24);
            effect.shadowZDistance = this.readUInt8();
            effect.flags2 = this.readUInt8();
            if (size >= 80) {
              effect.lookDirectionX = this.readInt8();
              effect.lookDirectionY = this.readInt8();
              effect.lookDirectionZ = this.readInt8();
            }
            break;

          case 1: // Particle
            effect.particleName = this.readString(24);
            break;

          case 3: // Attractor
            effect.attractorType = this.readUInt8();
            this.readUInt8();
            this.readUInt8();
            this.readUInt8();
            effect.queueDir = {
              x: this.readFloat32(),
              y: this.readFloat32(),
              z: this.readFloat32()
            };
            effect.useDir = {
              x: this.readFloat32(),
              y: this.readFloat32(),
              z: this.readFloat32()
            };
            effect.forwardDir = {
              x: this.readFloat32(),
              y: this.readFloat32(),
              z: this.readFloat32()
            };
            effect.scriptName = this.readString(8);
            effect.pedExistingProbability = this.readUInt8();
            this.readUInt8();
            this.readUInt8();
            this.readUInt8();
            effect.field36 = this.readUInt8();
            this.readUInt8();
            effect.attractorFlags = this.readUInt8();
            this.readUInt8();
            break;

          case 6: // ENEX
            effect.enterAngle = this.readFloat32();
            effect.radiusX = this.readFloat32();
            effect.radiusY = this.readFloat32();
            effect.exitX = this.readFloat32();
            effect.exitY = this.readFloat32();
            effect.exitZ = this.readFloat32();
            effect.exitAngle = this.readFloat32();
            effect.interiorId = this.readInt16();
            effect.flags1 = this.readUInt8();
            effect.skyColor = this.readUInt8();
            effect.interiorName = this.readString(8);
            effect.timeOn = this.readUInt8();
            effect.timeOff = this.readUInt8();
            effect.flags2 = this.readUInt8();
            this.readUInt8();
            break;

          case 7: // Road Sign
            effect.sizeX = this.readFloat32();
            effect.sizeY = this.readFloat32();
            effect.rotationX = this.readFloat32();
            effect.rotationY = this.readFloat32();
            effect.rotationZ = this.readFloat32();
            effect.flags = this.readUInt16();
            effect.text1 = this.readString(16);
            effect.text2 = this.readString(16);
            effect.text3 = this.readString(16);
            effect.text4 = this.readString(16);
            if (size >= 88) {
              this.readUInt8();
              this.readUInt8();
            }
            effect.text = [effect.text1, effect.text2, effect.text3, effect.text4].filter(Boolean).join("\n");
            break;

          case 8: // Trigger Point
            effect.pointId = this.readUInt32();
            break;

          case 9: // Cover Point
            effect.dirX = this.readFloat32();
            effect.dirY = this.readFloat32();
            effect.coverType = this.readUInt32();
            break;

          case 10: // Escalator
            effect.bottomX = this.readFloat32();
            effect.bottomY = this.readFloat32();
            effect.bottomZ = this.readFloat32();
            effect.topX = this.readFloat32();
            effect.topY = this.readFloat32();
            effect.topZ = this.readFloat32();
            effect.endX = this.readFloat32();
            effect.endY = this.readFloat32();
            effect.endZ = this.readFloat32();
            effect.direction = this.readUInt8();
            break;

          case 4: // Sun Glare (нет данных)
          default:
            break;
        }
      } catch (error) {
        console.warn("[2DFX] Error parsing effect type", effect.type, ":", error.message);
      }

      // Выравнивание позиции
      if (this.position - dataStart < size) {
        this.position = dataStart + size;
      }

      fxData.effects.push(effect);
    }

    if (this.position < endOffset) {
      this.position = endOffset;
    }

    return fxData;
  }

  /**
   * Чтение словаря UV-анимаций
   */
  readUVAnimDict() {
    const animations = [];
    const dictHeader = this.readHeader();

    if (dictHeader.type !== ChunkType.CHUNK_UVANIMDICT) {
      return animations;
    }

    const dictEnd = this.position + dictHeader.length;

    if (this.readHeader().type !== ChunkType.CHUNK_STRUCT) {
      this.position = dictEnd;
      return animations;
    }

    const numAnimations = this.readUInt32();

    for (let i = 0; i < numAnimations && this.position < dictEnd - 12; i++) {
      const animHeader = this.readHeader();

      if (animHeader.type === ChunkType.CHUNK_ANIMANIMATION || animHeader.type === ChunkType.CHUNK_HANIMANIMATION) {
        const animEnd = this.position + animHeader.length;
        const animation = this.readUVAnim(animEnd);

        if (animation) {
          animation.chunkType = animHeader.type;
          animations.push(animation);
        }

        this.position = animEnd;
      } else {
        this.position += animHeader.length;
      }
    }

    this.position = dictEnd;
    return animations;
  }

  /**
   * Чтение UV-анимации
   */
  readUVAnim(endOffset) {
    if (endOffset - this.position < 88) {
      return null;
    }

    const animation = {
      version: this.readUInt32(),
      typeId: this.readUInt32()
    };

    const numFrames = this.readUInt32();
    animation.flags = this.readUInt32();
    animation.duration = this.readFloat32();
    this.position += 4; // Пропускаем reserved
    animation.name = this.readString(32);

    animation.nodeToUVChannelMap = [];
    for (let i = 0; i < 8; i++) {
      animation.nodeToUVChannelMap.push(this.readFloat32());
    }

    animation.frames = [];
    animation.isLinear = animation.typeId === 449;

    for (let frameIdx = 0; frameIdx < numFrames && this.position + 32 <= endOffset; frameIdx++) {
      const frame = {
        time: this.readFloat32(),
        uv: []
      };

      for (let uvIdx = 0; uvIdx < 6; uvIdx++) {
        frame.uv.push(this.readFloat32());
      }

      frame.prevFrame = this.readInt32();
      animation.frames.push(frame);
    }

    return animation;
  }
}