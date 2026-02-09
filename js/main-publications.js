import { initTheme } from './theme.js';
import { initClock } from './clock.js';
import { loadPublicationsFlat } from './data.js';
import { initScrollAnimations, initMobileMenu } from './scroll.js';
import { initQuickNav } from './quick-nav.js';

document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  initClock();

  await loadPublicationsFlat();

  initScrollAnimations();
  initMobileMenu();
  initQuickNav();

  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
