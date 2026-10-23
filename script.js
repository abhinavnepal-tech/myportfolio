// 3D clay-style bust (three.js). Head follows the cursor.
(function () {
  const box = document.getElementById('av3d');
  if (!box || !window.THREE) return;
  const T = THREE;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let renderer;
  try { renderer = new T.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  box.appendChild(renderer.domElement);

  const scene = new T.Scene();
  const cam = new T.PerspectiveCamera(30, 1.25, 0.1, 50);
  cam.position.set(0, -0.7, 9.5);
  cam.lookAt(0, -0.7, 0);
  scene.add(new T.AmbientLight(0xffffff, 0.6));
  const key = new T.DirectionalLight(0xffffff, 0.85); key.position.set(3, 4, 6); scene.add(key);
  const fill = new T.DirectionalLight(0x9bb0ff, 0.35); fill.position.set(-4, 1, 3); scene.add(fill);

  const mat = (c) => new T.MeshStandardMaterial({ color: c, roughness: 0.7 });
  const ball = (r, c, s, p, parent) => {
    const m = new T.Mesh(new T.SphereGeometry(r, 32, 24), mat(c));
    if (s) m.scale.set(s[0], s[1], s[2]);
    if (p) m.position.set(p[0], p[1], p[2]);
    parent.add(m);
    return m;
  };
  const SKIN = 0xe0a577, SHADE = 0xc98a5d, DARK = 0x14110f;

  // body
  const body = new T.Group(); scene.add(body);
  ball(1.5, 0xefe3b0, [1.35, 0.7, 0.8], [0, -2.6, -0.1], body);
  const neck = new T.Mesh(new T.CylinderGeometry(0.42, 0.46, 1.0, 24), mat(SHADE));
  neck.position.set(0, -1.2, 0); body.add(neck);
  const collar = new T.Mesh(new T.TorusGeometry(0.5, 0.07, 10, 32), mat(0xd9cc98));
  collar.rotation.x = Math.PI / 2; collar.position.set(0, -1.55, 0); body.add(collar);

  // head
  const head = new T.Group(); scene.add(head);
  ball(1, SKIN, [0.92, 1.08, 0.95], null, head);
  ball(0.62, SKIN, [0.95, 0.9, 0.9], [0, -0.62, 0.12], head);
  [-1, 1].forEach((d) => {
    ball(0.2, 0xd49665, [0.5, 1, 0.7], [d * 0.9, -0.05, 0], head);                    // ears
    ball(0.095, 0x1a1210, [1, 0.75, 0.6], [d * 0.33, 0.08, 0.87], head);             // eyes
    ball(0.1, DARK, [1.15, 0.16, 0.55], [d * 0.33, 0.135, 0.875], head);             // lids
    const glint = new T.Mesh(new T.SphereGeometry(0.028, 12, 8), new T.MeshBasicMaterial({ color: 0xffffff }));
    glint.position.set(d * 0.33 + 0.03, 0.11, 0.935); head.add(glint);
    const brow = ball(0.1, DARK, [2.1, 0.4, 0.5], [d * 0.34, 0.3, 0.85], head);      // brows
    brow.rotation.z = d < 0 ? 0.08 : -0.08;
    const mus = ball(0.1, 0x1a1512, [1.5, 0.32, 0.5], [d * 0.14, -0.43, 0.865], head); // mustache
    mus.rotation.z = d < 0 ? 0.25 : -0.25;
  });
  ball(0.14, 0xd4956a, [0.9, 1.1, 1], [0, -0.14, 0.93], head);                        // nose
  ball(0.2, 0x2a2420, [1, 0.75, 0.6], [0, -0.84, 0.6], head);                         // goatee
  const smile = new T.Mesh(new T.TorusGeometry(0.17, 0.022, 8, 24, Math.PI * 0.7), mat(0xa5603f));
  smile.rotation.set(0.45, 0, -Math.PI / 2 - Math.PI * 0.35);
  smile.position.set(0.02, -0.5, 0.82); head.add(smile);

  // hair: clumps over the top and back, fringe across the forehead
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const tones = [0x14110f, 0x1c1815, 0x26211d];
  const surf = (x, y) => 0.95 * Math.sqrt(Math.max(0, 1 - (x / 0.92) ** 2 - (y / 1.08) ** 2));
  [[0, 1, 0.5], [0.45, 6, 0.42], [0.9, 10, 0.4], [1.35, 14, 0.36], [1.75, 16, 0.34]].forEach(([a, n, r], j) => {
    for (let i = 0; i < n; i++) {
      const b = (i / n) * Math.PI * 2 + j;
      const x = 1.04 * 0.92 * Math.sin(a) * Math.cos(b);
      const y = 1.04 * 1.08 * Math.cos(a);
      const z = 1.04 * 0.95 * Math.sin(a) * Math.sin(b);
      if ((j === 3 && z > 0.25) || (j === 4 && z > -0.05)) continue;
      ball(r * (0.9 + rnd() * 0.3), tones[i % 3], [1, 0.95 + rnd() * 0.2, 1], [x, y, z], head);
    }
  });
  [-0.55, -0.28, 0, 0.28, 0.55].forEach((x) =>
    ball(0.2 + rnd() * 0.05, tones[Math.floor(rnd() * 3)], [1.3, 0.9, 0.9], [x, 0.55, surf(x, 0.55) + 0.04], head));

  // sizing, interaction, loop
  const fit = () => { const w = box.clientWidth; renderer.setSize(w, w * 0.8, false); };
  fit();
  if (window.ResizeObserver) new ResizeObserver(fit).observe(box);
  let tx = 0.3, ty = 0, cx = 0, cy = 0, visible = true;
  if (!reduce) addEventListener('pointermove', (e) => {
    tx = (e.clientX / innerWidth - 0.5) * 2;
    ty = (e.clientY / innerHeight - 0.5) * 2;
  });
  if (window.IntersectionObserver) new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(box);
  const clock = new T.Clock();
  (function loop() {
    requestAnimationFrame(loop);
    if (!visible) return;
    const t = clock.getElapsedTime();
    cx += (tx - cx) * 0.07; cy += (ty - cy) * 0.07;
    head.rotation.y = reduce ? 0.2 : cx * 0.55;
    head.rotation.x = reduce ? 0 : cy * 0.3;
    head.rotation.z = reduce ? 0 : Math.sin(t * 1.2) * 0.02;
    head.position.y = reduce ? 0 : Math.sin(t * 1.6) * 0.025;
    renderer.render(scene, cam);
  })();
})();

console.log('Hand-written, so if something is broken, it is my fault.');