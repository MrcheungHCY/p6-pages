/*! HCY touch ergonomics — Left/Right zones, A/S/D vs J/K/L, chip-builder stub */
(function (global) {
  'use strict';
  var KEYMAP = {
    left: { a: 0, s: 1, d: 2, A: 0, S: 1, D: 2 },
    right: { j: 0, k: 1, l: 2, J: 0, K: 1, L: 2 }
  };

  function mountZones(opts) {
    opts = opts || {};
    var existing = document.getElementById('hcy-touch-zones');
    if (existing) existing.parentNode.removeChild(existing);
    var wrap = document.createElement('div');
    wrap.id = 'hcy-touch-zones';
    wrap.className = 'hcy-touch-zones' + (opts.on ? ' on' : '');
    wrap.innerHTML =
      '<div class="hcy-touch-zone left" data-side="left">' + (opts.leftLabel || 'TEAM A · tap') + '</div>' +
      '<div class="hcy-touch-zone right" data-side="right">' + (opts.rightLabel || 'TEAM B · tap') + '</div>';
    document.body.appendChild(wrap);
    function fire(side, e) {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      if (typeof opts.onTap === 'function') opts.onTap(side, e);
      try {
        document.dispatchEvent(new CustomEvent('hcy-touch', { detail: { side: side } }));
      } catch (err) {}
    }
    wrap.querySelector('.left').addEventListener('pointerdown', function (e) { fire('left', e); });
    wrap.querySelector('.right').addEventListener('pointerdown', function (e) { fire('right', e); });
    return {
      el: wrap,
      show: function () { wrap.classList.add('on'); },
      hide: function () { wrap.classList.remove('on'); },
      destroy: function () { if (wrap.parentNode) wrap.parentNode.removeChild(wrap); }
    };
  }

  function bindErgonomicKeys(handler) {
    function onKey(e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      var t = e.target && e.target.tagName;
      if (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT') return;
      var side = null, idx = null;
      if (KEYMAP.left[e.key] != null) { side = 'left'; idx = KEYMAP.left[e.key]; }
      else if (KEYMAP.right[e.key] != null) { side = 'right'; idx = KEYMAP.right[e.key]; }
      if (side == null) return;
      e.preventDefault();
      if (typeof handler === 'function') handler(side, idx, e);
    }
    document.addEventListener('keydown', onKey);
    return function unbind() { document.removeEventListener('keydown', onKey); };
  }

  /** Stub chip builder: opts.chips = string[], opts.onComplete(slots) */
  function chipBuilder(parent, opts) {
    opts = opts || {};
    var chips = (opts.chips || []).slice();
    var slotsNeeded = opts.slots || chips.length;
    var root = document.createElement('div');
    root.className = 'hcy-chip-builder';
    var slotRow = document.createElement('div');
    slotRow.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:8px';
    var chipRow = document.createElement('div');
    chipRow.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;justify-content:center';
    var filled = [];
    function render() {
      slotRow.innerHTML = '';
      for (var i = 0; i < slotsNeeded; i++) {
        var s = document.createElement('div');
        s.className = 'slot';
        s.textContent = filled[i] || '·';
        s.dataset.i = i;
        s.onclick = (function (ix) {
          return function () {
            if (filled[ix] == null) return;
            filled.splice(ix, 1);
            render();
          };
        })(i);
        slotRow.appendChild(s);
      }
      chipRow.innerHTML = '';
      chips.forEach(function (c) {
        var used = filled.indexOf(c) >= 0 && !opts.allowDup;
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'chip' + (used ? ' used' : '');
        b.textContent = c;
        b.disabled = !!used;
        b.onclick = function () {
          if (filled.length >= slotsNeeded) return;
          filled.push(c);
          render();
          if (filled.length === slotsNeeded && typeof opts.onComplete === 'function') {
            opts.onComplete(filled.slice());
          }
        };
        chipRow.appendChild(b);
      });
    }
    root.appendChild(slotRow);
    root.appendChild(chipRow);
    if (parent) parent.appendChild(root);
    render();
    return { el: root, get: function () { return filled.slice(); }, reset: function () { filled = []; render(); } };
  }

  global.HCY_TOUCH = {
    KEYMAP: KEYMAP,
    mountZones: mountZones,
    bindErgonomicKeys: bindErgonomicKeys,
    chipBuilder: chipBuilder
  };
})(typeof window !== 'undefined' ? window : globalThis);
