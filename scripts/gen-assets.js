// scripts/gen-assets.js
// Generates valid placeholder PNG assets for Expo.
// Run once: node scripts/gen-assets.js
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

function makePNG(width, height, r, g, b) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  const rawRows = [];
  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(1 + width * 3);
    row[0] = 0;
    for (let x = 0; x < width; x++) {
      row[1 + x * 3] = r;
      row[2 + x * 3] = g;
      row[3 + x * 3] = b;
    }
    rawRows.push(row);
  }
  const idat = zlib.deflateSync(Buffer.concat(rawRows));

  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let k = n;
    for (let i = 0; i < 8; i++) k = (k & 1) ? (0xEDB88320 ^ (k >>> 1)) : (k >>> 1);
    crcTable[n] = k;
  }
  function crc32(buf) {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  function chunk(type, data) {
    const t = Buffer.from(type, 'ascii');
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([t, data]);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(body));
    return Buffer.concat([len, body, crcBuf]);
  }

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const base = path.join(__dirname, '..', 'assets');
fs.mkdirSync(base, { recursive: true });

const indigo = makePNG(1024, 1024, 79, 70, 229);   // #4F46E5
const white  = makePNG(1024, 1024, 255, 255, 255);  // #FFFFFF

fs.writeFileSync(path.join(base, 'icon.png'), indigo);
fs.writeFileSync(path.join(base, 'splash.png'), white);
fs.writeFileSync(path.join(base, 'adaptive-icon.png'), indigo);
fs.writeFileSync(path.join(base, 'favicon.png'), indigo);

console.log('Assets generated in assets/');
