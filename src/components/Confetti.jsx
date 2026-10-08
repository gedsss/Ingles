import { useEffect, useRef } from 'react';

const COLORS = ['#fbbf24', '#22c55e', '#3b82f6', '#ec4899', '#8b5cf6', '#f97316'];

// Dispara uma explosão de confete toda vez que `burst` muda.
export default function Confetti({ burst }) {
  const canvas = useRef(null);

  useEffect(() => {
    if (!burst) return;
    const cv = canvas.current;
    const ctx = cv.getContext('2d');
    cv.width = window.innerWidth;
    cv.height = window.innerHeight;
    const parts = Array.from({ length: burst.count }, () => ({
      x: cv.width / 2 + (Math.random() - 0.5) * 120,
      y: cv.height * 0.35,
      vx: (Math.random() - 0.5) * 16,
      vy: -Math.random() * 16 - 6,
      w: 6 + Math.random() * 6,
      h: 8 + Math.random() * 8,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      c: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));
    const start = performance.now();
    let raf;
    const frame = (now) => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      parts.forEach((p) => {
        p.vy += 0.4; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (now - start < 4000) raf = requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, cv.width, cv.height);
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); ctx.clearRect(0, 0, cv.width, cv.height); };
  }, [burst]);

  return <canvas id="confetti" ref={canvas} aria-hidden="true" />;
}
