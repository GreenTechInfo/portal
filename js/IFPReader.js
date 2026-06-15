export class IFPReader {
  constructor() {
    this.data = null;
    this.pos = 0;
    this.len = 0;
  }

  parse(buf) {
    this.data = new DataView(buf);
    this.pos = 0;
    this.len = buf.byteLength;

    const magic = this.peekStr(4);
    if (magic === "ANP3") return this.parseANP3();
    if (magic === "ANPK") return this.parseANPK();
    throw new Error("Unknown IFP format: " + magic);
  }

  // ─── ANP3 (GTA III / Vice City) ────────────────────────────

  parseANP3() {
    this.skip(8); // magic + fileSize
    const name = this.readStr(24);
    const objCount = this.readI32();
    const anims = [];

    for (let i = 0; i < objCount; i++) {
      const obj = this.parseANP3Object();
      if (obj) anims.push(obj);
    }
    return { version: "ANP3", name, animations: anims };
  }

  parseANP3Object() {
    const name = this.readStr(24);
    const boneCount = this.readI32();
    this.skip(8); // field_1, flags
    const bones = [];

    for (let i = 0; i < boneCount; i++) {
      const boneName = this.readStr(24);
      const boneFlags = this.readI32();
      const frameCount = this.readI32();
      const boneId = this.readI32();
      const isRoot = boneFlags === 4;
      const keyframes = [];

      for (let j = 0; j < frameCount; j++) {
        let qx = this.readI16() / 4096,
            qy = this.readI16() / 4096,
            qz = this.readI16() / 4096,
            qw = this.readI16() / 4096;
        const time = this.readI16() / 60;

        const len = Math.hypot(qx, qy, qz, qw);
        if (len > 1e-4) { qx /= len; qy /= len; qz /= len; qw /= len; }

        const kf = { time, rotation: { x: qx, y: qy, z: qz, w: qw } };
        if (isRoot) {
          kf.position = {
            x: this.readI16() / 1024,
            y: this.readI16() / 1024,
            z: this.readI16() / 1024
          };
        }
        keyframes.push(kf);
      }
      bones.push({ name: boneName, boneId, isRoot, keyframes });
    }
    return { name, bones };
  }

  // ─── ANPK (GTA San Andreas) ────────────────────────────────

  parseANPK() {
    this.skip(12); // magic, version, subHeader, padding
    const animCount = this.readI32();
    const name = this.readPaddedStr();
    const anims = [];

    for (let i = 0; i < animCount; i++) {
      const anim = this.parseANPKAnim();
      if (anim) anims.push(anim);
    }
    return { version: "ANPK", name, animations: anims };
  }

  parseANPKAnim() {
    this.skip(8); // header + size
    const name = this.readPaddedStr();
    this.skip(4); // subHeader
    const boneEnd = this.pos + this.readU32();
    this.skip(4); // keyframeHeader
    const kfStart = this.pos + this.readU32();

    this.pos = kfStart;
    const boneCount = this.readI32();
    const bones = [];

    for (let i = 0; i < boneCount; i++) {
      const bone = this.parseANPKBone();
      if (bone) bones.push(bone);
    }
    this.pos = boneEnd;
    return { name, bones };
  }

  parseANPKBone() {
    if (this.pos + 8 > this.len) throw new Error("EOF at " + this.pos);

    const tag = this.readStr(4);
    const end = this.pos + this.readU32();

    if (tag !== "CPAN") {
      console.warn("Expected CPAN, got", tag, "at", this.pos - 8);
      this.pos = end;
      return null;
    }

    this.skip(4); // subHeader
    const kfInfoEnd = this.pos + this.readU32();
    const name = this.readStr(28);
    const frameCount = this.readI32();
    this.skip(8); // boneIdField, flags
    const boneId = kfInfoEnd - this.pos >= 44 ? this.readI32() : undefined;

    this.pos = kfInfoEnd;
    const keyframes = [];
    let isRoot = false;

    if (this.pos >= end) return { name, boneId, isRoot, keyframes };

    const kfTag = this.readStr(4);
    const kfEnd = Math.min(this.pos + this.readU32(), end);

    if (kfTag === "KRT0" || kfTag === "KRTS") {
      isRoot = true;
      const hasScale = kfTag === "KRTS";
      const stride = 32 + (hasScale ? 12 : 0); // rot(16) + pos(12) + time(4) [+ scale(12)]

      for (let i = 0; i < frameCount && this.pos + stride <= kfEnd; i++) {
        const kf = {
          rotation: { x: -this.readF32(), y: -this.readF32(), z: -this.readF32(), w: this.readF32() },
          position: { x: this.readF32(), y: this.readF32(), z: this.readF32() }
        };
        if (hasScale) kf.scale = { x: this.readF32(), y: this.readF32(), z: this.readF32() };
        kf.time = this.readF32();
        keyframes.push(kf);
      }
    } else if (kfTag === "KR00") {
      for (let i = 0; i < frameCount && this.pos + 20 <= kfEnd; i++) {
        keyframes.push({
          rotation: { x: -this.readF32(), y: -this.readF32(), z: -this.readF32(), w: this.readF32() },
          time: this.readF32()
        });
      }
    } else {
      console.warn("Unknown keyframe format:", kfTag, "for bone", name);
    }

    this.pos = end;
    return { name, boneId, isRoot, keyframes };
  }

  // ─── Примитивы чтения ──────────────────────────────────────

  peekStr(n) {
    let s = "";
    for (let i = 0; i < n; i++) s += String.fromCharCode(this.data.getUint8(this.pos + i));
    return s;
  }

  readStr(n) {
    let s = "";
    const end = this.pos + n;
    while (this.pos < end) {
      const b = this.data.getUint8(this.pos++);
      if (!b) break;
      s += String.fromCharCode(b);
    }
    this.pos = end;
    return s.trim();
  }

  readPaddedStr() {
    let s = "";
    while (this.pos < this.len) {
      const b = this.data.getUint8(this.pos++);
      if (!b) { while (this.pos % 4) this.pos++; break; }
      s += String.fromCharCode(b);
    }
    return s.trim();
  }

  skip(n) { this.pos += n; }

  readI16() { const v = this.data.getInt16(this.pos, true); this.pos += 2; return v; }
  readI32() { const v = this.data.getInt32(this.pos, true); this.pos += 4; return v; }
  readU32() { const v = this.data.getUint32(this.pos, true); this.pos += 4; return v; }
  readF32() { const v = this.data.getFloat32(this.pos, true); this.pos += 4; return v; }
}