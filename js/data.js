/**
 * Renders publications, projects and news from the JSON files in /data.
 * `data-base` on <html> resolves relative paths ("" at the root, "../" in a
 * subfolder) so the same renderers work on every page.
 */
const BASE = document.documentElement.dataset.base || '';

const asset = (path) => (path && !/^https?:/.test(path) ? BASE + path : path);

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function fetchJSON(name) {
  const res = await fetch(BASE + 'data/' + name + '.json');
  if (!res.ok) throw new Error('Could not load ' + name + '.json');
  return res.json();
}

/* -- Publications ------------------------------------------------------- */

function createPubCard(pub) {
  const card = document.createElement('article');
  card.className = 'pub-card';

  const badgeClass = 'badge-' + pub.venueBadge.toLowerCase().replace(/\s+/g, '');

  const linksHTML = pub.links.map(link => {
    if (link.type === 'toggle') {
      const action = link.label.toLowerCase();
      return `<button class="pub-link-btn" type="button" data-action="${action}" aria-expanded="false">${link.label}</button>`;
    }
    return `<a href="${link.url}" target="_blank" rel="noopener" class="pub-link">${link.label}</a>`;
  }).join('');

  card.innerHTML = `
    ${pub.image ? `<img src="${asset(pub.image)}" alt="${pub.imageAlt || pub.title}" class="pub-image" loading="lazy">` : ''}
    <div class="pub-content">
      <div class="pub-title-row">
        <h3 class="pub-title">${pub.title}</h3>
        <span class="badge ${badgeClass}">${pub.venueBadge}</span>
      </div>
      <p class="pub-authors">${pub.authors.join(', ')}</p>
      <p class="pub-venue">${pub.venue}</p>
      <div class="pub-links">${linksHTML}</div>
      <div class="pub-abstract" hidden><p>${pub.abstract}</p></div>
      <div class="pub-bibtex" hidden>
        <button class="copy-btn" type="button">Copy</button>
        <pre>${escapeHTML(pub.bibtex)}</pre>
      </div>
    </div>
  `;

  const panels = {
    abstract: card.querySelector('.pub-abstract'),
    bibtex: card.querySelector('.pub-bibtex')
  };

  card.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const wanted = btn.dataset.action;
    Object.entries(panels).forEach(([name, panel]) => {
      panel.hidden = name === wanted ? !panel.hidden : true;
    });
    card.querySelectorAll('[data-action]').forEach(other => {
      other.setAttribute('aria-expanded', String(!panels[other.dataset.action].hidden));
    });
  });

  const copyBtn = card.querySelector('.copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(pub.bibtex);
        copyBtn.textContent = 'Copied';
      } catch {
        copyBtn.textContent = 'Failed';
      }
      setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
    });
  }

  return card;
}

/** Home page: a short preview. The full list lives on /publications/. */
const HOME_PUBLICATIONS = 3;

export async function loadPublications() {
  const container = document.getElementById('publications-list');
  if (!container) return;

  const pubs = await fetchJSON('publications');
  pubs
    .sort((a, b) => b.year - a.year)
    .slice(0, HOME_PUBLICATIONS)
    .forEach(pub => container.appendChild(createPubCard(pub)));
}

/** Publications page: grouped under year headings, each a nav target. */
export async function loadPublicationsFlat() {
  const container = document.getElementById('publications-list');
  if (!container) return;

  const pubs = await fetchJSON('publications');
  const grouped = {};
  pubs.forEach(pub => {
    if (!grouped[pub.year]) grouped[pub.year] = [];
    grouped[pub.year].push(pub);
  });

  Object.keys(grouped)
    .sort((a, b) => b - a)
    .forEach(year => {
      const section = document.createElement('section');
      section.className = 'pub-year-section reveal';
      section.id = 'year-' + year;
      section.dataset.nav = year;
      section.innerHTML = `<h2 class="pub-year-heading">${year}</h2>`;
      grouped[year].forEach(pub => section.appendChild(createPubCard(pub)));
      container.appendChild(section);
    });
}

