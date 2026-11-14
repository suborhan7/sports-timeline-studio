/* Knockout bracket: 2, 4, 8 or 16 teams, for any stage of a cup. The first round is typed one team per line (each two
   lines are one match, "Team | 2" adds a score); every later round is one line with its teams split by commas, and a
   "?" (or nothing) is a place still to be decided. A team that appears in the next round lights up its path and the
   team it beat fades. Flags come by themselves; a club crest saved once in the photo library is used too.

   Three looks: mirror (two halves meeting at the trophy), tree (rounds left to right) and rise (rounds climbing to the
   trophy at the top). */
(function () {
  const ST = window.ST;
  const box = (x, y, w, h) => `left:${Math.round(x)}px;top:${Math.round(y)}px;width:${Math.round(w)}px;height:${Math.round(h)}px`;
  const has = v => String(v ?? '').trim() !== '';
  const f = (k, label, type = 'text', rows) => [k, label, type, rows];
  const norm = s => String(s || '').normalize('NFC').replace(/\s+/g, ' ').trim().toLowerCase();
  const TBD = /^(\?+|-+|–|tbd|tbc|অপেক্ষা.*|অজানা)$/i;

  const ROUND_BN = ['ফাইনাল', 'সেমিফাইনাল', 'কোয়ার্টার ফাইনাল', 'শেষ ষোলো'];
  const ROUND_EN = ['FINAL', 'SEMI-FINALS', 'QUARTER-FINALS', 'ROUND OF 16'];

  const TROPHY = `<svg class="bk-cup" viewBox="0 0 120 140" aria-hidden="true">
    <defs><linearGradient id="bkcup" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:#fff7d1"/><stop offset=".45" style="stop-color:var(--acc)"/><stop offset="1" style="stop-color:color-mix(in srgb, var(--acc) 55%, #000)"/></linearGradient></defs>
    <path d="M31 24H14c-2 0-4 2-4 5 1 17 11 28 25 31M89 24h17c2 0 4 2 4 5-1 17-11 28-25 31" fill="none" stroke="url(#bkcup)" stroke-width="7" stroke-linecap="round"/>
    <path d="M28 10h64v34c0 26-14 42-32 44C42 86 28 70 28 44z" fill="url(#bkcup)"/>
    <path d="M60 28l5 10 11 1.5-8 7.5 2 11-10-5.5-10 5.5 2-11-8-7.5L55 38z" fill="#fff" opacity=".85"/>
    <path d="M52 88h16v16H52z" fill="url(#bkcup)"/><path d="M38 104h44l6 18H32z" fill="url(#bkcup)"/><rect x="26" y="122" width="68" height="12" rx="4" fill="url(#bkcup)"/></svg>`;
  const SHIELD = '<svg viewBox="0 0 40 46" aria-hidden="true"><path d="M20 3l15 6v12c0 11-7 18-15 22C12 39 5 32 5 21V9z" fill="none" stroke="currentColor" stroke-width="3"/></svg>';

  // a rounded elbow from (x1,y1) across to xm, down/up to y2, across to x2
  const elbowH = (x1, y1, xm, x2, y2) => {
    const r = Math.min(18, Math.abs(y2 - y1) / 2, Math.abs(xm - x1), Math.abs(x2 - xm)), sy = Math.sign(y2 - y1), sx1 = Math.sign(xm - x1), sx2 = Math.sign(x2 - xm);
    if (!sy || r < 1) return `M${x1} ${y1}H${x2}`;
    return `M${x1} ${y1}H${xm - sx1 * r}Q${xm} ${y1} ${xm} ${y1 + sy * r}V${y2 - sy * r}Q${xm} ${y2} ${xm + sx2 * r} ${y2}H${x2}`;
  };
  // the same turned on its side: up from (x1,y1) to ym, across to x2, up to y2
  const elbowV = (x1, y1, ym, x2, y2) => {
    const r = Math.min(18, Math.abs(x2 - x1) / 2, Math.abs(ym - y1), Math.abs(y2 - ym)), sx = Math.sign(x2 - x1), sy1 = Math.sign(ym - y1), sy2 = Math.sign(y2 - ym);
    if (!sx || r < 1) return `M${x1} ${y1}V${y2}`;
    return `M${x1} ${y1}V${ym - sy1 * r}Q${x1} ${ym} ${x1 + sx * r} ${ym}H${x2 - sx * r}Q${x2} ${ym} ${x2} ${ym + sy2 * r}V${y2}`;
  };

  // teams + later rounds -> rounds[0..R] (rounds[R] is the champion), with won/out marks
  function bracketOf(d, c) {
    const slot = raw => {
      const [n = '', sc = ''] = String(raw || '').split('|').map(x => x.trim());
      if (!n || TBD.test(n)) return { tbd: true, name: '', score: sc };
      return { name: n, score: sc, crest: c.crestOf ? c.crestOf(n) : null };
    };
    let first = ST.lines(d.teams).map(slot);
    let N = 2; while (N < first.length && N < 16) N *= 2;
    first = first.slice(0, N); while (first.length < N) first.push(slot(''));
    const R = Math.log2(N), later = ST.lines(d.next);
    const rounds = [first];
    for (let r = 1; r <= R; r++) {
      const want = N >> r, items = (later[r - 1] || '').split(/[,،]/).map(x => x.trim());
      rounds.push(Array.from({ length: want }, (_, i) => slot(items[i] || '')));
    }
    for (let r = 0; r < R; r++) rounds[r].forEach((s, i) => {
      const up = rounds[r + 1][i >> 1];
      if (s.tbd || up.tbd) return;
      if (norm(up.name) === norm(s.name)) { s.won = true; const o = rounds[r][i ^ 1]; if (!o.tbd) o.out = true; }
    });
    const own = ST.lines(String(d.labels || '').replace(/\|/g, '\n'));
    const label = r => own[r] != null ? own[r] : r === R ? c.t('চ্যাম্পিয়ন', 'CHAMPION') : c.t(ROUND_BN[R - 1 - r] || `রাউন্ড ${r + 1}`, ROUND_EN[R - 1 - r] || `ROUND ${r + 1}`);
    return { N, R, rounds, label };
  }

  function render(d, c) {
    const { L, CB, T, P, sec, ph, t } = c;
    const B = bracketOf(d, c), { N, R, rounds, label } = B, champ = rounds[R][0];

    // one team box; kind 'tile' stands up (flag over name), 'pill' lies down (flag, name, score)
    const slot = (s, x, y, w, h, kind, extra = '') => {
      const cls = ['bk-s', kind, s.tbd && 'tbd', s.won && 'won', s.out && 'out', extra].filter(Boolean).join(' ');
      const fl = s.tbd ? '<i class="bk-f q">?</i>'
        : s.crest ? `<i class="bk-f ${s.crest.flag ? 'flag' : 'logo'}"><img src="${s.crest.src}" decoding="sync" alt=""></i>` : `<i class="bk-f none">${SHIELD}</i>`;
      const nm = s.tbd ? (kind === 'pill' ? `<b class="wait">${t('অপেক্ষায়', 'TBD')}</b>` : '') : `<b data-fit="w" data-min=".4">${P(s.name)}</b>`;
      const sc = has(s.score) ? `<s>${P(s.score)}</s>` : '';
      return `<div class="${cls}" style="${box(x, y, w, h)};--h:${Math.round(h)}px;--w:${Math.round(w)}px">${fl}${nm}${sc}</div>`;
    };
    const path = (dd, on) => `<path d="${dd}" class="${on ? 'on' : ''}"/>`;
    const lab = (txt, x, y, w, cls = '') => has(txt) ? `<div class="bk-lab ${cls}" style="${box(x, y, w, 40)}"><span>${P(txt)}</span></div>` : '';

    // ------------------------------------------------ header and the closing lines
    const hasHl = has(d.headline), hasQ = has(d.question);
    const qH = hasQ ? (CB < 1200 ? 130 : 190) : 0, hH = hasHl ? (CB < 1200 ? 62 : 80) : 0;
    const qY = CB - 46 - qH, hY = qY - hH - (hasQ && hasHl ? 6 : 0);
    const top = has(d.sub) ? 330 : 290, bot = (hasHl || hasQ ? hY : CB) - 34;
    const W = 1000, Hr = Math.max(260, bot - top), X0 = 40;
    const head = sec('head', `<div class="pt-head bk-head" style="${box(60, 110, 960, top - 140)}">${ph(0, 0, 0, 140, 140, 'crest inl')}<div><div class="xi-team" data-fit="w" data-min=".35">${P(d.title)}</div>${has(d.sub) ? `<div class="band">${P(d.sub)}</div>` : ''}</div></div>`);
    const tail = sec('headline', `<div class="bk-hl" data-fit="w" data-min=".4" style="${box(60, hY, 960, hH)}">${P(d.headline)}</div>`, hasHl)
      + sec('question', `<div class="bk-q" data-fit data-min=".35" style="${box(60, qY, 960, qH)}">${T(d.question)}</div>`, hasQ);

    let inner = '', lines = '';
    if (L === 'tree') {
      // rounds as columns, left to right; the champion's column carries the trophy
      const cols = R + 1, gap = N >= 16 ? 26 : 40, cw = (W - gap * (cols - 1)) / cols, lh = 52, avail = Hr - lh;
      const ph0 = Math.min(118, avail / N * (N >= 8 ? 0.86 : 0.66)), pw = cw;
      const ys = [rounds[0].map((_, i) => lh + (i + 0.5) * avail / N)];
      for (let r = 1; r <= R; r++) ys.push(rounds[r].map((_, i) => (ys[r - 1][2 * i] + ys[r - 1][2 * i + 1]) / 2));
      for (let r = 0; r <= R; r++) {
        const x = r * (cw + gap), h = r === R ? Math.min(ph0 * 1.25, 140) : ph0;
        inner += lab(label(r), x, 0, cw, r === R ? 'champ' : '');
        rounds[r].forEach((s, i) => { inner += slot(s, x, ys[r][i] - h / 2, pw, h, 'pill', r === R ? 'champ' : ''); });
        if (r === R) {
          const cup = Math.min(150, ys[R][0] - lh - h / 2 - 16);
          if (cup > 60) inner += `<div class="bk-trophy" style="${box(x + cw / 2 - cup * 0.43, ys[R][0] - h / 2 - cup - 12, cup * 0.86, cup)}">${TROPHY}</div>`;
        }
        if (r < R) rounds[r].forEach((s, i) => {
          const x1 = x + pw, x2 = (r + 1) * (cw + gap), xm = x1 + gap / 2;
          lines += path(elbowH(x1, ys[r][i], xm, x2, ys[r + 1][i >> 1]), s.won);
        });
      }
    } else if (L === 'rise') {
      // rounds as rows from the bottom up, the trophy on top
      const rows = R + 1, cupH = Math.min(170, Hr * 0.24), body = Hr - cupH - 10, rh = body / rows;
      const tw0 = Math.min(250, (W - 18 * (N - 1)) / N), th0 = Math.min(rh * 0.74, tw0 * 1.05);
      const yOf = r => cupH + 10 + body - (r + 0.5) * rh;
      const xs = [rounds[0].map((_, i) => (i + 0.5) * W / N)];
      for (let r = 1; r <= R; r++) xs.push(rounds[r].map((_, i) => (xs[r - 1][2 * i] + xs[r - 1][2 * i + 1]) / 2));
      for (let r = 0; r <= R; r++) {
        const tw = r === 0 ? tw0 : Math.min(260, tw0 * (1 + r * 0.12), W / rounds[r].length - 30), th = r === R ? Math.min(th0 * 1.1, rh * 0.8) : th0;
        rounds[r].forEach((s, i) => {
          if (r === R && s.tbd) return;
          inner += slot(s, xs[r][i] - tw / 2, yOf(r) - th / 2, tw, th, 'tile', r === R ? 'champ' : '');
        });
        if (r < R) for (let m = 0; m < rounds[r + 1].length; m++) {
          const a = 2 * m, b = a + 1, y1 = yOf(r) - th / 2, last = r + 1 === R, up = rounds[r + 1][m];
          const y2 = last && up.tbd ? cupH + 6 : yOf(r + 1) + (r + 1 === R ? Math.min(th0 * 1.1, rh * 0.8) : th0) / 2;
          const ym = (y1 + y2) / 2;
          lines += path(elbowV(xs[r][a], y1, ym, xs[r + 1][m], y2), rounds[r][a].won) + path(elbowV(xs[r][b], y1, ym, xs[r + 1][m], y2), rounds[r][b].won);
          const span = xs[r][b] - xs[r][a];
          if (span > 200) inner += `<div class="bk-node" style="${box(xs[r + 1][m] - 140, ym - 22, 280, 44)}"><span>${P(label(r))}</span></div>`;
          else inner += `<i class="bk-dot" style="left:${Math.round(xs[r + 1][m] - 9)}px;top:${Math.round(ym - 9)}px"></i>`;
        }
      }
      inner += `<div class="bk-trophy" style="${box(W / 2 - cupH * 0.43, 0, cupH * 0.86, cupH)}">${TROPHY}</div>`;
    } else {
      // mirror: half the draw on each side, meeting in the middle at the trophy
      const cw = R >= 3 ? 210 : 250, side = (W - cw) / 2, colW = side / R, gap = R >= 3 ? 16 : 34, tw = colW - gap;
      const half = N / 2, lh = 50, avail = Hr - lh, th = Math.min(tw * 1.15, avail / half * 0.8, 280);
      const ys = [Array.from({ length: half }, (_, i) => lh + (i + 0.5) * avail / half)];
      for (let r = 1; r < R; r++) ys.push(ys[r - 1].filter((_, i) => i % 2 === 0).map((y, i) => (ys[r - 1][2 * i] + ys[r - 1][2 * i + 1]) / 2));
      const mid = R === 1 ? ys[0][0] : ys[R - 1][0];
      for (const sideR of [false, true]) {
        for (let r = 0; r < R; r++) {
          const n = rounds[r].length / 2, x = sideR ? W - (r + 1) * colW + gap / 2 : r * colW + gap / 2;
          if (R > 1 && r < R - 1 && (r === 0 || colW >= 200)) inner += r === 0 && colW < 200 ? lab(label(r), sideR ? W - side : 0, 0, side, sideR ? 'r' : 'l') : lab(label(r), x - gap / 2, 0, colW, sideR ? 'r' : 'l');
          for (let i = 0; i < n; i++) {
            const s = rounds[r][(sideR ? n : 0) + i], y = ys[r][i];
            inner += slot(s, x, y - th / 2, tw, th, 'tile');
            const edge = sideR ? x : x + tw;
            if (r < R - 1) {
              const nx = sideR ? W - (r + 2) * colW + gap / 2 + tw : (r + 1) * colW + gap / 2;
              lines += path(elbowH(edge, y, sideR ? edge - gap / 2 : edge + gap / 2, nx, ys[r + 1][i >> 1]), s.won);
            } else {
              const cx = sideR ? W / 2 + cw / 2 - 6 : W / 2 - cw / 2 + 6;
              lines += path(`M${edge} ${y}H${cx}`, s.won);
            }
          }
        }
      }
      const cup = Math.min(cw * 0.62, mid - lh - 40, 170);
      inner += `<div class="bk-trophy" style="${box(W / 2 - cup * 0.43, mid - cup - 46, cup * 0.86, cup)}">${TROPHY}</div>`
        + `<div class="bk-final" style="${box(W / 2 - cw / 2 + 24, mid - 40, cw - 48, 80)};font-size:${R >= 3 ? 44 : 56}px" data-fit="w" data-min=".4"><span>${P(label(R - 1))}</span></div>`;
      if (!champ.tbd) inner += slot(champ, W / 2 - cw * 0.42, mid + 52, cw * 0.84, Math.min(th, avail + lh - mid - 60), 'tile', 'champ');
    }

    const bracket = sec('bracket', `<div class="bk bk-${L} n${N}" style="${box(X0, top, W, Hr)}"><svg class="bk-l" width="${W}" height="${Math.round(Hr)}" viewBox="0 0 ${W} ${Math.round(Hr)}">${lines}</svg>${inner}</div>`);
    return (c.has(1) ? ph(1, 0, 0, 1080, CB, 'dim') : '') + head + bracket + tail;
  }

  ST.CARDS.push({
    id: 'bracket', name: 'নকআউট ব্র্যাকেট ~ Knockout bracket', icon: '🏆', group: 'team',
    layouts: { mirror: 'দুই পাশ থেকে মাঝে ~ Two halves meet', tree: 'বাম থেকে ডানে ~ Left to right', rise: 'নিচ থেকে উপরে ~ Bottom to top' },
    logo: { mirror: ['tr'], tree: ['tr'], rise: ['tr'] },
    fields: [
      f('title', 'টুর্নামেন্ট ~ Tournament'), f('sub', 'নিচের লাইন (ঐচ্ছিক) ~ Line under (optional)'),
      f('teams', 'প্রথম রাউন্ডের দল: এক লাইনে একটা, পরপর দুটো মিলে এক ম্যাচ (স্কোর: দল | ২, অজানা হলে ?) ~ First-round teams: one per line, each two make a match (score: Team | 2, ? if not known)', 'area', 8),
      f('next', 'পরের রাউন্ডে যারা উঠল: প্রতি রাউন্ড এক লাইনে, কমা দিয়ে (অজানা হলে ?; শেষ লাইনে চ্যাম্পিয়ন) ~ Who went through: one round per line, split with commas (? if not known; champion on the last line)', 'area', 4),
      f('labels', 'রাউন্ডের নাম (ঐচ্ছিক, | দিয়ে, প্রথম রাউন্ড থেকে) ~ Round names (optional, split with |, first round first)'),
      f('headline', 'খবরের লাইন ~ News line'), f('question', 'প্রশ্ন / শেষ লাইন (*তারা* দিলে রঙিন) ~ Question / last line (*stars* for colour)', 'area', 2),
    ],
    photos: [{ label: 'টুর্নামেন্টের লোগো ~ Tournament logo', mode: 'logo' }, { label: 'পেছনের ছবি (ঐচ্ছিক) ~ Background photo (optional)', mode: 'scene' }],
    data: { title: 'সাফ চ্যাম্পিয়নশিপ ২০২৬', sub: '', teams: 'ভুটান\nভারত\nপাকিস্তান\nবাংলাদেশ', next: 'ভারত, ?', labels: '',
      headline: 'ভারত নিশ্চিত করেছে ফাইনাল', question: 'সেমিফাইনাল-২ থেকে কোন দল যাবে *ফাইনালে?*' },
    dataEn: { title: 'SAFF Championship 2026', sub: '', teams: 'Bhutan\nIndia\nPakistan\nBangladesh', next: 'India, ?', labels: '',
      headline: 'India are through to the final', question: 'Who joins them from *semi-final 2?*' },
    render,
  });
})();
