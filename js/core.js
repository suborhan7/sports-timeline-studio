/* Shared helpers for the Sports Timeline Studio: themes, Bangla fonts, text helpers, photo analysis and placement,
   cut-out, logo cleanup, text fitting and the font embedding used by the PNG export. Everything lives on window.ST. */
(function () {
  const ST = window.ST = window.ST || {};

  // ---- poster sizes (all 1080 wide, so the editor's centre line stays at 540) ----
  ST.SIZES = {
    portrait: { name: 'পোস্ট ৪:৫ (1080×1350)', H: 1350 },
    square:   { name: 'স্কয়ার (1080×1080)', H: 1080 },
    story:    { name: 'স্টোরি / রিলস (1080×1920)', H: 1920 },
  };

  // ---- colour themes: every poster reads these CSS variables ----
  // bg/bg2 background, ink text on bg, mute soft text, acc accent (gold), acc2 second accent, pan panel, pink panel text
  ST.THEMES = {
    neo:     { name: 'নিয়ন রাত (নতুন)', bg: '#0a0c24', bg2: '#2b1470', ink: '#ffffff', mute: '#b9b6e3', acc: '#c6ff3d', acc2: '#7b5cff', pan: '#14123a', pink: '#ffffff', logo: 'whiteGold' },
    sunset:  { name: 'সানসেট', bg: '#1a0826', bg2: '#7a1e5c', ink: '#ffffff', mute: '#f1c4da', acc: '#ffb703', acc2: '#ff4d6d', pan: '#2a0c35', pink: '#ffffff', logo: 'whiteGold' },
    ocean:   { name: 'ওশান ব্লু', bg: '#03142b', bg2: '#0b4f8a', ink: '#ffffff', mute: '#a9cbe8', acc: '#00e5ff', acc2: '#2f6bff', pan: '#071f3d', pink: '#ffffff', logo: 'white' },
    broadcast:{ name: 'ব্রডকাস্ট লাল', bg: '#0b0b0d', bg2: '#2a0d12', ink: '#ffffff', mute: '#c9c9cf', acc: '#ff2d46', acc2: '#ff8a00', pan: '#17171b', pink: '#ffffff', logo: 'white', accInk: '#ffffff' },
    clean:   { name: 'সাদা মডার্ন', bg: '#f5f6fb', bg2: '#dfe4ff', ink: '#0d1033', mute: '#5b6085', acc: '#4f46e5', acc2: '#ff3d7f', pan: '#0d1033', pink: '#ffffff', logo: 'black', light: true, accInk: '#ffffff' },
    mint:    { name: 'মিন্ট ফ্রেশ', bg: '#06221f', bg2: '#0f5b52', ink: '#ffffff', mute: '#a6dcd2', acc: '#5effc8', acc2: '#ffd23f', pan: '#0a302b', pink: '#ffffff', logo: 'whiteGold' },
    green:   { name: 'টাইমলাইন সবুজ (পেজের রং)', bg: '#123524', bg2: '#1d5238', ink: '#fbf3e6', mute: '#b9d3c2', acc: '#e0a030', acc2: '#3ecf7a', pan: '#0b2619', pink: '#fbf3e6', logo: 'brand' },
    pavilion:{ name: 'সাদা-সবুজ', bg: '#f6f8f4', bg2: '#d9efe0', ink: '#0f2d1d', mute: '#4d6b58', acc: '#1f8a4c', acc2: '#e0a030', pan: '#1f8a4c', pink: '#ffffff', logo: 'green', light: true, accInk: '#ffffff' },
    royal:   { name: 'রয়্যাল নীল', bg: '#0a2366', bg2: '#1846b8', ink: '#f3f6ff', mute: '#b7c6f0', acc: '#ffd23f', acc2: '#5ad1ff', pan: '#071848', pink: '#f3f6ff', logo: 'brand' },
    team:    { name: 'দলের রং (লোগো থেকে)', auto: true },
  };

  // ---- Bangla fonts: one-tap pairs (headline + body); each can still be changed on its own ----
  ST.FONTS = {
    'Hind Siliguri':      { name: 'হিন্দ শিলিগুড়ি (পেজের এখনকার ফন্ট)', w: 700, bw: 500 },
    'Anek Bangla':        { name: 'অনেক বাংলা (চাপা, স্পোর্টি)', w: 800, bw: 500, stretch: '82%' },
    'Tiro Bangla':        { name: 'তিরো বাংলা (পত্রিকা)', w: 400, bw: 400 },
    'Noto Serif Bengali': { name: 'নোটো সেরিফ (ক্লাসিক)', w: 800, bw: 500 },
    'Galada':             { name: 'গালাডা (হাতের লেখা)', w: 400, bw: 400 },
    'Baloo Da 2':         { name: 'বালু দা (গোলগাল)', w: 800, bw: 500 },
    'Atma':               { name: 'আত্মা (মজার)', w: 700, bw: 500 },
    'Mina':               { name: 'মিনা (আধুনিক)', w: 700, bw: 400 },
  };
  ST.FONT_PAIRS = {
    sporty:  { name: 'স্পোর্টি: অনেক + হিন্দ', head: 'Anek Bangla', body: 'Hind Siliguri' },
    classic: { name: 'ক্লাসিক: হিন্দ + হিন্দ', head: 'Hind Siliguri', body: 'Hind Siliguri' },
    paper:   { name: 'পত্রিকা: তিরো + নোটো', head: 'Tiro Bangla', body: 'Noto Serif Bengali' },
    script:  { name: 'হাতের লেখা: গালাডা + হিন্দ', head: 'Galada', body: 'Hind Siliguri' },
    round:   { name: 'গোলগাল: বালু + বালু', head: 'Baloo Da 2', body: 'Baloo Da 2' },
    serif:   { name: 'সেরিফ: নোটো + হিন্দ', head: 'Noto Serif Bengali', body: 'Hind Siliguri' },
    fun:     { name: 'মজার: আত্মা + হিন্দ', head: 'Atma', body: 'Hind Siliguri' },
    modern:  { name: 'আধুনিক: মিনা + মিনা', head: 'Mina', body: 'Mina' },
  };

  // ---- logo colours: a = main letters, b = accent (টাইমলাইন + track), bg = badge disc ----
  ST.LOGO_COLORS = {
    auto:  { name: 'অটো (ছবি দেখে সাদা/সবুজ)' },
    brand: { name: 'ব্র্যান্ড (ক্রিম + সোনালি)', a: '#fbf3e6', b: '#e0a030', bg: '#123524' },
    white: { name: 'পুরো সাদা', a: '#ffffff', b: '#ffffff', bg: '#123524' },
    whiteGold: { name: 'সাদা + সোনালি', a: '#ffffff', b: '#f2b632', bg: '#123524' },
    green: { name: 'সবুজ + সোনালি', a: '#123524', b: '#c98a1e', bg: '#fbf3e6' },
    black: { name: 'কালো', a: '#111111', b: '#111111', bg: '#ffffff' },
    gold:  { name: 'পুরো সোনালি', a: '#e0a030', b: '#e0a030', bg: '#123524' },
    custom:{ name: 'নিজের রং' },
  };

  // ---- text ----
  const BN = '০১২৩৪৫৬৭৮৯';
  ST.bnDigits = s => String(s ?? '').replace(/[0-9]/g, d => BN[d]);
  ST.enDigits = s => String(s ?? '').replace(/[০-৯]/g, d => BN.indexOf(d));
  ST.esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // *words* get the accent colour, a new line stays a new line; digits follow the "Bangla digits" switch
  ST.rich = (s, bn = ST.useBn) => {
    let t = ST.esc(s);
    if (bn) t = ST.bnDigits(t);
    return t.replace(/\*([^*]+)\*/g, '<em>$1</em>').replace(/\n/g, '<br>');
  };
  ST.plain = (s, bn = ST.useBn) => { const t = ST.esc(String(s ?? '').replace(/\*/g, '')); return bn ? ST.bnDigits(t) : t; };
  ST.lines = s => String(s || '').split('\n').map(l => l.trim()).filter(Boolean);
  // "a | b | c" rows
  ST.rows = s => ST.lines(s).map(l => l.split('|').map(c => c.trim()));
  // a player line: "10 Lionel Messi (c)" -> { num, name, tags }
  ST.player = line => {
    let s = line.trim(), num = '';
    const m = s.match(/^([0-9০-৯]{1,3})[.)\s]+(.+)$/); if (m) { num = m[1]; s = m[2]; }
    const tags = [];
    s = s.replace(/\((c|C|cap|অধি\.?|অধিনায়ক)\)/g, () => { tags.push('c'); return ''; })
         .replace(/\((wk|WK|উই\.?|উইকেটরক্ষক)\)/g, () => { tags.push('wk'); return ''; })
         .replace(/\((vc|VC|সহ-অধি\.?)\)/g, () => { tags.push('vc'); return ''; })
         .replace(/\((gk|GK|গোলরক্ষক)\)/g, () => { tags.push('gk'); return ''; });
    return { num, name: s.replace(/\s+/g, ' ').trim(), tags };
  };
  ST.tagText = { c: 'অধি.', wk: 'উই.', vc: 'সহ-অধি.', gk: 'গোলরক্ষক' };

  // ---- images ----
  ST.readFile = f => new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(f); });
  ST.loadImage = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });

  /* Look at a picture once: size, see-through or not, where the interesting part is (focus) and how bright it is.
     The focus is the centre of detail (edges) weighted towards skin tones and the upper middle, so news photos
     crop around the people rather than the grass. */
  ST.analyse = async src => {
    const img = await ST.loadImage(src);
    const w = img.naturalWidth, h = img.naturalHeight;
    const G = 64, gw = G, gh = Math.max(1, Math.round(G * h / w));
    const cv = document.createElement('canvas'); cv.width = gw; cv.height = gh;
    const ctx = cv.getContext('2d', { willReadFrequently: true }); ctx.drawImage(img, 0, 0, gw, gh);
    const d = ctx.getImageData(0, 0, gw, gh).data;
    let clear = 0, lum = 0, n = 0, sx = 0, sy = 0, sw = 0;
    const L = new Float32Array(gw * gh), skinY = [];
    for (let i = 0; i < gw * gh; i++) {
      const r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2], a = d[i * 4 + 3];
      if (a < 200) clear++;
      L[i] = 0.299 * r + 0.587 * g + 0.114 * b;
      if (a > 20) { lum += L[i]; n++; }
    }
    for (let y = 1; y < gh - 1; y++) for (let x = 1; x < gw - 1; x++) {
      const i = y * gw + x;
      let e = Math.abs(L[i - 1] - L[i + 1]) + Math.abs(L[i - gw] - L[i + gw]);
      const r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2];
      const skin = r > 95 && g > 40 && b > 20 && r > g && r > b && r - Math.min(g, b) > 15 && Math.abs(r - g) > 15;
      if (skin) { e *= 2.2; skinY.push(y); }
      e *= 1.15 - Math.abs(x / gw - 0.5) * 0.5 - (y / gh) * 0.35;   // people are usually mid and upper
      if (e > 0) { sx += x * e; sy += y * e; sw += e; }
    }
    const alpha = clear > gw * gh * 0.02;
    return {
      w, h, alpha,
      fx: sw ? Math.min(0.85, Math.max(0.15, sx / sw / gw)) : 0.5,
      fy: sw ? Math.min(0.7, Math.max(0.2, sy / sw / gh)) : 0.4,
      lum: n ? lum / n / 255 : 0.5,
      // where the highest faces start (a low percentile of skin rows), so a crop never cuts off heads
      ty: skinY.length > 12 ? skinY.sort((p, q) => p - q)[Math.floor(skinY.length * 0.06)] / gh : null,
    };
  };

  /* What kind of picture is this? Used when several files are dropped at once, to send each to its best slot.
     logo: see-through and roughly square, or a small square picture; cut: a see-through person; scene: an ordinary photo. */
  ST.kindOf = a => {
    const r = a.w / a.h;
    if (a.alpha && r > 0.6 && r < 1.6 && Math.max(a.w, a.h) < 1400) return 'logo';
    if (!a.alpha && r > 0.85 && r < 1.18 && Math.max(a.w, a.h) <= 600) return 'logo';
    if (a.alpha) return 'cut';
    return 'scene';
  };

  // AI background removal in the browser (@imgly/background-removal). The model downloads once, then is cached.
  ST.cutOut = async (blobOrSrc, say = () => {}) => {
    if (!window.BgRemoval) throw new Error('library missing');
    say('ব্যাকগ্রাউন্ড কাটা হচ্ছে…');
    const blob = await BgRemoval.removeBackground(blobOrSrc, {
      model: 'medium', proxyToWorker: false, output: { format: 'image/png', quality: 1 },
      progress: (k, cur, total) => {
        if (k.startsWith('fetch') && total) say(`AI মডেল নামছে (প্রথমবার): ${Math.round(cur / total * 100)}%`);
        else if (k.startsWith('compute')) say('ব্যাকগ্রাউন্ড কাটা হচ্ছে…');
      },
    });
    say('কাট-আউট রেডি ✓');
    return JerseyColors.trimTransparent(await JerseyColors.keepMainSubject(await ST.readFile(blob)));
  };

  /* Logos on a plain white/black/coloured background: everything joined to the border that matches the corner colour
     becomes see-through (soft edge), so the crest sits on the poster without a box. (From the eFCOB lineup maker.) */
  ST.clearLogoBg = async src => {
    const img = await ST.loadImage(src);
    const s = Math.min(1, 600 / Math.max(img.naturalWidth, img.naturalHeight)), W = Math.round(img.naturalWidth * s), H = Math.round(img.naturalHeight * s);
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d', { willReadFrequently: true }); ctx.drawImage(img, 0, 0, W, H);
    const id = ctx.getImageData(0, 0, W, H), d = id.data, bg = [d[0], d[1], d[2]];
    const dist = i => Math.max(Math.abs(d[i] - bg[0]), Math.abs(d[i + 1] - bg[1]), Math.abs(d[i + 2] - bg[2]));
    const seen = new Uint8Array(W * H), q = [];
    const push = p => { if (!seen[p] && dist(p * 4) < 60) { seen[p] = 1; q.push(p); } };
    for (let x = 0; x < W; x++) { push(x); push((H - 1) * W + x); }
    for (let y = 0; y < H; y++) { push(y * W); push(y * W + W - 1); }
    while (q.length) {
      const p = q.pop(), x = p % W;
      if (x > 0) push(p - 1); if (x < W - 1) push(p + 1); if (p >= W) push(p - W); if (p < W * (H - 1)) push(p + W);
    }
    // nothing joined to the border matched: a full-bleed picture, keep it as it is
    let cleared = 0; for (let p = 0; p < W * H; p++) cleared += seen[p];
    if (cleared < W * H * 0.04) return src;
    for (let p = 0; p < W * H; p++) if (seen[p]) d[p * 4 + 3] = Math.round(255 * Math.min(1, Math.max(0, (dist(p * 4) - 25) / 35)));
    ctx.putImageData(id, 0, 0);
    return JerseyColors.trimTransparent(cv.toDataURL('image/png'));
  };

  // the strongest colour of a logo (see-through, white and black pixels skipped)
  ST.logoColor = async src => {
    const img = await ST.loadImage(src);
    const W = 80, H = Math.max(1, Math.round(80 * img.height / img.width));
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d', { willReadFrequently: true }); ctx.drawImage(img, 0, 0, W, H);
    const px = ctx.getImageData(0, 0, W, H).data, buckets = {};
    for (let i = 0; i < px.length; i += 4) {
      if (px[i + 3] < 200) continue;
      const mx = Math.max(px[i], px[i + 1], px[i + 2]) / 255, mn = Math.min(px[i], px[i + 1], px[i + 2]) / 255, l = (mx + mn) / 2;
      const s = mx === mn ? 0 : (mx - mn) / (1 - Math.abs(2 * l - 1));
      if (s < 0.3 || l < 0.12 || l > 0.9) continue;
      const [r, g, b] = [px[i], px[i + 1], px[i + 2]];
      let hh = mx === r / 255 ? ((g - b) / 255 / (mx - mn)) % 6 : mx === g / 255 ? (b - r) / 255 / (mx - mn) + 2 : (r - g) / 255 / (mx - mn) + 4;
      const k = Math.floor(((hh * 60 + 360) % 360) / 20);
      const bk = buckets[k] || (buckets[k] = { n: 0, r: 0, g: 0, b: 0 });
      bk.n++; bk.r += r; bk.g += g; bk.b += b;
    }
    const top = Object.values(buckets).sort((a, b) => b.n - a.n)[0];
    return top ? '#' + [top.r, top.g, top.b].map(v => Math.round(v / top.n).toString(16).padStart(2, '0')).join('') : null;
  };

  /* Where a photo sits inside its box (all in poster px).
     scene: fills the box, cropped around the focus point; cut: a cut-out person standing on the bottom edge, sized by
     height (or width for wide groups); logo: whole picture inside the box. dx/dy/zoom are the admin's own nudges. */
  ST.place = (p, bw, bh, mode) => {
    const w = p.w || 1, h = p.h || 1, z = p.zoom || 1, dx = p.dx || 0, dy = p.dy || 0;
    let s, left, top;
    if (mode === 'scene') {
      s = Math.max(bw / w, bh / h) * z;
      const iw = w * s, ih = h * s;
      left = Math.min(0, Math.max(bw - iw, bw / 2 - (p.fx ?? 0.5) * iw));
      // centre on the focus, but never lower than keeping the top face ~12% below the box's top edge
      let want = bh * 0.42 - (p.fy ?? 0.4) * ih;
      if (p.ty != null) want = Math.max(want, bh * 0.12 - p.ty * ih);
      top = Math.min(0, Math.max(bh - ih, want));
    } else if (mode === 'cut') {
      const r = w / h;
      s = (r > 0.95 ? Math.min(bw * 1.02 / w, bh * 0.95 / h) : Math.min(bh * 0.95 / h, bw * 1.25 / w)) * z;   // a little head room
      left = (bw - w * s) / 2; top = bh - h * s;
    } else {
      s = Math.min(bw / w, bh / h) * z;
      left = (bw - w * s) / 2; top = (bh - h * s) / 2;
    }
    return `left:${Math.round(left + dx)}px;top:${Math.round(top + dy)}px;width:${Math.round(w * s)}px;height:${Math.round(h * s)}px`;
  };

  /* Shrink text until it fits its box. Any element with data-fit gets checked after each render: its font size steps
     down (to data-min × the starting size, default 0.4) until nothing overflows. Long names and long news always fit. */
  ST.fitAll = root => {
    root.querySelectorAll('[data-fit]').forEach(el => {
      el.style.fontSize = '';
      const start = parseFloat(getComputedStyle(el).fontSize), min = start * (parseFloat(el.dataset.min) || 0.4);
      const over = () => el.scrollHeight > el.clientHeight + 2 || el.scrollWidth > el.clientWidth + 2;
      if (!over()) return;
      let lo = min, hi = start;
      for (let i = 0; i < 9; i++) { const m = (lo + hi) / 2; el.style.fontSize = m + 'px'; if (over()) hi = m; else lo = m; }
      el.style.fontSize = lo + 'px';
    });
  };

  /* Fonts for the PNG: the @font-face rules of the families on the poster, with each file inlined, so the downloaded
     picture uses the same Bangla letters as the preview. Built once per set of families. */
  const fontCache = {};
  ST.fontCSS = async families => {
    const key = [...families].sort().join('|');
    if (fontCache[key]) return fontCache[key];
    const rules = [];
    for (const sheet of document.styleSheets) {
      let list; try { list = sheet.cssRules; } catch (e) { continue; }
      for (const r of list) if (r.type === CSSRule.FONT_FACE_RULE) {
        const fam = r.style.getPropertyValue('font-family').replace(/["']/g, '').trim();
        if (!families.has(fam)) continue;
        const m = r.cssText.match(/url\("?([^")]+)"?\)/); if (!m) continue;
        const url = new URL(m[1], sheet.href || location.href).href;
        rules.push(fetch(url).then(res => res.blob()).then(ST.readFile).then(data => r.cssText.replace(m[0], `url(${data})`)).catch(() => ''));
      }
    }
    return (fontCache[key] = (await Promise.all(rules)).join('\n'));
  };

  // ---- colour helpers ----
  ST.hexToRgb = hex => { const h = hex.replace('#', ''); const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  ST.lum = hex => { const [r, g, b] = ST.hexToRgb(hex); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };
  ST.mix = (a, b, t) => { const A = ST.hexToRgb(a), B = ST.hexToRgb(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
  // a full theme from one team colour (the "দলের রং" theme)
  ST.teamTheme = (c1, c2) => {
    const dark = ST.lum(c1) < 0.55;
    const bg = dark ? ST.mix(c1, '#000000', 0.45) : ST.mix(c1, '#000000', 0.7);
    return { bg, bg2: ST.mix(c1, '#000000', dark ? 0.1 : 0.35), ink: '#ffffff', mute: ST.mix('#ffffff', c1, 0.35),
      acc: c2 && Math.abs(ST.lum(c2) - ST.lum(bg)) > 0.3 ? c2 : '#ffd34d', acc2: c1, pan: ST.mix(c1, '#000000', 0.75), pink: '#ffffff', logo: 'brand' };
  };
})();
