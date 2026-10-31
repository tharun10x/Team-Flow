// Switcher: tabs move with the arrow keys; without script every panel shows.
document.querySelectorAll('[data-switch]').forEach((sw) => {
  const tabs = [...sw.querySelectorAll('[role="tab"]')];
  const select = (tab, focus) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t, false));
    t.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      select(tabs[(i + d + tabs.length) % tabs.length], true);
    });
  });
});

// The field: one composed still of characters on the 8 by 16 cell. Loose chatter on the
// left settles into rows that run into the task board, the way messages become tasks.
(() => {
  const canvas = document.querySelector('.hero__field');
  if (!canvas) return;
  const hero = canvas.parentElement;
  const css = getComputedStyle(document.documentElement);
  const tint = ['--color-glyph-1', '--color-glyph-2', '--color-glyph-3', '--color-glyph-4', '--color-accent-deep'].map((v) => css.getPropertyValue(v).trim());
  const mono = css.getPropertyValue('--font-outlier').trim();
  const ramp = ' .:-=+*#%@';
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const noise = (x, y) => Math.sin(x * 0.11 + Math.sin(y * 0.17) * 2) * Math.cos(y * 0.09 - x * 0.03) * 0.5 + 0.5;

  const draw = () => {
    const w = hero.clientWidth, h = hero.clientHeight, dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr; canvas.height = h * dpr;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.font = `12px ${mono}`;
    ctx.textBaseline = 'top';
    const shot = hero.querySelector('.hero__shot');
    const text = hero.querySelector('.hero__text');
    if (!shot || w < 960) return;
    const s = shot.getBoundingClientRect(), t = text.getBoundingClientRect(), o = hero.getBoundingClientRect();
    const sx = s.left - o.left, sy = s.top - o.top, sh = s.height;
    const tx0 = t.left - o.left - 24, tx1 = t.right - o.left + 24, ty0 = t.top - o.top - 24, ty1 = t.bottom - o.top + 24;
    const rows = 7, lanes = Array.from({ length: rows }, (_, i) => sy + sh * (0.18 + i * 0.11));
    seed = 7;
    for (let cy = 0; cy < h; cy += 16) {
      for (let cx = 0; cx < sx; cx += 8) {
        const p = cx / sx; // 0 at the left edge, 1 at the board
        let v = noise(cx / 8, cy / 16) * (1 - p) * 0.55;
        for (const ly of lanes) {
          const d = Math.abs(cy - ly);
          if (d < 10) v = Math.max(v, 0.2 + Math.pow(p, 1.6) * 0.78);
          else if (d < 26) v = Math.max(v, Math.pow(p, 1.6) * 0.3);
        }
        if (cx > tx0 && cx < tx1 && cy > ty0 && cy < ty1) v = Math.min(v * 0.35, 0.2);
        v *= 0.75 + rand() * 0.25;
        if (v < 0.12) continue;
        const ch = ramp[Math.min(ramp.length - 1, Math.floor(v * ramp.length))];
        ctx.fillStyle = tint[Math.min(tint.length - 1, Math.floor(v * tint.length))];
        ctx.fillText(ch, cx, cy);
      }
    }
  };
  let raf = 0;
  const queue = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); };
  new ResizeObserver(queue).observe(hero);
  document.fonts && document.fonts.ready.then(queue);
})();
