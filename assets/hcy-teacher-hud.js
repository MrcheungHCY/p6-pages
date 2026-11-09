/*! HCY Teacher HUD — mute, fullscreen, font zoom, blitz presets */
(function (global) {
  'use strict';
  var state = { muted: false, zoom: 1 };

  function cssHref() {
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
      var s = scripts[i].src || '';
      if (/hcy-teacher-hud\.js/.test(s)) return s.replace(/hcy-teacher-hud\.js.*$/, 'hcy-teacher-hud.css');
    }
    return null;
  }

  function ensureCss() {
    if (document.getElementById('hcy-teacher-hud-css')) return;
    var href = cssHref();
    if (!href) return;
    var link = document.createElement('link');
    link.id = 'hcy-teacher-hud-css';
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  function applyZoom() {
    try { document.documentElement.style.fontSize = (state.zoom * 100) + '%'; } catch (e) {}
  }

  function mount(opts) {
    opts = opts || {};
    ensureCss();
    var old = document.getElementById('hcy-teacher-hud');
    if (old) old.parentNode.removeChild(old);
    var bar = document.createElement('div');
    bar.id = 'hcy-teacher-hud';
    bar.setAttribute('role', 'toolbar');
    bar.setAttribute('aria-label', 'Teacher controls');

    function btn(label, title, fn) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.title = title || label;
      b.onclick = fn;
      bar.appendChild(b);
      return b;
    }

    var muteBtn = btn('🔊', 'Mute / unmute', function () {
      state.muted = !state.muted;
      muteBtn.textContent = state.muted ? '🔇' : '🔊';
      muteBtn.classList.toggle('on', state.muted);
      try {
        if (state.muted && global.speechSynthesis) global.speechSynthesis.cancel();
      } catch (e) {}
      if (typeof opts.onMute === 'function') opts.onMute(state.muted);
      document.documentElement.classList.toggle('hcy-muted', state.muted);
    });

    btn('⛶', 'Fullscreen', function () {
      var el = document.documentElement;
      if (!document.fullscreenElement) {
        if (el.requestFullscreen) el.requestFullscreen();
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
      }
    });

    btn('A−', 'Smaller text', function () {
      state.zoom = Math.max(0.75, Math.round((state.zoom - 0.1) * 10) / 10);
      applyZoom();
    });
    btn('A+', 'Larger text', function () {
      state.zoom = Math.min(1.6, Math.round((state.zoom + 0.1) * 10) / 10);
      applyZoom();
    });

    if (opts.presets !== false) {
      var lab = document.createElement('span');
      lab.className = 'hcy-hud-label';
      lab.textContent = 'Blitz';
      bar.appendChild(lab);
      [10, 15, 25, 50].forEach(function (n) {
        btn(String(n), n + ' questions', function () {
          if (typeof opts.onPreset === 'function') opts.onPreset(n);
          try {
            document.dispatchEvent(new CustomEvent('hcy-hud-preset', { detail: { n: n } }));
          } catch (e) {}
        });
      });
    }

    document.body.appendChild(bar);
    return {
      el: bar,
      state: state,
      destroy: function () { if (bar.parentNode) bar.parentNode.removeChild(bar); }
    };
  }

  global.HCY_HUD = { mount: mount, state: state };

  function auto() {
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
      var s = scripts[i];
      if (s.src && /hcy-teacher-hud\.js/.test(s.src) && s.getAttribute('data-auto') === '1') {
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', function () { mount({}); });
        } else mount({});
        break;
      }
    }
  }
  auto();
})(typeof window !== 'undefined' ? window : globalThis);
