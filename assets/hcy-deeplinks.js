/*! HCY deep-link bridge — relative targets from common game folders (depth 4 under LM) */
(function (global) {
  'use strict';
  /**
   * Default map assumes caller is at: P.6/<unit>/html/<game>/index.html
   * i.e. ../../../../ reaches LM root. Callers at Grammar-Pronouns/html/*.html
   * should pass { base: '../../../' } or use resolve(path, base).
   */
  var DEFAULTS = {
    T01: '../../../../Grammar – Conditionals/html/Conditionals-Website-v2/index.html',
    T01_FIRST: '../../../../Grammar – Conditionals/html/Conditionals-Website-v2/index.html#first-conditional',
    T01_ZERO: '../../../../Grammar – Conditionals/html/Conditionals-Website-v2/index.html#zero-conditional',
    T02: '../../../../Unit 3 – Weather and Disasters/html/Hurricane-Typhoon-Tsunami/index.html',
    T03: '../../../../Unit 3 – Weather and Disasters/html/Quotes-Emotions-Card/index.html',
    G18: '../../../../Music – 牧童笛/html/牧童笛-容易歌兩首/index.html',
    G19: '../../../../Music – 牧童笛/html/牧童笛-指法教室/index.html',
    G10: '../../../../Unit 3 – Weather and Disasters/html/Zero-First-Conditionals-Game/index.html',
    G11: '../../../../Unit 3 – Weather and Disasters/html/weather-vocab-game/index.html'
  };

  /* From Unit 3 html/game folder, T01 needs to go up to P.6 then into Grammar */
  var FROM_U3_GAME = {
    T01: '../../../Grammar – Conditionals/html/Conditionals-Website-v2/index.html',
    T01_FIRST: '../../../Grammar – Conditionals/html/Conditionals-Website-v2/index.html#first-conditional',
    T01_ZERO: '../../../Grammar – Conditionals/html/Conditionals-Website-v2/index.html#zero-conditional',
    T02: '../Hurricane-Typhoon-Tsunami/index.html',
    T03: '../Quotes-Emotions-Card/index.html'
  };

  var FROM_REV13_GAME = {
    T01: '../../../Grammar – Conditionals/html/Conditionals-Website-v2/index.html',
    T01_FIRST: '../../../Grammar – Conditionals/html/Conditionals-Website-v2/index.html#first-conditional'
  };

  function resolve(key, preset) {
    var map = DEFAULTS;
    if (preset === 'u3') map = Object.assign({}, DEFAULTS, FROM_U3_GAME);
    if (preset === 'rev13') map = Object.assign({}, DEFAULTS, FROM_REV13_GAME);
    return map[key] || key;
  }

  function open(key, preset) {
    var url = resolve(key, preset);
    try { global.open(url, '_blank'); } catch (e) { location.href = url; }
  }

  function mountButton(parent, opts) {
    opts = opts || {};
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = opts.className || 'hcy-deeplink-btn';
    btn.textContent = opts.label || '📖 Review lesson';
    btn.title = opts.title || opts.key || 'Open teaching site';
    btn.style.cssText = opts.style ||
      'margin:4px;padding:.4em .75em;border-radius:10px;border:2px solid #333;background:#fff;font-weight:800;cursor:pointer';
    btn.onclick = function () {
      open(opts.key || 'T01', opts.preset);
    };
    if (parent) parent.appendChild(btn);
    return btn;
  }

  global.HCY_DEEPLINKS = {
    DEFAULTS: DEFAULTS,
    resolve: resolve,
    open: open,
    mountButton: mountButton
  };
})(typeof window !== 'undefined' ? window : globalThis);
