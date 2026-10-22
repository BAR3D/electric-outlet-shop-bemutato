/* Bemutató Gyár – RECEPCIÓ: belépés a szalon (rendelő, spa, stúdió) recepciójára.
   Üvegajtó nyílik → 3D térben körbenézel → a „termek” (a modell igényei) íves portálok → belépve a kezelések árral.
   Bármely szolgáltatónál működik: a termek = C.needs, a kezelések = a termékek (cats szerint). Foglalási rendszer NINCS benne. */
'use strict';

window.LAYOUT_META5 = {
  recepcio: { name: 'Recepció', desc: 'Megérkezel a szalon recepciójára: körbenézel a 3D térben, a termek közül választasz, belépve kezelések és árak.', light: true, shopView: 'racs' },
  'recepcio-arany': { name: 'Recepció – Arany', desc: 'Mentett stílus (Esthetic Line, 2026-10-14): sötét luxus, fekete márvány, arany fények és aranypor, logó-érmes ajtó, legördülő recepciós pult.', light: false, shopView: 'racs' },
  'recepcio-pezsgo': { name: 'Recepció – Pezsgő', desc: 'Világos, napfényes szalon: elefántcsont, pezsgő és rozéarany, levegős fények – ugyanaz az ajtós, 3D-termes érkezés.', light: true, shopView: 'racs' },
  'recepcio-oliva': { name: 'Recepció – Olíva', desc: 'Természetes, hétköznapi szalon: bézs falak, olívazöld és finom arany, nappali fény, valódi emberek – nem luxus, hanem barátságos.', light: true, shopView: 'racs' },
  'recepcio-ejkek': { name: 'Recepció – Éjkék', desc: 'Futurisztikus klinika: éjkék üveg, türkiz és ibolya neonfény, hideg fénypor – modern esztétika és technológia.', light: false, shopView: 'racs' },
};
// a Recepció stílusai – mind ugyanaz a felépítés (ajtó, 3D termek, csapat, pult), csak a színvilág és a fények mások
window.RC_TEMAK = {
  arany:  { name: 'Recepció – Arany', desc: 'Sötét luxus: fekete márvány, arany fények, aranypor, logó-érmes ajtó. (Mentett stílus: Esthetic Line, 2026-10-14.)', dark: true, blend: 'lighter',
            por: { mag: '255,250,230', k1: '255,236,170', k2: '240,196,95', k3: '226,170,70', b1: '255,214,140', b2: '255,200,110', csill: '255,250,235', csill0: '255,240,200' } },
  pezsgo: { name: 'Recepció – Pezsgő', desc: 'Világos, napfényes szalon: elefántcsont, pezsgő és rozéarany, levegős, nyugodt fények.', dark: false, blend: 'source-over',
            por: { mag: '255,252,246', k1: '236,200,176', k2: '214,160,130', k3: '196,140,112', b1: '240,214,196', b2: '226,190,168', csill: '255,255,255', csill0: '245,225,210' } },
  oliva:  { name: 'Recepció – Olíva', desc: 'Természetes, barátságos szalon: bézs, olívazöld és finom arany, nappali fény.', dark: false, blend: 'source-over',
            por: { mag: '255,253,245', k1: '214,196,140', k2: '170,170,110', k3: '140,150,90', b1: '226,210,160', b2: '190,186,130', csill: '255,255,250', csill0: '236,226,190' } },
  ejkek:  { name: 'Recepció – Éjkék', desc: 'Futurisztikus klinika: éjkék üveg, türkiz és ibolya neonfény, hideg fénypor – modern esztétika, technológia.', dark: true, blend: 'lighter',
            por: { mag: '235,252,255', k1: '160,240,255', k2: '80,210,235', k3: '120,110,255', b1: '110,200,255', b2: '150,120,255', csill: '240,252,255', csill0: '170,235,255' } },
};
Object.assign(window.LAYOUT_META, window.LAYOUT_META5);
window.rcTema = () => { const ly = (typeof LY === 'function' ? LY() : (typeof C !== 'undefined' && C.layout)) || ''; const k = String(ly).replace(/^recepcio-?/, '');
  if (window.RC_TEMAK[k]) return k; const t = typeof C !== 'undefined' && C.recepcio && C.recepcio.tema; return t === 'luxus' ? 'arany' : (window.RC_TEMAK[t] ? t : 'vilagos'); };

