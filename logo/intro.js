/* Electric Outlet Shop – nyitóanimáció.
   Sötét, sejtelmesen megvilágított tér, benne egy nagy képernyős TV → a TV bekapcsol → a logó pontokból áll össze a képernyőn →
   hiperugrás: belerepülünk a TV-be → megérkezünk a weboldalra.
   EOIntro.run({ full, onDone }) – teljes képernyős réteg az oldal fölött, a végén eltűnik. Esc / „Kihagyás” bármikor átugorja.
   A TV vektoros (SVG), ezért a belezoomolás közben is éles marad. */
(function () {
  'use strict';
  const SCR = { l: .2, t: .14444, w: .6, h: .6 };   // a képernyő a 1600×900-as jelenetben: x 320–1280, y 130–670
  const T = { fade: 1.1, led: .5, on: 1.7, asm0: 2.0, asm1: 5.0, j0: 6.4, j1: 8.3, flash: 8.65, end: 9.2 };   // másodperc
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const easeOut = (x) => 1 - Math.pow(1 - x, 3), easeIn = (x) => x * x * x, easeIO = (x) => (x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const rnd = (a, b) => a + Math.random() * (b - a);
  const loadImg = (src) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });

  const SVG = `<svg class="eo-svg" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true"><defs>
    <radialGradient id="eoHalo" cx="800" cy="400" r="760" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#7d98ff" stop-opacity=".22"/><stop offset=".55" stop-color="#4a5fb8" stop-opacity=".07"/><stop offset="1" stop-color="#4a5fb8" stop-opacity="0"/></radialGradient>
    <radialGradient id="eoBg" cx="800" cy="390" r="920" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#151a24"/><stop offset=".5" stop-color="#080a0e"/><stop offset="1" stop-color="#020203"/></radialGradient>
    <linearGradient id="eoBeamA" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#bcd4ff" stop-opacity=".34"/><stop offset="1" stop-color="#bcd4ff" stop-opacity="0"/></linearGradient>
    <linearGradient id="eoBeamB" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd596" stop-opacity=".28"/><stop offset="1" stop-color="#ffd596" stop-opacity="0"/></linearGradient>
    <filter id="eoBlur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="26"/></filter>
    <linearGradient id="eoBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3f4b"/><stop offset=".35" stop-color="#1c1f26"/><stop offset="1" stop-color="#0c0d11"/></linearGradient>
    <linearGradient id="eoRim" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".22" stop-color="#e8f0ff" stop-opacity=".85"/><stop offset=".78" stop-color="#ffe6c0" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <linearGradient id="eoRimV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <linearGradient id="eoMetal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#14161b"/><stop offset=".5" stop-color="#434955"/><stop offset="1" stop-color="#14161b"/></linearGradient>
    <linearGradient id="eoFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0e1117"/><stop offset="1" stop-color="#020203"/></linearGradient>
    <linearGradient id="eoHor" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#cfdcff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <linearGradient id="eoFade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".6"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <mask id="eoRf" maskUnits="userSpaceOnUse" x="0" y="735" width="1600" height="165"><rect x="0" y="735" width="1600" height="165" fill="url(#eoFade)"/></mask>
    <g id="eoTv">
      <rect x="308" y="118" width="984" height="564" rx="14" fill="url(#eoBody)"/><rect x="309.5" y="119.5" width="981" height="561" rx="13" fill="none" stroke="#fff" stroke-opacity=".16"/><rect x="319" y="129" width="962" height="542" rx="6" fill="none" stroke="#000" stroke-opacity=".55" stroke-width="2"/>
      <rect x="326" y="117.6" width="948" height="1.8" fill="url(#eoRim)"/><rect x="307.6" y="140" width="1.6" height="400" fill="url(#eoRimV)"/><rect x="1290.8" y="140" width="1.6" height="400" fill="url(#eoRimV)" opacity=".6"/>
      <rect x="320" y="130" width="960" height="540" rx="5" fill="#020203"/>
      <rect x="772" y="682" width="56" height="46" fill="url(#eoMetal)"/><rect x="592" y="722" width="416" height="14" rx="7" fill="url(#eoMetal)"/><rect x="620" y="722.6" width="360" height="1.2" fill="#fff" opacity=".4"/>
    </g></defs>
    <rect width="1600" height="900" fill="url(#eoBg)"/>
    <ellipse cx="800" cy="400" rx="860" ry="470" fill="url(#eoHalo)"/>
    <g filter="url(#eoBlur)"><polygon points="40,-60 340,-60 1040,770 540,770" fill="url(#eoBeamA)"/><polygon points="1560,-60 1260,-60 560,770 1060,770" fill="url(#eoBeamB)"/></g>
    <rect y="735" width="1600" height="165" fill="url(#eoFloor)"/><rect y="734" width="1600" height="2" fill="url(#eoHor)"/>
    <g mask="url(#eoRf)"><use href="#eoTv" transform="translate(0 1470) scale(1 -1)" opacity=".55"/></g>
    <ellipse cx="800" cy="737" rx="300" ry="10" fill="#000" opacity=".65"/><use href="#eoTv"/>
    <circle id="eoLed" cx="800" cy="675" r="2.8" fill="#ffb42a" opacity="0"/></svg>`;

  const CSS = `
  .eo-intro { position: fixed; inset: 0; z-index: 99999; background: #000; overflow: hidden; transition: opacity .55s ease; touch-action: none; }
  .eo-intro.out { opacity: 0; pointer-events: none; }
  .eo-stage { position: absolute; left: 50%; top: 50%; will-change: transform; }
  .eo-svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
  .eo-svg, .eo-glow, .eo-dust { -webkit-mask-image: radial-gradient(ellipse 66% 74% at 50% 47%, #000 58%, transparent 100%); mask-image: radial-gradient(ellipse 66% 74% at 50% 47%, #000 58%, transparent 100%); }
  .eo-dust { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
  .eo-glow { position: absolute; inset: 0; pointer-events: none; mix-blend-mode: screen; opacity: var(--l, 0);
    background: radial-gradient(ellipse 46% 46% at 50% 44%, rgba(255,205,90,.5), rgba(255,190,60,.16) 55%, transparent 80%), radial-gradient(ellipse 52% 14% at 50% 86%, rgba(255,190,60,.34), transparent 80%), radial-gradient(ellipse 70% 60% at 50% 46%, rgba(255,200,90,.12), transparent 75%); }
  .eo-screen { position: absolute; overflow: hidden; background: #020203; border-radius: 3px; box-shadow: 0 0 calc(var(--l, 0) * 90px) calc(var(--l, 0) * 18px) rgba(255,205,90,calc(var(--l, 0) * .45)); }
  .eo-screen canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
  .eo-screen::after { content: ""; position: absolute; inset: 0; pointer-events: none; background: linear-gradient(118deg, rgba(255,255,255,.11) 0%, rgba(255,255,255,.035) 30%, transparent 46%), linear-gradient(180deg, rgba(255,255,255,.05), transparent 22%); }
  .eo-vig { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse 75% 75% at 50% 45%, transparent 45%, rgba(0,0,0,.6)); }
  .eo-warp { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
  .eo-flash { position: absolute; inset: 0; pointer-events: none; opacity: 0; background: radial-gradient(circle at 50% 50%, #fff 0%, #fff6d6 45%, #ffd25a 100%); }
  .eo-black { position: absolute; inset: 0; pointer-events: none; background: #000; }
  .eo-skip { position: absolute; right: max(16px, env(safe-area-inset-right)); bottom: max(16px, env(safe-area-inset-bottom)); z-index: 3; border: 1px solid rgba(255,255,255,.3); background: rgba(0,0,0,.45); color: #fff; font: 600 13px/1 "Segoe UI", system-ui, sans-serif; letter-spacing: .08em; padding: 11px 16px; border-radius: 999px; cursor: pointer; backdrop-filter: blur(6px); }
  .eo-skip:hover { background: rgba(255,194,26,.92); color: #1a1408; border-color: transparent; }
  `;

  function run(opt) {
    if (document.querySelector('.eo-intro')) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { opt.onDone && opt.onDone(); return; }
    if (!document.getElementById('eoIntroCss')) { const st = document.createElement('style'); st.id = 'eoIntroCss'; st.textContent = CSS; document.head.appendChild(st); }
    loadImg(opt.full).then((logo) => { if (!logo) { opt.onDone && opt.onDone(); return; } build(opt, logo); });
  }

  function build(opt, logo) {
    const root = document.createElement('div'); root.className = 'eo-intro'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-label', 'Bevezető animáció');
    root.innerHTML = `<div class="eo-stage">${SVG}<canvas class="eo-dust"></canvas><div class="eo-glow"></div><div class="eo-screen"><canvas></canvas></div><div class="eo-vig"></div></div><canvas class="eo-warp"></canvas><div class="eo-black"></div><div class="eo-flash"></div><button class="eo-skip" type="button">Kihagyás ›</button>`;
    document.body.appendChild(root);
    const prevOverflow = document.documentElement.style.overflow; document.documentElement.style.overflow = 'hidden';
    const stage = root.querySelector('.eo-stage'), scrEl = root.querySelector('.eo-screen'), cv = scrEl.querySelector('canvas'), ctx = cv.getContext('2d'), dust = root.querySelector('.eo-dust'), dctx = dust.getContext('2d'),
      wp = root.querySelector('.eo-warp'), wctx = wp.getContext('2d'), black = root.querySelector('.eo-black'), flash = root.querySelector('.eo-flash'), led = root.querySelector('#eoLed');
    scrEl.style.cssText = `left:${SCR.l * 100}%;top:${SCR.t * 100}%;width:${SCR.w * 100}%;height:${SCR.h * 100}%`;
    let vw = 0, vh = 0, sw = 0, sh = 0, sdw = 0, sdh = 0, W = 0, H = 0, RES = 1.6, P = [], logoBox = null, camMax = 2.4, cx = 0, cy = 0, done = false, t0 = 0, raf = 0, streaks = [], motes = [];

    function size() {
      vw = innerWidth; vh = innerHeight;
      // a TV a nézet ~90%-át tölti ki szélességben és ~80%-át magasságban (a jelenet 16:9, a szélein a fekete háttér folytatódik)
      const stW = Math.min(.84 * vw / .615, .76 * vh / .386), stH = stW * 9 / 16;
      stage.style.width = stW + 'px'; stage.style.height = stH + 'px'; stage.style.marginLeft = -stW / 2 + 'px'; stage.style.marginTop = -stH / 2 + 'px';
      const ox = (SCR.l + SCR.w / 2) * 100, oy = (SCR.t + SCR.h / 2) * 100; stage.style.transformOrigin = `${ox}% ${oy}%`;
      sw = stW * SCR.w; sh = stH * SCR.h; sdw = stW; sdh = stH;
      camMax = Math.max(vw / sw, vh / sh) * 1.22;
      cx = vw / 2 + (stW * ox / 100 - stW / 2); cy = vh / 2 + (stH * oy / 100 - stH / 2);
      RES = Math.min(1.8, 2600 / Math.max(sw, 1)); W = Math.round(sw * RES); H = Math.round(sh * RES); cv.width = W; cv.height = H;
      dust.width = Math.round(stW); dust.height = Math.round(stH);
      const dpr = Math.min(2, devicePixelRatio || 1); wp.width = Math.round(vw * dpr); wp.height = Math.round(vh * dpr); wctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sample();
    }
    function sample() {
      const lw = W * .6, lh = lw * (logo.naturalHeight / logo.naturalWidth); logoBox = { x: (W - lw) / 2, y: (H - lh) / 2, w: lw, h: lh };
      const off = document.createElement('canvas'); off.width = W; off.height = H; const o = off.getContext('2d', { willReadFrequently: true }); o.drawImage(logo, logoBox.x, logoBox.y, logoBox.w, logoBox.h);
      const d = o.getImageData(0, 0, W, H).data, step = Math.max(2, Math.round(W / 300)), pts = [];
      for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) { const i = (y * W + x) * 4; if (d[i + 3] < 140) continue; pts.push({ x: x + step / 2, y: y + step / 2, c: [d[i], d[i + 1], d[i + 2]] }); }
      P = pts.map((p) => { const a = Math.random() * Math.PI * 2, far = rnd(.15, .8) * Math.max(W, H);
        return { tx: p.x, ty: p.y, c: p.c, s: step * .92, sx: clamp(W / 2 + Math.cos(a) * far, -20, W + 20), sy: clamp(H / 2 + Math.sin(a) * far * .6, -20, H + 20), da: (p.x / W) * .55 + Math.random() * .3, ph: Math.random() * 6.28 }; });
    }
    streaks = Array.from({ length: 280 }, () => ({ a: Math.random() * Math.PI * 2, r0: rnd(.015, .3), z: rnd(.25, 1), y: Math.random() < .55 }));
    motes = Array.from({ length: 110 }, () => ({ x: Math.random(), y: Math.random() * .85, r: rnd(.5, 2.2), a: rnd(.08, .45), sp: rnd(.004, .018), ph: Math.random() * 6.28 }));

    function finish() {
      if (done) return; done = true; cancelAnimationFrame(raf); root.classList.add('out');
      setTimeout(() => { root.remove(); document.documentElement.style.overflow = prevOverflow; removeEventListener('keydown', onKey); removeEventListener('resize', size); opt.onDone && opt.onDone(); }, 600);
    }
    const onKey = (e) => { if (e.key === 'Escape' || e.key === 'Enter') finish(); };
    addEventListener('keydown', onKey); addEventListener('resize', size); root.querySelector('.eo-skip').addEventListener('click', finish);
    size();

    function frame(now) {
      if (done) return;
      if (!t0) t0 = now; const t = (now - t0) / 1000;
      // kamera: lassú, ráközelítő mozgás, majd a hiperugrás (gyorsuló zoom a képernyő közepébe)
      let cam = 1 + .08 * easeOut(clamp(t / T.j0)), pj = clamp((t - T.j0) / (T.j1 - T.j0));
      if (pj > 0) cam = 1.08 * Math.exp(Math.log(camMax / 1.08) * Math.pow(pj, 2.3));
      stage.style.transform = `scale(${cam.toFixed(4)})`;
      black.style.opacity = String(1 - easeOut(clamp(t / T.fade)));
      // készenléti LED: pislákol, a bekapcsoláskor kialszik
      led.setAttribute('opacity', t < T.on ? String(clamp((t - T.led) / .6) * (.55 + .45 * Math.sin(t * 4))) : '0');
      // a képernyő
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = '#020203'; ctx.fillRect(0, 0, W, H);
      let lum = 0;
      if (t >= T.on && t < T.asm0) { const k = easeOut((t - T.on) / (T.asm0 - T.on)), w = W * clamp(k * 1.6), h = Math.max(2, H * .012);
        const g = ctx.createLinearGradient(W / 2 - w / 2, 0, W / 2 + w / 2, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(255,255,255,.95)'); g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g; ctx.fillRect(W / 2 - w / 2, H / 2 - h / 2, w, h); lum = .12 * k; }
      else if (t >= T.asm0) {
        const asm = clamp((t - T.asm0) / (T.asm1 - T.asm0)), hold = clamp((t - T.asm1) / 1.0); let lit = 0;
        const bgG = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * .6); bgG.addColorStop(0, 'rgba(255,194,26,.10)'); bgG.addColorStop(1, 'rgba(255,194,26,0)'); ctx.fillStyle = bgG; ctx.fillRect(0, 0, W, H);
        for (const p of P) { const q = easeOut(clamp((asm - p.da * .55) / .45)), w = (1 - q) * 6 * RES; lit += q;
          const x = p.sx + (p.tx - p.sx) * q + Math.sin(now / 160 + p.ph) * w, y = p.sy + (p.ty - p.sy) * q + Math.cos(now / 190 + p.ph) * w, a = clamp(q * 1.6 + .15) * (.75 + .25 * Math.sin(now / 90 + p.ph)), wh = (1 - q) * .7;
          ctx.fillStyle = `rgba(${Math.round(p.c[0] + (255 - p.c[0]) * wh)},${Math.round(p.c[1] + (255 - p.c[1]) * wh)},${Math.round(p.c[2] + (255 - p.c[2]) * wh)},${clamp(a)})`; ctx.fillRect(x - p.s / 2, y - p.s / 2, p.s, p.s); }
        if (hold > 0) { ctx.globalAlpha = easeIO(hold); ctx.drawImage(logo, logoBox.x, logoBox.y, logoBox.w, logoBox.h);
          const gx = W * (((t - T.asm1) / (T.j0 - T.asm1)) * 1.6 - .3); ctx.save(); ctx.beginPath(); ctx.rect(logoBox.x, logoBox.y, logoBox.w, logoBox.h); ctx.clip(); ctx.globalCompositeOperation = 'lighter';
          const sg = ctx.createLinearGradient(gx - 70 * RES, 0, gx + 70 * RES, 0); sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(.5, 'rgba(255,255,255,.22)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = sg; ctx.fillRect(gx - 70 * RES, 0, 140 * RES, H); ctx.restore(); ctx.globalAlpha = 1; }
        lum = hold > 0 ? .92 + .08 * Math.sin(now / 600) : .22 + .78 * clamp(lit / Math.max(1, P.length) * 1.2);
      }
      const L = (lum * 1.1).toFixed(3); stage.style.setProperty('--l', L);
      // lebegő por a fényben (a képernyő fénye melegre színezi)
      dctx.clearRect(0, 0, dust.width, dust.height);
      for (const m of motes) { const x = ((m.x + Math.sin(now / 5200 + m.ph) * .02 + now * m.sp / 1000 * .12) % 1) * dust.width, y = (m.y + Math.sin(now / 3900 + m.ph) * .015) * dust.height, a = m.a * (.5 + .5 * Math.sin(now / 1700 + m.ph)) * (.55 + lum * .9);
        dctx.fillStyle = `rgba(${255},${Math.round(225 - 30 * lum)},${Math.round(200 - 110 * lum)},${a})`; dctx.beginPath(); dctx.arc(x, y, m.r * (dust.width / 1400), 0, 6.283); dctx.fill(); }
      // hiperugrás: sugárirányú fénycsíkok és táguló fényalagút
      wctx.clearRect(0, 0, vw, vh);
      if (pj > 0) {
        const diag = Math.hypot(vw, vh), q = Math.pow(pj, 2.3), gain = 5.2; wctx.globalCompositeOperation = 'lighter'; wctx.lineCap = 'round';
        for (const s of streaks) {
          const f = (qq) => s.r0 * diag * Math.exp(gain * qq * (.45 + s.z)), head = f(q), tail = f(Math.max(0, q - .07 - .05 * s.z)); if (tail > diag) continue;
          const ca = Math.cos(s.a), sa = Math.sin(s.a), al = clamp(pj * 2.2) * (.35 + .65 * s.z);
          wctx.strokeStyle = s.y ? `rgba(255,205,70,${al})` : `rgba(255,255,255,${al})`; wctx.lineWidth = .8 + 3 * q * s.z;
          wctx.beginPath(); wctx.moveTo(cx + ca * tail, cy + sa * tail); wctx.lineTo(cx + ca * head, cy + sa * head); wctx.stroke();
        }
        const R = diag * (.12 + .9 * q), g = wctx.createRadialGradient(cx, cy, 0, cx, cy, R); g.addColorStop(0, `rgba(255,236,170,${.55 * q})`); g.addColorStop(.5, `rgba(255,190,50,${.22 * q})`); g.addColorStop(1, 'rgba(255,190,50,0)');
        wctx.fillStyle = g; wctx.fillRect(0, 0, vw, vh); wctx.globalCompositeOperation = 'source-over';
      }
      flash.style.opacity = String(t > T.j1 - .25 ? easeIn(clamp((t - (T.j1 - .25)) / (T.flash - (T.j1 - .25)))) : 0);
      if (t >= T.flash) { finish(); return; }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
  }
  window.EOIntro = { run };
})();
