import { initTheme } from './theme.js';
import { initClock } from './clock.js';
import { loadPublications, loadNews } from './data.js';
import { initScrollAnimations, initSmoothNav } from './scroll.js';
import { initQuickNav } from './quick-nav.js';

document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  initClock();

  await Promise.all([
    loadPublications(),
    loadNews()
  ]);

  initScrollAnimations();
  initSmoothNav();
  initQuickNav();

  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
