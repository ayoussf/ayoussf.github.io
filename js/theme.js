const STORAGE_KEY = 'theme';

export function initTheme() {
  const buttons = document.querySelectorAll('.theme-toggle');
  if (!buttons.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem(STORAGE_KEY, 'light');
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem(STORAGE_KEY, 'dark');
      }
      buttons.forEach(b => b.setAttribute('aria-pressed', String(!isDark)));
    });
  });

  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  buttons.forEach(b => b.setAttribute('aria-pressed', String(dark)));
}
