/*! HCY OCR helper — prefer local Tesseract assets under _assets/ocr/
 * Versions: tesseract.js@5.1.1, tesseract.js-core@5.1.1, @tesseract.js-data/eng eng.traineddata.gz
 * API: HCY_OCR.createWorker(baseHref), acceptAnyway(hook), tileKeyboard(parent, opts)
 */
(function (global) {
  'use strict';

  function join(base, file) {
    if (!base) return file;
    return base.replace(/\/?$/, '/') + file;
  }

  /** baseHref should point at .../_assets/ocr/ relative to the game page */
  function createLocalPaths(baseHref) {
    return {
      workerPath: join(baseHref, 'worker.min.js'),
      corePath: join(baseHref, 'tesseract-core.wasm.js'),
      langPath: baseHref.replace(/\/?$/, '/')
    };
  }

  var _acceptHook = null;
  function acceptAnyway(fn) {
    if (typeof fn === 'function') _acceptHook = fn;
    return _acceptHook;
  }

  function fireAccept(payload) {
    if (typeof _acceptHook === 'function') _acceptHook(payload);
    try {
      document.dispatchEvent(new CustomEvent('hcy-ocr-accept', { detail: payload || {} }));
    } catch (e) {}
  }

  /**
   * Inject ✓ Accept Anyway into an OCR result container.
   * container: element; onAccept(fn) called with { text }.
   */
  function mountAcceptButton(container, opts) {
    opts = opts || {};
    if (!container) return null;
    var existing = container.querySelector('.hcy-ocr-accept');
    if (existing) existing.parentNode.removeChild(existing);
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'hcy-ocr-accept';
    btn.textContent = opts.label || '✓ Accept Anyway';
    btn.title = 'Teacher override — award credit despite OCR mismatch';
    btn.style.cssText = opts.style ||
      'margin-top:8px;padding:.5em 1em;border-radius:10px;border:0;background:#3D8B5A;color:#fff;font-weight:800;cursor:pointer;width:100%';
    btn.onclick = function () {
      var text = opts.getText ? opts.getText() : (opts.text || '');
      fireAccept({ text: text, override: true });
      if (typeof opts.onAccept === 'function') opts.onAccept({ text: text, override: true });
    };
    container.appendChild(btn);
    return btn;
  }

  /** Simple tile keyboard fallback for letter-by-letter entry */
  function tileKeyboard(parent, opts) {
    opts = opts || {};
    var target = (opts.target || '').toLowerCase();
    var letters = opts.letters || (target ? target.replace(/[^a-z]/g, '').split('') : 'abcdefghijklmnopqrstuvwxyz'.split(''));
    // scramble copy for pool
    var pool = letters.slice();
    for (var i = pool.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = pool[i]; pool[i] = pool[j]; pool[j] = t;
    }
    // unique alphabet if no target
    if (!opts.letters && !target) pool = 'abcdefghijklmnopqrstuvwxyz'.split('');

    var root = document.createElement('div');
    root.className = 'hcy-ocr-tiles';
    root.style.cssText = 'margin-top:10px;padding:8px;border-radius:12px;background:#fff;border:2px solid #ccc';
    var built = document.createElement('div');
    built.style.cssText = 'min-height:2em;font-size:1.4em;font-weight:900;letter-spacing:.08em;margin-bottom:8px;text-align:center';
    built.textContent = '';
    var row = document.createElement('div');
    row.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;justify-content:center';
    var value = [];

    function sync() {
      built.textContent = value.join('') || '…';
      if (typeof opts.onChange === 'function') opts.onChange(value.join(''));
    }

    pool.forEach(function (ch, idx) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = ch;
      b.dataset.i = idx;
      b.style.cssText = 'width:2.2em;height:2.2em;border-radius:8px;border:2px solid #333;background:#FFF9F4;font-weight:900;cursor:pointer';
      b.onclick = function () {
        if (b.disabled) return;
        value.push(ch);
        b.disabled = true;
        b.style.opacity = '.35';
        sync();
      };
      row.appendChild(b);
    });

    var actions = document.createElement('div');
    actions.style.cssText = 'display:flex;gap:8px;justify-content:center;margin-top:8px';
    var back = document.createElement('button');
    back.type = 'button';
    back.textContent = '⌫';
    back.onclick = function () {
      if (!value.length) return;
      value.pop();
      // re-enable one matching tile (last disabled of that letter)
      var buttons = row.querySelectorAll('button');
      for (var i = buttons.length - 1; i >= 0; i--) {
        if (buttons[i].disabled && buttons[i].textContent === (value[value.length] /* noop */)) { /* skip */ }
      }
      // simpler: reset all and rebuild from value
      var need = value.slice();
      value = [];
      Array.prototype.forEach.call(row.querySelectorAll('button'), function (btn) {
        btn.disabled = false; btn.style.opacity = '1';
      });
      need.forEach(function (ch) {
        var buttons = row.querySelectorAll('button');
        for (var i = 0; i < buttons.length; i++) {
          if (!buttons[i].disabled && buttons[i].textContent === ch) {
            buttons[i].disabled = true; buttons[i].style.opacity = '.35';
            value.push(ch); break;
          }
        }
      });
      sync();
    };
    var clear = document.createElement('button');
    clear.type = 'button';
    clear.textContent = 'Clear';
    clear.onclick = function () {
      value = [];
      Array.prototype.forEach.call(row.querySelectorAll('button'), function (btn) {
        btn.disabled = false; btn.style.opacity = '1';
      });
      sync();
    };
    actions.appendChild(back);
    actions.appendChild(clear);

    root.appendChild(built);
    root.appendChild(row);
    root.appendChild(actions);
    if (parent) parent.appendChild(root);
    sync();
    return {
      el: root,
      get: function () { return value.join(''); },
      destroy: function () { if (root.parentNode) root.parentNode.removeChild(root); }
    };
  }

  /**
   * Prefer local worker when Tesseract global exists.
   * Returns options object for Tesseract.recognize / createWorker.
   */
  function localWorkerOptions(baseHref) {
    var paths = createLocalPaths(baseHref);
    return {
      workerPath: paths.workerPath,
      corePath: paths.corePath,
      langPath: paths.langPath,
      logger: function () {}
    };
  }

  global.HCY_OCR = {
    createLocalPaths: createLocalPaths,
    localWorkerOptions: localWorkerOptions,
    acceptAnyway: acceptAnyway,
    fireAccept: fireAccept,
    mountAcceptButton: mountAcceptButton,
    tileKeyboard: tileKeyboard,
    VERSION: {
      tesseract: '5.1.1',
      core: '5.1.1',
      eng: 'eng.traineddata.gz (tessdata 4.0.0 via @tesseract.js-data/eng)'
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
