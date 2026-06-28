import { ChunkType, RasterFormat, D3DFormat, PlatformID, getChunkName } from "./ChunkType.js";

export class TXDReader {
  constructor() {
    this.data = null;
    this.pos = 0;
    this.len = 0;
  }

  parse(buffer) {
    this.data = new DataView(buffer);
    this.pos = 0;
    this.len = buffer.byteLength;

    const header = this.readHeader();
    if (header.type !== ChunkType.CHUNK_TEXDICTIONARY) {
      throw new Error("Not a valid TXD file");
    }
    return this.readTextureDictionary(header);
  }

  readHeader() {
    const type = this.readU32();
    const length = this.readU32();
    const build = this.readU32();

    let version;
    if (build & 0xFFFF0000) {
      version = (build >> 14 & 0x3FF00) | (build >> 16 & 0x3F) | 0x30000;
    } else {
      version = build << 8;
    }

    return { type, name: getChunkName(type), length, build, version };
  }

  readI32() { return this._read("getInt32", 4); }
  readU32() { return this._read("getUint32", 4); }
  readU16() { return this._read("getUint16", 2); }
  readU8()  { return this._read("getUint8", 1); }
  readF32() { return this._read("getFloat32", 4); }

  _read(method, size) {
    if (this.pos + size > this.len) {
      throw new Error(`TXDReader: Out of bounds at ${this.pos}, length ${this.len}`);
    }
    const value = this.data[method](this.pos, true);
    this.pos += size;
    return value;
  }

  readString(length) {
    length = Math.min(length, this.len - this.pos);
    const end = this.pos + length;
    let str = "";
    while (this.pos < end) {
      const byte = this.data.getUint8(this.pos++);
      if (!byte) break;
      str += String.fromCharCode(byte);
    }
    this.pos = end;
    return str.trim();
  }

  readBytes(count) {
    count = Math.min(count, this.len - this.pos);
    const bytes = new Uint8Array(this.data.buffer, this.pos, count);
    this.pos += count;
    return bytes;
  }

  skip(n) { this.pos += Math.min(n, this.len - this.pos); }

  readTextureDictionary(header) {
    const result = { textures: [], version: header.version, build: header.build };

    if (this.readHeader().type !== ChunkType.CHUNK_STRUCT) {
      throw new Error("Expected struct chunk");
    }

    const textureCount = this.readU16();
    result.deviceId = this.readU16();

    for (let i = 0; i < textureCount; i++) {
      try {
        const tex = this.readTextureNative();
        if (tex) result.textures.push(tex);
      } catch {
        break;
      }
    }

    const remaining = header.length - (this.pos - 12);
    if (remaining > 0) {
      const extHeader = this.readHeader();
      if (extHeader.type === ChunkType.CHUNK_EXTENSION) {
        this.skip(extHeader.length);
      }
    }

    return result;
  }


  readTextureNative() {
    const header = this.readHeader();
    if (header.type !== ChunkType.CHUNK_TEXTURENATIVE) {
      this.skip(header.length);
      return null;
    }

    const chunkEnd = this.pos + header.length;
    const tex = {};

    this.readHeader();
    const platform = this.readU32();
    tex.platform = platform;
    tex.filterFlags = this.readU32();

    tex.nameOffset = this.pos;
    tex.name = this.readString(32);
    tex.maskNameOffset = this.pos;
    tex.maskName = this.readString(32);
    tex.rasterFormat = this.readU32();

    if (platform !== PlatformID.PLATFORM_D3D8 && platform !== PlatformID.PLATFORM_D3D9) {
      this.pos = chunkEnd;
      tex.imageData = null;
      return tex;
    }

    const d3dFormat = this.readU32();
    tex.d3dFormatRaw = d3dFormat;
    tex.d3dFormat = d3dFormat;
    tex.width = this.readU16();
    tex.height = this.readU16();
    tex.depth = this.readU8();
    tex.mipmapCount = this.readU8();
    tex.rasterType = this.readU8();

    if (platform === PlatformID.PLATFORM_D3D9) {
      const alpha = this.readU8();
      tex.alpha = alpha;
      tex.hasAlpha = alpha > 0;
    } else {
      const dxtType = this.readU8();
      tex.alpha = dxtType;
      tex.dxtType = dxtType;
      tex.hasAlpha = d3dFormat !== 0;
      tex.isCompressed = dxtType > 0;

      if (dxtType === 1) tex.d3dFormat = D3DFormat.D3DFMT_DXT1;
      else if (dxtType === 3) tex.d3dFormat = D3DFormat.D3DFMT_DXT3;
      else if (dxtType === 5) tex.d3dFormat = D3DFormat.D3DFMT_DXT5;
    }

    tex.imageData = this.readTextureData(tex);
    tex.originalFormat = this.getFormatName(tex.d3dFormat);

    if (this.pos < chunkEnd) {
      try {
        const ext = this.readHeader();
        if (ext.type === ChunkType.CHUNK_EXTENSION) this.skip(ext.length);
      } catch {}
    }

    this.pos = chunkEnd;
    return tex;
  }

