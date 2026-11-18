/*! Underground Castle Boss — screen flow, fight loop, animations, self-test */
(function (global) {
  'use strict';

  var CHAR_BASE = '../../../assets/character-library/';
  var BOSS_ID = 'char-010';
  var BOSS_NAME = 'Crystal Golem';
  var ANIM_MS = 2400;

  var party = [];
  var combat = null;
  var currentItem = null;
  var activeIndex = 0;
  var timerRaf = 0;
  var misses = [];
  var fxReady = false;
  var resolveBusy = false;
  var timerSec = 12;
  var countsInfo = null;

  function $(sel) { return document.querySelector(sel); }
  function $all(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  function charUrl(id) {
    if (global.HCY_CHARS && HCY_CHARS.url) return HCY_CHARS.url(id, CHAR_BASE);
    return CHAR_BASE + 'png/' + id + '.png';
  }

  function charMeta(id) {
    return (global.HCY_CHARS && HCY_CHARS.byId && HCY_CHARS.byId[id]) || { id: id, role: '', tags: '' };
  }

  function prettyRole(c) {
    var tags = String(c.tags || '').split(',')[0];
    var role = c.role || tags || c.id;
    return String(role).replace(/-/g, ' ');
  }

  function showScreen(id) {
    $all('.screen').forEach(function (s) { s.classList.toggle('active', s.id === id); });
  }

  function initFx() {
    if (fxReady || !global.HcyFx) return;
    try {
      HcyFx.init({
        intensity: 1,
        shakeTarget: $('#app'),
        mascotMode: '2d'
      });
      var slot = document.getElementById('hcy-mascot-slot');
      if (slot) slot.style.display = 'none';
      if (global.HcyFxThree && HcyFxThree.setMascotMode) {
        try { HcyFxThree.setMascotMode('2d'); } catch (e2) {}
      }
      fxReady = true;
    } catch (e) {
      console.warn('[CastleBoss] HcyFx.init failed', e);
    }
    document.body.addEventListener('pointerdown', function () {
      try { if (global.HcyFxAudio) HcyFxAudio.unlock(); } catch (err) {}
    }, { once: true });
  }

  function eligibleParty() {
    var list = (global.HCY_CHARS && HCY_CHARS.list) || [];
    return list.filter(function (c) { return c && c.role !== 'boss'; });
  }

  /* ---------- picker ---------- */
  function renderPicker() {
    var grid = $('#picker-grid');
    grid.innerHTML = '';
    eligibleParty().forEach(function (c) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'char-pick';
      btn.setAttribute('data-char', c.id);
      btn.title = c.id + ' · ' + prettyRole(c);
      var img = document.createElement('img');
      img.src = charUrl(c.id);
      img.alt = prettyRole(c);
      img.loading = 'lazy';
      img.width = 84;
      img.height = 84;
      btn.appendChild(img);
      var role = document.createElement('div');
      role.className = 'role';
      role.textContent = prettyRole(c);
      btn.appendChild(role);
      btn.addEventListener('click', function () { toggleChar(c.id); });
      grid.appendChild(btn);
    });
    syncPicker();
  }

  function toggleChar(id) {
    var i = party.indexOf(id);
    if (i >= 0) {
      party.splice(i, 1);
    } else if (party.length < 4) {
      if (charMeta(id).role === 'boss') return;
      party.push(id);
    } else {
      $('#picker-msg').textContent = 'Deselect one hero first — you already have 4.';
      return;
    }
    $('#picker-msg').textContent = '';
    syncPicker();
  }

  function syncPicker() {
    $all('.char-pick').forEach(function (btn) {
      var id = btn.getAttribute('data-char');
      var idx = party.indexOf(id);
      btn.classList.toggle('selected', idx >= 0);
      if (idx >= 0) btn.setAttribute('data-slot', String(idx + 1));
      else btn.removeAttribute('data-slot');
    });
    $all('#party-slots .slot').forEach(function (slot, i) {
      slot.innerHTML = '<span class="n">' + (i + 1) + '</span>';
      if (party[i]) {
        slot.classList.add('filled');
        var img = document.createElement('img');
        img.src = charUrl(party[i]);
        img.alt = party[i];
        slot.appendChild(img);
      } else slot.classList.remove('filled');
    });
    var ok = party.length === 4 && unique(party).length === 4;
    $('#btn-enter').disabled = !ok;
    $('#picker-count').textContent = party.length + ' / 4 chosen';
  }

  function unique(arr) {
    return arr.filter(function (v, i) { return arr.indexOf(v) === i; });
  }

  /* ---------- HUD / arena ---------- */
  function paintHp() {
    if (!combat) return;
    var s = combat.snapshot();
    $('#party-hp-val').textContent = s.partyHp + ' / ' + s.partyMax;
    $('#boss-hp-val').textContent = s.bossHp + ' / ' + s.bossMax;
    $('#party-bar').style.width = (s.partyHp / s.partyMax * 100) + '%';
    $('#boss-bar').style.width = (s.bossHp / s.bossMax * 100) + '%';
    if (global.DungeonScene) DungeonScene.setPhase(s.phase);
    var bossActor = $('#boss-actor');
    if (bossActor) bossActor.classList.toggle('phase2', s.phase === 2);
    $('#boss-name').textContent = s.phase === 2 ? (BOSS_NAME + ' — Enraged') : BOSS_NAME;
  }

  function paintTimer() {
    if (!combat) return;
    var s = combat.snapshot();
    var left = s.timeLeft / 1000;
    $('#timer-num').textContent = left.toFixed(1);
    var usedFrac = 1 - (s.timeLeft / (s.timerSec * 1000));
    usedFrac = Math.max(0, Math.min(1, usedFrac));
    $('#speed-needle').style.left = (usedFrac * 100) + '%';
    var fast = s.isFast && s.timeLeft > 0;
    var tag = $('#speed-tag');
    tag.textContent = s.timeLeft <= 0 ? 'TIME UP' : (fast ? 'FAST' : 'SLOW');
    tag.className = 'speed-tag ' + (fast ? 'fast' : 'slow');
  }

  function tickTimer() {
    if (!combat || combat.isLocked()) return;
    paintTimer();
    if (combat.timeLeft() <= 0) {
      onTimeout();
      return;
    }
    timerRaf = requestAnimationFrame(tickTimer);
  }

  function stopTimer() {
    if (timerRaf) cancelAnimationFrame(timerRaf);
    timerRaf = 0;
  }

  function renderArena() {
    var row = $('#party-row');
    row.innerHTML = '';
    party.forEach(function (id, i) {
      var wrap = document.createElement('div');
      wrap.className = 'actor' + (i === activeIndex ? ' active' : '');
      wrap.id = 'party-actor-' + i;
      var img = document.createElement('img');
      img.src = charUrl(id);
      img.alt = prettyRole(charMeta(id));
      var pose = document.createElement('div');
      pose.className = 'pose';
      pose.appendChild(img);
      var nm = document.createElement('div');
      nm.className = 'name';
      nm.textContent = prettyRole(charMeta(id));
      pose.appendChild(nm);
      wrap.appendChild(pose);
      row.appendChild(wrap);
    });
    var bossImg = $('#boss-actor img');
    if (bossImg) bossImg.src = charUrl(BOSS_ID);
  }

  function setActiveFighter() {
    $all('#party-row .actor').forEach(function (el, i) {
      el.classList.toggle('active', i === activeIndex);
    });
  }

  /* ---------- combat visuals ---------- */
  var bannerTimer = 0;
  function showBanner(text, cls) {
    var b = $('#combat-banner');
    b.className = 'banner show ' + (cls || '');
    b.textContent = text;
    if (bannerTimer) clearTimeout(bannerTimer);
    bannerTimer = setTimeout(function () { b.classList.remove('show'); bannerTimer = 0; }, 1700);
  }

  function flyDamage(targetSel, text, cls) {
    var host = $(targetSel);
    if (!host) return;
    var n = document.createElement('div');
    n.className = 'dmg-fly ' + (cls || '');
    n.textContent = text;
    host.appendChild(n);
    setTimeout(function () { if (n.parentNode) n.parentNode.removeChild(n); }, 950);
  }

  function withQuietKit(fn) {
    var M = global.HcyFxMotion, stamp, pop;
    if (M) {
      stamp = M.stamp; pop = M.scorePop;
      M.stamp = function () {};
      M.scorePop = function () {};
    }
    try { fn(); } catch (e) {}
    if (M) { if (stamp) M.stamp = stamp; if (pop) M.scorePop = pop; }
  }
  function fxCorrect() { withQuietKit(function () { if (global.HcyFx) HcyFx.correct(); }); }
  function fxWrong() { withQuietKit(function () { if (global.HcyFx) HcyFx.wrong(); }); }

  function fxLayer() {
    var box = $('#combat-fx');
    if (!box) {
      box = document.createElement('div');
      box.id = 'combat-fx';
      var arena = $('#arena');
      if (arena) arena.appendChild(box);
    }
    return box;
  }
  function clearCombatFx() {
    var box = $('#combat-fx');
    if (box) box.innerHTML = '';
  }
  function addFx(cls, styles, life, text) {
    var el = document.createElement('div');
    el.className = cls;
    if (text != null) el.textContent = text;
    if (styles) {
      Object.keys(styles).forEach(function (k) { el.style[k] = styles[k]; });
    }
    fxLayer().appendChild(el);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, life || 1100);
    return el;
  }
  function clearAttackClasses() {
    $all('#party-row .actor, #boss-actor').forEach(function (el) {
      el.classList.remove('atk-strong', 'atk-weak', 'atk-miss', 'atk-boss', 'hit-strong', 'hit-weak', 'hit-boss', 'boss-taunt', 'lunge', 'lunge-weak', 'fumble', 'hit', 'atk-hold');
      el.className = el.className.replace(/\bstyle-\w+/g, '').replace(/\s+/g, ' ').trim();
    });
  }


  function attackStyle(id) {
    var c = charMeta(id);
    var role = String(c.role || '').toLowerCase();
    var blob = role + ',' + String(c.tags || '').toLowerCase();
    if (role === 'mage') return 'magic';
    if (role === 'healer') return 'holy';
    if (role === 'archer') return 'arrow';
    if (role === 'tank') return 'bash';
    if (role === 'rogue' || role === 'ninja') return 'stab';
    if (role === 'support' || role === 'bard') return 'song';
    if (role === 'monster-ally' || role === 'beast-tamer') return 'pounce';
    if (/soccer|pe-boy|pe-kit/.test(blob)) return 'kick';
    if (/rain|storm|umbrella|weather|window-wind|raincoat/.test(blob)) return 'gust';
    if (/school|library|homework|teacher|scholar|book|bus-boy|wake|bedtime|shopping|cook|lunch|dishes/.test(blob)) return 'book';
    if (role === 'warrior' || role === 'paladin') return 'slash';
    return 'slash';
  }

  function applyAttackStyle(actor) {
    var style = attackStyle(party[activeIndex]);
    if (!actor) return style;
    actor.className = actor.className.replace(/\bstyle-\w+/g, '').replace(/\s+/g, ' ').trim();
    actor.classList.add('style-' + style);
    return style;
  }

  function spawnAttackFx(style, kind) {
    var hold = '';
    var life = kind === 'strong' ? 1200 : 1100;
    function fx(cls, styles, text) { return addFx(cls + hold, styles, life, text); }
    if (kind === 'miss') {
      if (style === 'arrow') fx('fx-arrow miss');
      else if (style === 'magic') fx('fx-orb miss');
      else if (style === 'holy') fx('fx-beam miss');
      else if (style === 'bash') fx('fx-shield miss');
      else if (style === 'stab') fx('fx-dagger miss');
      else if (style === 'song') { fx('fx-note miss', null, '♪'); fx('fx-note n2 miss', null, '♫'); }
      else if (style === 'pounce') fx('fx-burst miss');
      else if (style === 'book') fx('fx-book miss');
      else if (style === 'kick') fx('fx-ball miss');
      else if (style === 'gust') fx('fx-wind miss');
      else fx('fx-miss-swoosh');
      fx('fx-miss-x', null, 'X');
      return;
    }
    var strong = kind === 'strong';
    if (style === 'arrow') {
      fx('fx-arrow' + (strong ? '' : ' weak'));
    } else if (style === 'magic') {
      fx('fx-orb' + (strong ? '' : ' weak'));
      if (strong) { fx('fx-spark'); fx('fx-spark s2'); }
    } else if (style === 'holy') {
      fx('fx-beam' + (strong ? '' : ' weak'));
      if (strong) { fx('fx-heart', null, '♥'); fx('fx-heart h2', null, '♥'); }
    } else if (style === 'bash') {
      fx('fx-shield' + (strong ? '' : ' weak'));
      if (strong) fx('fx-ring');
    } else if (style === 'stab') {
      fx('fx-dagger');
      if (strong) fx('fx-dagger d2');
    } else if (style === 'song') {
      fx('fx-note', null, '♪');
      if (strong) { fx('fx-note n2', null, '♫'); fx('fx-ring song'); }
    } else if (style === 'pounce') {
      fx('fx-burst' + (strong ? '' : ' weak'));
    } else if (style === 'book') {
      fx('fx-book' + (strong ? '' : ' weak'));
      if (strong) fx('fx-spark book');
    } else if (style === 'kick') {
      fx('fx-ball' + (strong ? '' : ' weak'));
    } else if (style === 'gust') {
      fx('fx-wind' + (strong ? '' : ' weak'));
      if (strong) fx('fx-wind w2');
    } else {
      fx('fx-slash' + (strong ? '' : ' weak'));
      if (strong) { fx('fx-slash s2'); fx('fx-shockwave'); }
    }
  }

  function attackFlash(style, kind) {
    if (!global.DungeonScene) return;
    var map = {
      slash: [0xfff0a0, 0xffb060],
      arrow: [0x7ad68a, 0x9ad8a6],
      magic: [0xc48cff, 0xd0a8ff],
      holy: [0xffc6e4, 0xffd0a8],
      bash: [0x8ec4ff, 0xb0d4ff],
      stab: [0xe8e8f0, 0xc0c0d0],
      song: [0x7ee0d0, 0xffd080],
      pounce: [0xffb060, 0xffd080],
      book: [0xf0d8a0, 0xe0c080],
      kick: [0x8ed87a, 0xc0e090],
      gust: [0xa8e0ff, 0xd0f0ff]
    };
    var pair = map[style] || map.slash;
    var strong = kind === 'strong';
    DungeonScene.flash(pair[0]);
    DungeonScene.shake(strong ? 440 : 150);
  }

  function kickAnim(el, cls) {
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }
  function animatePartyAttack(kind) {
    clearCombatFx();
    var actor = $('#party-actor-' + activeIndex);
    var boss = $('#boss-actor');
    var style = applyAttackStyle(actor);
    if (kind === 'strong') {
      kickAnim(actor, 'atk-strong');
      spawnAttackFx(style, 'strong');
      return wait(280).then(function () {
        kickAnim(boss, 'hit-strong');
        attackFlash(style, 'strong');
        flyDamage('#boss-actor', '-3', 'party-dmg dmg-strong');
        fxCorrect();
        return wait(720);
      }).then(function () {
        clearAttackClasses();
      });
    }
    kickAnim(actor, 'atk-weak');
    spawnAttackFx(style, 'weak');
    return wait(300).then(function () {
      kickAnim(boss, 'hit-weak');
      attackFlash(style, 'weak');
      flyDamage('#boss-actor', '-1', 'party-dmg dmg-weak');
      return wait(620);
    }).then(function () {
      clearAttackClasses();
    });
  }

  function animateMissThenBoss() {
    clearCombatFx();
    var actor = $('#party-actor-' + activeIndex);
    var boss = $('#boss-actor');
    var style = applyAttackStyle(actor);
    kickAnim(actor, 'atk-miss');
    kickAnim(boss, 'boss-taunt');
    spawnAttackFx(style, 'miss');
    showBanner('MISS', 'miss');
    return wait(900).then(function () {
      clearAttackClasses();
      return animateBossAttack();
    });
  }

  function animateBossAttack() {
    clearCombatFx();
    var boss = $('#boss-actor');
    kickAnim(boss, 'atk-boss');
    showBanner('BOSS ATTACK 2', 'boss');
    var i;
    for (i = 0; i < 8; i++) {
      addFx('fx-crystal', {
        left: (8 + i * 10 + (i % 2) * 4) + '%',
        top: (4 + (i % 3) * 8) + '%',
        animationDelay: (0.08 + i * 0.06) + 's'
      }, 1300);
    }
    addFx('fx-slam', null, 1200);
    return wait(380).then(function () {
      $all('#party-row .actor').forEach(function (el) { el.classList.add('hit-boss'); });
      if (global.DungeonScene) {
        DungeonScene.flash(0xff4a6a);
        DungeonScene.shake(500);
      }
      flyDamage('#party-actor-' + activeIndex, '-2', 'boss-dmg');
      return wait(750);
    }).then(function () {
      clearAttackClasses();
    });
  }

  function wait(ms) {
    return new Promise(function (res) { setTimeout(res, ms); });
  }

  /* ---------- turns ---------- */
  function beginFight() {
    initFx();
    combat = global.CastleCombat.create({ timerSec: timerSec });
    activeIndex = 0;
    misses = [];
    resolveBusy = false;
    renderArena();
    paintHp();
    showScreen('screen-fight');
    nextTurn();
  }

  function nextTurn() {
    if (!combat) return;
    var snap = combat.snapshot();
    if (snap.bossHp <= 0) return endGame(true);
    if (snap.partyHp <= 0) return endGame(false);
    currentItem = global.CastleBossBanks.nextItem();
    if (!currentItem) {
      $('#prompt-text').textContent = 'No practice questions loaded. Check the banks path.';
      return;
    }
    $('#prompt-skill').textContent = (currentItem.skill || currentItem.bank || 'practice') + (currentItem.unit ? ' · ' + currentItem.unit : '');
    if (global.CastleHints && typeof global.CastleHints.html === 'function') {
      $('#prompt-text').innerHTML = global.CastleHints.html(currentItem.prompt, currentItem);
    } else {
      $('#prompt-text').textContent = currentItem.prompt;
    }
    setActiveFighter();
    CastleCards.deal(currentItem.hand, onCardPicked, currentItem);
    combat.startTurn();
    paintTimer();
    stopTimer();
    timerRaf = requestAnimationFrame(tickTimer);
  }

  function onCardPicked(index, text) {
    if (!combat || combat.isLocked() || resolveBusy) return;
    if (combat.timeLeft() <= 0) return; // late tap
    var correct = text === currentItem.answer;
    CastleCards.lock();
    stopTimer();
    var result = combat.resolveAnswer(correct);
    if (result.ignored) return;
    finishResolve(result, { picked: text, index: index, correct: correct, timeout: false });
  }

  function onTimeout() {
    if (!combat || combat.isLocked() || resolveBusy) return;
    CastleCards.lock();
    stopTimer();
    combat.lockTurn();
    var result = combat.apply('timeout');
    finishResolve(result, { picked: null, index: -1, correct: false, timeout: true });
  }

  function finishResolve(result, meta) {
    resolveBusy = true;
    paintTimer();
    var chain = Promise.resolve();
    if (result.kind === 'strong') {
      CastleCards.play(meta.index, { glow: true });
      showBanner(result.label, 'strong');
      chain = animatePartyAttack('strong');
    } else if (result.kind === 'weak') {
      CastleCards.play(meta.index, { glow: true });
      showBanner(result.label, 'weak');
      chain = animatePartyAttack('weak');
    } else if (result.kind === 'miss') {
      CastleCards.play(meta.index, { shake: true });
      CastleCards.revealCorrect(currentItem.answer);
      fxWrong();
      misses.push({ prompt: currentItem.prompt, picked: meta.picked, answer: currentItem.answer });
      chain = animateMissThenBoss();
    } else if (result.kind === 'timeout') {
      CastleCards.revealCorrect(currentItem.answer);
      fxWrong();
      misses.push({ prompt: currentItem.prompt, picked: '(time up)', answer: currentItem.answer });
      chain = animateBossAttack();
    }
    chain.then(function () {
      paintHp();
      return wait(700);
    }).then(function () {
      resolveBusy = false;
      if (result.win) return endGame(true);
      if (result.lose) return endGame(false);
      activeIndex = (activeIndex + 1) % Math.max(1, party.length);
      nextTurn();
    });
    return result;
  }

  function endGame(win) {
    stopTimer();
    showScreen('screen-end');
    $('#end-title').textContent = win ? 'VICTORY!' : 'TRY AGAIN';
    $('#end-lead').textContent = win
      ? 'The Crystal Golem falls. Your party cleared the underground castle.'
      : 'The party is down. Review the misses and try again.';
    var recap = $('#end-recap');
    if (!misses.length) {
      recap.innerHTML = win ? '<p>No misses — brilliant work.</p>' : '<p>Time ran out or every card missed.</p>';
    } else {
      var html = '<h3>Misses / timeouts</h3><ol>';
      misses.forEach(function (m) {
        html += '<li>' + escapeHtml(m.prompt) + '<br><strong>Your card:</strong> ' + escapeHtml(m.picked || '—') +
          '<br><strong>Answer:</strong> ' + escapeHtml(m.answer) + '</li>';
      });
      html += '</ol>';
      recap.innerHTML = html;
    }
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
    });
  }

  /* ---------- public API / QA ---------- */
  function readTimerInput() {
    var n = Number($('#timer-input').value);
    if (!isFinite(n)) n = 12;
    n = Math.max(6, Math.min(30, Math.round(n)));
    $('#timer-input').value = String(n);
    var fast = (n * 0.4).toFixed(1);
    $('#timer-fast-hint').textContent = 'Fast window = first 40% (' + fast + 's at ' + n + 's).';
    timerSec = n;
    return n;
  }

  function startFromTitle() {
    readTimerInput();
    renderPicker();
    showScreen('screen-picker');
  }


  function qaHoldPose(kind, index) {
    if (!combat) return { error: 'no fight' };
    if (index != null && index >= 0) {
      activeIndex = index;
      setActiveFighter();
    }
    clearAttackClasses();
    clearCombatFx();
    $all('.dmg-fly').forEach(function (el) { if (el.parentNode) el.parentNode.removeChild(el); });
    var actor = $('#party-actor-' + activeIndex) || $('#party-actor-0');
    var boss = $('#boss-actor');
    var style = applyAttackStyle(actor);
    var i;
    if (kind === 'strong') {
      if (actor) actor.classList.add('atk-strong', 'atk-hold');
      if (boss) boss.classList.add('hit-strong', 'atk-hold');
      spawnHoldFx(style, 'strong');
      showBanner('STRONG HIT 3', 'strong');
      flyDamage('#boss-actor', '-3', 'party-dmg dmg-strong dmg-hold');
    } else if (kind === 'weak') {
      if (actor) actor.classList.add('atk-weak', 'atk-hold');
      if (boss) boss.classList.add('hit-weak', 'atk-hold');
      spawnHoldFx(style, 'weak');
      showBanner('WEAK HIT 1', 'weak');
      flyDamage('#boss-actor', '-1', 'party-dmg dmg-weak dmg-hold');
    } else if (kind === 'miss') {
      if (actor) actor.classList.add('atk-miss', 'atk-hold');
      if (boss) boss.classList.add('boss-taunt', 'atk-hold');
      spawnHoldFx(style, 'miss');
      showBanner('MISS', 'miss');
    } else if (kind === 'timeout' || kind === 'boss') {
      if (boss) boss.classList.add('atk-boss', 'atk-hold');
      $all('#party-row .actor').forEach(function (el) { el.classList.add('hit-boss', 'atk-hold'); });
      for (i = 0; i < 8; i++) {
        addFx('fx-crystal hold', {
          left: (8 + i * 10 + (i % 2) * 4) + '%',
          top: (10 + (i % 3) * 12) + '%'
        }, 60000);
      }
      addFx('fx-slam hold', null, 60000);
      showBanner('BOSS ATTACK 2', 'boss');
      flyDamage('#party-actor-' + activeIndex, '-2', 'boss-dmg dmg-hold');
    } else {
      return { error: 'unknown kind' };
    }
    return { kind: kind, hold: true, style: style, index: activeIndex };
  }

  function spawnHoldFx(style, kind) {
    var prev = addFx;
    /* reuse spawnAttackFx but with long life + hold class via a local wrapper */
    var saved = addFx;
    addFx = function (cls, styles, life, text) {
      return saved(cls + (cls.indexOf('hold') >= 0 ? '' : ' hold'), styles, 60000, text);
    };
    spawnAttackFx(style, kind);
    addFx = saved;
  }

  function qaResolve(kind) {
    if (!combat || !currentItem) return { error: 'no turn' };
    if (kind === 'timeout') {
      combat.setElapsedMs(combat.snapshot().timerSec * 1000 + 50);
      paintTimer();
      onTimeout();
      return { kind: 'timeout' };
    }
    var wantCorrect = (kind === 'strong' || kind === 'weak');
    if (kind === 'strong') combat.setElapsedMs(0);
    if (kind === 'weak') combat.setElapsedMs(combat.snapshot().timerSec * 1000 * 0.7);
    if (kind === 'miss') combat.setElapsedMs(200);
    paintTimer();
    var idx = 0, i, text;
    for (i = 0; i < currentItem.hand.length; i++) {
      var ok = currentItem.hand[i] === currentItem.answer;
      if (wantCorrect && ok) { idx = i; text = currentItem.hand[i]; break; }
      if (!wantCorrect && !ok) { idx = i; text = currentItem.hand[i]; break; }
    }
    onCardPicked(idx, text);
    return { kind: kind, index: idx, text: text };
  }

  function lateTapProbe() {
    if (!currentItem) return { ignored: true, reason: 'no-item' };
    var before = combat.snapshot();
    var idx = 0;
    onCardPicked(idx, currentItem.hand[idx]);
    var after = combat.snapshot();
    return {
      ignored: before.bossHp === after.bossHp && before.partyHp === after.partyHp && before.locked,
      before: before,
      after: after
    };
  }

  function runSelftest() {
    var report = { ok: true, steps: [], banks: countsInfo, examFlaggedInLive: countsInfo && countsInfo.examFlaggedInLive };
    function assert(name, cond, detail) {
      var row = { name: name, pass: !!cond, detail: detail };
      report.steps.push(row);
      if (!cond) report.ok = false;
      console[cond ? 'info' : 'error']('[selftest]', name, cond ? 'PASS' : 'FAIL', detail || '');
    }
    $('#selftest-report').classList.add('on');

    return Promise.resolve().then(function () {
      assert('filter globals', typeof isExamPaperItem === 'function' && typeof filterNoExamItems === 'function' && typeof scrubBankPayload === 'function');
      assert('live deck has items', countsInfo && countsInfo.total > 20, countsInfo);
      assert('zero exam-flagged in live deck', countsInfo && countsInfo.examFlaggedInLive === 0, countsInfo);
      var items = CastleBossBanks.getItems();
      var bad = items.filter(CastleBossBanks.looksLikeExamItem);
      assert('no exam-parallel / Exam A–J / [Exam in items', bad.length === 0, bad.slice(0, 3));
      var handsProper = items.every(function (it) {
        return Array.isArray(it.hand) && unique(it.hand).length === 4 && it.hand.indexOf(it.answer) >= 0;
      });
      assert('every live item has 4 unique options including the answer', handsProper, items.length);

      var partyIds = eligibleParty().slice(0, 4).map(function (c) { return c.id; });
      assert('4 eligible party ids', partyIds.length === 4 && unique(partyIds).length === 4);
      assert('party not bosses', partyIds.every(function (id) { return charMeta(id).role !== 'boss'; }));
      party = partyIds.slice();
      timerSec = 12;
      showScreen('screen-fight');
      beginFight();
      var s0 = combat.snapshot();
      assert('start HP 18/12', s0.bossHp === 18 && s0.partyHp === 12, s0);
      return wait(120);
    }).then(function () {
      qaResolve('strong');
      return wait(ANIM_MS + 200);
    }).then(function () {
      var s = combat.snapshot();
      assert('after STRONG HIT boss=15 party=12', s.bossHp === 15 && s.partyHp === 12, s);
      qaResolve('weak');
      return wait(ANIM_MS + 200);
    }).then(function () {
      var s = combat.snapshot();
      assert('after WEAK HIT boss=14 party=12', s.bossHp === 14 && s.partyHp === 12, s);
      qaResolve('miss');
      return wait(ANIM_MS + 400);
    }).then(function () {
      var s = combat.snapshot();
      assert('after MISS boss=14 party=10', s.bossHp === 14 && s.partyHp === 10, s);
      qaResolve('timeout');
      return wait(80).then(function () {
        var probe = lateTapProbe();
        assert('late tap after timeout does not play', probe.ignored, probe);
        return wait(ANIM_MS + 200);
      });
    }).then(function () {
      var s = combat.snapshot();
      assert('after TIMEOUT/BOSS ATTACK boss=14 party=8', s.bossHp === 14 && s.partyHp === 8, s);
      report.finalHp = combat.snapshot();
      report.ok = report.steps.every(function (st) { return st.pass; });
      $('#selftest-report').textContent = JSON.stringify(report, null, 2);
      global.CastleBoss.selftestResult = report;
      return report;
    }).catch(function (err) {
      report.ok = false;
      report.error = String(err && err.stack || err);
      $('#selftest-report').textContent = JSON.stringify(report, null, 2);
      global.CastleBoss.selftestResult = report;
      return report;
    });
  }

  /* ---------- boot ---------- */
  function boot() {
    countsInfo = CastleBossBanks.load();
    if (global.DungeonScene) {
      DungeonScene.init('dungeon-scene');
    }
    initFx();
    CastleCards.mount('#card-table');
    var bossImg = $('#boss-actor img');
    if (bossImg) {
      bossImg.src = charUrl(BOSS_ID);
      bossImg.alt = BOSS_NAME;
    }
    $('#btn-start').addEventListener('click', startFromTitle);
    $('#btn-enter').addEventListener('click', function () {
      if (party.length !== 4) return;
      beginFight();
    });
    $('#btn-back-title').addEventListener('click', function () {
      party = [];
      showScreen('screen-title');
    });
    $('#btn-again').addEventListener('click', function () { beginFight(); });
    $('#btn-reparty').addEventListener('click', function () {
      showScreen('screen-picker');
    });
    $('#timer-input').addEventListener('input', readTimerInput);
    readTimerInput();
    showScreen('screen-title');

    global.CastleBoss = {
      CHAR_BASE: CHAR_BASE,
      BOSS_ID: BOSS_ID,
      getCounts: function () { return countsInfo; },
      getParty: function () { return party.slice(); },
      setParty: function (ids) { party = ids.slice(); syncPicker(); },
      showScreen: showScreen,
      startFromTitle: startFromTitle,
      beginFight: beginFight,
      combat: function () { return combat; },
      currentItem: function () { return currentItem; },
      qaHoldPose: qaHoldPose,
      qaResolve: qaResolve,
      qaSetHp: function (hp) { if (combat) { combat.setHp(hp.boss, hp.party); paintHp(); } },
      lateTapProbe: lateTapProbe,
      runSelftest: runSelftest,
      selftestResult: null,
      paintHp: paintHp
    };

    if (/[?&]selftest=1/.test(location.search)) {
      runSelftest();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(typeof window !== 'undefined' ? window : globalThis);
