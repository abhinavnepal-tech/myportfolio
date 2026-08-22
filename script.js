const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================================
   Scroll-driven: nav state, progress bar, side dots
   ============================================ */
const navBar = document.getElementById('navBar');
const scrollProgress = document.getElementById('scrollProgress');
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');
const sideDots = document.querySelectorAll('.side-dot');

let scrollTicking = false;

function onScroll() {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? scrollTop / docHeight : 0;

    if (scrollProgress) {
        scrollProgress.style.transform = `scaleX(${Math.min(progress, 1)})`;
    }

    if (navBar) {
        navBar.classList.toggle('scrolled', scrollTop > 40);
    }

    const headerHeight = navBar ? navBar.offsetHeight : 0;
    let current = sections[0] ? sections[0].getAttribute('id') : '';

    sections.forEach((section) => {
        const sectionTop = section.offsetTop - headerHeight - 120;
        if (scrollTop >= sectionTop) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });

    sideDots.forEach((dot) => {
        dot.classList.toggle('active', dot.dataset.target === `#${current}`);
    });

    scrollTicking = false;
}

window.addEventListener('scroll', () => {
    if (!scrollTicking) {
        requestAnimationFrame(onScroll);
        scrollTicking = true;
    }
});
onScroll();

/* ============================================
   Smooth scrolling for in-page links
   ============================================ */
document.querySelectorAll('a[href^="#"], .side-dot').forEach((el) => {
    el.addEventListener('click', function (e) {
        const targetSelector = this.getAttribute('href') || this.dataset.target;
        if (!targetSelector) return;
        const targetEl = document.querySelector(targetSelector);
        if (!targetEl) return;

        e.preventDefault();
        const headerHeight = navBar ? navBar.offsetHeight : 0;
        window.scrollTo({
            top: targetEl.offsetTop - headerHeight,
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
        });

        const navLinksEl = document.getElementById('navLinks');
        const hamburgerEl = document.getElementById('hamburger');
        if (navLinksEl && navLinksEl.classList.contains('open')) {
            navLinksEl.classList.remove('open');
            hamburgerEl && hamburgerEl.classList.remove('open');
            hamburgerEl && hamburgerEl.setAttribute('aria-expanded', 'false');
        }
    });
});

/* ============================================
   Mobile menu toggle
   ============================================ */
const hamburger = document.getElementById('hamburger');
const navLinksPanel = document.getElementById('navLinks');

if (hamburger && navLinksPanel) {
    hamburger.addEventListener('click', () => {
        const isOpen = navLinksPanel.classList.toggle('open');
        hamburger.classList.toggle('open', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
    });
}

/* ============================================
   Reveal-on-scroll
   ============================================ */
const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                revealObserver.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
);

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

/* ============================================
   Ambient cursor glow
   ============================================ */
const cursorGlow = document.getElementById('cursorGlow');

if (cursorGlow && !prefersReducedMotion) {
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;

    window.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
    });

    function animateGlow() {
        currentX += (targetX - currentX) * 0.12;
        currentY += (targetY - currentY) * 0.12;
        cursorGlow.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
        requestAnimationFrame(animateGlow);
    }
    animateGlow();
}

/* ============================================
   Magnetic buttons
   ============================================ */
if (!prefersReducedMotion) {
    document.querySelectorAll('.magnetic').forEach((btn) => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transition = 'transform 0.05s linear';
            btn.style.transform = `translate(${x * 0.22}px, ${y * 0.35}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
            btn.style.transform = 'translate(0, 0)';
        });
    });
}

/* ============================================
   3D tilt + spotlight for project cards
   ============================================ */
if (!prefersReducedMotion) {
    document.querySelectorAll('.project-card').forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width;
            const py = (e.clientY - rect.top) / rect.height;

            const rotateX = (0.5 - py) * 8;
            const rotateY = (px - 0.5) * 10;

            card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(4px)`;
            card.style.setProperty('--mx', `${px * 100}%`);
            card.style.setProperty('--my', `${py * 100}%`);
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(900px) rotateX(0) rotateY(0) translateZ(0)';
        });
    });
}

