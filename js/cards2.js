/* More cards: the Borhan Poster Studio set (cricket moments, Test cricket, football moments, general posts) plus
   player-vs-player comparison, MVP, transfer, match day and fixtures. Same shape as cards.js; most cards here are
   made by a few builders (perf, moment, over, board, result, stamp) so one look is shared by several cards.

   Labels written "বাংলা ~ English" show in the panel's language. render() gets c.t(bn, en) for words printed on the
   poster, which follow the poster's language. Numbers worked out for you: strike rate, economy, over runs/wickets,
   target. */
(function () {
  const ST = window.ST;
  const box = (x, y, w, h) => `left:${Math.round(x)}px;top:${Math.round(y)}px;width:${Math.round(w)}px;height:${Math.round(h)}px`;
  const num = s => parseFloat(ST.enDigits(s).replace(/[^0-9.]/g, '')) || 0;
  const ballsOf = o => { const [a, b = '0'] = ST.enDigits(o).replace(/[^0-9.]/g, '').split('.'); return (+a || 0) * 6 + (+b || 0); };
  const sr = (r, b) => num(b) ? (num(r) / num(b) * 100).toFixed(1).replace(/\.0$/, '') : '';
  const econ = (r, o) => ballsOf(o) ? (num(r) / (ballsOf(o) / 6)).toFixed(2) : '';
  const has = v => String(v ?? '').trim() !== '';
  // "a | b | c" info line -> pill with dots between
  const infoBar = (s, P, cls = '') => has(s) ? `<div class="infob ${cls}">${s.split('|').map(x => `<span>${P(x.trim())}</span>`).join('<i></i>')}</div>` : '';
  const chipsOf = (list, P) => list.filter(x => has(x[0])).map(([v, l]) => `<div><b>${P(v)}</b><small>${l}</small></div>`).join('');
  // "Goals: 1, Assists: 2" or one per line -> [[label, value]]
  const pairs = s => String(s || '').split(/[,\n]/).map(x => x.trim()).filter(Boolean).map(x => { const i = x.search(/[:：]/); return i < 0 ? [x, ''] : [x.slice(0, i).trim(), x.slice(i + 1).trim()]; });
  const BALL = '<svg viewBox="0 0 40 40" width="40" height="40"><circle cx="20" cy="20" r="18" fill="#c8102e"/><path d="M9 8q11 12 0 24M31 8q-11 12 0 24" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="3 3"/></svg>';
  const testTag = t => `<div class="ttag">${BALL}<span>${t('টেস্ট ক্রিকেট', 'TEST CRICKET')}</span></div>`;
  const top = (html, x = 60) => `<div class="toprow" style="left:${x}px;top:64px">${html}</div>`;
  const f = (k, label, type = 'text', rows) => [k, label, type, rows];

  const P_TEAM = f('team', 'দল ~ Team'), P_OPP = f('opp', 'প্রতিপক্ষ ~ Opponent'), P_INFO = f('info', 'ম্যাচের তথ্য (| দিয়ে ভাগ) ~ Match line (split with |)');

  /* ---------------------------------------------------------------- batting / bowling milestones
     hero: big number behind the cut-out player; photo: full photo with the stats on it; bold: huge runs/balls boxes */
  function perf(o) {
    const bat = o.kind === 'bat';
    const fields = [f('word', 'বড় শিরোনাম ~ Big headline word'), f('player', bat ? 'খেলোয়াড় ~ Player' : 'বোলার ~ Bowler'), P_TEAM, P_OPP].concat(bat
      ? [f('runs', 'রান (নটআউট হলে *) ~ Runs (add * if not out)'), f('balls', 'বল ~ Balls'), f('fours', 'চার ~ 4s'), f('sixes', 'ছক্কা ~ 6s')]
      : [f('wkts', 'উইকেট ~ Wickets'), f('runs', 'রান দিয়েছেন ~ Runs given'), f('overs', 'ওভার ~ Overs'), f('maidens', 'মেডেন (ঐচ্ছিক) ~ Maidens (optional)')]).concat([P_INFO]);
    const all = { hero: 'বড় সংখ্যা + কাট-আউট ~ Big number + cut-out', photo: 'ফুল ছবি ~ Full photo', bold: 'বোল্ড বক্স ~ Bold boxes' };
    const layouts = {}; (o.order || ['hero', 'photo', 'bold']).forEach(k => { layouts[k] = all[k]; });
    return {
      id: o.id, name: o.name, icon: o.icon, group: o.group, layouts, vars: o.vars,
      logo: { hero: ['tr'], photo: ['tr'], bold: ['tr'] },
      fields, data: o.data, dataEn: o.dataEn,
      photos: [{ label: 'খেলোয়াড়ের ছবি (অটো কাটা) ~ Player photo (auto cut-out)', mode: 'cut', name: 'player', modes: { photo: 'scene' } }],
      render(d, c) {
        const { L, CB, T, P, sec, ph, t } = c;
        const duck = bat && o.duck && /^\s*[0০]\s*$/.test(d.runs);
        const big = bat ? P(d.runs) : `${P(d.wkts)}/${P(d.runs)}`;
        const sub = bat ? (has(d.balls) ? `${P(d.balls)} ${t('বলে', 'balls')}` : '') : (has(d.overs) ? `${P(d.overs)} ${t('ওভারে', 'overs')}` : '');
        const chips = chipsOf(bat ? [[d.fours, t('চার', 'Fours')], [d.sixes, t('ছক্কা', 'Sixes')], [sr(d.runs, d.balls), t('স্ট্রাইক রেট', 'Strike rate')]]
          : [[d.overs, t('ওভার', 'Overs')], [econ(d.runs, d.overs), t('ইকোনমি', 'Economy')], [d.maidens, t('মেডেন', 'Maidens')]], P);
        const ghost = P(o.mile || (bat ? String(d.runs).replace('*', '') : d.wkts));
        const vs = [d.team, d.opp].filter(has).map(x => P(x)).join(` <em>${t('বনাম', 'vs')}</em> `);
        const head = top((o.test ? testTag(t) : '') + infoBar(d.info, P));
        const stamp = duck ? sec('duck', `<div class="stamp" style="left:600px;top:${Math.round(CB * 0.42)}px">${t('ডাক!', 'DUCK!')}</div>`) : '';
        const stats = (y, hh) => sec('stats', `<div class="chips" style="${box(50, y, 980, hh)}">${chips}</div>`, !!chips);
        if (L === 'photo') {
          const y0 = CB * 0.5;
          return ph(0, 0, 0, 1080, CB) + `<div class="shade-b" style="${box(0, CB * 0.28, 1080, CB * 0.72)}"></div>` + sec('info', head)
            + sec('player', `<div class="pcol on-photo" style="${box(60, y0, 570, CB - y0 - 290)}"><div class="mword" data-fit="w" data-min=".4">${P(d.word)}</div>
                <div class="xi-team multi" data-fit data-min=".3">${T(d.player)}</div><div class="vsl">${vs}</div></div>`)
            + sec('score', `<div class="bigsc right on-photo" data-fit="w" data-min=".3" style="${box(660, CB - 290 - 230, 360, 230)}"><b>${big}</b><span>${sub}</span></div>`)
            + stats(CB - 260, 180) + stamp;
        }
        if (L === 'bold') {
          const y0 = 150 + CB * 0.25;
          return ph(0, 500, CB * 0.3, 580, CB * 0.7, 'cut-glow') + sec('info', head)
            + sec('player', `<div class="pcol" style="${box(60, 150, 960, CB * 0.25)}"><div class="mword" data-fit="w" data-min=".4">${P(d.word)}</div><div class="xi-team multi" data-fit data-min=".3">${T(d.player)}</div></div>`)
            + sec('score', `<div class="rcol" style="${box(60, y0 + 20, 460, CB - y0 - 80)}">
                <div class="rbox a" data-fit><span><b>${bat ? P(d.runs) : P(d.wkts)}</b><small>${bat ? t('রান', 'RUNS') : t('উইকেট', 'WICKETS')}</small></span></div>
                <div class="rbox" data-fit><span><b>${bat ? P(d.balls) : P(d.runs)}</b><small>${bat ? t('বল', 'BALLS') : t('রান', 'RUNS')}</small></span></div>
                <div class="chips sm">${chips}</div><div class="vsl">${vs}</div></div>`) + stamp;
        }
        return sec('ghost', `<div class="ghost-num ${o.test ? 'red' : ''}" data-fit="w" data-min=".3" style="${box(280, 140, 740, CB * 0.55)}">${ghost}</div>`)
          + ph(0, 440, 190, 640, CB - 190, 'cut-glow') + sec('info', head)
          + sec('player', `<div class="pcol" style="${box(60, 170, 560, CB - 170 - 300)}"><div class="mword" data-fit="w" data-min=".4">${P(d.word)}</div>
              <div class="xi-team multi" data-fit data-min=".3">${T(d.player)}</div><div class="vsl">${vs}</div>
              <div class="bigsc" data-fit="w" data-min=".3"><b>${big}</b><span>${sub}</span></div></div>`)
          + stats(CB - 270, 190) + stamp;
      },
    };
  }

  /* ---------------------------------------------------------------- one moment: wicket, goal, red card
     cut: giant word across the top, cut-out player; photo: full photo, giant word in the middle */
  function moment(o) {
    return {
      id: o.id, name: o.name, icon: o.icon, group: o.group, vars: o.vars,
      layouts: { cut: 'কাট-আউট ~ Cut-out', photo: 'ফুল ছবি ~ Full photo' }, logo: { cut: ['tr'], photo: ['tr'] },
      fields: [f('word', 'বড় লেখা ~ Big word'), f('player', o.who || 'খেলোয়াড় ~ Player')].concat(o.fields, [P_INFO]),
      photos: [{ label: 'খেলোয়াড়ের ছবি ~ Player photo', mode: 'cut', name: 'player', modes: { photo: 'scene' } }],
      data: o.data, dataEn: o.dataEn,
      render(d, c) {
        const { L, CB, T, P, sec, ph, t } = c, rows = o.rows(d, t).filter(r => has(r[1]));
        const kv = rows.map(([l, v]) => `<li><small>${l}</small><b>${P(v)}</b></li>`).join('');
        const line = o.line(d, P, t), icon = o.badge || '';
        if (L === 'photo') {
          return ph(0, 0, 0, 1080, CB) + `<div class="shade-b" style="${box(0, CB * 0.25, 1080, CB * 0.75)}"></div>` + sec('info', top(infoBar(d.info, P)))
            + sec('word', `<div class="mega-word on-photo" data-fit="w" data-min=".3" style="${box(40, CB * 0.4, 1000, CB * 0.2)}">${icon}${P(d.word)}</div>`)
            + sec('player', `<div class="pcol on-photo center" style="${box(60, CB * 0.6, 960, CB * 0.4 - 250)}"><div class="xi-team multi" data-fit data-min=".3">${T(d.player)}</div><div class="bigsc mid">${line}</div></div>`)
            + sec('rows', `<ul class="kv row" style="${box(50, CB - 230, 980, 170)}">${kv}</ul>`, !!kv);
        }
        return sec('word', `<div class="mega-word" data-fit="w" data-min=".3" style="${box(40, 170, 1000, CB * 0.2)}">${icon}${P(d.word)}</div>`)
          + ph(0, 480, 170 + CB * 0.14, 600, CB - 170 - CB * 0.14, 'cut-glow') + sec('info', top(infoBar(d.info, P)))
          + sec('player', `<div class="pcol" style="${box(60, 200 + CB * 0.2, 520, CB * 0.8 - 200 - (kv ? 60 + rows.length * 100 : 60))}"><div class="xi-team multi" data-fit data-min=".3">${T(d.player)}</div><div class="bigsc mid">${line}</div></div>`)
          + sec('rows', `<ul class="kv" style="${box(60, CB - 40 - rows.length * 100, 560, rows.length * 100)}">${kv}</ul>`, !!kv);
      },
    };
  }

  /* ---------------------------------------------------------------- an over, ball by ball */
  function over(o) {
    return {
      id: o.id, name: o.name, icon: o.icon, group: 'cricket', vars: o.vars,
      layouts: { cut: 'কাট-আউট ~ Cut-out', photo: 'ছবি উপরে ~ Photo on top' }, logo: { cut: ['tr'], photo: ['tr'] },
      fields: [f('word', 'বড় শিরোনাম ~ Big headline'), f('player', 'বোলার ~ Bowler'), P_TEAM, P_OPP, f('over', 'কত নম্বর ওভার ~ Over number'),
        f('balls', 'ছয়টা বল (ফাঁকা দিয়ে: W = উইকেট, wd/nb = অতিরিক্ত) ~ The balls (space between: W = wicket, wd/nb = extras)'), P_INFO],
      photos: [{ label: 'বোলারের ছবি ~ Bowler photo', mode: 'cut', name: 'player', modes: { photo: 'scene' } }],
      data: o.data, dataEn: o.dataEn,
      render(d, c) {
        const { L, CB, T, P, sec, ph, t } = c;
        let runs = 0, wk = 0;
        const balls = ST.enDigits(d.balls).trim().split(/\s+/).filter(Boolean).map(b => {
          const s = b.toLowerCase(), r = +(s.match(/\d+/) || [0])[0];
          if (s === 'w') { wk++; return `<i class="ball w">W</i>`; }
          if (/^(wd|nb|w\d|nb\d)/.test(s)) { runs += 1 + (s.startsWith('wd') || s.startsWith('nb') ? r : 0); return `<i class="ball x">${P(b)}</i>`; }
          runs += r; return `<i class="ball ${r >= 4 ? 'b' + Math.min(6, r) : r === 0 ? 'dot' : ''}">${r === 0 ? '•' : P(r)}</i>`;
        }).join('');
        const total = `${P(runs)} ${t('রান', runs === 1 ? 'run' : 'runs')}${wk ? ` · ${P(wk)} ${t('উইকেট', wk === 1 ? 'wicket' : 'wickets')}` : ''}`;
        const ovl = has(d.over) ? `${t('ওভার', 'Over')} ${P(d.over)}` : '';
        const vs = [d.team, d.opp].filter(has).map(x => P(x)).join(` <em>${t('বনাম', 'vs')}</em> `);
        const strip = (y) => sec('balls', `<div class="overbox" style="${box(50, y, 980, 300)}"><div class="ov-h"><span>${ovl}</span><b>${total}</b></div><div class="ov-balls">${balls}</div></div>`);
        if (L === 'photo') {
          const pb = CB * 0.46;
          return ph(0, 0, 0, 1080, pb, 'fade-b') + sec('info', top(infoBar(d.info, P)))
            + sec('player', `<div class="pcol" style="${box(60, pb - 60, 960, CB - pb - 340)}"><div class="mword" data-fit="w" data-min=".4">${P(d.word)}</div><div class="xi-team multi" data-fit data-min=".3">${T(d.player)}</div><div class="vsl">${vs}</div></div>`)
            + strip(CB - 340);
        }
        return ph(0, 470, 170, 610, CB - 170 - 300, 'cut-glow') + sec('info', top(infoBar(d.info, P)))
          + sec('player', `<div class="pcol" style="${box(60, 170, 560, CB - 170 - 360)}"><div class="mword multi" data-fit data-min=".4"><span>${P(d.word)}</span></div><div class="xi-team multi" data-fit data-min=".3">${T(d.player)}</div><div class="vsl">${vs}</div></div>`)
          + strip(CB - 340);
      },
    };
  }

  /* ---------------------------------------------------------------- score boards: score update, innings break, stumps */
  function board(o) {
    return {
      id: o.id, name: o.name, icon: o.icon, group: o.group,
      layouts: { photo: 'ছবি উপরে ~ Photo on top', center: 'মাঝখানে বোর্ড ~ Board in the middle' }, logo: { photo: ['tr'], center: ['tr'] },
      fields: o.fields, photos: [{ label: 'ম্যাচের ছবি (ঐচ্ছিক) ~ Match photo (optional)', mode: 'scene' }, { label: 'দল ১ এর লোগো ~ Team 1 crest', mode: 'logo', team: 1 }].concat(o.two ? [{ label: 'দল ২ এর লোগো ~ Team 2 crest', mode: 'logo', team: 2 }] : []),
      data: o.data, dataEn: o.dataEn,
      render(d, c) {
        const { L, CB, T, P, sec, ph, t } = c, b = o.make(d, t, P);
        const rows = b.rows.map((r, i) => `<div class="trow ${r.lead ? 'lead' : ''}">${ph(i + 1, 0, 0, 110, 110, 'crest inl')}<span class="tn">${P(r.t)}</span><b>${P(r.s)}</b>${has(r.o) ? `<small>${P(r.o)}</small>` : ''}</div>`).join('');
        const inner = `<div class="sb-status">${P(b.status)}</div>${rows}${b.strip ? `<div class="sb-strip">${b.strip}</div>` : ''}${b.chips ? `<div class="chips sm">${b.chips}</div>` : ''}`;
        const hgt = 130 + b.rows.length * 170 + (b.strip ? 110 : 0) + (b.chips ? 150 : 0);
        if (L === 'center') {
          const y = Math.max(150, (CB - hgt) / 2 + 30);
          return (c.has(0) ? ph(0, 0, 0, 1080, CB, 'dim') : '') + sec('info', top(infoBar(d.info, P)))
            + sec('board', `<div class="sboard" style="${box(60, y, 960, hgt)}">${inner}</div>`);
        }
        const y = Math.max(CB * 0.36, CB - hgt - 50);
        return ph(0, 0, 0, 1080, y + 120, 'fade-b') + sec('info', top(infoBar(d.info, P)))
          + sec('board', `<div class="sboard" style="${box(60, y, 960, hgt)}">${inner}</div>`);
      },
    };
  }

  /* ---------------------------------------------------------------- results in big type (cricket, football, Test) */
  function result(o) {
    const fields = [f('winner', 'বিজয়ী দল ~ Winning team'), f('mid', 'রঙিন লাইন (ব্যবধান) ~ Line in colour (margin)'), f('low', 'নিচের লাইন (প্রতিপক্ষ) ~ Line under (opponent)')]
      .concat(o.test ? [f('series', 'সিরিজের অবস্থা (ঐচ্ছিক) ~ Series line (optional)'), f('potm', 'ম্যাচসেরা (ঐচ্ছিক) ~ Player of the match (optional)')] : [], [P_INFO]);
    return {
      id: o.id, name: o.name, icon: o.icon, group: o.group,
      layouts: { bold: 'বোল্ড লেখা ~ Bold type', cut: 'কাট-আউট পাশে ~ Cut-out beside', photo: 'ছবি উপরে ~ Photo on top' },
      logo: { bold: ['tr'], cut: ['tr'], photo: ['tr'] }, fields,
      photos: [{ label: 'ছবি (উদযাপন / খেলোয়াড়) ~ Photo (celebration / player)', mode: 'scene', modes: { cut: 'cut' } }, { label: 'বিজয়ী দলের লোগো ~ Winner crest', mode: 'logo', team: 1 }],
      data: o.data, dataEn: o.dataEn,
      render(d, c) {
        const { L, CB, T, P, sec, ph, t } = c;
        const foot = [has(d.series) ? P(d.series) : '', has(d.potm) ? `${t('ম্যাচসেরা', 'Player of the match')}: <b>${P(d.potm)}</b>` : ''].filter(Boolean).join('<i></i>');
        const tag = o.test ? testTag(t) : `<div class="kick"><span>${t('ফলাফল', 'RESULT')}</span><i></i><i></i></div>`;
        const block = (cls, align) => `<div class="rs ${cls}" style="text-align:${align}">${c.has(1) ? `<div class="rs-crest">${ph(1, 0, 0, 150, 150, 'crest inl')}</div>` : ''}
          <div class="rs-win" data-fit="w" data-min=".3">${P(d.winner)}</div><div class="rs-mid" data-fit="w" data-min=".3">${T(d.mid)}</div><div class="rs-low">${P(d.low)}</div></div>`;
        const ft = (y) => sec('foot', `<div class="rs-foot" style="${box(60, y, 960, 90)}">${foot}</div>`, !!foot);
        if (L === 'cut') {
          return ph(0, 520, 180, 560, CB - 180, 'cut-glow') + sec('info', top(tag + infoBar(d.info, P)))
            + sec('text', `<div style="${box(60, CB * 0.3, 560, CB * 0.55)}" class="rs-wrap">${block('', 'left')}</div>`) + ft(CB - 130);
        }
        if (L === 'photo') {
          const pb = CB * 0.5;
          return ph(0, 0, 0, 1080, pb + 80, 'fade-b') + sec('info', top(tag + infoBar(d.info, P)))
            + sec('text', `<div style="${box(60, pb, 960, CB - pb - (foot ? 170 : 60))}" class="rs-wrap">${block('', 'center')}</div>`) + ft(CB - 130);
        }
        return (c.has(0) ? ph(0, 0, 0, 1080, CB, 'dim') : '') + sec('info', top(tag + infoBar(d.info, P)))
          + sec('text', `<div style="${box(60, 190, 960, CB - 190 - (foot ? 170 : 60))}" class="rs-wrap">${block('big', 'center')}</div>`) + ft(CB - 130);
      },
    };
  }

  /* ---------------------------------------------------------------- a stamp line over a photo: status, toss */
  function stamp(o) {
    return {
      id: o.id, name: o.name, icon: o.icon, group: o.group,
      layouts: { photo: 'ফুল ছবি ~ Full photo', cut: 'কাট-আউট পাশে ~ Cut-out beside' }, logo: { photo: ['tr'], cut: ['tr'] },
      fields: [f('top', o.topLabel), f('stamp', 'বড় লেখা (*তারা* দিলে রঙিন) ~ Headline (*stars* = colour)', 'area', 2), f('detail', 'নিচের লাইন ~ Detail line')],
      photos: [{ label: 'ছবি ~ Photo', mode: 'scene', modes: { cut: 'cut' }, name: o.nameField }],
      data: o.data, dataEn: o.dataEn,
      render(d, c) {
        const { L, CB, T, P, sec, ph } = c;
        if (L === 'cut') {
          return ph(0, 500, 170, 580, CB - 170, 'cut-glow') + (o.coin ? sec('coin', `<div class="coin" style="left:60px;top:160px">${o.coin}</div>`) : '')
            + sec('text', `<div class="pcol" style="${box(60, o.coin ? 360 : 200, 540, CB - (o.coin ? 360 : 200) - 80)}"><div class="xi-k big">${P(d.top)}</div>
                <div class="stamp-box" data-fit data-min=".3">${T(d.stamp)}</div><div class="vsl">${P(d.detail)}</div></div>`);
        }
        return ph(0, 0, 0, 1080, CB) + `<div class="shade-b" style="${box(0, CB * 0.3, 1080, CB * 0.7)}"></div>`
          + sec('text', `<div class="pcol center on-photo" style="${box(70, CB * 0.52, 940, CB * 0.48 - 60)}"><div class="xi-k big">${o.coin ? o.coin.replace('class="', 'class="sm ') : ''}${P(d.top)}</div>
              <div class="stamp-box" data-fit data-min=".3">${T(d.stamp)}</div><div class="vsl">${P(d.detail)}</div></div>`);
      },
    };
  }

  const COIN = '<span class="coin-i"><svg viewBox="0 0 100 100" width="100%" height="100%"><circle cx="50" cy="50" r="46" fill="#f2b632" stroke="#b8860b" stroke-width="6"/><circle cx="50" cy="50" r="32" fill="none" stroke="#b8860b" stroke-width="3" stroke-dasharray="4 4"/></svg></span>';

  const more = [
    // ================================================================ cricket
    perf({ id: 'fifty', name: 'ফিফটি ~ Fifty', icon: '5️⃣', group: 'cricket', kind: 'bat', mile: '50',
      data: { word: 'দুর্দান্ত ফিফটি', player: 'তাওহীদ হৃদয়', team: 'বাংলাদেশ', opp: 'দক্ষিণ আফ্রিকা', runs: '52*', balls: '38', fours: '5', sixes: '2', info: 'প্রথম টি-টোয়েন্টি | চট্টগ্রাম' },
      dataEn: { word: 'FIFTY', player: 'Towhid Hridoy', team: 'Bangladesh', opp: 'South Africa', runs: '52*', balls: '38', fours: '5', sixes: '2', info: '1st T20I | Chattogram' } }),
    perf({ id: 'century', name: 'সেঞ্চুরি ~ Century', icon: '💯', group: 'cricket', kind: 'bat', mile: '100',
      data: { word: 'সেঞ্চুরি!', player: 'নাজমুল হোসেন শান্ত', team: 'বাংলাদেশ', opp: 'দক্ষিণ আফ্রিকা', runs: '104*', balls: '121', fours: '9', sixes: '3', info: 'দ্বিতীয় ওয়ানডে | মিরপুর' },
      dataEn: { word: 'HUNDRED!', player: 'Najmul Hossain Shanto', team: 'Bangladesh', opp: 'South Africa', runs: '104*', balls: '121', fours: '9', sixes: '3', info: '2nd ODI | Mirpur' } }),
    perf({ id: 'knock', name: 'ইনিংস (X বলে Y) ~ Knock (X off Y)', icon: '🏏', group: 'cricket', kind: 'bat', duck: true,
      data: { word: 'ঝড়ো ইনিংস', player: 'লিটন দাস', team: 'বাংলাদেশ', opp: 'দক্ষিণ আফ্রিকা', runs: '82', balls: '41', fours: '8', sixes: '4', info: 'প্রথম ওয়ানডে | মিরপুর' },
      dataEn: { word: 'WHAT A KNOCK', player: 'Litton Das', team: 'Bangladesh', opp: 'South Africa', runs: '82', balls: '41', fours: '8', sixes: '4', info: '1st ODI | Mirpur' } }),
    perf({ id: 'bigknock', name: 'বড় ইনিংস (বোল্ড) ~ Big knock (bold)', icon: '💥', group: 'cricket', kind: 'bat', order: ['bold', 'hero', 'photo'],
      data: { word: 'ক্যামিও!', player: 'মাহমুদউল্লাহ রিয়াদ', team: 'বাংলাদেশ', opp: 'ওয়েস্ট ইন্ডিজ', runs: '43', balls: '21', fours: '3', sixes: '4', info: 'বাংলাদেশ বনাম ওয়েস্ট ইন্ডিজ | ডব্লিউসিএল ২০২৬' },
      dataEn: { word: 'CAMEO!', player: 'Mahmudullah Riyad', team: 'Bangladesh', opp: 'West Indies', runs: '43', balls: '21', fours: '3', sixes: '4', info: 'BAN vs WI | WCL 2026' } }),
    moment({ id: 'wicket', name: 'উইকেট ~ Wicket', icon: '🎯', group: 'cricket', who: 'যিনি আউট হলেন ~ Batter out',
      fields: [f('runs', 'রান ~ Runs'), f('balls', 'বল ~ Balls'), f('how', 'কীভাবে আউট ~ How out'), f('bowler', 'বোলার ~ Bowler'), f('score', 'দলের স্কোর এখন ~ Team score now')],
      line: (d, P, t) => `<b>${P(d.runs)}</b>${has(d.balls) ? `<span>(${P(d.balls)})</span>` : ''}`,
      rows: (d, t) => [[t('আউট', 'Out'), d.how], [t('বোলার', 'Bowler'), d.bowler], [t('স্কোর', 'Score'), d.score]],
      data: { word: 'আউট!', player: 'টেম্বা বাভুমা', runs: '41', balls: '55', how: 'ক লিটন ব তাসকিন', bowler: 'তাসকিন আহমেদ', score: '142/4 (31.2)', info: 'দ্বিতীয় ওয়ানডে | মিরপুর' },
      dataEn: { word: 'GONE!', player: 'Temba Bavuma', runs: '41', balls: '55', how: 'c Litton b Taskin', bowler: 'Taskin Ahmed', score: '142/4 (31.2)', info: '2nd ODI | Mirpur' } }),
    perf({ id: 'fifer', name: 'পাঁচ উইকেট ~ Five-for', icon: '🖐️', group: 'cricket', kind: 'bowl', mile: '5',
      data: { word: 'পাঁচ উইকেট!', player: 'মুস্তাফিজুর রহমান', team: 'বাংলাদেশ', opp: 'দক্ষিণ আফ্রিকা', wkts: '5', runs: '23', overs: '8.3', maidens: '1', info: 'তৃতীয় ওয়ানডে | সিলেট' },
      dataEn: { word: 'FIVE-FOR!', player: 'Mustafizur Rahman', team: 'Bangladesh', opp: 'South Africa', wkts: '5', runs: '23', overs: '8.3', maidens: '1', info: '3rd ODI | Sylhet' } }),
    over({ id: 'goodover', name: 'দুর্দান্ত ওভার ~ Brilliant over', icon: '🔥',
      data: { word: 'কী একটা ওভার!', player: 'তাসকিন আহমেদ', team: 'বাংলাদেশ', opp: 'দক্ষিণ আফ্রিকা', over: '19', balls: 'W 0 0 W 1 0', info: 'দ্বিতীয় টি-টোয়েন্টি | মিরপুর' },
      dataEn: { word: 'WHAT AN OVER!', player: 'Taskin Ahmed', team: 'Bangladesh', opp: 'South Africa', over: '19', balls: 'W 0 0 W 1 0', info: '2nd T20I | Mirpur' } }),
    over({ id: 'badover', name: 'খরুচে ওভার ~ Expensive over', icon: '💸', vars: { acc: '#ff4d5e', 'acc-ink': '#fff' },
      data: { word: 'খরুচে ওভার', player: 'শরিফুল ইসলাম', team: 'বাংলাদেশ', opp: 'দক্ষিণ আফ্রিকা', over: '48', balls: '6 4 wd 6 1 4', info: 'প্রথম ওয়ানডে | মিরপুর' },
      dataEn: { word: 'EXPENSIVE OVER', player: 'Shoriful Islam', team: 'Bangladesh', opp: 'South Africa', over: '48', balls: '6 4 wd 6 1 4', info: '1st ODI | Mirpur' } }),
    board({ id: 'scoreupd', name: 'স্কোর আপডেট ~ Score update', icon: '⏱️', group: 'cricket',
      fields: [f('status', 'অবস্থা ~ Status'), f('team', 'দল ~ Team'), f('score', 'স্কোর ~ Score'), f('overs', 'ওভার ~ Overs'), f('detail', 'বাড়তি লাইন (ঐচ্ছিক) ~ Extra line (optional)'), P_INFO],
      make: (d, t, P) => ({ status: d.status, rows: [{ t: d.team, s: d.score, o: has(d.overs) ? `${d.overs} ${t('ওভার', 'ov')}` : '' }], strip: has(d.detail) ? P(d.detail) : '' }),
      data: { status: 'প্রথম দিন শেষে', team: 'বাংলাদেশ', score: '317/8', overs: '84', detail: 'মুশফিকুর ৯৬* রানে অপরাজিত', info: 'প্রথম টেস্ট | বনাম আফগানিস্তান' },
      dataEn: { status: 'STUMPS, DAY 1', team: 'Bangladesh', score: '317/8', overs: '84', detail: 'Mushfiqur unbeaten on 96', info: '1st Test | vs Afghanistan' } }),
    board({ id: 'innings', name: 'ইনিংস বিরতি ~ Innings break', icon: '☕', group: 'cricket',
      fields: [f('team', 'ব্যাট করা দল ~ Batting team'), f('score', 'স্কোর ~ Score'), f('overs', 'ওভার ~ Overs'), f('opp', 'প্রতিপক্ষ (লক্ষ্যের লাইনে) ~ Chasing team (for the target line)'),
        f('topbat', 'সেরা ব্যাটার ~ Top scorer'), f('topbowl', 'সেরা বোলার ~ Top bowler'), P_INFO],
      make: (d, t, P) => {
        const target = num(String(d.score).split('/')[0]) + 1;
        return { status: t('ইনিংস বিরতি', 'INNINGS BREAK'), rows: [{ t: d.team, s: d.score, o: has(d.overs) ? `${d.overs} ${t('ওভার', 'ov')}` : '' }],
          strip: target > 1 ? (has(d.opp) ? `${P(d.opp)}: ${t('জিততে দরকার', 'need')} <b>${P(target)}</b> ${t('রান', 'to win')}` : `${t('লক্ষ্য', 'Target')} <b>${P(target)}</b>`) : '',
          chips: chipsOf([[d.topbat, t('সেরা ব্যাটার', 'Top scorer')], [d.topbowl, t('সেরা বোলার', 'Top bowler')]], P) };
      },
      data: { team: 'বাংলাদেশ', score: '286/7', overs: '50', opp: 'দক্ষিণ আফ্রিকা', topbat: 'হৃদয় ৮৪ (৭৯)', topbowl: 'রাবাদা ৩/৪৫', info: 'প্রথম ওয়ানডে | মিরপুর' },
      dataEn: { team: 'Bangladesh', score: '286/7', overs: '50', opp: 'South Africa', topbat: 'Hridoy 84 (79)', topbowl: 'Rabada 3/45', info: '1st ODI | Mirpur' } }),
    {
      id: 'cresult', name: 'ম্যাচের ফলাফল + ম্যাচসেরা ~ Match result + POTM', icon: '🏆', group: 'cricket',
      layouts: { potm: 'ম্যাচসেরা কাট-আউট ~ Player of the match cut-out', photo: 'ছবি উপরে ~ Photo on top' }, logo: { potm: ['tr'], photo: ['tr'] },
      fields: [f('head', 'ফলাফলের শিরোনাম (*তারা* দিলে রঙিন) ~ Result headline (*stars* = colour)', 'area', 2), f('t1', 'বিজয়ী দল ~ Winning team'), f('s1', 'বিজয়ী দলের স্কোর ~ Winner score'),
        f('t2', 'হেরে যাওয়া দল ~ Losing team'), f('s2', 'হেরে যাওয়া দলের স্কোর ~ Loser score'), f('potm', 'ম্যাচসেরা ~ Player of the match'), f('potmLine', 'ম্যাচসেরার পারফরম্যান্স ~ POTM figures'), P_INFO],
      photos: [{ label: 'ম্যাচসেরার ছবি (অটো কাটা) ~ POTM photo (auto cut-out)', mode: 'cut', name: 'potm' }, { label: 'বিজয়ী দলের লোগো ~ Winner crest', mode: 'logo', team: 1 }, { label: 'অন্য দলের লোগো ~ Other crest', mode: 'logo', team: 2 }, { label: 'ম্যাচের ছবি ~ Match photo', mode: 'scene' }],
      data: { head: '*টাইগারদের জয়* ৫ উইকেটে', t1: 'বাংলাদেশ', s1: '287/5 (48.2)', t2: 'দক্ষিণ আফ্রিকা', s2: '286/7 (50)', potm: 'তাওহীদ হৃদয়', potmLine: '৮৪* (৭৯)', info: 'প্রথম ওয়ানডে | মিরপুর' },
      dataEn: { head: '*TIGERS WIN* BY 5 WICKETS', t1: 'Bangladesh', s1: '287/5 (48.2)', t2: 'South Africa', s2: '286/7 (50)', potm: 'Towhid Hridoy', potmLine: '84* (79)', info: '1st ODI | Mirpur' },
      render(d, c) {
        const { L, CB, T, P, sec, ph, t } = c;
        const row = (i, lead) => `<div class="trow ${lead ? 'lead' : ''}">${ph(i, 0, 0, 96, 96, 'crest inl')}<span class="tn">${P(d['t' + i])}</span><b>${P(d['s' + i])}</b></div>`;
        const pm = `<div class="potm"><small>${t('ম্যাচসেরা', 'PLAYER OF THE MATCH')}</small><b>${P(d.potm)}</b>${has(d.potmLine) ? `<span>${P(d.potmLine)}</span>` : ''}</div>`;
        if (L === 'photo') {
          const pb = CB * 0.42;
          return ph(3, 0, 0, 1080, pb + 80, 'fade-b') + sec('info', top(infoBar(d.info, P)))
            + sec('head', `<div class="news-head center" data-fit style="${box(60, pb - 20, 960, 190)}">${T(d.head)}</div>`)
            + sec('board', `<div class="sboard flat" style="${box(60, pb + 190, 960, 300)}">${row(1, true)}${row(2)}</div>`)
            + sec('potm', `<div style="${box(60, CB - 170, 960, 130)}">${pm.replace('class="potm"', 'class="potm wide"')}</div>`, has(d.potm));
        }
        return ph(0, 540, 260, 540, CB - 260, 'cut-glow') + sec('info', top(infoBar(d.info, P)))
          + sec('head', `<div class="news-head" data-fit style="${box(60, 160, 960, 200)}">${T(d.head)}</div>`)
          + sec('board', `<div class="sboard flat narrow" style="${box(60, 400, 560, 320)}">${row(1, true)}${row(2)}</div>`)
          + sec('potm', `<div style="${box(560, CB - 230, 470, 190)}">${pm}</div>`, has(d.potm));
      },
    },
    result({ id: 'cbold', name: 'ফলাফল (বোল্ড) ~ Result (bold)', icon: '🅱️', group: 'cricket',
      data: { winner: 'ওয়েস্ট ইন্ডিজ', mid: '*৬ উইকেটে* জয়', low: 'ভারতের বিপক্ষে', info: 'দ্বিতীয় টি-টোয়েন্টি | ভারত সফর ২০২৬' },
      dataEn: { winner: 'West Indies', mid: 'beat India *by 6 wickets*', low: '', info: '2nd T20I | WI in IND 2026' } }),
    {
      id: 'form', name: 'সাম্প্রতিক ফর্ম ~ Recent form', icon: '📉', group: 'cricket',
      layouts: { bars: 'বার চার্ট ~ Bar chart', tiles: 'টাইল ~ Tiles' }, logo: { bars: ['tr'], tiles: ['tr'] },
      fields: [f('player', 'খেলোয়াড় ~ Player'), f('title', 'শিরোনাম ~ Title'), f('scores', 'স্কোর, নতুনটা আগে (রান + প্রতিপক্ষ, কমা দিয়ে) ~ Scores, newest first (runs + opponent, comma between)', 'area', 3)],
      photos: [{ label: 'খেলোয়াড়ের ছবি (অটো কাটা) ~ Player photo (auto cut-out)', mode: 'cut', name: 'player' }],
      data: { player: 'সাদমান ইসলাম', title: 'শেষ ১২ টেস্ট ইনিংস', scores: '80 আয়ার, 35 আয়ার, 78 আয়ার, 13 পাক, 10 পাক, 20 জিম, 9 জিম, 20 অস্ট্রে, 25* অস্ট্রে, 0 অস্ট্রে, 1 অস্ট্রে, 67 আফগা' },
      dataEn: { player: 'Shadman Islam', title: 'Last 12 Test innings', scores: '80 IRE, 35 IRE, 78 IRE, 13 PAK, 10 PAK, 20 ZIM, 9 ZIM, 20 AUS, 25* AUS, 0 AUS, 1 AUS, 67 AFG' },
      render(d, c) {
        const { L, CB, T, P, sec, ph, t } = c;
        const sc = String(d.scores || '').split(/[,،\n]+/).map(s => s.trim()).filter(Boolean).map(s => { const m = s.match(/^([0-9০-৯]+\*?)\s*(.*)$/); return m ? { r: m[1], o: m[2] } : { r: s, o: '' }; });
        const max = Math.max(50, ...sc.map(s => num(s.r)));
        const tot = sc.reduce((a, s) => a + num(s.r), 0), outs = sc.filter(s => !/\*/.test(s.r)).length;
        const avg = outs ? (tot / outs).toFixed(1) : '', fifties = sc.filter(s => num(s.r) >= 50).length;
        const sum = chipsOf([[tot, t('রান', 'Runs')], [avg, t('গড়', 'Average')], [fifties, t('৫০+', '50+')]], P);
        const tH = (L === 'tiles' ? CB * 0.42 : CB * 0.45 - 160) - 150;
        const title = sec('title', `<div class="pcol" style="${box(60, 150, 500, tH)}"><div class="xi-k big">${P(d.player)}</div><div class="xi-team multi" data-fit data-min=".3">${T(d.title)}</div></div>`);
        if (L === 'tiles') {
          return ph(0, 600, 150, 480, CB * 0.42 - 150, 'cut-glow') + title
            + sec('stats', `<div class="chips" style="${box(50, CB * 0.42 + 10, 980, 170)}">${sum}</div>`)
            + sec('rows', `<div class="form-tiles" style="${box(50, CB * 0.42 + 210, 980, CB - CB * 0.42 - 250)}">${sc.map(s => `<div class="${num(s.r) >= 50 ? 'hi' : ''}"><b>${P(s.r)}</b><small>${P(s.o)}</small></div>`).join('')}</div>`);
        }
        const by = CB * 0.45, bh = CB - by - 60;
        return ph(0, 560, 140, 520, by + 40 - 140, 'cut-glow') + title
          + sec('stats', `<div class="chips sm" style="${box(60, by - 150, 500, 130)}">${sum}</div>`)
          + sec('rows', `<div class="form-bars" style="${box(50, by, 980, bh)}">${sc.map(s => `<div class="${num(s.r) >= 50 ? 'hi' : ''}"><b>${P(s.r)}</b><i style="height:${Math.max(2, num(s.r) / max * 100)}%"></i><small>${P(s.o)}</small></div>`).join('')}</div>`);
      },
    },
    stamp({ id: 'toss', name: 'টস ~ Toss', icon: '🪙', group: 'cricket', topLabel: 'উপরের লাইন (ঐচ্ছিক) ~ Line above (optional)', coin: COIN,
      data: { top: 'একমাত্র টেস্ট · টস', stamp: '*বাংলাদেশ* টস জিতে আগে ব্যাটিংয়ে', detail: 'আফগানিস্তান বনাম বাংলাদেশ · আমিরাত ২০২৬' },
      dataEn: { top: 'Only Test · Toss', stamp: '*BANGLADESH* OPT TO BAT FIRST', detail: 'AFG v BAN in UAE 2026' } }),

    // ================================================================ Test cricket
    perf({ id: 'testton', name: 'টেস্ট সেঞ্চুরি ~ Test hundred', icon: '🔴', group: 'test', kind: 'bat', mile: '100', test: true,
      data: { word: 'টেস্ট সেঞ্চুরি', player: 'মুশফিকুর রহিম', team: 'বাংলাদেশ', opp: 'পাকিস্তান', runs: '191', balls: '341', fours: '22', sixes: '1', info: 'প্রথম টেস্ট | তৃতীয় দিন | রাওয়ালপিন্ডি' },
      dataEn: { word: 'TEST HUNDRED', player: 'Mushfiqur Rahim', team: 'Bangladesh', opp: 'Pakistan', runs: '191', balls: '341', fours: '22', sixes: '1', info: '1st Test | Day 3 | Rawalpindi' } }),
    perf({ id: 'testfifty', name: 'টেস্ট ফিফটি ~ Test fifty', icon: '🧢', group: 'test', kind: 'bat', mile: '50', test: true,
      data: { word: 'টেস্ট ফিফটি', player: 'লিটন দাস', team: 'বাংলাদেশ', opp: 'পাকিস্তান', runs: '56*', balls: '98', fours: '7', sixes: '0', info: 'প্রথম টেস্ট | দ্বিতীয় দিন | রাওয়ালপিন্ডি' },
      dataEn: { word: 'TEST FIFTY', player: 'Litton Das', team: 'Bangladesh', opp: 'Pakistan', runs: '56*', balls: '98', fours: '7', sixes: '0', info: '1st Test | Day 2 | Rawalpindi' } }),
    perf({ id: 'testfifer', name: 'টেস্টে ৫ উইকেট ~ Test five-for', icon: '🎳', group: 'test', kind: 'bowl', test: true,
      data: { word: '৫ উইকেট', player: 'তাইজুল ইসলাম', team: 'বাংলাদেশ', opp: 'পাকিস্তান', wkts: '6', runs: '39', overs: '24.4', maidens: '7', info: 'দ্বিতীয় টেস্ট | চতুর্থ দিন | মিরপুর' },
      dataEn: { word: 'FIVE-WICKET HAUL', player: 'Taijul Islam', team: 'Bangladesh', opp: 'Pakistan', wkts: '6', runs: '39', overs: '24.4', maidens: '7', info: '2nd Test | Day 4 | Mirpur' } }),
    board({ id: 'stumps', name: 'স্টাম্পস / লাঞ্চ / চা ~ Stumps / Lunch / Tea', icon: '🌙', group: 'test', two: true,
      fields: [f('status', 'অবস্থা ~ Status'), f('t1', 'দল ১ ~ Team 1'), f('s1', 'দল ১ এর স্কোর (দুই ইনিংস: 312 & 45/2) ~ Team 1 score (312 & 45/2)'), f('t2', 'দল ২ ~ Team 2'), f('s2', 'দল ২ এর স্কোর ~ Team 2 score'),
        f('line', 'ম্যাচের অবস্থা ~ Where it stands'), P_INFO],
      make: (d, t, P) => ({ status: d.status, rows: [{ t: d.t1, s: d.s1, lead: true }, { t: d.t2, s: d.s2 }], strip: has(d.line) ? P(d.line) : '' }),
      data: { status: 'দ্বিতীয় দিন শেষে', t1: 'বাংলাদেশ', s1: '312 & 45/2', t2: 'পাকিস্তান', s2: '241', line: 'বাংলাদেশ এগিয়ে ১১৬ রানে', info: 'দ্বিতীয় টেস্ট | মিরপুর' },
      dataEn: { status: 'STUMPS, DAY 2', t1: 'Bangladesh', s1: '312 & 45/2', t2: 'Pakistan', s2: '241', line: 'Bangladesh lead by 116 runs', info: '2nd Test | Mirpur' } }),
    result({ id: 'testresult', name: 'টেস্টের ফলাফল ~ Test result', icon: '🏟️', group: 'test', test: true,
      data: { winner: 'বাংলাদেশ', mid: '*১০ উইকেটে* জয়', low: 'পাকিস্তানের বিপক্ষে', series: 'সিরিজে ১-০ তে এগিয়ে বাংলাদেশ', potm: 'মুশফিকুর রহিম', info: 'প্রথম টেস্ট | রাওয়ালপিন্ডি' },
      dataEn: { winner: 'Bangladesh', mid: 'beat Pakistan *by 10 wickets*', low: '', series: 'Bangladesh lead the series 1-0', potm: 'Mushfiqur Rahim', info: '1st Test | Rawalpindi' } }),

    // ================================================================ football
    moment({ id: 'goal', name: 'গোল ~ Goal', icon: '🥅', group: 'football', who: 'গোলদাতা ~ Scorer',
      fields: [f('minute', 'মিনিট ~ Minute'), f('score', 'স্কোর এখন ~ Score now'), f('assist', 'অ্যাসিস্ট ~ Assist')],
      line: (d, P) => has(d.minute) ? `<b>${P(d.minute)}</b>` : '',
      rows: (d, t) => [[t('স্কোর', 'Score'), d.score], [t('অ্যাসিস্ট', 'Assist'), d.assist]],
      data: { word: 'গো-ও-ল!', player: 'লিওনেল মেসি', minute: "৬৭'", score: 'আর্জেন্টিনা ১-০ ব্রাজিল', assist: 'হুলিয়ান আলভারেজ', info: 'বিশ্বকাপ বাছাই | বুয়েনস আইরেস' },
      dataEn: { word: 'GOAL!', player: 'Lionel Messi', minute: "67'", score: 'Argentina 1-0 Brazil', assist: 'Julián Álvarez', info: 'World Cup qualifier | Buenos Aires' } }),
    result({ id: 'fbold', name: 'ফলাফল (বোল্ড) ~ Result (bold)', icon: '🅱️', group: 'football',
      data: { winner: 'আর্জেন্টিনা', mid: '*২-১* গোলে জয়', low: 'ব্রাজিলের বিপক্ষে', info: 'বিশ্বকাপ বাছাই | বুয়েনস আইরেস' },
      dataEn: { winner: 'Argentina', mid: 'beat Brazil *2-1*', low: '', info: 'World Cup qualifier | Buenos Aires' } }),
    moment({ id: 'redcard', name: 'লাল কার্ড ~ Red card', icon: '🟥', group: 'football', vars: { acc: '#ff3b3b', 'acc-ink': '#fff' }, badge: '<i class="rcard"></i>',
      fields: [P_TEAM, P_OPP, f('minute', 'মিনিট ~ Minute'), f('reason', 'কারণ ~ Reason')],
      line: (d, P) => has(d.minute) ? `<b>${P(d.minute)}</b>` : '',
      rows: (d, t) => [[t('কারণ', 'Reason'), d.reason], [t('ম্যাচ', 'Match'), [d.team, d.opp].filter(has).join(t(' বনাম ', ' vs '))]],
      data: { word: 'লাল কার্ড', player: 'কাসেমিরো', team: 'ব্রাজিল', opp: 'আর্জেন্টিনা', minute: "৫৮'", reason: 'দ্বিতীয় হলুদ কার্ড', info: '' },
      dataEn: { word: 'RED CARD', player: 'Casemiro', team: 'Brazil', opp: 'Argentina', minute: "58'", reason: 'Second yellow', info: '' } }),
    {
      id: 'rating', name: 'প্লেয়ার রেটিং ~ Player rating', icon: '⭐', group: 'football',
      layouts: { cut: 'কাট-আউট + রেটিং ~ Cut-out + rating', card: 'ছবি উপরে ~ Photo on top' }, logo: { cut: ['tr'], card: ['tr'] },
      fields: [f('player', 'খেলোয়াড় ~ Player'), P_TEAM, P_OPP, f('rating', '১০ এর মধ্যে রেটিং ~ Rating out of 10'), f('stats', 'মূল পরিসংখ্যান (নাম: সংখ্যা, কমা দিয়ে) ~ Key stats (Label: value, comma between)', 'area', 3), P_INFO],
      photos: [{ label: 'খেলোয়াড়ের ছবি ~ Player photo', mode: 'cut', name: 'player', modes: { card: 'scene' } }],
      data: { player: 'লিওনেল মেসি', team: 'আর্জেন্টিনা', opp: 'ব্রাজিল', rating: '9.2', stats: 'গোল: 1, অ্যাসিস্ট: 1, কি পাস: 5, ড্রিবল: 4', info: 'বিশ্বকাপ বাছাই' },
      dataEn: { player: 'Lionel Messi', team: 'Argentina', opp: 'Brazil', rating: '9.2', stats: 'Goals: 1, Assists: 1, Key passes: 5, Dribbles: 4', info: 'World Cup qualifier' },
      render(d, c) {
        const { L, CB, T, P, sec, ph, t } = c, v = Math.min(10, num(d.rating));
        const gauge = s => `<div class="gauge ${v >= 8 ? 'hi' : v < 6 ? 'lo' : ''}" style="width:${s}px;height:${s}px;--v:${v * 10}"><div style="font-size:${Math.round(s * 0.24)}px"><b>${P(d.rating)}</b><small>/${P(10)}</small></div></div>`;
        const vs = [d.team, d.opp].filter(has).map(x => P(x)).join(` <em>${t('বনাম', 'vs')}</em> `);
        const chips = chipsOf(pairs(d.stats).map(([l, x]) => [x, P(l)]), P);
        if (L === 'card') {
          const pb = CB * 0.5;
          return ph(0, 0, 0, 1080, pb, 'fade-b') + sec('info', top(infoBar(d.info, P)))
            + sec('gauge', `<div style="left:700px;top:${pb - 200}px">${gauge(320)}</div>`)
            + sec('player', `<div class="pcol" style="${box(60, pb - 20, 620, CB - pb - 250)}"><div class="xi-k big">${t('প্লেয়ার রেটিং', 'PLAYER RATING')}</div><div class="xi-team multi" data-fit data-min=".3">${T(d.player)}</div><div class="vsl">${vs}</div></div>`)
            + sec('stats', `<div class="chips" style="${box(50, CB - 230, 980, 170)}">${chips}</div>`, !!chips);
        }
        return ph(0, 0, 170, 600, CB - 170, 'cut-glow') + sec('info', top(infoBar(d.info, P)))
          + sec('gauge', `<div style="left:620px;top:190px">${gauge(380)}</div>`)
          + sec('player', `<div class="pcol right" style="${box(560, 600, 460, CB - 600 - 260)}"><div class="xi-k big">${t('প্লেয়ার রেটিং', 'PLAYER RATING')}</div><div class="xi-team multi" data-fit data-min=".3">${T(d.player)}</div><div class="vsl">${vs}</div></div>`)
          + sec('stats', `<div class="chips" style="${box(50, CB - 230, 980, 170)}">${chips}</div>`, !!chips);
      },
    },
    {
      id: 'transfer', name: 'ট্রান্সফার ~ Transfer', icon: '🔁', group: 'football',
      layouts: { hero: 'কাট-আউট ~ Cut-out', photo: 'ফুল ছবি ~ Full photo' }, logo: { hero: ['tr'], photo: ['tr'] },
      fields: [f('word', 'বড় লেখা ~ Big word'), f('player', 'খেলোয়াড় ~ Player'), f('from', 'আগের ক্লাব ~ From'), f('to', 'নতুন ক্লাব ~ To'), f('fee', 'ফি (ঐচ্ছিক) ~ Fee (optional)'), f('contract', 'চুক্তি (ঐচ্ছিক) ~ Contract (optional)'), P_INFO],
      photos: [{ label: 'খেলোয়াড়ের ছবি ~ Player photo', mode: 'cut', name: 'player', modes: { photo: 'scene' } }, { label: 'আগের ক্লাবের লোগো ~ From crest', mode: 'logo', team: 2 }, { label: 'নতুন ক্লাবের লোগো ~ To crest', mode: 'logo', team: 1 }],
      data: { word: 'হিয়ার উই গো!', player: 'ফ্লোরিয়ান উইর্টজ', from: 'লেভারকুসেন', to: 'লিভারপুল', fee: '€১২৫ মিলিয়ন', contract: '২০৩০ পর্যন্ত', info: 'অফিসিয়াল' },
      dataEn: { word: 'HERE WE GO!', player: 'Florian Wirtz', from: 'Leverkusen', to: 'Liverpool', fee: '€125m', contract: 'Until 2030', info: 'Official' },
      render(d, c) {
        const { L, CB, T, P, sec, ph, t } = c;
        const move = `<div class="tf-move"><div>${ph(1, 0, 0, 130, 130, 'crest inl')}<small>${P(d.from)}</small></div><i class="arr">➜</i><div>${ph(2, 0, 0, 130, 130, 'crest inl')}<small>${P(d.to)}</small></div></div>`;
        const chips = chipsOf([[d.fee, t('ফি', 'Fee')], [d.contract, t('চুক্তি', 'Contract')]], P);
        if (L === 'photo') {
          return ph(0, 0, 0, 1080, CB) + `<div class="shade-b" style="${box(0, CB * 0.3, 1080, CB * 0.7)}"></div>` + sec('info', top(infoBar(d.info, P)))
            + sec('word', `<div class="mega-word on-photo" data-fit="w" data-min=".3" style="${box(40, CB * 0.42, 1000, CB * 0.16)}">${P(d.word)}</div>`)
            + sec('player', `<div class="pcol on-photo" style="${box(60, CB * 0.58, 540, CB * 0.42 - 70)}"><div class="xi-team multi" data-fit data-min=".3">${T(d.player)}</div><div class="chips sm">${chips}</div></div>`)
            + sec('move', `<div style="${box(600, CB * 0.6, 430, 250)}">${move}</div>`);
        }
        return ph(0, 480, 300, 600, CB - 300, 'cut-glow') + sec('info', top(infoBar(d.info, P)))
          + sec('word', `<div class="mega-word" data-fit="w" data-min=".3" style="${box(40, 160, 1000, 180)}">${P(d.word)}</div>`)
          + sec('player', `<div class="pcol" style="${box(60, 380, 520, CB - 380 - 470)}"><div class="xi-team multi" data-fit data-min=".3">${T(d.player)}</div></div>`)
          + sec('move', `<div style="${box(60, CB - 460, 520, 250)}">${move}</div>`)
          + sec('stats', `<div class="chips sm" style="${box(60, CB - 190, 560, 140)}">${chips}</div>`, !!chips);
      },
    },
    {
      id: 'matchday', name: 'ম্যাচ ডে ~ Match day', icon: '📅', group: 'football',
      layouts: { crest: 'দুই লোগো মুখোমুখি ~ Crests face to face', photo: 'ছবি উপরে ~ Photo on top' }, logo: { crest: ['tr'], photo: ['tr'] },
      fields: [f('title', 'শিরোনাম ~ Title'), f('comp', 'টুর্নামেন্ট ~ Competition'), f('t1', 'দল ১ ~ Team 1'), f('t2', 'দল ২ ~ Team 2'), f('date', 'তারিখ ~ Date'), f('time', 'সময় ~ Time'), f('venue', 'মাঠ ~ Venue')],
      photos: [{ label: 'দল ১ এর লোগো ~ Team 1 crest', mode: 'logo', team: 1 }, { label: 'দল ২ এর লোগো ~ Team 2 crest', mode: 'logo', team: 2 }, { label: 'পেছনের ছবি (ঐচ্ছিক) ~ Background photo (optional)', mode: 'scene' }],
      data: { title: 'ম্যাচ ডে', comp: 'এশিয়ান কাপ বাছাই', t1: 'বাংলাদেশ', t2: 'ভারত', date: '১৮ নভেম্বর', time: 'রাত ৮টা', venue: 'জাতীয় স্টেডিয়াম, ঢাকা' },
      dataEn: { title: 'MATCH DAY', comp: 'Asian Cup qualifier', t1: 'Bangladesh', t2: 'India', date: '18 November', time: '8:00 PM', venue: 'National Stadium, Dhaka' },
      render(d, c) {
        const { L, CB, T, P, sec, ph, t } = c;
        const chips = chipsOf([[d.date, t('তারিখ', 'Date')], [d.time, t('সময়', 'Time')]], P);
        const face = s => `<div class="md-face"><div>${ph(0, 0, 0, s, s, 'crest inl')}<b>${P(d.t1)}</b></div><i>${t('বনাম', 'VS')}</i><div>${ph(1, 0, 0, s, s, 'crest inl')}<b>${P(d.t2)}</b></div></div>`;
        if (L === 'photo') {
          const pb = CB * 0.42;
          return ph(2, 0, 0, 1080, pb + 80, 'fade-b')
            + sec('title', `<div class="mega-word center" data-fit="w" data-min=".3" style="${box(60, pb - 110, 960, 170)}">${P(d.title)}</div>`)
            + sec('comp', `<div class="comp-pill" style="left:0;width:1080px;top:${pb + 80}px"><span>${P(d.comp)}</span></div>`, has(d.comp))
            + sec('face', `<div style="${box(40, pb + 170, 1000, CB - pb - 170 - 250)}">${face(Math.min(220, (CB - pb - 500)))}</div>`)
            + sec('when', `<div class="chips when" style="${box(50, CB - 230, 980, 170)}">${chips}<div class="wide"><b class="sm">${P(d.venue)}</b><small>${t('মাঠ', 'Venue')}</small></div></div>`);
        }
        return (c.has(2) ? ph(2, 0, 0, 1080, CB, 'dim') : '')
          + sec('title', `<div class="mega-word center" data-fit="w" data-min=".3" style="${box(60, 180, 960, 190)}">${P(d.title)}</div>`)
          + sec('comp', `<div class="comp-pill" style="left:0;width:1080px;top:390px"><span>${P(d.comp)}</span></div>`, has(d.comp))
          + sec('face', `<div style="${box(40, 490, 1000, CB - 490 - 260)}">${face(Math.min(300, CB - 490 - 420))}</div>`)
          + sec('when', `<div class="chips when" style="${box(50, CB - 230, 980, 170)}">${chips}<div class="wide"><b class="sm">${P(d.venue)}</b><small>${t('মাঠ', 'Venue')}</small></div></div>`);
      },
    },
    {
      id: 'fixtures', name: 'সূচি ~ Fixtures', icon: '🗓️', group: 'team',
      layouts: { list: 'তালিকা ~ List', cards: 'কার্ড ~ Cards' }, logo: { list: ['tr'], cards: ['tr'] },
      fields: [f('title', 'শিরোনাম ~ Title'), f('sub', 'নিচের লাইন ~ Line under'), f('rows', 'ম্যাচ (তারিখ | দল ১ | দল ২ | সময় / মাঠ) ~ Matches (date | team 1 | team 2 | time / venue)', 'area', 7)],
      photos: [{ label: 'টুর্নামেন্টের লোগো ~ Tournament logo', mode: 'logo' }],
      data: { title: 'বাংলাদেশের সূচি', sub: 'দক্ষিণ আফ্রিকা সফর ২০২৬', rows: '১২ নভেম্বর | বাংলাদেশ | দক্ষিণ আফ্রিকা | প্রথম ওয়ানডে · মিরপুর\n১৫ নভেম্বর | বাংলাদেশ | দক্ষিণ আফ্রিকা | দ্বিতীয় ওয়ানডে · মিরপুর\n১৮ নভেম্বর | বাংলাদেশ | দক্ষিণ আফ্রিকা | তৃতীয় ওয়ানডে · চট্টগ্রাম\n২২ নভেম্বর | বাংলাদেশ | দক্ষিণ আফ্রিকা | প্রথম টি-টোয়েন্টি · চট্টগ্রাম\n২৪ নভেম্বর | বাংলাদেশ | দক্ষিণ আফ্রিকা | দ্বিতীয় টি-টোয়েন্টি · সিলেট' },
      dataEn: { title: 'Bangladesh fixtures', sub: 'South Africa tour 2026', rows: '12 Nov | Bangladesh | South Africa | 1st ODI · Mirpur\n15 Nov | Bangladesh | South Africa | 2nd ODI · Mirpur\n18 Nov | Bangladesh | South Africa | 3rd ODI · Chattogram\n22 Nov | Bangladesh | South Africa | 1st T20I · Chattogram\n24 Nov | Bangladesh | South Africa | 2nd T20I · Sylhet' },
      render(d, c) {
        const { L, CB, P, sec, ph, t } = c, rows = ST.rows(d.rows);
        const head = sec('head', `<div class="pt-head" style="${box(60, 120, 960, 210)}">${ph(0, 0, 0, 140, 140, 'crest inl')}<div><div class="xi-team" data-fit="w" data-min=".4">${P(d.title)}</div><div class="band">${P(d.sub)}</div></div></div>`);
        if (L === 'cards') {
          return head + sec('rows', `<div class="fx-cards" data-fit style="${box(50, 360, 980, CB - 400)}">${rows.map(r => `<div><small>${P(r[0])}</small><b>${P(r[1] || '')} <em>${t('বনাম', 'vs')}</em> ${P(r[2] || '')}</b><span>${P(r[3] || '')}</span></div>`).join('')}</div>`);
        }
        return head + sec('rows', `<ul class="fx-list" data-fit style="${box(50, 360, 980, CB - 400)}">${rows.map(r => `<li><i>${P(r[0])}</i><span><b>${P(r[1] || '')} <em>${t('বনাম', 'vs')}</em> ${P(r[2] || '')}</b><small>${P(r[3] || '')}</small></span></li>`).join('')}</ul>`);
      },
    },

    // ================================================================ general
    stamp({ id: 'status', name: 'স্ট্যাটাস (একাদশে, ছিটকে গেলেন…) ~ Status (in the XI, ruled out…)', icon: '📌', group: 'general', topLabel: 'খেলোয়াড় ~ Player', nameField: 'top',
      data: { top: 'নাঈম হাসান', stamp: '*একাদশে* ফিরলেন', detail: 'একমাত্র টেস্ট · আফগানিস্তান বনাম বাংলাদেশ' },
      dataEn: { top: 'Nayeem Hasan', stamp: '*IN THE XI*', detail: 'Only Test | AFG v BAN in UAE 2026' } }),
    {
      id: 'hottake', name: 'হট টেক ~ Hot take', icon: '🌶️', group: 'general',
      layouts: { fire: 'বড় লেখা ~ Big type', photo: 'ছবি উপরে ~ Photo on top' }, logo: { fire: ['tr'], photo: ['tr'] },
      fields: [f('label', 'লেবেল ~ Label'), f('quote', 'আপনার মত (*তারা* দিলে রঙিন) ~ Your take (*stars* = colour)', 'area', 4), f('by', 'নাম ~ Signed')],
      photos: [{ label: 'ছবি (ঐচ্ছিক) ~ Photo (optional)', mode: 'scene' }],
      data: { label: 'হট টেক 🔥', quote: 'সাকিব আল হাসানই বাংলাদেশের *সর্বকালের সেরা* ক্রিকেটার', by: 'স্পোর্টস টাইমলাইন' },
      dataEn: { label: 'HOT TAKE 🔥', quote: 'Shakib is still the *greatest cricketer* Bangladesh has ever produced', by: 'Sports Timeline' },
      render(d, c) {
        const { L, CB, T, P, sec, ph } = c;
        if (L === 'photo') {
          const pb = 210 + CB * 0.4;
          return `<div class="frame-back" style="${box(44, 194, 992, CB * 0.4 + 32)}"></div>` + ph(0, 60, 210, 960, CB * 0.4, 'rounded')
            + sec('label', `<div class="pill big center" style="left:0;width:1080px;top:${pb - 40}px"><span>${P(d.label)}</span></div>`)
            + sec('quote', `<div class="news-head center" data-fit style="${box(80, pb + 70, 920, CB - pb - 170)}">${T(d.quote)}</div>`)
            + sec('by', `<div class="src center" style="left:0;width:1080px;top:${CB - 80}px">— ${P(d.by)}</div>`, has(d.by));
        }
        return (c.has(0) ? ph(0, 0, 0, 1080, CB, 'dim') : '') + `<div class="ghost-word" style="top:${CB * 0.06}px">🔥</div>`
          + sec('label', `<div class="pill big hot" style="left:70px;top:170px">${P(d.label)}</div>`)
          + sec('quote', `<div class="news-head big" data-fit style="${box(70, 290, 940, CB - 290 - 150)}">${T(d.quote)}</div>`)
          + sec('by', `<div class="sign" style="left:70px;top:${CB - 120}px">— ${P(d.by)}</div>`, has(d.by));
      },
    },
    {
      id: 'record', name: 'রেকর্ড / অর্জন ~ Record / achievement', icon: '🥇', group: 'general',
      layouts: { hero: 'বড় সংখ্যা + কাট-আউট ~ Big number + cut-out', photo: 'ফুল ছবি ~ Full photo' }, logo: { hero: ['tr'], photo: ['tr'] },
      fields: [f('kicker', 'লেবেল ~ Label'), f('big', 'বড় সংখ্যা ~ Big number'), f('unit', 'কীসের সংখ্যা ~ What the number is'), f('player', 'খেলোয়াড় ~ Player'), f('text', 'বিস্তারিত (*তারা* দিলে রঙিন) ~ Detail (*stars* = colour)', 'area', 3), P_INFO],
      photos: [{ label: 'খেলোয়াড়ের ছবি ~ Player photo', mode: 'cut', name: 'player', modes: { photo: 'scene' } }],
      data: { kicker: 'নতুন রেকর্ড', big: '6,000', unit: 'টেস্ট রান', player: 'মুশফিকুর রহিম', text: 'বাংলাদেশের *প্রথম ব্যাটার* হিসেবে টেস্টে ছয় হাজার রান', info: 'প্রথম টেস্ট | রাওয়ালপিন্ডি' },
      dataEn: { kicker: 'NEW RECORD', big: '6,000', unit: 'Test runs', player: 'Mushfiqur Rahim', text: 'The *first Bangladesh batter* to 6,000 Test runs', info: '1st Test | Rawalpindi' },
      render(d, c) {
        const { L, CB, T, P, sec, ph } = c;
        const col = cls => `<div class="xi-k big">${P(d.kicker)}</div><div class="bigsc ${cls}" data-fit="w" data-min=".3"><b>${P(d.big)}</b></div><div class="mword sm">${P(d.unit)}</div>
          <div class="xi-team multi" data-fit data-min=".3">${T(d.player)}</div><div class="news-body">${T(d.text)}</div>`;
        if (L === 'photo') {
          return ph(0, 0, 0, 1080, CB) + `<div class="shade-b" style="${box(0, CB * 0.25, 1080, CB * 0.75)}"></div>` + sec('info', top(infoBar(d.info, P)))
            + sec('text', `<div class="pcol on-photo" style="${box(60, CB * 0.42, 960, CB * 0.58 - 60)}">${col('')}</div>`);
        }
        return ph(0, 500, 200, 580, CB - 200, 'cut-glow') + sec('info', top(infoBar(d.info, P)))
          + sec('text', `<div class="pcol" style="${box(60, 190, 460, CB - 250)}">${col('')}</div>`);
      },
    },
    {
      id: 'frame', name: 'ফটো ফ্রেম ~ Photo frame', icon: '🖼️', group: 'general',
      layouts: { clean: 'ফুল ছবি + লেখা ~ Full photo + line', border: 'বর্ডার ফ্রেম ~ Border frame' }, logo: { clean: ['tr', 'tl', 'br'], border: ['tr', 'tl'] },
      fields: [f('head', 'শিরোনাম (ঐচ্ছিক, *তারা* দিলে রঙিন) ~ Headline (optional, *stars* = colour)', 'area', 2), f('credit', 'ছবির ক্রেডিট (ঐচ্ছিক) ~ Photo credit (optional)')],
      photos: [{ label: 'ছবি ~ Photo', mode: 'scene' }],
      data: { head: 'মিরপুরে *উৎসবের রাত*', credit: '' }, dataEn: { head: 'SCENES IN *MIRPUR*', credit: '' },
      render(d, c) {
        const { L, CB, T, P, sec, ph } = c, hh = has(d.head);
        if (L === 'border') {
          const ph0 = 170, phH = CB - ph0 - (hh ? 260 : 60);
          return `<div class="tilt-frame" style="${box(60, ph0, 960, phH)}"></div>` + ph(0, 60, ph0, 960, phH, 'framed')
            + sec('head', `<div class="news-head center" data-fit style="${box(70, ph0 + phH + 40, 940, 190)}">${T(d.head)}</div>`, hh)
            + sec('credit', `<div class="src" style="left:80px;top:${ph0 + phH - 50}px;color:#fff">📷 ${P(d.credit)}</div>`, has(d.credit));
        }
        return ph(0, 0, 0, 1080, CB) + (hh ? `<div class="shade-b soft" style="${box(0, CB * 0.55, 1080, CB * 0.45)}"></div>` : '')
          + sec('head', `<div class="news-head on-photo" data-fit style="${box(70, CB * 0.66, 940, CB * 0.34 - 80)}">${T(d.head)}</div>`, hh)
          + sec('credit', `<div class="src on-photo" style="left:70px;top:${CB - 60}px">📷 ${P(d.credit)}</div>`, has(d.credit));
      },
    },

    // ================================================================ comparison
    {
      id: 'compare', name: 'প্লেয়ার বনাম প্লেয়ার ~ Player vs player', icon: '⚔️', group: 'compare',
      layouts: { table: 'পরিসংখ্যান পাশাপাশি ~ Stats side by side', bars: 'বার ~ Bars' }, logo: { table: ['tr'], bars: ['tr'] },
      fields: [f('title', 'শিরোনাম ~ Title'), f('p1', 'খেলোয়াড় ১ ~ Player 1'), f('sub1', 'খেলোয়াড় ১ এর দল / তথ্য ~ Player 1 team / note'), f('p2', 'খেলোয়াড় ২ ~ Player 2'), f('sub2', 'খেলোয়াড় ২ এর দল / তথ্য ~ Player 2 team / note'),
        f('rows', 'সারি (পরিসংখ্যান | খেলোয়াড় ১ | খেলোয়াড় ২; কম ভালো হলে নামের শেষে ↓) ~ Rows (stat | player 1 | player 2; add ↓ when lower is better)', 'area', 7)],
      photos: [{ label: 'খেলোয়াড় ১ এর ছবি ~ Player 1 photo', mode: 'cut', name: 'p1' }, { label: 'খেলোয়াড় ২ এর ছবি ~ Player 2 photo', mode: 'cut', name: 'p2' }],
      data: { title: 'কে এগিয়ে?', p1: 'লিটন দাস', sub1: 'বাংলাদেশ', p2: 'মুশফিকুর রহিম', sub2: 'বাংলাদেশ', rows: 'ম্যাচ | 92 | 274\nরান | 2569 | 7795\nগড় | 30.2 | 36.4\nস্ট্রাইক রেট | 84.7 | 79.8\nসেঞ্চুরি | 5 | 9\nফিফটি | 12 | 49' },
      dataEn: { title: 'Who leads?', p1: 'Litton Das', sub1: 'Bangladesh', p2: 'Mushfiqur Rahim', sub2: 'Bangladesh', rows: 'Matches | 92 | 274\nRuns | 2569 | 7795\nAverage | 30.2 | 36.4\nStrike rate | 84.7 | 79.8\nHundreds | 5 | 9\nFifties | 12 | 49' },
      render(d, c) {
        const { L, CB, T, P, sec, ph, t } = c;
        const rows = ST.rows(d.rows).map(r => { const low = /↓/.test(r[0]), a = num(r[1]), b = num(r[2]); return { l: r[0].replace('↓', '').trim(), a: r[1] || '', b: r[2] || '', w: a === b ? 0 : (a > b) !== low ? 1 : 2, pa: a + b ? a / (a + b) : 0.5 }; });
        const phH = CB * 0.36, y1 = 170;
        const tops = ph(0, 0, y1, 540, phH, 'cut-glow') + ph(1, 540, y1, 540, phH, 'cut-glow')
          + sec('title', `<div class="cmp-title" style="${box(60, 70, 760, 90)}"><span>${P(d.title)}</span></div>`)
          + sec('names', `<div class="cmp-names" style="${box(40, y1 + phH - 40, 1000, 140)}"><div><b>${P(d.p1)}</b><small>${P(d.sub1)}</small></div><i>${t('বনাম', 'VS')}</i><div><b>${P(d.p2)}</b><small>${P(d.sub2)}</small></div></div>`);
        const ry = y1 + phH + 120, rh = CB - ry - 40;
        if (L === 'bars') {
          return tops + sec('rows', `<ul class="cmp-bars" data-fit style="${box(50, ry, 980, rh)}">${rows.map(r => `<li><div class="cb-h"><b class="${r.w === 1 ? 'win' : ''}">${P(r.a)}</b><span>${P(r.l)}</span><b class="${r.w === 2 ? 'win' : ''}">${P(r.b)}</b></div>
              <div class="cb-bar"><i style="width:${(r.pa * 100).toFixed(1)}%"></i></div></li>`).join('')}</ul>`);
        }
        return tops + sec('rows', `<ul class="cmp-rows" data-fit style="${box(50, ry, 980, rh)}">${rows.map(r => `<li><b class="${r.w === 1 ? 'win' : ''}">${P(r.a)}</b><span>${P(r.l)}</span><b class="${r.w === 2 ? 'win' : ''}">${P(r.b)}</b></li>`).join('')}</ul>`);
      },
    },
    {
      id: 'versus', name: 'কে সেরা? ~ Who\'s better?', icon: '🆚', group: 'compare',
      layouts: { split: 'দুই ভাগ (কাট-আউট) ~ Split (cut-outs)', photo: 'দুই ছবি ~ Two photos' }, logo: { split: ['tr', 'tl'], photo: ['tr', 'tl'] },
      fields: [f('question', 'প্রশ্ন ~ Question'), f('p1', 'খেলোয়াড় ১ ~ Player 1'), f('p2', 'খেলোয়াড় ২ ~ Player 2'), f('note', 'নিচের লাইন (ঐচ্ছিক) ~ Line under (optional)')],
      photos: [{ label: 'খেলোয়াড় ১ (বামে) ~ Player 1 (left)', mode: 'cut', name: 'p1', modes: { photo: 'scene' } }, { label: 'খেলোয়াড় ২ (ডানে) ~ Player 2 (right)', mode: 'cut', name: 'p2', modes: { photo: 'scene' } }],
      data: { question: 'কে সর্বকালের সেরা?', p1: 'মেসি', p2: 'রোনালদো', note: 'কমেন্টে জানান 👇' },
      dataEn: { question: "WHO'S THE GOAT?", p1: 'Messi', p2: 'Ronaldo', note: 'Tell us in the comments 👇' },
      render(d, c) {
        const { L, CB, P, sec, ph, t } = c;
        const halves = L === 'photo' ? ph(0, 0, 0, 560, CB, 'vs-l') + ph(1, 520, 0, 560, CB, 'vs-r') + `<div class="shade-b" style="${box(0, CB * 0.45, 1080, CB * 0.55)}"></div>`
          : `<div class="vs-bg l" style="${box(0, 0, 560, CB)}"></div><div class="vs-bg r" style="${box(520, 0, 560, CB)}"></div>` + ph(0, 0, 360, 560, CB - 360, '') + ph(1, 520, 360, 560, CB - 360, '');
        return halves
          + sec('question', `<div class="mega-word center on-photo" data-fit="w" data-min=".3" style="${box(60, L === 'photo' ? CB - 420 : 170, 960, 170)}">${P(d.question)}</div>`)
          + sec('vs', `<div class="vs-ball" style="left:440px;top:${L === 'photo' ? CB * 0.35 : CB * 0.55 - 100}px">${t('বনাম', 'VS')}</div>`)
          + sec('names', `<div class="vs-names" style="${box(40, CB - 230, 1000, 130)}"><b>${P(d.p1)}</b><b>${P(d.p2)}</b></div>`)
          + sec('note', `<div class="note on-photo" style="left:0;width:1080px;top:${CB - 80}px">${P(d.note)}</div>`, has(d.note));
      },
    },
    {
      id: 'mvp', name: 'সেরা খেলোয়াড় (MVP) ~ MVP / player of the month', icon: '👑', group: 'compare',
      layouts: { hero: 'মাঝে কাট-আউট ~ Cut-out in the middle', card: 'পাশে তালিকা ~ Stats beside' }, logo: { hero: ['tr'], card: ['tr'] },
      fields: [f('title', 'শিরোনাম ~ Title'), f('player', 'খেলোয়াড় ~ Player'), P_TEAM, f('rows', 'পরিসংখ্যান (সংখ্যা | কী) ~ Stats (value | label)', 'area', 5), P_INFO],
      photos: [{ label: 'খেলোয়াড়ের ছবি (অটো কাটা) ~ Player photo (auto cut-out)', mode: 'cut', name: 'player' }, { label: 'দলের লোগো ~ Team crest', mode: 'logo', team: 1 }],
      data: { title: 'মাসের সেরা', player: 'মেহেদী হাসান মিরাজ', team: 'বাংলাদেশ', rows: '312 | রান\n14 | উইকেট\n2 | ম্যাচসেরা', info: 'অক্টোবর ২০২৬' },
      dataEn: { title: 'PLAYER OF THE MONTH', player: 'Mehidy Hasan Miraz', team: 'Bangladesh', rows: '312 | Runs\n14 | Wickets\n2 | POTM awards', info: 'October 2026' },
      render(d, c) {
        const { L, CB, T, P, sec, ph } = c, rows = ST.rows(d.rows);
        const chips = chipsOf(rows.map(r => [r[0], P(r[1] || '')]), P);
        if (L === 'card') {
          return ph(0, 480, 170, 600, CB - 170, 'cut-glow') + sec('info', top(infoBar(d.info, P)))
            + sec('title', `<div class="pcol" style="${box(60, 170, 560, 330)}"><div class="mword multi" data-fit data-min=".3"><span>${P(d.title)}</span></div></div>`)
            + sec('player', `<div class="sq-title" style="${box(60, 520, 560, 150)}">${ph(1, 0, 0, 110, 110, 'crest inl')}<div><div class="xi-team" data-fit="w" data-min=".3">${P(d.player)}</div><div class="vsl">${P(d.team)}</div></div></div>`)
            + sec('rows', `<ul class="srows" data-fit style="${box(60, 700, 480, CB - 750)}">${rows.map(r => `<li><b>${P(r[0])}</b><span>${P(r[1] || '')}</span></li>`).join('')}</ul>`);
        }
        return sec('ghost', `<div class="ghost-word center" style="left:0;width:1080px;top:${CB * 0.12}px;font-size:200px" data-fit="w" data-min=".3">${P(d.title)}</div>`)
          + ph(0, 190, 260, 700, CB - 260 - 120, 'cut-glow') + sec('info', top(infoBar(d.info, P)))
          + sec('title', `<div class="kick center" style="left:0;width:1080px;top:170px;justify-content:center"><span>👑 ${P(d.title)}</span></div>`)
          + sec('player', `<div class="mvp-name" style="${box(60, CB - 430, 960, 170)}">${ph(1, 0, 0, 120, 120, 'crest inl')}<div><b data-fit="w">${P(d.player)}</b><small>${P(d.team)}</small></div></div>`)
          + sec('stats', `<div class="chips" style="${box(50, CB - 240, 980, 180)}">${chips}</div>`, !!chips);
      },
    },
  ];

  ST.CARDS.push(...more);

  // which shelf each card sits on in the picker
  ST.GROUPS = { cricket: 'ক্রিকেট ~ Cricket', test: 'টেস্ট ~ Test', football: 'ফুটবল ~ Football', general: 'খবর ও সাধারণ ~ News & general', compare: 'তুলনা ~ Compare', team: 'দল ও টেবিল ~ Teams & tables' };
  const G = { news: 'general', breaking: 'general', quote: 'general', trivia: 'general', score: 'football', pitch: 'football', cricket: 'cricket',
    xi: 'team', squad: 'team', stats: 'team', toplist: 'team', table: 'team' };
  ST.CARDS.forEach(c => { c.group ||= G[c.id] || 'general'; });
})();
