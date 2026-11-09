/* The cards. Each card has its fields (the form is built from them), photo slots, layouts and a render() that returns
   the poster's HTML for one layout. Everything the admin may move is wrapped in sec('key', ...) (a data-move section);
   photos come from ph(i, x, y, w, h) and are placed by ST.place, so they land in a good spot on their own.

   ctx given to render: { L (layout id), H (poster height), CB (content bottom, above the footer strip), T (rich text),
   P (plain text), sec, ph, box, has(i) (photo i uploaded) }

   Field: [key, label, type ('text' | 'area' | 'select:a=A,b=B' | 'color'), rows?]
   Photo slot: { label, mode: 'scene' | 'cut' | 'logo', name?: field whose text finds the photo in the library } */
(function () {
  const ST = window.ST;
  const box = (x, y, w, h) => `left:${Math.round(x)}px;top:${Math.round(y)}px;width:${Math.round(w)}px;height:${Math.round(h)}px`;
  // a score written with the shoot-out in brackets, 1(4), shows the bracket part smaller
  const pen = s => s.replace(/\(([^()]*)\)/, '<small>($1)</small>');
  const tags = (p, P) => p.tags.map(t => `<span class="tg">${P(ST.tagText[t])}</span>`).join('');

  // one list of players, numbered or with a small dot
  const playerList = (lines, P, numbered) => lines.map((l, i) => {
    const p = ST.player(l);
    return `<li>${numbered ? `<b class="n">${P(p.num || i + 1)}</b>` : '<i class="dot"></i>'}<span>${P(p.name)}</span>${tags(p, P)}</li>`;
  }).join('');

  // "গোলকিপার: a, b, c" lines -> [{ name, players[] }]
  const groups = s => ST.lines(s).map(l => {
    const m = l.match(/^([^:：]+)[:：](.*)$/);
    return m ? { name: m[1].trim(), list: m[2].split(/[,،|]/).map(x => x.trim()).filter(Boolean) } : { name: '', list: l.split(/[,،|]/).map(x => x.trim()).filter(Boolean) };
  });

  // small block: label pill + timeline dots, the house style header
  // quote marks drawn as a shape, so every font shows the same marks
  const QM = '<svg viewBox="0 0 120 90" width="1em" height=".75em"><path fill="currentColor" d="M0 90V52Q0 18 30 0l10 12Q22 26 22 44h22v46zm64 0V52q0-34 30-52l10 12q-18 14-18 32h22v46z"/></svg>';
  // the XI on the pitch: eleven spots of the formation, each with the player typed on that line
  const SHIRT = 'M30 8L42 3Q50 12 58 3L70 8L95 24L85 44L74 38V96H26V38L15 44L5 24Z';
  const xiOf = d => {
    const sl = ST.formationSlots(d.formation), lines = ST.lines(d.players);
    return sl.map((s, i) => {
      const p = lines[i] ? ST.player(lines[i]) : { num: '', name: '', tags: [] }, o = ST.posOverride(p.name);
      if (o) p.name = o.name;
      return { ...p, pos: o ? o.pos : s.pos, x: s.x, y: s.y };
    });
  };
  const kicker = (t, P) => t ? `<div class="kick"><span>${P(t)}</span><i></i><i></i><i class="live"></i></div>` : '';

  ST.CARDS = [
    // ---------------------------------------------------------------- news
    {
      id: 'news', name: 'ইনস্ট্যান্ট নিউজ', icon: '📰',
      layouts: { frame: 'ফ্রেম (ছবি উপরে, খবর নিচে)', split: 'পাশাপাশি (ছবি + সবুজ বক্স)', full: 'ফুল ছবি (লেখা ছবির উপর)' },
      logo: { frame: ['tl', 'tr'], split: ['tl', 'tr'], full: ['tr', 'tl'] },
      fields: [['tag', 'ছোট লেবেল (খালি রাখলে থাকবে না)', 'text'], ['head', 'শিরোনাম (*তারা* দিলে রঙিন)', 'area', 3], ['body', 'বিস্তারিত (ঐচ্ছিক)', 'area', 4], ['src', 'সূত্র / ক্রেডিট (ঐচ্ছিক)', 'text']],
      photos: [{ label: 'খবরের ছবি', mode: 'scene' }],
      data: { tag: 'ইনস্ট্যান্ট নিউজ', head: 'মাথায় আঘাত পেয়ে *হাসপাতালে* জেরেমি সলোজানো', body: 'শর্ট-লেগে ফিল্ডিং করার সময় মাথায় আঘাত পেয়েছেন ওয়েস্ট ইন্ডিজের জেরেমি সলোজানো। শ্রীলঙ্কার বিপক্ষে টেস্টে অভিষেক হওয়া এই ক্রিকেটারকে স্ট্রেচারে করে মাঠ থেকে নেওয়া হয়।', src: '' },
      render(d, c) {
        const { L, CB, T, P, sec, ph } = c, hasBody = !!d.body.trim();
        if (L === 'full') {
          return ph(0, 0, 0, 1080, CB) + `<div class="shade-b" style="${box(0, CB * 0.35, 1080, CB * 0.65)}"></div>`
            + sec('tag', `<div class="pill" style="left:70px;top:${CB * 0.5 - 20}px">${P(d.tag)}</div>`, !!d.tag)
            + sec('head', `<div class="news-head on-photo" data-fit style="${box(70, CB * 0.5 + 50, 940, hasBody ? CB * 0.27 : CB * 0.42)}">${T(d.head)}</div>`)
            + sec('body', `<div class="news-body on-photo" data-fit style="${box(70, CB * 0.77 + 60, 940, CB * 0.23 - 100)}">${T(d.body)}</div>`, hasBody)
            + sec('src', `<div class="src on-photo" style="left:70px;top:${CB - 50}px">${P(d.src)}</div>`, !!d.src);
        }
        if (L === 'split') {
          const ph0 = 210, phH = (CB - ph0) * (hasBody ? 0.56 : 0.7), pb = ph0 + phH;
          return sec('tag', kicker(d.tag, P).replace('class="kick"', `class="kick" style="left:60px;top:70px"`), !!d.tag)
            + `<div class="frame-back" style="${box(44, ph0 - 16, 592, phH + 32)}"></div>` + ph(0, 60, ph0, 560, phH, 'rounded')
            + sec('head', `<div class="green-box" style="${box(600, ph0 + 50, 420, phH - 100)}"><div class="news-head" data-fit style="width:100%;height:100%">${T(d.head)}</div></div>`)
            + sec('body', `<div class="news-body" data-fit style="${box(80, pb + 45, 920, CB - pb - 120)}">${T(d.body)}</div>`, hasBody)
            + sec('src', `<div class="src" style="left:80px;top:${CB - 60}px">${P(d.src)}</div>`, !!d.src);
        }
        const ph0 = 210, phH = (CB - ph0) * (hasBody ? 0.5 : 0.58), pb = ph0 + phH, rest = CB - pb - 90;
        return sec('tag', kicker(d.tag, P).replace('class="kick"', `class="kick" style="left:70px;top:72px"`), !!d.tag)
          + `<div class="tilt-frame" style="${box(70, ph0, 940, phH)}"></div>` + ph(0, 70, ph0, 940, phH, 'framed')
          + sec('head', `<div class="news-head center" data-fit style="${box(80, pb + 50, 920, hasBody ? rest * 0.45 : rest)}">${T(d.head)}</div>`)
          + sec('body', `<div class="news-body center" data-fit style="${box(90, pb + 70 + rest * 0.45, 900, rest * 0.55)}">${T(d.body)}</div>`, hasBody)
          + sec('src', `<div class="src center" style="left:0;width:1080px;top:${CB - 46}px">${P(d.src)}</div>`, !!d.src);
      },
    },

    // ---------------------------------------------------------------- breaking
    {
      id: 'breaking', name: 'ব্রেকিং নিউজ', icon: '⚡',
      layouts: { flash: 'ফ্ল্যাশ (লাল ব্যান্ড)', bold: 'বোল্ড (বড় লেখা পেছনে)' },
      logo: { flash: ['tr', 'tl'], bold: ['tr', 'tl'] },
      fields: [['flash', 'ব্যান্ডের লেখা', 'text'], ['head', 'শিরোনাম (*তারা* দিলে রঙিন)', 'area', 3], ['body', 'এক লাইনে বিস্তারিত (ঐচ্ছিক)', 'area', 2]],
      photos: [{ label: 'ছবি', mode: 'scene' }],
      data: { flash: 'ব্রেকিং নিউজ', head: 'লিভারপুল বরখাস্ত করেছে কোচ *আর্নে স্লটকে*', body: '' },
      render(d, c) {
        const { L, CB, T, P, sec, ph } = c, hasBody = !!d.body.trim();
        if (L === 'bold') {
          return `<div class="ghost-word" style="top:${CB * 0.04}px">${P(d.flash.split(' ')[0])}</div>`
            + ph(0, 60, CB * 0.2, 960, CB * 0.45, 'slant')
            + sec('flash', `<div class="flash-band small" style="left:60px;top:${CB * 0.2 - 46}px"><i class="blink"></i>${P(d.flash)}</div>`)
            + sec('head', `<div class="news-head big" data-fit style="${box(70, CB * 0.68, 940, hasBody ? CB * 0.2 : CB * 0.28)}">${T(d.head)}</div>`)
            + sec('body', `<div class="news-body" data-fit style="${box(70, CB * 0.89, 940, CB * 0.09)}">${T(d.body)}</div>`, hasBody);
        }
        const pb = CB * 0.6;
        return ph(0, 0, 0, 1080, pb) + `<div class="shade-b soft" style="${box(0, pb * 0.6, 1080, pb * 0.4)}"></div>`
          + sec('flash', `<div class="flash-band" style="left:0;top:${pb - 62}px;width:1080px"><i class="blink"></i>${P(d.flash)}<span class="bolt">⚡</span></div>`)
          + sec('head', `<div class="news-head big center" data-fit style="${box(70, pb + 90, 940, (CB - pb - 140) * (hasBody ? 0.68 : 1))}">${T(d.head)}</div>`)
          + sec('body', `<div class="news-body center" data-fit style="${box(90, pb + 100 + (CB - pb - 140) * 0.68, 900, (CB - pb - 140) * 0.32)}">${T(d.body)}</div>`, hasBody);
      },
    },

    // ---------------------------------------------------------------- quote
    {
      id: 'quote', name: 'উক্তি (কোট)', icon: '❝',
      layouts: { top: 'ছবি উপরে', side: 'কাট-আউট পাশে', full: 'ফুল ছবি' },
      logo: { top: ['tl', 'tr'], side: ['tl', 'tr'], full: ['tr', 'tl'] },
      fields: [['quote', 'উক্তি (*তারা* দিলে রঙিন)', 'area', 5], ['name', 'কে বলেছেন', 'text'], ['role', 'পরিচয় / কোথায় বলেছেন', 'text']],
      photos: [{ label: 'যিনি বলেছেন তাঁর ছবি', mode: 'scene', name: 'name', side: 'cut' }],
      data: { quote: 'এটা স্বাভাবিক, আর এখানেই তার শ্রদ্ধাবোধ। *সে বিশ্বসেরা খেলোয়াড়দের একজন।*', name: 'কিলিয়ান এমবাপে', role: 'লাইপজিগের বিপক্ষে দ্বিতীয় পেনাল্টি নিয়ে' },
      render(d, c) {
        const { L, CB, T, P, sec, ph } = c;
        const who = `<div class="q-name">${P(d.name)}</div><div class="q-role">${P(d.role)}</div>`;
        if (L === 'side') {
          return ph(0, 470, 150, 610, CB - 150, 'cut-glow', 'cut')
            + sec('quote', `<div class="q-panel" style="${box(60, 190, 560, CB - 300)}"><div class="qmark">${QM}</div><div class="q-text" data-fit>${T(d.quote)}</div><div class="q-room"></div></div>`)
            + sec('who', `<div class="q-who q-on-pan" style="${box(106, CB - 260, 470, 140)}">${who}</div>`);
        }
        if (L === 'full') {
          return ph(0, 0, 0, 1080, CB) + `<div class="shade-l" style="${box(0, 0, 1080, CB)}"></div>`
            + sec('quote', `<div class="q-free on-photo" style="${box(70, CB * 0.3, 620, CB * 0.62 - 160)}"><div class="qmark">${QM}</div><div class="q-text" data-fit>${T(d.quote)}</div></div>`)
            + sec('who', `<div class="q-who q-free on-photo" style="${box(70, CB * 0.92 - 140, 620, 140)}">${who}</div>`);
        }
        const phH = CB * 0.42, pb = 210 + phH;
        return `<div class="frame-back" style="${box(44, 194, 992, phH + 32)}"></div>` + ph(0, 60, 210, 960, phH, 'rounded')
          + sec('mark', `<div class="qmark big" style="left:0;width:1080px;top:${pb - 46}px">${QM}</div>`)
          + sec('quote', `<div class="q-text center" data-fit style="${box(90, pb + 70, 900, CB - pb - 230)}">${T(d.quote)}</div>`)
          + sec('who', `<div class="q-who center" style="${box(90, CB - 150, 900, 110)}">${who}</div>`);
      },
    },

    // ---------------------------------------------------------------- football score
    {
      id: 'score', name: 'ফুটবল স্কোর', icon: '⚽',
      layouts: { bar: 'স্কোরবার (ছবির নিচে)', boxes: 'বড় সংখ্যা (বক্স)', split: 'ফুল-টাইম (তির্যক)' },
      logo: { bar: ['tr', 'tl'], boxes: ['tr', 'tl'], split: ['tr', 'tl'] },
      fields: [['comp', 'টুর্নামেন্টের নাম', 'text'], ['stage', 'পর্ব: গ্রুপ পর্ব / কোয়ার্টার ফাইনাল… (ঐচ্ছিক)', 'text'], ['status', 'অবস্থা', 'text'],
        ['t1', 'দল ১', 'text'], ['s1', 'গোল (দল ১)', 'text'], ['t2', 'দল ২', 'text'], ['s2', 'গোল (দল ২)', 'text'],
        ['g1', 'গোলদাতা (দল ১, কমা দিয়ে)', 'area', 2], ['g2', 'গোলদাতা (দল ২)', 'area', 2], ['note', 'নিচের লাইন (অ্যাগ্রিগেট / টাইব্রেকার)', 'text']],
      photos: [{ label: 'ম্যাচের ছবি', mode: 'scene' }, { label: 'দল ১ এর লোগো', mode: 'logo', team: 1 }, { label: 'দল ২ এর লোগো', mode: 'logo', team: 2 }],
      data: { comp: 'লা লিগা', stage: '', status: 'ফুল-টাইম', t1: 'রিয়াল মাদ্রিদ', s1: '2', t2: 'বার্সেলোনা', s2: '3', g1: "এমবাপে ২৩', ভিনিসিয়ুস ৬৭'", g2: "ইয়ামাল ১২', লেভানদোভস্কি ৪৫', রাফিনিয়া ৮৮'", note: '' },
      render(d, c) {
        const { L, CB, P, sec, ph } = c;
        const crest = (i, x, y, s) => ph(i, x, y, s, s, 'crest');
        const scorers = (y, h) => sec('goals', `<div class="goals" data-fit data-min=".6" style="${box(70, y, 940, h)}"><div>${P(d.g1).replace(/,\s*/g, '<br>')}</div><i>⚽</i><div>${P(d.g2).replace(/,\s*/g, '<br>')}</div></div>`, !!(d.g1 || d.g2));
        if (L === 'boxes') {
          const y = CB * 0.36;
          return (c.has(0) ? ph(0, 0, 0, 1080, CB, 'dim') : '')
            + sec('comp', `<div class="comp-pill" style="left:0;width:1080px;top:${y - 210}px"><span>${P(d.comp)}</span>${d.stage ? `<small>${P(d.stage)}</small>` : ''}</div>`)
            + sec('status', `<div class="status-txt" style="left:0;width:1080px;top:${y - 120}px">${P(d.status)}</div>`)
            + sec('board', `<div class="boxes" style="top:${y}px">
                <div class="bx">${crest(1, 0, 0, 150).replace('ph ', 'ph inl ')}<div class="num">${P(d.s1)}</div><div class="tn" data-fit>${P(d.t1)}</div></div>
                <div class="bx">${crest(2, 0, 0, 150).replace('ph ', 'ph inl ')}<div class="num">${P(d.s2)}</div><div class="tn" data-fit>${P(d.t2)}</div></div></div>`)
            + scorers(CB - 220, 150) + sec('note', `<div class="note" style="left:0;width:1080px;top:${CB - 60}px">${P(d.note)}</div>`, !!d.note);
        }
        if (L === 'split') {
          const pb = Math.min(CB * 0.58, CB - 540);
          return ph(0, 0, 0, 1080, pb + 80, 'diag')
            + sec('status', `<div class="mega-status" data-fit="w" data-min=".45" style="left:60px;width:960px;white-space:nowrap;top:${pb - 70}px">${P(d.status)}</div>`)
            + sec('board', `<div class="row-score" style="top:${pb + 110}px">${crest(1, 0, 0, 170).replace('ph ', 'ph inl ')}<b>${P(d.s1)}</b><i></i><b>${P(d.s2)}</b>${crest(2, 0, 0, 170).replace('ph ', 'ph inl ')}</div>`)
            + sec('names', `<div class="row-names" style="top:${pb + 300}px"><span>${P(d.t1)}</span><small>${P(d.comp)}${d.stage ? ' · ' + P(d.stage) : ''}</small><span>${P(d.t2)}</span></div>`)
            + scorers(pb + 360, CB - pb - 420) + sec('note', `<div class="note" style="left:0;width:1080px;top:${CB - 56}px">${P(d.note)}</div>`, !!d.note);
        }
        const by = CB - 330;
        return ph(0, 0, 0, 1080, CB) + `<div class="shade-b" style="${box(0, CB * 0.4, 1080, CB * 0.6)}"></div>`
          + sec('comp', `<div class="comp-pill" style="left:0;width:1080px;top:${by - 90}px"><span>${P(d.comp)}</span>${d.stage ? `<small>${P(d.stage)}</small>` : ''}</div>`)
          + sec('board', `<div class="scorebar" style="top:${by}px">${crest(1, 0, 0, 120).replace('ph ', 'ph inl ')}<div class="tn l" data-fit data-min=".5"><span>${P(d.t1)}</span></div>
              <div class="sc" data-fit="w" data-min=".4"><b>${pen(P(d.s1))}</b><span>${P(d.status)}</span><b>${pen(P(d.s2))}</b></div><div class="tn r" data-fit data-min=".5"><span>${P(d.t2)}</span></div>${crest(2, 0, 0, 120).replace('ph ', 'ph inl ')}</div>`)
          + scorers(by + 170, 150) + sec('note', `<div class="note on-photo" style="left:0;width:1080px;top:${CB - 50}px">${P(d.note)}</div>`, !!d.note);
      },
    },

    // ---------------------------------------------------------------- cricket score
    {
      id: 'cricket', name: 'ক্রিকেট স্কোর', icon: '🏏',
      layouts: { bar: 'স্কোরবার (ছবির নিচে)', card: 'পুরো স্কোরকার্ড' },
      logo: { bar: ['tr', 'tl'], card: ['tr', 'tl'] },
      fields: [['event', 'ম্যাচ / সিরিজ', 'text'], ['t1', 'দল ১', 'text'], ['r1', 'রান-উইকেট (দল ১)', 'text'], ['o1', 'ওভার (দল ১)', 'text'],
        ['t2', 'দল ২', 'text'], ['r2', 'রান-উইকেট (দল ২)', 'text'], ['o2', 'ওভার (দল ২)', 'text'],
        ['win', 'কে জিতেছে', 'select:0=এখনো খেলা চলছে,1=দল ১,2=দল ২'], ['result', 'ফলাফল লাইন', 'text'],
        ['p1', 'দল ১ সেরা পারফরমার (নাম | স্কোর, প্রতি লাইনে একজন)', 'area', 3], ['p2', 'দল ২ সেরা পারফরমার', 'area', 3]],
      photos: [{ label: 'ম্যাচের ছবি', mode: 'scene' }, { label: 'দল ১ এর লোগো', mode: 'logo', team: 1 }, { label: 'দল ২ এর লোগো', mode: 'logo', team: 2 }],
      data: { event: 'প্রথম ওয়ানডে · কলম্বো', t1: 'ইংল্যান্ড', r1: '429-4', o1: '50 ওভার', t2: 'শ্রীলঙ্কা', r2: '430-8', o2: '49.5 ওভার', win: '2', result: 'শ্রীলঙ্কা ২ উইকেটে জয়ী',
        p1: 'জো রুট | 151 (128)\nহ্যারি ব্রুক | 98 (71)\nআদিল রশিদ | 2/64', p2: 'পাথুম নিসাঙ্কা | 132 (110)\nকুশল মেন্ডিস | 102* (88)\nহাসারাঙ্গা | 2/71' },
      render(d, c) {
        const { L, CB, P, sec, ph } = c;
        const side = (i) => `<div class="ck-team ${d.win == i ? 'won' : ''}"><small>${P(d['t' + i])}</small><b data-fit="w" data-min=".4">${P(d['r' + i])}</b><span>${P(d['o' + i])}</span></div>`;
        if (L === 'card') {
          const top = c.has(0) ? CB * 0.3 : 0, perf = s => ST.rows(s).map(r => `<li><span>${P(r[0])}</span><b>${P(r[1] || '')}</b></li>`).join('');
          const blk = (i, y, h) => `<div class="ck-block ${d.win == i ? 'won' : ''}" style="${box(60, y, 960, h)}">${ph(i, 30, 26, 110, 110, 'crest')}
              <div class="ck-head"><span>${P(d['t' + i])}</span><b>${P(d['r' + i])}</b><small>${P(d['o' + i])}</small></div><ul class="perf" data-fit>${perf(d['p' + i])}</ul></div>`;
          const h = (CB - top - 330) / 2;
          return (top ? ph(0, 0, 0, 1080, top + 60, 'fade-b') : '')
            + sec('event', `<div class="comp-pill" style="left:0;width:1080px;top:${top ? top - 40 : 150}px"><span>${P(d.event)}</span></div>`)
            + sec('b1', blk(1, (top || 170) + 60, h)) + sec('b2', blk(2, (top || 170) + 80 + h, h))
            + sec('result', `<div class="result-strip" style="${box(60, CB - 130, 960, 80)}">${P(d.result)}</div>`, !!d.result);
        }
        const by = CB - 300;
        return ph(0, 0, 0, 1080, CB) + `<div class="shade-b" style="${box(0, CB * 0.45, 1080, CB * 0.55)}"></div>`
          + sec('event', `<div class="comp-pill" style="left:0;width:1080px;top:${by - 80}px"><span>${P(d.event)}</span></div>`)
          + sec('board', `<div class="ck-bar" style="${box(40, by, 1000, 170)}">${ph(1, 20, 25, 120, 120, 'crest')}${side(1)}<i class="sep"></i>${side(2)}${ph(2, 860, 25, 120, 120, 'crest')}</div>`)
          + sec('result', `<div class="result-strip" style="${box(140, by + 190, 800, 70)}">${P(d.result)}</div>`, !!d.result);
      },
    },

    // ---------------------------------------------------------------- playing XI (list)
    {
      id: 'xi', name: 'একাদশ (তালিকা)', icon: '📋',
      layouts: { list: 'তালিকা + ছবি', panel: 'সাদা প্যানেল', bold: 'বোল্ড (নম্বর সহ)' },
      logo: { list: ['tr'], panel: ['tr', 'br'], bold: ['tl'] },
      fields: [['kicker', 'উপরের ছোট লেখা', 'text'], ['team', 'দলের নাম', 'text'], ['sub', 'ম্যাচের তথ্য', 'text'],
        ['players', 'খেলোয়াড় (প্রতি লাইনে একজন; (অধি.) (উই.) লিখলে ব্যাজ)', 'area', 11]],
      photos: [{ label: 'খেলোয়াড়ের ছবি (ব্যাকগ্রাউন্ড অটো কাটা হবে)', mode: 'cut' }, { label: 'দলের লোগো', mode: 'logo', team: 1 }],
      data: { kicker: 'সম্ভাব্য একাদশ', team: 'বাংলাদেশ', sub: 'প্রথম টেস্ট · ঢাকা · বনাম ওয়েস্ট ইন্ডিজ',
        players: 'তানজিদ হাসান তামিম\nসাদমান ইসলাম\nমুমিনুল হক\nমুশফিকুর রহিম\nনাজমুল হোসেন শান্ত (অধি.)\nজাকের আলী অনিক (উই.)\nমেহেদী হাসান মিরাজ\nনাঈম হাসান\nহাসান মাহমুদ\nতাইজুল ইসলাম\nতাসকিন আহমেদ' },
      render(d, c) {
        const { L, CB, P, sec, ph } = c, pl = ST.lines(d.players);
        if (L === 'panel') {
          return `<div class="blob" style="${box(560, CB * 0.3, 720, 720)}"></div>` + ph(0, 560, 240, 520, CB - 240, 'cut-glow')
            + sec('panel', `<div class="xi-panel" style="${box(60, 110, 500, CB - 170)}"><div class="xi-logos">${ph(1, 0, 0, 90, 90, 'crest inl')}</div>
                <div class="xi-k">${P(d.kicker)}</div><div class="xi-team" data-fit="w" data-min=".5">${P(d.team)}</div><div class="xi-sub">${P(d.sub)}</div>
                <ul class="plist" data-fit>${playerList(pl, P)}</ul></div>`);
        }
        if (L === 'bold') {
          return ph(0, -10, 200, 560, CB - 200, 'cut-glow')
            + sec('title', `<div class="xi-bold-title" style="${box(400, 110, 620, 250)}"><div class="xi-team" data-fit="w" data-min=".4">${P(d.team)}</div><div class="xi-k">${P(d.kicker)}</div><div class="xi-sub">${P(d.sub)}</div></div>`)
            + sec('list', `<ul class="plist num right" data-fit style="${box(560, 390, 460, CB - 440)}">${playerList(pl, P, true)}</ul>`);
        }
        return `<div class="wm-logo" style="${box(-60, 60, 520, 520)}">${ph(1, 0, 0, 520, 520, 'crest wm')}</div>` + ph(0, 450, 210, 630, CB - 210, 'cut-glow')
          + sec('title', `<div class="xi-title" style="${box(70, 140, 560, 230)}"><div class="xi-k">${P(d.kicker)}</div><div class="xi-team" data-fit="w" data-min=".5">${P(d.team)}</div><div class="xi-sub">${P(d.sub)}</div></div>`)
          + sec('list', `<ul class="plist" data-fit style="${box(70, 390, 560, CB - 440)}">${playerList(pl, P)}</ul>`);
      },
    },

    // ---------------------------------------------------------------- football XI on the pitch
    {
      id: 'pitch', name: 'ফুটবল একাদশ (মাঠে)', icon: '🥅',
      layouts: { arena: '৩ডি মাঠ, আলো ঝলমলে ~ 3D pitch under the lights', cards: 'ছবি কার্ড (চারকোনা) ~ Photo cards (square)', kits: 'জার্সি বোর্ড ~ Shirt board', list: 'লাইনআপ তালিকা + বড় ছবি ~ Line-up list + big photo' },
      logo: { arena: ['tr'], cards: ['tr'], kits: ['tr'], list: ['tr'] },
      fields: [['title', 'উপরের লেখা ~ Top line', 'text'], ['team', 'দলের নাম ~ Team', 'text'], ['match', 'ম্যাচ / টুর্নামেন্ট ~ Match / tournament', 'text'],
        ['formation', 'ফরমেশন ~ Formation', 'select:' + ST.formationOptions()],
        ['focus', 'পোস্টারে কী কী থাকবে ~ What the poster shows', 'select:big=শুধু একাদশ, বড় করে ~ Just the XI (big),full=সব তথ্য (ম্যাচ, বদলি, কোচ) ~ All details (match / subs / coach)'],
        ['mark', 'গোল চিহ্নে কী থাকবে (৩ডি মাঠ) ~ What the badge shows (3D pitch)', 'select:pos=পজিশন (LW/CB) ~ Position (LW/CB),num=জার্সি নম্বর ~ Shirt number'],
        ['players', 'খেলোয়াড় (গোলরক্ষক আগে, তারপর পেছন থেকে সামনে, প্রতি লাইন বাম→ডান; নম্বর আগে দিতে পারো; "LW: নাম" লিখলে পজিশন বদলাবে; (c) অধিনায়ক) ~ Players (keeper first, then back to front, each line left→right; a number first is fine; "LW: name" sets the position; (c) captain)', 'area', 11],
        ['subs', 'বদলি (কমা দিয়ে) ~ Subs (commas)', 'area', 2], ['coach', 'কোচ (ঐচ্ছিক) ~ Coach (optional)', 'text']],
      photos: [{ label: 'দলের লোগো ~ Team crest', mode: 'logo', team: 1 }].concat(Array.from({ length: 11 }, (_, k) => ({
        label: `খেলোয়াড় ${k + 1} এর ছবি ~ Player ${k + 1} photo`, mode: 'scene', only: ['cards'],
        labelOf: d => { const p = xiOf(d)[k]; return p && p.name ? `${p.pos} · ${p.name}` : ''; } })),
        { label: 'বড় ছবির খেলোয়াড় (অটো কাটা) ~ Big player photo (auto cut-out)', mode: 'cut', only: ['list'] }),
      data: { title: 'শুরুর একাদশ', team: 'বাংলাদেশ', match: 'বনাম ভারত · এশিয়ান কাপ বাছাই', formation: '4-3-3', mark: 'pos', focus: 'big',
        players: '1 মিতুল মারমা (GK)\n2 শাকিল আহাদ\n5 তারিক কাজী\n4 তপু বর্মন\n3 সাদ উদ্দিন\n8 হামজা চৌধুরী\n6 জামাল ভূঁইয়া (c)\n10 সোহেল রানা\n7 রাকিব হোসেন\n9 মোরসালিন\n11 শমিত সোম',
        subs: 'সুজন, ফাহামেদুল, ঋদয়, রহমত, মোহাম্মদ হৃদয়, পাপ্পু', coach: 'হাভিয়ের কাবরেরা' },
      dataEn: { title: 'Starting XI', team: 'Bangladesh', match: 'vs India · Asian Cup qualifier', formation: '4-3-3', mark: 'pos', focus: 'big',
        players: '1 Mitul Marma (GK)\n2 Shakil Ahad\n5 Tariq Kazi\n4 Topu Barman\n3 Saad Uddin\n8 Hamza Choudhury\n6 Jamal Bhuyan (c)\n10 Sohel Rana\n7 Rakib Hossain\n9 Morsalin\n11 Shamit Shome',
        subs: 'Sujon, Fahamedul, Ridoy, Rahmat, Mohammad Hridoy, Pappu', coach: 'Javier Cabrera' },
      render(d, c) {
        const { L, CB, H, P, sec, ph, t } = c;
        const sq = H < 1200, story = H > 1500, xi = xiOf(d), byNum = (d.mark || 'pos') === 'num';
        // "just the XI": no match line, subs, coach or number chips, a slim title, and the pitch takes the rest
        const big = d.focus !== 'full';
        const sh = !big && (d.subs || d.coach) ? (sq ? 96 : story ? 150 : 116) : 0;
        const y0 = story ? 120 : sq ? 40 : 56, hh = big ? (story ? 200 : sq ? 108 : 136) : story ? 300 : sq ? 170 : 220;
        const fy = y0 + hh + (sq ? 6 : story ? 50 : 24), fb = CB - sh - (sh ? 24 : 0) - (sq ? 16 : 30);
        const cap = p => p.tags.includes('c') ? '<i class="xp-c">C</i>' : '';
        const mark = p => P(byNum ? (p.num || p.pos) : p.pos);
        const fm = d.formation ? `<b class="xp-fm">${P((ST.FORMATIONS[d.formation] || {}).rows ? d.formation.replace(/D$/, ' ◆') : d.formation)}</b>` : '';
        const subs = cls => sec('subs', `<div class="xp-subs ${cls}" style="${box(60, CB - sh - 18, 960, sh)}">
            ${d.subs ? `<div class="xs-l"><b>${t('বদলি', 'Subs')}</b><span data-fit data-min=".5"><span>${P(d.subs)}</span></span></div>` : ''}
            ${d.coach ? `<div class="xs-r"><b>${t('কোচ', 'Coach')}</b><span data-fit="w" data-min=".5">${P(d.coach)}</span></div>` : ''}</div>`, !!sh);
        // biggest size s (from hi down) at which no two players (badge + name) overlap; rect(p, s) -> [l, t, r, b]
        const fit = (hi, lo, rect) => {
          for (let s = hi; s > lo; s -= 3) {
            const R = xi.map(p => rect(p, s)); let ok = true;
            for (let i = 0; ok && i < R.length; i++) for (let j = i + 1; j < R.length; j++) { const a = R[i], b = R[j]; if (a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3]) { ok = false; break; } }
            if (ok) return s;
          }
          return lo;
        };
        // tiles and shirts are tall: the keeper gets a full line's gap below the back line instead of the pitch's real one
        const R = ((ST.FORMATIONS[d.formation] || {}).rows || [0, 0, 0]).length;
        if (L !== 'arena') {
          xi.forEach(p => { if (p.pos === 'GK' && p.y > .9) p.y = .76 + Math.max(.2, .7 / Math.max(1, R - 1)) * .95; });
          // and each line stands level (no pushed-up full-backs or dropped wingers), which leaves room for bigger tiles
          const y0s = xi.map(p => p.y); xi.forEach((p, i) => { const row = y0s.filter(y => Math.abs(y - y0s[i]) < .08); p.y = row.reduce((a, b) => a + b, 0) / row.length; });
        }
        const ys = xi.map(p => p.y), yMin = Math.min(...ys), yMax = Math.max(...ys);

        if (L === 'list') {
          // the line-up as a list on a glass panel, the star of the side cut out big beside it
          const px = 44, pw = sq ? 600 : 590, py = y0, ph2 = CB - py - (sq ? 24 : 36);
          const words = String(d.title || '').trim().split(/\s+/), last = words.length > 1 ? words.pop() : '';
          const th = story ? 330 : sq ? 200 : 250, foot = big ? 0 : (sq ? 70 : 90);
          const rh = (ph2 - th - foot - 40) / 11;
          const rows = xi.map(p => `<li style="height:${rh.toFixed(1)}px"><b>${P(p.num)}</b><span data-fit="w" data-min=".5">${P(p.name)}${p.tags.includes('c') ? ` <em>(${t('অধি.', 'C')})</em>` : ''}</span><i>${P(p.pos)}</i></li>`).join('');
          return `<div class="xl-shards"></div>` + ph(12, sq ? 520 : 470, story ? 520 : sq ? 120 : 160, sq ? 600 : 660, CB - (story ? 520 : sq ? 120 : 160), 'cut-glow')
            + sec('panel', `<div class="xl-panel ${sq ? 'sq' : ''}" style="${box(px, py, pw, ph2)}">
                <div class="xl-top" style="height:${th}px"><div class="xl-team">${ph(0, 0, 0, sq ? 44 : 54, sq ? 44 : 54, 'crest inl')}<span data-fit="w" data-min=".5">${P(d.team)}</span></div>
                  <div class="xl-t1" data-fit="w" data-min=".4">${P(words.join(' '))}</div>${last ? `<div class="xl-t2 ${t('', 'en')}" data-fit="w" data-min=".4">${P(last)}</div>` : ''}</div>
                <ol class="xl-rows" style="font-size:${Math.round(Math.min(40, rh * .52))}px">${rows}</ol>
                ${big ? '' : `<div class="xl-foot" style="height:${foot}px"><span data-fit="w" data-min=".5">${P(d.match)}${d.formation ? ` · ${P(d.formation.replace(/D$/, ' ◆'))}` : ''}${d.coach ? ` · ${t('কোচ', 'Coach')}: ${P(d.coach)}` : ''}</span></div>`}</div>`);
        }

        if (L === 'cards') {
          // flat pitch, every player a square photo tile with the name on a slanted band
          const fx = 40, fw = 1000, fh = fb - fy;
          const at = (p, T) => { const m = T / 2 + 22, top = fy + T * .5 + 14, bot = fb - T * .72;
            return [fx + m + p.x * (fw - 2 * m), top + (p.y - yMin) / Math.max(.01, yMax - yMin) * (bot - top)]; };
          const T = fit(sq ? 150 : 180, 60, (p, T) => { const [x, y] = at(p, T); return [x - T / 2 - 10, y - T / 2 - 14, x + T / 2 + 10, y + T / 2 + T * .16 + 6]; });
          const tiles = xi.map((p, i) => {
            const [x, y] = at(p, T), f = !c.has(i + 1) && c.face(p.name);
            const pic = c.has(i + 1) ? ph(i + 1, 0, 0, T, T, 'xc-ph', 'scene')
              : f ? `<img class="xc-face" src="${f}" alt="">` : `<div class="xc-blank"><b>${P(p.num || p.pos)}</b></div><div class="ph-hint xc-hint" data-slot="${i + 1}">📷</div>`;
            return `<div class="xc-pl" style="${box(x - T / 2, y - T / 2, T, T)};--t:${T}px"><div class="xc-tile">${pic}</div>
              <i class="xc-pos">${P(p.pos)}</i>${p.num && (c.has(i + 1) || f) ? `<i class="xc-num">${P(p.num)}</i>` : ''}${cap(p)}
              <div class="xc-name"><div data-fit="w" data-min=".45"><span>${P(p.name)}</span></div></div></div>`;
          }).join('');
          return `<div class="xc-band" style="${box(0, 0, 1080, y0 + hh + 34)}"></div>`
            + sec('head', `<div class="xp-head ${sq ? 'sq' : ''} ${big ? 'big' : ''} xc-head" style="${box(60, y0, 720, hh)}">${ph(0, 0, 0, sq ? 96 : 120, sq ? 96 : 120, 'crest inl')}
                <div><div class="xp-kick ${t('', 'en')}">${P(d.title)}</div><div class="xi-team" data-fit="w" data-min=".45">${P(d.team)}</div><div class="xp-sub"><span>${P(d.match)}</span> ${fm}</div></div></div>`)
            + `<div class="xc-field" style="${box(fx, fy, fw, fh)}"><i class="half"></i><i class="circ"></i><i class="box-t"></i><i class="box-b"></i></div>`
            + sec('players', `<div class="mv-in ${big ? 'big' : ''}">${tiles}</div>`) + subs('xc');
        }

        if (L === 'kits') {
          // top-down striped pitch across the whole poster, every player a shirt with the number (or position) on it
          const fx = 30, fw = 1020, fh = fb - fy;
          const at = (p, S) => { const m = S / 2 + 14, top = fy + S * .48, bot = fb - S * .62;
            return [fx + m + p.x * (fw - 2 * m), top + (p.y - yMin) / Math.max(.01, yMax - yMin) * (bot - top)]; };
          const S = fit(sq ? 170 : story ? 260 : 220, 56, (p, S) => { const [x, y] = at(p, S); return [x - S / 2 - 8, y - S / 2 - 4, x + S / 2 + 8, y + S * .5 + 10]; });
          const shirts = xi.map((p, i) => {
            const [x, y] = at(p, S), gk = p.pos === 'GK';
            return `<div class="xk-pl ${gk ? 'gk' : ''}" style="left:${Math.round(x)}px;top:${Math.round(y)}px;--s:${S}px">
              <svg class="xk-shirt" viewBox="0 0 100 100"><path d="${SHIRT}"/><path class="cl" d="M41 5Q50 15 59 5"/></svg>
              <div class="xk-chest ${p.num ? '' : 'solo'}"><small>${P(p.pos)}</small>${p.num ? `<b>${P(p.num)}</b>` : ''}</div>${cap(p)}
              <div class="xk-name"><div data-fit="w" data-min=".45"><span>${P(p.name)}</span></div></div></div>`;
          }).join('');
          return `<div class="xk-pitch" style="${box(0, fy - 20, 1080, fb - fy + 40)}"><i class="half"></i><i class="circ"></i><i class="box-t"></i><i class="box-b"></i></div>`
            + sec('head', `<div class="xp-head ${sq ? 'sq' : ''} ${big ? 'big' : ''} xk-head" style="${box(60, y0, 700, hh)}"><div><div class="xp-kick ${t('', 'en')}">${P(d.title)}</div>
                <div class="xi-team" data-fit="w" data-min=".45">${P(d.team)}</div><div class="xp-sub">${ph(0, 0, 0, sq ? 54 : 64, sq ? 54 : 64, 'crest inl')}<span>${P(d.match)}</span> ${fm}</div></div></div>`)
            + sec('players', `<div class="mv-in ${big ? 'big' : ''}">${shirts}</div>`) + subs('xk');
        }

        // arena: a pitch tipped back under stadium lights, drawn in perspective; badges shrink a little towards the far end
        const tw = sq ? 620 : story ? 780 : 660, bw = sq ? 940 : 1000, k = .4;
        const g = y => y / (1 + k - k * y);
        const fa = fb - (sq ? 44 : 62), ft = fy + (sq ? 30 : 14);   // room under the keeper for his name, above the striker for his number
        const pt = (x, y) => { const v = g(y), w = tw + (bw - tw) * v; return [540 + (x - .5) * w, ft + (fa - ft) * v]; };
        const line = (pts, cls = '') => `<polyline class="${cls}" points="${pts.map(([x, y]) => pt(x, y).map(n => n.toFixed(1)).join(',')).join(' ')}"/>`;
        const rect = (x0, y0, x1, y1) => line([[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]]);
        const ell = (cx, cy, rx, ry, a0 = 0, a1 = Math.PI * 2) => line(Array.from({ length: 41 }, (_, i) => { const a = a0 + (a1 - a0) * i / 40; return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)]; }));
        const stripes = Array.from({ length: 12 }, (_, i) => i % 2 ? '' : `<polygon class="st" points="${[[0, i / 12], [1, i / 12], [1, (i + 1) / 12], [0, (i + 1) / 12]].map(([x, y]) => pt(x, y).join(',')).join(' ')}"/>`).join('');
        const pitch = `<svg class="xa-pitch" style="${box(0, 0, 1080, CB)}" viewBox="0 0 1080 ${CB}">
            <defs><linearGradient id="xaG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="g0"/><stop offset="1" class="g1"/></linearGradient></defs>
            <polygon class="turf" points="${[[0, 0], [1, 0], [1, 1], [0, 1]].map(([x, y]) => pt(x, y).join(',')).join(' ')}"/>${stripes}
            <g class="ln">${rect(0, 0, 1, 1)}${line([[0, .5], [1, .5]])}${ell(.5, .5, .135, .087)}${rect(.2035, 0, .7965, .157)}${rect(.365, 0, .635, .052)}
            ${rect(.2035, .843, .7965, 1)}${rect(.365, .948, .635, 1)}${ell(.5, .157, .088, .057, .65, Math.PI - .65)}${ell(.5, .843, .088, .057, Math.PI + .65, Math.PI * 2 - .65)}</g></svg>`;
        const sz = (p, s) => s * (.78 + .22 * g(p.y));
        // the keeper stands on the goal line; everyone else is spread over the rest, so the back line keeps clear of him
        const at = p => pt(.06 + p.x * .88, p.pos === 'GK' && p.y > .9 ? .955 : .03 + Math.max(0, p.y - .04) / .72 * .7);
        const s0 = fit(sq ? 96 : 112, 54, (p, s) => { const [x, y] = at(p), r = sz(p, s) / 2, w = Math.max(r * 2, 1.6 * sz(p, s)) / 2; return [x - w, y - r, x + w, y + r + 40 * sz(p, s) / s + 4]; });
        const dots = xi.map(p => {
          const [x, y] = at(p), s = sz(p, s0), m = String(mark(p));
          return `<div class="xa-pl ${p.pos === 'GK' ? 'gk' : ''}" style="left:${Math.round(x)}px;top:${Math.round(y)}px;--s:${s.toFixed(1)}px">
            <div class="xa-disc"><b class="${m.length > 2 ? 'sm' : ''}">${mark(p)}</b></div>${!byNum && p.num ? `<i class="xa-num">${P(p.num)}</i>` : ''}${cap(p)}
            <div class="xa-name"><div data-fit="w" data-min=".45"><span>${P(p.name)}</span></div></div></div>`;
        }).join('');
        return `<div class="xa-beams"></div>` + pitch
          + sec('head', `<div class="xp-head ${sq ? 'sq' : ''} ${big ? 'big' : ''} xa-head" style="${box(60, y0, 720, hh)}">${ph(0, 0, 0, sq ? 100 : 124, sq ? 100 : 124, 'crest inl')}
              <div><div class="xp-kick ${t('', 'en')}">${P(d.title)}</div><div class="xi-team" data-fit="w" data-min=".45">${P(d.team)}</div><div class="xp-sub"><span>${P(d.match)}</span> ${fm}</div></div></div>`)
          + sec('players', `<div class="mv-in ${big ? 'big' : ''}">${dots}</div>`) + subs('xa');
      },
    },

    // ---------------------------------------------------------------- squad
    {
      id: 'squad', name: 'দল / স্কোয়াড', icon: '👥',
      layouts: { columns: 'কলাম (পজিশন অনুযায়ী)', hero: 'বড় শিরোনাম + ছবি' },
      logo: { columns: ['tl', 'tr'], hero: ['tr'] },
      fields: [['title', 'শিরোনাম', 'text'], ['sub', 'নিচের লাইন', 'text'],
        ['groups', 'খেলোয়াড় (প্রতি লাইনে একটি পজিশন: "গোলকিপার: নাম, নাম")', 'area', 8]],
      photos: [{ label: 'খেলোয়াড়ের ছবি (ঐচ্ছিক, অটো কাটা)', mode: 'cut' }, { label: 'দলের লোগো', mode: 'logo', team: 1, flag: 'title' }],
      data: { title: 'আর্জেন্টিনা স্কোয়াড', sub: 'ফিফা বিশ্বকাপ ২০২৬',
        groups: 'গোলকিপার: এমিলিয়ানো মার্তিনেজ, হুয়ান মুসো, গেরোনিমো রুলি\nডিফেন্ডার: নাহুয়েল মোলিনা, ক্রিস্তিয়ান রোমেরো, নিকোলাস ওতামেন্দি, লিসান্দ্রো মার্তিনেজ, নিকোলাস তাগলিয়াফিকো, গনজালো মন্তিয়েল, লিওনার্দো বালের্দি, মার্কোস আকুনিয়া\nমিডফিল্ডার: রদ্রিগো দি পল, এনজো ফার্নান্দেজ, অ্যালেক্সিস ম্যাক অ্যালিস্টার, লিয়ান্দ্রো পারেদেস, জিওভানি লো চেলসো, এজেকিয়েল পালাসিওস, থিয়াগো আলমাদা\nফরোয়ার্ড: লিওনেল মেসি, হুলিয়ান আলভারেজ, লাউতারো মার্তিনেজ, নিকোলাস গনসালেস, আলেহান্দ্রো গার্নাচো' },
      render(d, c) {
        const { L, CB, P, sec, ph } = c, gs = groups(d.groups);
        const col = g => `<div class="sq-col"><div class="sq-h">${P(g.name)}</div><ul data-fit>${g.list.map(n => { const p = ST.player(n); return `<li>${P(p.name)}${tags(p, P)}</li>`; }).join('')}</ul></div>`;
        if (L === 'hero') {
          return ph(0, 560, 300, 520, CB - 300, 'cut-glow')
            + sec('title', `<div class="sq-title" style="${box(60, 110, 800, 230)}">${ph(1, 0, 0, 120, 120, 'crest inl')}<div><div class="xi-team" data-fit="w" data-min=".4">${P(d.title)}</div><div class="band">${P(d.sub)}</div></div></div>`)
            + sec('list', `<div class="sq-grid two" style="${box(60, 380, c.has(0) ? 640 : 960, CB - 430)}">${gs.map(col).join('')}</div>`);
        }
        return (c.has(0) ? ph(0, 720, 190, 360, 200, 'cut-glow') : '')
          + sec('title', `<div class="sq-title" style="${box(60, 200, c.has(0) ? 640 : 960, 160)}">${ph(1, 0, 0, 120, 120, 'crest inl')}<div><div class="xi-team" data-fit="w" data-min=".4">${P(d.title)}</div><div class="band">${P(d.sub)}</div></div></div>`)
          + sec('list', `<div class="sq-grid" style="${box(50, 400, 980, CB - 440)};grid-template-columns:repeat(${Math.min(4, Math.max(1, gs.length))},1fr)">${gs.map(col).join('')}</div>`);
      },
    },

    // ---------------------------------------------------------------- player stats
    {
      id: 'stats', name: 'পরিসংখ্যান', icon: '📊',
      layouts: { list: 'তালিকা + ছবি', tiles: 'বড় টাইল' },
      logo: { list: ['tr'], tiles: ['tr'] },
      fields: [['kicker', 'খেলোয়াড়ের নাম', 'text'], ['title', 'শিরোনাম', 'text'], ['rows', 'সারি (সংখ্যা | কোথায় / কার বিপক্ষে)', 'area', 8],
        ['sumTitle', 'সারাংশের শিরোনাম', 'text'], ['sum', 'সারাংশ (নাম | সংখ্যা)', 'area', 4]],
      photos: [{ label: 'খেলোয়াড়ের ছবি (অটো কাটা)', mode: 'cut', name: 'kicker' }],
      data: { kicker: 'সাদমান ইসলাম', title: 'টেস্টে সেরা ওপেনার?', rows: '93 | পাকিস্তানের বিপক্ষে\n50 | ভারতের বিপক্ষে\n64 | ওয়েস্ট ইন্ডিজের বিপক্ষে\n120 | জিম্বাবুয়ের বিপক্ষে\n76 | শ্রীলঙ্কার বিপক্ষে\n80 | আয়ারল্যান্ডের বিপক্ষে\n99* | ওয়েস্ট ইন্ডিজের বিপক্ষে',
        sumTitle: '২০২৪ থেকে ব্যাটিং পরিসংখ্যান', sum: 'ইনিংস | 35\nরান | 1118\nগড় | 34.93\n১০০/৫০ | 1/8' },
      render(d, c) {
        const { L, CB, T, P, sec, ph } = c, rows = ST.rows(d.rows), sum = ST.rows(d.sum);
        const tiles = (y) => sec('sum', `<div class="sum" style="${box(60, y, 960, 190)}"><div class="sum-t">${P(d.sumTitle)}</div><div class="sum-row">${sum.map(r => `<div><small>${P(r[0])}</small><b>${P(r[1] || '')}</b></div>`).join('')}</div></div>`, sum.length > 0);
        if (L === 'tiles') {
          return ph(0, 520, 200, 560, CB * 0.55 - 80, 'cut-glow')
            + sec('title', `<div class="st-title" style="${box(70, 150, 560, 260)}"><div class="xi-k">${P(d.kicker)}</div><div class="xi-team multi" data-fit data-min=".4">${T(d.title)}</div></div>`)
            + sec('tiles', `<div class="tile-grid" style="${box(60, CB * 0.55 + 140, 960, CB * 0.45 - 200)}">${rows.slice(0, 8).map(r => `<div><b>${P(r[0])}</b><span>${P(r[1] || '')}</span></div>`).join('')}</div>`)
            + tiles(CB * 0.55 - 60);
        }
        return ph(0, 470, 200, 610, CB - 410, 'cut-glow')
          + sec('title', `<div class="st-title" style="${box(70, 130, 600, 250)}"><div class="xi-k">${P(d.kicker)}</div><div class="xi-team multi" data-fit data-min=".4">${T(d.title)}</div></div>`)
          + sec('rows', `<ul class="srows" data-fit style="${box(70, 400, 480, CB - 400 - 270)}">${rows.map(r => `<li><b>${P(r[0])}</b><span>${P(r[1] || '')}</span></li>`).join('')}</ul>`)
          + tiles(CB - 240);
      },
    },

    // ---------------------------------------------------------------- top list
    {
      id: 'toplist', name: 'সেরা তালিকা', icon: '🏆',
      layouts: { bars: 'বার (প্রথমটা হাইলাইট)', rank: 'র‍্যাংক (১, ২, ৩…)' },
      logo: { bars: ['tr'], rank: ['tr'] },
      fields: [['title', 'শিরোনাম', 'area', 2], ['sub', 'নিচের লাইন', 'text'], ['rows', 'সারি (সংখ্যা | নাম | তথ্য)', 'area', 8]],
      photos: [{ label: 'এক নম্বরের ছবি (অটো কাটা)', mode: 'cut' }],
      data: { title: 'সর্বোচ্চ ইনিংস', sub: 'ওয়ানডেতে ইংল্যান্ডের হয়ে', rows: '202 | হ্যারি ব্রুক | বনাম শ্রীলঙ্কা, ২০২৫\n182 | বেন স্টোকস | বনাম নিউজিল্যান্ড, ২০২৩\n180 | জেসন রয় | বনাম অস্ট্রেলিয়া, ২০১৮\n171 | অ্যালেক্স হেলস | বনাম পাকিস্তান, ২০১৬\n167* | রবিন স্মিথ | বনাম অস্ট্রেলিয়া, ১৯৯৩\n166* | জো রুট | বনাম ওয়েস্ট ইন্ডিজ, ২০২৫' },
      render(d, c) {
        const { L, CB, T, P, sec, ph } = c, rows = ST.rows(d.rows);
        if (L === 'rank') {
          const ry = CB < 1100 ? 380 : Math.max(430, CB * 0.42);
          return (c.has(0) ? ph(0, 600, 200, 480, ry - 260, 'cut-glow') : '')
            + sec('title', `<div class="st-title" style="${box(70, 150, 600, ry - 180)}"><div class="xi-team multi" data-fit data-min=".4">${T(d.title)}</div><div class="xi-sub">${P(d.sub)}</div></div>`)
            + sec('rows', `<ol class="rank" data-fit style="${box(60, ry, 960, CB - ry - 50)}">${rows.map((r, i) => `<li><i>${P(i + 1)}</i><span>${P(r[1] || '')}<small>${P(r[2] || '')}</small></span><b>${P(r[0])}</b></li>`).join('')}</ol>`);
        }
        return ph(0, 480, 160, 600, CB - 160, 'cut-glow')
          + sec('title', `<div class="st-title" style="${box(70, 130, 560, 260)}"><div class="xi-team multi" data-fit data-min=".4">${T(d.title)}</div><div class="xi-sub">${P(d.sub)}</div></div>`)
          + sec('rows', `<ul class="bars" data-fit style="${box(70, 410, 560, CB - 460)}">${rows.map(r => `<li><b>${P(r[0])}</b><span>${P(r[1] || '')}<small>${P(r[2] || '')}</small></span></li>`).join('')}</ul>`);
      },
    },

    // ---------------------------------------------------------------- points table
    {
      id: 'table', name: 'পয়েন্ট টেবিল', icon: '📈',
      layouts: { table: 'টেবিল', glass: 'গ্লাস (ছবির উপর)' },
      logo: { table: ['tr'], glass: ['tr'] },
      fields: [['title', 'শিরোনাম', 'text'], ['group', 'গ্রুপ / পর্ব', 'text'], ['head', 'কলামের নাম (| দিয়ে)', 'text'],
        ['rows', 'সারি (দল | ম্যাচ | জয় | ড্র | হার | ব্যবধান | পয়েন্ট)', 'area', 8], ['q', 'উপরের কয়টা দল হাইলাইট (পরের পর্বে)', 'text']],
      photos: [{ label: 'টুর্নামেন্টের লোগো', mode: 'logo' }, { label: 'পেছনের ছবি (গ্লাস লেআউট)', mode: 'scene' }],
      data: { title: 'পয়েন্ট টেবিল', group: 'ফিফা বিশ্বকাপ ২০২৬ · গ্রুপ এ', head: 'দল | ম্যাচ | জয় | ড্র | হার | ব্যবধান | পয়েন্ট',
        rows: 'আর্জেন্টিনা | 3 | 2 | 1 | 0 | +4 | 7\nসেনেগাল | 3 | 2 | 0 | 1 | +2 | 6\nমেক্সিকো | 3 | 1 | 1 | 1 | 0 | 4\nকানাডা | 3 | 0 | 0 | 3 | -6 | 0', q: '2' },
      render(d, c) {
        const { L, CB, P, sec, ph } = c, head = d.head.split('|').map(s => s.trim()), rows = ST.rows(d.rows), q = +ST.enDigits(d.q) || 0;
        const n = Math.max(1, rows.length), top = 380, rh = Math.min(110, (CB - top - 80) / (n + 1));
        const tbl = `<table class="pt ${L}" style="--rh:${Math.round(rh)}px"><thead><tr><th>#</th>${head.map((h, i) => `<th class="${i ? '' : 'tl'}">${P(h)}</th>`).join('')}</tr></thead>
          <tbody>${rows.map((r, i) => `<tr class="${i < q ? 'q' : ''}"><td class="pos">${P(i + 1)}</td>${r.map((v, j) => `<td class="${j ? (j === r.length - 1 ? 'pts' : '') : 'tl team'}">${j ? '' : (cr => cr ? `<img class="tcrest" src="${cr}" alt="">` : '')(c.crest(v))}${P(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
        return (L === 'glass' ? ph(1, 0, 0, 1080, CB, 'dim') : '')
          + sec('head', `<div class="pt-head" style="${box(60, 120, 960, 230)}">${ph(0, 0, 0, 150, 150, 'crest inl')}<div><div class="xi-team" data-fit="w" data-min=".5">${P(d.title)}</div><div class="band">${P(d.group)}</div></div></div>`)
          + sec('table', `<div class="pt-wrap" style="${box(50, top, 980, CB - top - 50)}">${tbl}</div>`);
      },
    },

    // ---------------------------------------------------------------- trivia
    {
      id: 'trivia', name: 'আপনি জানেন কি?', icon: '💡',
      layouts: { card: 'ছবি + তথ্য', full: 'ফুল ছবি' },
      logo: { card: ['tl', 'tr'], full: ['tr', 'tl'] },
      fields: [['label', 'লেবেল', 'text'], ['fact', 'তথ্য (*তারা* দিলে রঙিন)', 'area', 5], ['src', 'সূত্র (ঐচ্ছিক)', 'text']],
      photos: [{ label: 'ছবি', mode: 'scene' }],
      data: { label: 'আপনি জানেন কি?', fact: 'বিশ্বকাপ ইতিহাসের প্রথম ফুটবলার হিসেবে *১০টি অ্যাসিস্ট* করার কীর্তি গড়েছেন লিওনেল মেসি।', src: '' },
      render(d, c) {
        const { L, CB, T, P, sec, ph } = c;
        if (L === 'full') {
          return ph(0, 0, 0, 1080, CB) + `<div class="shade-b" style="${box(0, CB * 0.3, 1080, CB * 0.7)}"></div>`
            + sec('label', `<div class="pill big" style="left:70px;top:${CB * 0.55}px">💡 ${P(d.label)}</div>`)
            + sec('fact', `<div class="news-head on-photo" data-fit style="${box(70, CB * 0.55 + 110, 940, CB * 0.45 - 190)}">${T(d.fact)}</div>`)
            + sec('src', `<div class="src on-photo" style="left:70px;top:${CB - 55}px">${P(d.src)}</div>`, !!d.src);
        }
        const phH = CB * 0.46, pb = 210 + phH;
        return `<div class="frame-back" style="${box(44, 194, 992, phH + 32)}"></div>` + ph(0, 60, 210, 960, phH, 'rounded')
          + sec('label', `<div class="pill big center" style="left:0;width:1080px;top:${pb - 40}px"><span>💡 ${P(d.label)}</span></div>`)
          + sec('fact', `<div class="news-head center" data-fit style="${box(80, pb + 70, 920, CB - pb - 150)}">${T(d.fact)}</div>`)
          + sec('src', `<div class="src center" style="left:0;width:1080px;top:${CB - 60}px">${P(d.src)}</div>`, !!d.src);
      },
    },
  ];

  ST.card = id => ST.CARDS.find(c => c.id === id) || ST.CARDS[0];
})();
