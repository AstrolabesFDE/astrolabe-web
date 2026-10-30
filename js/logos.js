/* Símbolos de Astrolabes: las veinte propuestas finalistas (astrolabe-simbolos.html).
   Dos familias: «Astro» (astrolabio en trazo 8) y «A con mar» (grosor ×1,17).
   Cada símbolo se dibuja con currentColor, así que toma el color del texto donde se use. */
(function (root) {
  const f = v => (+v).toFixed(2);

  /* ---------- familia Astro ---------- */
  const D = (cy, r) => `<circle cy="${cy}" r="${r}" fill="currentColor" stroke="none"/>`;
  const Lg = '<path d="M-24 24 L0 -34 L24 24"/>',
    Lflat = '<path d="M-24 24 L-3.3 -26 L3.3 -26 L24 24"/>',
    C = '<circle r="34"/>';
  const T8 = C + '<circle cy="-13" r="21"/>',
    U8 = '<circle cy="-42" r="8"/>',
    TR8 = '<path d="M-10 -32.5 L-6 -41 L6 -41 L10 -32.5"/><circle cy="-49" r="8"/>';
  const SP = '<path d="M0 13 Q1.2 19 8 20 Q1.2 21 0 27 Q-1.2 21 -8 20 Q-1.2 19 0 13 Z" fill="currentColor" stroke="none"/>';
  const astro = {
    1: T8 + Lflat + U8, 2: T8 + Lg + TR8, 3: C + Lg + TR8, 4: T8 + U8 + D(20, 5), 5: T8 + TR8 + D(20, 5),
    6: T8 + U8 + D(0, 4), 7: T8 + U8 + '<circle r="8"/>', 8: T8 + U8 + SP, 9: T8 + U8 + '<circle cy="15" r="7"/>', 10: T8 + TR8 + SP
  };
  const astroName = {
    1: 'A unida', 2: 'A con trono', 3: 'A sin eclíptica', 4: 'Tangente unida', 5: 'Tangente con trono',
    6: 'Eje centrado', 7: 'Eje tangente interior', 8: 'Destello', 9: 'Anillo colgado', 10: 'Destello con trono'
  };

  /* ---------- familia A con mar ---------- */
  const norm = v => { const l = Math.hypot(v[0], v[1]); return [v[0] / l, v[1] / l]; };
  function X(p1, d1, p2, d2) {
    const den = d1[0] * d2[1] - d1[1] * d2[0];
    const t = ((p2[0] - p1[0]) * d2[1] - (p2[1] - p1[1]) * d2[0]) / den;
    return [p1[0] + t * d1[0], p1[1] + t * d1[1]];
  }
  function A(wl, wr) {
    const ax = 100, ay = 46, xl = 64, xr = 140, by = 130, cut = 9;
    const dL = [ax - xl, ay - by], dR = [ax - xr, ay - by];
    const nL = norm([-dL[1], dL[0]]), nR = norm([dR[1], -dR[0]]);
    const Lo = [xl, by], Ro = [xr, by];
    const Li = [xl + nL[0] * wl, by + nL[1] * wl], Ri = [xr + nR[0] * wr, by + nR[1] * wr];
    const n = X(Li, dL, Ri, dR), lf = X(Li, dL, [0, by], [1, 0]), rf = X(Ri, dR, [0, by], [1, 0]);
    const a = X(Lo, dL, [0, ay + cut], [1, 0]), b = X(Ro, dR, [0, ay + cut], [1, 0]);
    return `<path d="M${f(a[0])} ${f(a[1])} L${f(b[0])} ${f(b[1])} L${xr} ${by} L${f(rf[0])} ${by} L${f(n[0])} ${f(n[1])} L${f(lf[0])} ${by} L${xl} ${by} Z"/>`;
  }
  const ring = rw => `<circle cx="100.2" cy="${f(55 - 7 - rw / 2 + 2)}" r="7" fill="none" stroke="currentColor" stroke-width="${f(rw)}"/>`;
  function W(o) {
    const { x0 = 58, x1 = 148, y = 152, a = 8, t = 7, cyc = 1, prof = 'taper', tilt = 3, N = 120 } = o;
    const up = [], lo = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N, x = x0 + u * (x1 - x0);
      const yc = y - a * Math.sin(2 * Math.PI * cyc * u) - tilt * (u - 0.5);
      const th = prof === 'taper' ? t * Math.pow(Math.sin(Math.PI * u), 0.75) : t;
      up.push(`${f(x)} ${f(yc - th / 2)}`); lo.unshift(`${f(x)} ${f(yc + th / 2)}`);
    }
    return `<path d="M${up.join(' L')} L${lo.join(' L')} Z"/>`;
  }
  const H = o => W(Object.assign({ prof: 'flat', tilt: 0 }, o));
  function stack(ts, gap, base, o = {}) {
    const tot = ts.reduce((s, v) => s + v, 0) + gap * (ts.length - 1);
    let y = base - tot / 2, out = '';
    ts.forEach(t => { out += H(Object.assign({}, o, { y: y + t / 2, t })); y += t + gap; });
    return out;
  }
  function garland(off, w) {
    const fl = 1.5, c = (90 - 3 * fl) / 4, s = 0.32 * c, r = (c * c / 4 + s * s) / (2 * s);
    const st1 = [0, 1, 2, 3].map(i => 58 + i * (c + fl));
    const G = (starts, y) => {
      let d = `M${f(starts[0])} ${y}`;
      starts.forEach((x, i) => { if (i > 0) d += ` L${f(x)} ${y}`; d += ` A${f(r)} ${f(r)} 0 0 0 ${f(x + c)} ${y}`; });
      return `<path d="${d}" fill="none" stroke="currentColor" stroke-width="${f(w)}" stroke-linecap="butt" stroke-linejoin="miter"/>`;
    };
    const st2 = off ? [0, 1, 2].map(i => st1[i] + c + fl / 2 - c / 2) : st1;
    return G(st1, 143) + G(st2, 161);
  }
  const cx = 102, cy = 64, r0 = 80;
  const circ = r => `M${cx + r} ${cy} A${r} ${r} 0 1 0 ${cx - r} ${cy} A${r} ${r} 0 1 0 ${cx + r} ${cy} Z `;
  const yb = 210, xL = 64 - (yb - 130) * 36 / 84, xR = 140 + (yb - 130) * 40 / 84;
  function rockers(n, t, uid) {
    const gap = 3.5; let d = '';
    for (let i = 0; i < n; i++) { const ri = r0 + i * (t + gap); d += circ(ri + t) + circ(ri); }
    return `<defs><clipPath id="${uid}"><path d="M100 46 L${f(xR)} ${yb} L${f(xL)} ${yb} Z"/></clipPath></defs><path d="${d}" fill-rule="evenodd" clip-path="url(#${uid})"/>`;
  }
  const k = 1.17, T = 5.6 * k;
  const alog = {
    1: ['Ola ancha', () => W({ t: 12 * k }), 0],
    2: ['Cinta gruesa', () => W({ t: 11 * k, prof: 'flat', y: 153 }), 0],
    3: ['Cinta con anilla', () => W({ t: 11 * k, prof: 'flat', y: 153 }), 4.5 * k],
    4: ['Tres ondas', () => stack([T, T, T], 3.5, 153, { cyc: 2, a: 4 }), 0],
    5: ['Dos ondas', () => stack([6 * k, 6 * k], 4, 152, { cyc: 2, a: 4.5 }), 0],
    6: ['Dos ondas con anilla', () => stack([6 * k, 6 * k], 4, 152, { cyc: 2, a: 4.5 }), 4.5 * k],
    7: ['Guirnalda alineada', () => garland(false, T), 0],
    8: ['Guirnalda desfasada', () => garland(true, T), 0],
    9: ['Guirnalda con anilla', () => garland(true, T), T],
    10: ['Dos rockers', uid => rockers(2, 7 * k, uid), 0]
  };
  const AL = A(5.6 * k, 15 * k);

  /* ---------- catálogo ---------- */
  // Mismo orden que en la hoja de propuestas: cada símbolo junto a sus variantes más parecidas.
  const ASTRO_ORDER = [3, 2, 1, 5, 10, 8, 4, 9, 7, 6];
  const AMAR_ORDER = [1, 2, 3, 6, 5, 4, 7, 8, 9, 10];
  let seq = 0;

  const list = [
    ...ASTRO_ORDER.map(n => ({
      id: `astro-${n}`, family: 'Astrolabio', code: `Astro ${n}`, name: astroName[n],
      svg: (label = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-50 -70 100 114"${label ? ` role="img" aria-label="${label}"` : ' aria-hidden="true"'}><g fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="butt" stroke-linejoin="miter">${astro[n]}</g></svg>`
    })),
    ...AMAR_ORDER.map(n => ({
      id: `a-${n}`, family: 'A con mar', code: `A ${n}`, name: alog[n][0],
      svg: (label = '') => {
        const uid = `rk${n}-${++seq}`;
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="30 24 150 156"${label ? ` role="img" aria-label="${label}"` : ' aria-hidden="true"'}><g fill="currentColor">${alog[n][2] ? ring(alog[n][2]) : ''}${AL}${alog[n][1](uid)}</g></svg>`;
      }
    }))
  ];

  const api = {
    list,
    DEFAULT: 'astro-6',
    get: id => list.find(l => l.id === id) || list.find(l => l.id === api.DEFAULT)
  };
  root.AstrolabesLogos = api;
})(window);
