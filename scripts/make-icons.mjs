// public/icon.svg と同じ絵柄の PNG アイコンを作る（外部ツールなし）
// 使い方: node scripts/make-icons.mjs
import { writeFileSync } from 'node:fs'
import { deflateSync } from 'node:zlib'

const hex = (h) => [1, 3, 5].map((i) => Number.parseInt(h.slice(i, i + 2), 16))
const GROUND = hex('#FBF6EC')
const SUN = hex('#F2B33D')
const MOUNTAIN = hex('#2A62C9')
const SNOW = hex('#FFFFFF')
const LINE = hex('#C63A20')

function inTriangle(px, py, [a, b, c]) {
  const s = (p1, p2, p3) => (p1[0] - p3[0]) * (p2[1] - p3[1]) - (p2[0] - p3[0]) * (p1[1] - p3[1])
  const p = [px, py]
  const d1 = s(p, a, b)
  const d2 = s(p, b, c)
  const d3 = s(p, c, a)
  const neg = d1 < 0 || d2 < 0 || d3 < 0
  const pos = d1 > 0 || d2 > 0 || d3 > 0
  return !(neg && pos)
}

// 512 基準の座標（maskable でも欠けないよう全面を背景色で塗る）
function colorAt(x, y) {
  if (y >= 416 && y <= 432 && x >= 40 && x <= 472) return LINE
  const snow = [
    [
      [256, 120],
      [207, 194],
      [305, 194],
    ],
  ]
  if (y <= 206 && snow.some((t) => inTriangle(x, y, t))) return SNOW
  if (
    inTriangle(x, y, [
      [56, 420],
      [256, 120],
      [456, 420],
    ])
  )
    return MOUNTAIN
  if ((x - 360) ** 2 + (y - 170) ** 2 <= 62 ** 2) return SUN
  return GROUND
}

function crc32(buf) {
  let c
  const table = []
  for (let n = 0; n < 256; n++) {
    c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  let crc = 0xffffffff
  for (const b of buf) crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const td = Buffer.concat([Buffer.from(type), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(td))
  return Buffer.concat([len, td, crc])
}

function png(size) {
  const ss = 3 // 3x3 のスーパーサンプリングでふちをなめらかに
  const raw = Buffer.alloc((size * 3 + 1) * size)
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0
    for (let x = 0; x < size; x++) {
      const acc = [0, 0, 0]
      for (let sy = 0; sy < ss; sy++)
        for (let sx = 0; sx < ss; sx++) {
          const c = colorAt(((x + (sx + 0.5) / ss) * 512) / size, ((y + (sy + 0.5) / ss) * 512) / size)
          for (let i = 0; i < 3; i++) acc[i] += c[i]
        }
      const o = y * (size * 3 + 1) + 1 + x * 3
      for (let i = 0; i < 3; i++) raw[o + i] = Math.round(acc[i] / (ss * ss))
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8
  ihdr[9] = 2
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

for (const size of [192, 512]) {
  writeFileSync(new URL(`../public/icon-${size}.png`, import.meta.url), png(size))
  console.log(`public/icon-${size}.png`)
}