  readTextureData(tex) {
    let palette = null;

    const hasPal8  = (tex.rasterFormat & RasterFormat.FORMAT_EXT_PAL8) !== 0;
    const hasPal4  = (tex.rasterFormat & RasterFormat.FORMAT_EXT_PAL4) !== 0;
    if (hasPal8 || hasPal4) {
      const colorCount = hasPal8 ? 256 : 16;
      palette = new Uint8Array(colorCount * 4);
      for (let i = 0; i < colorCount; i++) {
        palette[i * 4 + 2] = this.readU8(); // R
        palette[i * 4 + 1] = this.readU8(); // G
        palette[i * 4 + 0] = this.readU8(); // B
        palette[i * 4 + 3] = this.readU8(); // A
      }
      tex.palette = palette;
      tex.isPaletted = true;
    } else {
      tex.isPaletted = false;
    }

    const dataSize = this.readU32();
    if (dataSize > this.len - this.pos || dataSize > 100 * 1024 * 1024) return null;

    const rawData = this.readBytes(dataSize);
    tex.rawData = new Uint8Array(rawData);
    tex.rawDataSize = dataSize;
    tex.mipmaps = [];

    if (tex.mipmapCount > 1) {
      for (let i = 1; i < tex.mipmapCount && this.pos + 4 <= this.len; i++) {
        const mipSize = this.readU32();
        if (mipSize > 0 && this.pos + mipSize <= this.len) {
          tex.mipmaps.push({
            size: mipSize,
            data: new Uint8Array(this.readBytes(mipSize))
          });
        }
      }
    }

    const imageData = this.decodeTexture(tex, rawData, palette);
    if (!tex.hasAlpha && imageData) {
      tex.hasAlpha = this.detectAlpha(imageData);
    }
    return imageData;
  }

  detectAlpha(pixels) {
    for (let i = 3; i < pixels.length; i += 64) {
      if (pixels[i] < 255) return true;
    }
    const limit = Math.min(pixels.length / 4, 1000);
    for (let i = 0; i < limit; i++) {
      if (pixels[i * 4 + 3] < 255) return true;
    }
    return false;
  }

