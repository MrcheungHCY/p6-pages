/*! Fanned 4-card hand + draw pile — not quiz buttons */
(function (global) {
  'use strict';

  var root, handEl, locked = false, onPick = null, cards = [];

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function mount(container) {
    root = typeof container === 'string' ? document.querySelector(container) : container;
    root.innerHTML = '';
    var pile = el('div', 'draw-pile');
    pile.setAttribute('aria-hidden', 'true');
    pile.appendChild(el('div', 'back'));
    pile.appendChild(el('div', 'back'));
    pile.appendChild(el('div', 'back'));
    pile.appendChild(el('div', 'lbl', 'DECK'));
    handEl = el('div', 'hand');
    handEl.setAttribute('role', 'group');
    handEl.setAttribute('aria-label', 'Answer cards');
    root.appendChild(pile);
    root.appendChild(handEl);
    return root;
  }

  function clearHand() {
    if (handEl) handEl.innerHTML = '';
    cards = [];
  }

  function deal(hand, pickCb, item) {
    locked = false;
    onPick = pickCb;
    clearHand();
    var pips = ['♦', '♠', '♥', '♣'];
    hand.forEach(function (text, i) {
      var btn = el('button', 'card');
      btn.type = 'button';
      btn.setAttribute('data-i', String(i));
      var pip = el('div', 'pip', pips[i] + '  ' + (i + 1));
      var txt = el('div', 'txt');
      var inner = el('span', 'txt-inner');
      if (global.CastleHints && typeof global.CastleHints.html === 'function') {
        inner.innerHTML = global.CastleHints.html(text, item);
      } else {
        inner.textContent = text;
      }
      txt.appendChild(inner);
      if (String(text).length > 42) btn.classList.add('long-text');
      btn.appendChild(pip);
      btn.appendChild(txt);
      btn.addEventListener('click', function (ev) {
        ev.preventDefault();
        if (locked) return;
        if (typeof onPick === 'function') onPick(i, text, btn);
      });
      handEl.appendChild(btn);
      cards.push(btn);
    });
  }

  function lock() { locked = true; }

  function isLocked() { return locked; }

  function play(index, opts) {
    opts = opts || {};
    locked = true;
    cards.forEach(function (c, i) {
      if (i === index) {
        c.classList.add('played');
        if (opts.glow) c.classList.add('correct-glow');
        if (opts.shake) c.classList.add('wrong-shake');
      } else {
        c.classList.add('dim');
      }
    });
  }

  function revealCorrect(correctText) {
    cards.forEach(function (c) {
      var t = c.querySelector('.txt');
      if (t && t.textContent === correctText) {
        c.classList.remove('dim');
        c.classList.add('correct-glow');
      }
    });
  }

  function getCard(i) { return cards[i] || null; }

  global.CastleCards = {
    mount: mount,
    deal: deal,
    lock: lock,
    isLocked: isLocked,
    play: play,
    revealCorrect: revealCorrect,
    getCard: getCard,
    clear: clearHand
  };
})(typeof window !== 'undefined' ? window : globalThis);
