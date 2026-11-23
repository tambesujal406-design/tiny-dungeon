// Validates every room in index.html and proves each one can be solved
// without taking damage (breadth-first search over the whole game state).
// Usage: node scripts/check-levels.mjs
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const match = html.match(/const LV=(\[[\s\S]*?\]\]);/);
if (!match) {
  console.error('Could not find the LV level array in index.html');
  process.exit(1);
}
const LV = new Function(`return ${match[1]}`)();
const N = 9;
const sign = Math.sign;
let failed = false;

function solve(rows) {
  const map = rows.map((r) => [...r]);
  let start;
  const mons = [];
  map.forEach((r, y) =>
    r.forEach((ch, x) => {
      if (ch === '@') { start = { x, y }; r[x] = '.'; }
      else if ('hvc'.includes(ch)) { mons.push({ x, y, t: ch, d: 1 }); r[x] = '.'; }
      else if (ch === '+') r[x] = '.';
    })
  );
  const free = (x, y) => map[y][x] !== '#' && map[y][x] !== 'D';

  function stepM(m, pl, turn) {
    if (m.t === 'c') {
      if (turn % 2) return;
      const dx = pl.x - m.x, dy = pl.y - m.y;
      const o = Math.abs(dx) >= Math.abs(dy)
        ? [[sign(dx), 0], [0, sign(dy)]]
        : [[0, sign(dy)], [sign(dx), 0]];
      for (const [a, b] of o) {
        if ((a || b) && free(m.x + a, m.y + b)) { m.x += a; m.y += b; return; }
      }
      return;
    }
    const h = m.t === 'h';
    const sx = h ? m.d : 0, sy = h ? 0 : m.d;
    if (free(m.x + sx, m.y + sy)) { m.x += sx; m.y += sy; }
    else {
      m.d = -m.d;
      const tx = h ? m.d : 0, ty = h ? 0 : m.d;
      if (free(m.x + tx, m.y + ty)) { m.x += tx; m.y += ty; }
    }
  }

  const keyOf = (s) =>
    `${s.x},${s.y},${s.key},${s.turn % 2},` + s.mons.map((m) => `${m.x}.${m.y}.${m.d}`).join(';');
  const first = { x: start.x, y: start.y, key: false, turn: 0, mons, steps: 0 };
  const seen = new Set([keyOf(first)]);
  const queue = [first];
  const moves = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]];

  while (queue.length) {
    const s = queue.shift();
    for (const [dx, dy] of moves) {
      let { x, y, key } = s;
      const ox = x, oy = y;
      if (dx || dy) {
        const nx = x + dx, ny = y + dy, t = map[ny][nx];
        if (t === 'D' && key) return s.steps + 1;
        if (t !== '#' && t !== 'D') { x = nx; y = ny; if (t === 'k') key = true; }
      }
      const next = s.mons.map((m) => ({ ...m }));
      if (next.some((m) => m.x === x && m.y === y)) continue;
      const turn = s.turn + 1;
      const old = next.map((m) => ({ x: m.x, y: m.y }));
      next.forEach((m) => stepM(m, { x, y }, turn));
      const hit = next.some((m, i) =>
        (m.x === x && m.y === y) || (m.x === ox && m.y === oy && old[i].x === x && old[i].y === y));
      if (hit) continue;
      const ns = { x, y, key, turn, mons: next, steps: s.steps + 1 };
      const k = keyOf(ns);
      if (!seen.has(k)) { seen.add(k); queue.push(ns); }
    }
  }
  return null;
}

LV.forEach((rows, i) => {
  const name = `Room ${i + 1}`;
  const flat = rows.join('');
  const errors = [];
  if (rows.length !== N) errors.push(`needs ${N} rows, has ${rows.length}`);
  rows.forEach((r, j) => {
    if (r.length !== N) errors.push(`row ${j + 1} needs ${N} columns, has ${r.length}`);
  });
  const count = (c) => [...flat].filter((ch) => ch === c).length;
  if (count('@') !== 1) errors.push('needs exactly one @ (player start)');
  if (count('D') !== 1) errors.push('needs exactly one D (door)');
  if (count('k') !== 1) errors.push('needs exactly one k (key)');
  if (!errors.length) {
    const steps = solve(rows);
    if (steps === null) errors.push('cannot be solved without taking damage');
    else console.log(`ok   ${name}: solvable in ${steps} turns`);
  }
  if (errors.length) {
    failed = true;
    console.error(`FAIL ${name}: ${errors.join('; ')}`);
  }
});

process.exit(failed ? 1 : 0);
