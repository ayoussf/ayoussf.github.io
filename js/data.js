function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ── Publications ──

export async function loadPublications() {
  const res = await fetch('data/publications.json');
  const pubs = await res.json();
  const container = document.getElementById('publications-list');
  if (!container) return;

  const grouped = {};
  pubs.forEach(pub => {
    if (!grouped[pub.year]) grouped[pub.year] = [];
    grouped[pub.year].push(pub);
  });

  const years = Object.keys(grouped).sort((a, b) => b - a);

  years.forEach((year) => {
    const details = document.createElement('details');
    details.className = 'pub-year-group fade-in';

    const summary = document.createElement('summary');
    summary.className = 'pub-year-label';
    summary.innerHTML = `<span>${year}</span>`;
    details.appendChild(summary);

    const content = document.createElement('div');
    content.className = 'pub-year-content';
    grouped[year].forEach(pub => {
      content.appendChild(createPubCard(pub));
    });
    details.appendChild(content);

    container.appendChild(details);
  });
}

function createPubCard(pub) {
  const card = document.createElement('div');
  card.className = 'pub-card';

  const badgeClass = 'badge-' + pub.venueBadge.toLowerCase().replace(/\s+/g, '');

  const linksHTML = pub.links.map(link => {
    if (link.type === 'toggle' && link.label === 'Abstract') {
      return `<button class="pub-link-btn" data-action="abstract">Abstract</button>`;
    }
    if (link.type === 'toggle' && link.label === 'BibTeX') {
      return `<button class="pub-link-btn" data-action="bibtex">BibTeX</button>`;
    }
    return `<a href="${link.url}" target="_blank" rel="noopener" class="pub-link">${link.label}</a>`;
  }).join('');

  card.innerHTML = `
    ${pub.image ? `<img src="${pub.image}" alt="${pub.imageAlt}" class="pub-image" loading="lazy">` : ''}
    <div class="pub-content">
      <div class="pub-title-row">
        <h4 class="pub-title">${pub.title}</h4>
        <span class="badge ${badgeClass}">${pub.venueBadge}</span>
      </div>
      <p class="pub-authors">${pub.authors.join(', ')}</p>
      <p class="pub-venue">${pub.venue}</p>
      <div class="pub-links">${linksHTML}</div>
      <div class="pub-abstract" hidden>
        <p>${pub.abstract}</p>
      </div>
      <div class="pub-bibtex" hidden>
        <button class="copy-btn">Copy</button>
        <pre>${escapeHTML(pub.bibtex)}</pre>
      </div>
    </div>
  `;

  // Toggle abstract / bibtex
  card.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const action = btn.dataset.action;
    const abstractEl = card.querySelector('.pub-abstract');
    const bibtexEl = card.querySelector('.pub-bibtex');

    if (action === 'abstract') {
      abstractEl.hidden = !abstractEl.hidden;
      bibtexEl.hidden = true;
    } else if (action === 'bibtex') {
      bibtexEl.hidden = !bibtexEl.hidden;
      abstractEl.hidden = true;
    }
  });

  // Copy bibtex
  const copyBtn = card.querySelector('.copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(pub.bibtex);
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
      } catch {
        copyBtn.textContent = 'Failed';
        setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
      }
    });
  }

  return card;
}

// ── Projects ──

export async function loadProjects() {
  const res = await fetch('data/projects.json');
  const projects = await res.json();
  const container = document.getElementById('projects-list');
  if (!container) return;

  const grouped = {};
  projects.forEach(p => {
    if (!grouped[p.category]) grouped[p.category] = [];
    grouped[p.category].push(p);
  });

  // Render categories in order they appear
  const categories = [...new Set(projects.map(p => p.category))];

  categories.forEach(cat => {
    const catDiv = document.createElement('div');
    catDiv.className = 'project-category fade-in';
    catDiv.innerHTML = `<h3 class="project-category-title">${cat}</h3>`;

    grouped[cat].forEach(project => {
      catDiv.appendChild(createProjectCard(project));
    });

    container.appendChild(catDiv);
  });
}

function createProjectCard(project) {
  const card = document.createElement('details');
  card.className = 'project-card';
  card.id = project.id;

  const tagsHTML = project.tags.map(t => `<span class="tag">${t}</span>`).join('');
  const linksHTML = project.links.map(l =>
    `<a href="${l.url}" target="_blank" rel="noopener">${l.label}</a>`
  ).join('');

  let embeddedHTML = '';
  if (project.embeddedImage) {
    embeddedHTML = `<img src="${project.embeddedImage}" alt="${project.title} evaluation" class="project-embedded-img" loading="lazy">`;
  }

  const summary = document.createElement('summary');
  summary.className = 'project-summary';
  summary.innerHTML = `
    <div class="project-summary-text">
      <h4 class="project-title">${project.title}</h4>
      <div class="project-summary-tags">${tagsHTML}</div>
    </div>
    <img src="${project.image}" alt="${project.title}" class="project-thumb" loading="lazy">
    <span class="project-expand-icon"></span>
  `;
  card.appendChild(summary);

  const content = document.createElement('div');
  content.className = 'project-details-content';
  content.innerHTML = `
    <div class="project-details-body">
      <div class="project-details-text">
        <p class="project-desc">${project.description}</p>
        <div class="project-links">${linksHTML}</div>
      </div>
      ${embeddedHTML}
    </div>
  `;
  card.appendChild(content);

  return card;
}

// ── Publications (grouped by year, flat cards — no dropdown) ──

