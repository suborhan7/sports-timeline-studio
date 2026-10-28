# Sports Timeline Studio (স্পোর্টস টাইমলাইন স্টুডিও)

A poster studio for **Sports Timeline**, a Bangla sports-update page. Pick a card, type the news, drop the photos, download a ready-to-post image (HD, 2160 px wide).

Plain HTML, CSS and JavaScript: no build step, no server, no account. Everything runs in the browser and photos never leave the device.

**Live:** https://suborhan7.github.io/sports-timeline-studio/ (after GitHub Pages is on, see below). On a phone, open it and use *Add to Home Screen* so it opens like an app.

## Cards (45)

The picker has shelves. Every card has two or three designs.

| Shelf | Cards |
| --- | --- |
| ক্রিকেট (cricket) | Cricket score, fifty, century, knock (X off Y, with a DUCK stamp on 0), big knock (bold), wicket, five-for, brilliant over, expensive over (ball by ball), score update, innings break (target worked out), match result + player of the match, result (bold), recent form (bar chart, 50+ highlighted), toss |
| টেস্ট (Test) | Test hundred, Test fifty, Test five-for, stumps / lunch / tea (two innings), Test result with series line |
| ফুটবল (football) | Football score, football XI on the pitch, goal, result (bold), red card, player rating (gauge), transfer (crest → crest), match day |
| খবর ও সাধারণ (news & general) | Instant news, breaking news, quote, did you know?, status (in the XI, ruled out…), hot take, record / achievement, photo frame |
| তুলনা (compare) | Player vs player (stats side by side or as bars, the better number highlighted; add ↓ to a stat where lower is better), who's better?, MVP / player of the month |
| দল ও টেবিল (teams & tables) | Playing XI list, squad, stats, top list, points table, fixtures |

Worked out for you: strike rate, economy, runs and wickets in an over, the chase target, form totals and average.

Every card works in three sizes: post 4:5 (1080×1350), square (1080×1080) and story/reels (1080×1920).

## Bangla or English

The switch at the top turns the studio panel and the poster to English (labels, example text, words printed on the poster, digits). *পোস্টারের ভাষা* in রং আর ফন্ট lets you mix them, for example a Bangla panel with an English poster. Bangla and English text are kept apart, so switching never loses what you typed.

## Things that happen on their own

- **Photos find their place.** *সব ছবি একসাথে দিন* (or drop / paste pictures on the poster) looks at each picture: a crest goes to a logo slot, a player to the cut-out slot, a match photo to the photo slot.
- **Background removal** for player photos (AI in the browser; needs internet the first time to download the model).
- **Crests** on a plain white/black background get that background removed, and their colour feeds the *দলের রং* theme.
- **News photos are cropped around the people** (detail + skin tone focus) and never cut off the top of a head.
- **Text always fits**: long headlines and lists shrink to their box. `*word*` colours a word.
- **Bangla digits**: type 2-1 and the poster shows ২-১ (switch in রং আর ফন্ট).
- **Logo corner and colour**: the logo goes to the calmest allowed corner and turns green on a light spot, white/gold on a busy photo.
- **Photo library**: save a player's photo once (*লাইব্রেরিতে রাখো*); next time his name is typed, the photo appears. Names on the football pitch card show faces from the library too.

Everything is still adjustable: click any part of the poster to drag it, size it (mouse wheel or − / +), centre it, remove it; undo with Ctrl+Z. The editor bar is one slim row; its move and size buttons appear only after you pick a part, and the help hides behind ⓘ. *পোস্টারে কী কী থাকবে* switches parts on and off.

## Themes and fonts

Themes: নিয়ন রাত (default), সানসেট, ওশান ব্লু, ব্রডকাস্ট লাল, সাদা মডার্ন, মিন্ট ফ্রেশ, টাইমলাইন সবুজ (the page's own green), সাদা-সবুজ, রয়্যাল নীল, দলের রং (from the crest), or your own background picture. Backgrounds are soft colour glows with a dot grid; the footer strip follows the theme.

Bangla fonts (all served from `fonts/`, OFL): Hind Siliguri, Anek Bangla, Tiro Bangla, Noto Serif Bengali, Galada, Baloo Da 2, Atma, Mina. Pick a one-tap pair, or set headline and body fonts separately, plus a headline size slider.

## Logo

The redesigned logo is vector (`brand/logo-stacked.svg`, `logo-wide.svg`, `logo-icon.svg`) with a timeline track under the wordmark. Its colours are CSS variables, so the studio can show it in brand colours, white, white + gold, green, black, gold or any custom pair. `brand/logo-colours.png` shows the options. To rebuild it: `pip install uharfbuzz fonttools brotli`, then `python3 tools/genlogo.py && python3 tools/genlogo.py --js`.

## Footer strip

Every poster can end with the page strip (slogan, page address, ফলো করুন, logo), a sponsor/ad banner image, or nothing.

## Turn on GitHub Pages (one time)

Settings → Pages → Source: *Deploy from a branch*, Branch: `main`, Folder: `/ (root)` → Save. The site is live a minute later and every push to `main` updates it.

## Files

| File | What it is |
| --- | --- |
| `js/cards.js`, `js/cards2.js` | The cards: fields, photo slots, layouts and how each one is drawn. New cards go here. |
| `js/i18n.js` | Bangla / English: panel words and English example text |
| `css/poster.css` | The poster look (themes come in as CSS variables) |
| `js/core.js` | Themes, fonts, logo colours, Bangla text helpers, photo analysis and placement, cut-out, crest cleanup, font embedding for the PNG |
| `js/app.js` | The studio page: form, photos, bulk drop, logo probe, editor, download, share, caption |
| `js/studio-edit.js` | Click/drag/size/undo editor (from the eFCOB Admin Studio) |
| `js/library.js` | Photo library on the device (from the Borhan Poster Studio) |
| `js/colors.js` | Cut-out cleanup helpers (from eFCOB) |
| `js/brand.js`, `brand/` | The logo |
| `lib/` | html-to-image (PNG export) and @imgly/background-removal |

## Add a card

Copy an entry in `js/cards.js`: give it an `id`, `name`, `layouts`, `fields`, `photos` and a `render(d, c)` that returns HTML. Wrap each movable part in `c.sec('key', html)` and place photos with `c.ph(i, x, y, w, h)`; text with `data-fit` shrinks to its box.
