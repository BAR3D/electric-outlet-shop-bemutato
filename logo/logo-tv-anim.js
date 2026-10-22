/* Electric Outlet Shop – animált TV-logó.
   A logó maga a TV: a képernyőjén a felirat izzó pontokból áll össze, megáll egy fénycsíkkal, szétesik, és újrakezdi (loop).
   Használat: EOLogoTV.mount(canvas, { frame: 'logo/logo-tv-frame.svg', full: 'logo/logo-tv.svg' }) – a canvas mérete a CSS-ből jön. */
(function () {
  'use strict';
  const VBW = 640, VBH = 290, SCR = { x: 14, y: 14, w: 612, h: 204, r: 22 };   // a képernyő a logó 640×290-es koordinátáiban
  const CYCLE = 9.6, T_FLASH = 0.35, T_ASM = 3.4, T_HOLD = 7.0, T_END = 8.4;     // másodperc: bekapcsolás · összeállás · kész felirat · szétesés · szünet
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const easeOut = (x) => 1 - Math.pow(1 - x, 3), easeIn = (x) => x * x * x, easeIO = (x) => (x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const rnd = (a, b) => a + Math.random() * (b - a);
  const imgs = {};
  const load = (src) => imgs[src] || (imgs[src] = new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; }));

  function mount(canvas, opt) {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    Promise.all([load(opt.frame), load(opt.full)]).then(([frame, full]) => start(canvas, frame, full, reduce, opt)).catch(() => { /* nincs kép: marad az üres vászon */ });
  }

  function start(cv, frame, full, reduce, opt) {
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, dpr = 1, k = 1, P = [], scr = null, t0 = 0, paused = false, visible = true, raf = 0, off0 = 0;

    function size() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = cv.clientWidth; H = Math.round(W * VBH / VBW); if (!W) return;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); k = W / VBW;
      scr = { x: SCR.x * k, y: SCR.y * k, w: SCR.w * k, h: SCR.h * k, r: SCR.r * k };
      sample();
    }
    function screenPath(c) {
      const { x, y, w, h, r } = scr; c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
    }
    // a felirat képpontjai: csak a képernyő belsejéből, a fényes (fehér/sárga) pontok – a keret és az üvegcsíkok kimaradnak
    function sample() {
      const off = document.createElement('canvas'); off.width = Math.round(W); off.height = Math.round(H);
      const o = off.getContext('2d', { willReadFrequently: true }); o.drawImage(full, 0, 0, W, H);
      const d = o.getImageData(0, 0, off.width, off.height).data, step = Math.max(1.4, W / 260), pts = [];
      const x0 = Math.ceil(scr.x + 8 * k), x1 = Math.floor(scr.x + scr.w - 8 * k), y0 = Math.ceil(scr.y + 8 * k), y1 = Math.floor(scr.y + scr.h - 8 * k);
      for (let y = y0; y < y1; y += step) for (let x = x0; x < x1; x += step) {
        const i = ((y | 0) * off.width + (x | 0)) * 4; if (d[i + 3] < 200 || Math.max(d[i], d[i + 1], d[i + 2]) < 150) continue;
        pts.push({ x, y, c: [d[i], d[i + 1], d[i + 2]] });
      }
      const cx = scr.x + scr.w / 2, cy = scr.y + scr.h / 2;
      P = pts.map((p) => { const a = Math.random() * Math.PI * 2, far = rnd(.2, .8) * scr.w;
        return { tx: p.x, ty: p.y, c: p.c, s: step * .95, sx: clamp(cx + Math.cos(a) * far, scr.x, scr.x + scr.w), sy: clamp(cy + Math.sin(a) * far * .55, scr.y, scr.y + scr.h),
          ex: p.x + rnd(-1, 1) * scr.w * .35, ey: p.y + rnd(.15, 1) * scr.h * .8, da: ((p.x - scr.x) / scr.w) * .55 + Math.random() * .3, de: Math.random() * .8, ph: Math.random() * 6.28 }; });
    }

    function draw(now) {
      raf = 0;
      if (!visible || paused) { off0 = now; return; }
      if (!t0) t0 = now; if (off0) { t0 += now - off0; off0 = 0; }
      const t = reduce ? T_HOLD - 0.5 : ((now - t0) / 1000) % CYCLE;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      ctx.drawImage(frame, 0, 0, W, H);                          // a TV (keret, képernyő, állvány) – felirat nélkül
      ctx.save(); screenPath(ctx); ctx.clip();
      if (t < T_FLASH) { ctx.fillStyle = `rgba(255,255,255,${.5 * (1 - t / T_FLASH)})`; ctx.fillRect(scr.x, scr.y, scr.w, scr.h); }   // bekapcsolás villanása
      else if (t < T_END) {
        const asm = clamp((t - T_FLASH) / (T_ASM - T_FLASH)), hold = clamp((t - T_ASM) / 1.0), out = clamp((t - T_HOLD) / (T_END - T_HOLD));
        for (const p of P) {
          let x, y, a, sz = p.s, white;
          if (out > 0) { const q = easeIn(clamp((out - p.de * .5) / (1 - p.de * .5))); x = p.tx + (p.ex - p.tx) * q; y = p.ty + (p.ey - p.ty) * q; a = 1 - q; white = 0; }
          else { const q = easeOut(clamp((asm - p.da * .55) / .45)), w = (1 - q) * 4 * k * 2;
            x = p.sx + (p.tx - p.sx) * q + Math.sin(now / 160 + p.ph) * w; y = p.sy + (p.ty - p.sy) * q + Math.cos(now / 190 + p.ph) * w; a = clamp(q * 1.6 + .15) * (.75 + .25 * Math.sin(now / 90 + p.ph)); white = (1 - q) * .7; }
          const r = Math.round(p.c[0] + (255 - p.c[0]) * white), g = Math.round(p.c[1] + (255 - p.c[1]) * white), b = Math.round(p.c[2] + (255 - p.c[2]) * white);
          ctx.fillStyle = `rgba(${r},${g},${b},${clamp(a)})`; ctx.fillRect(x - sz / 2, y - sz / 2, sz, sz);
        }
        if (hold > 0 && out < 1) {   // kész felirat: éles vektoros kép úszik át, rajta fénycsík fut végig
          ctx.globalAlpha = easeIO(hold) * (1 - out); ctx.drawImage(full, 0, 0, W, H);
          const sx = scr.x + ((t - T_ASM) / (T_HOLD - T_ASM) * 1.5 - .25) * scr.w;
          ctx.globalCompositeOperation = 'lighter'; const g = ctx.createLinearGradient(sx - 50 * k, 0, sx + 50 * k, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(255,255,255,.16)'); g.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = g; ctx.fillRect(sx - 50 * k, scr.y, 100 * k, scr.h); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
        }
      }
      ctx.restore();
      if (!reduce) raf = requestAnimationFrame(draw);
    }
    const kick = () => { if (!raf) raf = requestAnimationFrame(draw); };
    size(); kick();
    if ('ResizeObserver' in window) new ResizeObserver(() => { size(); kick(); }).observe(cv); else addEventListener('resize', () => { size(); kick(); });
    if ('IntersectionObserver' in window) new IntersectionObserver((es) => { visible = es[es.length - 1].isIntersecting; if (visible) kick(); }).observe(cv);   // a nem látszó logó nem fogyaszt
    document.addEventListener('visibilitychange', () => { paused = document.hidden; if (!paused) kick(); });
  }

  window.EOLogoTV = { mount };
})();
