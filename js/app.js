/* The studio page: card picker, form (built from each card's fields), photos (auto analyse, cut-out, crest cleanup,
   bulk drop that sends every picture to its best slot), theme / fonts / logo / footer, the shared editor
   (js/studio-edit.js), auto logo corner + colour, HD download, share and caption. Text settings are remembered
   in this browser; photos stay on the device. */
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const KEY = 'st-studio-v2';
  // T wraps in a span: inside the flex text boxes a highlighted word must stay on the same line as the rest
  const P = (s) => ST.plain(s), T = (s) => `<span>${ST.rich(s)}</span>`;

  // ---------------------------------------------------------------- state
  const fresh = () => ({
    card: 'news', size: 'portrait', theme: 'neo', pair: 'sporty', hf: 'Anek Bangla', bf: 'Hind Siliguri', hscale: 100,
    bn: true, pattern: true, logoStyle: 'stacked', logoPos: 'auto', logoColor: 'white', logoA: '#ffffff', logoB: '#e0a030',
    foot: 'brand', slogan: 'সব খেলার গল্প, *একটাই টাইমলাইনে*', handle: 'fb.com/sportstimelinebd',
    ui: 'bn', lang: 'bn', group: '', data: {}, dataEn: {}, layouts: {}, moves: {}, hidden: {},
  });
  let state = fresh();
  try { Object.assign(state, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { /* first visit or private mode */ }
  // the page asked for an all-white logo by default (2026-10-28): move older saved settings over once
  if (!state.v3) { if (state.logoColor === 'auto') state.logoColor = 'white'; state.v3 = true; }
  // the example text and what the admin typed, kept apart for Bangla and English posters
  for (const c of ST.CARDS) {
    state.data[c.id] = Object.assign({}, c.data, state.data[c.id] || {});
    state.dataEn[c.id] = Object.assign({}, c.dataEn || c.data, state.dataEn[c.id] || {});
  }
  const D = () => state.lang === 'en' ? state.dataEn : state.data;
  const sample = c => (state.lang === 'en' && c.dataEn) || c.data;
  const tr = ST.tr;
  ST.ui = state.ui; ST.lang = state.lang;
  // pictures live only in memory (and in the photo library), never in localStorage
  const photos = {};          // card id -> [photo]
  const media = { bg: '', sponsor: '' };
  const teamColors = {};      // 1|2 -> colour from that team's crest
  let saveT = 0;
  const save = () => { clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* full or blocked */ } }, 300); };

  const card = () => ST.card(state.card);
  const layout = () => { const c = card(); const L = state.layouts[c.id]; return c.layouts[L] ? L : Object.keys(c.layouts)[0]; };
  const H = () => ST.SIZES[state.size].H;
  const footH = () => state.foot === 'off' ? 0 : { portrait: 110, square: 96, story: 140 }[state.size];
  const pics = () => (photos[state.card] ||= []);
  const moveKey = () => `${state.card}:${layout()}:${state.size}`;
  const say = t => { $('#status').textContent = t; };

  // ---------------------------------------------------------------- photo slots
  // a slot can want another kind of picture in some layouts (modes: { photo: 'scene' } = the full photo, not the cut-out)
  const slotMode = (c, i, L) => { const s = c.photos[i]; return (s.modes && s.modes[L]) || (s.side && L === 'side' ? s.side : s.mode); };
  // the picture to draw for a slot: the cut-out when the slot wants a cut-out and one is ready
  function shown(p, mode) {
    if ((mode === 'cut' || p.wantCut) && p.cut) return p.cut;
    return p;
  }
  const busy = new Set();
  // force: the admin pressed "remove background" on this photo, so the auto switch does not matter
  async function ensureCut(p, force) {
    if (p.alpha || p.cut || p.noCut || busy.has(p) || (!force && !$('#autoCut').checked)) return;
    busy.add(p);
    try {
      const src = await ST.cutOut(p.src, say), a = await ST.analyse(src);
      p.cut = { src, w: a.w, h: a.h, dx: 0, dy: 0, zoom: 1 };
      buildPhotos();
      // the admin's nudges belong to the picture they see
      render();
    } catch (e) { console.warn('cut-out failed', e); p.noCut = true; say(tr('অটো কাট-আউট হয়নি (ইন্টারনেট লাগবে)। সাধারণ ছবি বসানো হলো। ~ Cut-out failed (needs internet). The plain photo is used.')); }
    busy.delete(p);
  }

  /* One picture into one slot: looked at once (size, see-through, focus), a crest on a plain background gets that
     background removed, a player gets cut out when the slot needs it. */
  async function setPhoto(cid, i, src, keepName) {
    const c = ST.card(cid), slot = c.photos[i];
    let a = await ST.analyse(src);
    if (slot.mode === 'logo' && !a.alpha) { src = await ST.clearLogoBg(src); a = await ST.analyse(src); }
    const p = { src, w: a.w, h: a.h, fx: a.fx, fy: a.fy, ty: a.ty, alpha: a.alpha, lum: a.lum, dx: 0, dy: 0, zoom: 1, name: keepName || '' };
    (photos[cid] ||= [])[i] = p;
    if (slot.mode === 'logo' && slot.team) ST.logoColor(src).then(col => { if (col) { teamColors[slot.team] = col; render(); } }).catch(() => {});
    render(); buildPhotos();
    if (slotMode(c, i, state.layouts[cid] || Object.keys(c.layouts)[0]) === 'cut' || slot.side) ensureCut(p);
  }

  /* Several pictures at once: each goes to the empty slot that suits it best (logo -> crest slot, see-through or
     portrait person -> cut-out slot, ordinary photo -> scene slot), then to any slot that is still empty. */
  async function bulk(files) {
    const c = card(), list = [...files].filter(f => f.type.startsWith('image/'));
    if (!list.length) return;
    say(tr('ছবি দেখা হচ্ছে… ~ Looking at the photos…'));
    const items = [];
    for (const f of list) { const src = await ST.readFile(f); items.push({ src, kind: ST.kindOf(await ST.analyse(src)) }); }
    const free = c.photos.map((s, i) => i).filter(i => !pics()[i]);
    const want = { logo: ['logo'], cut: ['cut', 'scene'], scene: ['scene', 'cut'] };
    const order = it => want[it.kind];
    let used = 0;
    for (const pass of [0, 1, 2]) for (const it of items) {
      if (it.done) continue;
      const i = free.find(j => !pics()[j] && !it.done && (pass === 2 || c.photos[j].mode === (order(it)[pass] || '_')));
      if (i == null) continue;
      it.done = true; used++;
      await setPhoto(c.id, i, it.src);
    }
    // pictures that found no empty slot replace the main photo
    const left = items.filter(it => !it.done);
    if (left.length && !c.photos.length) say(tr('এই কার্ডে ছবির জায়গা নেই। ~ This card has no photo spots.'));
    else say(state.ui === 'en' ? `${used} photo(s) placed${left.length ? ` (${left.length} left over: every spot is full)` : ''} ✓` : `${used} টা ছবি বসানো হয়েছে${left.length ? ` (${left.length} টা বাকি: সব জায়গা ভরা)` : ''} ✓`);
  }

  // ---------------------------------------------------------------- poster
  const box = (x, y, w, h) => `left:${Math.round(x)}px;top:${Math.round(y)}px;width:${Math.round(w)}px;height:${Math.round(h)}px`;
  // a crest slot with no picture shows the country's flag when the team name is a country (বাংলাদেশ, India…)
  const flagKeys = Object.keys(window.ST_FLAGS || {}).sort((a, b) => b.length - a.length);
  function flagOf(name) {
    const n = String(name || '').trim().toLowerCase(); if (!n) return '';
    if (ST_FLAGS[n]) return ST_FLAGS[n];
    const k = flagKeys.find(k => k.length > 3 && n.startsWith(k)); return k ? ST_FLAGS[k] : '';
  }
  const teamName = (s, d) => s.flag ? d[s.flag] : s.team === 1 ? (d.t1 ?? d.team ?? d.winner) : s.team === 2 ? (d.t2 ?? d.opp ?? d.loser) : '';
  const faceCache = {};
  function face(name) {
    if (!name) return '';
    const k = BPG.lib.norm(name);
    if (k in faceCache) return faceCache[k];
    faceCache[k] = '';
    if (BPG.lib.ok()) BPG.lib.find(name).then(r => { if (r[0] && r[0].score >= 2) { faceCache[k] = URL.createObjectURL(r[0].blob); render(); } }).catch(() => {});
    return '';
  }

  function theme() {
    const t = ST.THEMES[state.theme] || ST.THEMES.green;
    if (!t.auto) return t;
    return ST.teamTheme(teamColors[1] || '#1d5238', teamColors[2]);
  }

  let auto = { corner: null, color: null, key: '' };   // what the logo probe decided for this look
  const LOGO_W = { stacked: 190, wide: 330, icon: 130 };
  // logo height from its drawing's proportions
  const logoH = (style, w) => { const v = ST_BRAND[style].match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number); return w * v[3] / v[2]; };
  function logoHtml(c, L, CB) {
    if (state.logoStyle === 'off') return '';
    const w = LOGO_W[state.logoStyle], svgH = logoH(state.logoStyle, w), m = 44;
    const corners = (c.logo && c.logo[L]) || ['tr'];
    const corner = state.logoPos !== 'auto' ? state.logoPos : (auto.key === lookKey() && auto.corner) || corners[0];
    const x = corner[1] === 'l' ? m : 1080 - m - w, y = corner[0] === 't' ? m - 6 : CB - m - svgH;
    let col = state.logoColor;
    if (col === 'auto') col = (auto.key === lookKey() && auto.color) || theme().logo || 'brand';
    const lc = col === 'custom' ? { a: state.logoA, b: state.logoB, bg: '#123524' } : ST.LOGO_COLORS[col];
    const vars = `--logo-a:${lc.a};--logo-b:${lc.b};--logo-bg:${lc.bg}`;
    return `<div class="mv" data-move="logo"><div class="st-logo ${col === 'white' || col === 'whiteGold' ? 'shadow' : ''}" style="left:${x}px;top:${y}px;width:${w}px;${vars}">${ST_BRAND[state.logoStyle]}</div></div>`;
  }
  // everything that changes what the poster looks like, except the logo itself
  const lookKey = () => JSON.stringify([state.card, layout(), state.size, state.theme, state.foot, state.logoStyle, (pics()).map(p => p && (p.src.length + (p.cut ? 1 : 0) + p.dx + p.dy + p.zoom)), media.bg.length]);

  function footHtml() {
    const fh = footH(); if (!fh) return '';
    const y = H() - fh;
    if (state.foot === 'sponsor') return `<div class="mv" data-move="foot"><div class="st-foot sponsor" style="top:${y}px;height:${fh}px">${media.sponsor ? `<img src="${media.sponsor}">` : '<div class="ph-hint" data-slot="sponsor">বিজ্ঞাপনের ব্যানার দিন</div>'}</div></div>`;
    // three fixed columns, so nothing can push into anything else on any screen: slogan | follow + page | logo
    return `<div class="mv" data-move="foot"><div class="st-foot" style="top:${y}px;height:${fh}px"><div class="slogan" data-fit data-min=".5"><span>${ST.rich(state.slogan, false)}</span></div>
      <div class="fcta"><div class="follow">${ST.t('ফলো করুন', 'Follow')} ➜</div>${state.handle ? `<div class="handle">${ST.esc(state.handle)}</div>` : ''}</div>
      <div class="flogo" style="--logo-a:#fff;--logo-b:#fff">${ST_BRAND.stacked}</div></div></div>`;
  }

  const poster = $('#poster');
  function render() {
    ST.useBn = state.bn; ST.lang = state.lang; ST.tagText = ST.TAGS[state.lang];
    const c = card(), L = layout(), Hh = H(), CB = Hh - footH(), th = theme(), hidden = (state.hidden[moveKey()] ||= {});
    const ph = (i, x, y, w, h, cls = '', mode) => {
      mode = mode || slotMode(c, i, L);
      const p = pics()[i], s = c.photos[i];
      if (!s) return '';
      const shape = cls.includes('crest') ? 'crest' : '';
      const fl = !p && mode === 'logo' && flagOf(teamName(s, D()[c.id]));
      if (fl) return `<div class="ph logo flag ${shape} ${cls}" style="${box(x, y, w, h)}"><img class="flag-img" data-slot="${i}" src="flags/${fl}.svg" alt=""></div>`;
      if (!p) return `<div class="ph ${mode} ${shape} ${cls} empty" style="${box(x, y, w, h)}"><div class="ph-hint" data-slot="${i}">📷<br>${ST.esc(tr(s.label).replace(/\s*\(.*\)/, ''))}</div></div>`;
      const q = shown(p, mode);
      return `<div class="ph ${mode} ${cls}" style="${box(x, y, w, h)}"><img data-p="${i}" src="${q.src}" style="${ST.place(q, w, h, mode === 'cut' && q === p && !p.alpha ? 'scene' : mode)}"></div>`;
    };
    const sec = (key, html, on = true) => on ? `<div class="mv" data-move="${key}">${html}</div>` : '';
    const ctx = { L, H: Hh, CB, T, P, sec, ph, box, has: i => !!pics()[i], face, t: ST.t };
    const f = ST.FONTS[state.hf] || {}, fb = ST.FONTS[state.bf] || {};
    const vars = Object.entries({ bg: th.bg, bg2: th.bg2, ink: th.ink, mute: th.mute, acc: th.acc, acc2: th.acc2, pan: th.pan, pink: th.pink, 'acc-ink': th.accInk || '#111', ...(c.vars || {}) }).map(([k, v]) => `--${k}:${v}`).join(';')
      + `;--hf:'${state.hf}';--hw:${f.w || 700};--hs:${f.stretch || '100%'};--bf:'${state.bf}';--bw:${fb.bw || 500};height:${Hh}px`;
    const bg = media.bg ? `<div class="bgl image" style="background-image:url(${media.bg})"></div>` : `<div class="bgl ${state.pattern ? 'pattern' : ''} ${th.light ? 'light' : ''} ${th.flat ? 'flat' : ''}"></div>`;
    poster.innerHTML = `<div class="st ${th.light ? 'light' : ''}" id="st" style="${vars}">${bg}${c.render(D()[c.id], ctx)}${logoHtml(c, L, CB)}${footHtml()}</div>`;
    const st = $('#st');
    // headline size slider: scales every headline-font block before fitting
    if (state.hscale !== 100) $$('.news-head,.q-text,.xi-team,.plist,.mega-status,.flash-band', st).forEach(el => { el.style.fontSize = parseFloat(getComputedStyle(el).fontSize) * state.hscale / 100 + 'px'; el.dataset.base = el.style.fontSize; });
    fitAll(st);
    if (editing) StudioEdit.afterRender();
    // a picture that should be cut out but isn't yet
    c.photos.forEach((s, i) => { const p = pics()[i]; if (p && slotMode(c, i, L) === 'cut') ensureCut(p); });
    // a player slot with a name and no picture: try the photo library
    c.photos.forEach((s, i) => {
      if (!s.name || pics()[i] || !BPG.lib.ok()) return;
      const nm = D()[c.id][s.name]; if (!nm || libTried[c.id + i] === nm) return;
      libTried[c.id + i] = nm;
      BPG.lib.find(nm).then(async r => { if (r[0] && r[0].score >= 2 && !pics()[i]) { await setPhoto(c.id, i, await ST.readFile(r[0].blob), nm); say(`লাইব্রেরি থেকে ${nm} এর ছবি বসানো হলো ✓`); } }).catch(() => {});
    });
    $('#caption').value = caption();
    save();
    probeSoon();
    fitFrame();
  }
  const libTried = {};

  // fitText also honours the slider: data-base is the scaled start size
  function fitAll(root) {
    $$('[data-fit]', root).forEach(el => { if (el.dataset.base) el.style.fontSize = el.dataset.base; });
    root.querySelectorAll('[data-fit]').forEach(el => {
      const start = parseFloat(getComputedStyle(el).fontSize), min = start * (parseFloat(el.dataset.min) || 0.4);
      const wOnly = el.dataset.fit === 'w';
      // a text box holding one wrapped span is measured by the span: Bangla letters reach past the line box, which
      // would make scrollHeight report an overflow at any size
      const kid = el.children.length === 1 && el.firstElementChild.tagName === 'SPAN' ? el.firstElementChild : null;
      // right-aligned rows spill to the left, which scrollWidth never reports: check where the text really starts
      const spillLeft = () => { const L = el.getBoundingClientRect().left - 1; return [...el.querySelectorAll('li > span')].some(c => c.getBoundingClientRect().left < L); };
      const over = () => (!wOnly && (kid ? kid.offsetHeight : el.scrollHeight) > el.clientHeight + 2) || el.scrollWidth > el.clientWidth + 2 || spillLeft();
      if (!over()) return;
      let lo = min, hi = start;
      for (let i = 0; i < 9; i++) { const m = (lo + hi) / 2; el.style.fontSize = m + 'px'; if (over()) hi = m; else lo = m; }
      el.style.fontSize = lo + 'px';
    });
  }

  /* Logo corner + colour: draw the poster small without the logo, look at each corner the layout allows, and put the
     logo where it is calmest; on a light spot it turns green, on a dark or busy one it stays light. */
  let probeT = 0;
  function probeSoon() {
    if (state.logoStyle === 'off' || (state.logoPos !== 'auto' && state.logoColor !== 'auto')) return;
    const k = lookKey(); if (auto.key === k) return;
    clearTimeout(probeT); probeT = setTimeout(() => probe(k), 400);
  }
  async function probe(k) {
    const st = $('#st'); if (!st || k !== lookKey()) return;
    try {
      const s = 0.1, cv = await htmlToImage.toCanvas(st, { width: 1080, height: H(), pixelRatio: s, skipFonts: true, cacheBust: false,
        filter: n => !(n.classList && (n.classList.contains('st-logo') || n.classList.contains('ph-hint'))) });
      if (k !== lookKey()) return;
      const g = cv.getContext('2d', { willReadFrequently: true }), c = card(), L = layout(), CB = H() - footH();
      const w = LOGO_W[state.logoStyle], h = logoH(state.logoStyle, w), m = 44;
      let best = null;
      for (const corner of (c.logo && c.logo[L]) || ['tr']) {
        const x = corner[1] === 'l' ? m : 1080 - m - w, y = corner[0] === 't' ? m : CB - m - h;
        const d = g.getImageData(Math.round(x * s * cv.width / (1080 * s)), Math.round(y * s * cv.height / (H() * s)), Math.max(1, Math.round(w * s)), Math.max(1, Math.round(h * s))).data;
        let sum = 0, sq = 0, n = 0;
        for (let i = 0; i < d.length; i += 4) { const l = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255; sum += l; sq += l * l; n++; }
        const mean = sum / n, varc = sq / n - mean * mean;
        if (!best || varc < best.varc - 0.004) best = { corner, mean, varc };
      }
      const th = theme();
      const col = best.mean > 0.55 ? (th.light ? th.logo : 'green') : best.varc > 0.03 ? 'whiteGold' : (th.light ? 'whiteGold' : th.logo || 'brand');
      auto = { corner: best.corner, color: col, key: k };
      render();
    } catch (e) { console.warn('logo probe', e); auto.key = k; }
  }

  // ---------------------------------------------------------------- preview size
  const frame = $('#frame'), stage = $('#stage');
  function fitFrame() {
    const mob = innerWidth <= 760, bar = $('.act-bar').offsetHeight + 16;
    const maxH = mob ? innerHeight * 0.5 : innerHeight - 40 - bar;
    const s = Math.max(0.15, Math.min((stage.clientWidth - (mob ? 20 : 48)) / 1080, maxH / H()));
    frame.style.width = Math.floor(1080 * s) + 'px'; frame.style.height = Math.floor(H() * s) + 'px';
    poster.style.transform = `scale(${s})`;
  }
  addEventListener('resize', fitFrame);

  // ---------------------------------------------------------------- form
  // shelves (cricket, Test, football…) as tabs, then the cards on the open shelf
  function buildCards() {
    const g = ST.GROUPS[state.group] ? state.group : card().group;
    state.group = g;
    $('#cards').innerHTML = `<div class="shelves">${Object.entries(ST.GROUPS).map(([k, v]) => `<button type="button" data-group="${k}" class="${k === g ? 'on' : ''}">${tr(v)}</button>`).join('')}</div>
      <div class="card-grid">${ST.CARDS.filter(c => c.group === g).map(c => `<button type="button" data-card="${c.id}" class="${c.id === state.card ? 'on' : ''}"><i>${c.icon}</i>${tr(c.name)}</button>`).join('')}</div>`;
  }
  $('#cards').addEventListener('click', e => {
    const s = e.target.closest('[data-group]'); if (s) { state.group = s.dataset.group; buildCards(); save(); return; }
    const b = e.target.closest('[data-card]'); if (!b) return;
    state.card = b.dataset.card; buildCards(); buildForm(); render(); StudioEdit.reset();
  });

  function buildForm() {
    const c = card(), d = D()[c.id];
    $('#layout').innerHTML = Object.entries(c.layouts).map(([k, v]) => `<option value="${k}">${tr(v)}</option>`).join('');
    $('#layout').value = layout();
    $('#fields').innerHTML = c.fields.map(([k, label, type, rows]) => {
      label = tr(label);
      if (type.startsWith('select:')) return `<label>${label}<select data-f="${k}">${type.slice(7).split(',').map(o => { const [v, t] = o.split('='); return `<option value="${v}">${tr(t)}</option>`; }).join('')}</select></label>`;
      if (type === 'area') return `<label>${label}<textarea data-f="${k}" rows="${rows || 3}"></textarea></label>`;
      return `<label>${label}<input data-f="${k}"></label>`;
    }).join('') + `<button type="button" class="small" id="resetText">${tr('উদাহরণের লেখা ফেরাও ~ Bring back the example text')}</button>`;
    $$('[data-f]', $('#fields')).forEach(i => { i.value = d[i.dataset.f] ?? ''; });
    buildPhotos();
  }
  $('#fields').addEventListener('input', e => { const i = e.target.closest('[data-f]'); if (!i) return; D()[state.card][i.dataset.f] = i.value; render(); });
  $('#fields').addEventListener('change', e => { const i = e.target.closest('select[data-f]'); if (!i) return; D()[state.card][i.dataset.f] = i.value; render(); });
  $('#fields').addEventListener('click', e => { if (e.target.id !== 'resetText') return; D()[state.card] = { ...sample(card()) }; buildForm(); render(); });
  $('#layout').addEventListener('change', e => { state.layouts[state.card] = e.target.value; render(); StudioEdit.reset(); });

  function buildPhotos() {
    const c = card();
    $('#secPhotos').hidden = !c.photos.length;
    $('#photos').innerHTML = c.photos.map((s, i) => {
      const p = pics()[i];
      return `<div class="slot"><div class="thumb">${p ? `<img src="${(p.cut || p).src}">` : '📷'}</div><div class="slot-body"><b>${tr(s.label)}</b>
        <div class="slot-row"><label class="file">${tr(p ? 'বদলাও ~ Change' : 'ছবি দিন ~ Add photo')}<input type="file" accept="image/*" data-slot-file="${i}"></label>
        ${p ? `<button type="button" class="small" data-slot-clear="${i}">✕ ${tr('সরাও ~ Remove')}</button>` : ''}
        ${p && !p.alpha && slotMode(c, i, layout()) !== 'cut' ? `<button type="button" class="small ${p.wantCut ? 'on' : ''}" data-slot-cut="${i}">✂ ${tr(p.wantCut ? 'ব্যাকগ্রাউন্ড ফেরাও ~ Bring background back' : 'ব্যাকগ্রাউন্ড সরাও ~ Remove background')}</button>` : ''}
        ${p && s.name && D()[c.id][s.name] && BPG.lib.ok() ? `<button type="button" class="small" data-slot-save="${i}" title="${tr('এই নামে পরেরবার নিজে থেকেই বসবে ~ Next time this name brings the photo by itself')}">${tr('লাইব্রেরিতে রাখো ~ Save to library')}</button>` : ''}</div></div></div>`;
    }).join('');
  }
  $('#photos').addEventListener('change', async e => {
    const i = e.target.dataset.slotFile; if (i == null || !e.target.files[0]) return;
    await setPhoto(state.card, +i, await ST.readFile(e.target.files[0]));
  });
  $('#photos').addEventListener('click', async e => {
    const c = e.target.dataset.slotClear, s = e.target.dataset.slotSave, k = e.target.dataset.slotCut;
    if (k != null) { const p = pics()[+k]; p.wantCut = !p.wantCut; if (p.wantCut) ensureCut(p, true); render(); buildPhotos(); return; }
    if (c != null) { pics()[+c] = undefined; libTried[state.card + c] = D()[state.card][card().photos[+c].name]; render(); buildPhotos(); }
    if (s != null) {
      const p = pics()[+s], name = D()[state.card][card().photos[+s].name];
      const blob = await (await fetch((p.cut || p).src)).blob();
      await BPG.lib.add(name, blob); say(`"${name}" এর ছবি লাইব্রেরিতে রাখা হলো ✓ এরপর নাম লিখলেই বসে যাবে।`);
    }
  });
  // click an empty spot on the poster to fill it
  let pickSlot = null;
  const picker = Object.assign(document.createElement('input'), { type: 'file', accept: 'image/*' });
  picker.addEventListener('change', async () => {
    const f = picker.files[0]; picker.value = ''; if (!f) return;
    const src = await ST.readFile(f);
    if (pickSlot === 'sponsor') { media.sponsor = src; render(); } else await setPhoto(state.card, +pickSlot, src);
  });
  frame.addEventListener('click', e => { const h = e.target.closest('[data-slot]'); if (!h) return; pickSlot = h.dataset.slot; picker.click(); });

  // bulk: the box in the form, or drop files on the poster
  $('#bulk').addEventListener('change', e => { bulk(e.target.files); e.target.value = ''; });
  for (const el of [frame, $('#drop')]) {
    el.addEventListener('dragover', e => { e.preventDefault(); el.classList.add('over'); });
    el.addEventListener('dragleave', () => el.classList.remove('over'));
    el.addEventListener('drop', e => { e.preventDefault(); el.classList.remove('over'); bulk(e.dataTransfer.files); });
  }
  // paste a picture (Ctrl+V) = drop it
  addEventListener('paste', e => { const f = [...(e.clipboardData || {}).files || []]; if (f.length) bulk(f); });

  // ---- style ----
  const opt = (sel, obj, label = v => tr(v.name)) => { const el = $(sel), v = el.value; el.innerHTML = Object.entries(obj).map(([k, o]) => `<option value="${k}">${label(o, k)}</option>`).join(''); if (v) el.value = v; };
  function buildStyle() {
    opt('#size', ST.SIZES); opt('#pair', ST.FONT_PAIRS); opt('#hf', ST.FONTS); opt('#bf', ST.FONTS); opt('#logoColor', ST.LOGO_COLORS);
    $('#themes').innerHTML = Object.entries(ST.THEMES).map(([k, t]) => `<button type="button" data-theme="${k}" title="${tr(t.name)}" style="--a:${t.bg || '#888'};--b:${t.acc || '#fff'}"><i></i><span>${tr(t.name)}</span></button>`).join('');
    $('#fontStrip').innerHTML = Object.entries(ST.FONT_PAIRS).map(([k, p]) => `<button type="button" data-pair="${k}" style="font-family:'${p.head}';font-weight:${ST.FONTS[p.head].w};font-stretch:${ST.FONTS[p.head].stretch || '100%'}">${state.lang === 'en' ? 'Play' : 'খেলা'}</button>`).join('');
  }
  buildStyle();
  const bind = (sel, key, ev = 'change', fn) => { const el = $(sel); if (el.type === 'checkbox') el.checked = state[key]; else el.value = state[key];
    el.addEventListener(ev, () => { state[key] = el.type === 'checkbox' ? el.checked : el.type === 'range' ? +el.value : el.value; fn && fn(); render(); }); };
  bind('#size', 'size', 'change', () => StudioEdit.reset());
  bind('#hf', 'hf'); bind('#bf', 'bf'); bind('#bn', 'bn'); bind('#pattern', 'pattern');
  bind('#hscale', 'hscale', 'input', () => { $('#hscaleV').textContent = state.hscale + '%'; }); $('#hscaleV').textContent = state.hscale + '%';
  bind('#logoStyle', 'logoStyle'); bind('#logoPos', 'logoPos'); bind('#logoColor', 'logoColor', 'change', syncBrand);
  bind('#logoA', 'logoA', 'input'); bind('#logoB', 'logoB', 'input');
  bind('#foot', 'foot', 'change', syncBrand); bind('#slogan', 'slogan', 'input'); bind('#handle', 'handle', 'input');
  function setPair(k) { const p = ST.FONT_PAIRS[k]; state.pair = k; state.hf = p.head; state.bf = p.body; $('#pair').value = k; $('#hf').value = p.head; $('#bf').value = p.body; markStyle(); render(); }
  $('#pair').value = state.pair; $('#pair').addEventListener('change', e => setPair(e.target.value));
  $('#fontStrip').addEventListener('click', e => { const b = e.target.closest('[data-pair]'); if (b) setPair(b.dataset.pair); });
  $('#themes').addEventListener('click', e => { const b = e.target.closest('[data-theme]'); if (!b) return; state.theme = b.dataset.theme; markStyle(); render(); });
  function markStyle() {
    $$('[data-theme]').forEach(b => b.classList.toggle('on', b.dataset.theme === state.theme));
    $$('[data-pair]').forEach(b => b.classList.toggle('on', b.dataset.pair === state.pair));
  }
  function syncBrand() {
    $('#logoCustom').hidden = state.logoColor !== 'custom';
    $('#footBrand').hidden = state.foot !== 'brand'; $('#footSponsor').hidden = state.foot !== 'sponsor';
  }
  $('#bgFile').addEventListener('change', async e => { const f = e.target.files[0]; media.bg = f ? await ST.readFile(f) : ''; $('#bgClear').hidden = !media.bg; render(); });
  $('#bgClear').addEventListener('click', () => { media.bg = ''; $('#bgFile').value = ''; $('#bgClear').hidden = true; render(); });
  $('#sponsorFile').addEventListener('change', async e => { const f = e.target.files[0]; media.sponsor = f ? await ST.readFile(f) : ''; render(); });

  // ---------------------------------------------------------------- photo drag / wheel (sections are moved by studio-edit)
  const posterScale = () => frame.getBoundingClientRect().width / 1080;
  const live = i => { const c = card(), p = pics()[i]; return p && shown(p, slotMode(c, i, layout())); };
  let drag = null;
  frame.addEventListener('pointerdown', e => {
    const el = e.target.closest('[data-p]'); if (!el) return;
    const t = live(+el.dataset.p); if (!t) return;
    drag = { t, x: e.clientX, y: e.clientY, dx: t.dx, dy: t.dy };
    frame.setPointerCapture(e.pointerId); frame.classList.add('dragging');
  });
  frame.addEventListener('pointermove', e => {
    if (!drag) return;
    const s = posterScale();
    drag.t.dx = Math.round(drag.dx + (e.clientX - drag.x) / s); drag.t.dy = Math.round(drag.dy + (e.clientY - drag.y) / s);
    render();
  });
  const endDrag = () => { drag = null; frame.classList.remove('dragging'); };
  frame.addEventListener('pointerup', endDrag); frame.addEventListener('pointercancel', endDrag);
  frame.addEventListener('wheel', e => {
    const el = e.target.closest('[data-p]'); if (!el) return;
    e.preventDefault();
    const t = live(+el.dataset.p);
    t.zoom = Math.min(3, Math.max(0.3, +(t.zoom * (e.deltaY < 0 ? 1.05 : 0.95)).toFixed(3)));
    render();
  }, { passive: false });

  // ---------------------------------------------------------------- editor
  const PARTS = { tag: 'লেবেল ~ Label', head: 'শিরোনাম ~ Headline', body: 'বিস্তারিত ~ Details', src: 'সূত্র ~ Source', flash: 'ব্রেকিং ব্যান্ড ~ Breaking band', quote: 'উক্তি ~ Quote',
    mark: 'উদ্ধৃতি চিহ্ন ~ Quote mark', who: 'নাম ও পরিচয় ~ Name and role', comp: 'টুর্নামেন্ট ~ Competition', status: 'অবস্থা ~ Status', board: 'স্কোর ~ Score', names: 'দলের নাম ~ Names',
    goals: 'গোলদাতা ~ Scorers', note: 'নিচের লাইন ~ Line under', event: 'ম্যাচ ~ Match', result: 'ফলাফল ~ Result', b1: 'দল ১ ~ Team 1', b2: 'দল ২ ~ Team 2', title: 'শিরোনাম ~ Title',
    list: 'তালিকা ~ List', panel: 'প্যানেল ~ Panel', players: 'খেলোয়াড় ~ Players', subs: 'বদলি ~ Substitutes', rows: 'সারি ~ Rows', sum: 'সারাংশ ~ Summary', tiles: 'টাইল ~ Tiles',
    table: 'টেবিল ~ Table', label: 'লেবেল ~ Label', fact: 'তথ্য ~ Fact', info: 'ম্যাচের তথ্য ~ Match line', ghost: 'পেছনের বড় সংখ্যা ~ Big number behind', player: 'নাম ও তথ্য ~ Name and details',
    stats: 'পরিসংখ্যান ~ Stats', score: 'স্কোর ~ Score', duck: 'ডাক স্ট্যাম্প ~ Duck stamp', word: 'বড় লেখা ~ Big word', balls: 'বল ~ Balls', text: 'লেখা ~ Text', foot: 'নিচের স্ট্রিপ ~ Footer strip',
    potm: 'ম্যাচসেরা ~ Player of the match', coin: 'কয়েন ~ Coin', gauge: 'রেটিং ~ Rating', move: 'ক্লাব বদল ~ Move', face: 'দুই দল ~ Teams', when: 'তারিখ ও সময় ~ Date and time',
    by: 'নাম ~ Signed', credit: 'ক্রেডিট ~ Credit', vs: 'বনাম ~ VS', logo: 'লোগো ~ Logo', p0: 'ছবি ১ ~ Photo 1', p1: 'ছবি ২ ~ Photo 2', p2: 'ছবি ৩ ~ Photo 3', p3: 'ছবি ৪ ~ Photo 4' };
  let editing = false;
  StudioEdit.init({
    frame, poster, state, render, panel: $('#form'), partsBox: $('#parts'), parts: PARTS, moveKey,
    photo: {
      get: i => live(i) || { dx: 0, dy: 0, zoom: 1 }, changed: () => {}, box: el => el.closest('.ph'),
    },
    extras: {
      get: () => (pics()).map((p, i) => { const t = p && live(i); return t ? [t.dx, t.dy, t.zoom] : null; }),
      set: v => (v || []).forEach((x, i) => { const t = live(i); if (t && x) [t.dx, t.dy, t.zoom] = x; }),
    },
  });
  editing = true;
  $('#resetAll').addEventListener('click', () => {
    delete state.moves[moveKey()]; delete state.hidden[moveKey()];
    pics().forEach((p, i) => { const t = p && live(i); if (t) Object.assign(t, { dx: 0, dy: 0, zoom: 1 }); });
    render();
  });

  // ---------------------------------------------------------------- caption
  function caption() {
    const c = card(), d = D()[c.id], strip = s => String(s || '').replace(/\*/g, '');
    const tags = state.lang === 'en' ? '#SportsTimeline' : '#স্পোর্টস_টাইমলাইন #SportsTimeline';
    const by = {
      news: () => `${strip(d.head)}\n\n${strip(d.body)}`, breaking: () => `⚡ ${strip(d.flash)}: ${strip(d.head)}\n${strip(d.body)}`,
      quote: () => `“${strip(d.quote)}”\n— ${d.name}${d.role ? `, ${d.role}` : ''}`,
      score: () => `${d.status}: ${d.t1} ${d.s1}-${d.s2} ${d.t2}\n${d.comp}${d.g1 ? `\n⚽ ${d.t1}: ${d.g1}` : ''}${d.g2 ? `\n⚽ ${d.t2}: ${d.g2}` : ''}`,
      cricket: () => `${d.t1} ${d.r1} (${d.o1}) | ${d.t2} ${d.r2} (${d.o2})\n${d.result}\n${d.event}`,
      xi: () => `${d.team}: ${d.kicker}\n${d.sub}\n\n${ST.lines(d.players).join('\n')}`,
      pitch: () => `${d.title}: ${d.team} (${d.formation})\n\n${ST.lines(d.players).map(l => ST.player(l).name).join(', ')}${d.subs ? `\n\nবদলি: ${d.subs}` : ''}`,
      squad: () => `${d.title}\n${d.sub}\n\n${d.groups}`, stats: () => `${d.kicker}: ${d.title}\n\n${d.sumTitle}\n${ST.rows(d.sum).map(r => r.join(': ')).join('\n')}`,
      toplist: () => `${strip(d.title)} (${d.sub})\n\n${ST.rows(d.rows).map((r, i) => `${i + 1}. ${r[1]}: ${r[0]}`).join('\n')}`,
      table: () => `${d.title}: ${d.group}`, trivia: () => `💡 ${d.label}\n${strip(d.fact)}`,
    };
    // other cards: every filled field, one per line
    const any = () => c.fields.map(f => d[f[0]]).filter(v => v && !/^[0-9]$/.test(v)).map(strip).join('\n');
    const txt = (by[c.id] || any)().trim();
    return `${state.bn ? ST.bnDigits(txt) : txt}\n\n${tags}`;
  }
  $('#copyCap').addEventListener('click', () => { navigator.clipboard.writeText($('#caption').value).then(() => say(tr('ক্যাপশন কপি হয়েছে ✓ ~ Caption copied ✓'))).catch(() => {}); });

  // ---------------------------------------------------------------- download / share
  async function png() {
    const st = $('#st'), fam = new Set([state.hf, state.bf, 'Anek Bangla', 'Hind Siliguri']);
    const fontEmbedCSS = await ST.fontCSS(fam);
    return htmlToImage.toBlob(st, { width: 1080, height: H(), pixelRatio: 2, fontEmbedCSS, cacheBust: false,
      filter: n => !(n.classList && (n.classList.contains('ph-hint') || n.classList.contains('empty'))) });
  }
  const fileName = () => `sports-timeline-${state.card}-${layout()}-${Date.now().toString(36)}.png`;
  async function act(btn, fn) {
    const t = btn.textContent; btn.disabled = true; btn.textContent = tr('তৈরি হচ্ছে… ~ Making…');
    try { await fn(); } catch (e) { if (e.name !== 'AbortError') alert('সমস্যা হয়েছে: ' + e.message); }
    btn.disabled = false; btn.textContent = t;
  }
  $('#download').addEventListener('click', e => act(e.currentTarget, async () => {
    const b = await png(), a = document.createElement('a');
    a.href = URL.createObjectURL(b); a.download = fileName(); a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }));
  $('#share').addEventListener('click', e => act(e.currentTarget, async () => {
    const f = new File([await png()], fileName(), { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [f] })) await navigator.share({ files: [f], text: $('#caption').value });
    else { const a = document.createElement('a'); a.href = URL.createObjectURL(f); a.download = f.name; a.click(); say('এই ব্রাউজারে সরাসরি শেয়ার হয় না, ছবিটা ডাউনলোড হয়েছে।'); }
  }));

  // ---------------------------------------------------------------- language
  // panel text written in index.html is translated in place; the original Bangla is kept to switch back
  const orig = new WeakMap();
  function translateStatic() {
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: n => n.parentElement.closest('#poster, #cards, #fields, #photos, #parts, .se-bar, #themes, #fontStrip, select, textarea, #status') || !n.nodeValue.trim() ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
    for (let n; (n = walk.nextNode());) { if (!orig.has(n)) orig.set(n, n.nodeValue); n.nodeValue = tr(orig.get(n)); }
    $$('#logoStyle option, #logoPos option, #foot option, #lang option').forEach(o => { if (!orig.has(o)) orig.set(o, o.textContent); o.textContent = tr(orig.get(o)); });
    document.documentElement.lang = state.ui;
    $$('[data-ui]').forEach(b => b.classList.toggle('on', b.dataset.ui === state.ui));
  }
  function setUi(ui) {
    state.ui = ST.ui = ui;
    translateStatic(); buildStyle(); markStyle(); buildCards(); buildForm(); StudioEdit.relabel(); render();
  }
  function setLang(lang) {
    state.lang = ST.lang = lang; state.bn = lang === 'bn';
    // the slogan follows too, unless the admin wrote their own
    const SLOGAN = { bn: fresh().slogan, en: 'Every game, *one timeline*' };
    if (state.slogan === SLOGAN[lang === 'en' ? 'bn' : 'en']) { state.slogan = SLOGAN[lang]; $('#slogan').value = state.slogan; }
    $('#bn').checked = state.bn; $('#lang').value = lang;
    buildStyle(); markStyle(); buildForm(); render(); StudioEdit.reset();
  }
  // the panel switch also turns the poster to that language; "Poster language" can still mix them
  $('#uiSwitch').addEventListener('click', e => { const b = e.target.closest('[data-ui]'); if (!b || b.dataset.ui === state.ui) return; setUi(b.dataset.ui); setLang(b.dataset.ui); });
  $('#lang').value = state.lang;
  $('#lang').addEventListener('change', e => setLang(e.target.value));

  // ---------------------------------------------------------------- install as an app
  // Android / desktop Chrome and Edge offer their own install prompt; iPhone Safari and others need the menu steps
  let installEvt = null;
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  $('#install').hidden = standalone();
  addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; $('#install').hidden = false; });
  addEventListener('appinstalled', () => { $('#install').hidden = true; installEvt = null; say(tr('অ্যাপ ইনস্টল হয়েছে ✓ হোম স্ক্রিন থেকে খুলুন। ~ Installed ✓ Open it from your home screen.')); });
  $('#install').addEventListener('click', async () => {
    if (installEvt) { installEvt.prompt(); await installEvt.userChoice.catch(() => {}); installEvt = null; return; }
    $('#installHelp').innerHTML = ios
      ? tr('Safari তে নিচের <b>শেয়ার ⬆</b> বাটন চাপুন, তারপর <b>Add to Home Screen</b>। ~ In Safari tap <b>Share ⬆</b>, then <b>Add to Home Screen</b>.')
      : tr('ব্রাউজারের <b>⋮ মেনু</b> খুলে <b>Install app</b> বা <b>Add to Home screen</b> চাপুন। (Chrome দিয়ে খুললে সবচেয়ে ভালো।) ~ Open the browser <b>⋮ menu</b> and tap <b>Install app</b> or <b>Add to Home screen</b>. (Chrome works best.)');
    $('#installBox').hidden = false;
  });
  $('#installBox').addEventListener('click', e => { if (e.target.closest('[data-close]') || e.target.id === 'installBox') $('#installBox').hidden = true; });

  // ---------------------------------------------------------------- start
  $('#brandLogo').innerHTML = ST_BRAND.wide;
  $('#ver').textContent = self.STUDIO_VERSION || '';
  buildCards(); buildForm(); markStyle(); syncBrand(); translateStatic();
  render();
  new ResizeObserver(fitFrame).observe(stage);
  document.fonts.ready.then(() => { render(); StudioEdit.reset(); });
  document.fonts.addEventListener('loadingdone', () => render());
  window.__st = { state, photos, render, setPhoto, bulk, png, pick: id => { state.card = id; state.group = ''; buildCards(); buildForm(); render(); }, setUi, setLang };
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
})();
