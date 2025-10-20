if (!document.body.classList.contains('about-page-active')) {
    document.body.classList.add('about-page-active');
}

function initParticles(maxRetries = 3, delay = 500) {
    let retries = 0;
    
    function attemptInit() {
        try {
            const container = document.querySelector('.bg-particles');
            if (container) {
                setupGridMovement();
                console.log('Particles initialized successfully');
            } else if (retries < maxRetries) {
                retries++;
                console.log(`Particles container not found, retry ${retries}/${maxRetries}...`);
                setTimeout(attemptInit, delay);
            } else {
                console.error('Failed to initialize particles: container not found');
            }
        } catch (error) {
            console.error('Error initializing particles:', error);
            if (retries < maxRetries) {
                retries++;
                console.log(`Retry ${retries}/${maxRetries}...`);
                setTimeout(attemptInit, delay);
            }
        }
    }
    
    attemptInit();
}

document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('header');
    if (header) {
        document.body.style.paddingTop = `${header.offsetHeight}px`;
    }

    const themeToggle = document.getElementById('theme-icon');
    if (themeToggle) {
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme) {
            document.body.classList.add(currentTheme);
            themeToggle.textContent = currentTheme === 'light-mode' ? '🌙' : '🔆';
        } else {
            document.body.classList.add('dark-mode');
            themeToggle.textContent = '🔆';
        }
    }
    
    window.addEventListener('scroll', updateHeaderAndNav);

    window.scrollTo(0, 0);
    
    const initialHash = window.location.hash.substring(1);
    if (initialHash && document.getElementById(initialHash)) {
        showSection(initialHash, null);
    } else {
        showSection('about', null);
        history.replaceState(null, null, window.location.pathname);
    }
    
    addScrollAnimations();
    
    initParticles();
    
    const observer = new MutationObserver(() => {
        if (document.querySelector('.bg-particles') && !document.querySelector('.particle')) {
            initParticles();
        }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
});

function addScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    setTimeout(() => {
        const sections = document.querySelectorAll('.summary, .news-section, .publications-section, .education-section, .skills-section, .publication-year-group, .project-item');
        sections.forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(30px)';
            section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(section);
        });
    }, 100);
}

function animateParticlesOnScroll() {
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrolled = window.pageYOffset;
                const particles = document.querySelectorAll('.particle');
                particles.forEach((particle, index) => {
                    const speed = (index + 1) * 0.05;
                    particle.style.transform = `translateY(${scrolled * speed}px)`;
                });
                ticking = false;
            });
            ticking = true;
        }
    });
}

