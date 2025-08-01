// Add about-page-active class immediately
if (!document.body.classList.contains('about-page-active')) {
    document.body.classList.add('about-page-active');
}

document.addEventListener('DOMContentLoaded', function() {
    // Set initial padding-top for body based on header height
    const headerHeight = document.querySelector('header').offsetHeight;
    document.body.style.paddingTop = `${headerHeight}px`;

    // Theme toggle functionality
    const themeToggle = document.getElementById('theme-icon');
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme) {
        document.body.classList.add(currentTheme);
        if (currentTheme === 'light-mode') {
            themeToggle.textContent = '🌙';
        } else {
            themeToggle.textContent = '☀️';
        }
    } else {
        // Default to dark mode if no theme is set
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
    }    // Setup scroll listener
    window.addEventListener('scroll', updateHeaderAndNav);

    // Start at top of page
    window.scrollTo(0, 0);    // Handle initial section display
    const initialHash = window.location.hash.substring(1);
    if (initialHash && document.getElementById(initialHash)) {
        showSection(initialHash, null);
    } else {
        // Default to about/home section
        showSection('about', null);
        // Clean up URL when on homepage
        history.replaceState(null, null, window.location.pathname);
    }
});

function toggleTheme() {
    const body = document.body;
    const themeToggle = document.getElementById('theme-icon');
    if (body.classList.contains('light-mode')) {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
        localStorage.setItem('theme', 'dark-mode');
    } else {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        themeToggle.textContent = '🌙';
        localStorage.setItem('theme', 'light-mode');
    }
}

function showSection(sectionId, event) {
    if (event) {
        event.preventDefault();
    }
    
    // Close any open popups
    document.querySelectorAll('.abstract-popup, .bibtex-popup').forEach(popup => {
        popup.style.display = 'none';
    });

    // Scroll to top before showing new section (instantly)
    window.scrollTo(0, 0);

    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });
    const activeLink = document.querySelector(`.nav-links a[href="#${sectionId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }   // Handle URL and header visibility based on section
    const headerTitle = document.getElementById('header-name');    if (sectionId === 'about') {
        // Hide header name for about/home section and clean up URL
        document.body.classList.add('about-page-active');
        history.replaceState(null, null, window.location.pathname);
    } else {
        // Show header name for other sections and update URL
        document.body.classList.remove('about-page-active');
        history.replaceState(null, null, `#${sectionId}`);
    }

    updateHeaderAndNav(); // Call to adjust header title visibility
}

function updateHeaderAndNav() {
    const aboutSection = document.getElementById('about');
    const body = document.body;

    // Update about-page-active class based on active section
    if (aboutSection.classList.contains('active')) {
        body.classList.add('about-page-active');
    } else {
        body.classList.remove('about-page-active');
    }
}

function toggleAbstract(event) {
    event.preventDefault();
    const abstractPopup = event.target.closest('.publication-content').querySelector('.abstract-popup');
    if (abstractPopup) {
        abstractPopup.style.display = abstractPopup.style.display === 'block' ? 'none' : 'block';
        // Close BibTeX if open
        const bibtexPopup = event.target.closest('.publication-content').querySelector('.bibtex-popup');
        if (bibtexPopup && bibtexPopup.style.display === 'block') {
            bibtexPopup.style.display = 'none';
        }
    }
}

function toggleBibtex(event) {
    event.preventDefault();
    const bibtexPopup = event.target.closest('.publication-content').querySelector('.bibtex-popup');
    if (bibtexPopup) {
        bibtexPopup.style.display = bibtexPopup.style.display === 'block' ? 'none' : 'block';
        // Close Abstract if open
        const abstractPopup = event.target.closest('.publication-content').querySelector('.abstract-popup');
        if (abstractPopup && abstractPopup.style.display === 'block') {
            abstractPopup.style.display = 'none';
        }
    }
}

function copyBibtex(button) {
    const bibtexContent = button.nextElementSibling; // Get the <pre> element
    if (bibtexContent) {
        const textToCopy = bibtexContent.textContent.trim();
        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            setTimeout(() => {
                button.textContent = originalText;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    }
}

function handleAboutClick(event) {
    event.preventDefault();
    
    // Always scroll to top instantly
    window.scrollTo(0, 0);
    
    // Show about section
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById('about').classList.add('active');
    
    // Update navigation
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });
    const activeLink = document.querySelector('.nav-links a[href="#about"]');
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Always show about section and clean URL
    history.pushState(null, '', window.location.pathname.split('#')[0]);
    
    // Add about-page-active class to hide header name
    document.body.classList.add('about-page-active');
    
    updateHeaderAndNav();
}