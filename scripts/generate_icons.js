import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Minimalist modern SVG icon for HeyNote
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#F3F4F6"/>
    </linearGradient>
    <filter id="subtleShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000000" flood-opacity="0.08"/>
    </filter>
  </defs>

  <!-- Squircle Base with Soft Border -->
  <rect x="16" y="16" width="480" height="480" rx="110" fill="url(#bgGrad)" stroke="#E5E7EB" stroke-width="4" filter="url(#subtleShadow)"/>

  <!-- Minimalist HeyNote Emblem: Audio Waveform forming a Note & Mic -->
  <g transform="translate(256, 256)" fill="#111827">
    <!-- Center Mic / Note Capsule -->
    <rect x="-24" y="-70" width="48" height="96" rx="24" fill="#111827" />
    
    <!-- Outer Mic Arc / Cradle -->
    <path d="M -56, -10 C -56, 40 56, 40 56, -10" fill="none" stroke="#111827" stroke-width="14" stroke-linecap="round" />
    <line x1="0" y1="36" x2="0" y2="76" stroke="#111827" stroke-width="14" stroke-linecap="round" />
    <line x1="-36" y1="76" x2="36" y2="76" stroke="#111827" stroke-width="14" stroke-linecap="round" />

    <!-- Left Sound Wave Bars -->
    <rect x="-92" y="-36" width="10" height="72" rx="5" fill="#9CA3AF" />
    <rect x="-124" y="-18" width="10" height="36" rx="5" fill="#D1D5DB" />

    <!-- Right Sound Wave Bars -->
    <rect x="82" y="-36" width="10" height="72" rx="5" fill="#9CA3AF" />
    <rect x="114" y="-18" width="10" height="36" rx="5" fill="#D1D5DB" />

    <!-- Active Dot Indicator (Subtle Emerald) -->
    <circle cx="0" cy="-40" r="6" fill="#10B981" />
  </g>
</svg>`;

// Helper to create pure uncompressed/deflated RGBA PNG using Node zlib
function createPng(width, height) {
  // We draw a crisp minimalist white squircle with dark icon inside
  const bytesPerPixel = 4;
  const rowBytes = width * bytesPerPixel + 1; // +1 filter byte per scanline
  const rawData = Buffer.alloc(height * rowBytes);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.44;
  const cornerR = width * 0.22;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * bytesPerPixel;
      
      // Determine if inside rounded squircle
      const dx = Math.abs(x - cx);
      const dy = Math.abs(y - cy);
      const halfW = width * 0.46;
      const halfH = height * 0.46;

      let inBox = false;
      if (dx <= halfW - cornerR && dy <= halfH) inBox = true;
      else if (dy <= halfH - cornerR && dx <= halfW) inBox = true;
      else {
        const cornerDx = dx - (halfW - cornerR);
        const cornerDy = dy - (halfH - cornerR);
        if (cornerDx * cornerDx + cornerDy * cornerDy <= cornerR * cornerR) {
          inBox = true;
        }
      }

      if (!inBox) {
        // Transparent outside
        rawData[pixelOffset] = 0;
        rawData[pixelOffset + 1] = 0;
        rawData[pixelOffset + 2] = 0;
        rawData[pixelOffset + 3] = 0;
        continue;
      }

      // Inside app icon background: Pure White (#FFFFFF)
      let r = 255;
      let g = 255;
      let b = 255;
      let a = 255;

      // Subtle border
      const distFromEdgeX = halfW - dx;
      const distFromEdgeY = halfH - dy;
      if (distFromEdgeX < 2 || distFromEdgeY < 2) {
        r = 229; g = 231; b = 235;
      }

      // Draw Center Mic Capsule: centered at (cx, cy - height*0.04)
      const micCx = cx;
      const micCy = cy - height * 0.04;
      const micW = width * 0.1;
      const micH = height * 0.2;
      const micR = micW / 2;

      // Mic capsule distance
      const mdx = Math.abs(x - micCx);
      const mdy = Math.abs(y - micCy);
      let inMic = false;
      if (mdx <= micR && mdy <= (micH / 2 - micR)) inMic = true;
      else {
        const cdy = mdy - (micH / 2 - micR);
        if (cdy > 0 && mdx * mdx + cdy * cdy <= micR * micR) inMic = true;
      }

      if (inMic) {
        r = 17; g = 24; b = 39; // #111827 Dark Charcoal
      }

      // Mic Cradle Arc
      const cradleRadius = width * 0.13;
      const distToCenter = Math.sqrt((x - micCx) * (x - micCx) + (y - micCy) * (y - micCy));
      const cradleThickness = Math.max(2, width * 0.026);
      if (y >= micCy - height * 0.02 && y <= micCy + cradleRadius + 2) {
        if (Math.abs(distToCenter - cradleRadius) <= cradleThickness / 2) {
          r = 17; g = 24; b = 39;
        }
      }

      // Mic Stand stem
      if (Math.abs(x - micCx) <= cradleThickness / 2 && y >= micCy + cradleRadius - 2 && y <= cy + height * 0.16) {
        r = 17; g = 24; b = 39;
      }
      // Mic Stand base
      if (Math.abs(x - micCx) <= width * 0.09 && Math.abs(y - (cy + height * 0.16)) <= cradleThickness / 2) {
        r = 17; g = 24; b = 39;
      }

      // Wave bars on left & right
      const waveThickness = Math.max(2, width * 0.02);
      // Left bar 1
      if (Math.abs(x - (cx - width * 0.2)) <= waveThickness / 2 && Math.abs(y - cy) <= height * 0.08) {
        r = 156; g = 163; b = 175; // #9CA3AF
      }
      // Left bar 2
      if (Math.abs(x - (cx - width * 0.28)) <= waveThickness / 2 && Math.abs(y - cy) <= height * 0.04) {
        r = 209; g = 213; b = 219; // #D1D5DB
      }
      // Right bar 1
      if (Math.abs(x - (cx + width * 0.2)) <= waveThickness / 2 && Math.abs(y - cy) <= height * 0.08) {
        r = 156; g = 163; b = 175;
      }
      // Right bar 2
      if (Math.abs(x - (cx + width * 0.28)) <= waveThickness / 2 && Math.abs(y - cy) <= height * 0.04) {
        r = 209; g = 213; b = 219;
      }

      // Active Green dot inside mic top
      const dotDy = y - (micCy - height * 0.06);
      if ((x - micCx) * (x - micCx) + dotDy * dotDy <= (width * 0.016) * (width * 0.016)) {
        r = 16; g = 185; b = 129; // #10B981 Emerald
      }

      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  // PNG File Packaging
  const compressed = zlib.deflateSync(rawData);

  // PNG Header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth
  ihdr[9] = 6; // Color type (RGBA)
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type);
    const crc = crc32(Buffer.concat([typeBuf, data]));
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Simple CRC32 for PNG chunks
function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }

  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

// Write SVG
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);
console.log('Saved public/icon.svg');

// Generate 192x192 PNG
const png192 = createPng(192, 192);
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);
console.log('Saved public/pwa-192x192.png');

// Generate 512x512 PNG
const png512 = createPng(512, 512);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);
console.log('Saved public/pwa-512x512.png');

// Generate Apple Touch Icon 180x180
const appleIcon = createPng(180, 180);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIcon);
console.log('Saved public/apple-touch-icon.png');

// Copy 192 as favicon.ico
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), png192);
console.log('Saved public/favicon.ico');
