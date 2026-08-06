/**
 * SYSTEMUPDATE.JS
 * Premium Cinematic Operating System Update Simulation.
 * Safe, fictional, interactive, with Web Audio API synthesizer.
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Core State
    const state = {
        progress: 0,
        isMuted: false,
        soundEnabled: false,
        detectedOS: "macOS", // default fallback
        reached99: false,
        doubleClicksOrTaps: 0,
        audioContext: null,
        simulationSpeedMultiplier: 1.0,
        animationFrameId: null,
        returnUrl: "index.html"
    };

    // Keep track of referer if any, or default to previous pages
    if (document.referrer && document.referrer.includes(window.location.hostname)) {
        state.returnUrl = document.referrer;
    }

    // 2. Select Elements
    const elements = {
        viewport: document.getElementById("update-viewport"),
        body: document.body,
        muteToggle: document.getElementById("mute-toggle"),
        fullscreenToggle: document.getElementById("fullscreen-toggle"),
        backBtn: document.getElementById("back-to-safety"),
        osLogo: document.getElementById("os-logo-element"),
        osTitle: document.getElementById("os-title-text"),
        osSubtitle: document.getElementById("os-subtitle-text"),
        progressCircle: document.getElementById("progress-ring-bar"),
        progressPercent: document.getElementById("percentage-num"),
        progressBarFill: document.getElementById("progress-bar-fill"),
        stageText: document.getElementById("update-stage-text"),
        timeText: document.getElementById("time-remaining-text"),
        lockNotice: document.getElementById("interaction-lock-notice")
    };

    // 3. Update Stages Data
    const updateStages = [
        { progressLimit: 12, label: "Preparing update files..." },
        { progressLimit: 25, label: "Downloading secure architecture modules..." },
        { progressLimit: 40, label: "Verifying package integrity digests..." },
        { progressLimit: 55, label: "Installing high-performance security kernels..." },
        { progressLimit: 70, label: "Updating modular system dependencies..." },
        { progressLimit: 85, label: "Optimizing code execution performance modules..." },
        { progressLimit: 92, label: "Running telemetry diagnostic routines..." },
        { progressLimit: 98, label: "Clearing temporary installations workspace..." },
        { progressLimit: 99, label: "Awaiting final user execution authorization..." }
    ];

    // 4. OS Logo SVGs
    const osLogos = {
        windows: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M0 3.449L9.75 2.1v9.45H0V3.449zM0 12.45h9.75v9.45L0 20.551v-8.1zm10.8-10.5L24 0v11.55H10.8V1.95zM10.8 12.45H24v9.6l-13.2-1.8v-7.8z"/></svg>`,
        android: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.6 9.48a.74.74 0 0 1-.74-.74v-1.1c0-1.74-1.42-3.16-3.16-3.16s-3.16 1.42-3.16 3.16v1.1a.74.74 0 0 1-1.48 0v-1.1c0-2.56 2.08-4.64 4.64-4.64s4.64 2.08 4.64 4.64v1.1a.74.74 0 0 1-.74.74zm-3.9-6.3a.74.74 0 0 1-.72-.56L12.56.54a.74.74 0 1 1 1.44.36l-.42 1.68a.74.74 0 0 1-.72.56zM10.3 3.18a.74.74 0 0 1-.72-.9l.42-1.68a.74.74 0 1 1 1.44.36L11.02 2.6a.74.74 0 0 1-.72.58zM4.46 16.52A1.48 1.48 0 0 1 3 15.04v-4.1a1.48 1.48 0 0 1 2.96 0v4.1a1.48 1.48 0 0 1-1.5 1.48zm15.08 0a1.48 1.48 0 0 1-1.48-1.48v-4.1a1.48 1.48 0 0 1 2.96 0v4.1a1.48 1.48 0 0 1-1.48 1.48zM7.06 19.46V9.48h9.88v9.98c0 1.22-1 2.22-2.22 2.22H9.28c-1.22 0-2.22-1-2.22-2.22zm2.46-7.4a.98.98 0 1 0 0-1.96.98.98 0 0 0 0 1.96zm4.94 0a.98.98 0 1 0 0-1.96.98.98 0 0 0 0 1.96zm-5.2 7.14a.74.74 0 0 0 .74.74h4.94a.74.74 0 0 0 0-1.48H9.98a.74.74 0 0 0-.74.74z"/></svg>`,
        ios: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.15.67-2.87 1.51-.62.71-1.16 1.85-1.02 2.96 1.1.09 2.21-.57 2.9-1.41z"/></svg>`,
        macos: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.15.67-2.87 1.51-.62.71-1.16 1.85-1.02 2.96 1.1.09 2.21-.57 2.9-1.41z"/></svg>`,
        linux: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 14.5h-2v-2h2v2zm0-3.5h-2V7h2v6z"/></svg>`
    };

    // 5. Initialize Synthesized Web Audio API Sound Generator
    function initSynthSound() {
        if (state.audioContext) return;
        try {
            state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            state.soundEnabled = true;
        } catch (e) {
            console.error("Web Audio API is not supported in this browser.", e);
        }
    }

    // Play synthesized frequencies safe and cinematic
    function playTone(freq, type, duration, gainStart, slideToFreq = null) {
        if (!state.soundEnabled || state.isMuted || !state.audioContext) return;

        // Ensure state context is resumed (user-interaction bound)
        if (state.audioContext.state === "suspended") {
            state.audioContext.resume();
        }

        try {
            const osc = state.audioContext.createOscillator();
            const gainNode = state.audioContext.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, state.audioContext.currentTime);

            if (slideToFreq) {
                osc.frequency.exponentialRampToValueAtTime(slideToFreq, state.audioContext.currentTime + duration);
            }

            gainNode.gain.setValueAtTime(gainStart, state.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, state.audioContext.currentTime + duration);

            osc.connect(gainNode);
            gainNode.connect(state.audioContext.destination);

            osc.start();
            osc.stop(state.audioContext.currentTime + duration);
        } catch (err) {
            console.warn("Could not play synthesized audio frame: ", err);
        }
    }

    // Specialized sounds matching OS simulation styles
    const sounds = {
        boot: () => {
            // cinematic warm chord
            playTone(150, "sawtooth", 1.5, 0.1, 300);
            setTimeout(() => {
                playTone(300, "triangle", 1.8, 0.15, 600);
                playTone(450, "sine", 2.0, 0.1);
            }, 100);
        },
        loadingHum: () => {
            // slow frequency oscillate or soft periodic ticks
            playTone(80, "sine", 0.5, 0.05);
        },
        notification: () => {
            // quick digital notification chime
            playTone(880, "sine", 0.12, 0.08);
            setTimeout(() => {
                playTone(1320, "sine", 0.25, 0.06);
            }, 80);
        },
        complete: () => {
            // glorious victory chord
            playTone(523.25, "sine", 0.4, 0.15); // C5
            setTimeout(() => {
                playTone(659.25, "sine", 0.4, 0.12); // E5
            }, 120);
            setTimeout(() => {
                playTone(783.99, "sine", 0.4, 0.12); // G5
            }, 240);
            setTimeout(() => {
                playTone(1046.5, "sine", 0.8, 0.15); // C6
            }, 360);
        }
    };

    // 6. Automatically Detect Operating System
    function detectOperatingSystem() {
        const userAgent = window.navigator.userAgent || window.navigator.vendor || window.opera;
        let os = "macOS"; // default fallback

        if (/windows/i.test(userAgent)) {
            os = "Windows";
        } else if (/android/i.test(userAgent)) {
            os = "Android";
        } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
            os = "iOS";
        } else if (/mac/i.test(userAgent)) {
            os = "macOS";
        } else if (/linux/i.test(userAgent)) {
            os = "Linux";
        }

        state.detectedOS = os;
        applyOSTheme(os);
    }

    // Apply specific CSS templates and layouts depending on detected OS
    function applyOSTheme(os) {
        // Clear skin classes
        elements.body.classList.remove("os-windows-skin", "os-android-skin", "os-ios-skin", "os-macos-skin", "os-linux-skin");

        // Set skin class
        const skinClass = `os-${os.toLowerCase()}-skin`;
        elements.body.classList.add(skinClass);

        // Inject appropriate Logo and adjust Title
        if (elements.osLogo) {
            elements.osLogo.innerHTML = osLogos[os.toLowerCase()] || osLogos.macos;
        }

        if (elements.osTitle) {
            elements.osTitle.innerText = `${os} System Update`;
        }

        if (elements.osSubtitle) {
            elements.osSubtitle.innerText = `Preparing safe simulation environments on ${os}...`;
        }

        // Adjust SVG Progress ring properties (stroke-dasharray matching circles)
        const circle = elements.progressCircle;
        if (circle) {
            const radius = circle.r.baseVal.value;
            const circumference = radius * 2 * Math.PI;
            circle.style.strokeDasharray = `${circumference} ${circumference}`;
            circle.style.strokeDashoffset = circumference;
        }
    }

    // 7. Circular Ring Offset Utility
    function setProgress(percent) {
        state.progress = percent;

        // 1. Text Update
        if (elements.progressPercent) {
            elements.progressPercent.innerText = `${Math.floor(percent)}%`;
        }

        // 2. Linear progress update
        if (elements.progressBarFill) {
            elements.progressBarFill.style.width = `${percent}%`;
        }

        // 3. SVG progress ring update
        const circle = elements.progressCircle;
        if (circle) {
            const radius = circle.r.baseVal.value;
            const circumference = radius * 2 * Math.PI;
            const offset = circumference - (percent / 100) * circumference;
            circle.style.strokeDashoffset = offset;
        }

        // 4. Update stages messages depending on current percent levels
        const currentStageObj = updateStages.find(stage => percent <= stage.progressLimit) || updateStages[updateStages.length - 1];
        if (elements.stageText && elements.stageText.innerText !== currentStageObj.label) {
            elements.stageText.innerText = currentStageObj.label;

            // Play notification sound on stage change if sound is ready and it's not the initial/lock screens
            if (percent > 1 && percent < 99) {
                sounds.notification();
            }
        }

        // 5. Estimated Remaining Time calculation
        if (elements.timeText) {
            if (percent >= 99) {
                elements.timeText.innerText = "Execution authorized. Pending user interaction confirmation.";
            } else {
                const remainingMin = Math.ceil(((100 - percent) * 0.4) / state.simulationSpeedMultiplier);
                if (remainingMin > 1) {
                    elements.timeText.innerText = `Estimated time remaining: ${remainingMin} minutes`;
                } else {
                    elements.timeText.innerText = `Estimated time remaining: About 45 seconds`;
                }
            }
        }
    }

    // 8. Progress Non-Linear Advancement Loop
    let lastTime = performance.now();
    let stepsAcc = 0;
    let nextJumpThreshold = 5;
    let velocity = 0.05; // Base advancement velocity

    function runSimulationStep(timestamp) {
        if (state.reached99) return;

        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;

        // Simulate realistic OS delay bumps (Wait, jump, slow down, speed up)
        stepsAcc += deltaTime;

        // Every few seconds, randomize advancement mechanics
        if (stepsAcc > 3000) {
            stepsAcc = 0;
            const rand = Math.random();
            if (rand < 0.2) {
                // Wait/Pause
                velocity = 0.005;
                nextJumpThreshold = state.progress + Math.random() * 3;
            } else if (rand < 0.5) {
                // Fast speed up
                velocity = 0.25;
            } else if (rand < 0.8) {
                // Slower
                velocity = 0.04;
            } else {
                // Medium velocity
                velocity = 0.12;
            }

            // Occasionally play hum sounds
            if (Math.random() < 0.4) {
                sounds.loadingHum();
            }
        }

        // Advance progress based on current simulated velocity
        let nextProgress = state.progress + (velocity * (deltaTime / 16.66)) * state.simulationSpeedMultiplier;

        // Jump mechanics
        if (state.progress >= nextJumpThreshold && Math.random() < 0.05) {
            nextProgress += Math.random() * 8; // sudden packet jumps
            nextJumpThreshold = nextProgress + 10 + Math.random() * 15;
        }

        if (nextProgress >= 99) {
            nextProgress = 99;
            state.reached99 = true;
            trigger99PercentLock();
        }

        setProgress(nextProgress);

        if (!state.reached99) {
            state.animationFrameId = requestAnimationFrame(runSimulationStep);
        }
    }

    // Trigger the interaction lock
    function trigger99PercentLock() {
        setProgress(99);
        sounds.notification();

        // Reveal instructions panel
        if (elements.lockNotice) {
            elements.lockNotice.style.display = "flex";
        }
    }

    // Finish the final leg of update: 99% -> 100%
    function completeSimulation() {
        // Hide lock notice
        if (elements.lockNotice) {
            elements.lockNotice.style.display = "none";
        }

        setProgress(100);
        if (elements.stageText) {
            elements.stageText.innerText = "✅ Update Complete";
        }
        if (elements.timeText) {
            elements.timeText.innerText = "Rebooting system framework...";
        }

        sounds.complete();

        // Wait 3 seconds, fade out viewport cinematic style, and return to original page
        setTimeout(() => {
            if (elements.viewport) {
                elements.viewport.classList.add("fade-out-simulation");
            }
            setTimeout(() => {
                window.location.href = state.returnUrl;
            }, 1500);
        }, 3000);
    }

    // 9. Input & Event Listeners
    // Handle double-key/double-tap validation
    function handleLockVerification() {
        if (!state.reached99) return;

        state.doubleClicksOrTaps++;

        if (state.doubleClicksOrTaps >= 2) {
            completeSimulation();
        } else {
            // Sound feedback for partial clicks/taps
            playTone(600, "sine", 0.15, 0.1);
        }
    }

    // Desktop: Press Enter twice
    document.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            if (state.reached99) {
                e.preventDefault();
                handleLockVerification();
            }
        }
    });

    // Mobile: Double tap anywhere on viewport
    let lastTap = 0;
    document.addEventListener("touchend", (e) => {
        if (!state.reached99) return;

        const currentTime = new Date().getTime();
        const tapDelay = currentTime - lastTap;

        if (tapDelay < 350 && tapDelay > 0) {
            e.preventDefault();
            handleLockVerification();
            handleLockVerification(); // triggers both taps
        }
        lastTap = currentTime;
    });

    // Handle initial sound context activation on first pointerdown
    document.addEventListener("pointerdown", () => {
        if (!state.audioContext) {
            initSynthSound();
            // Optional: Play a subtle hum on unlock/focus
            sounds.boot();
        }
    }, { once: true });

    // Header Mute Switcher
    if (elements.muteToggle) {
        elements.muteToggle.addEventListener("click", () => {
            state.isMuted = !state.isMuted;
            elements.muteToggle.innerHTML = state.isMuted ? `<span class="sound-icon">🔇</span>` : `<span class="sound-icon">🔊</span>`;

            // Re-enable/resume sound if needed
            if (!state.isMuted && !state.audioContext) {
                initSynthSound();
            }
        });
    }

    // Request Browser Fullscreen Utility
    function toggleFullscreen() {
        try {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().then(() => {
                    if (elements.fullscreenToggle) {
                        elements.fullscreenToggle.innerHTML = `<span class="fullscreen-icon">☒</span>`;
                    }
                }).catch(err => {
                    console.log("Fullscreen request rejected or denied by user: ", err);
                });
            } else {
                document.exitFullscreen().then(() => {
                    if (elements.fullscreenToggle) {
                        elements.fullscreenToggle.innerHTML = `<span class="fullscreen-icon">⛶</span>`;
                    }
                });
            }
        } catch (err) {
            console.warn("Fullscreen API is not supported on this platform: ", err);
        }
    }

    if (elements.fullscreenToggle) {
        elements.fullscreenToggle.addEventListener("click", () => {
            toggleFullscreen();
        });
    }

    // Back to safety button
    if (elements.backBtn) {
        elements.backBtn.addEventListener("click", () => {
            if (state.animationFrameId) {
                cancelAnimationFrame(state.animationFrameId);
            }
            window.location.href = state.returnUrl;
        });
    }

    // 10. Start simulation and detect matching platform
    detectOperatingSystem();

    // Delay simulation trigger slightly to load UI elements
    setTimeout(() => {
        lastTime = performance.now();
        state.animationFrameId = requestAnimationFrame(runSimulationStep);
    }, 800);

    // Try automatically prompting Fullscreen Mode if permission was preset
    try {
        if (document.fullscreenEnabled) {
            // Browsers usually require user action, so we bind it to click or handle silently if refused
            console.log("Automatic cinematic fullscreen enabled. Waiting for initial screen pointer down...");
        }
    } catch (err) {}
});
