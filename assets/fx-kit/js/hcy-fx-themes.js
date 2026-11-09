/*! HCY FX — demo style packs registry + font CDN + localStorage (IIFE).
 *  Kit + demo only. Does not wire into games. */
(function (global) {
  'use strict';

  var STORAGE_STYLE = 'hcy-fx-style';
  var STORAGE_MODE = 'hcy-fx-mascot-mode';
  var DEFAULT_STYLE = 'legacy';
  var DEFAULT_MODE = '3d';

  /** SIL/OFL Google Fonts used by packs — document in README */
  var FONT_CDN =
    'https://fonts.googleapis.com/css2?' +
    [
      'family=Black+Ops+One',
      'family=Changa+One',
      'family=Bangers',
      'family=Fredoka:wght@400;600;700',
      'family=Lobster',
      'family=Oswald:wght@500;700',
      'family=Outfit:wght@600;800',
      'family=Nunito:wght@400;700;800',
      'family=Quicksand:wght@500;700',
      'family=M+PLUS+Rounded+1c:wght@500;700;800',
      'family=Zen+Maru+Gothic:wght@500;700',
      'family=Yusei+Magic',
      'family=Reggae+One',
      'family=Noto+Sans+JP:wght@400;700',
      'family=IBM+Plex+Sans+JP:wght@500;700'
    ].join('&') +
    '&display=swap';

  var PACKS = [
    { id: '01-jp-kawaii-shop', group: 'jp', label: 'Kawaii Shop', fonts: 'M PLUS Rounded 1c / Nunito' },
    { id: '02-jp-retro-game', group: 'jp', label: 'Retro Game', fonts: 'Yusei Magic / Noto Sans JP' },
    { id: '03-jp-ukiyo-pop', group: 'jp', label: 'Ukiyo Pop', fonts: 'Zen Maru Gothic / Noto Sans JP' },
    { id: '04-jp-stationery', group: 'jp', label: 'Stationery', fonts: 'M PLUS Rounded / Quicksand' },
    { id: '05-jp-matsuri', group: 'jp', label: 'Matsuri', fonts: 'Reggae One / Noto Sans JP' },
    { id: '06-us-saturday-cartoon', group: 'us', label: 'Sat Cartoon', fonts: 'Bangers / Fredoka' },
    { id: '07-us-comic-book', group: 'us', label: 'Comic Book', fonts: 'Bangers / Oswald' },
    { id: '08-us-diner-neon', group: 'us', label: 'Diner Neon', fonts: 'Lobster / Nunito' },
    { id: '09-us-campus-sports', group: 'us', label: 'Campus Sports', fonts: 'Oswald / Nunito' },
    { id: '10-us-skate-sticker', group: 'us', label: 'Skate Sticker', fonts: 'Outfit / Nunito' },
    { id: '11-ja-neo-tokyo-arcade', group: 'ja', label: 'Neo-Tokyo Arcade', fonts: 'Black Ops One / Nunito' },
    { id: '12-ja-japantown-cafe', group: 'ja', label: 'Japantown Café', fonts: 'M PLUS Rounded / Quicksand' },
    { id: '13-ja-90s-sat-cartoon', group: 'ja', label: '90s Sat Cartoon', fonts: 'Bangers / Fredoka' },
    { id: '14-ja-origami-streetwear', group: 'ja', label: 'Origami Streetwear', fonts: 'Outfit / IBM Plex Sans JP' },
    { id: '15-ja-festival-float', group: 'ja', label: 'Festival Float', fonts: 'Reggae One / Nunito' },
    { id: 'legacy', group: 'legacy', label: 'Legacy pastel', fonts: 'system / Noto TC' }
  ];

  var GROUPS = [
    { id: 'jp', label: 'Japanese' },
    { id: 'us', label: 'American' },
    { id: 'ja', label: 'JP × US' },
    { id: 'legacy', label: 'Legacy' }
  ];

  var fontsLoaded = false;
  var currentStyle = DEFAULT_STYLE;
  var currentMode = DEFAULT_MODE;
  var listeners = [];

  function kitRoot() {
    try {
      var scripts = document.getElementsByTagName('script');
      for (var i = scripts.length - 1; i >= 0; i--) {
        var src = scripts[i].src || '';
        if (/hcy-fx-themes\.js/i.test(src)) {
          return src.replace(/[^/]+$/, '').replace(/js\/$/, '');
        }
      }
    } catch (e) {}
    return '';
  }

  function artBaseFor(styleId) {
    var root = kitRoot();
    if (!styleId || styleId === 'legacy') return root + 'mascot/';
    return root + 'styles/' + styleId + '/mascot/';
  }

  function ensureFonts() {
    if (fontsLoaded) return;
    fontsLoaded = true;
    if (document.getElementById('hcy-fx-google-fonts')) return;
    var link = document.createElement('link');
    link.id = 'hcy-fx-google-fonts';
    link.rel = 'stylesheet';
    link.href = FONT_CDN;
    (document.head || document.documentElement).appendChild(link);
  }

  function readStored(key, fallback) {
    try {
      var v = global.localStorage && localStorage.getItem(key);
      return v != null && v !== '' ? v : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function writeStored(key, val) {
    try {
      if (global.localStorage) localStorage.setItem(key, val);
    } catch (e) {}
  }

  function findPack(id) {
    for (var i = 0; i < PACKS.length; i++) if (PACKS[i].id === id) return PACKS[i];
    return PACKS[PACKS.length - 1];
  }

  function notify() {
    var payload = {
      style: currentStyle,
      mode: currentMode,
      artBase: artBaseFor(currentStyle),
      pack: findPack(currentStyle)
    };
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](payload); } catch (e) {}
    }
  }

  function applyCss(styleId) {
    var html = document.documentElement;
    if (!styleId || styleId === 'legacy') {
      html.setAttribute('data-hcy-style', 'legacy');
    } else {
      html.setAttribute('data-hcy-style', styleId);
    }
    if (document.body) document.body.classList.add('hcy-demo-themed');
  }

  function syncMascotArt() {
    var base = artBaseFor(currentStyle);
    var Mas = global.HcyFxMascot;
    if (Mas && typeof Mas.reloadArt === 'function') {
      try { Mas.reloadArt({ base: base, mode: currentMode }); } catch (e) {}
    }
    var T = global.HcyFxThree;
    if (T && typeof T.setMascotMode === 'function') {
      try { T.setMascotMode(currentMode); } catch (e) {}
    }
    if (T && typeof T.setMascotArtBase === 'function') {
      try { T.setMascotArtBase(base); } catch (e) {}
    }
  }

  function setStyle(styleId, opts) {
    opts = opts || {};
    var pack = findPack(styleId);
    currentStyle = pack.id;
    ensureFonts();
    applyCss(currentStyle);
    if (!opts.skipStore) writeStored(STORAGE_STYLE, currentStyle);
    syncMascotArt();
    notify();
    return currentStyle;
  }

  function setMode(mode, opts) {
    opts = opts || {};
    currentMode = mode === '2d' ? '2d' : '3d';
    if (!opts.skipStore) writeStored(STORAGE_MODE, currentMode);
    var Mas = global.HcyFxMascot;
    if (Mas && typeof Mas.setRenderMode === 'function') {
      try { Mas.setRenderMode(currentMode); } catch (e) {}
    }
    var T = global.HcyFxThree;
    if (T && typeof T.setMascotMode === 'function') {
      try { T.setMascotMode(currentMode); } catch (e) {}
    }
    syncMascotArt();
    notify();
    return currentMode;
  }

  function init(opts) {
    opts = opts || {};
    ensureFonts();
    currentStyle = opts.style || readStored(STORAGE_STYLE, DEFAULT_STYLE);
    currentMode = opts.mode || readStored(STORAGE_MODE, DEFAULT_MODE);
    if (currentMode !== '2d' && currentMode !== '3d') currentMode = DEFAULT_MODE;
    if (!findPack(currentStyle)) currentStyle = DEFAULT_STYLE;
    applyCss(currentStyle);
    // Defer mascot sync until other scripts init
    setTimeout(function () {
      syncMascotArt();
      notify();
    }, 0);
    return api;
  }

  function mountPicker(host) {
    host = typeof host === 'string' ? document.querySelector(host) : host;
    if (!host) return null;
    host.classList.add('hcy-style-picker');
    host.innerHTML = '';
    var title = document.createElement('strong');
    title.textContent = 'Style pack';
    host.appendChild(title);

    GROUPS.forEach(function (g) {
      var packs = PACKS.filter(function (p) { return p.group === g.id; });
      if (!packs.length) return;
      var lab = document.createElement('div');
      lab.className = 'hcy-style-group-label';
      lab.textContent = g.label;
      host.appendChild(lab);
      var row = document.createElement('div');
      row.className = 'hcy-style-row';
      packs.forEach(function (p) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'hcy-style-btn' + (p.id === currentStyle ? ' is-active' : '');
        btn.setAttribute('data-style', p.id);
        btn.title = p.fonts;
        btn.textContent = p.label;
        btn.onclick = function () {
          setStyle(p.id);
          var all = host.querySelectorAll('.hcy-style-btn');
          for (var i = 0; i < all.length; i++) {
            all[i].classList.toggle('is-active', all[i].getAttribute('data-style') === currentStyle);
          }
        };
        row.appendChild(btn);
      });
      host.appendChild(row);
    });

    var modeWrap = document.createElement('div');
    modeWrap.className = 'hcy-mode-toggle';
    var modeLab = document.createElement('span');
    modeLab.style.fontWeight = '800';
    modeLab.textContent = 'Mascot:';
    modeWrap.appendChild(modeLab);
    ['3d', '2d'].forEach(function (m) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('data-mode', m);
      b.textContent = m.toUpperCase();
      b.className = m === currentMode ? 'is-active' : '';
      b.onclick = function () {
        setMode(m);
        var all = modeWrap.querySelectorAll('button[data-mode]');
        for (var i = 0; i < all.length; i++) {
          all[i].classList.toggle('is-active', all[i].getAttribute('data-mode') === currentMode);
        }
      };
      modeWrap.appendChild(b);
    });
    host.appendChild(modeWrap);
    return host;
  }

  var api = {
    PACKS: PACKS,
    GROUPS: GROUPS,
    FONT_CDN: FONT_CDN,
    init: init,
    setStyle: setStyle,
    setMode: setMode,
    getStyle: function () { return currentStyle; },
    getMode: function () { return currentMode; },
    artBaseFor: artBaseFor,
    ensureFonts: ensureFonts,
    mountPicker: mountPicker,
    onChange: function (fn) { if (typeof fn === 'function') listeners.push(fn); return api; }
  };

  global.HcyFxThemes = api;
})(typeof window !== 'undefined' ? window : this);
