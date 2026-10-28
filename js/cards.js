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
            + sec('quote', `<div class="q-panel" style="${box(60, 190, 560, CB - 300)}"><div class="qmark">${QM}</div><div class="q-text" data-fit>${T(d.quote)}</div><div class="q-who">${who}</div></div>`);
        }
        if (L === 'full') {
          return ph(0, 0, 0, 1080, CB) + `<div class="shade-l" style="${box(0, 0, 1080, CB)}"></div>`
            + sec('quote', `<div class="q-free on-photo" style="${box(70, CB * 0.3, 620, CB * 0.62)}"><div class="qmark">${QM}</div><div class="q-text" data-fit>${T(d.quote)}</div><div class="q-who">${who}</div></div>`);
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
      fields: [['comp', 'টুর্নামেন্ট', 'text'], ['stage', 'পর্ব (ঐচ্ছিক)', 'text'], ['status', 'অবস্থা', 'text'],
        ['t1', 'দল ১', 'text'], ['s1', 'গোল (দল ১)', 'text'], ['t2', 'দল ২', 'text'], ['s2', 'গোল (দল ২)', 'text'],
        ['g1', 'গোলদাতা (দল ১, কমা দিয়ে)', 'area', 2], ['g2', 'গোলদাতা (দল ২)', 'area', 2], ['note', 'নিচের লাইন (অ্যাগ্রিগেট / টাইব্রেকার)', 'text']],
      photos: [{ label: 'ম্যাচের ছবি', mode: 'scene' }, { label: 'দল ১ এর লোগো', mode: 'logo', team: 1 }, { label: 'দল ২ এর লোগো', mode: 'logo', team: 2 }],
      data: { comp: 'লা লিগা', stage: '', status: 'ফুল-টাইম', t1: 'রিয়াল মাদ্রিদ', s1: '2', t2: 'বার্সেলোনা', s2: '3', g1: "এমবাপে ২৩', ভিনিসিয়ুস ৬৭'", g2: "ইয়ামাল ১২', লেভানদোভস্কি ৪৫', রাফিনিয়া ৮৮'", note: '' },
      render(d, c) {
        const { L, CB, P, sec, ph } = c;
        const crest = (i, x, y, s) => ph(i, x, y, s, s, 'crest');
        const scorers = (y, h) => sec('goals', `<div class="goals" style="${box(70, y, 940, h)}"><div>${P(d.g1).replace(/,\s*/g, '<br>')}</div><i>⚽</i><div>${P(d.g2).replace(/,\s*/g, '<br>')}</div></div>`, !!(d.g1 || d.g2));
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
          const pb = CB * 0.58;
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
          + scorers(by + 170, 110) + sec('note', `<div class="note on-photo" style="left:0;width:1080px;top:${CB - 50}px">${P(d.note)}</div>`, !!d.note);
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
      layouts: { pitch: 'সবুজ মাঠ', tactic: 'ট্যাকটিক বোর্ড (গাঢ়)' },
      logo: { pitch: ['tr'], tactic: ['tr'] },
      fields: [['title', 'শিরোনাম', 'text'], ['team', 'দল / ম্যাচ', 'text'], ['formation', 'ফরমেশন (যেমন 4-3-3, 4-2-3-1)', 'text'],
        ['players', 'খেলোয়াড় (গোলরক্ষক আগে, তারপর ডিফেন্স বাম→ডান, তারপর মাঝমাঠ, শেষে আক্রমণ; নম্বর আগে দিতে পারো)', 'area', 11],
        ['subs', 'বদলি (কমা দিয়ে)', 'area', 2], ['coach', 'কোচ (ঐচ্ছিক)', 'text']],
      photos: [{ label: 'দলের লোগো', mode: 'logo', team: 1 }],
      data: { title: 'শুরুর একাদশ', team: 'বাংলাদেশ বনাম ভারত · এশিয়ান কাপ বাছাই', formation: '4-3-3',
        players: '1 মিতুল মারমা (GK)\n2 শাকিল আহাদ তপু\n5 তারিক কাজী\n4 তপু বর্মন\n3 সাদ উদ্দিন\n8 হামজা চৌধুরী\n6 জামাল ভূঁইয়া (c)\n10 সোহেল রানা\n7 রাকিব হোসেন\n9 মোরসালিন\n11 শমিত সোম',
        subs: 'সুজন, ফাহামেদুল, ঋদয়, মিতুল, রহমত, মোহাম্মদ হৃদয়', coach: 'হাভিয়ের কাবরেরা' },
      render(d, c) {
        const { L, CB, P, sec, ph, t } = c;
        const fx = 70, fy = 260, fw = 940, fh = CB - fy - (d.subs ? 200 : 90);
        const shape = [1].concat(String(ST.enDigits(d.formation)).split(/[^0-9]+/).map(Number).filter(n => n > 0));
        const all = ST.lines(d.players).map(ST.player);
        let k = 0;
        const dots = shape.map((n, r) => {
          const y = fy + fh - 80 - r * ((fh - 170) / Math.max(1, shape.length - 1));
          return Array.from({ length: n }, (_, j) => {
            const p = all[k++] || { num: '', name: '', tags: [] }, x = fx + fw * (j + 1) / (n + 1);
            const face = c.face(p.name);
            return `<div class="pl" style="left:${Math.round(x)}px;top:${Math.round(y)}px"><div class="shirt">${face ? `<img src="${face}">` : P(p.num || (r ? '' : 'GK'))}</div>
              <div class="pn" style="width:${Math.round(Math.min(230, fw / (n + 1) - 6))}px;left:${-Math.round(Math.min(230, fw / (n + 1) - 6) / 2)}px">${P(p.name)}${p.tags.includes('c') ? ` <em>(${t('অধি.', 'C')})</em>` : ''}</div></div>`;
          }).join('');
        }).join('');
        return sec('head', `<div class="pitch-head" style="${box(70, 110, 940, 130)}">${ph(0, 0, 0, 110, 110, 'crest inl')}<div><div class="xi-team" data-fit="w" data-min=".5">${P(d.title)}</div><div class="xi-sub">${P(d.team)}${d.formation ? ' · ' + P(d.formation) : ''}</div></div></div>`)
          + `<div class="field ${L}" style="${box(fx, fy, fw, fh)}"><i class="half"></i><i class="circ"></i><i class="box-t"></i><i class="box-b"></i></div>`
          + sec('players', `<div class="mv-in">${dots}</div>`)
          + sec('subs', `<div class="subs" style="${box(70, CB - 175, 940, 150)}"><b>${t('বদলি', 'Subs')}:</b> ${P(d.subs)}${d.coach ? `<div class="coach"><b>${t('কোচ', 'Coach')}:</b> ${P(d.coach)}</div>` : ''}</div>`, !!(d.subs || d.coach));
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
          <tbody>${rows.map((r, i) => `<tr class="${i < q ? 'q' : ''}"><td class="pos">${P(i + 1)}</td>${r.map((v, j) => `<td class="${j ? (j === r.length - 1 ? 'pts' : '') : 'tl team'}">${j ? '' : `<i class="chip">${P(v.slice(0, 1))}</i>`}${P(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
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