LAYOUTS.recepcio = function () {
  const rooms = SKINS.slice(0, 8), N = rooms.length || 1;
  const list = (s) => S.products.filter((p) => has(p, s.cats)).sort((a, b) => (b.price > 0) - (a.price > 0));   // a szalon saját sorrendje marad (a kiemelt kezelések elöl)
  const tel = (C.contact && C.contact.phone) || '';
  const LG = C.logo || null, erem = (k) => LG ? `<span class="rc-medal ${k}"><b>${esc(LG.betu || '')}</b><em>${esc(C.name || '')}</em><small>${esc(LG.alcim || '')}</small></span>` : `<span>${esc((C.name || '').charAt(0))}</span>`;
  // a csapat (C.csapat): ki melyik teremben dolgozik – a szemben lévő terem előtt és a terem belsejében is megjelenik
  const csap = (i) => (C.csapat || []).filter((m) => rooms[i] && (m.termek || []).includes(rooms[i].k));
  const mono = (n) => esc(String(n).split(/\s+/).map((w) => w[0]).slice(0, 2).join(''));
  const kartya = (m) => `<article class="rc-tm"><span class="rc-tm-av">${m.kep ? `<img src="${img(m.kep)}" alt="${esc(m.nev)}">` : mono(m.nev)}</span><div class="rc-tm-b"><b>${esc(m.nev)}</b><small>${esc(m.szerep || '')}</small>
      <span class="rc-tm-sz">${(m.szak || []).slice(0, 3).map((x) => `<i>${esc(x)}</i>`).join('')}</span><p>„${esc(m.idezet || '')}”</p>
      <span class="rc-tm-ft"><button type="button" class="rc-tm-more">Tovább ›</button>${m.tel ? `<a href="${telHref(m.tel)}">Bejelentkezés: ${esc(m.tel)}</a>` : m.web ? `<a href="https://${esc(m.web)}" target="_blank" rel="noopener">Bejelentkezés: ${esc(m.web)}</a>` : ''}</span></div></article>`;
  const fontLoad = () => { const f = window.A5F && A5F[C.alapBetu || 'cormorant']; if (f && !document.getElementById('rcFont')) { const l = document.createElement('link'); l.id = 'rcFont'; l.rel = 'stylesheet'; l.href = `https://fonts.googleapis.com/css2?family=${f[1]}&display=swap`; document.head.appendChild(l); document.body.style.setProperty('--serif', `"${f[0]}", Georgia, serif`); } };

  const tema = rcTema(), TM = RC_TEMAK[tema] || null, lux = !!TM, PC = TM ? TM.por : RC_TEMAK.arany.por;   // lux = a „luxus” szerkezet (aranypor, fénycsóvák, neonív) – mindhárom stílusnál
  window.__lx2Intro = true;   // a saját ajtós érkezés váltja ki az általános nyitófüggönyt
  lx2Start(() => {
    fontLoad();
    if (TM && TM.dark) document.body.classList.remove('light');   // a sötét luxus téma a saját színeit használja
    if (LG) $$('.brand-mark').forEach((m) => { m.textContent = LG.betu || ''; m.classList.add('rc-lg'); });
    if (C.webshop && typeof wsBetolt === 'function') wsBetolt().then((W) => { if (!W) return; const L = (W.products || []).filter((p) => p.images && p.images[0] && p.inStock); const pick = (n, k) => L.filter((_, i) => i % 7 === k).slice(0, n);
      const H = C.helyben && C.helyben.aktiv ? (C.helyben.termekek || []).filter((x) => x.kep) : null;
      $$('[data-vitrin]').forEach((v) => { const jobb = v.dataset.vitrin === 'jobb';
        v.innerHTML = (jobb && H && H.length ? H.slice(0, 6).map((x) => x.kep) : pick(6, jobb ? 3 : 0).map((p) => p.images[0])).map((u) => `<img src="${u}" alt="" loading="lazy" decoding="async">`).join(''); }); });
    if (C.helyben && C.helyben.aktiv) { const j = $('.rc-vitrin.jobb'); if (j) { j.classList.add('nyitva'); const sz = $('.rc-v-szalag', j); if (sz) sz.remove(); const em = $('.rc-v-tabla em', j); if (em) em.textContent = 'Belépek →'; j.setAttribute('aria-label', 'Helyben kapható termékek'); } }
    const stage = $('.rc-stage'), ring = $('.rc-ring'), doors = $('.rc-doors'), panels = $$('.rc-room'), chips = $$('.rc-chip'), room = $('.rc-open'); if (!stage) return;
    // érkezés: az ajtó szétnyílik
    let paused = false; const busy = () => paused || document.hidden || room.classList.contains('on') || !F3.visible(stage);   // ilyenkor semmi nem rajzol
    const ph = $('.rc-photo', stage); if (ph) { let mx = 0, my = 0, cx = 0, cy = 0; FX.on(window, 'pointermove', (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; }, { passive: true });
      let lpx = 1e9, lpy = 1e9; FX.tick(() => { if (busy()) return; cx += (mx - cx) * 0.04; cy += (my - cy) * 0.04; const px = Math.round((cx * -16 - ((ang % 360) / 360) * 20) * 10) / 10, py = Math.round(cy * -100) / 10; if (px === lpx && py === lpy) return; lpx = px; lpy = py; ph.style.transform = `scale(1.05) translate3d(${px}px, ${py}px, 0)`; }); }   // a valódi(szerű) recepciókép enyhe mélységgel mozdul
    const quick = FX.reduce || /thumb=1/.test(location.search);
    // a termek és a háttér képeit már az ajtó előtti várakozás alatt kibontjuk (különben a nyitás első pillanatában akadna)
    if (!quick) [...new Set([...rooms.map((r) => r.img), C.recepcio && C.recepcio.hatter ? img(C.recepcio.hatter) : ''].filter(Boolean))].forEach((u) => { const im = new Image(); im.decoding = 'async'; im.src = u; if (im.decode) im.decode().catch(() => {}); });
    const varj = (C.recepcio && C.recepcio.ajtoIdo) || 2200;   // ennyi ideig állunk az ajtó előtt (ms) – el lehessen olvasni
    FX.later(() => { doors.classList.add('open'); stage.classList.add('in'); FX.later(() => { doors.style.display = 'none'; }, 1600); }, quick ? 0 : varj);
    if (!quick) FX.later(rcAkcio, varj + 1900);   // akciós felugró ablak: a belépés után, amikor a recepció már kirajzolódott
    let intro = quick ? 1 : 0; const t0 = performance.now() + (quick ? 0 : varj);   // belépő kamera: messziről beúszik
    if (lux) {   // aranypor: éles, előrerajzolt szikrák (mag + glória + csillanás) és puha bokeh-fények – az egér elől szétrebbennek
      const { c, g, dpr } = F3.canvas('rc-dust', stage, false); c.style.position = 'absolute'; F3.trackMouse();
      const fitC = () => { const r = stage.getBoundingClientRect(), d = 1; c.width = r.width * d; c.height = r.height * d; c.style.width = r.width + 'px'; c.style.height = r.height + 'px'; c._d = d; };
      fitC(); FX.on(window, 'resize', fitC);
      const sprite = (sz, star) => { const o = document.createElement('canvas'); o.width = o.height = sz; const x = o.getContext('2d'), h = sz / 2;
        let gr = x.createRadialGradient(h, h, 0, h, h, h); gr.addColorStop(0, `rgba(${PC.mag},1)`); gr.addColorStop(0.08, `rgba(${PC.k1},.95)`); gr.addColorStop(0.22, `rgba(${PC.k2},.45)`); gr.addColorStop(0.55, `rgba(${PC.k3},.12)`); gr.addColorStop(1, `rgba(${PC.k3},0)`); x.fillStyle = gr; x.fillRect(0, 0, sz, sz);
        if (star) { x.globalCompositeOperation = 'lighter'; for (const [w, l] of [[sz * 0.018, h * 0.95], [sz * 0.01, h * 0.6]]) { for (const a of [0, Math.PI / 2]) { x.save(); x.translate(h, h); x.rotate(a + (l < h * 0.7 ? Math.PI / 4 : 0)); const lg = x.createLinearGradient(-l, 0, l, 0); lg.addColorStop(0, `rgba(${PC.csill0},0)`); lg.addColorStop(0.5, `rgba(${PC.csill},.95)`); lg.addColorStop(1, `rgba(${PC.csill0},0)`); x.fillStyle = lg; x.fillRect(-l, -w, l * 2, w * 2); x.restore(); } } }
        return o; };
      const SP = sprite(128, false), ST = sprite(160, true), BK = (() => { const o = document.createElement('canvas'); o.width = o.height = 128; const x = o.getContext('2d'), gr = x.createRadialGradient(64, 64, 20, 64, 64, 64); gr.addColorStop(0, `rgba(${PC.b1},.55)`); gr.addColorStop(0.7, `rgba(${PC.b2},.28)`); gr.addColorStop(1, `rgba(${PC.b2},0)`); x.fillStyle = gr; x.beginPath(); x.arc(64, 64, 64, 0, 6.3); x.fill(); return o; })();
      const mob = innerWidth < 760, mk = (k) => ({ k, x: Math.random(), y: Math.random(), z: 0.35 + Math.random() * 0.65, vx: 0, vy: 0, tw: Math.random() * 6.28 });
      const P = [...Array.from({ length: mob ? 6 : 12 }, () => mk('b')), ...Array.from({ length: mob ? 40 : 80 }, () => mk('d')), ...Array.from({ length: mob ? 5 : 10 }, () => mk('s'))]; let lastF = 0;
      FX.tick((t) => { if (busy()) { lastF = 0; return; } const dt = lastF ? Math.min(2.5, (t - lastF) / 16.667) : 1; lastF = t; const d = c._d || 1, W = c.width / d, H = c.height / d, rr = stage.getBoundingClientRect(), mx = F3.mouse.x - rr.left, my = F3.mouse.y - rr.top;
        g.setTransform(d, 0, 0, d, 0, 0); g.clearRect(0, 0, W, H); g.globalCompositeOperation = TM ? TM.blend : 'lighter'; g.imageSmoothingQuality = 'high';
        for (const p of P) {
          const sp = p.k === 'b' ? 0.00012 : 0.00035; p.y -= sp * (1 + p.z) * dt;   // időarányos mozgás: egy lassabb képkocka után sem ugrik if (p.y < -0.08) { p.y = 1.08; p.x = Math.random(); }
          let x = p.x * W + Math.sin(t / 2400 + p.tw) * 22 * p.z, y = p.y * H; const dx = x - mx, dy = y - my, dd = Math.hypot(dx, dy) || 1;
          if (p.k !== 'b' && dd < 160) { p.vx += (dx / dd) * (160 - dd) * 0.0011 * dt; p.vy += (dy / dd) * (160 - dd) * 0.0011 * dt; } const dmp = Math.pow(0.95, dt); p.vx *= dmp; p.vy *= dmp; p.x += (p.vx / 10) * dt; p.y += (p.vy / 10) * dt;
          const tw = 0.55 + 0.45 * Math.sin(t / (p.k === 's' ? 420 : 760) + p.tw);
          if (p.k === 'b') { const r = 40 + p.z * 70; g.globalAlpha = 0.16 + 0.12 * tw; g.drawImage(BK, x - r, y - r, r * 2, r * 2); }
          else if (p.k === 's') { const r = (14 + p.z * 22) * (0.75 + 0.35 * tw); g.globalAlpha = 0.65 + 0.35 * tw; g.drawImage(ST, x - r, y - r, r * 2, r * 2); }
          else { const r = (5 + p.z * 9) * (0.85 + 0.25 * tw); g.globalAlpha = (0.55 + 0.45 * tw) * (0.6 + p.z * 0.4); g.drawImage(SP, x - r, y - r, r * 2, r * 2); }
        }
        g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; });
    }
    const R = () => Math.max(380, Math.min(innerWidth * 0.5, 820));
    const team = $('.rc-team', stage); let lastTeam = -1;
    const place = () => { if (!team) return; const sr = stage.getBoundingClientRect(), sg = $('.rc-room.front .rc-sign', stage), dk = $('.rc-desk', stage); if (!sg || !dk) return;
      const top = sg.getBoundingClientRect().bottom - sr.top + 28, bot = dk.getBoundingClientRect().top - sr.top - 18;
      team.style.top = top + 'px'; team.style.height = Math.max(0, bot - top) + 'px'; team.classList.toggle('fit', bot - top > 150 && innerWidth > 760); };
    const showTeam = (i) => { if (!team) return; const L = csap(i); team.classList.remove('in'); FX.later(() => { team.innerHTML = L.length ? `<span class="rc-team-h">${esc(rooms[i].name)} · itt dolgozik</span><div class="rc-team-row">${L.map(kartya).join('')}</div>` : ''; place(); requestAnimationFrame(() => team.classList.add('in')); }, 220); };
    FX.on(window, 'resize', place); FX.every(place, 700);
    // „Tovább”: a teljes bemutatkozás kinyílik (a recepción és a terem belsejében is)
    FX.on(document, 'click', (e) => { const b = e.target.closest('.rc-tm-more'); if (!b) return; const a = b.closest('.rc-tm'); a.classList.toggle('open'); b.textContent = a.classList.contains('open') ? 'Kevesebb ‹' : 'Tovább ›'; });
    panels.forEach((p, i) => p.style.setProperty('--a', (i * 360) / N + 'deg'));
    let ang = 0, target = 0, drag = false, lx = 0, moved = 0, zoom = 0, zt = 0, focus = -1;
    const norm = (a) => ((a % 360) + 360) % 360;
    // húzás csak valódi mozgásnál kapja el az egeret – különben a kattintás eljut a teremhez (pointer capture miatt nem jutott el)
    let down = false, pid = 0;
    FX.on(stage, 'pointerdown', (e) => { moved = 0; if (e.target.closest('button, .rc-desk, .rc-vitrin')) return; down = true;   // minden lenyomás nullázza az előző húzást (különben a nyílra kattintást elnyelte)
     drag = false; lx = e.clientX; moved = 0; pid = e.pointerId; });
    FX.on(stage, 'pointermove', (e) => { if (!down) return; const d = e.clientX - lx; lx = e.clientX; moved += Math.abs(d); if (!drag && moved > 6) { drag = true; try { stage.setPointerCapture(pid); } catch { /* */ } stage.classList.add('drag'); } if (drag) target -= d * 0.22; });
    const up = () => { if (!down) return; down = false; if (drag) { drag = false; stage.classList.remove('drag'); const step = 360 / N; target = Math.round(target / step) * step; } };
    FX.on(stage, 'pointerup', up); FX.on(stage, 'pointercancel', up);
    FX.on(stage, 'click', (e) => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
    $$('.rc-arrow').forEach((b) => FX.on(b, 'click', () => { target += (+b.dataset.d * 360) / N; }));
    const turnTo = (i) => { target = target - norm(target) + (i * 360) / N; if (norm(target) - norm(ang) > 180) target -= 360; };
    chips.forEach((c) => FX.on(c, 'click', () => turnTo(+c.dataset.i)));
    const pick = $('.rc-pick', stage), pb = pick && $('.rc-pick-b', pick), go = $('.rc-go', stage);
    const pickPlace = () => { const l = $('.rc-pick-l', pick), dk = $('.rc-desk', stage), tm = $$('.rc-team.in .rc-tm', stage); if (!l || !dk || innerWidth <= 1250) return;
      const D = dk.getBoundingClientRect(), tl = tm.length ? Math.min(...tm.map((x) => x.getBoundingClientRect().left)) : D.left + 400, edge = Math.min(tl - 14, D.left + 160);
      const tb = tm.length ? Math.max(...tm.map((x) => x.getBoundingClientRect().bottom)) : 0; l.style.bottom = tb ? (D.bottom - tb) + 'px' : '';   // az alja egy vonalban a csapatkártyáéval
      if (edge - 260 < 8) { l.style.right = ''; l.style.left = '0px'; l.style.bottom = ''; } else { l.style.left = 'auto'; l.style.right = (D.right - edge) + 'px'; } };   // a csapatkártyák elé, a bal felső üres részbe
    const pickSet = (on) => { if (!pick) return; if (on) pickPlace(); pick.classList.toggle('on', on); pb.setAttribute('aria-expanded', on ? 'true' : 'false'); };
    if (pick) { FX.on(pb, 'click', () => pickSet(!pick.classList.contains('on')));
      $$('li', pick).forEach((li) => FX.on(li, 'click', () => { turnTo(+li.dataset.i); pickSet(false); }));
      FX.on(document, 'click', (e) => { if (!e.target.closest('.rc-pick')) pickSet(false); }); FX.on(document, 'keydown', (e) => { if (e.key === 'Escape') pickSet(false); }); }
    const pickFront = (i) => { if (pick) { $('span', pb).textContent = rooms[i] ? rooms[i].name : ''; $$('li', pick).forEach((li, k) => li.setAttribute('aria-selected', k === i ? 'true' : 'false')); } if (go) go.dataset.open = i; };
    FX.on(window, 'keydown', (e) => { if (room.classList.contains('on')) { if (e.key === 'Escape') close(); return; } if (e.key === 'ArrowLeft') target -= 360 / N; if (e.key === 'ArrowRight') target += 360 / N; });
    // belépés egy terembe
    const open = (i) => {
      const s = rooms[i], L = list(s); focus = i; zt = 1;
      $('.rc-open-bg', room).style.backgroundImage = `url(${s.img})`;
      $('.rc-open-in', room).innerHTML = `<button class="rc-back" type="button">← Vissza a recepcióra</button>
        <span class="rc-kick">${String(i + 1).padStart(2, '0')} · ${esc(C.name)}</span><h2>${esc(s.name)}</h2><p class="rc-lead">${esc(s.d || '')}</p>
        <div class="rc-menu">${L.map((p, k) => `<a href="#/termek/${p.slug}" style="--d:${Math.min(k, 14) * 40}ms"><span><b>${esc(p.name)}</b>${p.summary ? `<small>${esc(String(p.summary).slice(0, 90))}</small>` : ''}</span><i></i><em>${pft(p)}</em></a>`).join('') || '<p class="muted">Ehhez a teremhez most egyedi ajánlatot adunk – kérdezz a recepción.</p>'}</div>
        ${csap(i).length ? `<div class="rc-team-in"><h3>Akik itt várnak</h3>${csap(i).map(kartya).join('')}</div>` : ''}
        <div class="rc-cta">${tel ? `<a class="btn btn-gold" href="${telHref(tel)}">Bejelentkezés: ${esc(tel)}</a>` : ''}<a class="btn btn-ghost" href="#/kapcsolat">Írj nekünk</a></div>`;
      FX.later(() => { room.classList.add('on'); document.body.classList.add('rc-in'); FX.on($('.rc-back', room), 'click', close); }, FX.reduce ? 0 : 520);
    };
    const close = () => { room.classList.remove('on'); document.body.classList.remove('rc-in'); zt = 0; focus = -1; };
    FX.add({ remove: () => document.body.classList.remove('rc-in') });
    panels.forEach((p, i) => FX.on(p, 'click', (e) => { e.preventDefault(); if (moved > 6) return; const front = Math.round(norm(ang) / (360 / N)) % N; if (front !== i) { turnTo(i); FX.later(() => open(i), 650); } else open(i); }));
    $$('.rc-desk [data-open]').forEach((b) => FX.on(b, 'click', () => { const i = +b.dataset.open; turnTo(i); FX.later(() => open(i), 700); }));
    // a kamera: forgás + enyhe lebegés + belépéskor előre úszás
    let curR = 0; const setR = () => { curR = R(); panels.forEach((p) => p.style.setProperty('--r', curR + 'px')); }; setR(); FX.on(window, 'resize', setR);
    let lastT = '', lastFront = -1;
    FX.tick((t) => {
      if (document.hidden || !F3.visible(stage)) return;
      ang += (target - ang) * 0.08; zoom += (zt - zoom) * 0.07;
      if (Math.abs(target - ang) < 0.01) ang = target; if (Math.abs(zt - zoom) < 0.001) zoom = zt;
      const r = curR;
      if (intro < 1 && t > t0) intro = Math.min(1, (t - t0) / 1800); const ease = 1 - Math.pow(1 - intro, 3);
      const tf = `translateZ(${(r * (0.3 + zoom * 1.05) - (1 - ease) * r * 1.6).toFixed(1)}px) rotateY(${(-ang + (1 - ease) * 40).toFixed(2)}deg)`;
      if (tf !== lastT) { lastT = tf; ring.style.transform = tf; }
      const front = Math.round(norm(ang) / (360 / N)) % N;
      if (front !== lastFront) { lastFront = front; panels.forEach((p, i) => p.classList.toggle('front', i === front)); chips.forEach((c, i) => c.classList.toggle('on', i === front)); pickFront(front); }
      if (front !== lastTeam) { lastTeam = front; showTeam(front); }
    });
  });

  return `<div class="lx2 rc ${lux ? 'rc-luxus ' : ''}rc-${tema}">
    <section class="rc-stage" aria-label="A szalon recepciója – húzd oldalra a körbenézéshez">
      ${C.recepcio && C.recepcio.hatter ? `<div class="rc-photo" style="background-image:url(${img(C.recepcio.hatter)})"></div>` : ''}<div class="rc-sky"></div><div class="rc-wall"></div><div class="rc-brand" aria-hidden="true"><span>${esc(C.name)}</span></div><div class="rc-strip"></div><div class="rc-halo"></div><div class="rc-floor"></div>
      <div class="rc-scene"><div class="rc-ring">
        ${rooms.map((s, i) => `<a class="rc-room" href="#/${NR}/${s.k}" draggable="false"><span class="rc-arch" style="background-image:url(${s.img})"></span><span class="rc-sign"><small>${String(i + 1).padStart(2, '0')}</small><b>${esc(s.name)}</b><em>${LX.needN(s)} ${L_('itemWord', 'kezelés')} · belépek →</em></span><span class="rc-glow"></span></a>`).join('')}
      </div></div>
      <div class="rc-team" aria-live="polite"></div>
      <div class="rc-desk"><span class="rc-avatar${LG ? ' rc-lg' : ''}" aria-hidden="true">${LG ? esc(LG.betu || '') : ''}</span><div><small>RECEPCIÓ · ${esc(C.name)}</small><p>${esc(C.recepcio && C.recepcio.koszones || 'Szép napot! Örülünk, hogy itt vagy. Merre kísérhetünk?')}</p>
        <div class="rc-deskcta"><div class="rc-pick"><button class="rc-pick-b" type="button" aria-haspopup="listbox" aria-expanded="false"><small>Terem</small><span>${esc(rooms[0] ? rooms[0].name : '')}</span><i aria-hidden="true">▾</i></button>
          <ul class="rc-pick-l" role="listbox">${rooms.map((s, i) => `<li role="option" data-i="${i}"><b>${String(i + 1).padStart(2, '0')}</b>${esc(s.name)}</li>`).join('')}</ul></div>
          <button class="btn btn-gold rc-go" type="button" data-open="0">Belépek →</button>${C.webshop ? `<a class="btn btn-ghost rc-ws-gomb" href="${esc(C.webshop.kulso || '#/webshop')}">Webshop</a>` : ''}${tel ? `<a class="btn btn-ghost" href="${telHref(tel)}">${esc(tel)}</a>` : ''}</div></div></div>
      ${C.webshop ? `<a class="rc-vitrin bal" href="${esc(C.webshop.kulso || '#/webshop')}" aria-label="${esc(C.webshop.nev || 'Webshop')} webshop"><span class="rc-v-uveg"><i></i><i></i><i></i><span class="rc-v-termek" data-vitrin="bal"></span></span>
        <span class="rc-v-tabla"><small>${esc(C.webshop.nev || 'Webshop')}</small><b>Webshop</b><em>Belépek →</em></span></a>
      <a class="rc-vitrin jobb" href="#/helyben" aria-label="Helyben kapható termékek – hamarosan"><span class="rc-v-uveg"><i></i><i></i><i></i><span class="rc-v-termek" data-vitrin="jobb"></span><span class="rc-v-szalag">Hamarosan</span></span>
        <span class="rc-v-tabla"><small>Csak a szalonban</small><b>Helyben kapható</b><em>Hamarosan</em></span></a>` : ''}
      <button class="rc-arrow l" data-d="-1" type="button" aria-label="Balra">‹</button><button class="rc-arrow r" data-d="1" type="button" aria-label="Jobbra">›</button>
      <small class="rc-hint">húzd oldalra – nézz körül a szalonban</small>
      <div class="rc-beam b1"></div><div class="rc-beam b2"></div><div class="rc-beam b3"></div>
      <div class="rc-doors" aria-hidden="true"><i class="l">${erem('l')}</i><i class="r">${erem('r')}</i><b class="rc-seam"></b><div class="rc-welcome"><small>${esc(C.hero.pill || '')}</small><b>Üdvözlünk az ${esc(C.name)}-ban</b></div></div>
    </section>
    <div class="rc-open" role="dialog" aria-modal="true"><div class="rc-open-bg"></div><div class="rc-open-in wrap"></div></div>
    <section class="sec wrap rc-about"><div><span class="sec-num">${esc(C.name)}</span><h2>${fill(C.hero.title)}</h2><p class="lead">${fill(C.hero.lead)}</p></div>
      <div class="rc-perks">${(C.perks || []).map((x) => `<div><span>${esc(x.ico || '✦')}</span><b>${esc(x.b)}</b><small>${esc(x.s || '')}</small></div>`).join('')}</div></section>
    ${LX.steps().length ? `<section class="sec wrap rc-steps"><h2>${esc(C.ritual.title)}</h2><ol>${LX.steps().map((s, i) => `<li data-fx><span>${String(i + 1).padStart(2, '0')}</span><b>${esc(s.t)}</b><p>${esc(s.d)}</p></li>`).join('')}</ol></section>` : ''}
    ${C.quote ? `<section class="sec wrap rc-quote"><p data-split="w">${fill(C.quote)}</p></section>` : ''}
  </div>`;
};

// minden aloldalon (nem csak a főoldalon): logó-betű a menüben; a „termek” és a „csoportok” fül kikerül a menüből,
// mert a recepción a termek pontosan ezt adják (az oldalak a termekből és a linkekről továbbra is elérhetők)
(function rcGlobal() {
  const go = () => { if (typeof C === 'undefined' || !/^recepcio/.test((typeof LY === 'function' && LY()) || C.layout || '')) return;
    if (C.logo) $$('.brand-mark').forEach((m) => { m.textContent = C.logo.betu || ''; m.classList.add('rc-lg'); });
    const tema = rcTema(), TM = RC_TEMAK[tema], lux = !!TM; if (TM && !document.body.classList.contains('rc-t-' + tema)) document.body.classList.add('rc-t-' + tema);
    if (lux && !document.body.__rcLux) { document.body.__rcLux = 1; const fix = () => { const cl = document.body.classList; if (TM.dark && cl.contains('light')) cl.remove('light'); if (!cl.contains('rc-lux')) cl.add('rc-lux'); };   // csak valódi változáskor ír (különben a figyelő önmagát hívná végtelenül)
      if (C.recepcio.hatter) document.body.style.setProperty('--rc-bg', `url(${img(C.recepcio.hatter)})`);   // aloldalak háttere: a recepció fotója, sötétítve
      fix(); new MutationObserver(fix).observe(document.body, { attributes: true, attributeFilter: ['class'] }); }   // a sötét luxus téma MINDEN aloldalon (közvetlen megnyitásnál is) – soha ne villanjon be a világos
    const nl = document.getElementById('navLinks'); if (nl && !nl.querySelector('a.rc-home')) { const a = document.createElement('a'); a.href = '#/'; a.className = 'rc-home'; a.textContent = 'Főoldal'; nl.prepend(a); }
    if (C.webshop && nl && !nl.querySelector('a.rc-ws')) { const w = document.createElement('a'); w.href = C.webshop.kulso || '#/webshop'; w.className = 'rc-ws' + (C.webshop.kulso ? ' nav-kulso' : ''); w.textContent = 'Webshop'; const ar = nl.querySelector('a[href="#/termekek"]'); if (ar) ar.after(w); else nl.append(w); }
    $$('#navLinks a.rc-ws').forEach((a) => a.classList.toggle('on', /^#\/(webshop|helyben)/.test(location.hash) || (typeof KAT !== 'undefined' && KAT === 'ws' && /^#\/termek\//.test(location.hash))));
    $$('#navLinks a.rc-home').forEach((a) => a.classList.toggle('on', !location.hash || location.hash === '#/' || location.hash === '#'));
    if (!(C.recepcio && C.recepcio.teljesMenu)) $$('#navLinks a').forEach((a) => { const h = (a.getAttribute('href') || '').slice(2); if (h === 'markak' || h === (typeof NR !== 'undefined' ? NR : '')) a.remove(); }); };
  let n = 0; const iv = setInterval(() => { go(); if (++n > 40) clearInterval(iv); }, 150); window.addEventListener('hashchange', () => { setTimeout(go, 0); setTimeout(go, 400); });   // a config később töltődik be – addig újrapróbálja
})();

// a stílus-változatok ugyanazt a felépítést használják (a színvilágot a rcTema() adja)
for (const k of Object.keys(window.RC_TEMAK)) LAYOUTS['recepcio-' + k] = LAYOUTS.recepcio;

// ---------- akciós felugró ablak (Szalon-admin → Akció): a recepcióra lépéskor, munkamenetenként egyszer ----------
function rcAkcio() {
  const A = typeof C !== 'undefined' && C.akcio; if (!A || !A.aktiv || !(A.cim || A.szoveg)) return;
  const ma = new Date().toISOString().slice(0, 10); if ((A.kezd && ma < A.kezd) || (A.vege && ma > A.vege)) return;
  const kulcs = 'rcAkcio:' + (A.cim || '') + (A.vege || ''); try { if (sessionStorage.getItem(kulcs)) return; sessionStorage.setItem(kulcs, '1'); } catch { /* privát mód: mindig megjelenik */ }
  if (document.querySelector('.rc-akcio')) return;
  const tel = (C.contact && C.contact.phone) || '', vege = A.vege ? A.vege.replace(/-/g, '. ') + '.' : '';
  const el = document.createElement('div'); el.className = 'rc-akcio'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', A.cim || 'Akció');
  el.innerHTML = `<div class="rc-akcio-bg"></div><div class="rc-akcio-k">${A.kep ? `<div class="rc-akcio-kep" style="background-image:url(${A.kep})"></div>` : ''}
    <div class="rc-akcio-b"><small>Akció${vege ? ' · ' + esc(vege) + '-ig' : ''}</small><h3>${esc(A.cim || '')}</h3>${A.szoveg ? `<p>${esc(A.szoveg).replace(/\n/g, '<br>')}</p>` : ''}
    ${A.kod ? `<button type="button" class="rc-akcio-kod" title="Kód másolása"><span>Kód</span><b>${esc(A.kod)}</b></button>` : ''}
    <div class="rc-akcio-gombok">${tel ? `<a class="btn btn-gold" href="${telHref(tel)}">${esc(A.gomb || 'Bejelentkezem')}</a>` : ''}<button type="button" class="btn btn-ghost rc-akcio-x">${tel ? 'Később' : 'Rendben'}</button></div></div>
    <button type="button" class="rc-akcio-zar" aria-label="Bezárás">×</button></div>`;
  document.body.appendChild(el); requestAnimationFrame(() => el.classList.add('on'));
  const zar = () => { el.classList.remove('on'); setTimeout(() => el.remove(), 400); removeEventListener('keydown', esck); };
  const esck = (e) => { if (e.key === 'Escape') zar(); }; addEventListener('keydown', esck);
  el.querySelectorAll('.rc-akcio-bg, .rc-akcio-x, .rc-akcio-zar').forEach((b) => b.addEventListener('click', zar));
  const kb = el.querySelector('.rc-akcio-kod'); if (kb) kb.addEventListener('click', () => { try { navigator.clipboard.writeText(A.kod); kb.querySelector('span').textContent = 'Másolva ✓'; } catch { /* a kód így is látszik */ } });
}

// ---------- HELYBEN KAPHATÓ aloldal (a webshop maga az app.js boltja: körhinta, szűrők, termékoldal, közös kosár – config.webshop) ----------
window.EXTRA_ROUTES = Object.assign(window.EXTRA_ROUTES || {}, {
  helyben: () => (C.helyben && C.helyben.aktiv && (C.helyben.termekek || []).length ? `<section class="page wrap ws-oldal"><div class="page-head rv"><span class="sec-num">Csak a szalonban</span><h1>Helyben kapható termékek</h1>
      <p>Ezeket a termékeket a forgalmazó kérésére csak személyesen, a szalonban vásárolhatod meg. Nézd át otthon kényelmesen, és kérd a következő kezelésed után.</p></div>
      <div class="hb-racs">${C.helyben.termekek.map((x) => `<article class="hb-kartya"><div class="hb-kep">${x.kep ? `<img src="${x.kep}" alt="${esc(x.nev)}" loading="lazy">` : ''}<span class="hb-cimke">Csak a szalonban</span></div>
        <div class="hb-b">${x.marka ? `<small>${esc(x.marka)}</small>` : ''}<h3>${esc(x.nev)}</h3>${x.rovid ? `<p>${esc(x.rovid)}</p>` : ''}${x.ar != null ? `<b>${Number(x.ar).toLocaleString('hu-HU')} Ft <span>a szalonban</span></b>` : ''}</div></article>`).join('')}</div>
      ${C.contact && C.contact.phone ? `<div class="ws-gombok" style="margin-top:22px"><span class="muted">Kérdezz rá, vagy foglald le:</span><a class="btn btn-gold" href="${telHref(C.contact.phone)}">${esc(C.contact.phone)}</a></div>` : ''}</section>`
    : `<section class="page wrap ws-oldal"><div class="page-head rv"><span class="sec-num">Csak a szalonban</span><h1>Helyben kapható termékek</h1>
      <p>Vannak termékek, amelyeket a forgalmazó csak személyesen, a szalonban enged értékesíteni. Hamarosan itt is végignézheted őket, hogy otthon kényelmesen kiválaszd, mit kérsz a következő kezelésed után.</p></div>
      <div class="ws-hamarosan"><span class="ws-badge">Hamarosan</span><p>Addig kérdezz rá bátran a szalonban, vagy nézd meg a webshop kínálatát.</p>
      <div class="ws-gombok">${C.webshop ? '<a class="btn btn-gold" href="#/webshop">A webshop kínálata →</a>' : ''}${C.contact && C.contact.phone ? `<a class="btn btn-ghost" href="${telHref(C.contact.phone)}">${esc(C.contact.phone)}</a>` : ''}</div></div></section>`),
});

// ---------- BLOG: két ajtó (config.blogSzobak) – az egyik a szalon, a másik a webshop blogjába visz; bent váltófül ----------
// #/blog → a két ajtó · #/blog/<szoba> → az adott blog cikkei · #/blog/<cikk> → a cikk (app.js article())
window.EXTRA_ROUTES = Object.assign(window.EXTRA_ROUTES || {}, {
  blog: (seg) => {
    const SZ = C.blogSzobak || {}, kulcsok = Object.keys(SZ);
    if (!kulcsok.length) return seg[1] ? article(seg[1]) : blog();
    if (seg[1] && !SZ[seg[1]]) return article(seg[1]);
    const db = (k) => S.posts.filter((x) => x.forras === k), hr = (k) => SZ[k].kulso || '#/blog/' + k;
    const dbsz = (k) => (SZ[k].kulso ? SZ[k].db || 0 : db(k).length), kp = (k) => (SZ[k].kulso ? SZ[k].kep : (db(k)[0] || {}).image);
    if (!seg[1]) {   // a két ajtó
      setTimeout(() => $$('.bl-ajto').forEach((a) => a.addEventListener('click', (e) => {
        e.preventDefault(); if (a.classList.contains('nyit')) return; a.classList.add('nyit');
        setTimeout(() => { const h = a.getAttribute('href'); if (/^https?:/.test(h)) location.href = h; else location.hash = h; }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1050); })));
      return `<section class="page wrap bl-bejarat"><div class="page-head rv"><span class="sec-num">Blog</span><h1>${esc(C.labels.blogTitle || 'Blog')}</h1>
        <p>Két szoba, két téma. Lépj be, ahová kedved tartja.</p></div>
        <div class="bl-ajtok">${kulcsok.map((k) => `<a class="bl-ajto" href="${esc(hr(k))}" aria-label="${esc(SZ[k].nev)} – ${dbsz(k)} cikk">
          <span class="bl-keret"><span class="bl-mogotte" style="background-image:url(${kp(k) || ''})"></span><span class="bl-feny"></span>
            <span class="bl-szarny bal"><i></i></span><span class="bl-szarny jobb"><i></i></span></span>
          <span class="bl-tabla"><small>${esc(SZ[k].alcim || '')}</small><b>${esc(SZ[k].nev)}</b><em>${dbsz(k)} cikk · ${SZ[k].kulso ? 'Átlépek →' : 'Belépek →'}</em></span>
          <span class="bl-leiras">${esc(SZ[k].leiras || '')}</span></a>`).join('')}</div></section>`;
    }
    const k = seg[1], L = db(k);   // egy „szoba”: a blog cikkei, fent váltófül
    return `<section class="page wrap bl-szoba"><div class="bl-ful" role="tablist" aria-label="Blogok">${kulcsok.map((x) => `<a role="tab" href="${esc(hr(x))}" class="${x === k ? 'on' : ''}" aria-selected="${x === k}">${esc(SZ[x].nev)} <span>${dbsz(x)}</span></a>`).join('')}</div>
      <div class="page-head rv"><span class="sec-num">${esc(SZ[k].alcim || 'Blog')}</span><h1>${esc(SZ[k].nev)}</h1><p>${esc(SZ[k].leiras || '')}</p></div>
      <div class="posts">${L.map(postCard).join('') || '<p class="muted">Még nincs cikk.</p>'}</div>
      <p style="margin-top:26px"><a class="link-more" href="#/blog">← Vissza a két ajtóhoz</a></p></section>`;
  },
});
