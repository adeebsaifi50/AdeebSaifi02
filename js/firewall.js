/**
 * ==========================================================================
 * QUANTUM FIREWALL DEFENSE SIMULATION ENGINE
 * ==========================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    // Core simulation thresholds
    let simulatedInterceptedCount = 0;
    let waveId = 1;
    let totalWavesMax = 5;
    let isSimulationActive = true;
    let isMuted = false;
    let autoScrollEnabled = true;

    // Simulation Data Lists
    const attackTypes = [
        { name: "DDoS Attack Vector", log: "Volumetric UDP flood packet surge blocked at edge node", severity: "CRITICAL", color: "danger", soundType: "alarm" },
        { name: "SQL Injection Probe", log: "Heuristic pattern matched: unauthorized boolean bypass attempt neutralized", severity: "HIGH", color: "warning", soundType: "alert" },
        { name: "Port Scan Sweep", log: "Sequential SYN scan detected from untrusted gateway. Socket isolated", severity: "MODERATE", color: "warning", soundType: "tick" },
        { name: "Brute Force Attack", log: "SSH authentication failure rate exceeded limit. IP temporarily blacklisted", severity: "HIGH", color: "warning", soundType: "alert" },
        { name: "Malware Payload", log: "Trojan horse payload scanned and quarantined in sandboxed environment", severity: "HIGH", color: "warning", soundType: "alert" },
        { name: "Ransomware Script", log: "Suspicious bulk script file entropy execution detected. Stopped immediately", severity: "CRITICAL", color: "danger", soundType: "alarm" },
        { name: "Botnet C&C Beacon", log: "Outgoing handshake packet to known malicious Command server neutralized", severity: "HIGH", color: "warning", soundType: "alert" }
    ];

    const fakeCountries = [
        "United States", "China", "Russia", "Germany", "Brazil",
        "United Kingdom", "Japan", "Netherlands", "Singapore", "North Korea",
        "Ukraine", "Iran", "India", "Canada", "Australia", "France"
    ];

    // Node & DOM cache references
    const bootOverlay = document.getElementById("boot-overlay");
    const bootProgressBar = document.getElementById("boot-progress-bar");
    const bootConsole = document.getElementById("boot-console");
    const bootStatusText = document.getElementById("boot-status-text");

    const mainContainer = document.querySelector(".firewall-main-container");
    const synthMuteBtn = document.getElementById("synth-mute-btn");
    const synthSoundIcon = document.getElementById("synth-sound-icon");
    const waveProgressFill = document.getElementById("wave-progress-bar");
    const waveIdText = document.getElementById("current-wave-id");
    const waveSeverityText = document.getElementById("wave-severity-status");

    // Telemetries
    const teleFwStatus = document.getElementById("tele-fw-status");
    const teleThreatLevel = document.getElementById("tele-threat-level");
    const teleProtectionIndex = document.getElementById("tele-protection-index");
    const teleBlockedCounter = document.getElementById("tele-blocked-counter");
    const teleActiveConn = document.getElementById("tele-active-conn");
    const teleBandwidth = document.getElementById("tele-bandwidth");
    const teleSecurityScore = document.getElementById("tele-security-score");

    // Meters
    const cpuVal = document.getElementById("meter-cpu-val");
    const cpuFill = document.getElementById("meter-cpu-fill");
    const ramVal = document.getElementById("meter-ram-val");
    const ramFill = document.getElementById("meter-ram-fill");
    const tempVal = document.getElementById("meter-temp-val");
    const tempFill = document.getElementById("meter-temp-fill");
    const latencyVal = document.getElementById("meter-latency-val");
    const latencyFill = document.getElementById("meter-latency-fill");

    // Terminal
    const terminalFeed = document.getElementById("terminal-feed-container");
    const clearBtn = document.getElementById("terminal-clear-btn");
    const autoScrollBtn = document.getElementById("terminal-auto-btn");

    // Overlays
    const finalInterceptedText = document.getElementById("final-intercepted-count");
    const secureEndingOverlay = document.getElementById("ending-secure-overlay");
    const btnRestart = document.getElementById("btn-restart-simulation");
    const centralShieldDome = document.getElementById("central-shield-dome");
    const shieldPercentText = document.getElementById("shield-percent-text");

    // Canvas configuration
    const canvas = document.getElementById("radar-canvas");
    const ctx = canvas.getContext("2d");
    let radarRadius = 0;
    let radarCenter = { x: 0, y: 0 };
    let sweepAngle = 0;

    let particles = [];
    let blips = [];
    let radarGridOpacity = 0.08;

    // Web Audio Synthesis Context Setup
    let audioCtx = null;

    function initAudioContext() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === "suspended") {
            audioCtx.resume();
        }
    }

    /**
     * Synthesis Sound Generators using Web Audio API
     */
    function playSynthSound(type) {
        if (isMuted) return;
        try {
            initAudioContext();
            if (!audioCtx) return;

            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);

            const now = audioCtx.currentTime;

            if (type === "bootLine") {
                osc.type = "sine";
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(1500, now + 0.12);
                gain.gain.setValueAtTime(0.04, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
                osc.start(now);
                osc.stop(now + 0.12);
            }
            else if (type === "tick") {
                osc.type = "triangle";
                osc.frequency.setValueAtTime(1200, now);
                gain.gain.setValueAtTime(0.03, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                osc.start(now);
                osc.stop(now + 0.05);
            }
            else if (type === "alert") {
                osc.type = "sawtooth";
                osc.frequency.setValueAtTime(450, now);
                osc.frequency.linearRampToValueAtTime(900, now + 0.18);
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
            }
            else if (type === "alarm") {
                // Two pulse frequency shift
                osc.type = "sawtooth";
                osc.frequency.setValueAtTime(330, now);
                osc.frequency.setValueAtTime(220, now + 0.15);
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
                osc.start(now);
                osc.stop(now + 0.35);
            }
            else if (type === "sweepHum") {
                osc.type = "sine";
                osc.frequency.setValueAtTime(60, now);
                gain.gain.setValueAtTime(0.02, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
            }
            else if (type === "secureCompleted") {
                // High-pitched multi chime
                const osc2 = audioCtx.createOscillator();
                const gain2 = audioCtx.createGain();
                osc2.connect(gain2);
                gain2.connect(audioCtx.destination);

                osc.type = "sine";
                osc.frequency.setValueAtTime(523.25, now); // C5
                osc.frequency.setValueAtTime(659.25, now + 0.12); // E5
                osc.frequency.setValueAtTime(783.99, now + 0.24); // G5
                osc.frequency.setValueAtTime(1046.50, now + 0.36); // C6

                gain.gain.setValueAtTime(0.08, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

                osc.start(now);
                osc.stop(now + 0.8);
            }
        } catch (e) {
            console.warn("Web Audio Synthesis Error: ", e);
        }
    }

    /**
     * 1. BOOT SEQUENCE SIMULATOR
     */
    const bootLines = [
        { text: "[INIT] Loading Firewall Security Core... SUCCESS", type: "success" },
        { text: "[INIT] Starting CPU Cognitive thread monitors... ACTIVE (16 Cores mapped)", type: "info" },
        { text: "[DB] Loading Global Signature Databanks... OK", type: "info" },
        { text: "[DB] Syncing threat signature files with secure backup catalog...", type: "info" },
        { text: "[DB] Loaded 4,142,501 zero-day attack templates.", type: "success" },
        { text: "[NET] Mapping defense interceptor gateways...", type: "info" },
        { text: "[NET] Shield interface node 127.0.0.1 bound at socket 443", type: "info" },
        { text: "[SYS] Initializing Real-time Protection Engine...", type: "info" },
        { text: "[SYS] Web Audio physical synthesis device connected.", type: "info" },
        { text: "[WARNING] Intrusive scans will be spoofed. No physical networks will be affected.", type: "alert" },
        { text: "[SUCCESS] COGNITIVE QUANTUM DEFENSE FIREWALL SECURED & ONLINE", type: "success" }
    ];

    let currentBootIndex = 0;

    function startBootSequence() {
        bootOverlay.classList.remove("hidden");
        mainContainer.classList.add("hidden-by-default");
        currentBootIndex = 0;
        bootProgressBar.style.width = "0%";
        bootConsole.innerHTML = "";
        bootStatusText.innerText = "INITIALIZING CORE DEFENSES...";

        triggerNextBootLine();
    }

    function triggerNextBootLine() {
        if (currentBootIndex < bootLines.length) {
            const line = bootLines[currentBootIndex];
            const div = document.createElement("div");
            div.className = `boot-console-line ${line.type}-line`;
            div.innerText = line.text;
            bootConsole.appendChild(div);
            bootConsole.scrollTop = bootConsole.scrollHeight;

            playSynthSound("bootLine");

            // Advance loader bar non-linearly
            const completionPercent = ((currentBootIndex + 1) / bootLines.length) * 100;
            bootProgressBar.style.width = `${completionPercent}%`;
            bootStatusText.innerText = `LOADING SECURITY SYSTEMS... ${Math.round(completionPercent)}%`;

            currentBootIndex++;
            // Randomized timing for high realism
            const randomDelay = 200 + Math.random() * 500;
            setTimeout(triggerNextBootLine, randomDelay);
        } else {
            setTimeout(() => {
                bootOverlay.classList.add("hidden");
                mainContainer.classList.remove("hidden-by-default");
                isSimulationActive = true;
                waveId = 1;
                simulatedInterceptedCount = 0;
                updateStatsPanel();
                startThreatGeneration();
                playSynthSound("secureCompleted");
            }, 800);
        }
    }

    /**
     * 2. GENERATE RANDOM THREATS & LOG TO TERMINAL
     */
    let threatTimer = null;

    function startThreatGeneration() {
        if (threatTimer) clearInterval(threatTimer);

        // Generate attacks every 2-4 seconds dynamically
        function scheduler() {
            if (!isSimulationActive) return;
            triggerFakeAttack();
            const delay = 1800 + Math.random() * 2200;
            threatTimer = setTimeout(scheduler, delay);
        }
        scheduler();
    }

    function triggerFakeAttack(specificType = null) {
        if (!isSimulationActive) return;

        // Pick threat
        let attack = specificType
            ? attackTypes.find(t => t.name.toLowerCase().includes(specificType.toLowerCase()) || t.name === specificType)
            : attackTypes[Math.floor(Math.random() * attackTypes.length)];

        if (!attack) {
            // Safe fallback
            attack = attackTypes[0];
        }

        // Generate details
        const ip = `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 254) + 1}`;
        const country = fakeCountries[Math.floor(Math.random() * fakeCountries.length)];
        const timestamp = new Date().toLocaleTimeString();

        // Increment block counter
        simulatedInterceptedCount++;

        // Add blip & threat vector particles directed to center (Shield)
        createThreatVector(ip, country, attack);

        // Print to log
        appendTerminalLog(timestamp, ip, country, attack);

        // Play alert audio
        playSynthSound(attack.soundType);

        // Shake visual shield slightly
        triggerShieldGlitchVisual();

        // Update active counts
        updateStatsPanel();

        // Advance wave progress
        advanceWaveProgress();
    }

    function appendTerminalLog(time, ip, country, attack) {
        const line = document.createElement("div");
        line.className = `feed-line ${attack.color === 'danger' ? 'danger' : 'warning'}`;

        line.innerHTML = `
            <span style="color: #6b7280;">[${time}]</span>
            <span style="font-weight: 700; color: #f3f4f6;">${attack.name}</span> from
            <span style="color: #60a5fa; font-weight: 500;">${ip} (${country})</span> -
            <span style="font-style: italic;">${attack.log}</span>
            <span style="font-weight: bold; color: ${attack.color === 'danger' ? '#ef4444' : '#fbbf24'};">[BLOCKED]</span>
        `;

        terminalFeed.appendChild(line);

        if (autoScrollEnabled) {
            terminalFeed.scrollTop = terminalFeed.scrollHeight;
        }

        // Keep last 40 lines max for performance
        if (terminalFeed.children.length > 40) {
            terminalFeed.removeChild(terminalFeed.firstElementChild);
        }
    }

    function triggerShieldGlitchVisual() {
        centralShieldDome.classList.add("threat-breaching");
        shieldPercentText.innerText = `${92 + Math.floor(Math.random() * 8)}%`;
        setTimeout(() => {
            centralShieldDome.classList.remove("threat-breaching");
            shieldPercentText.innerText = "100%";
        }, 350);
    }

    /**
     * 3. WAVES AND PROGRESSION TRACKER
     */
    let waveProgress = 0;

    function advanceWaveProgress() {
        waveProgress += 8 + Math.random() * 7;
        if (waveProgress >= 100) {
            waveProgress = 0;
            waveId++;
            if (waveId > totalWavesMax) {
                // Display SYSTEM SECURE screen
                triggerEndingSecureState();
            } else {
                // Wave advance sound chimes
                playSynthSound("secureCompleted");
                waveIdText.innerText = `WAVE_0${waveId}`;
                appendTerminalSystemLog(`[SYSTEM] Defense Grid completed Attack Wave 0${waveId - 1}. Initiating Wave 0${waveId}...`);
            }
        }
        waveProgressFill.style.width = `${waveProgress}%`;

        // Update threat status
        if (waveId >= 4) {
            waveSeverityText.innerText = "CRITICAL LIMIT";
            waveSeverityText.className = "wave-value color-danger";
            teleThreatLevel.innerText = "CRITICAL";
            teleThreatLevel.className = "tele_val color-danger";
        } else if (waveId >= 2) {
            waveSeverityText.innerText = "HIGH VOLTAGE";
            waveSeverityText.className = "wave-value color-danger";
            teleThreatLevel.innerText = "HIGH";
            teleThreatLevel.className = "tele_val color-danger";
        } else {
            waveSeverityText.innerText = "MODERATE";
            waveSeverityText.className = "wave-value color-success";
            teleThreatLevel.innerText = "MODERATE";
            teleThreatLevel.className = "tele_val color-success";
        }
    }

    function appendTerminalSystemLog(message) {
        const line = document.createElement("div");
        line.className = "feed-line system";
        line.innerHTML = `<span style="color: #6b7280;">[${new Date().toLocaleTimeString()}]</span> <span style="font-weight: 700;">${message}</span>`;
        terminalFeed.appendChild(line);
        if (autoScrollEnabled) terminalFeed.scrollTop = terminalFeed.scrollHeight;
    }

    function triggerEndingSecureState() {
        isSimulationActive = false;
        clearTimeout(threatTimer);

        // Force perfect status metrics
        teleFwStatus.innerText = "SECURED";
        teleFwStatus.className = "tele_val color-success";
        teleThreatLevel.innerText = "LOW";
        teleThreatLevel.className = "tele_val color-success";
        teleProtectionIndex.innerText = "100%";

        centralShieldDome.classList.add("secured-state");
        shieldPercentText.innerText = "100%";

        appendTerminalSystemLog("[SYSTEM_CORE] Threat wave buffers neutralized. All nodes secure. Threat Level: LOW.");

        playSynthSound("secureCompleted");

        setTimeout(() => {
            finalInterceptedText.innerText = simulatedInterceptedCount;
            secureEndingOverlay.classList.remove("hidden-by-default");
        }, 1200);
    }

    /**
     * 4. HARDWARE OSCILLATING RESOURCE METRICS
     */
    function updateStatsPanel() {
        teleBlockedCounter.innerText = (142500 + simulatedInterceptedCount).toLocaleString();

        // Random slight oscillations
        const activeConnectionsCount = Math.floor(25 + Math.random() * 20);
        teleActiveConn.innerText = activeConnectionsCount;

        const bw = Math.floor(120 + Math.random() * 40);
        teleBandwidth.innerText = `${bw} Mbps`;

        // Oscillate security score
        const score = 99 + (Math.random() > 0.85 ? 1 : 0) - (Math.random() > 0.95 ? 1 : 0);
        teleSecurityScore.innerText = `${Math.min(score, 100)}/100`;
    }

    function startResourceOscillation() {
        setInterval(() => {
            if (!isSimulationActive) return;

            // Oscillate Hardware meters
            const cpu = Math.floor(18 + Math.random() * 15);
            cpuVal.innerText = `${cpu}%`;
            cpuFill.style.width = `${cpu}%`;

            const ram = (3.8 + Math.random() * 0.6).toFixed(1);
            ramVal.innerText = `${ram} GB`;
            ramFill.style.width = `${(parseFloat(ram) / 16) * 100}%`;

            const temp = Math.floor(45 + Math.random() * 8);
            tempVal.innerText = `${temp}°C`;
            tempFill.style.width = `${temp}%`;
            if (temp > 51) {
                tempFill.style.background = "#f59e0b";
            } else {
                tempFill.style.background = "#3b82f6";
            }

            const latency = Math.floor(10 + Math.random() * 12);
            latencyVal.innerText = `${latency}ms`;
            latencyFill.style.width = `${(latency / 100) * 100}%`;

            updateStatsPanel();
        }, 3000);
    }

    /**
     * 5. RESPONSIVE CANVAS RADAR SCANNER ENGINE & DYNAMIC INTERCEPTOR PARTICLES
     */
    function resizeCanvas() {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;

        radarCenter.x = canvas.width / 2;
        radarCenter.y = canvas.height / 2;
        radarRadius = Math.min(canvas.width, canvas.height) * 0.45;
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Spawn point models helper
    function createThreatVector(ip, country, attack) {
        // Choose a random spawn angle on perimeter
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.2 + Math.random() * 1.8;

        const particle = {
            x: radarCenter.x + Math.cos(angle) * radarRadius,
            y: radarCenter.y + Math.sin(angle) * radarRadius,
            targetX: radarCenter.x,
            targetY: radarCenter.y,
            angle: angle,
            speed: speed,
            color: attack.color === "danger" ? "#ef4444" : "#f59e0b",
            size: 3 + Math.random() * 3,
            ip: ip,
            type: attack.name,
            pulseWave: 0
        };

        particles.push(particle);

        // Also add static blip on visual perimeter
        blips.push({
            x: particle.x,
            y: particle.y,
            opacity: 1.0,
            color: particle.color,
            label: `${attack.name.split(" ")[0]} (${country})`
        });
    }

    function drawRadarFrame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Sweep Sweep Hum trigger
        sweepAngle += 0.015;
        if (sweepAngle >= Math.PI * 2) {
            sweepAngle = 0;
            playSynthSound("sweepHum");
        }

        // Draw glowing tech radar rings
        ctx.strokeStyle = "rgba(59, 130, 246, 0.08)";
        ctx.lineWidth = 1;
        for (let r = 0.2; r <= 1.0; r += 0.2) {
            ctx.beginPath();
            ctx.arc(radarCenter.x, radarCenter.y, radarRadius * r, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Draw cross lines
        ctx.beginPath();
        ctx.moveTo(radarCenter.x - radarRadius, radarCenter.y);
        ctx.lineTo(radarCenter.x + radarRadius, radarCenter.y);
        ctx.moveTo(radarCenter.x, radarCenter.y - radarRadius);
        ctx.lineTo(radarCenter.x, radarCenter.y + radarRadius);
        ctx.stroke();

        // Render rotating green/blue scanning sweep line
        const sweepX = radarCenter.x + Math.cos(sweepAngle) * radarRadius;
        const sweepY = radarCenter.y + Math.sin(sweepAngle) * radarRadius;

        // Draw sweep gradient cone (fictional arc rendering)
        ctx.beginPath();
        ctx.moveTo(radarCenter.x, radarCenter.y);
        ctx.arc(radarCenter.x, radarCenter.y, radarRadius, sweepAngle - 0.25, sweepAngle);
        ctx.lineTo(radarCenter.x, radarCenter.y);

        let grad = ctx.createRadialGradient(radarCenter.x, radarCenter.y, 0, radarCenter.x, radarCenter.y, radarRadius);
        grad.addColorStop(0, "rgba(59, 130, 246, 0.15)");
        grad.addColorStop(1, "rgba(59, 130, 246, 0.0)");
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.strokeStyle = "rgba(59, 130, 246, 0.25)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(radarCenter.x, radarCenter.y);
        ctx.lineTo(sweepX, sweepY);
        ctx.stroke();

        // Process threat vectors (moving towards defensive core)
        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];

            // Move vector
            const dx = p.targetX - p.x;
            const dy = p.targetY - p.y;
            const dist = Math.sqrt(dx*dx + dy*dy);

            // Intercepted at central shield threshold (90px diameter / 2 = 45px radius)
            const interceptRadius = 55;
            if (dist <= interceptRadius) {
                // Particle intercepted! Spawn small flash pulse
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = 0.4;
                ctx.fill();
                ctx.globalAlpha = 1.0;

                particles.splice(i, 1);
                continue;
            }

            p.x += Math.cos(p.angle) * p.speed * -1;
            p.y += Math.sin(p.angle) * p.speed * -1;

            // Draw packet line
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.35;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + Math.cos(p.angle) * 20, p.y + Math.sin(p.angle) * 20);
            ctx.stroke();

            // Draw glowing core node
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = 1.0;
            ctx.fill();
        }

        // Draw blips
        for (let i = blips.length - 1; i >= 0; i--) {
            let b = blips[i];
            b.opacity -= 0.005;

            if (b.opacity <= 0) {
                blips.splice(i, 1);
                continue;
            }

            ctx.beginPath();
            ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = b.color;
            ctx.globalAlpha = b.opacity;
            ctx.fill();

            // Draw target box
            ctx.strokeStyle = b.color;
            ctx.lineWidth = 1;
            ctx.strokeRect(b.x - 8, b.y - 8, 16, 16);

            // Text tag
            ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
            ctx.font = "8px 'JetBrains Mono'";
            ctx.fillText(b.label, b.x + 12, b.y + 3);
            ctx.globalAlpha = 1.0;
        }

        requestAnimationFrame(drawRadarFrame);
    }

    drawRadarFrame();

    /**
     * 6. MANUAL TRIGGERS & OTHER CONTROLS
     */
    // Clear terminal log feed
    clearBtn.addEventListener("click", () => {
        terminalFeed.innerHTML = "";
    });

    // Toggle Auto Scroll mode
    autoScrollBtn.addEventListener("click", () => {
        autoScrollEnabled = !autoScrollEnabled;
        autoScrollBtn.innerText = `AUTO_SCROLL: ${autoScrollEnabled ? 'ON' : 'OFF'}`;
    });

    // Manual manual vector triggers
    const triggerButtons = document.querySelectorAll(".manual-btn-trigger");
    triggerButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const attackType = btn.getAttribute("data-type");
            triggerFakeAttack(attackType);
        });
    });

    // Audio Synth mute
    synthMuteBtn.addEventListener("click", () => {
        isMuted = !isMuted;
        if (isMuted) {
            synthMuteBtn.className = "synth-btn btn btn-secondary";
            synthSoundIcon.innerText = "🔇";
            appendTerminalSystemLog("[SYSTEM_CORE] Audio synthesizer output muted.");
        } else {
            synthMuteBtn.className = "synth-btn btn btn-primary";
            synthSoundIcon.innerText = "🔊";
            appendTerminalSystemLog("[SYSTEM_CORE] Audio synthesizer output activated.");
            initAudioContext();
        }
    });

    // Modal restart triggers
    btnRestart.addEventListener("click", () => {
        secureEndingOverlay.classList.add("hidden-by-default");
        centralShieldDome.classList.remove("secured-state");
        startBootSequence();
    });

    // Start everything by triggering boot
    startBootSequence();
    startResourceOscillation();
});
