export function initClock() {
  const timeEl = document.getElementById('clock-time');
  const dateEl = document.getElementById('clock-date');
  const clockEl = document.getElementById('digital-clock');
  if (!timeEl || !dateEl || !clockEl) return;

  function update() {
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    dateEl.textContent = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  update();
  setInterval(update, 1000);

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    clockEl.style.opacity = y < 30 ? '1' : '0';
    clockEl.style.pointerEvents = y < 30 ? 'auto' : 'none';
  }, { passive: true });
}
