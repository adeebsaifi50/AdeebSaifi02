/* ==========================================
   GLOBAL SCRIPTS: NAVIGATION, CORE EVENTS, PWAs, AND DEVELOPER TOOLS
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize Custom Cursor (only for desktop pointer devices)
    initCustomCursor();

    // 2. Light & Dark Theme Persistence & Toggle
    initThemeToggle();

    // 3. Floating Navbar & Scroll Effects
    initNavbarScroll();

    // 4. Scroll Progress Bar
    initScrollProgress();

    // 5. Scroll Reveal with Intersection Observer
    initScrollReveal();

    // 6. Back To Top functionality
    initBackToTop();

    // 7. Interactive Magnetic Elements / Mouse moves on Glowing cards
    initCardGlowEffects();

    // 8. Mobile Navigation Burger Trigger
    initMobileNav();

    // 9. Interactive Features: Keyboard Shortcuts, Easter Egg (Konami Code), & Dev Dashboard
    initInteractiveEasterEggs();

    // 10. Service Worker PWA Setup
    initPwaRegistration();
});

/* ==========================================
   1. CUSTOM CURSOR
   ========================================== */
function initCustomCursor() {
    const cursor = document.querySelector(".custom-cursor");
    const dot = document.querySelector(".custom-cursor-dot");

    if (!cursor || !dot) return;

    document.addEventListener("mousemove", (e) => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;

        dot.style.left = `${e.clientX}px`;
        dot.style.top = `${e.clientY}px`;
    });

    // Cursor animations on interactive elements
    const interactiveElements = document.querySelectorAll("a, button, .card, .btn, .faq-trigger, [role='button']");
    interactiveElements.forEach((el) => {
        el.addEventListener("mouseenter", () => {
            cursor.style.width = "40px";
            cursor.style.height = "40px";
            cursor.style.borderColor = "var(--color-accent)";
            cursor.style.backgroundColor = "rgba(139, 92, 246, 0.1)";
        });

        el.addEventListener("mouseleave", () => {
            cursor.style.width = "20px";
            cursor.style.height = "20px";
            cursor.style.borderColor = "var(--color-primary)";
            cursor.style.backgroundColor = "transparent";
        });
    });
}

/* ==========================================
   2. LIGHT & DARK THEME SWITCHER
   ========================================== */
function initThemeToggle() {
    const toggleBtn = document.querySelector(".theme-toggle");
    if (!toggleBtn) return;

    // Check saved theme or system preference
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    let currentTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", currentTheme);

    toggleBtn.addEventListener("click", () => {
        const newTheme = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
    });
}

/* ==========================================
   3. FLOATING NAVBAR SCROLL EFFECTS
   ========================================== */
function initNavbarScroll() {
    const navbar = document.querySelector(".navbar");
    if (!navbar) return;

    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });
}

/* ==========================================
   4. SCROLL PROGRESS BAR
   ========================================== */
function initScrollProgress() {
    const progressBar = document.querySelector(".scroll-progress");
    if (!progressBar) return;

    window.addEventListener("scroll", () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = `${scrolled}%`;
    });
}

/* ==========================================
   5. SCROLL REVEAL INTERSECTION OBSERVER
   ========================================== */
function initScrollReveal() {
    const reveals = document.querySelectorAll(".reveal");
    if (reveals.length === 0) return;

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                // Optional: Stop observing once revealed
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    });

    reveals.forEach(el => revealObserver.observe(el));
}

/* ==========================================
   6. BACK TO TOP FUNCTIONALITY
   ========================================== */
function initBackToTop() {
    const btn = document.querySelector(".back-to-top");
    if (!btn) return;

    window.addEventListener("scroll", () => {
        if (window.scrollY > 300) {
            btn.classList.add("visible");
        } else {
            btn.classList.remove("visible");
        }
    });

    btn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}

/* ==========================================
   7. INTERACTIVE MOUSE MOVES / CARD GLOWS
   ========================================== */
function initCardGlowEffects() {
    const cards = document.querySelectorAll(".card-glow, .card");
    cards.forEach(card => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty("--mouse-x", `${x}px`);
            card.style.setProperty("--mouse-y", `${y}px`);
        });
    });
}

/* ==========================================
   8. MOBILE NAVIGATION BURGER TRIGGER
   ========================================== */