/* ============================================
   Animated stat counters
   ============================================ */
const statNumbers = document.querySelectorAll('.stat-number');

const counterObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const target = parseInt(el.dataset.target, 10) || 0;
            const suffix = el.dataset.suffix || '';
            const duration = 1200;
            const start = performance.now();

            function step(now) {
                const progress = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = Math.round(eased * target) + suffix;
                if (progress < 1) requestAnimationFrame(step);
            }

            if (prefersReducedMotion) {
                el.textContent = target + suffix;
            } else {
                requestAnimationFrame(step);
            }

            counterObserver.unobserve(el);
        });
    },
    { threshold: 0.4 }
);

statNumbers.forEach((el) => counterObserver.observe(el));

/* ============================================
   Skill progress rings
   ============================================ */
const RING_CIRCUMFERENCE = 213.6;

const skillObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const card = entry.target;
            const percent = parseFloat(card.dataset.percent);
            const ring = card.querySelector('.ring-progress');
            if (ring && !isNaN(percent)) {
                const offset = RING_CIRCUMFERENCE - (percent / 100) * RING_CIRCUMFERENCE;
                requestAnimationFrame(() => {
                    ring.style.strokeDashoffset = offset;
                });
            }
            skillObserver.unobserve(card);
        });
    },
    { threshold: 0.3 }
);

document.querySelectorAll('.skill-card[data-percent]').forEach((el) => skillObserver.observe(el));

/* ============================================
   Project filter
   ============================================ */
const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
        filterButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;
        projectCards.forEach((card) => {
            const matches = filter === 'all' || card.dataset.category === filter;
            card.classList.toggle('filtered-out', !matches);
        });
    });
});

/* ============================================
   Click-to-copy contact cards
   ============================================ */
const toast = document.getElementById('toast');
let toastTimeout;

function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 2200);
}

document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
        const value = btn.dataset.copy;
        try {
            await navigator.clipboard.writeText(value);
            showToast(`Copied "${value}" to clipboard`);
        } catch (err) {
            showToast('Could not copy — please copy manually');
        }
    });
});

/* ============================================
   Hero particle network
   ============================================ */
(function initParticleNetwork() {
    const canvas = document.getElementById('particleCanvas');
    const hero = document.getElementById('top');
    if (!canvas || !hero) return;

    const ctx = canvas.getContext('2d');
    let width, height, particles, mouse = { x: null, y: null };
    let animationId;

    const LATTE = '232, 187, 141';
    const LINK_DIST = 130;
    const MOUSE_DIST = 160;

    function resize() {
        width = canvas.width = hero.clientWidth;
        height = canvas.height = hero.clientHeight;
    }

    function createParticles() {
        const count = Math.min(80, Math.max(28, Math.floor((width * height) / 16000)));
        particles = Array.from({ length: count }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.35,
            vy: (Math.random() - 0.5) * 0.35,
            r: Math.random() * 1.6 + 0.8,
        }));
    }

    function step() {
        ctx.clearRect(0, 0, width, height);

        particles.forEach((p) => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${LATTE}, 0.55)`;
            ctx.fill();
        });

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < LINK_DIST) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(${LATTE}, ${0.18 * (1 - dist / LINK_DIST)})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }

            if (mouse.x !== null) {
                const dx = particles[i].x - mouse.x;
                const dy = particles[i].y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MOUSE_DIST) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = `rgba(${LATTE}, ${0.35 * (1 - dist / MOUSE_DIST)})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }

        animationId = requestAnimationFrame(step);
    }

    function drawStaticFrame() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach((p) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${LATTE}, 0.4)`;
            ctx.fill();
        });
    }

    resize();
    createParticles();

    if (prefersReducedMotion) {
        drawStaticFrame();
    } else {
        step();

        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        hero.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });
    }

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            resize();
            createParticles();
        }, 200);
    });
})();