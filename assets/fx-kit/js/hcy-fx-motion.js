/*! HCY FX — Canvas 2D particle party + DOM helpers (IIFE).
 *  Density/impact baseline inspired by classroom escalate patterns (reimplemented). */
(function (global) {
  'use strict';

  var PASTEL = ['#ff7ab6', '#5ec8ff', '#7dffb3', '#ffe14a', '#b48cff', '#ff9a4a', '#ffffff'];
  var PAPER = ['#ff7ab6', '#5ec8ff', '#ffe14a', '#ffffff', '#7dffb3', '#b48cff'];
  var INK = '#2a1830';
  var reduceMotion = false;
  var motionScale = 1;
  var canvas = null;
  var ctx = null;
  var parts = [];
  var maxParts = 520;
  var dpr = 1;
  var raf = 0;
  var lastT = 0;
  var sprites = Object.create(null);

  try {
    reduceMotion = !!(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);
  } catch (e) {}

  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[(Math.random() * arr.length) | 0]; }
  function scale(n) {
    if (reduceMotion) return Math.min(6, Math.ceil(n * 0.12));
    return Math.round(n * (0.2 + 0.8 * motionScale));
  }

  function ensureRoot() {
    var root = document.getElementById('hcy-fx-root');
    if (root) return root;
    root = document.createElement('div');
    root.id = 'hcy-fx-root';
    root.className = 'hcy-fx-root';
    root.setAttribute('aria-hidden', 'true');
    var c = document.createElement('canvas');
    c.id = 'hcy-fx-canvas';
    c.className = 'hcy-fx-layer-2d';
    root.appendChild(c);
    var layer = document.createElement('div');
    layer.className = 'hcy-fx-dom';
    layer.id = 'hcy-fx-layer-2d';
    root.appendChild(layer);
    (document.body || document.documentElement).appendChild(root);
    canvas = c;
    ctx = c.getContext('2d');
    resize();
    startLoop();
    return root;
  }

  function layer2d() {
    ensureRoot();
    return document.getElementById('hcy-fx-layer-2d');
  }

  function resize() {
    if (!canvas) return;
    dpr = Math.min(2, global.devicePixelRatio || 1);
    var w = Math.round(innerWidth * dpr);
    var h = Math.round(innerHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = innerWidth + 'px';
      canvas.style.height = innerHeight + 'px';
    }
  }

  function add(p) {
    if (parts.length >= maxParts) parts.splice(0, 1 + ((maxParts * 0.03) | 0));
    p.age = 0;
    parts.push(p);
    return p;
  }

  function burst(x, y, opts) {
    ensureRoot();
    opts = opts || {};
    var count = opts.count != null ? opts.count : 24;
    var speed = opts.speed != null ? opts.speed : 420;
    var kinds = opts.kinds || ['confetti'];
    var up = opts.up || 0;
    var spread = opts.spread != null ? opts.spread : Math.PI * 2;
    var angle = opts.angle != null ? opts.angle : -Math.PI / 2;
    var colors = opts.colors || PAPER;
    var size = opts.size != null ? opts.size : 1;
    var gravity = opts.gravity != null ? opts.gravity : 1;
    var life = opts.life != null ? opts.life : 1;
    var n = scale(count);
    for (var i = 0; i < n; i++) {
      var kind = pick(kinds);
      var a = angle + (Math.random() - 0.5) * spread;
      var v = speed * rand(0.35, 1);
      var p = {
        kind: kind, x: x, y: y,
        vx: Math.cos(a) * v, vy: Math.sin(a) * v - up,
        rot: rand(0, 6.28), vr: rand(-12, 12),
        flip: rand(0, 6.28), vf: rand(6, 16),
        color: pick(colors), size: size * rand(0.7, 1.3),
        life: rand(1.4, 2.6) * life, g: 900 * gravity, drag: 0.8
      };
      if (kind === 'spark') { p.life = rand(0.35, 0.75) * life; p.g = 280 * gravity; p.drag = 2.2; p.color = pick(['#fff', '#ffe98a', '#ffe14a', '#ff9ccc']); }
      if (kind === 'star') { p.life = rand(0.85, 1.5) * life; p.g = 480 * gravity; p.drag = 1.5; p.color = pick(['#ffe14a', '#fff', '#ff9ccc', '#8fd3ff']); }
      if (kind === 'coin') { p.life = rand(1.4, 2.2) * life; p.g = 1200 * gravity; p.drag = 0.4; p.color = '#ffe14a'; }
      if (kind === 'heart') { p.life = rand(1, 1.7) * life; p.g = -60; p.drag = 1.7; p.color = pick(['#ff3f8e', '#ff7ab6']); }
      add(p);
    }
  }

  function ring(x, y, opts) {
    ensureRoot();
    opts = opts || {};
    add({
      kind: 'ring', x: x, y: y, vx: 0, vy: 0,
      color: opts.color || '#fff',
      radius: opts.radius != null ? opts.radius : 90,
      width: opts.width != null ? opts.width : 8,
      life: opts.life != null ? opts.life : 0.45,
      g: 0, drag: 0
    });
  }

  function text(x, y, str, opts) {
    ensureRoot();
    opts = opts || {};
    add({
      kind: 'text', x: x, y: y, vx: 0, vy: opts.vy != null ? opts.vy : -90,
      str: str, color: opts.color || '#fff',
      size: opts.size != null ? opts.size : 22,
      life: opts.life != null ? opts.life : 1.1,
      g: 0, drag: 1.2
    });
  }

  function puff(x, y, n) {
    ensureRoot();
    n = scale(n == null ? 6 : n);
    for (var i = 0; i < n; i++) {
      add({
        kind: 'puff', x: x + rand(-14, 14), y: y - rand(0, 6),
        vx: rand(-140, 140), vy: rand(-60, -10),
        size: rand(6, 12), life: rand(0.35, 0.6), g: 0, drag: 5, color: '#fff'
      });
    }
  }

  function fireworks(W, H, n, top, bottom) {
    ensureRoot();
    W = W || innerWidth; H = H || innerHeight;
    n = scale(n == null ? 3 : n);
    top = top == null ? 0.1 : top;
    bottom = bottom == null ? 0.45 : bottom;
    for (var i = 0; i < n; i++) {
      var tx = rand(W * 0.12, W * 0.88);
      var ty = rand(H * top, H * bottom);
      add({
        kind: 'shell', x: tx + rand(-30, 30), y: H + 20,
        vx: 0, vy: 0, tx: tx, ty: ty, t0: i * 0.12,
        life: 3, g: 0, drag: 0, color: pick(PASTEL.slice(0, 6))
      });
    }
  }

  function streamers(W, H, n) {
    ensureRoot();
    W = W || innerWidth; H = H || innerHeight;
    n = scale(n == null ? 6 : n);
    for (var i = 0; i < n; i++) {
      var left = i % 2 === 0;
      var x = left ? -10 : W + 10;
      var y = rand(H * 0.05, H * 0.4);
      var a = left ? rand(-1.1, -0.35) : Math.PI - rand(-1.1, -0.35);
      var v = rand(700, 1100);
      add({
        kind: 'streamer', x: x, y: y,
        vx: Math.cos(a) * v, vy: Math.sin(a) * v,
        life: rand(2.2, 3), g: 700, drag: 1.1,
        color: pick(PASTEL.slice(0, 5)), trail: [], w: rand(6, 10), phase: rand(0, 6)
      });
    }
  }

  function rain(W, n, opts) {
    ensureRoot();
    opts = opts || {};
    W = W || innerWidth;
    n = scale(n == null ? 60 : n);
    var kinds = opts.kinds || ['confetti'];
    for (var i = 0; i < n; i++) {
      add({
        kind: pick(kinds), x: rand(0, W), y: rand(-160, -10),
        vx: rand(-60, 60), vy: rand(60, 260),
        rot: rand(0, 6), vr: rand(-8, 8), flip: rand(0, 6), vf: rand(5, 12),
        color: pick(PAPER), size: rand(0.8, 1.3),
        life: rand(2.5, 4), g: 120, drag: 0.6
      });
    }
  }

  function update(dt) {
    var H = innerHeight + 200;
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      p.age += dt;
      if (p.kind === 'shell') {
        if (p.age < p.t0) continue;
        var k = clamp((p.age - p.t0) / 0.55, 0, 1);
        var ease = 1 - Math.pow(1 - k, 3);
        p.x = p.x + (p.tx - p.x) * Math.min(1, dt * 8);
        p.y = innerHeight + 20 + (p.ty - innerHeight - 20) * ease;
        if (k >= 1 && !p.done) {
          p.done = true; p.life = 0;
          var col = p.color;
          var nn = scale(46);
          for (var j = 0; j < nn; j++) {
            var aa = (j / nn) * Math.PI * 2;
            var vv = rand(260, 340);
            add({
              kind: 'spark', x: p.tx, y: p.ty,
              vx: Math.cos(aa) * vv, vy: Math.sin(aa) * vv,
              life: rand(0.9, 1.3), g: 160, drag: 1.3,
              color: j % 3 ? col : '#fff', size: 1.3
            });
          }
          ring(p.tx, p.ty, { color: col, radius: 120, width: 6, life: 0.5 });
        }
        continue;
      }
      var drag = Math.exp(-p.drag * dt);
      p.vx *= drag;
      p.vy = p.vy * drag + p.g * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.rot !== undefined) p.rot += (p.vr || 0) * dt;
      if (p.flip !== undefined) p.flip += (p.vf || 0) * dt;
      if (p.trail) {
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 18) p.trail.shift();
      }
      if (p.y > H) p.life = 0;
    }
    parts = parts.filter(function (p) {
      return p.age < p.life || (p.kind === 'shell' && !p.done);
    });
  }

  function sprite(key, w, h, paint) {
    var spr = sprites[key];
    if (spr) return spr;
    var cv = document.createElement('canvas');
    var pad = 4, k = 2;
    cv.width = Math.ceil((w + pad * 2) * k);
    cv.height = Math.ceil((h + pad * 2) * k);
    var c = cv.getContext('2d');
    c.scale(k, k);
    c.translate(pad + w / 2, pad + h / 2);
    paint(c);
    spr = { cv: cv, w: w + pad * 2, h: h + pad * 2 };
    sprites[key] = spr;
    return spr;
  }

  function stampSpr(spr, x, y, rot, sx, sy, alpha) {
    var c = ctx;
    var cos = Math.cos(rot), sin = Math.sin(rot);
    c.globalAlpha = alpha;
    c.setTransform(cos * sx * dpr, sin * sx * dpr, -sin * sy * dpr, cos * sy * dpr, x * dpr, y * dpr);
    c.drawImage(spr.cv, -spr.w / 2, -spr.h / 2, spr.w, spr.h);
  }

  function draw() {
    if (!ctx) return;
    resize();
    var c = ctx;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, canvas.width, canvas.height);
    var sparks = [];
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      if (p.kind === 'shell') continue;
      var k = p.age / p.life;
      var fade = Math.max(0, k > 0.75 ? 1 - (k - 0.75) / 0.25 : 1);
      if (p.kind === 'confetti') {
        var spr = sprite('cf' + p.color, 11, 7, function (g) {
          g.fillStyle = p.color; g.fillRect(-5.5, -3.5, 11, 7);
          g.strokeStyle = INK; g.lineWidth = 1.4; g.strokeRect(-5.5, -3.5, 11, 7);
        });
        stampSpr(spr, p.x, p.y, p.rot, p.size, p.size * Math.cos(p.flip), fade);
      } else if (p.kind === 'spark') {
        sparks.push(p);
      } else if (p.kind === 'star') {
        var st = sprite('st' + p.color, 20, 20, function (g) {
          g.beginPath();
          for (var ii = 0; ii < 10; ii++) {
            var r = ii % 2 ? 4.5 : 10;
            var a = (ii / 10) * Math.PI * 2 - Math.PI / 2;
            g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
          }
          g.closePath(); g.fillStyle = p.color; g.fill();
          g.strokeStyle = INK; g.lineWidth = 2; g.lineJoin = 'round'; g.stroke();
        });
        var s = 0.9 * p.size * (k < 0.15 ? k / 0.15 : 1);
        stampSpr(st, p.x, p.y, p.rot, s, s, fade);
      } else if (p.kind === 'coin') {
        var cn = sprite('coin', 24, 24, function (g) {
          g.beginPath(); g.arc(0, 0, 11, 0, 7); g.fillStyle = '#ffe14a'; g.fill();
          g.lineWidth = 2.4; g.strokeStyle = INK; g.stroke();
          g.beginPath(); g.arc(0, 0, 6.8, 0, 7); g.strokeStyle = '#e59b00'; g.lineWidth = 2; g.stroke();
        });
        stampSpr(cn, p.x, p.y, 0, p.size * Math.cos(p.flip), p.size, fade);
      } else if (p.kind === 'heart') {
        var ht = sprite('ht' + p.color, 28, 24, function (g) {
          var ss = 10;
          g.beginPath(); g.moveTo(0, ss * 0.8);
          g.bezierCurveTo(-ss * 1.4, -ss * 0.1, -ss * 0.8, -ss * 1.2, 0, -ss * 0.45);
          g.bezierCurveTo(ss * 0.8, -ss * 1.2, ss * 1.4, -ss * 0.1, 0, ss * 0.8);
          g.fillStyle = p.color; g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke();
        });
        stampSpr(ht, p.x, p.y, Math.sin(p.age * 5) * 0.3, p.size, p.size, fade);
      } else if (p.kind === 'ring') {
        var r = p.radius * (1 - Math.pow(1 - k, 3));
        c.setTransform(dpr, 0, 0, dpr, 0, 0);
        c.globalAlpha = 1 - k;
        c.beginPath(); c.arc(p.x, p.y, Math.max(0.1, r), 0, 7);
        c.strokeStyle = p.color; c.lineWidth = p.width * (1 - k) + 1; c.stroke();
      } else if (p.kind === 'text') {
        var pop = k < 0.12 ? 0.6 + (k / 0.12) * 0.5 : k < 0.2 ? 1.1 - ((k - 0.12) / 0.08) * 0.1 : 1;
        c.setTransform(dpr * pop, 0, 0, dpr * pop, p.x * dpr, p.y * dpr);
        c.globalAlpha = fade;
        c.font = '900 ' + p.size + 'px "PingFang TC","Microsoft JhengHei",system-ui,sans-serif';
        c.textAlign = 'center'; c.textBaseline = 'middle';
        c.lineWidth = p.size * 0.28; c.lineJoin = 'round';
        c.strokeStyle = INK; c.strokeText(p.str, 0, 0);
        c.fillStyle = p.color; c.fillText(p.str, 0, 0);
      } else if (p.kind === 'puff') {
        c.setTransform(dpr, 0, 0, dpr, 0, 0);
        c.globalAlpha = (1 - k) * 0.9;
        c.beginPath(); c.arc(p.x, p.y, p.size * (1 + k * 1.5), 0, 7);
        c.fillStyle = '#fff'; c.fill(); c.strokeStyle = INK; c.lineWidth = 1.6; c.stroke();
      } else if (p.kind === 'streamer' && p.trail.length >= 2) {
        c.setTransform(dpr, 0, 0, dpr, 0, 0);
        c.globalAlpha = fade; c.lineCap = 'round'; c.lineJoin = 'round';
        c.beginPath();
        for (var ti = 0; ti < p.trail.length; ti++) {
          var q = p.trail[ti];
          var off = Math.sin(ti * 0.8 + p.age * 12 + p.phase) * 5;
          if (ti === 0) c.moveTo(q.x, q.y + off); else c.lineTo(q.x, q.y + off);
        }
        c.strokeStyle = INK; c.lineWidth = p.w + 3; c.stroke();
        c.strokeStyle = p.color; c.lineWidth = p.w; c.stroke();
      }
    }
    if (sparks.length) {
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.globalCompositeOperation = 'lighter';
      c.lineCap = 'round';
      for (var si = 0; si < sparks.length; si++) {
        var sp = sparks[si];
        var kk = sp.age / sp.life;
        c.globalAlpha = Math.max(0, kk > 0.75 ? 1 - (kk - 0.75) / 0.25 : 1);
        c.strokeStyle = sp.color;
        c.lineWidth = 3 * (sp.size || 1) * (1 - kk * 0.6);
        c.beginPath();
        c.moveTo(sp.x, sp.y);
        c.lineTo(sp.x - sp.vx * 0.045, sp.y - sp.vy * 0.045);
        c.stroke();
      }
      c.globalCompositeOperation = 'source-over';
    }
    c.globalAlpha = 1;
  }

  function loop(t) {
    raf = requestAnimationFrame(loop);
    var dt = lastT ? Math.min(0.05, (t - lastT) / 1000) : 0.016;
    lastT = t;
    update(dt);
    draw();
  }

  function startLoop() {
    if (raf) return;
    lastT = 0;
    raf = requestAnimationFrame(loop);
    global.addEventListener('resize', resize);
  }

  /* ---- DOM motion (stamp / toast / score / shake) ---- */
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

  function domStamp(label, opts) {
    opts = opts || {};
    var layer = layer2d();
    var el = document.createElement('div');
    el.className = 'hcy-fx-stamp ' + (opts.soft ? 'is-soft' : 'is-good');
    el.textContent = label || 'Nice!';
    if (opts.x != null) el.style.left = opts.x + 'px';
    if (opts.y != null) el.style.top = opts.y + 'px';
    layer.appendChild(el);
    var intensity = clamp(opts.intensity != null ? opts.intensity : 0.5, 0, 1);
    var overshoot = 1.08 + intensity * 0.28;
    return animate(el, {
      transform: [
        'translate(-50%,-50%) scale(2.8) rotate(-18deg)',
        'translate(-50%,-50%) scale(' + overshoot + ') rotate(-6deg)',
        'translate(-50%,-50%) scale(1) rotate(-8deg)'
      ],
      opacity: [0, 1, 1]
    }, { duration: 0.4 + intensity * 0.15, easing: 'cubic-bezier(0.22, 1.55, 0.36, 1)' })
      .then(function () { return new Promise(function (r) { setTimeout(r, 500 + intensity * 400); }); })
      .then(function () {
        return animate(el, {
          opacity: [1, 0],
          transform: ['translate(-50%,-50%) scale(1)', 'translate(-50%,-50%) scale(1.2)']
        }, { duration: 0.28 });
      })
      .then(function () { el.remove(); });
  }

  function toast(msg, opts) {
    opts = opts || {};
    var layer = layer2d();
    var el = document.createElement('div');
    el.className = 'hcy-fx-toast';
    el.textContent = msg || '';
    layer.appendChild(el);
    return animate(el, {
      opacity: [0, 1, 1, 0],
      transform: [
        'translateX(-50%) translateY(-16px)',
        'translateX(-50%) translateY(0)',
        'translateX(-50%) translateY(0)',
        'translateX(-50%) translateY(-8px)'
      ]
    }, { duration: opts.duration || 1.8, easing: 'ease-out' })
      .then(function () { el.remove(); });
  }

  function scorePop(points, x, y, opts) {
    opts = opts || {};
    text(x != null ? x : innerWidth / 2, y != null ? y : innerHeight * 0.4,
      (points >= 0 ? '+' : '') + String(points), {
        color: opts.color || '#ffe14a',
        size: 22 + (opts.intensity || 0.5) * 18,
        vy: -120, life: 1.15
      });
  }

  function shake(target, opts) {
    opts = opts || {};
    var el = typeof target === 'string' ? document.querySelector(target) : (target || document.body);
    if (!el || reduceMotion) return Promise.resolve();
    var amp = (opts.intensity != null ? opts.intensity : 0.5) * (opts.soft ? 7 : 14);
    amp = clamp(amp, 2, 18) * motionScale;
    var keyframes = [];
    for (var i = 0; i < 10; i++) {
      var k = 1 - i / 10;
      keyframes.push({
        transform: 'translate(' + ((Math.random() * 2 - 1) * amp * k).toFixed(1) + 'px,' +
          ((Math.random() * 2 - 1) * amp * k * 0.65).toFixed(1) + 'px)'
      });
    }
    keyframes.push({ transform: 'translate(0,0)' });
    return animate(el, keyframes, { duration: opts.soft ? 0.32 : 0.45, easing: 'ease-out' })
      .then(function () { el.style.transform = ''; });
  }

  /** Escalating celebrate at screen center — density climbs with E */
  function celebrate(E, opts) {
    ensureRoot();
    opts = opts || {};
    E = clamp(E == null ? 0.5 : E, 0, 1.2);
    var cx = opts.x != null ? opts.x : innerWidth / 2;
    var cy = opts.y != null ? opts.y : innerHeight * 0.4;
    var W = innerWidth, H = innerHeight;
    var kinds = ['confetti'];
    if (E > 0.15) kinds.push('star');
    if (E > 0.35) kinds.push('spark', 'spark');
    if (E > 0.55) kinds.push('coin');
    if (E > 0.7) kinds.push('heart');

    var n = Math.round(20 + 90 * Math.min(1.15, E));
    burst(cx, cy, { count: n, speed: 520 + 520 * E, kinds: kinds, up: 250, life: 0.65 });
    ring(cx, cy, { color: E > 0.5 ? '#ffe14a' : '#ff7ab6', radius: 100 + 180 * E, width: 9 });
    if (E > 0.22) burst(cx, cy, { count: Math.round(80 * Math.min(1.2, E)), speed: 900 + 400 * E, kinds: kinds, up: 380 });
    if (E > 0.28) streamers(W, H, Math.round(3 + 7 * E));
    if (E > 0.48) fireworks(W, H, Math.round(2 + 7 * E), 0.06, 0.32);
    if (E > 0.62) rain(W, Math.round(24 + 40 * E), { kinds: ['confetti', 'confetti', 'star', 'coin'] });
    if (E > 0.85) {
      burst(cx, cy, { count: 55, speed: 1100, kinds: ['spark', 'star', 'coin'], up: 120, life: 0.7 });
      fireworks(W, H, 6, 0.05, 0.4);
    }
  }

  function hitBurst(E, x, y) {
    E = clamp(E == null ? 0.4 : E, 0, 1.2);
    x = x != null ? x : innerWidth / 2;
    y = y != null ? y : innerHeight * 0.45;
    var kinds = ['confetti'];
    if (E > 0.18) kinds.push('star');
    if (E > 0.4) kinds.push('spark', 'spark');
    if (E > 0.58) kinds.push('coin');
    burst(x, y, { count: Math.round(8 + 28 * E), speed: 280 + 280 * E, kinds: kinds.filter(function (k) { return k !== 'coin'; }), up: 130, life: 0.55 });
    if (E > 0.35) burst(x, y, { count: Math.round(36 * E), speed: 720, kinds: kinds, up: 200 });
    ring(x, y, { color: E > 0.5 ? '#ffe14a' : '#ff7ab6', radius: 45 + 70 * E, width: 6 });
  }

  global.HcyFxMotion = {
    PASTEL: PASTEL,
    ensureRoot: ensureRoot,
    layer2d: layer2d,
    animate: animate,
    burst: burst,
    ring: ring,
    text: text,
    puff: puff,
    fireworks: fireworks,
    streamers: streamers,
    rain: rain,
    celebrate: celebrate,
    hitBurst: hitBurst,
    stamp: domStamp,
    toast: toast,
    scorePop: scorePop,
    shake: shake,
    setReduced: function (v) { reduceMotion = !!v; },
    setMotionScale: function (v) { motionScale = clamp(v, 0, 1); },
    isReduced: function () { return reduceMotion; },
    particleCount: function () { return parts.length; }
  };
})(typeof window !== 'undefined' ? window : this);
