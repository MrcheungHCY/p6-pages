/*! Underground castle / dungeon hall — Three.js with 2D canvas fallback */
(function (global) {
  'use strict';

  var canvas, mode = 'none', raf = 0, disposed = false;
  var renderer, scene, camera, lights = [], crystals = [], torches = [];
  var phase = 1, shakeT = 0, flash = null, t0 = 0;
  var ctx2d = null, w = 0, h = 0;
  var progress = 0, progressNow = 0, walkUntil = 0, lastFrame = 0;
  var CAM_Z0 = 15.2, CAM_Z1 = 7.2, LOOK_Z0 = -3.6, LOOK_Z1 = -11.6;
  var CAM_Y = 2.55, LOOK_Y = 2.05;

  function stepProgress(now) {
    var dt = lastFrame ? Math.min(0.05, (now - lastFrame) / 1000) : 0.016;
    lastFrame = now;
    progressNow += (progress - progressNow) * (1 - Math.exp(-dt / 0.28));
    if (Math.abs(progress - progressNow) < 0.0008) progressNow = progress;
    return progressNow;
  }

  function walkBob(now) {
    if (now >= walkUntil) return 0;
    return Math.abs(Math.sin(now / 70)) * 0.18;
  }

  function hasWebGL() {
    try {
      var c = document.createElement('canvas');
      return !!(c.getContext('webgl') || c.getContext('experimental-webgl'));
    } catch (e) { return false; }
  }

  function stoneTexture(THREE, size, pal) {
    var c = document.createElement('canvas');
    c.width = c.height = size;
    var g = c.getContext('2d');
    g.fillStyle = pal[0];
    g.fillRect(0, 0, size, size);
    var i, x, y, s;
    for (i = 0; i < 80; i++) {
      x = Math.random() * size;
      y = Math.random() * size;
      s = 18 + Math.random() * 48;
      g.fillStyle = pal[1 + (i % (pal.length - 1))];
      g.fillRect(x, y, s, s * 0.62);
      g.strokeStyle = 'rgba(0,0,0,0.28)';
      g.strokeRect(x, y, s, s * 0.62);
    }
    for (i = 0; i < 400; i++) {
      g.fillStyle = 'rgba(0,0,0,' + (Math.random() * 0.18) + ')';
      g.fillRect(Math.random() * size, Math.random() * size, 2, 2);
    }
    var tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    tex.anisotropy = 4;
    tex.needsUpdate = true;
    return tex;
  }

  function windowTexture(THREE) {
    var c = document.createElement('canvas');
    c.width = 256; c.height = 384;
    var g = c.getContext('2d');
    g.fillStyle = '#1a1028';
    g.fillRect(0, 0, 256, 384);
    var cols = ['#6b3aa8', '#2a6aa8', '#c45a8a', '#3cb89a', '#d4a03a'];
    var i, j;
    for (i = 0; i < 4; i++) {
      for (j = 0; j < 6; j++) {
        g.fillStyle = cols[(i + j) % cols.length];
        g.globalAlpha = 0.85;
        g.fillRect(12 + i * 60, 16 + j * 60, 50, 50);
      }
    }
    g.globalAlpha = 1;
    g.strokeStyle = '#e6c15a';
    g.lineWidth = 6;
    g.strokeRect(8, 8, 240, 368);
    var tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }

  function makeHall(THREE) {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0710);
    scene.fog = new THREE.FogExp2(0x120a18, 0.028);

    camera = new THREE.PerspectiveCamera(52, 1, 0.1, 120);
    camera.position.set(0, CAM_Y, CAM_Z0);
    camera.lookAt(0, LOOK_Y, LOOK_Z0);

    var floorTex = stoneTexture(THREE, 256, ['#2a2430', '#3a3340', '#241e28', '#4a4250']);
    var wallTex = stoneTexture(THREE, 256, ['#1e1826', '#2c2434', '#3a2e42', '#261c30']);

    var floorMat = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.88, metalness: 0.04, color: 0x9a90a4 });
    var floor = new THREE.Mesh(new THREE.PlaneGeometry(48, 48), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    var wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.92, color: 0x8a7e96 });
    var back = new THREE.Mesh(new THREE.BoxGeometry(28, 14, 1.2), wallMat);
    back.position.set(0, 7, -14);
    scene.add(back);

    var i, col, cap, x;
    var colMat = new THREE.MeshStandardMaterial({ color: 0x6a6274, roughness: 0.7, map: wallTex });
    var capMat = new THREE.MeshStandardMaterial({ color: 0xc9a24a, roughness: 0.45, metalness: 0.2 });
    for (i = 0; i < 6; i++) {
      x = -10;
      [-1, 1].forEach(function (side) {
        col = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.7, 8.4, 10), colMat);
        col.position.set(side * 10, 4.2, 8 - i * 3.6);
        scene.add(col);
        cap = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.4, 1.8), capMat);
        cap.position.set(side * 10, 8.5, 8 - i * 3.6);
        scene.add(cap);
      });
    }

    var beamMat = new THREE.MeshStandardMaterial({ color: 0x3a2a20, roughness: 0.9 });
    for (i = 0; i < 5; i++) {
      var beam = new THREE.Mesh(new THREE.BoxGeometry(22, 0.4, 0.5), beamMat);
      beam.position.set(0, 11.2, 6 - i * 4);
      scene.add(beam);
    }
    var ceil = new THREE.Mesh(new THREE.BoxGeometry(30, 0.6, 32), wallMat);
    ceil.position.set(0, 12, -2);
    scene.add(ceil);

    var daisMat = new THREE.MeshStandardMaterial({ color: 0x4a3a58, roughness: 0.7, map: floorTex });
    var dais = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.8, 0.7, 16), daisMat);
    dais.position.set(4.2, 0.35, -6.4);
    scene.add(dais);
    var step = new THREE.Mesh(new THREE.CylinderGeometry(4.4, 4.7, 0.35, 16), daisMat);
    step.position.set(4.2, 0.12, -6.4);
    scene.add(step);

    var winTex = windowTexture(THREE);
    var winMat = new THREE.MeshBasicMaterial({ map: winTex, transparent: true, opacity: 0.95 });
    var win = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 7.2), winMat);
    win.position.set(-3.2, 6.4, -13.3);
    scene.add(win);
    var shaft = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 10),
      new THREE.MeshBasicMaterial({ color: 0x7a4ac8, transparent: true, opacity: 0.09, side: THREE.DoubleSide, depthWrite: false })
    );
    shaft.position.set(-2.2, 4, -8);
    shaft.rotation.x = -0.4;
    scene.add(shaft);

    var crystalGeo = new THREE.OctahedronGeometry(0.55, 0);
    var crystalMat = new THREE.MeshStandardMaterial({
      color: 0xb48cff, emissive: 0x4a2080, emissiveIntensity: 0.6,
      roughness: 0.25, metalness: 0.3, transparent: true, opacity: 0.92
    });
    for (i = 0; i < 7; i++) {
      var cr = new THREE.Mesh(crystalGeo, crystalMat.clone());
      cr.position.set(-8 + i * 2.4, 0.4, -11 + (i % 3));
      cr.scale.set(0.7 + (i % 3) * 0.25, 1.2 + (i % 2) * 0.5, 0.7);
      cr.userData.baseY = cr.position.y;
      cr.userData.spin = 0.4 + i * 0.1;
      crystals.push(cr);
      scene.add(cr);
    }

    var amb = new THREE.AmbientLight(0x3a2a4a, 0.55);
    scene.add(amb);
    var moon = new THREE.DirectionalLight(0xb08cff, 0.85);
    moon.position.set(-6, 14, 4);
    scene.add(moon);
    var fill = new THREE.DirectionalLight(0xffc07a, 0.28);
    fill.position.set(8, 6, 10);
    scene.add(fill);

    function addTorch(x, z) {
      var hold = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.7, 0.18), new THREE.MeshStandardMaterial({ color: 0x3a2410 }));
      hold.position.set(x, 3.1, z);
      scene.add(hold);
      var flame = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffb14a })
      );
      flame.position.set(x, 3.55, z);
      scene.add(flame);
      var pl = new THREE.PointLight(0xff9a3a, 1.4, 12, 2);
      pl.position.set(x, 3.6, z);
      scene.add(pl);
      torches.push({ flame: flame, light: pl, base: 1.4 });
    }
    for (i = 0; i < 5; i++) {
      addTorch(-9.3, 7 - i * 3.6);
      addTorch(9.3, 7 - i * 3.6);
    }

    var chand = new THREE.PointLight(0xe6c15a, 0.7, 20);
    chand.position.set(0, 9.4, -1);
    scene.add(chand);
    lights.push(amb, moon, fill, chand);
  }

  function render3d(now) {
    if (disposed || mode !== 'webgl') return;
    var t = (now - t0) / 1000;
    var p = stepProgress(now);
    camera.position.x = Math.sin(t * 0.22) * 0.35;
    camera.position.y = CAM_Y + Math.sin(t * 0.35) * 0.08 + walkBob(now);
    camera.position.z = CAM_Z0 + (CAM_Z1 - CAM_Z0) * p;
    if (shakeT > 0) {
      camera.position.x += (Math.random() - 0.5) * 0.18;
      camera.position.y += (Math.random() - 0.5) * 0.1;
      shakeT -= 16;
    }
    camera.lookAt(0, LOOK_Y, LOOK_Z0 + (LOOK_Z1 - LOOK_Z0) * p);
    var i, cr, to;
    for (i = 0; i < crystals.length; i++) {
      cr = crystals[i];
      cr.rotation.y += 0.008 * cr.userData.spin;
      cr.position.y = cr.userData.baseY + Math.sin(t * 1.2 + i) * (phase === 2 ? 0.35 : 0.12);
      if (phase === 2 && cr.material.emissiveIntensity != null) {
        cr.material.emissiveIntensity = 0.8 + Math.sin(t * 3 + i) * 0.3;
      }
    }
    for (i = 0; i < torches.length; i++) {
      to = torches[i];
      var flick = 1 + Math.sin(t * 9 + i) * 0.18 + Math.random() * 0.08;
      to.light.intensity = to.base * flick * (phase === 2 ? 1.15 : 1);
      to.flame.scale.setScalar(0.9 + flick * 0.15);
    }
    if (flash) {
      flash.intensity *= 0.86;
      if (flash.intensity < 0.04) {
        scene.remove(flash);
        flash = null;
      }
    }
    renderer.render(scene, camera);
    raf = requestAnimationFrame(render3d);
  }

  function resize() {
    if (!canvas) return;
    w = canvas.clientWidth || global.innerWidth;
    h = canvas.clientHeight || global.innerHeight;
    if (mode === 'webgl' && renderer && camera) {
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    } else if (mode === '2d' && canvas) {
      var dpr = Math.min(2, global.devicePixelRatio || 1);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
    }
  }

  function paint2d() {
    if (disposed || mode !== '2d' || !ctx2d) return;
    var c = canvas;
    var dpr = Math.min(2, global.devicePixelRatio || 1);
    var W = c.width, H = c.height;
    var g = ctx2d;
    var now2 = performance.now();
    var t = (now2 - t0) / 1000;
    var p = stepProgress(now2);
    g.setTransform(1, 0, 0, 1, 0, 0);
    var bg = g.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, phase === 2 ? '#1a0a28' : '#140c1c');
    bg.addColorStop(0.45, '#2a1a30');
    bg.addColorStop(1, '#1a1210');
    g.fillStyle = bg;
    g.fillRect(0, 0, W, H);

    // stained window
    var wx = W * 0.32, wy = H * (0.08 - p * 0.05), ww = W * 0.2, wh = H * 0.32;
    g.fillStyle = phase === 2 ? '#7a3cb0' : '#4a2a88';
    g.globalAlpha = 0.85;
    g.beginPath();
    g.moveTo(wx + ww / 2, wy);
    g.quadraticCurveTo(wx + ww, wy + 10, wx + ww, wy + wh * 0.3);
    g.lineTo(wx + ww, wy + wh);
    g.lineTo(wx, wy + wh);
    g.lineTo(wx, wy + wh * 0.3);
    g.quadraticCurveTo(wx, wy + 10, wx + ww / 2, wy);
    g.fill();
    g.globalAlpha = 1;
    g.strokeStyle = '#e6c15a';
    g.lineWidth = 4 * dpr;
    g.stroke();

    // floor vanishing tiles
    var horizon = H * (0.46 - p * 0.07);
    var k, row;
    g.strokeStyle = 'rgba(80,70,90,0.45)';
    g.lineWidth = 2 * dpr;
    for (row = 0; row < 14; row++) {
      var y = horizon + Math.pow(((row + p * 2.4) % 14) / 14, 1.4) * (H - horizon);
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(W, y);
      g.stroke();
    }
    for (k = -10; k <= 10; k++) {
      g.beginPath();
      g.moveTo(W / 2 + k * 28 * dpr, horizon);
      g.lineTo(W / 2 + k * 180 * dpr, H);
      g.stroke();
    }

    // pillars
    function pillar(px) {
      var grad = g.createLinearGradient(px - 30, 0, px + 30, 0);
      grad.addColorStop(0, '#1a1620');
      grad.addColorStop(0.5, '#5a5064');
      grad.addColorStop(1, '#1a1620');
      g.fillStyle = grad;
      g.fillRect(px - 22 * dpr, H * 0.2, 44 * dpr, H * 0.7);
      g.fillStyle = '#c9a24a';
      g.fillRect(px - 30 * dpr, H * 0.18, 60 * dpr, 10 * dpr);
    }
    pillar(W * 0.08);
    pillar(W * 0.2);
    pillar(W * 0.8);
    pillar(W * 0.92);

    // torches
    function torch(px, py) {
      var flick = 0.7 + Math.sin(t * 9 + px) * 0.15;
      g.fillStyle = '#3a2410';
      g.fillRect(px - 4 * dpr, py, 8 * dpr, 28 * dpr);
      var rg = g.createRadialGradient(px, py, 2, px, py, 50 * dpr * flick);
      rg.addColorStop(0, 'rgba(255,220,120,0.9)');
      rg.addColorStop(0.4, 'rgba(255,140,40,0.35)');
      rg.addColorStop(1, 'rgba(255,80,0,0)');
      g.fillStyle = rg;
      g.beginPath();
      g.arc(px, py, 50 * dpr * flick, 0, Math.PI * 2);
      g.fill();
    }
    torch(W * 0.08, H * 0.38);
    torch(W * 0.2, H * 0.4);
    torch(W * 0.8, H * 0.4);
    torch(W * 0.92, H * 0.38);

    // dais
    g.fillStyle = 'rgba(60,48,72,0.85)';
    g.beginPath();
    g.ellipse(W * 0.7, H * 0.72, W * 0.16, H * 0.05, 0, 0, Math.PI * 2);
    g.fill();

    if (shakeT > 0) shakeT -= 16;
    raf = requestAnimationFrame(paint2d);
  }

  function init3d() {
    var THREE = global.THREE;
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(2, global.devicePixelRatio || 1));
    renderer.setClearColor(0x0b0710, 1);
    if (renderer.outputColorSpace !== undefined && THREE.SRGBColorSpace) {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    }
    makeHall(THREE);
    mode = 'webgl';
    resize();
    t0 = performance.now();
    raf = requestAnimationFrame(render3d);
  }

  function init2d() {
    ctx2d = canvas.getContext('2d');
    mode = '2d';
    canvas.style.background = '#0b0710';
    resize();
    t0 = performance.now();
    raf = requestAnimationFrame(paint2d);
  }

  var DungeonScene = {
    init: function (el) {
      canvas = typeof el === 'string' ? document.getElementById(el) : el;
      disposed = false;
      phase = 1;
      progress = 0;
      progressNow = 0;
      walkUntil = 0;
      if (global.THREE && hasWebGL()) {
        try {
          init3d();
        } catch (err) {
          console.warn('[DungeonScene] WebGL failed, using 2D fallback', err);
          init2d();
        }
      } else {
        init2d();
      }
      global.addEventListener('resize', resize);
      return mode;
    },
    mode: function () { return mode; },
    setPhase: function (p) {
      phase = p === 2 ? 2 : 1;
      if (mode === 'webgl' && scene && scene.fog) {
        scene.fog.color.set(phase === 2 ? 0x2a0a28 : 0x120a18);
        if (scene.background) scene.background.set(phase === 2 ? 0x180814 : 0x0b0710);
      }
    },
    setProgress: function (p, instant) {
      var n = Number(p);
      if (!isFinite(n)) n = 0;
      progress = Math.max(0, Math.min(1, n));
      if (instant) progressNow = progress;
    },
    walk: function (ms) { walkUntil = performance.now() + (ms || 820); },
    shake: function (ms) { shakeT = Math.max(shakeT, ms || 280); },
    flash: function (hex) {
      if (mode !== 'webgl' || !scene || !global.THREE) return;
      if (flash) scene.remove(flash);
      flash = new global.THREE.PointLight(hex || 0xfff0c0, 3.2, 30);
      flash.position.set(2, 4, 2);
      scene.add(flash);
    },
    destroy: function () {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      global.removeEventListener('resize', resize);
      if (renderer) {
        try { renderer.dispose(); } catch (e) {}
      }
    }
  };

  global.DungeonScene = DungeonScene;
})(typeof window !== 'undefined' ? window : globalThis);
