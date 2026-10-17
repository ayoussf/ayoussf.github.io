/**
 * The left rail: on desktop it is always visible; below 900px it becomes a
 * drawer opened from the topbar. It also carries a quick-navigation list for
 * the current page, built from the content and kept in sync while scrolling.
 */
const MOBILE_QUERY = '(max-width: 900px)';

export function initRail() {
  const rail = document.getElementById('rail');
  const toggle = document.getElementById('menu-btn');
  const scrim = document.getElementById('scrim');
  if (!rail || !toggle || !scrim) return;

  const mobile = window.matchMedia(MOBILE_QUERY);

  function setOpen(open) {
    rail.classList.toggle('open', open);
    scrim.classList.toggle('show', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }

  toggle.addEventListener('click', () => setOpen(!rail.classList.contains('open')));
  scrim.addEventListener('click', () => setOpen(false));

  rail.addEventListener('click', (e) => {
    if (e.target.closest('a') && mobile.matches) setOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });

  mobile.addEventListener('change', () => setOpen(false));
}

/**
 * Rebuilds the quick-navigation list from every [data-nav] element in main,
 * then wires scroll-spy. Safe to call again after content is injected.
 */
export function buildSectionNav() {
  const list = document.getElementById('rail-sections');
  const group = document.getElementById('rail-sections-group');
  if (!list) return;

  const sections = [...document.querySelectorAll('main [data-nav][id]')];
  list.innerHTML = '';

  if (sections.length < 2) {
    if (group) group.hidden = true;
    return;
  }
  if (group) group.hidden = false;

  sections.forEach(section => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#${section.id}`;
    a.className = 'rail-link';
    a.textContent = section.dataset.nav;
    li.appendChild(a);
    list.appendChild(li);
  });

  spy(sections, [...list.querySelectorAll('.rail-link')]);
}

function spy(sections, links) {
  if (spy.cleanup) spy.cleanup();

  let locked = false;
  let lockTimer = null;
  let ticking = false;

  links.forEach(link => {
    link.addEventListener('click', () => {
      locked = true;
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      clearTimeout(lockTimer);
      lockTimer = setTimeout(() => { locked = false; }, 700);
    });
  });

  function update() {
    if (locked) return;

    const y = window.scrollY;
    // Only treat "bottom" as meaningful once the page can actually scroll,
    // otherwise a short page would permanently highlight its last section.
    const scrollable = document.documentElement.scrollHeight - window.innerHeight > 80;
    const atBottom = scrollable && window.innerHeight + y >= document.documentElement.scrollHeight - 80;

    let activeId = sections[0].id;
    if (atBottom) {
      activeId = sections[sections.length - 1].id;
    } else {
      const line = y + window.innerHeight * 0.32;
      for (const section of sections) {
        if (section.getBoundingClientRect().top + y <= line) activeId = section.id;
        else break;
      }
    }

    links.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`);
    });
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      update();
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  spy.cleanup = () => window.removeEventListener('scroll', onScroll);
  update();
}
