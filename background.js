/* Floating shapes background. Drift, spin, and get nudged away by the pointer. */
(() => {
  // EDIT: colours, opacity and speed
  const COLORS = ["#3b3bff", "#ff8fb8", "#ffd43b", "#12a37f"];
  const OPACITY = 0.55;
  const SPEED = 1;        // 0.5 = calmer, 2 = livelier
  const PUSH_RADIUS = 150; // how far the pointer pushes shapes away

  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const KINDS = ["circle", "ring", "square", "plus", "triangle"];
  const rand = (a, b) => a + Math.random() * (b - a);

  const cv = document.createElement("canvas");
  cv.setAttribute("aria-hidden", "true");
  Object.assign(cv.style, {
    position: "fixed", inset: "0", width: "100%", height: "100%",
    zIndex: "0", pointerEvents: "none"
  });
  document.body.appendChild(cv);
  const ctx = cv.getContext("2d");

  let w, h, shapes = [];
  const mouse = { x: -9999, y: -9999 };

  function make() {
    return {
      x: rand(0, w), y: rand(0, h),
      vx: rand(-0.25, 0.25) * SPEED, vy: rand(-0.25, 0.25) * SPEED,
      r: rand(8, 22),
      rot: rand(0, Math.PI * 2), vr: rand(-0.012, 0.012) * SPEED,
      kind: KINDS[Math.floor(rand(0, KINDS.length))],
      color: COLORS[Math.floor(rand(0, COLORS.length))]
    };
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    cv.width = w * dpr; cv.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(40, Math.max(14, (w * h) / 32000)));
    shapes = Array.from({ length: count }, make);
    if (calm) draw();
  }

  function step(s) {
    s.x += s.vx; s.y += s.vy; s.rot += s.vr;
    const dx = s.x - mouse.x, dy = s.y - mouse.y;
    const d = Math.hypot(dx, dy);
    if (d < PUSH_RADIUS && d > 0) {
      const push = (PUSH_RADIUS - d) / PUSH_RADIUS;
      s.x += (dx / d) * push * 3;
      s.y += (dy / d) * push * 3;
    }
    const m = 40;
    if (s.x < -m) s.x = w + m; else if (s.x > w + m) s.x = -m;
    if (s.y < -m) s.y = h + m; else if (s.y > h + m) s.y = -m;
  }

  function drawShape(s) {
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.rot);
    ctx.fillStyle = ctx.strokeStyle = s.color;
    ctx.lineWidth = 3.5;
    ctx.lineCap = "round";
    const r = s.r;
    switch (s.kind) {
      case "circle":
        ctx.beginPath(); ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2); ctx.fill(); break;
      case "ring":
        ctx.beginPath(); ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2); ctx.stroke(); break;
      case "square":
        ctx.fillRect(-r * 0.7, -r * 0.7, r * 1.4, r * 1.4); break;
      case "plus":
        ctx.beginPath();
        ctx.moveTo(-r, 0); ctx.lineTo(r, 0);
        ctx.moveTo(0, -r); ctx.lineTo(0, r);
        ctx.stroke(); break;
      case "triangle":
        ctx.beginPath();
        ctx.moveTo(0, -r); ctx.lineTo(r, r * 0.8); ctx.lineTo(-r, r * 0.8);
        ctx.closePath(); ctx.fill(); break;
    }
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.globalAlpha = OPACITY;
    shapes.forEach(drawShape);
    ctx.globalAlpha = 1;
  }

  function frame() {
    shapes.forEach(step);
    draw();
    requestAnimationFrame(frame);
  }

  addEventListener("resize", resize);
  resize();

  if (!calm) {
    addEventListener("pointermove", e => { mouse.x = e.clientX; mouse.y = e.clientY; });
    addEventListener("pointerleave", () => { mouse.x = mouse.y = -9999; });
    requestAnimationFrame(frame);
  }
})();