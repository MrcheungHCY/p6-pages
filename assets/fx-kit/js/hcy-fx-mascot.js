/*! HCY FX — living classroom mascot ADD layer (IIFE).
 *  Soft pastel buddy: spring / overshoot Motion (or WAAPI) for pose; Three.js buddy at high E.
 *  Smooth arcs — anticipation squash → hop → soft land; Wrong = shake + elastic squash; tap = squash.
 *  Does NOT replace particle FX — adds life beside them. Wrong = soft miss; never dumps stage E. */
(function (global) {
  'use strict';

  var POSES = ['idle', 'happy', 'oops'];
  var DEFAULT_BASE = 'mascot/';
  var THREE_E = 0.55;

  /* Spring-ish cubic-beziers (overshoot; Motion One preferred when loaded) */
  var EASE_ANTICIPATE = 'cubic-bezier(0.36, 0, 0.66, -0.56)';
  var EASE_SPRING_OUT = 'cubic-bezier(0.22, 1.28, 0.36, 1)';
  var EASE_SPRING_LAND = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
  var EASE_ELASTIC = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
  var EASE_SOFT = 'cubic-bezier(0.45, 0.05, 0.55, 0.95)';

  var inited = false;
  var root = null;
  var slot = null;
  var img = null;
  var face = null;
  var body = null;
  var artBase = DEFAULT_BASE;
  var renderMode = '3d'; // '2d' | '3d' — 3D uses shared HcyFxThree context
  var poseFiles = { idle: 'idle.png', happy: 'happy.png', oops: 'oops.png' };
  var poseOk = { idle: false, happy: false, oops: false };
  var currentPose = 'idle';
  var breatheCtrl = null;
  var animBusy = false;
  var threeHost = null;
  var threeOk = false;
  var three = null;
  var reduceMotion = false;
  var quality = 'high'; // 'high' | 'soft'

  try {
    reduceMotion = !!(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);
  } catch (e) {}

  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

  function scriptDir() {
    try {
      var scripts = document.getElementsByTagName('script');
      for (var i = scripts.length - 1; i >= 0; i--) {
        var src = scripts[i].src || '';
        if (/hcy-fx-mascot\.js/i.test(src)) {
          return src.replace(/[^/]+$/, '').replace(/js\/$/, '');
        }
      }
    } catch (e) {}
    return '';
  }

  function resolveBase(opts) {
    if (opts && opts.base) return opts.base.replace(/\/?$/, '/');
    var dir = scriptDir();
    if (dir) return dir + 'mascot/';
    return DEFAULT_BASE;
  }

  function animate(el, keyframes, opts) {
    opts = opts || {};
    var duration = opts.duration != null ? opts.duration : 0.45;
    var easing = opts.easing || 'ease-out';
    var delay = opts.delay || 0;
    if (reduceMotion) {
      var last = Array.isArray(keyframes) ? keyframes[keyframes.length - 1] : null;
      if (last) Object.keys(last).forEach(function (k) { el.style[k] = last[k]; });
      return Promise.resolve();
    }
    if (global.HcyFxMotion && typeof global.HcyFxMotion.animate === 'function') {
      try {
        return global.HcyFxMotion.animate(el, keyframes, { duration: duration, easing: easing, delay: delay });
      } catch (e) {}
    }
    var M = global.Motion || global.motion;
    if (M && typeof M.animate === 'function') {
      try {
        var controls = M.animate(el, keyframes, { duration: duration, easing: easing, delay: delay });
        return controls.finished ? controls.finished : Promise.resolve();
      } catch (e) {}
    }
    if (el.animate) {
      var frames = keyframes;
      if (!Array.isArray(keyframes) && typeof keyframes === 'object') {
        var props = Object.keys(keyframes);
        var len = 0;
        props.forEach(function (p) {
          var v = keyframes[p];
          len = Math.max(len, Array.isArray(v) ? v.length : 1);
        });
        frames = [];
        for (var i = 0; i < len; i++) {
          var f = {};
          props.forEach(function (p) {
            var v = keyframes[p];
            f[p] = Array.isArray(v) ? v[Math.min(i, v.length - 1)] : v;
          });
          frames.push(f);
        }
      }
      return el.animate(frames, {
        duration: duration * 1000, easing: easing, delay: delay * 1000, fill: 'forwards'
      }).finished.catch(function () {});
    }
    return Promise.resolve();
  }

  function buildPlaceholderFace() {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 120 120');
    svg.setAttribute('class', 'hcy-mascot-face-svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML =
      '<defs><radialGradient id="hcyMascotCheek" cx="50%" cy="40%" r="60%">' +
      '<stop offset="0%" stop-color="#ffeef8"/><stop offset="100%" stop-color="#ffb8d9"/></radialGradient></defs>' +
      '<circle cx="60" cy="62" r="48" fill="url(#hcyMascotCheek)" stroke="#2a1830" stroke-width="3"/>' +
      '<ellipse class="hcy-mascot-eye hcy-mascot-eye-l" cx="42" cy="55" rx="7" ry="9" fill="#2a1830"/>' +
      '<ellipse class="hcy-mascot-eye hcy-mascot-eye-r" cx="78" cy="55" rx="7" ry="9" fill="#2a1830"/>' +
      '<circle cx="45" cy="52" r="2.2" fill="#fff"/><circle cx="81" cy="52" r="2.2" fill="#fff"/>' +
      '<ellipse class="hcy-mascot-blush hcy-mascot-blush-l" cx="30" cy="70" rx="9" ry="5" fill="#ff7ab6" opacity=".45"/>' +
      '<ellipse class="hcy-mascot-blush hcy-mascot-blush-r" cx="90" cy="70" rx="9" ry="5" fill="#ff7ab6" opacity=".45"/>' +
      '<path class="hcy-mascot-mouth" d="M42 78 Q60 92 78 78" fill="none" stroke="#2a1830" stroke-width="3.5" stroke-linecap="round"/>' +
      '<ellipse class="hcy-mascot-ear hcy-mascot-ear-l" cx="22" cy="38" rx="12" ry="16" fill="#ff9ccc" stroke="#2a1830" stroke-width="2.5"/>' +
      '<ellipse class="hcy-mascot-ear hcy-mascot-ear-r" cx="98" cy="38" rx="12" ry="16" fill="#ff9ccc" stroke="#2a1830" stroke-width="2.5"/>';
    return svg;
  }

  function setFaceMood(mood) {
    if (!face) return;
    face.setAttribute('data-mood', mood);
    var mouth = face.querySelector('.hcy-mascot-mouth');
    if (!mouth) return;
    if (mood === 'happy') {
      mouth.setAttribute('d', 'M38 76 Q60 98 82 76');
    } else if (mood === 'oops') {
      mouth.setAttribute('d', 'M48 86 Q60 76 72 86');
    } else {
      mouth.setAttribute('d', 'M42 78 Q60 92 78 78');
    }
  }

  function applyPoseVisual(pose) {
    currentPose = pose;
    var useImg = poseOk[pose] && img;
    if (useImg) {
      img.classList.remove('is-hidden');
      if (face) face.classList.add('is-hidden');
      var next = artBase + poseFiles[pose];
      if (img.getAttribute('data-hcy-pose') !== pose || img.getAttribute('src') !== next) {
        img.setAttribute('data-hcy-pose', pose);
        img.src = next;
      }
      img.alt = 'HCY mascot ' + pose;
      img.classList.remove('is-hidden');
    } else {
      if (img) img.classList.add('is-hidden');
      if (face) {
        face.classList.remove('is-hidden');
        setFaceMood(pose === 'happy' ? 'happy' : pose === 'oops' ? 'oops' : 'idle');
      }
    }
    if (body) {
      body.classList.remove('is-idle', 'is-happy', 'is-oops');
      body.classList.add('is-' + pose);
    }
  }

  function probePose(pose) {
    return new Promise(function (resolve) {
      var probe = new Image();
      var done = false;
      function finish(ok) {
        if (done) return;
        done = true;
        poseOk[pose] = !!ok;
        resolve(!!ok);
      }
      probe.onload = function () { finish(true); };
      probe.onerror = function () { finish(false); };
      probe.src = artBase + poseFiles[pose] + '?_=' + Date.now();
      setTimeout(function () { finish(false); }, 1200);
    });
  }

  function probeAll() {
    return Promise.all(POSES.map(probePose)).then(function () {
      applyPoseVisual(currentPose);
      return poseOk;
    });
  }

  function stopBreathe() {
    if (breatheCtrl && typeof breatheCtrl.cancel === 'function') {
      try { breatheCtrl.cancel(); } catch (e) {}
    }
    breatheCtrl = null;
    if (body) {
      try {
        var anims = body.getAnimations ? body.getAnimations() : [];
        anims.forEach(function (a) {
          if (a && a.id === 'hcy-mascot-breathe') a.cancel();
        });
      } catch (e) {}
    }
  }

  function startBreathe() {
    if (!body || reduceMotion || animBusy) return;
    stopBreathe();
    // Projector-readable idle: clear bob + breathe squash (always on when idle)
    var amp = quality === 'soft' ? 10 : 15;
    var scY = quality === 'soft' ? 1.045 : 1.065;
    var scX = quality === 'soft' ? 1.02 : 1.03;
    var tilt = quality === 'soft' ? 2.2 : 3.2;
    var dur = quality === 'soft' ? 2400 : 2100;
    var downY = Math.round(amp * 0.28);
    var squashY = quality === 'soft' ? 0.96 : 0.945;
    var squashX = quality === 'soft' ? 1.04 : 1.055;
    var midUp = 'translateY(-' + amp + 'px) scale(' + scX + ', ' + scY + ') rotate(' + tilt + 'deg)';
    var midDown = 'translateY(' + downY + 'px) scale(' + squashX + ', ' + squashY + ') rotate(-' + (tilt * 0.55).toFixed(2) + 'deg)';
    var M = global.Motion || global.motion;
    if (M && typeof M.animate === 'function') {
      try {
        breatheCtrl = M.animate(
          body,
          {
            transform: [
              'translateY(0) scale(1, 1) rotate(0deg)',
              midUp,
              'translateY(0) scale(1, 1) rotate(0deg)',
              midDown,
              'translateY(0) scale(1, 1) rotate(0deg)'
            ]
          },
          { duration: dur / 1000, easing: EASE_SOFT, repeat: Infinity }
        );
        return;
      } catch (e) {}
    }
    if (body.animate) {
      try {
        breatheCtrl = body.animate(
          [
            { transform: 'translateY(0) scale(1, 1) rotate(0deg)' },
            { transform: midUp },
            { transform: 'translateY(0) scale(1, 1) rotate(0deg)' },
            { transform: midDown },
            { transform: 'translateY(0) scale(1, 1) rotate(0deg)' }
          ],
          { duration: dur, easing: EASE_SOFT, iterations: Infinity, id: 'hcy-mascot-breathe' }
        );
      } catch (e) {}
    }
  }

  function ensureMount(opts) {
    opts = opts || {};
    if (slot && body) return slot;

    var host =
      (opts.mount && (typeof opts.mount === 'string' ? document.querySelector(opts.mount) : opts.mount)) ||
      document.getElementById('hcy-mascot-slot') ||
      document.getElementById('hcy-demo-stage');

    if (!host) {
      host = document.createElement('div');
      host.id = 'hcy-mascot-slot';
      host.className = 'hcy-mascot-slot';
      (document.body || document.documentElement).appendChild(host);
    }

    slot = document.getElementById('hcy-mascot-slot');
    if (!slot) {
      slot = document.createElement('div');
      slot.id = 'hcy-mascot-slot';
      slot.className = 'hcy-mascot-slot';
      host.insertBefore(slot, host.firstChild);
    } else {
      slot.classList.add('hcy-mascot-slot');
    }

    root = slot.querySelector('.hcy-mascot') || null;
    if (!root) {
      root = document.createElement('div');
      root.className = 'hcy-mascot';
      root.setAttribute('role', 'img');
      root.setAttribute('aria-label', 'HCY classroom mascot');

      body = document.createElement('div');
      body.className = 'hcy-mascot-body is-idle';

      img = document.createElement('img');
      img.className = 'hcy-mascot-img is-hidden';
      img.alt = 'HCY mascot';
      img.decoding = 'async';
      img.onerror = function () {
        poseOk[currentPose] = false;
        applyPoseVisual(currentPose);
      };

      face = document.createElement('div');
      face.className = 'hcy-mascot-placeholder';
      face.appendChild(buildPlaceholderFace());

      var aura = document.createElement('div');
      aura.className = 'hcy-mascot-aura';
      aura.setAttribute('aria-hidden', 'true');

      var shadow = document.createElement('div');
      shadow.className = 'hcy-mascot-ground-shadow';
      shadow.setAttribute('aria-hidden', 'true');

      threeHost = document.createElement('div');
      threeHost.className = 'hcy-mascot-three';
      threeHost.setAttribute('aria-hidden', 'true');

      body.appendChild(img);
      body.appendChild(face);
      root.appendChild(shadow);
      root.appendChild(aura);
      root.appendChild(threeHost);
      root.appendChild(body);
      slot.appendChild(root);
    } else {
      body = root.querySelector('.hcy-mascot-body');
      img = root.querySelector('.hcy-mascot-img');
      face = root.querySelector('.hcy-mascot-placeholder');
      threeHost = root.querySelector('.hcy-mascot-three');
      if (!root.querySelector('.hcy-mascot-ground-shadow')) {
        var sh = document.createElement('div');
        sh.className = 'hcy-mascot-ground-shadow';
        sh.setAttribute('aria-hidden', 'true');
        root.insertBefore(sh, root.firstChild);
      }
    }
    bindTap();
    return slot;
  }

  function hasWebGL() {
    try {
      var c = document.createElement('canvas');
      return !!(c.getContext('webgl') || c.getContext('experimental-webgl'));
    } catch (e) { return false; }
  }

  function destroyThree() {
    three = null;
    threeOk = false;
  }

  function initThree() {
    var T = ensureSharedThree();
    threeOk = !!(T && T.isActive && T.isActive());
    return threeOk;
  }

  function burstThree(E) {
    var T = threeBuddy();
    if (T && T.burst) T.burst(E);
  }

  function loopThree() {}

  function holdMsFor(kind, E) {
    // Longer readable plateaus (readable beat: hold the smile)
    if (kind === 'happy') return Math.round(980 + Math.min(280, (E || 0.4) * 200));
    if (kind === 'oops') return Math.round(780 + Math.min(160, (E || 0.35) * 120));
    return Math.round(600 + (E || 0.4) * 140);
  }

  function threeBuddyLive() {
    var T = threeBuddy();
    if (!T || renderMode !== '3d') return null;
    if (!T.isActive || !T.isActive()) return null;
    if (typeof T.isMascotVisible === 'function' && !T.isMascotVisible()) return null;
    return T;
  }

  function mirrorPose3d(pose, E, kind) {
    var T = ensureSharedThree();
    if (!T) return null;
    if (T.setMascotPose) T.setMascotPose(pose);
    if (kind === 'hop' && T.hopMascot) T.hopMascot(E, { holdMs: holdMsFor('happy', E) });
    else if (kind === 'squash' && T.wrongMascot) T.wrongMascot(E, { holdMs: holdMsFor('oops', E) });
    else if (kind === 'pop' && T.stampMascot) T.stampMascot(E, { holdMs: holdMsFor('happy', E) });
    return threeBuddyLive();
  }

  function finishPose(poseReset) {
    animBusy = false;
    clearBodyTransform();
    applyPoseVisual(poseReset || 'idle');
    var T = threeBuddy();
    if (T && T.setMascotPose) T.setMascotPose(poseReset || 'idle');
    syncFlatVisibility();
    startBreathe();
  }

  function clearBodyTransform() {
    if (!body) return;
    try {
      if (body.getAnimations) {
        body.getAnimations().forEach(function (a) {
          try { a.cancel(); } catch (e2) {}
        });
      }
    } catch (e) {}
    body.style.transform = '';
  }

  /** WAAPI-first so offset plateaus + dual-arg scale(x,y) are reliable. */
  function runBodyKeyframes(frames, durationSec, easing) {
    easing = easing || EASE_SPRING_OUT;
    durationSec = durationSec == null ? 0.95 : durationSec;
    if (!body) return Promise.resolve();
    if (reduceMotion) {
      clearBodyTransform();
      return Promise.resolve();
    }
    if (body.animate) {
      try {
        var anim = body.animate(frames, {
          duration: Math.round(durationSec * 1000),
          easing: easing,
          fill: 'none'
        });
        return anim.finished.catch(function () {}).then(function () {
          clearBodyTransform();
        });
      } catch (e) {}
    }
    var transforms = frames.map(function (f) { return f.transform; });
    return animate(body, { transform: transforms }, {
      duration: durationSec,
      easing: easing
    }).then(function () {
      clearBodyTransform();
    }).catch(function () {
      clearBodyTransform();
    });
  }

  function prepareFlatReaction() {
    if (!body) return;
    body.style.opacity = '';
    body.style.pointerEvents = '';
    if (img && poseOk[currentPose]) {
      img.classList.remove('is-hidden');
      if (face) face.classList.add('is-hidden');
    }
  }

  /**
   * Correct hop: anticipation squash → stretch launch → arc peak plateau → soft overshoot land.
   * Cubic-bezier spring feel; longer readable happy hold.
   */
  function runFlatHop(E, holdMs) {
    if (!body) {
      return new Promise(function (r) { setTimeout(r, holdMs); });
    }
    prepareFlatReaction();
    // Unmistakable hop even on a classroom projector
    var hop = 48 + E * 56;
    var sc = 1.14 + E * 0.28;
    var wiggle = 12 + E * 18;
    var motionDur = Math.max(1.05, Math.min(1.35, (holdMs || 1050) / 1000));
    var anti = 'translateY(10px) scale(1.22, 0.72) rotate(0deg)';
    var launch = 'translateY(-' + (hop * 0.38) + 'px) scale(0.88, 1.18) rotate(-' + (wiggle * 0.4) + 'deg)';
    var peak = 'translateY(-' + hop + 'px) scale(' + sc + ') rotate(0deg)';
    var peakTilt = 'translateY(-' + hop + 'px) scale(' + sc + ') rotate(' + (wiggle * 0.28) + 'deg)';
    var settle = 'translateY(5px) scale(1.1, 0.9) rotate(0deg)';
    var frames;
    if (E < 0.35) {
      frames = [
        { transform: 'translateY(0) scale(1, 1) rotate(0deg)', offset: 0 },
        { transform: anti, offset: 0.1 },
        { transform: launch, offset: 0.2 },
        { transform: peak, offset: 0.32 },
        { transform: peak, offset: 0.72 },
        { transform: settle, offset: 0.9 },
        { transform: 'translateY(0) scale(1, 1) rotate(0deg)', offset: 1 }
      ];
    } else if (E < THREE_E) {
      frames = [
        { transform: 'translateY(0) scale(1, 1) rotate(0deg)', offset: 0 },
        { transform: anti, offset: 0.08 },
        { transform: launch, offset: 0.16 },
        { transform: peakTilt, offset: 0.26 },
        { transform: peak, offset: 0.34 },
        { transform: peak, offset: 0.7 },
        { transform: 'translateY(-' + (hop * 0.18) + 'px) scale(1.04, 0.98) rotate(0deg)', offset: 0.86 },
        { transform: settle, offset: 0.93 },
        { transform: 'translateY(0) scale(1, 1) rotate(0deg)', offset: 1 }
      ];
    } else {
      frames = [
        { transform: 'translateY(0) scale(1, 1) rotate(0deg)', offset: 0 },
        { transform: anti, offset: 0.07 },
        { transform: 'translateY(-' + (hop * 0.5) + 'px) scale(0.9, 1.14) rotate(-' + wiggle + 'deg)', offset: 0.14 },
        { transform: 'translateY(-' + (hop * 1.08) + 'px) scale(' + (sc * 1.04) + ') rotate(' + (wiggle * 0.4) + 'deg)', offset: 0.22 },
        { transform: peak, offset: 0.3 },
        { transform: peakTilt, offset: 0.68 },
        { transform: 'translateY(-' + (hop * 0.15) + 'px) scale(1.05, 0.97) rotate(0deg)', offset: 0.84 },
        { transform: settle, offset: 0.92 },
        { transform: 'translateY(0) scale(1, 1) rotate(0deg)', offset: 1 }
      ];
    }
    var t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    return runBodyKeyframes(frames, motionDur, EASE_SPRING_OUT).then(function () {
      var elapsed = ((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()) - t0;
      var rest = Math.max(0, holdMs - elapsed);
      return new Promise(function (r) { setTimeout(r, rest); });
    }).catch(function () {
      clearBodyTransform();
      return new Promise(function (r) { setTimeout(r, holdMs); });
    });
  }

  /**
   * Wrong: elastic squash impact → hold compressed → follow-through stretch → settle.
   * Not linear — spring overshoot on recovery.
   */
  function runFlatSquash(E, holdMs) {
    if (!body) {
      return new Promise(function (r) { setTimeout(r, holdMs); });
    }
    prepareFlatReaction();
    var squashY = 0.55 - Math.min(0.08, E * 0.06);
    var squashX = 1.32 + Math.min(0.12, E * 0.1);
    var lean = 14 + Math.min(16, E * 14);
    var shake = 14 + Math.min(16, E * 14);
    var motionDur = Math.max(0.85, Math.min(1.08, (holdMs || 820) / 1000));
    var deep = 'translateY(18px) translateX(-' + shake + 'px) scale(' + squashX + ', ' + squashY + ') rotate(-' + lean + 'deg)';
    var shakeR = 'translateY(16px) translateX(' + shake + 'px) scale(' + (squashX * 0.98) + ', ' + (squashY + 0.03) + ') rotate(' + (lean * 0.85) + 'deg)';
    var shakeL = 'translateY(15px) translateX(-' + (shake * 0.7) + 'px) scale(' + (squashX * 0.96) + ', ' + (squashY + 0.05) + ') rotate(-' + (lean * 0.55) + 'deg)';
    var hold = 'translateY(14px) translateX(0) scale(' + (squashX * 0.95) + ', ' + (squashY + 0.06) + ') rotate(-' + (lean * 0.35) + 'deg)';
    var rebound = 'translateY(-8px) scale(0.86, 1.2) rotate(' + (lean * 0.45) + 'deg)';
    var settle = 'translateY(4px) scale(1.08, 0.92) rotate(-' + (lean * 0.1) + 'deg)';
    var frames = [
      { transform: 'translateY(0) scale(1, 1) rotate(0deg)', offset: 0 },
      { transform: 'translateY(6px) scale(1.1, 0.9) rotate(-' + (lean * 0.2) + 'deg)', offset: 0.06 },
      { transform: deep, offset: 0.16 },
      { transform: shakeR, offset: 0.28 },
      { transform: shakeL, offset: 0.4 },
      { transform: hold, offset: 0.52 },
      { transform: rebound, offset: 0.7 },
      { transform: settle, offset: 0.88 },
      { transform: 'translateY(0) scale(1, 1) rotate(0deg)', offset: 1 }
    ];
    var t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    return runBodyKeyframes(frames, motionDur, EASE_ELASTIC).then(function () {
      var elapsed = ((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()) - t0;
      var rest = Math.max(0, holdMs - elapsed);
      return new Promise(function (r) { setTimeout(r, rest); });
    }).catch(function () {
      clearBodyTransform();
      return new Promise(function (r) { setTimeout(r, holdMs); });
    });
  }

  /**
   * Tap / click: quick squash with spring rebound (idle cancelled for the beat).
   */
  function runFlatTap(E) {
    if (!body) return Promise.resolve();
    prepareFlatReaction();
    E = clamp(E == null ? 0.55 : E, 0.25, 1.2);
    var sy = 0.62 - Math.min(0.06, E * 0.04);
    var sx = 1.28 + Math.min(0.1, E * 0.08);
    var frames = [
      { transform: 'translateY(0) scale(1, 1) rotate(0deg)', offset: 0 },
      { transform: 'translateY(14px) scale(' + sx + ', ' + sy + ') rotate(0deg)', offset: 0.28 },
      { transform: 'translateY(-6px) scale(0.9, 1.14) rotate(0deg)', offset: 0.58 },
      { transform: 'translateY(3px) scale(1.06, 0.94) rotate(0deg)', offset: 0.82 },
      { transform: 'translateY(0) scale(1, 1) rotate(0deg)', offset: 1 }
    ];
    return runBodyKeyframes(frames, 0.42, EASE_SPRING_LAND);
  }

  function playTap(E) {
    if (!inited) init();
    if (animBusy) return Promise.resolve();
    E = clamp(E == null ? 0.55 : E, 0, 1.2);
    animBusy = true;
    stopBreathe();
    // Keep current pose art; squash is the tell
    var live3d = threeBuddyLive();
    if (live3d && live3d.tapMascot) live3d.tapMascot(E);
    else if (live3d && live3d.stampMascot) live3d.stampMascot(Math.max(0.35, E * 0.7), { holdMs: 420 });
    if (body) { body.style.opacity = ''; body.style.pointerEvents = ''; }
    if (root) root.classList.remove('is-mode-3d');
    return runFlatTap(E).then(function () {
      finishPose(currentPose === 'happy' || currentPose === 'oops' ? 'idle' : (currentPose || 'idle'));
    }).catch(function () {
      finishPose('idle');
    });
  }

  function bindTap() {
    if (!root || root.getAttribute('data-hcy-tap') === '1') return;
    root.setAttribute('data-hcy-tap', '1');
    root.style.cursor = 'pointer';
    root.setAttribute('tabindex', '0');
    root.addEventListener('pointerdown', function (ev) {
      if (ev.button != null && ev.button !== 0) return;
      // Ignore if click originated on a control outside mascot art
      try { ev.stopPropagation(); } catch (e) {}
      playTap(0.6);
    });
    root.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        playTap(0.6);
      }
    });
  }

  function playCorrect(E) {
    if (!inited) init();
    E = clamp(E == null ? 0.4 : E, 0, 1.2);
    animBusy = true;
    stopBreathe();
    applyPoseVisual('happy');
    var holdMs = holdMsFor('happy', E);
    var live3d = mirrorPose3d('happy', E, 'hop');
    if (live3d) {
      syncFlatVisibility();
    } else {
      if (body) { body.style.opacity = ''; body.style.pointerEvents = ''; }
      if (root) root.classList.remove('is-mode-3d');
    }
    return runFlatHop(E, holdMs).then(function () {
      finishPose('idle');
    }).catch(function () {
      finishPose('idle');
    });
  }

  function playWrong(E) {
    if (!inited) init();
    E = clamp(E == null ? 0.35 : E, 0, 1.2);
    animBusy = true;
    stopBreathe();
    applyPoseVisual('oops');
    var holdMs = holdMsFor('oops', E);
    var live3d = mirrorPose3d('oops', E, 'squash');
    if (live3d) {
      syncFlatVisibility();
    } else {
      if (body) { body.style.opacity = ''; body.style.pointerEvents = ''; }
      if (root) root.classList.remove('is-mode-3d');
    }
    return runFlatSquash(E, holdMs).then(function () {
      finishPose('idle');
    }).catch(function () {
      finishPose('idle');
    });
  }

  function playStamp(E) {
    if (!inited) init();
    E = clamp(E == null ? 0.5 : E, 0, 1.2);
    if (E < 0.25) return Promise.resolve();
    animBusy = true;
    stopBreathe();
    applyPoseVisual('happy');
    var holdMs = Math.max(650, holdMsFor('happy', E) * 0.7);
    mirrorPose3d('happy', E, 'pop');
    if (body) { body.style.opacity = ''; body.style.pointerEvents = ''; }
    var pop = 1.1 + E * 0.18;
    var t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    return animate(body, {
      transform: [
        'translateY(0) scale(1, 1)',
        'translateY(5px) scale(1.1, 0.88)',
        'translateY(-16px) scale(' + pop + ')',
        'translateY(2px) scale(1.05, 0.96)',
        'translateY(0) scale(1, 1)'
      ]
    }, { duration: 0.48, easing: EASE_SPRING_LAND })
      .then(function () {
        var elapsed = ((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()) - t0;
        var rest = Math.max(0, holdMs - elapsed);
        return new Promise(function (r) { setTimeout(r, rest); });
      })
      .then(function () { finishPose('idle'); })
      .catch(function () { finishPose('idle'); });
  }

  function setQuality(q) {
    quality = q === 'soft' ? 'soft' : 'high';
    var T = threeBuddy();
    if (T && T.setQuality) T.setQuality(quality);
    if (!animBusy) startBreathe();
    return quality;
  }

  function init(opts) {
    opts = opts || {};
    artBase = resolveBase(opts);
    if (opts.poses) {
      if (opts.poses.idle) poseFiles.idle = opts.poses.idle;
      if (opts.poses.happy) poseFiles.happy = opts.poses.happy;
      if (opts.poses.oops) poseFiles.oops = opts.poses.oops;
    }
    if (opts.quality === 'soft' || opts.quality === 'high') quality = opts.quality;
    ensureMount(opts);
    if (opts.mode === '2d' || opts.mode === '3d') renderMode = opts.mode;
    applyPoseVisual('idle');
    probeAll().then(function () { syncFlatVisibility(); });
    startBreathe();
    setTimeout(function () {
      ensureSharedThree();
      syncFlatVisibility();
    }, opts.eagerThree || renderMode === '3d' ? 0 : 30);
    inited = true;
    return api;
  }

  function autoInitFromDemo() {
    if (inited) return;
    if (!document.getElementById('hcy-demo-stage') && !document.getElementById('hcy-mascot-slot')) return;
    init({ mount: document.getElementById('hcy-mascot-slot') || document.getElementById('hcy-demo-stage') });
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', autoInitFromDemo);
    } else {
      setTimeout(autoInitFromDemo, 0);
    }
  }

  function syncFlatVisibility() {
    if (!body) return;
    if (animBusy) {
      body.style.opacity = '';
      body.style.pointerEvents = '';
      applyPoseVisual(currentPose);
      return;
    }
    var T = threeBuddy();
    var threeLive = renderMode === '3d' && T && T.isActive && T.isActive();
    var buddyOn = threeLive && typeof T.isMascotVisible === 'function' && T.isMascotVisible();
    var hasPng = !!(poseOk.idle || poseOk.happy || poseOk.oops);
    if (buddyOn && !hasPng) {
      if (img) img.classList.add('is-hidden');
      if (face) face.classList.add('is-hidden');
      body.style.opacity = '0';
      body.style.pointerEvents = 'none';
      if (root) root.classList.add('is-mode-3d');
    } else {
      body.style.opacity = '';
      body.style.pointerEvents = '';
      if (root) root.classList.remove('is-mode-3d');
      applyPoseVisual(currentPose);
    }
  }

  function threeBuddy() {
    return global.HcyFxThree || null;
  }

  function ensureSharedThree() {
    var T = threeBuddy();
    if (!T) return null;
    if (!T.isActive()) T.init({ quality: quality });
    if (T.setMascotSlot) T.setMascotSlot(slot || document.getElementById('hcy-mascot-slot'));
    if (T.setMascotMode) T.setMascotMode(renderMode);
    if (T.setMascotArtBase) T.setMascotArtBase(artBase);
    if (T.setQuality) T.setQuality(quality);
    return T.isActive() ? T : null;
  }

  function setRenderMode(mode) {
    renderMode = mode === '2d' ? '2d' : '3d';
    var T = ensureSharedThree();
    if (T && T.setMascotMode) T.setMascotMode(renderMode);
    syncFlatVisibility();
    return renderMode;
  }

  function reloadArt(opts) {
    if (typeof opts === 'string') {
      artBase = opts.replace(/\/?$/, '/');
    } else if (opts && typeof opts === 'object') {
      if (opts.base) artBase = String(opts.base).replace(/\/?$/, '/');
      if (opts.mode) renderMode = opts.mode === '2d' ? '2d' : '3d';
      if (opts.quality === 'soft' || opts.quality === 'high') quality = opts.quality;
    }
    var T = ensureSharedThree();
    if (T && T.setMascotArtBase) T.setMascotArtBase(artBase);
    if (T && T.setMascotMode) T.setMascotMode(renderMode);
    if (T && T.setQuality) T.setQuality(quality);
    return probeAll().then(function (ok) {
      syncFlatVisibility();
      return ok;
    });
  }

  var api = {
    init: init,
    correct: playCorrect,
    wrong: playWrong,
    tap: playTap,
    stamp: playStamp,
    setPose: function (pose) {
      if (POSES.indexOf(pose) < 0) pose = 'idle';
      applyPoseVisual(pose);
      var T = threeBuddy();
      if (T && T.setMascotPose) T.setMascotPose(pose);
    },
    reloadArt: reloadArt,
    setRenderMode: setRenderMode,
    setQuality: setQuality,
    getQuality: function () { return quality; },
    getRenderMode: function () { return renderMode; },
    getArtBase: function () { return artBase; },
    isReady: function () { return inited; },
    hasPng: function (pose) { return !!poseOk[pose || 'idle']; },
    el: function () { return root; }
  };

  global.HcyFxMascot = api;
})(typeof window !== 'undefined' ? window : this);
