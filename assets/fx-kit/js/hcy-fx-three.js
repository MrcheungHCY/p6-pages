/*! HCY FX — single WebGL context: celebration particles + soft 3D mascot buddy (IIFE).
 *  ONE renderer. Soft key+fill+rim, matte/plush materials, contact shadow, gentle idle.
 *  Mascot falls back to flat PNG/SVG via HcyFxMascot when WebGL off.
 *  No IP lookalikes — lighting/rounding/easing only. */
(function (global) {
  'use strict';

  var ready = false;
  var use3d = false;
  var renderer = null, scene = null, camera = null;
  var canvas = null;
  var particles = null, stampMesh = null;
  var clock = 0;
  var pending = [];
  var intensity = 0.5;
  var raf = 0;
  var quality = 'high'; // 'high' | 'soft' (projector-friendly)

  // Lights
  var lightAmb = null, lightKey = null, lightFill = null, lightRim = null;

  // Mascot buddy (same scene)
  var mascotMode = '3d';
  var mascotGroup = null;
  var mascotBody = null;
  var mascotBillboard = null;
  var mascotMat = null;
  var mascotShadow = null;
  var mascotTex = { idle: null, happy: null, oops: null };
  var mascotPose = 'idle';
  var mascotArtBase = 'mascot/';
  var mascotSlot = null;
  var mascotAnim = null;
  var mascotBaseY = 0;
  var loader = null;
  var earL = null, earR = null;

  var PASTEL = [0xff7ab6, 0x5ec8ff, 0x7dffb3, 0xffe14a, 0xb48cff, 0xff9a4a, 0xffffff];

  function hasWebGL() {
    try {
      var c = document.createElement('canvas');
      return !!(c.getContext('webgl') || c.getContext('experimental-webgl'));
    } catch (e) { return false; }
  }

  function cssColor(name, fallback) {
    try {
      var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      if (v) return v;
    } catch (e) {}
    return fallback;
  }

  function ensureHost() {
    var root = document.getElementById('hcy-fx-root');
    if (!root && global.HcyFxMotion) root = global.HcyFxMotion.ensureRoot();
    if (!root) {
      root = document.createElement('div');
      root.id = 'hcy-fx-root';
      root.className = 'hcy-fx-root';
      (document.body || document.documentElement).appendChild(root);
    }
    var host = document.getElementById('hcy-fx-three');
    if (!host) {
      host = document.createElement('canvas');
      host.id = 'hcy-fx-three';
      host.className = 'hcy-fx-layer-3d';
      root.insertBefore(host, root.firstChild);
    }
    return host;
  }

  function pixelRatioForQuality() {
    var dpr = global.devicePixelRatio || 1;
    if (quality === 'soft') return Math.min(1.25, dpr);
    return Math.min(2, dpr);
  }

  function buildLights(THREE) {
    // Soft ambient (plush fill — no harsh black)
    lightAmb = new THREE.AmbientLight(0xfff0f6, 0.72);
    scene.add(lightAmb);
    // Single soft key — warm product-shot feel
    lightKey = new THREE.DirectionalLight(0xfff5ea, 0.55);
    lightKey.position.set(2.2, 4.5, 3.2);
    scene.add(lightKey);
    // Cool fill from opposite side (toy photography)
    lightFill = new THREE.DirectionalLight(0xd8ecff, 0.28);
    lightFill.position.set(-3.2, 1.8, 1.5);
    scene.add(lightFill);
    // Subtle rim — separates silhouette without specular spikes
    lightRim = new THREE.DirectionalLight(0xffe8f2, 0.22);
    lightRim.position.set(0.4, 2.5, -3.5);
    scene.add(lightRim);
  }

  function matteBodyMat(THREE, tint) {
    // Prefer Lambert (matte) — avoid Phong/Standard specular spikes (shiny plastic)
    if (THREE.MeshLambertMaterial) {
      return new THREE.MeshLambertMaterial({
        color: tint, transparent: true, opacity: 0.94,
        flatShading: false
      });
    }
    return new THREE.MeshBasicMaterial({ color: tint, transparent: true, opacity: 0.94 });
  }

  function buildMascot(THREE) {
    if (mascotGroup) return;
    mascotGroup = new THREE.Group();
    mascotGroup.name = 'hcy-mascot-buddy';
    mascotGroup.visible = false;

    var tint = new THREE.Color(cssColor('--hcy-mesh-tint', '#ffb8d9'));

    // Soft rounded capsule/sphere buddy (toy presence — not a character IP)
    var bodyGeo;
    if (THREE.CapsuleGeometry) {
      bodyGeo = new THREE.CapsuleGeometry(0.48, 0.22, 10, 20);
    } else {
      bodyGeo = new THREE.SphereGeometry(0.58, 32, 24);
    }
    var bodyMat = matteBodyMat(THREE, tint);
    mascotBody = new THREE.Mesh(bodyGeo, bodyMat);
    mascotBody.scale.set(1, 1.08, 0.92);
    mascotBody.position.y = 0.05;
    mascotGroup.add(mascotBody);

    // Soft ear blobs (simple rounded — generic cute toy, not any franchise)
    var earGeo = new THREE.SphereGeometry(0.17, 14, 12);
    var earMat = matteBodyMat(THREE, tint.clone().offsetHSL(0, 0.02, 0.04));
    earL = new THREE.Mesh(earGeo, earMat);
    earL.position.set(-0.4, 0.48, 0.04);
    earL.scale.set(1, 1.25, 0.85);
    earR = earL.clone();
    earR.material = earMat.clone();
    earR.position.x = 0.4;
    mascotGroup.add(earL);
    mascotGroup.add(earR);

    // Soft billboard for Legacy PNG pose textures (matte, no harsh edge slam)
    var planeGeo = new THREE.PlaneGeometry(1.12, 1.12);
    mascotMat = new THREE.MeshBasicMaterial({
      transparent: true, opacity: 0, depth: true, side: THREE.DoubleSide,
      depthWrite: false
    });
    mascotBillboard = new THREE.Mesh(planeGeo, mascotMat);
    mascotBillboard.position.z = 0.52;
    mascotBillboard.position.y = 0.06;
    mascotGroup.add(mascotBillboard);

    // Soft AO-ish contact shadow on ground (ellipse under buddy)
    var shadowGeo = new THREE.CircleGeometry(0.55, 32);
    var shadowMat = new THREE.MeshBasicMaterial({
      color: 0x2a1830, transparent: true, opacity: 0.22,
      depthWrite: false, side: THREE.DoubleSide
    });
    mascotShadow = new THREE.Mesh(shadowGeo, shadowMat);
    mascotShadow.rotation.x = -Math.PI / 2;
    mascotShadow.position.y = -0.72;
    mascotShadow.scale.set(1, 0.55, 1);
    mascotGroup.add(mascotShadow);

    scene.add(mascotGroup);
    if (!loader) loader = new THREE.TextureLoader();
  }

  function applyTint() {
    if (!mascotBody) return;
    try {
      var c = new global.THREE.Color(cssColor('--hcy-mesh-tint', '#ffb8d9'));
      mascotBody.material.color.copy(c);
      if (earL && earL.material) earL.material.color.copy(c).offsetHSL(0, 0.02, 0.04);
      if (earR && earR.material) earR.material.color.copy(c).offsetHSL(0, 0.02, 0.04);
    } catch (e) {}
  }

  function loadPoseTexture(pose, url) {
    if (!use3d || !loader) return;
    if (!url) {
      if (mascotTex[pose] && mascotTex[pose].dispose) {
        try { mascotTex[pose].dispose(); } catch (e) {}
      }
      mascotTex[pose] = null;
      if (mascotPose === pose) applyMascotPoseVisual();
      return;
    }
    loader.load(
      url + (url.indexOf('?') >= 0 ? '&' : '?') + '_=' + Date.now(),
      function (tex) {
        tex.colorSpace = global.THREE.SRGBColorSpace || global.THREE.sRGBEncoding;
        tex.minFilter = global.THREE.LinearFilter;
        tex.magFilter = global.THREE.LinearFilter;
        tex.generateMipmaps = true;
        if (mascotTex[pose] && mascotTex[pose].dispose) {
          try { mascotTex[pose].dispose(); } catch (e) {}
        }
        mascotTex[pose] = tex;
        if (mascotPose === pose) applyMascotPoseVisual();
      },
      undefined,
      function () {
        mascotTex[pose] = null;
        if (mascotPose === pose) applyMascotPoseVisual();
      }
    );
  }

  function applyMascotPoseVisual() {
    if (!mascotBillboard || !mascotMat) return;
    var tex = mascotTex[mascotPose] || mascotTex.idle;
    if (tex) {
      mascotMat.map = tex;
      mascotMat.opacity = 1;
      mascotMat.needsUpdate = true;
      // Soft mesh under PNG — not harsh flat slam; slight body peek for roundness
      if (mascotBody) mascotBody.material.opacity = 0.12;
      if (earL) earL.visible = false;
      if (earR) earR.visible = false;
      if (stageFloor) stageFloor.visible = true;
    } else {
      mascotMat.map = null;
      mascotMat.opacity = 0;
      mascotMat.needsUpdate = true;
      if (mascotBody) mascotBody.material.opacity = 0.94;
      if (earL) earL.visible = true;
      if (earR) earR.visible = true;
      applyTint();
    }
  }

  function loadIdlePrefer3q() {
    if (!use3d || !loader) return;
    var url3q = mascotArtBase + 'idle-3q.png';
    var urlFlat = mascotArtBase + 'idle.png';
    loader.load(
      url3q + '?_=' + Date.now(),
      function (tex) {
        tex.colorSpace = global.THREE.SRGBColorSpace || global.THREE.sRGBEncoding;
        tex.minFilter = global.THREE.LinearFilter;
        tex.magFilter = global.THREE.LinearFilter;
        if (mascotTex.idle && mascotTex.idle.dispose) {
          try { mascotTex.idle.dispose(); } catch (e) {}
        }
        mascotTex.idle = tex;
        if (mascotPose === 'idle') applyMascotPoseVisual();
      },
      undefined,
      function () {
        // No ¾ plate — use remastered flat idle
        loadPoseTexture('idle', urlFlat);
      }
    );
  }

  function setMascotArtBase(base) {
    mascotArtBase = (base || 'mascot/').replace(/\/?$/, '/');
    if (!use3d) return;
    // Prefer idle-3q (¾ turn) for 3D billboard; happy/oops use remastered flats
    loadIdlePrefer3q();
    loadPoseTexture('happy', mascotArtBase + 'happy.png');
    loadPoseTexture('oops', mascotArtBase + 'oops.png');
    ensureStageFloorArt();
    applyTint();
  }

  function setMascotPose(pose) {
    if (pose !== 'happy' && pose !== 'oops') pose = 'idle';
    mascotPose = pose;
    applyMascotPoseVisual();
  }

  function setMascotMode(mode) {
    mascotMode = mode === '2d' ? '2d' : '3d';
    updateMascotVisibility();
  }

  function setMascotSlot(el) {
    mascotSlot = typeof el === 'string' ? document.querySelector(el) : el;
  }

  function setQuality(q) {
    quality = q === 'soft' ? 'soft' : 'high';
    if (renderer) {
      renderer.setPixelRatio(pixelRatioForQuality());
      onResize();
      // Soft: dim rim slightly for cheaper look on projectors
      if (lightRim) lightRim.intensity = quality === 'soft' ? 0.12 : 0.22;
      if (lightKey) lightKey.intensity = quality === 'soft' ? 0.42 : 0.55;
      if (particles && particles.material) {
        particles.material.size = quality === 'soft' ? 0.22 : 0.16;
      }
    }
  }

  function updateMascotVisibility() {
    if (!mascotGroup) return;
    mascotGroup.visible = !!(use3d && mascotMode === '3d');
  }

  function syncMascotScreen() {
    if (!mascotGroup || !mascotGroup.visible || !camera || !renderer) return;
    var el = mascotSlot || document.getElementById('hcy-mascot-slot');
    if (!el) {
      mascotBaseY = -1.15;
      if (!mascotAnim) mascotGroup.position.set(0, mascotBaseY, 0);
      else { mascotGroup.position.x = 0; mascotGroup.position.z = 0; }
      return;
    }
    var r = el.getBoundingClientRect();
    var cx = r.left + r.width / 2;
    var cy = r.top + r.height * 0.58;
    var ndcX = (cx / innerWidth) * 2 - 1;
    var ndcY = -(cy / innerHeight) * 2 + 1;
    var v = new global.THREE.Vector3(ndcX, ndcY, 0.5);
    v.unproject(camera);
    var dir = v.sub(camera.position).normalize();
    var dist = -camera.position.z / dir.z;
    var pos = camera.position.clone().add(dir.multiplyScalar(dist));
    var slotH = Math.max(100, r.height);
    // Larger on-stage presence (~40%+ stage height via worldScale boost)
    var worldScale = (slotH / innerHeight) * 8.6;
    mascotBaseY = pos.y;
    mascotGroup.position.x = pos.x;
    mascotGroup.position.z = pos.z;
    if (!mascotAnim) mascotGroup.position.y = pos.y;
    mascotGroup.scale.setScalar(Math.max(0.85, Math.min(2.15, worldScale)));
  }

  function hopMascot(E, opts) {
    opts = opts || {};
    if (!mascotGroup || mascotMode !== '3d' || !use3d) return;
    setMascotPose('happy');
    var holdMs = opts.holdMs != null ? opts.holdMs : 1000;
    mascotAnim = {
      kind: 'hop', t: 0,
      dur: 0.62 + (E || 0.4) * 0.22,
      hold: holdMs / 1000,
      E: E || 0.4,
      pose: 'happy'
    };
  }

  function wrongMascot(E, opts) {
    opts = opts || {};
    if (!mascotGroup || mascotMode !== '3d' || !use3d) return;
    setMascotPose('oops');
    var holdMs = opts.holdMs != null ? opts.holdMs : 800;
    mascotAnim = {
      kind: 'squash', t: 0,
      dur: 0.62,
      hold: holdMs / 1000,
      E: E || 0.35,
      pose: 'oops'
    };
  }

  function stampMascot(E, opts) {
    opts = opts || {};
    if (!mascotGroup || mascotMode !== '3d' || !use3d) return;
    if ((E || 0) < 0.25) return;
    setMascotPose('happy');
    var holdMs = opts.holdMs != null ? opts.holdMs : 720;
    mascotAnim = {
      kind: 'pop', t: 0,
      dur: 0.42,
      hold: holdMs / 1000,
      E: E || 0.5,
      pose: 'happy'
    };
  }

  function tapMascot(E, opts) {
    opts = opts || {};
    if (!mascotGroup || mascotMode !== '3d' || !use3d) return;
    var holdMs = opts.holdMs != null ? opts.holdMs : 420;
    mascotAnim = {
      kind: 'tap', t: 0,
      dur: 0.38,
      hold: holdMs / 1000,
      E: E || 0.55,
      pose: mascotPose || 'idle'
    };
  }

  function isMascotVisible() {
    return !!(use3d && mascotMode === '3d' && mascotGroup && mascotGroup.visible);
  }

  function hasMascotTexture(pose) {
    pose = pose || mascotPose;
    return !!(mascotTex[pose] || mascotTex.idle);
  }

  /** Smoothstep + overshoot helper for spring-ish 3D motion */
  function smooth01(k) {
    k = Math.max(0, Math.min(1, k));
    return k * k * (3 - 2 * k);
  }

  function tickMascot(dt) {
    if (!mascotGroup || !mascotGroup.visible) return;
    syncMascotScreen();
    var s = mascotGroup.scale.x;

    if (!mascotAnim) {
      // Clear idle bob + breathe — readable on projector, paused while react anim runs
      var breathe = Math.sin(clock * 2.35) * 0.095;
      var sway = Math.sin(clock * 1.15) * 0.09;
      mascotGroup.rotation.z = sway;
      mascotGroup.rotation.y = Math.sin(clock * 0.85) * 0.08;
      mascotGroup.position.y = mascotBaseY + breathe * s;
      if (mascotBody) {
        mascotBody.scale.set(1 + breathe * 0.55, 1.08 - breathe * 0.5, 0.92);
      }
      if (mascotShadow) {
        var sh = 1 - breathe * 2.8;
        mascotShadow.scale.set(Math.max(0.65, sh), 0.55, 1);
        mascotShadow.material.opacity = 0.2 + Math.max(0, -breathe) * 0.14;
      }
      return;
    }

    mascotAnim.t += dt;
    var t = mascotAnim.t;
    var dur = mascotAnim.dur;
    var hold = mascotAnim.hold != null ? mascotAnim.hold : dur;
    var E = mascotAnim.E || 0.4;

    if (t <= dur) {
      var k = Math.min(1, t / dur);
      if (mascotAnim.kind === 'hop') {
        // Anticipation → arc → soft land (synced with 2D spring hop)
        var anti = k < 0.12 ? (k / 0.12) : 0;
        var flight = k >= 0.12 ? (k - 0.12) / 0.88 : 0;
        var hopAmp = 1.15 + E * 1.05;
        var y;
        if (k < 0.12) {
          y = -anti * 0.22 * s;
          if (mascotBody) mascotBody.scale.set(1.22 - anti * 0.06, 0.78 + anti * 0.06, 0.92);
        } else {
          y = Math.sin(flight * Math.PI) * hopAmp * s;
          var pop = 1 + Math.sin(flight * Math.PI) * (0.16 + E * 0.2);
          if (mascotBody) mascotBody.scale.set(pop * 0.94, 1.1 * pop, 0.92);
        }
        mascotGroup.position.y = mascotBaseY + y;
        // Readable bounce tilt — extra flourish only at high E
        var tilt = Math.sin(flight * Math.PI) * (0.16 + E * 0.18);
        if (E > 0.75) tilt += Math.sin(flight * Math.PI * 2) * 0.22 * (E - 0.75);
        mascotGroup.rotation.z = tilt;
        mascotGroup.rotation.y = Math.sin(flight * Math.PI) * (0.12 + (E > 0.8 ? 0.28 * E : 0));
        if (mascotShadow) {
          var lift = Math.max(0, y / (hopAmp * s + 0.01));
          mascotShadow.scale.set(1 - lift * 0.35, 0.55, 1);
          mascotShadow.material.opacity = 0.22 * (1 - lift * 0.55);
        }
      } else if (mascotAnim.kind === 'squash') {
        // Elastic squash + horizontal shake → hold → follow-through settle
        var sq;
        if (k < 0.35) {
          sq = smooth01(k / 0.35);
        } else if (k < 0.55) {
          sq = 1;
        } else {
          sq = 1 - smooth01((k - 0.55) / 0.45);
          if (k > 0.7 && k < 0.9) sq -= Math.sin(((k - 0.7) / 0.2) * Math.PI) * 0.28;
        }
        var shakeX = Math.sin(k * Math.PI * 6) * (0.18 + E * 0.14) * Math.max(0, sq);
        mascotGroup.position.x = shakeX * s;
        mascotGroup.position.y = mascotBaseY - Math.max(0, sq) * 0.48 * s;
        mascotGroup.rotation.z = Math.sin(Math.min(1, k) * Math.PI) * 0.32 + shakeX * 0.4;
        if (mascotBody) {
          mascotBody.scale.set(1.22 + Math.max(0, sq) * 0.22, 1.08 - Math.max(0, sq) * 0.48, 0.92);
        }
        if (mascotShadow) {
          mascotShadow.scale.set(1 + Math.max(0, sq) * 0.5, 0.55, 1);
          mascotShadow.material.opacity = 0.22 + Math.max(0, sq) * 0.16;
        }
      } else if (mascotAnim.kind === 'tap') {
        var tk = smooth01(k);
        var down = Math.sin(Math.min(1, k / 0.45) * Math.PI);
        if (k > 0.45) down = Math.max(0, 1 - smooth01((k - 0.45) / 0.55));
        mascotGroup.position.y = mascotBaseY - down * 0.28 * s + (k > 0.45 ? Math.sin((k - 0.45) / 0.55 * Math.PI) * 0.12 * s : 0);
        if (mascotBody) {
          mascotBody.scale.set(1.18 + down * 0.2, 1.08 - down * 0.42, 0.92);
        }
        if (mascotShadow) {
          mascotShadow.scale.set(1 + down * 0.4, 0.55, 1);
          mascotShadow.material.opacity = 0.22 + down * 0.12;
        }
      } else if (mascotAnim.kind === 'pop') {
        // Celebrate = clear bounce (extra spin only at high E)
        var p = 1 + Math.sin(k * Math.PI) * (0.18 + E * 0.18);
        mascotGroup.position.y = mascotBaseY + Math.sin(k * Math.PI) * 0.55 * s;
        mascotGroup.rotation.z = Math.sin(k * Math.PI) * 0.12;
        if (E > 0.85) mascotGroup.rotation.y = Math.sin(k * Math.PI) * 0.35;
        else mascotGroup.rotation.y = Math.sin(k * Math.PI) * 0.08;
        if (mascotBody) mascotBody.scale.set(p, 1.08 * p, 0.92);
      }
      if (mascotAnim.pose) setMascotPose(mascotAnim.pose);
    } else if (t < hold) {
      // Readable plateau (happy/oops held)
      var settle = Math.min(1, (t - dur) / 0.12);
      mascotGroup.position.y = mascotBaseY;
      mascotGroup.rotation.z *= (1 - settle);
      mascotGroup.rotation.y *= (1 - settle);
      if (mascotBody) mascotBody.scale.set(1, 1.08, 0.92);
      if (mascotShadow) {
        mascotShadow.scale.set(1, 0.55, 1);
        mascotShadow.material.opacity = 0.22;
      }
      if (mascotAnim.pose) setMascotPose(mascotAnim.pose);
    } else {
      mascotAnim = null;
      setMascotPose('idle');
      mascotGroup.rotation.z = 0;
      mascotGroup.rotation.y = 0;
      mascotGroup.position.x = 0;
      mascotGroup.position.y = mascotBaseY;
      if (mascotBody) mascotBody.scale.set(1, 1.08, 0.92);
      if (mascotShadow) {
        mascotShadow.scale.set(1, 0.55, 1);
        mascotShadow.material.opacity = 0.22;
      }
    }
  }

  function init(opts) {
    opts = opts || {};
    if (opts.quality === 'soft' || opts.quality === 'high') quality = opts.quality;
    if (ready) {
      setQuality(quality);
      return use3d;
    }
    ready = true;
    if (!hasWebGL() || typeof global.THREE === 'undefined') {
      use3d = false;
      return false;
    }
    try {
      var THREE = global.THREE;
      canvas = ensureHost();
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        powerPreference: quality === 'soft' ? 'low-power' : 'high-performance',
        premultipliedAlpha: true
      });
      renderer.setPixelRatio(pixelRatioForQuality());
      renderer.setSize(innerWidth, innerHeight, false);
      renderer.setClearColor(0x000000, 0);
      if (renderer.outputColorSpace !== undefined) {
        renderer.outputColorSpace = THREE.SRGBColorSpace || renderer.outputColorSpace;
      }
      // Soft tone — hide harsh edges
      if (renderer.toneMapping !== undefined) {
        renderer.toneMapping = THREE.ACESFilmicToneMapping || THREE.NoToneMapping;
        renderer.toneMappingExposure = 1.05;
      }

      scene = new THREE.Scene();
      // Soft fog veil — blends particle edges
      try {
        scene.fog = new THREE.FogExp2(0xfff6fb, 0.012);
      } catch (eFog) {}

      camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.1, 100);
      camera.position.z = 8;

      buildLights(THREE);

      var count = quality === 'soft' ? 160 : 260;
      var geo = new THREE.BufferGeometry();
      var positions = new Float32Array(count * 3);
      var colors = new Float32Array(count * 3);
      var velocities = new Float32Array(count * 3);
      var life = new Float32Array(count);
      for (var i = 0; i < count; i++) {
        life[i] = 0;
        positions[i * 3] = 0; positions[i * 3 + 1] = 0; positions[i * 3 + 2] = 0;
      }
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      var mat = new THREE.PointsMaterial({
        size: quality === 'soft' ? 0.22 : 0.16,
        vertexColors: true, transparent: true, opacity: 0.9,
        depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
      });
      particles = new THREE.Points(geo, mat);
      particles.userData = { velocities: velocities, life: life, count: count };
      // Particles behind mascot buddy in draw order
      particles.renderOrder = 0;
      scene.add(particles);

      var stampGeo = new THREE.CircleGeometry(1.1, 48);
      var stampMat = new THREE.MeshBasicMaterial({
        color: 0xff7ab6, transparent: true, opacity: 0, side: THREE.DoubleSide,
        depthWrite: false
      });
      stampMesh = new THREE.Mesh(stampGeo, stampMat);
      stampMesh.position.z = 1;
      stampMesh.visible = false;
      stampMesh.renderOrder = 1;
      scene.add(stampMesh);

      buildMascot(THREE);
      if (mascotGroup) mascotGroup.renderOrder = 2;
      setMascotArtBase(mascotArtBase);
      updateMascotVisibility();

      use3d = true;
      startLoop();
      global.addEventListener('resize', onResize);
      while (pending.length) {
        var job = pending.shift();
        if (job.fn === 'burst') burst3d(job.E);
        else if (job.fn === 'stamp') stamp3d(job.E);
      }
      return true;
    } catch (e) {
      console.warn('[HcyFx] Three layer off', e);
      use3d = false;
      return false;
    }
  }

  function onResize() {
    if (!renderer || !camera) return;
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight, false);
  }

  function spawnBurst(E) {
    if (!particles) return;
    var THREE = global.THREE;
    var ud = particles.userData;
    var pos = particles.geometry.attributes.position.array;
    var col = particles.geometry.attributes.color.array;
    var n = Math.round((quality === 'soft' ? 28 : 40) + (quality === 'soft' ? 100 : 160) * Math.min(1.15, E));
    var spawned = 0;
    var themeColors = PASTEL.slice();
    try {
      var a = cssColor('--hcy-particle-a', '');
      var b = cssColor('--hcy-particle-b', '');
      if (a) themeColors.unshift(new THREE.Color(a).getHex());
      if (b) themeColors.unshift(new THREE.Color(b).getHex());
    } catch (e) {}

    // Bias spawn away from face center — ring / sides / above so face stays readable
    var mx = mascotGroup && mascotGroup.visible ? mascotGroup.position.x : 0;
    var my = mascotGroup && mascotGroup.visible ? mascotGroup.position.y + 0.15 : 0;

    for (var i = 0; i < ud.count && spawned < n; i++) {
      if (ud.life[i] > 0.05) continue;
      var ang = Math.random() * Math.PI * 2;
      // Prefer side/up elevations (avoid dead-center face slam)
      var elev = (Math.random() * 0.85 + 0.15) * Math.PI * 0.55;
      if (Math.random() < 0.55) elev = Math.abs(elev);
      var speed = 2.0 + Math.random() * (3.6 + E * 5);
      ud.velocities[i * 3] = Math.cos(ang) * Math.cos(elev) * speed;
      ud.velocities[i * 3 + 1] = Math.sin(elev) * speed + 1.2 * E;
      ud.velocities[i * 3 + 2] = Math.sin(ang) * Math.cos(elev) * speed * 0.55;
      // Ring bias around mascot, not on face
      var ring = 0.55 + Math.random() * 0.85;
      pos[i * 3] = mx + Math.cos(ang) * ring * 0.35;
      pos[i * 3 + 1] = my + Math.sin(ang) * ring * 0.2 + 0.35;
      pos[i * 3 + 2] = -0.4 - Math.random() * 0.8; // behind buddy
      var hex = themeColors[(Math.random() * themeColors.length) | 0];
      var c = new THREE.Color(hex);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
      ud.life[i] = 0.65 + Math.random() * (0.65 + E * 0.45);
      spawned++;
    }
    particles.geometry.attributes.position.needsUpdate = true;
    particles.geometry.attributes.color.needsUpdate = true;
  }

  function burst3d(E) {
    intensity = E;
    if (!use3d) { if (!ready) pending.push({ fn: 'burst', E: E }); return; }
    spawnBurst(E);
  }

  function stamp3d(E) {
    intensity = E;
    if (!use3d) { if (!ready) pending.push({ fn: 'stamp', E: E }); return; }
    if (!stampMesh) return;
    try {
      stampMesh.material.color.set(cssColor('--hcy-accent', '#ff7ab6'));
    } catch (e) {}
    stampMesh.visible = true;
    stampMesh.material.opacity = 0;
    stampMesh.scale.setScalar(2.4);
    stampMesh.rotation.z = -0.35;
    // Keep stamp above / offset so it doesn't cover mascot face
    stampMesh.position.y = 1.4;
    stampMesh.userData.animT = 0;
    stampMesh.userData.animE = E;
    stampMesh.userData.animating = true;
    spawnBurst(Math.min(1.2, E + 0.15));
  }

  function tick(dt) {
    if (!use3d || !particles) return;
    var ud = particles.userData;
    var pos = particles.geometry.attributes.position.array;
    var alive = false;
    for (var i = 0; i < ud.count; i++) {
      if (ud.life[i] <= 0) continue;
      alive = true;
      ud.life[i] -= dt;
      ud.velocities[i * 3 + 1] -= 6.2 * dt;
      pos[i * 3] += ud.velocities[i * 3] * dt;
      pos[i * 3 + 1] += ud.velocities[i * 3 + 1] * dt;
      pos[i * 3 + 2] += ud.velocities[i * 3 + 2] * dt;
      if (ud.life[i] <= 0) {
        pos[i * 3] = pos[i * 3 + 1] = pos[i * 3 + 2] = 0;
      }
    }
    particles.geometry.attributes.position.needsUpdate = true;
    particles.material.opacity = alive ? 0.88 : 0;

    if (stampMesh && stampMesh.userData.animating) {
      stampMesh.userData.animT += dt;
      var t = stampMesh.userData.animT;
      var E = stampMesh.userData.animE || 0.5;
      if (t < 0.35) {
        var kk = t / 0.35;
        var ease = 1 - Math.pow(1 - kk, 3);
        stampMesh.scale.setScalar(2.4 - 1.3 * ease);
        stampMesh.rotation.z = -0.35 + 0.2 * ease;
        stampMesh.material.opacity = Math.min(0.8, kk * 2) * (0.65 + 0.3 * E);
      } else if (t < 0.35 + 0.45 + E * 0.25) {
        stampMesh.material.opacity = 0.7 + 0.08 * Math.sin(t * 18);
      } else {
        var fade = (t - (0.8 + E * 0.25)) / 0.3;
        stampMesh.material.opacity = Math.max(0, 0.7 * (1 - fade));
        stampMesh.scale.setScalar(1.1 + fade * 0.3);
        if (fade >= 1) { stampMesh.userData.animating = false; stampMesh.visible = false; }
      }
    }

    tickMascot(dt);

    // Micro camera breathe — cinematic, not shaky
    var camAmp = quality === 'soft' ? 0.03 : 0.06;
    camera.position.x = Math.sin(clock * 0.55) * camAmp * intensity;
    camera.position.y = Math.cos(clock * 0.7) * camAmp * 0.7 * intensity;
    renderer.render(scene, camera);
  }

  var last = 0;
  function loop(t) {
    raf = requestAnimationFrame(loop);
    var dt = last ? Math.min(0.05, (t - last) / 1000) : 0.016;
    last = t;
    clock += dt;
    tick(dt);
  }

  function startLoop() {
    if (raf) return;
    last = 0;
    raf = requestAnimationFrame(loop);
  }

  global.HcyFxThree = {
    init: init,
    isActive: function () { return use3d; },
    burst: burst3d,
    stamp: stamp3d,
    celebrate: function (E) { burst3d(E); if (E > 0.55) stamp3d(E); },
    setMascotMode: setMascotMode,
    setMascotArtBase: setMascotArtBase,
    setMascotPose: setMascotPose,
    setMascotSlot: setMascotSlot,
    hopMascot: hopMascot,
    wrongMascot: wrongMascot,
    stampMascot: stampMascot,
    tapMascot: tapMascot,
    isMascotVisible: isMascotVisible,
    hasMascotTexture: hasMascotTexture,
    setQuality: setQuality,
    getQuality: function () { return quality; },
    getMascotMode: function () { return mascotMode; },
    getScene: function () { return scene; },
    getRenderer: function () { return renderer; }
  };
})(typeof window !== 'undefined' ? window : this);
