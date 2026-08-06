/**
 * SYSTEMUPDATE.JS — REFITTED ULTRA-REALISTIC TERMINOLOGY & ANIMATIONS
 * Dynamic platform detection, Web Audio synthesis, interactive 99% loops.
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
        returnUrl: "index.html",
        hoverTimer: null
    };

    if (document.referrer && document.referrer.includes(window.location.hostname)) {
        state.returnUrl = document.referrer;
    }

    // 2. Select Elements
    const elements = {
        viewport: document.getElementById("update-viewport"),
        body: document.body,
        hoverHeader: document.getElementById("hover-header"),
        muteToggle: document.getElementById("mute-toggle"),
        fullscreenToggle: document.getElementById("fullscreen-toggle"),
        backBtn: document.getElementById("back-to-safety"),

        // Layout wrappers
        windowsLayout: document.getElementById("layout-windows"),
        macosLayout: document.getElementById("layout-macos"),
        iosLayout: document.getElementById("layout-ios"),
        androidLayout: document.getElementById("layout-android"),
        linuxLayout: document.getElementById("layout-linux"),

        // Windows specific fields
        winPercent: document.getElementById("win-percentage"),
        winDetails: document.getElementById("win-details"),

        // MacOS specific fields
        macosFill: document.getElementById("macos-fill"),
        macosPercent: document.getElementById("macos-percentage"),
        macosStatus: document.getElementById("macos-status"),
        macosTime: document.getElementById("macos-time"),

        // iOS specific fields
        iosFill: document.getElementById("ios-fill"),
        iosStatus: document.getElementById("ios-status"),

        // Android specific fields
        androidRingBar: document.getElementById("android-ring-bar"),
        androidPercent: document.getElementById("android-percentage"),
        androidDetails: document.getElementById("android-details"),

        // Linux specific fields
        linuxPercent: document.getElementById("linux-percentage"),
        linuxFill: document.getElementById("linux-fill"),
        linuxTerminal: document.getElementById("linux-terminal-body"),

        lockNotice: document.getElementById("interaction-lock-notice")
    };

    // Terminology lists for realistic updates
    const stageDetails = {
        Windows: [
            { limit: 15, label: "Getting things ready. Please keep your computer on." },
            { limit: 35, label: "Working on features. This will take several restarts." },
            { limit: 60, label: "Installing security patches. Don't turn off your PC." },
            { limit: 80, label: "Updating core framework components..." },
            { limit: 95, label: "Almost there. Setting up final optimizations." },
            { limit: 99, label: "Awaiting final authorization parameter..." }
        ],
        macOS: [
            { limit: 20, label: "Configuring installation packages..." },
            { limit: 50, label: "Writing update components. Remaining: 15 minutes." },
            { limit: 75, label: "Installing macOS kernel security tools. Remaining: 8 minutes." },
            { limit: 90, label: "Rebuilding caches and system services. Remaining: 2 minutes." },
            { limit: 99, label: "Preparing reboot cycle. Awaiting user interaction." }
        ],
        iOS: [
            { limit: 30, label: "Verifying secure upgrade bundles..." },
            { limit: 60, label: "Installing iOS system package..." },
            { limit: 90, label: "Updating modular security modules..." },
            { limit: 99, label: "Reboot pending. Authorization required." }
        ],
        Android: [
            { limit: 25, label: "Verifying update package hash..." },
            { limit: 55, label: "Writing system partition block sector..." },
            { limit: 85, label: "Optimizing apps. This may take a few minutes." },
            { limit: 99, label: "Installation complete. Tap twice to restart." }
        ]
    };

    // Authentic Linux output messages to scroll on the screen
    const linuxLogs = [
        "Starting Ubuntu System-Upgrade daemon...",
        "Checking local architecture compatibility... x86_64 system verified.",
        "Connecting to archive.ubuntu.com mirroring indexes...",
        "Refreshing packages database cache... Done.",
        "Upgrading package: libc6 (2.35-0ubuntu3) ...",
        "Upgrading package: linux-image-generic (5.15.0-76.83) ...",
        "Running kernel post-installation triggers...",
        "Upgrading package: systemd (249.11-0ubuntu3) ...",
        "Restarting systemd upgrade sockets...",
        "Upgrading package: openssl (3.0.2-0ubuntu1) ...",
        "Upgrading package: python3-minimal (3.10.6-1) ...",
        "Compiling Python bytecodes triggers...",
        "Configuring upgraded firmware packages...",
        "Verifying file digests matching secure hashes...",
        "Cleaning up orphaned libraries packages dependencies...",
        "Running grub-install bootloader config on /dev/sda...",
        "Generating grub configuration file... Found linux image: /boot/vmlinuz-5.15.0-76-generic",
        "Re-indexing kernel symbols tables... Done.",
        "Updating dynamic linker bindings runtime cache...",
        "Upgrade completed. Authorization required to cycle local system."
    ];

    // 3. Header Visibility Controller (Overlay controls fade out automatically)
    function showControls() {
        if (elements.hoverHeader) {
            elements.hoverHeader.classList.add("visible");
        }
        clearTimeout(state.hoverTimer);
        state.hoverTimer = setTimeout(() => {
            if (elements.hoverHeader) {
                elements.hoverHeader.classList.remove("visible");
            }
        }, 2500); // hides after 2.5 seconds
    }

    document.addEventListener("mousemove", showControls);
    document.addEventListener("pointerdown", showControls);
    document.addEventListener("touchstart", showControls, { passive: true });

    // Show initially so user knows controls exist
    showControls();

    // 4. Sound Synthesis
    function initSynthSound() {
        if (state.audioContext) return;
        try {
            state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            state.soundEnabled = true;
        } catch (e) {
            console.error("Web Audio API not supported", e);
        }
    }

    function playTone(freq, type, duration, gainStart, slideToFreq = null) {
        if (!state.soundEnabled || state.isMuted || !state.audioContext) return;
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
        } catch (err) {}
    }

    const sounds = {
        boot: () => {
            playTone(180, "triangle", 1.2, 0.1, 360);
            setTimeout(() => {
                playTone(270, "sine", 1.5, 0.12);
            }, 80);
        },
        hum: () => {
            playTone(90, "sine", 0.4, 0.04);
        },
        click: () => {
            playTone(800, "sine", 0.08, 0.05);
        },
        complete: () => {
            playTone(440, "sine", 0.3, 0.12);
            setTimeout(() => playTone(554.37, "sine", 0.3, 0.12), 100);
            setTimeout(() => playTone(659.25, "sine", 0.3, 0.12), 200);
            setTimeout(() => playTone(880, "sine", 0.6, 0.15), 300);
        }
    };

    // 5. Operating System Detect & Load Skin
    function detectAndInitializeOS() {
        const userAgent = window.navigator.userAgent || window.navigator.vendor || window.opera;
        let os = "macOS";

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

        // Apply skin class
        elements.body.className = "update-simulation-body";
        elements.body.classList.add(`os-${os.toLowerCase()}-skin`);

        // Hide all templates initially
        elements.windowsLayout.style.display = "none";
        elements.macosLayout.style.display = "none";
        elements.iosLayout.style.display = "none";
        elements.androidLayout.style.display = "none";
        elements.linuxLayout.style.display = "none";

        // Show matching template
        const targetLayout = elements[`${os.toLowerCase()}Layout`];
        if (targetLayout) {
            targetLayout.style.display = "flex";
        }

        // Setup custom configurations
        if (os === "Android") {
            const circle = elements.androidRingBar;
            if (circle) {
                const radius = circle.r.baseVal.value;
                const circumference = radius * 2 * Math.PI;
                circle.style.strokeDasharray = `${circumference} ${circumference}`;
                circle.style.strokeDashoffset = circumference;
            }
        }
    }

    // 6. UI Updates
    function updateProgressUI(percent) {
        state.progress = percent;
        const os = state.detectedOS;
        const percentInt = Math.floor(percent);

        // A. Windows UI
        if (os === "Windows") {
            if (elements.winPercent) elements.winPercent.innerText = `${percentInt}%`;
            const currentStage = stageDetails.Windows.find(s => percent <= s.limit) || stageDetails.Windows[stageDetails.Windows.length - 1];
            if (elements.winDetails) elements.winDetails.innerText = currentStage.label;
        }

        // B. macOS UI
        if (os === "macOS") {
            if (elements.macosPercent) elements.macosPercent.innerText = `${percentInt}%`;
            if (elements.macosFill) elements.macosFill.style.width = `${percent}%`;
            const currentStage = stageDetails.macOS.find(s => percent <= s.limit) || stageDetails.macOS[stageDetails.macOS.length - 1];
            if (elements.macosStatus) elements.macosStatus.innerText = `Installing macOS update — ${percentInt}%`;
            if (elements.macosTime) elements.macosTime.innerText = currentStage.label;
        }

        // C. iOS UI
        if (os === "iOS") {
            if (elements.iosFill) elements.iosFill.style.width = `${percent}%`;
            const currentStage = stageDetails.iOS.find(s => percent <= s.limit) || stageDetails.iOS[stageDetails.iOS.length - 1];
            if (elements.iosStatus) elements.iosStatus.innerText = currentStage.label;
        }

        // D. Android UI
        if (os === "Android") {
            if (elements.androidPercent) elements.androidPercent.innerText = `${percentInt}%`;
            const circle = elements.androidRingBar;
            if (circle) {
                const radius = circle.r.baseVal.value;
                const circumference = radius * 2 * Math.PI;
                const offset = circumference - (percent / 100) * circumference;
                circle.style.strokeDashoffset = offset;
            }
            const currentStage = stageDetails.Android.find(s => percent <= s.limit) || stageDetails.Android[stageDetails.Android.length - 1];
            if (elements.androidDetails) elements.androidDetails.innerText = currentStage.label;
        }

        // E. Linux UI (Scroller terminal printouts based on progress)
        if (os === "Linux") {
            if (elements.linuxPercent) elements.linuxPercent.innerText = `${percentInt}%`;
            if (elements.linuxFill) elements.linuxFill.style.width = `${percent}%`;

            // Trigger log scrolling dynamically
            const targetLinesCount = Math.floor((percent / 100) * linuxLogs.length);
            const currentLinesCount = elements.linuxTerminal.querySelectorAll(".terminal-line").length;

            if (targetLinesCount > currentLinesCount) {
                for (let i = currentLinesCount; i < targetLinesCount; i++) {
                    const line = document.createElement("div");
                    line.className = "terminal-line";
                    line.innerText = `[${percentInt}%] ${linuxLogs[i]}`;
                    elements.linuxTerminal.appendChild(line);
                    elements.linuxTerminal.scrollTop = elements.linuxTerminal.scrollHeight;
                }
            }
        }
    }

    // 7. Non-Linear Step Loop
    let lastTime = performance.now();
    let stepsAcc = 0;
    let nextJumpThreshold = 8;
    let velocity = 0.06;

    function runSimulationStep(timestamp) {
        if (state.reached99) return;

        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;

        stepsAcc += deltaTime;

        // Periodically randomize speed modifiers
        if (stepsAcc > 3200) {
            stepsAcc = 0;
            const rand = Math.random();
            if (rand < 0.25) {
                velocity = 0.01; // wait/stutter
                nextJumpThreshold = state.progress + Math.random() * 4;
            } else if (rand < 0.55) {
                velocity = 0.2; // fast jump
            } else if (rand < 0.8) {
                velocity = 0.04; // slow crawl
            } else {
                velocity = 0.08;
            }

            if (Math.random() < 0.3) {
                sounds.hum();
            }
        }

        let nextProgress = state.progress + (velocity * (deltaTime / 16.66)) * state.simulationSpeedMultiplier;

        // Occasional sudden package jumps
        if (state.progress >= nextJumpThreshold && Math.random() < 0.06) {
            nextProgress += Math.random() * 6;
            nextJumpThreshold = nextProgress + 12 + Math.random() * 15;
        }

        if (nextProgress >= 99) {
            nextProgress = 99;
            state.reached99 = true;
            triggerLock();
        }

        updateProgressUI(nextProgress);

        if (!state.reached99) {
            state.animationFrameId = requestAnimationFrame(runSimulationStep);
        }
    }

    function triggerLock() {
        updateProgressUI(99);
        sounds.click();
        if (elements.lockNotice) {
            elements.lockNotice.style.display = "flex";
        }
    }

    function completeSimulation() {
        if (elements.lockNotice) {
            elements.lockNotice.style.display = "none";
        }

        updateProgressUI(100);
        sounds.complete();

        // Specific OS finish states
        if (state.detectedOS === "Windows") {
            if (elements.winDetails) elements.winDetails.innerText = "System upgraded successfully. Restarting...";
        } else if (state.detectedOS === "macOS") {
            if (elements.macosStatus) elements.macosStatus.innerText = "macOS successfully optimized.";
        } else if (state.detectedOS === "Linux") {
            const finalLine = document.createElement("div");
            finalLine.className = "terminal-line";
            finalLine.style.color = "#ffffff";
            finalLine.innerText = "[ OK ] Rebooting system components...";
            elements.linuxTerminal.appendChild(finalLine);
            elements.linuxTerminal.scrollTop = elements.linuxTerminal.scrollHeight;
        }

        setTimeout(() => {
            if (elements.viewport) {
                elements.viewport.classList.add("fade-out-simulation");
            }
            setTimeout(() => {
                window.location.href = state.returnUrl;
            }, 1500);
        }, 3000);
    }

    // 8. Event Handlers
    function handleVerification() {
        if (!state.reached99) return;
        state.doubleClicksOrTaps++;
        if (state.doubleClicksOrTaps >= 2) {
            completeSimulation();
        } else {
            sounds.click();
        }
    }

    // Keybindings: double Enter, Escape to exit back to previous page
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            e.preventDefault();
            if (state.animationFrameId) {
                cancelAnimationFrame(state.animationFrameId);
            }
            window.location.href = state.returnUrl;
        } else if (e.key === "Enter") {
            if (state.reached99) {
                e.preventDefault();
                handleVerification();
            }
        }
    });

    // Touch: double tap
    let lastTap = 0;
    document.addEventListener("touchend", (e) => {
        if (!state.reached99) return;
        const now = new Date().getTime();
        const delay = now - lastTap;
        if (delay < 350 && delay > 0) {
            e.preventDefault();
            handleVerification();
            handleVerification();
        }
        lastTap = now;
    });

    // Click anywhere fallback to make testing/accessibility easier
    document.addEventListener("dblclick", (e) => {
        if (state.reached99) {
            e.preventDefault();
            completeSimulation();
        }
    });

    // Audio init
    document.addEventListener("pointerdown", () => {
        if (!state.audioContext) {
            initSynthSound();
            sounds.boot();
        }
    }, { once: true });

    // Header buttons
    if (elements.muteToggle) {
        elements.muteToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            state.isMuted = !state.isMuted;
            elements.muteToggle.innerHTML = state.isMuted ? `<span class="sound-icon">🔇</span>` : `<span class="sound-icon">🔊</span>`;
            if (!state.isMuted && !state.audioContext) {
                initSynthSound();
            }
        });
    }

    if (elements.fullscreenToggle) {
        elements.fullscreenToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            try {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().then(() => {
                        elements.fullscreenToggle.innerHTML = `<span class="fullscreen-icon">☒</span>`;
                    });
                } else {
                    document.exitFullscreen().then(() => {
                        elements.fullscreenToggle.innerHTML = `<span class="fullscreen-icon">⛶</span>`;
                    });
                }
            } catch (err) {}
        });
    }

    if (elements.backBtn) {
        elements.backBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (state.animationFrameId) {
                cancelAnimationFrame(state.animationFrameId);
            }
            window.location.href = state.returnUrl;
        });
    }

    // 9. Kickstart
    detectAndInitializeOS();

    setTimeout(() => {
        lastTime = performance.now();
        state.animationFrameId = requestAnimationFrame(runSimulationStep);
    }, 1000);
});
