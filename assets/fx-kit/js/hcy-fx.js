/*! HcyFx — classroom escalate facade (IIFE).
 *  Patterns: streak climbs FX; wrong resets combo but does NOT dump stage E. */
(function (global) {
  'use strict';

  var MAX_LEVEL = 10;
  var streak = 0;
  var stageE = 0.08;       // party energy — climbs on correct, soft-hold on wrong
  var intensityCap = 1;    // user slider 0–1 multiplies output
  var muted = false;
  var shakeTarget = null;
  var flashEl = null;
  var inited = false;

  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

  function M() { return global.HcyFxMotion; }
  function A() { return global.HcyFxAudio; }
  function T() { return global.HcyFxThree; }
  function Mas() { return global.HcyFxMascot; }

  /** Map streak → energy like a progress curve (reimplemented escalate feel) */
  function streakToE(s) {
    // Climb like a short classroom set: ~Correct 1 soft, 4–5 fireworks, 8+ capped party
    var t = clamp(s / 8, 0, 1.25);
    return 0.12 + 0.88 * Math.pow(Math.min(1, t), 1.15) + (t > 1 ? 0.12 * Math.min(0.25, t - 1) : 0);
  }

  function effectiveE(override) {
    var e = override != null ? override : stageE;
    return clamp(e * intensityCap, 0, 1.2);
  }

  function ensureFlash() {
    if (flashEl) return flashEl;
    flashEl = document.createElement('div');
    flashEl.id = 'hcy-fx-flash';
    flashEl.className = 'hcy-fx-flash';
    (document.body || document.documentElement).appendChild(flashEl);
    return flashEl;
  }

  function flash(E) {
    if (intensityCap < 0.05) return;
    var el = ensureFlash();
    var op = Math.min(0.55, 0.12 + E * 0.4) * intensityCap;
    el.style.opacity = String(op);
    el.classList.add('is-on');
    clearTimeout(flash._t);
    flash._t = setTimeout(function () {
      el.style.opacity = '0';
      el.classList.remove('is-on');
    }, 90 + E * 120);
  }

  function init(opts) {
    opts = opts || {};
    if (M()) {
      M().ensureRoot();
      if (opts.motionScale != null) M().setMotionScale(opts.motionScale);
    }
    if (T()) {
      // defer Three until THREE global may load
      setTimeout(function () { T().init(); }, opts.threeDelay != null ? opts.threeDelay : 0);
    }
    if (Mas()) {
      var mascotMode = opts.mascotMode;
      if (!mascotMode && global.HcyFxThemes && HcyFxThemes.getMode) {
        try { mascotMode = HcyFxThemes.getMode(); } catch (e) {}
      }
      Mas().init({
        mount: opts.mascotMount || opts.shakeTarget || document.getElementById('hcy-mascot-slot') || document.getElementById('hcy-demo-stage'),
        base: opts.mascotBase,
        mode: mascotMode || '3d',
        eagerThree: opts.mascotEagerThree != null ? !!opts.mascotEagerThree : (mascotMode !== '2d')
      });
    }
    if (opts.shakeTarget) shakeTarget = opts.shakeTarget;
    if (opts.intensity != null) intensityCap = clamp(opts.intensity, 0, 1);
    inited = true;
    return api;
  }

  function unlockAudio() {
    if (A()) A().unlock();
  }

  /**
   * correct(level?) — level 0–10 optional; else auto from streak.
   * Climbs stage E, combo streak, FX + audio + optional Three.
   */
  function correct(level) {
    unlockAudio();
    if (!inited) init();
    streak += 1;
    var L;
    if (level != null && level !== '') {
      L = clamp(Number(level), 0, MAX_LEVEL);
      // honor explicit level but never dump below current stage on a correct
      var fromLevel = L / MAX_LEVEL;
      stageE = Math.max(stageE, streakToE(Math.max(streak, L)));
      stageE = Math.max(stageE, 0.08 + 0.92 * Math.pow(fromLevel, 1.2));
    } else {
      stageE = Math.max(stageE, streakToE(streak));
      L = Math.min(MAX_LEVEL, Math.round(stageE * MAX_LEVEL));
    }
    stageE = clamp(stageE, 0, 1.15);
    var E = effectiveE();

    var cx = innerWidth / 2;
    var cy = innerHeight * 0.42;

    if (M()) {
      M().hitBurst(E, cx, cy);
      // Every correct feeds the Canvas party; density scales with E
      M().celebrate(Math.max(E, 0.22 + streak * 0.06), { x: cx, y: cy });
      var stamps = ['Nice!', 'Great!', 'Awesome!', 'Fantastic!', 'Incredible!'];
      var label = streak >= 8 ? 'Legendary!' : streak >= 5 ? stamps[Math.min(4, streak - 1)] : stamps[Math.min(stamps.length - 1, Math.max(0, streak - 1))];
      if (E >= 0.35 || streak === 1 || streak % 2 === 0) {
        M().stamp(label, { intensity: E });
      }
      M().scorePop(10 + streak * 5, cx, cy - 40, { intensity: E });
      if (E > 0.4) M().shake(shakeTarget || document.getElementById('hcy-demo-stage') || document.body, { intensity: E * 0.85 });
    }

    if (A() && !muted) {
      if (E >= 0.45 && streak >= 3) A().clear(E);
      else A().correct(E, streak);
      if (E >= 0.55) A().stamp(E);
    }

    if (T()) {
      if (!T().isActive()) T().init();
      T().celebrate(E);
    }

    // Mascot ADD life (particles stay primary). Never replaces stage FX.
    if (Mas()) {
      if (!Mas().isReady()) Mas().init({ mount: shakeTarget || document.getElementById('hcy-mascot-slot') || document.getElementById('hcy-demo-stage') });
      Mas().correct(E);
    }

    if (E > 0.5) flash(E);

    return { streak: streak, level: L, E: E, stageE: stageE };
  }

  /**
   * wrong() — soft miss. Resets combo streak but keeps stageE (party energy).
   */
  function wrong() {
    unlockAudio();
    if (!inited) init();
    var had = streak;
    streak = 0;
    var E = effectiveE(); // still uses held stage energy for soft feedback scale

    if (M()) {
      var cx = innerWidth / 2, cy = innerHeight * 0.45;
      M().puff(cx, cy, 8);
      M().ring(cx, cy, { color: '#c8bdd4', radius: 50, width: 5, life: 0.35 });
      M().stamp('Try again', { soft: true, intensity: Math.min(0.45, E) });
      M().shake(shakeTarget || document.getElementById('hcy-demo-stage') || document.body, {
        intensity: Math.min(0.45, 0.25 + E * 0.2), soft: true
      });
      if (had >= 5) {
        M().text(cx, cy + 30, had + ' combo', { color: '#b9bbd9', size: 18, vy: 40, life: 0.85 });
      }
    }
    if (A() && !muted) A().wrong(E);
    if (Mas()) {
      if (!Mas().isReady()) Mas().init({ mount: shakeTarget || document.getElementById('hcy-mascot-slot') || document.getElementById('hcy-demo-stage') });
      Mas().wrong(E); // soft miss only — does not dump stageE
    }
    // NOTE: stageE intentionally NOT reduced — dopa-drill style keep the vibe
    return { streak: 0, level: Math.round(stageE * MAX_LEVEL), E: E, stageE: stageE, comboWas: had };
  }

  function setIntensity(v) {
    intensityCap = clamp(Number(v), 0, 1);
    if (M()) M().setMotionScale(intensityCap);
    return intensityCap;
  }

  function mute(bool) {
    muted = !!bool;
    if (A()) A().mute(muted);
    return muted;
  }

  function reset() {
    streak = 0;
    stageE = 0.08;
    if (Mas() && Mas().isReady()) Mas().setPose('idle');
    return { streak: 0, level: 0, E: effectiveE(), stageE: stageE };
  }

  function getState() {
    return {
      streak: streak,
      level: Math.min(MAX_LEVEL, Math.round(stageE * MAX_LEVEL)),
      E: effectiveE(),
      stageE: stageE,
      intensity: intensityCap,
      muted: muted
    };
  }

  // Convenience passthroughs for games
  function stamp(text, opts) {
    if (!inited) init();
    opts = opts || {};
    opts.intensity = opts.intensity != null ? opts.intensity : effectiveE();
    if (M()) M().stamp(text, opts);
    if (A() && !muted) A().stamp(opts.intensity);
    if (T() && opts.intensity > 0.4) { T().init(); T().stamp(opts.intensity); }
    if (Mas()) {
      if (!Mas().isReady()) Mas().init({ mount: shakeTarget || document.getElementById('hcy-mascot-slot') || document.getElementById('hcy-demo-stage') });
      Mas().stamp(opts.intensity);
    }
  }

  function burst(opts) {
    if (!inited) init();
    opts = opts || {};
    var E = opts.intensity != null ? opts.intensity : effectiveE();
    var x = opts.x != null ? opts.x : innerWidth / 2;
    var y = opts.y != null ? opts.y : innerHeight / 2;
    if (M()) M().hitBurst(E, x, y);
    if (T()) { T().init(); T().burst(E); }
  }

  function toast(msg, opts) {
    if (!inited) init();
    if (M()) M().toast(msg, opts);
  }

  function scorePop(pts, x, y, opts) {
    if (!inited) init();
    if (M()) M().scorePop(pts, x, y, opts || { intensity: effectiveE() });
  }

  function shake(target, opts) {
    if (!inited) init();
    if (M()) M().shake(target || shakeTarget, opts || { intensity: effectiveE() });
  }

  var api = {
    init: init,
    correct: correct,
    wrong: wrong,
    setIntensity: setIntensity,
    mute: mute,
    reset: reset,
    getState: getState,
    stamp: stamp,
    burst: burst,
    toast: toast,
    scorePop: scorePop,
    shake: shake,
    MAX_LEVEL: MAX_LEVEL
  };

  global.HcyFx = api;
})(typeof window !== 'undefined' ? window : this);
