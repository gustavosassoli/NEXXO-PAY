import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

// CRC32 implementation
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  typeBuf.copy(chunk, 4);
  data.copy(chunk, 8);
  const crc = crc32(Buffer.concat([typeBuf, data]));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function createPNG(width, height, getPixel) {
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    signature,
    createChunk('IHDR', ihdr),
    createChunk('IDAT', compressed),
    createChunk('IEND', Buffer.alloc(0)),
  ]);
}

// Distance from point to rounded rectangle
function sdRoundedRect(px, py, halfW, halfH, radius) {
  const qx = Math.abs(px) - halfW + radius;
  const qy = Math.abs(py) - halfH + radius;
  const extDist = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
  const intDist = Math.min(Math.max(qx, qy), 0);
  return extDist + intDist - radius;
}

// Distance from point to rotated capsule/bar
function sdCapsule(px, py, len, radius) {
  const clampedX = Math.max(-len / 2, Math.min(len / 2, px));
  return Math.hypot(px - clampedX, py) - radius;
}

function generateIcon(size, options = {}) {
  const { isMaskable = false } = options;
  const cx = size / 2;
  const cy = size / 2;

  // Dimensões do símbolo central da NEXO
  // No maskable, deve caber na zona de segurança central de 80% (diâmetro 0.8 * size)
  const symbolScale = isMaskable ? 0.58 : 0.65;
  const symbolSize = size * symbolScale;
  const cornerRadius = symbolSize * 0.33;
  const halfSymbol = symbolSize / 2;

  // Ângulo de rotação das duas barras (42 graus)
  const angleRad = (42 * Math.PI) / 180;
  const cosA = Math.cos(angleRad);
  const sinA = Math.sin(angleRad);

  // Parâmetros das barras internas
  const barLen = symbolSize * 0.72;
  const barRadius = symbolSize * 0.095;
  const barOffsetY = symbolSize * 0.155;

  // Cores
  const bg = [11, 16, 32, 255]; // #0B1020
  const accent = [54, 224, 181, 255]; // #36E0B5

  return createPNG(size, size, (x, y) => {
    const dx = x + 0.5 - cx;
    const dy = y + 0.5 - cy;

    // Distância até o retângulo arredondado do símbolo
    const dSymbol = sdRoundedRect(dx, dy, halfSymbol, halfSymbol, cornerRadius);

    if (dSymbol <= 0) {
      // Ponto está dentro do quadrado arredondado verde
      // Testa se está dentro das duas barras em #0B1020
      // Rotação inversa para o espaço local das barras
      const rotX = cosA * dx + sinA * dy;
      const rotY = -sinA * dx + cosA * dy;

      // Barra superior: deslocada em rotY = -barOffsetY
      const dBar1 = sdCapsule(rotX, rotY + barOffsetY, barLen, barRadius);
      // Barra inferior: deslocada em rotY = +barOffsetY
      const dBar2 = sdCapsule(rotX, rotY - barOffsetY, barLen, barRadius);

      if (dBar1 <= 0 || dBar2 <= 0) {
        return bg;
      }
      return accent;
    }

    // Fundo do app
    return bg;
  });
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Gera os 4 ícones exigidos
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generateIcon(192));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generateIcon(512));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), generateIcon(512, { isMaskable: true }));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generateIcon(180));

console.log('PWA icons generated successfully in public/');
