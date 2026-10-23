// CSS owns the motion: one bounded set of decorations, with no animation loop.
export function createParticles(container) {
  if (container.childElementCount) return;
  const decorations = [
    ['dot blue', 10, 22, 12, -3], ['dot red', 87, 16, 9, -8],
    ['dot yellow', 17, 68, 10, -5], ['dot green', 90, 71, 13, -1],
    ['dot blue small', 79, 47, 15, -6], ['dot green small', 24, 14, 14, -4],
    ['dot red small', 7, 85, 16, -2], ['dot yellow small', 73, 86, 13, -7],
    ['code blue', 12, 43, 17, -4], ['code green', 84, 33, 20, -9],
    ['code red', 80, 79, 18, -6],
  ];
  for (const [className, x, y, duration, delay] of decorations) {
    const item = document.createElement('span');
    item.className = `particle ${className}`;
    if (className.startsWith('code')) item.textContent = '<>';
    item.style.cssText = `--x:${x}%;--y:${y}%;--duration:${duration}s;--delay:${delay}s`;
    container.append(item);
  }
}