export async function loadPublicationsFlat() {
  const res = await fetch('data/publications.json');
  const pubs = await res.json();
  const container = document.getElementById('publications-list');
  if (!container) return;

  const grouped = {};
  pubs.forEach(pub => {
    if (!grouped[pub.year]) grouped[pub.year] = [];
    grouped[pub.year].push(pub);
  });

  const years = Object.keys(grouped).sort((a, b) => b - a);

  years.forEach(year => {
    const yearSection = document.createElement('div');
    yearSection.className = 'pub-year-section nav-section fade-in';
    yearSection.id = `year-${year}`;
    yearSection.innerHTML = `<h2 class="pub-year-heading">${year}</h2>`;

    grouped[year].forEach(pub => {
      yearSection.appendChild(createPubCard(pub));
    });

    container.appendChild(yearSection);
  });
}

// ── Projects (full cards, no dropdown) ──

export async function loadProjectsFull() {
  const res = await fetch('data/projects.json');
  const projects = await res.json();
  const container = document.getElementById('projects-list');
  if (!container) return;

  const grouped = {};
  projects.forEach(p => {
    if (!grouped[p.category]) grouped[p.category] = [];
    grouped[p.category].push(p);
  });

  const categories = [...new Set(projects.map(p => p.category))];

  categories.forEach(cat => {
    const catDiv = document.createElement('div');
    catDiv.className = 'project-category nav-section fade-in';
    const catId = cat.toLowerCase().replace(/\s+/g, '-');
    catDiv.id = `cat-${catId}`;
    catDiv.innerHTML = `<h3 class="project-category-title">${cat}</h3>`;

    // Use grid layout if none of the projects in this category have an embedded image
    const hasEmbedded = grouped[cat].some(p => p.embeddedImage);
    const cardsWrapper = document.createElement('div');
    cardsWrapper.className = hasEmbedded ? 'project-cards-list' : 'project-cards-grid';

    grouped[cat].forEach(project => {
      cardsWrapper.appendChild(createProjectCardFull(project));
    });

    catDiv.appendChild(cardsWrapper);
    container.appendChild(catDiv);
  });
}

function createProjectCardFull(project) {
  const card = document.createElement('details');
  card.className = 'project-card-full';
  card.id = project.id;

  const tagsHTML = project.tags.map(t => `<span class="tag">${t}</span>`).join('');
  const linksHTML = project.links.map(l => {
    let cls = '';
    const label = l.label.toLowerCase();
    if (label === 'github') cls = ' project-link-github';
    else if (label === 'thesis') cls = ' project-link-thesis';
    return `<a href="${l.url}" target="_blank" rel="noopener" class="${cls}">${l.label}</a>`;
  }).join('');

  // Summary: image + title + expand hint
  const summary = document.createElement('summary');
  summary.className = 'project-full-summary';
  summary.innerHTML = `
    <img src="${project.image}" alt="${project.title}" class="project-full-image${project.embeddedImage ? ' project-full-image-cover' : ''}" loading="lazy">
    <div class="project-full-header">
      <h3 class="project-full-title">${project.title}</h3>
      <span class="project-full-hint">Click to expand</span>
    </div>
  `;
  card.appendChild(summary);

  const hint = summary.querySelector('.project-full-hint');
  card.addEventListener('toggle', () => {
    hint.textContent = card.open ? 'Click to collapse' : 'Click to expand';
  });

  // Expandable content
  const content = document.createElement('div');
  content.className = 'project-full-content';

  if (project.embeddedImage) {
    content.innerHTML = `
      <div class="project-full-split">
        <div class="project-full-desc">
          <p class="project-desc">${project.description}</p>
          <div class="project-tags">${tagsHTML}</div>
          <div class="project-links">${linksHTML}</div>
        </div>
        <img src="${project.embeddedImage}" alt="${project.title} evaluation" class="project-full-embedded" loading="lazy">
      </div>
    `;
  } else {
    content.innerHTML = `
      <p class="project-desc">${project.description}</p>
      <div class="project-tags">${tagsHTML}</div>
      <div class="project-links">${linksHTML}</div>
    `;
  }

  card.appendChild(content);
  return card;
}


// ── News ──

const NEWS_VISIBLE_COUNT = 5;

export async function loadNews() {
  const res = await fetch('data/news.json');
  const news = await res.json();
  const container = document.getElementById('news-list');
  if (!container) return;

  // Render first N items directly
  const visibleItems = news.slice(0, NEWS_VISIBLE_COUNT);
  const hiddenItems = news.slice(NEWS_VISIBLE_COUNT);

  visibleItems.forEach(item => {
    container.appendChild(createNewsItem(item));
  });

  if (hiddenItems.length > 0) {
    // Scrollable expandable container for older news
    const moreContainer = document.createElement('div');
    moreContainer.className = 'news-more-container';

    hiddenItems.forEach(item => {
      moreContainer.appendChild(createNewsItem(item));
    });

    const btn = document.createElement('button');
    btn.className = 'news-toggle-btn';
    btn.textContent = 'Show more';
    let expanded = false;

    btn.addEventListener('click', () => {
      expanded = !expanded;
      moreContainer.classList.toggle('open', expanded);
      btn.textContent = expanded ? 'Show less' : 'Show more';
    });

    container.parentNode.appendChild(moreContainer);
    container.parentNode.appendChild(btn);
  }
}

function createNewsItem(item) {
  const div = document.createElement('div');
  div.className = 'news-item';
  div.innerHTML = `
    <span class="news-date">${item.date}</span>
    <span class="news-text">${item.text}</span>
  `;
  return div;
}