  decodeTexture(tex, raw, palette) {
    const w = tex.width, h = tex.height;
    const fmt = tex.d3dFormat;
    const out = new Uint8Array(w * h * 4);

    if (fmt === D3DFormat.D3DFMT_DXT1) return this.decodeDXT1(raw, w, h);
    if (fmt === D3DFormat.D3DFMT_DXT3) return this.decodeDXT3(raw, w, h);
    if (fmt === D3DFormat.D3DFMT_DXT5) return this.decodeDXT5(raw, w, h);

    if (palette) {
      for (let i = 0; i < w * h; i++) {
        const idx = raw[i] * 4;
        out[i * 4 + 0] = palette[idx + 0];
        out[i * 4 + 1] = palette[idx + 1];
        out[i * 4 + 2] = palette[idx + 2];
        out[i * 4 + 3] = palette[idx + 3];
      }
      return out;
    }

    const count = w * h;

    switch (fmt) {
      case D3DFormat.D3DFMT_A8R8G8B8:
      case D3DFormat.D3DFMT_X8R8G8B8:
        for (let i = 0; i < count; i++) {
          out[i * 4 + 0] = raw[i * 4 + 2]; 
          out[i * 4 + 1] = raw[i * 4 + 1]; 
          out[i * 4 + 2] = raw[i * 4 + 0]; 
          out[i * 4 + 3] = fmt === D3DFormat.D3DFMT_A8R8G8B8 ? raw[i * 4 + 3] : 255;
        }
        return out;

      case D3DFormat.D3DFMT_R5G6B5:
        for (let i = 0; i < count; i++) {
          const pixel = raw[i * 2] | raw[i * 2 + 1] << 8;
          out[i * 4 + 0] = ((pixel >> 11) & 0x1F) * 255 / 31;
          out[i * 4 + 1] = ((pixel >> 5)  & 0x3F) * 255 / 63;
          out[i * 4 + 2] = (pixel & 0x1F) * 255 / 31;
          out[i * 4 + 3] = 255;
        }
        return out;

      case D3DFormat.D3DFMT_A1R5G5B5:
      case D3DFormat.D3DFMT_X1R5G5B5:
        for (let i = 0; i < count; i++) {
          const pixel = raw[i * 2] | raw[i * 2 + 1] << 8;
          out[i * 4 + 0] = ((pixel >> 10) & 0x1F) * 255 / 31;
          out[i * 4 + 1] = ((pixel >> 5)  & 0x1F) * 255 / 31;
          out[i * 4 + 2] = (pixel & 0x1F) * 255 / 31;
          out[i * 4 + 3] = (fmt === D3DFormat.D3DFMT_A1R5G5B5 && (pixel >> 15)) ? 255 : 0;
        }
        return out;

      case D3DFormat.D3DFMT_A4R4G4B4:
        for (let i = 0; i < count; i++) {
          const pixel = raw[i * 2] | raw[i * 2 + 1] << 8;
          out[i * 4 + 0] = ((pixel >> 8)  & 0xF) * 17;
          out[i * 4 + 1] = ((pixel >> 4)  & 0xF) * 17;
          out[i * 4 + 2] = (pixel & 0xF) * 17;
          out[i * 4 + 3] = ((pixel >> 12) & 0xF) * 17;
        }
        return out;

      case D3DFormat.D3DFMT_P8:
        return out;
    }

    const rasterFmt = tex.rasterFormat & RasterFormat.FORMAT_MASK;

    if (rasterFmt === RasterFormat.FORMAT_4444 && raw.length === count) {
      for (let i = 0; i < count; i++) {
        out[i * 4 + 0] = 255;
        out[i * 4 + 1] = 255;
        out[i * 4 + 2] = 255;
        out[i * 4 + 3] = raw[i];
      }
      return out;
    }

    if (rasterFmt === RasterFormat.FORMAT_LUM8 && raw.length === count) {
      for (let i = 0; i < count; i++) {
        const lum = raw[i];
        out[i * 4 + 0] = lum;
        out[i * 4 + 1] = lum;
        out[i * 4 + 2] = lum;
        out[i * 4 + 3] = 255;
      }
      return out;
    }

    switch (rasterFmt) {
      case RasterFormat.FORMAT_8888:
      case 0:
        for (let i = 0; i < count; i++) {
          out[i * 4 + 0] = raw[i * 4 + 2];
          out[i * 4 + 1] = raw[i * 4 + 1];
          out[i * 4 + 2] = raw[i * 4 + 0];
          out[i * 4 + 3] = raw[i * 4 + 3];
        }
        break;

      case RasterFormat.FORMAT_888:
        for (let i = 0; i < count; i++) {
          out[i * 4 + 0] = raw[i * 3 + 2];
          out[i * 4 + 1] = raw[i * 3 + 1];
          out[i * 4 + 2] = raw[i * 3 + 0];
          out[i * 4 + 3] = 255;
        }
        break;

      case RasterFormat.FORMAT_565:
        for (let i = 0; i < count; i++) {
          const pixel = raw[i * 2] | raw[i * 2 + 1] << 8;
          out[i * 4 + 0] = ((pixel >> 11) & 0x1F) << 3;
          out[i * 4 + 1] = ((pixel >> 5)  & 0x3F) << 2;
          out[i * 4 + 2] = (pixel & 0x1F) << 3;
          out[i * 4 + 3] = 255;
        }
        break;

      case RasterFormat.FORMAT_1555:
        for (let i = 0; i < count; i++) {
          const pixel = raw[i * 2] | raw[i * 2 + 1] << 8;
          out[i * 4 + 0] = ((pixel >> 10) & 0x1F) << 3;
          out[i * 4 + 1] = ((pixel >> 5)  & 0x1F) << 3;
          out[i * 4 + 2] = (pixel & 0x1F) << 3;
          out[i * 4 + 3] = (pixel >> 15) ? 255 : 0;
        }
        break;

      case RasterFormat.FORMAT_4444:
        for (let i = 0; i < count; i++) {
          const pixel = raw[i * 2] | raw[i * 2 + 1] << 8;
          out[i * 4 + 0] = ((pixel >> 8)  & 0xF) << 4;
          out[i * 4 + 1] = ((pixel >> 4)  & 0xF) << 4;
          out[i * 4 + 2] = (pixel & 0xF) << 4;
          out[i * 4 + 3] = ((pixel >> 12) & 0xF) << 4;
        }
        break;

      default:
        if (raw.length >= count * 4) {
          for (let i = 0; i < count; i++) {
            out[i * 4 + 0] = raw[i * 4 + 2];
            out[i * 4 + 1] = raw[i * 4 + 1];
            out[i * 4 + 2] = raw[i * 4 + 0];
            out[i * 4 + 3] = raw[i * 4 + 3];
          }
        } else {
          out.fill(128);
        }
    }

    return out;
  }

