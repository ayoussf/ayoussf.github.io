export function initClock() {
  const timeEl = document.getElementById('clock-time');
  const dateEl = document.getElementById('clock-date');
  if (!timeEl || !dateEl) return;

  function update() {
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    // Abbreviated months take a full stop, matching the dates used in News
    // ("Sep. 2026", "Jul. 2024"). May is never abbreviated, so it takes none.
    const parts = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).formatToParts(now);

    dateEl.textContent = parts.map(part => {
      if (part.type !== 'month') return part.value;
      const month = part.value === 'Sept' ? 'Sep' : part.value;
      return month === 'May' || month.endsWith('.') ? month : month + '.';
    }).join('');
  }

  update();
  setInterval(update, 1000);
}