function initMobileNav() {
    const burger = document.querySelector(".mobile-nav-toggle");
    const menu = document.querySelector(".nav-menu");
    if (!burger || !menu) return;

    burger.addEventListener("click", () => {
        menu.classList.toggle("active");
        const expanded = burger.getAttribute("aria-expanded") === "true" || false;
        burger.setAttribute("aria-expanded", !expanded);
    });

    // Close menu when clicked outside or on links
    document.addEventListener("click", (e) => {
        if (!burger.contains(e.target) && !menu.contains(e.target)) {
            menu.classList.remove("active");
            burger.setAttribute("aria-expanded", "false");
        }
    });
}

/* ==========================================
   9. INTERACTIVE EASTER EGGS, SHORTCUTS, DEV DASHBOARD
   ========================================== */
function initInteractiveEasterEggs() {
    // Keyboard Shortcuts
    document.addEventListener("keydown", (e) => {
        // Toggle Dark Mode: Alt + T
        if (e.altKey && e.key.toLowerCase() === 't') {
            e.preventDefault();
            const toggleBtn = document.querySelector(".theme-toggle");
            if (toggleBtn) toggleBtn.click();
        }

        // Search Focus: '/' key (unless in input / textarea)
        if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
            e.preventDefault();
            const searchInput = document.querySelector(".nav-search-input") || document.querySelector(".page-search-input");
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }

        // Developer Mode: Ctrl + Shift + D
        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
            e.preventDefault();
            toggleDevMode();
        }
    });

    // Konami Code Easter Egg: ArrowUp, ArrowUp, ArrowDown, ArrowDown, ArrowLeft, ArrowRight, ArrowLeft, ArrowRight, B, A
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;

    document.addEventListener("keydown", (e) => {
        if (e.key === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                triggerKonamiConfetti();
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });
}

function triggerKonamiConfetti() {
    alert("🎉 Space Easter Egg Activated! Adeeb Saifi is a Galactic Developer! 🎉");
    document.body.style.animation = "gradientBG 3s ease infinite";
    document.body.style.backgroundSize = "400% 400%";
}

function toggleDevMode() {
    let devDashboard = document.getElementById("dev-dashboard");
    if (!devDashboard) {
        // Dynamically create Dev Mode Dashboard if it doesn't exist
        devDashboard = document.createElement("div");
        devDashboard.id = "dev-dashboard";
        devDashboard.style.cssText = `
            position: fixed;
            bottom: 1rem;
            left: 1rem;
            width: 320px;
            background: rgba(10, 10, 12, 0.95);
            border: 1px solid var(--color-accent);
            border-radius: 16px;
            padding: 1.5rem;
            color: #10b981;
            font-family: var(--font-mono);
            font-size: 0.85rem;
            z-index: 10001;
            box-shadow: 0 10px 30px rgba(0,0,0,0.8);
            backdrop-filter: blur(12px);
        `;

        devDashboard.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:1rem; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:0.5rem;">
                <span style="font-weight:bold; color:var(--text-primary)">🛠️ DEV_DASHBOARD</span>
                <button id="close-dev" style="background:none; border:none; color:var(--color-danger); cursor:pointer;">[X]</button>
            </div>
            <div style="margin-bottom:0.5rem;">STATUS: <span style="color:#ffffff; font-weight:bold;">DEVELOPER_MODE_ACTIVE</span></div>
            <div style="margin-bottom:0.5rem;">DOM Nodes: <span id="node-count" style="color:#ffffff;">...</span></div>
            <div style="margin-bottom:0.5rem;">Page Load: <span id="load-time" style="color:#ffffff;">...</span></div>
            <div style="margin-bottom:0.5rem;">Screen Resolution: <span style="color:#ffffff;">${window.screen.width}x${window.screen.height}</span></div>
            <div style="margin-bottom:0.5rem;">Agent: <span style="color:#ffffff; font-size:0.75rem;">Jules elite Core v1.0</span></div>
        `;
        document.body.appendChild(devDashboard);

        // Compute developer metrics
        document.getElementById("node-count").innerText = document.getElementsByTagName('*').length;

        // Page load estimation
        const loadTime = (window.performance.timing.loadEventEnd - window.performance.timing.navigationStart) / 1000;
        document.getElementById("load-time").innerText = loadTime > 0 ? `${loadTime.toFixed(2)}s` : 'Calculating on next scroll...';

        document.getElementById("close-dev").addEventListener("click", () => {
            devDashboard.style.display = "none";
        });
    } else {
        devDashboard.style.display = devDashboard.style.display === "none" ? "block" : "none";
    }
}

/* ==========================================
   10. PWA SERVICE WORKER REGISTRATION
   ========================================== */
function initPwaRegistration() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js')
                .then(registration => {
                    console.log('ServiceWorker registered successfully: ', registration.scope);
                })
                .catch(err => {
                    console.log('ServiceWorker registration failed: ', err);
                });
        });
    }
}