  decodeDXT1(data, width, height) {
    const output = new Uint8Array(width * height * 4);
    const blocksW = Math.max(1, (width + 3) >> 2);
    const blocksH = Math.max(1, (height + 3) >> 2);
    let offset = 0;

    for (let by = 0; by < blocksH; by++) {
      for (let bx = 0; bx < blocksW; bx++) {
        const color0 = data[offset] | data[offset + 1] << 8;
        const color1 = data[offset + 2] | data[offset + 3] << 8;
        offset += 4;

        const palette = this.dxt1Colors(color0, color1);
        const indices = data[offset] | data[offset + 1] << 8 | data[offset + 2] << 16 | data[offset + 3] << 24;
        offset += 4;

        for (let y = 0; y < 4; y++) {
          for (let x = 0; x < 4; x++) {
            const px = bx * 4 + x, py = by * 4 + y;
            if (px >= width || py >= height) continue;

            const colorIdx = (indices >> ((y * 4 + x) * 2)) & 3;
            const color = palette[colorIdx];
            const dst = (py * width + px) * 4;
            output[dst + 0] = color[0];
            output[dst + 1] = color[1];
            output[dst + 2] = color[2];
            output[dst + 3] = color[3];
          }
        }
      }
    }
    return output;
  }

  dxt1Colors(c0, c1, useFourColors = false) {
    const colors = [];
    const r0 = c0 >> 11 & 0x1F, g0 = c0 >> 5 & 0x3F, b0 = c0 & 0x1F;
    const r1 = c1 >> 11 & 0x1F, g1 = c1 >> 5 & 0x3F, b1 = c1 & 0x1F;

    colors[0] = [r0 << 3 | r0 >> 2, g0 << 2 | g0 >> 4, b0 << 3 | b0 >> 2, 255];
    colors[1] = [r1 << 3 | r1 >> 2, g1 << 2 | g1 >> 4, b1 << 3 | b1 >> 2, 255];

    if (c0 > c1 || useFourColors) {
      colors[2] = [
        Math.floor((colors[0][0] * 2 + colors[1][0]) / 3),
        Math.floor((colors[0][1] * 2 + colors[1][1]) / 3),
        Math.floor((colors[0][2] * 2 + colors[1][2]) / 3),
        255
      ];
      colors[3] = [
        Math.floor((colors[0][0] + colors[1][0] * 2) / 3),
        Math.floor((colors[0][1] + colors[1][1] * 2) / 3),
        Math.floor((colors[0][2] + colors[1][2] * 2) / 3),
        255
      ];
    } else {
      colors[2] = [
        Math.floor((colors[0][0] + colors[1][0]) / 2),
        Math.floor((colors[0][1] + colors[1][1]) / 2),
        Math.floor((colors[0][2] + colors[1][2]) / 2),
        255
      ];
      colors[3] = [0, 0, 0, 0];
    }
    return colors;
  }

