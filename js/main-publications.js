import { initTheme } from './theme.js';
import { initClock } from './clock.js';
import { initRail, buildSectionNav } from './rail.js';
import { initReveal, initBackToTop, initYear } from './ui.js';
import { loadPublicationsFlat } from './data.js';

document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  initClock();
  initRail();
  initYear();

  try {
    await loadPublicationsFlat();
  } catch (err) {
    console.error(err);
  }

  buildSectionNav();
  initReveal();
  initBackToTop();
});
