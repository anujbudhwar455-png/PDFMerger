/**
 * PDF Merger — floating 3D document cards (Three.js CDN)
 * Respects prefers-reduced-motion; pauses when tab hidden.
 */
(function () {
  'use strict';

  const container = document.getElementById('webgl-bg');
  if (!container || typeof THREE === 'undefined') return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 720px)').matches ||
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0.4, isMobile ? 9.5 : 8.2);

  const renderer = new THREE.WebGLRenderer({
    antialias: !isMobile,
    alpha: true,
    powerPreference: 'low-power',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  // Soft lighting
  const ambient = new THREE.AmbientLight(0x6a8ab8, 0.55);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xffffff, 1.05);
  key.position.set(4, 6, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x4f8cff, 0.55);
  rim.position.set(-5, -2, -3);
  scene.add(rim);
  const fill = new THREE.PointLight(0x7aa8ff, 0.45, 30);
  fill.position.set(-2, 2, 4);
  scene.add(fill);

  const group = new THREE.Group();
  scene.add(group);

  function makeDocTexture(title, accentHex, lines) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 680;
    const ctx = canvas.getContext('2d');

    // Page
    const grad = ctx.createLinearGradient(0, 0, 0, 680);
    grad.addColorStop(0, '#f7f9fc');
    grad.addColorStop(1, '#e8eef7');
    ctx.fillStyle = grad;
    roundRect(ctx, 8, 8, 496, 664, 18);
    ctx.fill();

    // Accent bar
    ctx.fillStyle = accentHex;
    roundRect(ctx, 8, 8, 496, 56, 18);
    ctx.fill();
    ctx.fillRect(8, 40, 496, 24);

    // Header title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Inter, system-ui, sans-serif';
    ctx.fillText(title, 36, 44);

    // Fake PDF chrome
    ctx.fillStyle = '#c5d0e0';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(420 + i * 22, 36, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Body lines
    ctx.fillStyle = '#1a2332';
    ctx.font = '600 22px Inter, system-ui, sans-serif';
    ctx.fillText('PDF Document', 36, 110);

    let y = 150;
    lines.forEach((line, idx) => {
      const w = typeof line === 'number' ? line : 0.85;
      ctx.fillStyle = idx % 5 === 0 ? accentHex : '#9aa8bc';
      const alpha = idx % 5 === 0 ? 0.55 : 0.35;
      ctx.globalAlpha = alpha;
      roundRect(ctx, 36, y, 440 * w, 12, 4);
      ctx.fill();
      ctx.globalAlpha = 1;
      y += 28;
    });

    // Corner fold
    ctx.fillStyle = '#d5deea';
    ctx.beginPath();
    ctx.moveTo(430, 8);
    ctx.lineTo(504, 8);
    ctx.lineTo(504, 82);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#b8c4d4';
    ctx.beginPath();
    ctx.moveTo(430, 8);
    ctx.lineTo(430, 82);
    ctx.lineTo(504, 82);
    ctx.closePath();
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    return tex;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function createCard(opts) {
    const w = 1.55;
    const h = 2.05;
    const d = 0.045;
    const geo = new THREE.BoxGeometry(w, h, d);
    const front = new THREE.MeshStandardMaterial({
      map: opts.texture,
      roughness: 0.42,
      metalness: 0.05,
    });
    const edge = new THREE.MeshStandardMaterial({
      color: 0x1a2740,
      roughness: 0.65,
      metalness: 0.2,
    });
    const back = new THREE.MeshStandardMaterial({
      color: 0xe8eef7,
      roughness: 0.5,
      metalness: 0.05,
    });
    // Box materials: +x -x +y -y +z -z
    const mats = [edge, edge, edge, edge, front, back];
    const mesh = new THREE.Mesh(geo, mats);
    mesh.position.copy(opts.position);
    mesh.rotation.set(opts.rotation.x, opts.rotation.y, opts.rotation.z);
    mesh.userData = {
      base: opts.position.clone(),
      rotBase: opts.rotation.clone(),
      phase: opts.phase || 0,
      amp: opts.amp || 0.12,
      spin: opts.spin || 0.15,
    };
    return mesh;
  }

  const accents = ['#4f8cff', '#3dd68c', '#7aa8ff', '#60a5fa', '#38bdf8'];
  const titles = ['Report.pdf', 'Invoice.pdf', 'Merge.pdf', 'Split.pdf', 'Archive.pdf'];
  const cards = [];
  const count = isMobile ? 4 : 6;

  const layouts = [
    { position: new THREE.Vector3(-2.6, 0.6, -1.2), rotation: new THREE.Euler(-0.15, 0.45, 0.08), phase: 0.2, amp: 0.14, spin: 0.12 },
    { position: new THREE.Vector3(-0.3, 1.1, -2.0), rotation: new THREE.Euler(0.1, -0.25, -0.05), phase: 1.1, amp: 0.18, spin: 0.1 },
    { position: new THREE.Vector3(2.4, 0.3, -0.8), rotation: new THREE.Euler(-0.05, -0.55, 0.12), phase: 2.0, amp: 0.15, spin: 0.14 },
    { position: new THREE.Vector3(1.2, -1.0, -1.6), rotation: new THREE.Euler(0.2, 0.35, -0.08), phase: 2.8, amp: 0.12, spin: 0.09 },
    { position: new THREE.Vector3(-1.8, -0.9, -0.4), rotation: new THREE.Euler(-0.25, 0.2, 0.15), phase: 3.6, amp: 0.16, spin: 0.11 },
    { position: new THREE.Vector3(0.2, -0.2, 0.2), rotation: new THREE.Euler(0.05, -0.1, -0.02), phase: 4.4, amp: 0.1, spin: 0.08 },
  ];

  for (let i = 0; i < count; i++) {
    const linePattern = Array.from({ length: 14 }, (_, n) => 0.55 + ((n * 17 + i * 9) % 40) / 100);
    const tex = makeDocTexture(titles[i % titles.length], accents[i % accents.length], linePattern);
    const card = createCard({
      texture: tex,
      ...layouts[i],
    });
    group.add(card);
    cards.push(card);
  }

  // Soft ground glow plane (subtle)
  const glowGeo = new THREE.PlaneGeometry(14, 14);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x1a3a7a,
    transparent: true,
    opacity: 0.12,
    depthWrite: false,
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = -2.4;
  scene.add(glow);

  let width = 0;
  let height = 0;
  function resize() {
    width = container.clientWidth || window.innerWidth;
    height = container.clientHeight || window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Parallax target
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  if (!reduceMotion) {
    window.addEventListener('pointermove', (e) => {
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });
  }

  let running = true;
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) {
      last = performance.now();
      requestAnimationFrame(tick);
    }
  });

  let last = performance.now();
  const clockStart = last;

  function tick(now) {
    if (!running) return;
    requestAnimationFrame(tick);
    const t = (now - clockStart) / 1000;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 4);
    pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 4);

    if (!reduceMotion) {
      group.rotation.y = pointer.x * 0.18 + Math.sin(t * 0.12) * 0.08;
      group.rotation.x = -pointer.y * 0.1 + Math.sin(t * 0.09) * 0.04;
      camera.position.x = pointer.x * 0.35;
      camera.position.y = 0.4 + pointer.y * -0.2;
      camera.lookAt(0, 0, -1);

      for (const card of cards) {
        const u = card.userData;
        card.position.y = u.base.y + Math.sin(t * 0.7 + u.phase) * u.amp;
        card.position.x = u.base.x + Math.cos(t * 0.45 + u.phase) * u.amp * 0.35;
        card.rotation.y = u.rotBase.y + Math.sin(t * 0.35 + u.phase) * u.spin;
        card.rotation.x = u.rotBase.x + Math.cos(t * 0.28 + u.phase) * u.spin * 0.6;
      }
    } else {
      // Static elegant pose
      camera.lookAt(0, 0, -1);
    }

    renderer.render(scene, camera);
  }

  requestAnimationFrame(tick);

  // Cleanup helper if needed later
  window.__pdfMergerScene = {
    dispose() {
      running = false;
      cards.forEach((c) => {
        c.geometry.dispose();
        (Array.isArray(c.material) ? c.material : [c.material]).forEach((m) => {
          if (m.map) m.map.dispose();
          m.dispose();
        });
      });
      glowGeo.dispose();
      glowMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    },
  };
})();