  decodeDXT3(data, width, height) {
    const output = new Uint8Array(width * height * 4);
    const blocksW = Math.max(1, (width + 3) >> 2);
    const blocksH = Math.max(1, (height + 3) >> 2);
    let offset = 0;

    for (let by = 0; by < blocksH; by++) {
      for (let bx = 0; bx < blocksW; bx++) {
        const alphaData = [];
        for (let i = 0; i < 8; i++) alphaData.push(data[offset++]);

        const color0 = data[offset] | data[offset + 1] << 8;
        const color1 = data[offset + 2] | data[offset + 3] << 8;
        offset += 4;

        const palette = this.dxt1Colors(color0, color1, true);
        const indices = data[offset] | data[offset + 1] << 8 | data[offset + 2] << 16 | data[offset + 3] << 24;
        offset += 4;

        for (let y = 0; y < 4; y++) {
          for (let x = 0; x < 4; x++) {
            const px = bx * 4 + x, py = by * 4 + y;
            if (px >= width || py >= height) continue;

            const idx = y * 4 + x;
            const colorIdx = (indices >> (idx * 2)) & 3;
            const color = palette[colorIdx];
            const alpha = (alphaData[idx >> 1] >> ((idx & 1) ? 4 : 0) & 0xF) * 17;

            const dst = (py * width + px) * 4;
            output[dst + 0] = color[0];
            output[dst + 1] = color[1];
            output[dst + 2] = color[2];
            output[dst + 3] = alpha;
          }
        }
      }
    }
    return output;
  }

  decodeDXT5(data, width, height) {
    const output = new Uint8Array(width * height * 4);
    const blocksW = Math.max(1, (width + 3) >> 2);
    const blocksH = Math.max(1, (height + 3) >> 2);
    let offset = 0;

    for (let by = 0; by < blocksH; by++) {
      for (let bx = 0; bx < blocksW; bx++) {
        const alpha0 = data[offset++];
        const alpha1 = data[offset++];

        const alphaIndices = [];
        for (let i = 0; i < 6; i++) alphaIndices.push(data[offset++]);

        const alphas = this.dxt5Alphas(alpha0, alpha1);

        const color0 = data[offset] | data[offset + 1] << 8;
        const color1 = data[offset + 2] | data[offset + 3] << 8;
        offset += 4;

        const palette = this.dxt1Colors(color0, color1, true);
        const indices = data[offset] | data[offset + 1] << 8 | data[offset + 2] << 16 | data[offset + 3] << 24;
        offset += 4;

        for (let y = 0; y < 4; y++) {
          for (let x = 0; x < 4; x++) {
            const px = bx * 4 + x, py = by * 4 + y;
            if (px >= width || py >= height) continue;

            const idx = y * 4 + x;
            const colorIdx = (indices >> (idx * 2)) & 3;
            const color = palette[colorIdx];

            const bitPos = idx * 3;
            const bytePos = bitPos >> 3;
            const shift = bitPos & 7;
            const alphaIdx = shift <= 5
              ? (alphaIndices[bytePos] >> shift) & 7
              : ((alphaIndices[bytePos] >> shift) | (alphaIndices[bytePos + 1] << (8 - shift))) & 7;

            const dst = (py * width + px) * 4;
            output[dst + 0] = color[0];
            output[dst + 1] = color[1];
            output[dst + 2] = color[2];
            output[dst + 3] = alphas[alphaIdx];
          }
        }
      }
    }
    return output;
  }

  dxt5Alphas(a0, a1) {
    const alphas = [a0, a1];
    if (a0 > a1) {
      for (let i = 1; i <= 6; i++) {
        alphas.push(Math.floor(((7 - i) * a0 + i * a1) / 7));
      }
    } else {
      for (let i = 1; i <= 4; i++) {
        alphas.push(Math.floor(((5 - i) * a0 + i * a1) / 5));
      }
      alphas.push(0, 255);
    }
    return alphas;
  }

  getFormatName(format) {
    switch (format) {
      case D3DFormat.D3DFMT_DXT1: return "dxt1";
      case D3DFormat.D3DFMT_DXT3: return "dxt3";
      case D3DFormat.D3DFMT_DXT5: return "dxt5";
      case D3DFormat.D3DFMT_A8R8G8B8:
      case D3DFormat.D3DFMT_X8R8G8B8: return "rgba";
      case D3DFormat.D3DFMT_R5G6B5:
      case D3DFormat.D3DFMT_A1R5G5B5:
      case D3DFormat.D3DFMT_X1R5G5B5:
      case D3DFormat.D3DFMT_A4R4G4B4: return "rgb16";
      case D3DFormat.D3DFMT_P8: return "pal8";
      default: return "rgba";
    }
  }
}