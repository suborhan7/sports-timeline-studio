/* Two languages. The studio panel can be in Bangla or English (ST.ui), and so can the poster (ST.lang: example text,
   words the cards print, digits). Text written "বাংলা ~ English" is split by ST.tr; plain Bangla text is looked up in
   EN below and stays Bangla when it has no entry. Loaded after cards.js, so it also gives the first 12 cards their
   English example text. */
(function () {
  const ST = window.ST;
  ST.ui = 'bn'; ST.lang = 'bn';
  ST.t = (bn, en) => ST.lang === 'en' ? en : bn;
  ST.tr = s => {
    s = String(s ?? ''); const i = s.indexOf(' ~ ');
    if (i >= 0) return ST.ui === 'en' ? s.slice(i + 3) : s.slice(0, i);
    return ST.ui === 'en' && EN[s.trim()] ? s.replace(s.trim(), EN[s.trim()]) : s;
  };
  ST.TAGS = { bn: { c: 'অধি.', wk: 'উই.', vc: 'সহ-অধি.', gk: 'গোলরক্ষক' }, en: { c: 'C', wk: 'WK', vc: 'VC', gk: 'GK' } };

  const EN = ST.EN = {
    // ---- panel (index.html) ----
    'স্টুডিও': 'Studio', '📷 সব ছবি একসাথে দিন': '📷 Drop all photos at once',
    'খেলোয়াড়, লোগো, ম্যাচের ছবি: যেটা যেখানে মানায়, নিজে থেকেই বসে যাবে। পোস্টারের উপর টেনে ছেড়েও দিতে পারেন।': 'Players, crests, match photos: each one finds its best spot by itself. You can also drop them on the poster.',
    'লেখা': 'Text', 'ডিজাইন': 'Design', 'সাইজ': 'Size', 'ছবি': 'Photos',
    'খেলোয়াড়ের ছবির ব্যাকগ্রাউন্ড অটো কাটো (প্রথমবার ইন্টারনেট লাগবে)': 'Remove the background of player photos (needs internet the first time)',
    'রং আর ফন্ট': 'Colours and fonts', 'ফন্টের জোড়া (এক চাপে)': 'Font pair (one tap)', 'শিরোনামের ফন্ট': 'Headline font', 'লেখার ফন্ট': 'Body font',
    'শিরোনামের সাইজ': 'Headline size', 'সংখ্যা বাংলায় (2 → ২)': 'Bangla digits (2 → ২)', 'পেছনে টাইমলাইন ডিজাইন': 'Timeline pattern in the background',
    'নিজের ব্যাকগ্রাউন্ড ছবি (ঐচ্ছিক)': 'Your own background picture (optional)', '✕ ব্যাকগ্রাউন্ড সরাও': '✕ Remove background',
    'লোগো আর নিচের স্ট্রিপ': 'Logo and footer strip', 'লোগো': 'Logo', 'দুই লাইন': 'Two lines', 'এক লাইন': 'One line', 'গোল ব্যাজ': 'Round badge', 'লোগো নেই': 'No logo',
    'কোথায়': 'Where', 'অটো (ফাঁকা কোণে)': 'Auto (calmest corner)', 'উপরে বামে': 'Top left', 'উপরে ডানে': 'Top right', 'নিচে বামে': 'Bottom left', 'নিচে ডানে': 'Bottom right',
    'লোগোর রং': 'Logo colour', 'মূল রং': 'Main colour', 'দ্বিতীয় রং': 'Second colour', 'নিচের স্ট্রিপ': 'Footer strip',
    'টাইমলাইন স্ট্রিপ (স্লোগান + পেজ)': 'Timeline strip (slogan + page)', 'বিজ্ঞাপন / স্পনসর ব্যানার': 'Ad / sponsor banner', 'কিছু না': 'Nothing',
    'স্লোগান (*তারা* দিলে সোনালি)': 'Slogan (*stars* = gold)', 'পেজের ঠিকানা': 'Page address', 'ব্যানারের ছবি (চওড়া ছবি, অটো বসবে)': 'Banner picture (wide, fits by itself)',
    'পোস্টারে কী কী থাকবে': 'What is on the poster', 'সব আগের জায়গায় ফেরাও': 'Put everything back', 'ক্যাপশন': 'Caption', 'ক্যাপশন কপি': 'Copy caption',
    '⬇ ডাউনলোড': '⬇ Download', '↺ রিসেট': '↺ Reset', 'সব বদল মুছে শুরুর অবস্থায় ফেরাও': 'Undo every change and start fresh', '📲 অ্যাপ ইনস্টল': '📲 Install app', '📲 অ্যাপ হিসেবে ইনস্টল': '📲 Install as an app', 'ঠিক আছে': 'OK', '↗ শেয়ার': '↗ Share', 'ভাষা': 'Language', 'পোস্টারের ভাষা': 'Poster language',
    // ---- sizes, themes, fonts, logo colours ----
    'পোস্ট ৪:৫ (1080×1350)': 'Post 4:5 (1080×1350)', 'স্কয়ার (1080×1080)': 'Square (1080×1080)', 'স্টোরি / রিলস (1080×1920)': 'Story / Reels (1080×1920)',
    'নিয়ন রাত (নতুন)': 'Neon night', 'সানসেট': 'Sunset', 'ওশান ব্লু': 'Ocean blue', 'ব্রডকাস্ট লাল': 'Broadcast red', 'সাদা মডার্ন': 'Clean white', 'মিন্ট ফ্রেশ': 'Mint',
    'টাইমলাইন সবুজ (পেজের রং)': 'Timeline green (page colours)', 'সাদা-সবুজ': 'White & green', 'রয়্যাল নীল': 'Royal blue', 'দলের রং (লোগো থেকে)': 'Team colours (from crest)',
    'হিন্দ শিলিগুড়ি (পেজের এখনকার ফন্ট)': 'Hind Siliguri (page font now)', 'অনেক বাংলা (চাপা, স্পোর্টি)': 'Anek Bangla (narrow, sporty)', 'তিরো বাংলা (পত্রিকা)': 'Tiro Bangla (newspaper)',
    'নোটো সেরিফ (ক্লাসিক)': 'Noto Serif (classic)', 'গালাডা (হাতের লেখা)': 'Galada (handwritten)', 'বালু দা (গোলগাল)': 'Baloo Da (rounded)', 'আত্মা (মজার)': 'Atma (fun)', 'মিনা (আধুনিক)': 'Mina (modern)',
    'স্পোর্টি: অনেক + হিন্দ': 'Sporty: Anek + Hind', 'ক্লাসিক: হিন্দ + হিন্দ': 'Classic: Hind + Hind', 'পত্রিকা: তিরো + নোটো': 'Newspaper: Tiro + Noto', 'হাতের লেখা: গালাডা + হিন্দ': 'Handwritten: Galada + Hind',
    'গোলগাল: বালু + বালু': 'Rounded: Baloo + Baloo', 'সেরিফ: নোটো + হিন্দ': 'Serif: Noto + Hind', 'মজার: আত্মা + হিন্দ': 'Fun: Atma + Hind', 'আধুনিক: মিনা + মিনা': 'Modern: Mina + Mina',
    'অটো (ছবি দেখে সাদা/সবুজ)': 'Auto (from the photo)', 'ব্র্যান্ড (ক্রিম + সোনালি)': 'Brand (cream + gold)', 'পুরো সাদা': 'All white', 'সাদা + সোনালি': 'White + gold',
    'সবুজ + সোনালি': 'Green + gold', 'কালো': 'Black', 'পুরো সোনালি': 'All gold', 'নিজের রং': 'Custom colours',
    // ---- the first 12 cards ----
    'ইনস্ট্যান্ট নিউজ': 'Instant news', 'ফ্রেম (ছবি উপরে, খবর নিচে)': 'Frame (photo on top, news below)', 'পাশাপাশি (ছবি + সবুজ বক্স)': 'Side by side (photo + box)',
    'ফুল ছবি (লেখা ছবির উপর)': 'Full photo (text on the photo)', 'ছোট লেবেল (খালি রাখলে থাকবে না)': 'Small label (empty = none)', 'শিরোনাম (*তারা* দিলে রঙিন)': 'Headline (*stars* = colour)',
    'বিস্তারিত (ঐচ্ছিক)': 'Details (optional)', 'সূত্র / ক্রেডিট (ঐচ্ছিক)': 'Source / credit (optional)', 'খবরের ছবি': 'News photo',
    'ব্রেকিং নিউজ': 'Breaking news', 'ফ্ল্যাশ (লাল ব্যান্ড)': 'Flash (red band)', 'বোল্ড (বড় লেখা পেছনে)': 'Bold (big word behind)', 'ব্যান্ডের লেখা': 'Band text', 'এক লাইনে বিস্তারিত (ঐচ্ছিক)': 'One-line detail (optional)',
    'উক্তি (কোট)': 'Quote', 'ছবি উপরে': 'Photo on top', 'কাট-আউট পাশে': 'Cut-out beside', 'ফুল ছবি': 'Full photo', 'উক্তি (*তারা* দিলে রঙিন)': 'Quote (*stars* = colour)',
    'কে বলেছেন': 'Who said it', 'পরিচয় / কোথায় বলেছেন': 'Role / where it was said', 'যিনি বলেছেন তাঁর ছবি': 'Photo of the speaker',
    'ফুটবল স্কোর': 'Football score', 'স্কোরবার (ছবির নিচে)': 'Score bar (under the photo)', 'বড় সংখ্যা (বক্স)': 'Big numbers (boxes)', 'ফুল-টাইম (তির্যক)': 'Full-time (diagonal)',
    'টুর্নামেন্ট': 'Competition', 'পর্ব (ঐচ্ছিক)': 'Stage (optional)', 'অবস্থা': 'Status', 'দল ১': 'Team 1', 'গোল (দল ১)': 'Goals (team 1)', 'দল ২': 'Team 2', 'গোল (দল ২)': 'Goals (team 2)',
    'গোলদাতা (দল ১, কমা দিয়ে)': 'Scorers (team 1, comma between)', 'গোলদাতা (দল ২)': 'Scorers (team 2)', 'নিচের লাইন (অ্যাগ্রিগেট / টাইব্রেকার)': 'Line under (aggregate / penalties)',
    'ম্যাচের ছবি': 'Match photo', 'দল ১ এর লোগো': 'Team 1 crest', 'দল ২ এর লোগো': 'Team 2 crest',
    'ক্রিকেট স্কোর': 'Cricket score', 'পুরো স্কোরকার্ড': 'Full scorecard', 'ম্যাচ / সিরিজ': 'Match / series', 'রান-উইকেট (দল ১)': 'Runs-wickets (team 1)', 'ওভার (দল ১)': 'Overs (team 1)',
    'রান-উইকেট (দল ২)': 'Runs-wickets (team 2)', 'ওভার (দল ২)': 'Overs (team 2)', 'কে জিতেছে': 'Who won', 'এখনো খেলা চলছে': 'Still playing', 'ফলাফল লাইন': 'Result line',
    'দল ১ সেরা পারফরমার (নাম | স্কোর, প্রতি লাইনে একজন)': 'Team 1 top performers (name | score, one per line)', 'দল ২ সেরা পারফরমার': 'Team 2 top performers',
    'একাদশ (তালিকা)': 'Playing XI (list)', 'তালিকা + ছবি': 'List + photo', 'সাদা প্যানেল': 'White panel', 'বোল্ড (নম্বর সহ)': 'Bold (numbered)', 'উপরের ছোট লেখা': 'Small line on top',
    'দলের নাম': 'Team name', 'ম্যাচের তথ্য': 'Match info', 'খেলোয়াড় (প্রতি লাইনে একজন; (অধি.) (উই.) লিখলে ব্যাজ)': 'Players (one per line; (c) (wk) add a badge)',
    'খেলোয়াড়ের ছবি (ব্যাকগ্রাউন্ড অটো কাটা হবে)': 'Player photo (background removed for you)', 'দলের লোগো': 'Team crest',
    'ফুটবল একাদশ (মাঠে)': 'Football XI (on the pitch)', 'সবুজ মাঠ': 'Green pitch', 'ট্যাকটিক বোর্ড (গাঢ়)': 'Tactics board (dark)', 'শিরোনাম': 'Title', 'দল / ম্যাচ': 'Team / match',
    'ফরমেশন (যেমন 4-3-3, 4-2-3-1)': 'Formation (e.g. 4-3-3, 4-2-3-1)',
    'খেলোয়াড় (গোলরক্ষক আগে, তারপর ডিফেন্স বাম→ডান, তারপর মাঝমাঠ, শেষে আক্রমণ; নম্বর আগে দিতে পারো)': 'Players (keeper first, then defence left→right, midfield, attack; a number in front is fine)',
    'বদলি (কমা দিয়ে)': 'Substitutes (comma between)', 'কোচ (ঐচ্ছিক)': 'Coach (optional)',
    'দল / স্কোয়াড': 'Squad', 'কলাম (পজিশন অনুযায়ী)': 'Columns (by position)', 'বড় শিরোনাম + ছবি': 'Big title + photo', 'নিচের লাইন': 'Line under',
    'খেলোয়াড় (প্রতি লাইনে একটি পজিশন: "গোলকিপার: নাম, নাম")': 'Players (one position per line: "Goalkeepers: name, name")', 'খেলোয়াড়ের ছবি (ঐচ্ছিক, অটো কাটা)': 'Player photo (optional, auto cut-out)',
    'পরিসংখ্যান': 'Stats', 'বড় টাইল': 'Big tiles', 'খেলোয়াড়ের নাম': 'Player name', 'সারি (সংখ্যা | কোথায় / কার বিপক্ষে)': 'Rows (number | where / against)',
    'সারাংশের শিরোনাম': 'Summary title', 'সারাংশ (নাম | সংখ্যা)': 'Summary (label | number)', 'খেলোয়াড়ের ছবি (অটো কাটা)': 'Player photo (auto cut-out)',
    'সেরা তালিকা': 'Top list', 'বার (প্রথমটা হাইলাইট)': 'Bars (first highlighted)', 'র‍্যাংক (১, ২, ৩…)': 'Ranks (1, 2, 3…)', 'সারি (সংখ্যা | নাম | তথ্য)': 'Rows (number | name | note)',
    'এক নম্বরের ছবি (অটো কাটা)': 'Photo of number one (auto cut-out)',
    'পয়েন্ট টেবিল': 'Points table', 'টেবিল': 'Table', 'গ্লাস (ছবির উপর)': 'Glass (over a photo)', 'গ্রুপ / পর্ব': 'Group / stage', 'কলামের নাম (| দিয়ে)': 'Column names (split with |)',
    'সারি (দল | ম্যাচ | জয় | ড্র | হার | ব্যবধান | পয়েন্ট)': 'Rows (team | P | W | D | L | GD | Pts)', 'উপরের কয়টা দল হাইলাইট (পরের পর্বে)': 'How many top teams to colour (go through)',
    'টুর্নামেন্টের লোগো': 'Tournament logo', 'পেছনের ছবি (গ্লাস লেআউট)': 'Background photo (glass layout)',
    'আপনি জানেন কি?': 'Did you know?', 'ছবি + তথ্য': 'Photo + fact', 'লেবেল': 'Label', 'তথ্য (*তারা* দিলে রঙিন)': 'Fact (*stars* = colour)', 'সূত্র (ঐচ্ছিক)': 'Source (optional)',
  };

  // English example text for the first 12 cards (the new ones carry their own)
  const D = {
    news: { tag: 'INSTANT NEWS', head: 'Jeremy Solozano *taken to hospital* after a blow to the head', body: 'West Indies debutant Jeremy Solozano was hit on the head while fielding at short leg against Sri Lanka and was stretchered off the field.', src: '' },
    breaking: { flash: 'BREAKING NEWS', head: 'Liverpool sack head coach *Arne Slot*', body: '' },
    quote: { quote: 'It is normal, and that shows his respect. *He is one of the best players in the world.*', name: 'Kylian Mbappé', role: 'on taking the second penalty against Leipzig' },
    score: { comp: 'La Liga', stage: '', status: 'FULL-TIME', t1: 'Real Madrid', s1: '2', t2: 'Barcelona', s2: '3', g1: "Mbappé 23', Vinícius 67'", g2: "Yamal 12', Lewandowski 45', Raphinha 88'", note: '' },
    cricket: { event: '1st ODI · Colombo', t1: 'England', r1: '429-4', o1: '50 overs', t2: 'Sri Lanka', r2: '430-8', o2: '49.5 overs', win: '2', result: 'Sri Lanka won by 2 wickets',
      p1: 'Joe Root | 151 (128)\nHarry Brook | 98 (71)\nAdil Rashid | 2/64', p2: 'Pathum Nissanka | 132 (110)\nKusal Mendis | 102* (88)\nHasaranga | 2/71' },
    xi: { kicker: 'PROBABLE XI', team: 'Bangladesh', sub: '1st Test · Dhaka · vs West Indies',
      players: 'Tanzid Hasan Tamim\nShadman Islam\nMominul Haque\nMushfiqur Rahim\nNajmul Hossain Shanto (c)\nJaker Ali Anik (wk)\nMehidy Hasan Miraz\nNayeem Hasan\nHasan Mahmud\nTaijul Islam\nTaskin Ahmed' },
    pitch: { title: 'STARTING XI', team: 'Bangladesh vs India · Asian Cup qualifier', formation: '4-3-3',
      players: '1 Mitul Marma (GK)\n2 Shakil Ahad Topu\n5 Tariq Kazi\n4 Topu Barman\n3 Saad Uddin\n8 Hamza Choudhury\n6 Jamal Bhuyan (c)\n10 Sohel Rana\n7 Rakib Hossain\n9 Morsalin\n11 Shamit Shome',
      subs: 'Sujon, Fahamedul, Ridoy, Rahmat, Mohammad Hridoy', coach: 'Javier Cabrera' },
    squad: { title: 'Argentina squad', sub: 'FIFA World Cup 2026',
      groups: 'Goalkeepers: Emiliano Martínez, Juan Musso, Gerónimo Rulli\nDefenders: Nahuel Molina, Cristian Romero, Nicolás Otamendi, Lisandro Martínez, Nicolás Tagliafico, Gonzalo Montiel, Leonardo Balerdi, Marcos Acuña\nMidfielders: Rodrigo De Paul, Enzo Fernández, Alexis Mac Allister, Leandro Paredes, Giovani Lo Celso, Ezequiel Palacios, Thiago Almada\nForwards: Lionel Messi, Julián Álvarez, Lautaro Martínez, Nicolás González, Alejandro Garnacho' },
    stats: { kicker: 'Shadman Islam', title: 'The best Test opener?', rows: '93 | vs Pakistan\n50 | vs India\n64 | vs West Indies\n120 | vs Zimbabwe\n76 | vs Sri Lanka\n80 | vs Ireland\n99* | vs West Indies',
      sumTitle: 'Batting since 2024', sum: 'Innings | 35\nRuns | 1118\nAverage | 34.93\n100s/50s | 1/8' },
    toplist: { title: 'Highest scores', sub: 'For England in ODIs', rows: '202 | Harry Brook | vs Sri Lanka, 2025\n182 | Ben Stokes | vs New Zealand, 2023\n180 | Jason Roy | vs Australia, 2018\n171 | Alex Hales | vs Pakistan, 2016\n167* | Robin Smith | vs Australia, 1993\n166* | Joe Root | vs West Indies, 2025' },
    table: { title: 'Points table', group: 'FIFA World Cup 2026 · Group A', head: 'Team | P | W | D | L | GD | Pts',
      rows: 'Argentina | 3 | 2 | 1 | 0 | +4 | 7\nSenegal | 3 | 2 | 0 | 1 | +2 | 6\nMexico | 3 | 1 | 1 | 1 | 0 | 4\nCanada | 3 | 0 | 0 | 3 | -6 | 0', q: '2' },
    trivia: { label: 'Did you know?', fact: 'Lionel Messi is the first player in World Cup history with *10 assists*.', src: '' },
  };
  for (const [id, d] of Object.entries(D)) { const c = ST.CARDS.find(x => x.id === id); if (c && !c.dataEn) c.dataEn = d; }
})();