function setupGridMovement() {
    const container = document.querySelector('.bg-particles');
    if (!container) return;
    
    container.innerHTML = '';
    
    const particles = [];
    const numParticles = 100;
    const radius = Math.min(window.innerWidth, window.innerHeight) * 1.7;
    let mouseX = 0;
    let mouseY = 0;
    let rotationX = 0;
    let rotationY = 0;
    let baseRotationX = 0;
    let baseRotationY = 0;
    
    const offsetY = 0;
    const offsetX = 0;

    for (let i = 0; i < numParticles; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        container.appendChild(particle);

        const phi = Math.acos(-1 + (2 * i) / numParticles);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;

        const x = radius * Math.cos(theta) * Math.sin(phi);
        const y = radius * Math.sin(theta) * Math.sin(phi);
        const z = radius * Math.cos(phi);

        particles.push({
            element: particle,
            baseX: x,
            baseY: y,
            baseZ: z
        });
    }

    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - window.innerWidth / 2) / window.innerWidth;
        mouseY = (e.clientY - window.innerHeight / 2) / window.innerHeight;
        lastMouseMove = Date.now();
    });

    let lastTime = 0;
    let lastMouseMove = Date.now();
    let velocityX = 0;
    let velocityY = 0;
    let lastMouseX = 0;
    let lastMouseY = 0;
    
    function animate(currentTime) {
        if (!lastTime) lastTime = currentTime;
        const deltaTime = (currentTime - lastTime) / 1000;
        lastTime = currentTime;

        const timeSinceMouseMove = (Date.now() - lastMouseMove) / 1000;
        
        if (timeSinceMouseMove < 0.1) {
            const mouseDeltaX = mouseX - lastMouseX;
            const mouseDeltaY = mouseY - lastMouseY;
            
            velocityX = velocityX * 0.4 + mouseDeltaX * 2;
            velocityY = velocityY * 0.4 + mouseDeltaY * 2;
        }
        
        const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
        const friction = speed > 0.005 ? 0.9 : 0.98;
        
        velocityX *= friction;
        velocityY *= friction;
        
        rotationX += velocityY * deltaTime * 60;
        rotationY += velocityX * deltaTime * 60;
        
        lastMouseX = mouseX;
        lastMouseY = mouseY;

        particles.forEach(particle => {
            const cosX = Math.cos(rotationX);
            const sinX = Math.sin(rotationX);
            const cosY = Math.cos(rotationY);
            const sinY = Math.sin(rotationY);

            let x = particle.baseX;
            let z = particle.baseZ;
            let rotatedX = x * cosY - z * sinY;
            let rotatedZ = z * cosY + x * sinY;

            let y = particle.baseY;
            let finalY = y * cosX - rotatedZ * sinX;
            let finalZ = rotatedZ * cosX + y * sinX;

            const scale = 1000 / (1000 + finalZ);
            const screenX = rotatedX * scale;
            const screenY = finalY * scale;

            const normalizedZ = (finalZ + radius) / (2 * radius);
            const size = Math.min(2.0, 1.0 + normalizedZ * 1.0);
            
            particle.element.style.transform = `translate3d(${screenX + offsetX}px, ${screenY + offsetY}px, ${finalZ}px) scale(${scale})`;
            particle.element.style.width = `${size}px`;
            particle.element.style.height = `${size}px`;
            particle.element.style.opacity = 1;
        });

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
    
    window.addEventListener('resize', () => {
        const newRadius = Math.min(window.innerWidth, window.innerHeight) * 0.25;
        particles.forEach(particle => {
            particle.baseX *= newRadius / radius;
            particle.baseY *= newRadius / radius;
            particle.baseZ *= newRadius / radius;
        });
    });
}

function toggleTheme() {
    const body = document.body;
    const themeToggle = document.getElementById('theme-icon');
    if (body.classList.contains('light-mode')) {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        themeToggle.textContent = '🔆';
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
    
    document.querySelectorAll('.abstract-popup, .bibtex-popup').forEach(popup => {
        popup.style.display = 'none';
    });

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
    }
    
    const headerTitle = document.getElementById('header-name');
    
    if (sectionId === 'about') {
        document.body.classList.add('about-page-active');
        history.replaceState(null, null, window.location.pathname);
    } else {
        document.body.classList.remove('about-page-active');
        history.replaceState(null, null, `#${sectionId}`);
    }

    updateHeaderAndNav();
}

function updateHeaderAndNav() {
    const aboutSection = document.getElementById('about');
    const body = document.body;

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
        const abstractPopup = event.target.closest('.publication-content').querySelector('.abstract-popup');
        if (abstractPopup && abstractPopup.style.display === 'block') {
            abstractPopup.style.display = 'none';
        }
    }
}

function copyBibtex(button) {
    const bibtexContent = button.nextElementSibling;
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
    
    window.scrollTo(0, 0);
    
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById('about').classList.add('active');
    
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });
    const activeLink = document.querySelector('.nav-links a[href="#about"]');
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    history.pushState(null, '', window.location.pathname.split('#')[0]);
    
    document.body.classList.add('about-page-active');
    
    updateHeaderAndNav();
}

function initScrollClock() {
    let lastScrollTop = 0;
    const clock = document.getElementById('digital-clock');

    if (!clock) return;

    clock.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    clock.style.willChange = 'opacity, transform';

    const handleScroll = () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop === 0) {
            clock.style.opacity = '1';
            clock.style.pointerEvents = 'auto';
            clock.style.transform = 'translateY(0)';
        } else if (scrollTop > lastScrollTop) {
            clock.style.opacity = '0';
            clock.style.pointerEvents = 'none';
            clock.style.transform = 'translateY(-10px)';
        }

        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    };

    window.addEventListener('scroll', handleScroll);
    
    handleScroll();
}

document.addEventListener('DOMContentLoaded', initScrollClock);