/* -- Projects ----------------------------------------------------------- */

function createProjectCard(project) {
  const card = document.createElement('details');
  card.className = 'project-card-full';
  card.id = project.id;

  const tagsHTML = project.tags.map(t => `<span class="tag">${t}</span>`).join('');
  const linksHTML = project.links
    .map(l => `<a href="${l.url}" target="_blank" rel="noopener">${l.label}</a>`)
    .join('');

  const summary = document.createElement('summary');
  summary.className = 'project-full-summary';
  summary.innerHTML = `
    <img src="${asset(project.image)}" alt="${project.title}" class="project-full-image${project.embeddedImage ? ' project-full-image-cover' : ''}" loading="lazy">
    <div class="project-full-header">
      <h3 class="project-full-title">${project.title}</h3>
      <span class="project-full-hint">Details</span>
    </div>
  `;
  card.appendChild(summary);

  const content = document.createElement('div');
  content.className = 'project-full-content';
  const body = `
    <p class="project-desc">${project.description}</p>
    <div class="project-tags">${tagsHTML}</div>
    <div class="project-links">${linksHTML}</div>
  `;

  content.innerHTML = project.embeddedImage
    ? `<div class="project-full-split">
         <div class="project-full-desc">${body}</div>
         <img src="${asset(project.embeddedImage)}" alt="${project.title} evaluation results" class="project-full-embedded" loading="lazy">
       </div>`
    : body;

  card.appendChild(content);
  return card;
}

export async function loadProjectsFull() {
  const container = document.getElementById('projects-list');
  if (!container) return;

  const projects = await fetchJSON('projects');
  const grouped = {};
  projects.forEach(p => {
    if (!grouped[p.category]) grouped[p.category] = [];
    grouped[p.category].push(p);
  });

  Object.keys(grouped).forEach(category => {
    const section = document.createElement('section');
    section.className = 'project-category reveal';
    section.id = 'cat-' + category.toLowerCase().replace(/\s+/g, '-');
    section.dataset.nav = category;
    section.innerHTML = `<h2 class="project-category-title">${category}</h2>`;

    const wrapper = document.createElement('div');
    wrapper.className = grouped[category].some(p => p.embeddedImage)
      ? 'project-cards-list'
      : 'project-cards-grid';

    grouped[category].forEach(p => wrapper.appendChild(createProjectCard(p)));
    section.appendChild(wrapper);
    container.appendChild(section);
  });
}

/* -- News --------------------------------------------------------------- */

const NEWS_VISIBLE = 4;

function createNewsItem(item) {
  const div = document.createElement('div');
  div.className = 'news-item';
  div.innerHTML = `<span class="news-date">${item.date}</span><span class="news-text">${item.text}</span>`;
  return div;
}

export async function loadNews() {
  const container = document.getElementById('news-list');
  if (!container) return;

  const news = await fetchJSON('news');
  news.slice(0, NEWS_VISIBLE).forEach(item => container.appendChild(createNewsItem(item)));

  const rest = news.slice(NEWS_VISIBLE);
  if (!rest.length) return;

  const more = document.createElement('div');
  more.className = 'news-more';
  const inner = document.createElement('div');
  rest.forEach(item => inner.appendChild(createNewsItem(item)));
  more.appendChild(inner);
  container.appendChild(more);

  const btn = document.createElement('button');
  btn.className = 'news-toggle';
  btn.type = 'button';
  btn.setAttribute('aria-expanded', 'false');

  const label = document.createElement('span');
  label.textContent = rest.length + ' earlier updates';
  btn.appendChild(label);
  btn.insertAdjacentHTML('beforeend', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>');

  btn.addEventListener('click', () => {
    const open = more.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
    label.textContent = open ? 'Show fewer' : rest.length + ' earlier updates';
  });

  container.parentNode.appendChild(btn);
}
