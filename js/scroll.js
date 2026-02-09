export function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

  initBackToTop();
}

function initBackToTop() {
  const button = document.createElement('button');
  button.className = 'back-to-top';
  button.setAttribute('aria-label', 'Go to top');
  button.innerHTML = `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <polyline points="18 15 12 9 6 15"></polyline>
    </svg>
  `;
  document.body.appendChild(button);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      button.classList.add('visible');
    } else {
      button.classList.remove('visible');
    }
  });

  button.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

export function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const navLinksEl = document.querySelector('.nav-links');
  if (menuBtn && navLinksEl) {
    menuBtn.addEventListener('click', () => {
      navLinksEl.classList.toggle('open');
      menuBtn.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        navLinksEl.classList.remove('open');
        menuBtn.classList.remove('active');
      });
    });
  }
}

export function initSmoothNav() {
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  const sections = document.querySelectorAll('main .section[id]');

  // Show/hide header name based on about h1 visibility
  const aboutName = document.getElementById('about-name');
  const navName = document.querySelector('.nav-name');
  if (aboutName && navName) {
    const nameObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navName.classList.remove('visible');
        } else {
          navName.classList.add('visible');
        }
      });
    }, { threshold: 0 });
    nameObserver.observe(aboutName);
  }

  // Active nav link on scroll
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.05, rootMargin: '-80px 0px -40% 0px' });

  sections.forEach(section => sectionObserver.observe(section));

  initMobileMenu();
}
