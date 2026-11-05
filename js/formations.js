/* Football formations for the XI-on-the-pitch card. Each formation is its lines from the back to the front, every line
   written left to right with the usual position names. ST.formationSlots(name) turns one into eleven spots:
   { pos, x, y } with x 0..1 across the pitch (left to right) and y 0..1 from the attack (top) to our own goal (bottom).
   Players are typed in the same order: keeper first, then the back line left to right, and so on to the forwards. */
(function () {
  const B4 = 'LB CB CB RB', B3 = 'CB CB CB', B5 = 'LWB CB CB CB RWB';
  const F = [
    ['4-4-2', [B4, 'LM CM CM RM', 'ST ST']],
    ['4-4-2D', [B4, 'DM', 'CM CM', 'AM', 'ST ST'], '4-4-2 ডায়মন্ড ~ 4-4-2 diamond'],
    ['4-4-1-1', [B4, 'LM CM CM RM', 'SS', 'ST']],
    ['4-3-3', [B4, 'CM CM CM', 'LW CF RW']],
    ['4-1-2-3', [B4, 'DM', 'CM CM', 'LW CF RW'], '4-3-3 (হোল্ডিং) / 4-1-2-3 ~ 4-3-3 (holding) / 4-1-2-3'],
    ['4-2-1-3', [B4, 'DM DM', 'AM', 'LW CF RW'], '4-3-3 (অ্যাটাকিং) / 4-2-1-3 ~ 4-3-3 (attacking) / 4-2-1-3'],
    ['4-2-3-1', [B4, 'DM DM', 'LW AM RW', 'CF']],
    ['4-2-2-2', [B4, 'DM DM', 'AM AM', 'ST ST']],
    ['4-1-4-1', [B4, 'DM', 'LM CM CM RM', 'CF']],
    ['4-5-1', [B4, 'LM CM CM CM RM', 'CF']],
    ['4-3-2-1', [B4, 'CM CM CM', 'AM AM', 'CF']],
    ['4-3-1-2', [B4, 'CM CM CM', 'AM', 'ST ST']],
    ['4-1-3-2', [B4, 'DM', 'LM CM RM', 'ST ST']],
    ['4-2-4', [B4, 'CM CM', 'LW ST ST RW']],
    ['3-5-2', [B3, 'LWB CM CM CM RWB', 'ST ST']],
    ['3-4-3', [B3, 'LWB CM CM RWB', 'LW CF RW']],
    ['3-4-1-2', [B3, 'LWB CM CM RWB', 'AM', 'ST ST']],
    ['3-4-2-1', [B3, 'LWB CM CM RWB', 'AM AM', 'CF']],
    ['3-1-4-2', [B3, 'DM', 'LWB CM CM RWB', 'ST ST']],
    ['3-5-1-1', [B3, 'LWB CM CM CM RWB', 'SS', 'ST']],
    ['5-3-2', [B5, 'CM CM CM', 'ST ST']],
    ['5-4-1', [B5, 'LM CM CM RM', 'CF']],
    ['5-2-3', [B5, 'CM CM', 'LW CF RW']],
    ['5-2-1-2', [B5, 'CM CM', 'AM', 'ST ST']],
  ];
  ST.FORMATIONS = Object.fromEntries(F.map(([k, rows, label]) => [k, { rows: rows.map(r => r.split(' ')), label: label || k }]));
  // for a select field: "4-3-3=4-3-3,4-4-2D=4-4-2 ডায়মন্ড ~ 4-4-2 diamond,…"
  ST.formationOptions = () => F.map(([k, , label]) => `${k}=${label || k}`).join(',');

  const WIDE = /^(L|R)(B|WB|M|W)$/;
  // x of the j-th of n players in a line; wide players (LB, RW…) go out to the touchline
  const spread = { 1: [.5], 2: [.34, .66], 3: [.22, .5, .78], 4: [.11, .37, .63, .89], 5: [.08, .29, .5, .71, .92] };
  ST.formationSlots = name => {
    let f = ST.FORMATIONS[name];
    if (!f) {
      // anything else that looks like a formation ("4-6-0", "3 3 4"): plain lines of that many players
      const n = String(ST.enDigits ? ST.enDigits(name || '') : name || '').split(/[^0-9]+/).map(Number).filter(v => v > 0);
      f = n.length && n.reduce((a, b) => a + b, 0) === 10 ? { rows: n.map((k, r) => Array(k).fill(r ? (r === n.length - 1 ? 'ST' : 'CM') : 'CB')) } : ST.FORMATIONS['4-3-3'];
    }
    const R = f.rows.length, out = [{ pos: 'GK', x: .5, y: .97 }];
    f.rows.forEach((row, r) => {
      const y0 = .76 - r * (.7 / Math.max(1, R - 1)), xs = spread[row.length] || row.map((_, j) => (j + .5) / row.length);
      const top = r === R - 1, hasMid = row.some(p => !WIDE.test(p));
      row.forEach((pos, j) => {
        let x = xs[j], y = y0;
        if (WIDE.test(pos)) {
          if (row.length <= 3) x = pos[0] === 'L' ? .12 : .88;
          if (pos.endsWith('B') && r === 0) y -= pos === 'LB' || pos === 'RB' ? .035 : .075;   // full-backs and wing-backs push up
          if (pos.endsWith('W') && hasMid) y += top ? .06 : -.03;                              // wingers sit a little off the striker
        }
        out.push({ pos, x, y });
      });
    });
    return out;
  };
  // "LW: Rakib" or "Rakib (LW)" picks the position by hand
  const POS = 'GK|LB|RB|CB|LCB|RCB|LWB|RWB|DM|CDM|CM|LCM|RCM|LM|RM|AM|CAM|LW|RW|SS|CF|ST';
  ST.posOverride = name => {
    let m = new RegExp(`^(${POS})\\s*[:：–-]\\s*(.+)$`, 'i').exec(name);
    if (m) return { pos: m[1].toUpperCase(), name: m[2].trim() };
    m = new RegExp(`^(.+?)\\s*\\((${POS})\\)$`, 'i').exec(name);
    if (m) return { pos: m[2].toUpperCase(), name: m[1].trim() };
    return null;
  };
})();
