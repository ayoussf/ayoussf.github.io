export function initQuickNav() {
    const main = document.querySelector('main');
    if (!main) return;

    // Create Quick Nav Container
    const navContainer = document.createElement('div');
    navContainer.className = 'quick-nav';
    navContainer.innerHTML = `<div class="quick-nav-inner"><h3 class="quick-nav-title">Quick Navigation</h3><ul class="quick-nav-list"></ul></div>`;
    document.body.appendChild(navContainer);

    const navList = navContainer.querySelector('.quick-nav-list');
    const isHomePage = window.location.pathname === '/' || window.location.pathname.endsWith('index.html');

    // Persistence for scroll tracking
    let currentTargets = [];
    let currentLinks = [];
    let isNavigating = false;
    let navigationTimeout = null;
    let ticking = false;

    function updateActiveLink() {
        if (isNavigating || currentTargets.length === 0) return;

        const scrollPos = window.scrollY;
        const windowHeight = window.innerHeight;
        const scrollHeight = document.documentElement.scrollHeight;
        const viewportCenter = scrollPos + (windowHeight / 2);

        // 1. Absolute Top Check (Clean Start)
        if (scrollPos < 20) {
            currentLinks.forEach(l => l.classList.remove('active'));
            return;
        }

        // 2. Explicit Bottom-of-Page Check
        const isBottom = (windowHeight + scrollPos) >= (scrollHeight - 100);
        if (isBottom) {
            currentLinks.forEach((link, idx) => {
                link.classList.toggle('active', idx === currentLinks.length - 1);
            });
            return;
        }

        // 3. Sticky Logic
        let activeId = null;
        for (let i = 0; i < currentTargets.length; i++) {
            const el = document.getElementById(currentTargets[i].id);
            if (el) {
                const rect = el.getBoundingClientRect();
                const top = scrollPos + rect.top;
                if (viewportCenter >= top) {
                    activeId = currentTargets[i].id;
                } else {
                    break;
                }
            }
        }

        currentLinks.forEach(link => {
            link.classList.toggle('active', !!activeId && link.getAttribute('href') === `#${activeId}`);
        });
    }

    // Single persistent scroll listener
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateActiveLink();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    function updateNav() {
        navList.innerHTML = '';
        const targets = [];

        // Unified Target Detection
        // This picks up sections on home page AND our new container-based sections on flat pages
        const sections = document.querySelectorAll('main section[id], main .section[id], main .nav-section[id]');
        sections.forEach(section => {
            let label = '';
            if (section.id === 'home') label = 'About Me';
            else {
                const heading = section.querySelector('h2, h3, .section-title, .page-title, .pub-year-heading, .project-category-title');
                label = heading ? heading.textContent.trim() : section.id.charAt(0).toUpperCase() + section.id.slice(1);
            }

            if (label && label.length < 40 && !targets.find(t => t.id === section.id)) {
                targets.push({ id: section.id, label });
            }
        });

        // Populate Nav List
        targets.forEach(target => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#${target.id}`;
            a.className = 'quick-nav-link';
            a.textContent = target.label;

            a.addEventListener('click', () => {
                isNavigating = true;
                if (navigationTimeout) clearTimeout(navigationTimeout);

                currentLinks.forEach(l => l.classList.remove('active'));
                a.classList.add('active');

                navigationTimeout = setTimeout(() => {
                    isNavigating = false;
                }, 1000);
            });

            li.appendChild(a);
            navList.appendChild(li);
        });

        const links = navContainer.querySelectorAll('.quick-nav-link');

        // Update persistent state for the scroll listener
        currentTargets = targets;
        currentLinks = links;

        if (targets.length > 0) {
            navContainer.style.display = window.innerWidth >= 1400 ? 'block' : 'none';
            updateActiveLink();
        } else {
            navContainer.style.display = 'none';
        }
    }

    // Initial check and observers
    updateNav();

    const observer = new MutationObserver(() => updateNav());
    const content = document.getElementById('publications-list') || document.getElementById('projects-list') || main;
    if (content) observer.observe(content, { childList: true, subtree: true });

    window.addEventListener('resize', () => {
        if (currentTargets.length > 0) {
            navContainer.style.display = window.innerWidth >= 1400 ? 'block' : 'none';
        }
    });
}
