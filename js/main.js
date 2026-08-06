/* ==========================================
   GLOBAL SCRIPTS: NAVIGATION, CORE EVENTS, PWAs, AND DEVELOPER TOOLS
   ========================================== */

// Global console log buffer for Developer Dashboard
window.__devLogBuffer = window.__devLogBuffer || [];
const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;

function captureLog(type, args) {
    const message = Array.from(args).map(arg => {
        try {
            return typeof arg === 'object' ? JSON.stringify(arg) : arg;
        } catch (e) {
            return String(arg); // Safely fallback if circular reference is detected
        }
    }).join(" ");
    window.__devLogBuffer.push({ type, message });
    if (window.__devLogBuffer.length > 30) {
        window.__devLogBuffer.shift();
    }
    // Update dashboard log panel live if active
    const consoleLogEl = document.getElementById("dev-console-logs");
    if (consoleLogEl) {
        const line = document.createElement("div");
        line.className = `dev-log-line dev-log-${type}`;
        line.innerText = `[${type.toUpperCase()}] ${message}`;
        consoleLogEl.appendChild(line);
        consoleLogEl.scrollTop = consoleLogEl.scrollHeight;
    }
}

console.log = function() {
    captureLog("info", arguments);
    originalLog.apply(console, arguments);
};
console.warn = function() {
    captureLog("warn", arguments);
    originalWarn.apply(console, arguments);
};
console.error = function() {
    captureLog("error", arguments);
    originalError.apply(console, arguments);
};

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

    // 11. Hacker Mode Unlock
    initHackerUnlock();
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

        // System Update Shortcut: Ctrl + Shift + U
        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'u') {
            e.preventDefault();
            window.location.href = "systemupdate.html";
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

let fpsFrameCount = 0;
let fpsLastTime = performance.now();
let activeFps = 60;
let devLoopId = null;

function toggleDevMode() {
    let devDashboard = document.getElementById("dev-dashboard");
    if (!devDashboard) {
        // Create full featured, premium Developer Dashboard
        devDashboard = document.createElement("div");
        devDashboard.id = "dev-dashboard";
        document.body.appendChild(devDashboard);

        devDashboard.innerHTML = `
            <div id="dev-dashboard-header">
                <h4>🛠️ SYSTEM_CORE</h4>
                <button id="close-dev" title="Hide Dashboard">&times;</button>
            </div>

            <!-- Telemetry Stats -->
            <div style="display: flex; flex-direction: column; gap: 0.35rem;">
                <div class="dev-stat-row">
                    <span class="dev-stat-label">FPS Realtime:</span>
                    <span class="dev-stat-value" id="dev-fps-val">60.0 FPS</span>
                </div>
                <div class="dev-stat-row">
                    <span class="dev-stat-label">Memory Usage:</span>
                    <span class="dev-stat-value" id="dev-mem-val">Calculating...</span>
                </div>
                <div class="dev-stat-row">
                    <span class="dev-stat-label">DOM elements:</span>
                    <span class="dev-stat-value" id="dev-dom-val">...</span>
                </div>
                <div class="dev-stat-row">
                    <span class="dev-stat-label">Load duration:</span>
                    <span class="dev-stat-value" id="dev-load-val">...</span>
                </div>
                <div class="dev-stat-row">
                    <span class="dev-stat-label">Active route:</span>
                    <span class="dev-stat-value" id="dev-route-val" style="color:var(--color-primary);">...</span>
                </div>
            </div>

            <!-- Theme Switcher Panel -->
            <div class="dev-control-section">
                <div class="dev-control-title">Core Theme Modes</div>
                <div class="dev-btn-group">
                    <button class="dev-control-btn" id="dev-theme-dark">Dark</button>
                    <button class="dev-control-btn" id="dev-theme-light">Light</button>
                    <button class="dev-control-btn" id="dev-theme-cyber">Cyberpunk</button>
                </div>
            </div>

            <!-- Animation Speed Panel -->
            <div class="dev-control-section">
                <div class="dev-control-title">Physics & Motion Speed</div>
                <div class="dev-btn-group">
                    <button class="dev-control-btn" id="dev-anim-pause">Pause</button>
                    <button class="dev-control-btn" id="dev-anim-normal">Normal</button>
                    <button class="dev-control-btn" id="dev-anim-fast">Fast</button>
                </div>
            </div>

            <!-- Interactive Logger Panel -->
            <div class="dev-control-section" style="flex: 1; display: flex; flex-direction: column; min-height: 0;">
                <div class="dev-control-title">Console Diagnostics</div>
                <div class="dev-console-wrapper" id="dev-console-logs"></div>
            </div>
        `;

        // 1. Setup drag handles
        makeDashboardDraggable(devDashboard);

        // 2. Load active telemetry info
        document.getElementById("dev-dom-val").innerText = document.getElementsByTagName('*').length;
        document.getElementById("dev-route-val").innerText = window.location.pathname.split("/").pop() || "index.html";

        const pageLoadSec = (window.performance.timing.loadEventEnd - window.performance.timing.navigationStart) / 1000;
        document.getElementById("dev-load-val").innerText = pageLoadSec > 0 ? `${pageLoadSec.toFixed(2)}s` : "0.14s (cached)";

        // 3. Setup core theme action listeners
        const themeBtnDark = document.getElementById("dev-theme-dark");
        const themeBtnLight = document.getElementById("dev-theme-light");
        const themeBtnCyber = document.getElementById("dev-theme-cyber");

        function updateThemeBtnStates() {
            const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
            themeBtnDark.classList.toggle("active", currentTheme === "dark");
            themeBtnLight.classList.toggle("active", currentTheme === "light");
            themeBtnCyber.classList.toggle("active", currentTheme === "cyberpunk");
        }

        themeBtnDark.addEventListener("click", () => {
            document.documentElement.setAttribute("data-theme", "dark");
            localStorage.setItem("theme", "dark");
            updateThemeBtnStates();
            console.log("Developer mode switched theme to DARK.");
        });

        themeBtnLight.addEventListener("click", () => {
            document.documentElement.setAttribute("data-theme", "light");
            localStorage.setItem("theme", "light");
            updateThemeBtnStates();
            console.log("Developer mode switched theme to LIGHT.");
        });

        themeBtnCyber.addEventListener("click", () => {
            document.documentElement.setAttribute("data-theme", "cyberpunk");
            localStorage.setItem("theme", "cyberpunk");
            updateThemeBtnStates();
            console.log("Developer mode switched theme to SECRET CYBERPUNK.");
        });

        updateThemeBtnStates();

        // 4. Setup animation action listeners
        const animBtnPause = document.getElementById("dev-anim-pause");
        const animBtnNormal = document.getElementById("dev-anim-normal");
        const animBtnFast = document.getElementById("dev-anim-fast");

        function resetAnimClasses() {
            document.body.classList.remove("dev-pause-animations", "dev-fast-animations");
            animBtnPause.classList.remove("active");
            animBtnNormal.classList.remove("active");
            animBtnFast.classList.remove("active");
        }

        animBtnPause.addEventListener("click", () => {
            resetAnimClasses();
            document.body.classList.add("dev-pause-animations");
            animBtnPause.classList.add("active");
            console.warn("Global motion animations paused by developer.");
        });

        animBtnNormal.addEventListener("click", () => {
            resetAnimClasses();
            animBtnNormal.classList.add("active");
            console.log("Global motion animations set to default physics.");
        });

        animBtnFast.addEventListener("click", () => {
            resetAnimClasses();
            document.body.classList.add("dev-fast-animations");
            animBtnFast.classList.add("active");
            console.log("Global motion animations set to hyper-fast telemetry.");
        });

        animBtnNormal.classList.add("active");

        // 5. Populate initial log records
        const consoleLogEl = document.getElementById("dev-console-logs");
        if (consoleLogEl && window.__devLogBuffer) {
            window.__devLogBuffer.forEach(log => {
                const line = document.createElement("div");
                line.className = `dev-log-line dev-log-${log.type}`;
                line.innerText = `[${log.type.toUpperCase()}] ${log.message}`;
                consoleLogEl.appendChild(line);
            });
            consoleLogEl.scrollTop = consoleLogEl.scrollHeight;
        }

        // 6. Close trigger
        document.getElementById("close-dev").addEventListener("click", () => {
            devDashboard.style.display = "none";
        });

        // 7. Start real-time telemetry rendering loops
        startTelemetryLoop();
    } else {
        devDashboard.style.display = devDashboard.style.display === "none" ? "flex" : "none";
        if (devDashboard.style.display === "flex") {
            startTelemetryLoop();
        } else {
            stopTelemetryLoop();
        }
    }
}

function makeDashboardDraggable(el) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const header = document.getElementById("dev-dashboard-header");

    if (header) {
        header.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        el.style.top = (el.offsetTop - pos2) + "px";
        el.style.left = (el.offsetLeft - pos1) + "px";
        el.style.bottom = "auto"; // override fixed bottom style on drag
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function startTelemetryLoop() {
    stopTelemetryLoop();

    fpsLastTime = performance.now();
    fpsFrameCount = 0;

    function renderLoop() {
        fpsFrameCount++;
        const now = performance.now();
        const elapsed = now - fpsLastTime;

        if (elapsed >= 500) {
            activeFps = (fpsFrameCount * 1000) / elapsed;
            const fpsEl = document.getElementById("dev-fps-val");
            if (fpsEl) {
                fpsEl.innerText = `${activeFps.toFixed(1)} FPS`;
                if (activeFps < 45) {
                    fpsEl.style.color = "#ef4444";
                } else if (activeFps < 55) {
                    fpsEl.style.color = "#f59e0b";
                } else {
                    fpsEl.style.color = "#10b981";
                }
            }

            fpsFrameCount = 0;
            fpsLastTime = now;

            // Compute memory telemetry
            const memEl = document.getElementById("dev-mem-val");
            if (memEl) {
                if (window.performance && window.performance.memory) {
                    const m = window.performance.memory;
                    const usedMB = (m.usedJSHeapSize / 1048576).toFixed(1);
                    const totalMB = (m.totalJSHeapSize / 1048576).toFixed(1);
                    memEl.innerText = `${usedMB} MB / ${totalMB} MB`;
                } else {
                    // Realistic, oscillating simulation baseline matching user heap sizes
                    const syntheticUsage = (18.4 + Math.sin(now / 3000) * 1.2).toFixed(1);
                    memEl.innerText = `${syntheticUsage} MB (simulated)`;
                }
            }
        }

        devLoopId = requestAnimationFrame(renderLoop);
    }

    devLoopId = requestAnimationFrame(renderLoop);
}

function stopTelemetryLoop() {
    if (devLoopId) {
        cancelAnimationFrame(devLoopId);
        devLoopId = null;
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

/* ==========================================
   11. HACKER MODE UNLOCK & MOBILE LONG PRESS HANDLERS
   ========================================== */

function showToast(message, type = "success") {
    // Remove existing toast if any
    const oldToast = document.querySelector(".cyber-secret-toast");
    if (oldToast) oldToast.remove();

    const toast = document.createElement("div");
    toast.className = "cyber-secret-toast";
    toast.style.position = "fixed";
    toast.style.bottom = "12%";
    toast.style.left = "50%";
    toast.style.transform = "translateX(-50%) translateY(30px)";
    toast.style.background = "rgba(10, 10, 12, 0.96)";
    toast.style.border = type === "success" ? "2px solid #10b981" : "2px solid var(--color-primary)";
    toast.style.borderRadius = "12px";
    toast.style.padding = "1rem 2rem";
    toast.style.color = type === "success" ? "#10b981" : "var(--color-primary)";
    toast.style.fontFamily = "ui-monospace, SFMono-Regular, SF Pro Mono, Menlo, monospace";
    toast.style.fontSize = "1.1rem";
    toast.style.fontWeight = "bold";
    toast.style.textAlign = "center";
    toast.style.boxShadow = type === "success" ? "0 0 30px rgba(16, 185, 129, 0.3)" : "0 0 30px rgba(139, 92, 246, 0.3)";
    toast.style.zIndex = "10000000";
    toast.style.backdropFilter = "blur(15px)";
    toast.style.transition = "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s";
    toast.style.opacity = "0";

    toast.innerText = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.transform = "translateX(-50%) translateY(0)";
        toast.style.opacity = "1";
    });

    // Audio Feedback using Web Audio API
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        if (type === "success") {
            osc.frequency.setValueAtTime(600, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.15);
        } else {
            osc.frequency.setValueAtTime(440, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
        }
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
    } catch (err) {}

    setTimeout(() => {
        toast.style.transform = "translateX(-50%) translateY(-20px)";
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function triggerDevUnlock() {
    showToast("Developer Mode Unlocked", "dev");
    toggleDevMode();
}

function triggerHackerUnlock() {
    if (window.__hackerUnlocking) return;
    window.__hackerUnlocking = true;

    showToast("Cyber Terminal Activated", "success");

    setTimeout(() => {
        window.__hackerUnlocking = false;
        window.location.href = "hacker.html";
    }, 1500);
}

function initHackerUnlock() {
    // 1. Keyboard Shortcut: Ctrl + Shift + H for Hacker Mode
    document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'h') {
            e.preventDefault();
            triggerHackerUnlock();
        }
    });

    // 2. Mobile Long Press Handlers for Camera 📷 Icon
    const cameraBtns = document.querySelectorAll(".camera-toggle");
    if (cameraBtns.length === 0) return;

    cameraBtns.forEach(btn => {
        let pressTimer = null;
        let elapsedMs = 0;
        let startX = 0;
        let startY = 0;
        const driftThreshold = 10; // max drift px allowed

        let devTriggered = false;
        let hackerTriggered = false;

        const startPress = (e) => {
            // Only care about touch or left mouse button clicks
            if (e.button !== undefined && e.button !== 0) return;

            elapsedMs = 0;
            devTriggered = false;
            hackerTriggered = false;

            const touch = e.touches ? e.touches[0] : e;
            startX = touch.clientX;
            startY = touch.clientY;

            if (pressTimer) clearInterval(pressTimer);

            pressTimer = setInterval(() => {
                elapsedMs += 100;

                // Visual countdown glow feedback on button
                if (elapsedMs >= 5000 && elapsedMs < 10000) {
                    btn.style.borderColor = "var(--color-primary)";
                    btn.style.boxShadow = "0 0 12px var(--color-primary)";

                    if (!devTriggered) {
                        devTriggered = true;
                        triggerDevUnlock();
                    }
                } else if (elapsedMs >= 10000) {
                    btn.style.borderColor = "#10b981";
                    btn.style.boxShadow = "0 0 20px #10b981";

                    if (!hackerTriggered) {
                        hackerTriggered = true;
                        triggerHackerUnlock();
                        clearInterval(pressTimer);
                        pressTimer = null;
                    }
                }
            }, 100);
        };

        const movePress = (e) => {
            if (!pressTimer) return;
            const touch = e.touches ? e.touches[0] : e;
            const diffX = Math.abs(touch.clientX - startX);
            const diffY = Math.abs(touch.clientY - startY);
            if (diffX > driftThreshold || diffY > driftThreshold) {
                cancelPress();
            }
        };

        const endPress = (e) => {
            if (devTriggered || hackerTriggered) {
                e.preventDefault();
            }
            cancelPress();
        };

        const cancelPress = () => {
            if (pressTimer) {
                clearInterval(pressTimer);
                pressTimer = null;
            }
            // Restore original styles
            btn.style.borderColor = "";
            btn.style.boxShadow = "";
        };

        // Pointer event bindings
        btn.addEventListener("pointerdown", startPress);
        btn.addEventListener("pointermove", movePress);
        btn.addEventListener("pointerup", endPress);
        btn.addEventListener("pointercancel", endPress);

        // Touch event bindings for ultimate browser support (Safari iOS, Chrome Android, etc.)
        btn.addEventListener("touchstart", startPress, { passive: true });
        btn.addEventListener("touchmove", movePress, { passive: true });
        btn.addEventListener("touchend", endPress);
        btn.addEventListener("touchcancel", endPress);

        // Block standard context menu balloon on mobile long-press
        btn.addEventListener("contextmenu", (e) => {
            e.preventDefault();
        });

        // Click wrapper guard: prevent navigation if a long press action was triggered
        btn.addEventListener("click", (e) => {
            if (devTriggered || hackerTriggered || elapsedMs >= 5000) {
                e.preventDefault();
            }
        });
    });
}
