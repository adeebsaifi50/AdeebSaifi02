/* ==========================================================================
   CYBER TERMINAL SIMULATION ENGINE
   Completely safe, fictional, cinematic interactive script.
   ========================================================================== */

(function () {
    'use strict';

    // Global variables
    let isMuted = false;
    let systemStartTime = Date.now();
    let isMatrixRainMode = false;
    let matrixInterval = null;
    let packetStreamInterval = null;
    let telemetryInterval = null;
    let currentThemeIndex = 0;

    // Theme options
    const themes = [
        { name: 'MATRIX_GREEN', class: 'theme-matrix' },
        { name: 'CYBER_BLUE', class: 'theme-blue' },
        { name: 'RED_ALERT', class: 'theme-alert' },
        { name: 'PURPLE_NEON', class: 'theme-purple' }
    ];

    // Sound Synthesizer (Standard Web Audio API, completely offline and independent)
    function playBeep(freq = 800, type = 'sine', duration = 0.05, gainValue = 0.04) {
        if (isMuted) return;
        try {
            const context = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();

            oscillator.type = type;
            oscillator.frequency.setValueAtTime(freq, context.currentTime);

            gainNode.gain.setValueAtTime(gainValue, context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);

            oscillator.connect(gainNode);
            gainNode.connect(context.destination);

            oscillator.start();
            oscillator.stop(context.currentTime + duration);
        } catch (e) {
            // Audio context blocked
        }
    }

    // Keyboard type noise
    function playTypeNoise() {
        const pitch = 400 + Math.random() * 300;
        playBeep(pitch, 'triangle', 0.03, 0.02);
    }

    // Error chime
    function playErrorNoise() {
        playBeep(150, 'sawtooth', 0.3, 0.05);
    }

    // Success chime
    function playSuccessNoise() {
        playBeep(600, 'sine', 0.1, 0.04);
        setTimeout(() => playBeep(900, 'sine', 0.15, 0.04), 80);
    }

    // Startup sequence tune
    function playStartupTune() {
        const notes = [261.63, 329.63, 392.00, 523.25]; // C Major Chord
        notes.forEach((freq, idx) => {
            setTimeout(() => {
                playBeep(freq, 'sine', 0.25, 0.05);
            }, idx * 150);
        });
    }

    // Clock
    function updateClock() {
        const clockEl = document.getElementById('system-clock');
        if (clockEl) {
            const d = new Date();
            const timeStr = d.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
            clockEl.textContent = timeStr;
        }
    }
    setInterval(updateClock, 1000);

    /* ==========================================
       MATRIX RAIN CODE GENERATOR (Visual Only)
       ========================================== */
    const canvas = document.getElementById('matrix-canvas');
    const ctx = canvas.getContext('2d');

    let columns = 0;
    let drops = [];
    const matrixChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZアイウエオカキクケコサシスセソ";

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        columns = Math.floor(canvas.width / 16);
        drops = Array(columns).fill(1);
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function drawMatrixRain() {
        ctx.fillStyle = 'rgba(3, 3, 4, 0.08)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Get current primary color
        const themeColor = getComputedStyle(document.body).getPropertyValue('--color-primary').trim() || '#10b981';
        ctx.fillStyle = themeColor;
        ctx.font = '15px monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = matrixChars[Math.floor(Math.random() * matrixChars.length)];
            const x = i * 16;
            const y = drops[i] * 16;

            ctx.fillText(text, x, y);

            if (y > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    function toggleMatrixRain(force = null) {
        const state = force !== null ? force : !isMatrixRainMode;
        isMatrixRainMode = state;

        if (isMatrixRainMode) {
            canvas.style.opacity = '0.35';
            if (!matrixInterval) {
                matrixInterval = setInterval(drawMatrixRain, 33);
            }
        } else {
            canvas.style.opacity = '0.12';
            // keep it subtle in default state, just ticking slowly
            if (matrixInterval) {
                clearInterval(matrixInterval);
                matrixInterval = null;
            }
            // run slow matrix tick
            matrixInterval = setInterval(drawMatrixRain, 80);
        }
    }
    // Start default subtle matrix rain
    matrixInterval = setInterval(drawMatrixRain, 80);


    /* ==========================================
       BOOT SEQUENCE INLINE SIMULATOR
       ========================================== */
    const bootLines = [
        { text: "Initializing Core Bios Interface v4.9.0-6...", type: "success" },
        { text: "Secure Enclave Core... OK", type: "success" },
        { text: "Mounting Virtual Encrypted Drives (Fictional Loop)...", type: "accent" },
        { text: "  -> /dev/vdsa1: OK [AES_256_XTS]", type: "success" },
        { text: "  -> /dev/vdsb1: OK [ECC_521_LOCAL]", type: "success" },
        { text: "Loading Microkernel Hooks...", type: "accent" },
        { text: "Starting Simulated Quantum Entropy Generator...", type: "accent" },
        { text: "Seed: 0x" + Math.random().toString(16).substring(2, 10).toUpperCase() + " [ESTABLISHED]", type: "success" },
        { text: "Establishing Demo Pipeline Shield...", type: "accent" },
        { text: "Bypassing Virtual Firewall Handshakes (Demo Only)...", type: "warn" },
        { text: "Launching Isolated GUI Sandbox...", type: "accent" },
        { text: "  -> Width: " + window.screen.width + "px, Height: " + window.screen.height + "px", type: "warn" },
        { text: "Connecting Simulation Telemetry Node...", type: "accent" },
        { text: "SYS_STABILITY: 100% [OPTIMAL]", type: "success" },
        { text: "ACCESS GRANTED. Interactive Console Initialized.", type: "success" }
    ];

    const bootOverlay = document.getElementById('boot-overlay');
    const bootLinesContent = document.getElementById('boot-lines');
    const bootProgressBar = document.getElementById('boot-progress-bar');
    const bootPct = document.getElementById('boot-pct');

    function startBootSequence() {
        bootOverlay.style.display = 'flex';
        bootOverlay.style.opacity = '1';
        bootLinesContent.innerHTML = '';
        bootProgressBar.style.width = '0%';
        bootPct.textContent = '0%';

        let currentLine = 0;
        const totalDuration = 3500; // 3.5 seconds
        const intervalTime = totalDuration / bootLines.length;

        playStartupTune();

        const bootTimer = setInterval(() => {
            if (currentLine < bootLines.length) {
                const line = bootLines[currentLine];
                const p = document.createElement('div');
                p.className = `boot-line boot-line-${line.type}`;
                p.textContent = `[ OK ] ${line.text}`;
                bootLinesContent.appendChild(p);
                bootLinesContent.scrollTop = bootLinesContent.scrollHeight;

                const pct = Math.floor(((currentLine + 1) / bootLines.length) * 100);
                bootProgressBar.style.width = `${pct}%`;
                bootPct.textContent = `${pct}%`;

                // subtle tap sound
                playBeep(300 + Math.random() * 600, 'sine', 0.02, 0.02);

                currentLine++;
            } else {
                clearInterval(bootTimer);
                setTimeout(() => {
                    // fade out overlay
                    bootOverlay.style.opacity = '0';
                    playSuccessNoise();
                    setTimeout(() => {
                        bootOverlay.style.display = 'none';
                        document.getElementById('terminal-input').focus();
                    }, 600);
                }, 400);
            }
        }, intervalTime);
    }

    // Auto trigger on load
    window.addEventListener('DOMContentLoaded', () => {
        startBootSequence();
        startTelemetrySimulation();
        startPacketStreamSimulation();
    });


    /* ==========================================
       DASHBOARD REAL-TIME TELEMETRY SIMULATION
       ========================================== */
    function startTelemetrySimulation() {
        const cpuVal = document.getElementById('cpu-value');
        const cpuBar = document.getElementById('cpu-bar');
        const ramVal = document.getElementById('ram-value');
        const ramBar = document.getElementById('ram-bar');
        const gpuVal = document.getElementById('gpu-value');
        const gpuBar = document.getElementById('gpu-bar');
        const tempVal = document.getElementById('temp-value');
        const tempBar = document.getElementById('temp-bar');
        const storageVal = document.getElementById('storage-value');
        const storageBar = document.getElementById('storage-bar');
        const latencyVal = document.getElementById('latency-value');
        const fpsVal = document.getElementById('fps-value');
        const bandwidthVal = document.getElementById('bandwidth-value');
        const bandwidthBar = document.getElementById('bandwidth-bar');
        const uptimeVal = document.getElementById('uptime-value');

        // Initial setup for static elements
        let uptimeSecs = 0;

        telemetryInterval = setInterval(() => {
            // 1. CPU oscillates
            const cpu = Math.floor(25 + Math.sin(Date.now() / 2000) * 15 + Math.random() * 10);
            const freq = (3.2 + (cpu / 100) * 1.8).toFixed(2);
            if (cpuVal) cpuVal.textContent = `${freq} GHz (${cpu}%)`;
            if (cpuBar) cpuBar.style.width = `${cpu}%`;

            // 2. RAM shifts slowly
            const baseRam = 18.4 + Math.sin(Date.now() / 15000) * 1.5;
            const ramPct = Math.floor((baseRam / 64) * 100);
            if (ramVal) ramVal.textContent = `${baseRam.toFixed(1)} GB / 64GB`;
            if (ramBar) ramBar.style.width = `${ramPct}%`;

            // 3. GPU spikes randomly
            let gpu = Math.floor(10 + Math.random() * 12);
            if (Math.random() > 0.92) gpu = Math.floor(75 + Math.random() * 20); // synthetic spikes
            if (gpuVal) gpuVal.textContent = `${gpu}%`;
            if (gpuBar) gpuBar.style.width = `${gpu}%`;

            // 4. Temp corresponds with CPU
            const temp = Math.floor(38 + (cpu * 0.45) + Math.random() * 3);
            if (tempVal) tempVal.textContent = `${temp}°C`;
            if (tempBar) tempBar.style.width = `${temp}%`;

            // 5. Storage Ops reads/writes
            const writeOps = Math.floor(400 + Math.random() * 600);
            const storePct = Math.floor((writeOps / 2500) * 100);
            if (storageVal) storageVal.textContent = `${writeOps} MB/s`;
            if (storageBar) storageBar.style.width = `${storePct}%`;

            // 6. Latency
            const lat = Math.floor(8 + Math.random() * 8);
            if (latencyVal) latencyVal.textContent = `${lat} ms`;

            // 7. FPS Real-time
            const fps = (59.2 + Math.random() * 1.6).toFixed(1);
            if (fpsVal) fpsVal.textContent = `${fps} FPS`;

            // 8. Bandwidth
            const band = (45.2 + Math.sin(Date.now() / 4000) * 10 + Math.random() * 15).toFixed(1);
            const bandPct = Math.floor((band / 150) * 100);
            if (bandwidthVal) bandwidthVal.textContent = `${band} Mb/s`;
            if (bandwidthBar) bandwidthBar.style.width = `${bandPct}%`;

            // 9. Uptime
            uptimeSecs++;
            const h = Math.floor(uptimeSecs / 3600).toString().padStart(2, '0');
            const m = Math.floor((uptimeSecs % 3600) / 60).toString().padStart(2, '0');
            const s = (uptimeSecs % 60).toString().padStart(2, '0');
            if (uptimeVal) uptimeVal.textContent = `${h}h ${m}m ${s}s`;

        }, 1000);
    }


    /* ==========================================
       RIGHT PANEL: SIMULATED ENDLESS LOG STREAM
       ========================================== */
    const fakeIps = [
        "192.168.1.104", "10.0.8.21", "172.16.254.1", "192.168.88.19",
        "45.22.189.4", "102.14.225.99", "88.99.143.12", "198.51.100.44"
    ];

    const fakeK8sPods = [
        "auth-service-67f9fd-a10", "stripe-gateway-bc49-ff", "ai-inference-vector-v2",
        "api-aggregator-884c-dd", "postgresql-ha-node-0", "redis-session-cache-3"
    ];

    const fakeSqlQueries = [
        "SELECT * FROM secure_users WHERE level >= 5 LIMIT 10;",
        "UPDATE sys_telemetry SET node_health = 100 WHERE id = 0x9F;",
        "INSERT INTO audit_logs (timestamp, action) VALUES (NOW(), 'CONSOLE_BYPASS');",
        "SELECT token_hash FROM developer_credentials WHERE active = TRUE;"
    ];

    const fakeLogs = [
        // Firewalls
        { msg: "Firewall rule BLOCK_INPUT dropped packet from IP", type: "firewall" },
        { msg: "IDS Intrusion Alert: Attempted SSH multiplex handshake on port 2222 from IP", type: "firewall" },
        { msg: "WAF intercepted potential injection on API resource node from IP", type: "firewall" },
        // Pods
        { msg: "Pod STATUS change: Running on demo core node", type: "pod" },
        { msg: "Replicas count synchronized for cluster node", type: "pod" },
        { msg: "Evacuating dead session heap cache on cluster node", type: "pod" },
        // SQL
        { msg: "SQL transaction committed", type: "sql" },
        { msg: "Query optimized: Indexed scan on schema table", type: "sql" },
        { msg: "Database deadlock avoided automatically via telemetry hooks", type: "sql" }
    ];

    function generateFakeLog() {
        const randomLog = fakeLogs[Math.floor(Math.random() * fakeLogs.length)];
        const ip = fakeIps[Math.floor(Math.random() * fakeIps.length)];
        const pod = fakeK8sPods[Math.floor(Math.random() * fakeK8sPods.length)];
        const query = fakeSqlQueries[Math.floor(Math.random() * fakeSqlQueries.length)];

        let finalMsg = randomLog.msg;
        if (randomLog.type === "firewall") finalMsg += ` ${ip}`;
        if (randomLog.type === "pod") finalMsg += `: ${pod}`;
        if (randomLog.type === "sql") finalMsg += ` // EXEC: "${query}"`;

        const d = new Date();
        const timeStr = d.toTimeString().split(' ')[0] + '.' + d.getMilliseconds().toString().padStart(3, '0');

        return {
            time: timeStr,
            tag: randomLog.type.toUpperCase(),
            msg: finalMsg,
            type: randomLog.type
        };
    }

    function startPacketStreamSimulation() {
        const streamContainer = document.getElementById('packet-logs-stream');
        if (!streamContainer) return;

        packetStreamInterval = setInterval(() => {
            const data = generateFakeLog();
            const row = document.createElement('div');
            row.className = 'packet-log-row';
            row.innerHTML = `
                <span class="log-time">[${data.time}]</span>
                <span class="log-type log-type-${data.type}">${data.tag}</span>
                <span class="log-msg">${data.msg}</span>
            `;

            streamContainer.appendChild(row);

            // Keep maximum 40 rows to prevent high RAM leak
            while (streamContainer.children.length > 40) {
                streamContainer.removeChild(streamContainer.firstChild);
            }

            streamContainer.scrollTop = streamContainer.scrollHeight;
        }, 800 + Math.random() * 1200); // realistic variance
    }


    /* ==========================================
       FAKE INTERACTIVE TERMINAL EMULATION
       ========================================== */
    const terminalInput = document.getElementById('terminal-input');
    const terminalHistory = document.getElementById('terminal-history');
    const terminalScreen = document.getElementById('terminal-body');

    // Sync input clicks anywhere in body
    document.addEventListener('click', (e) => {
        // Only focus if the user did not select text
        if (window.getSelection().toString() === "") {
            if (terminalInput) terminalInput.focus();
        }
    });

    // Custom cursor positioning mapping
    function syncCursorPosition() {
        const cursor = document.getElementById('custom-cursor');
        const wrapper = document.querySelector('.input-wrapper');
        if (!cursor || !terminalInput || !wrapper) return;

        // Visual mapping: estimate width using a temporary span
        const text = terminalInput.value;
        const tempSpan = document.createElement('span');
        tempSpan.style.font = getComputedStyle(terminalInput).font;
        tempSpan.style.visibility = 'hidden';
        tempSpan.style.position = 'absolute';
        tempSpan.style.whiteSpace = 'pre';
        tempSpan.textContent = text;
        wrapper.appendChild(tempSpan);

        const leftPos = tempSpan.getBoundingClientRect().width;
        cursor.style.left = `${leftPos}px`;

        wrapper.removeChild(tempSpan);
    }

    if (terminalInput) {
        terminalInput.addEventListener('input', () => {
            playTypeNoise();
            syncCursorPosition();
        });
        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = terminalInput.value.trim();
                executeTerminalCommand(command);
                terminalInput.value = '';
                syncCursorPosition();
            }
        });
    }

    function appendToHistory(promptText, outputText, isSuccess = false, mode = '') {
        const row = document.createElement('div');
        row.className = 'terminal-log-row';

        let inner = '';
        if (promptText) {
            inner += `<span class="terminal-prompt-prefix">guest@quantum-terminal:~$</span>`;
            inner += `<span class="terminal-entered-cmd">${escapeHTML(promptText)}</span>`;
        }

        let outputClass = 'terminal-output';
        if (mode === 'success') outputClass += ' terminal-output-success';
        if (mode === 'accent') outputClass += ' terminal-output-accent';
        if (mode === 'warn') outputClass += ' terminal-output-warn';
        if (mode === 'alert') outputClass += ' terminal-output-alert';

        if (outputText) {
            inner += `<div class="${outputClass}">${outputText}</div>`;
        }

        row.innerHTML = inner;
        terminalHistory.appendChild(row);

        if (terminalScreen) {
            terminalScreen.scrollTop = terminalScreen.scrollHeight;
        }
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g,
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    /* Command Interpreter */
    function executeTerminalCommand(cmdText) {
        const parts = cmdText.split(' ');
        const baseCmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        if (baseCmd === '') {
            appendToHistory('', '');
            return;
        }

        // 1. HELP command
        if (baseCmd === 'help') {
            const helpMenu = `
Available Simulation Routines (SAFE ONLY):
  <span class="highlight-cmd">help</span>       Display this command catalog.
  <span class="highlight-cmd">clear</span>      Purge the terminal history log buffer.
  <span class="highlight-cmd">status</span>     Analyze system metrics, virtual drive mounts, and nodes.
  <span class="highlight-cmd">scan</span>       Triggers a rapid visual diagnostic sweep of nodes.
  <span class="highlight-cmd">matrix</span>     Enter the high-intensity binary visual streaming grid.
  <span class="highlight-cmd">decrypt</span>    Simulate decryption routines on safe fictional tokens.
  <span class="highlight-cmd">about</span>      System information, author bio details, and manifestos.
  <span class="highlight-cmd">version</span>    Inspect current engine framework build.
  <span class="highlight-cmd">restart</span>    Initiate diagnostic boot sequence routines.
  <span class="highlight-cmd">theme</span>      Switch CSS styling profiles smoothly. Usage: theme [index / name]
  <span class="highlight-cmd">stats</span>      Summarize simulated cluster resource parameters.
  <span class="highlight-cmd">ascii</span>      Generate complex glowing cyber artworks.
`;
            appendToHistory(cmdText, helpMenu, true);
            playSuccessNoise();
            return;
        }

        // 2. CLEAR command
        if (baseCmd === 'clear') {
            terminalHistory.innerHTML = '';
            // Clear welcome too for true purists
            const welcome = document.querySelector('.terminal-welcome');
            if (welcome) welcome.style.display = 'none';
            playSuccessNoise();
            return;
        }

        // 3. STATUS command
        if (baseCmd === 'status') {
            const tempVal = document.getElementById('temp-value')?.textContent || '42°C';
            const uptime = document.getElementById('uptime-value')?.textContent || '00:00:00';
            const statusStr = `
SYSTEM ANALYSIS NODES [ESTABLISHED]:
  - SYSTEM CORE: RUNNING (100% HEALTHY)
  - TEMPERATURE: ${tempVal} (COOLING ACTIVE)
  - VIRTUAL DRIVES: /dev/vdsa1 (SECURE), /dev/vdsb1 (SECURE)
  - PACKET EMULATOR: ONLINE [ACTIVE SPEED: 800-2000ms]
  - UPTIME STATE: ${uptime}
  - WARNING STABILITY: 0 ACTIVE INCIDENTS
`;
            appendToHistory(cmdText, statusStr, true, 'success');
            playSuccessNoise();
            return;
        }

        // 4. SCAN command
        if (baseCmd === 'scan') {
            appendToHistory(cmdText, "Initiating diagnostic sweep of simulated internal clusters...", false, 'accent');
            playBeep(440, 'triangle', 0.2);

            let scanProgress = 0;
            const logRow = document.createElement('div');
            logRow.className = 'terminal-log-row';
            const progressSpan = document.createElement('div');
            progressSpan.className = 'terminal-output terminal-output-accent';
            logRow.appendChild(progressSpan);
            terminalHistory.appendChild(logRow);

            const scanTimer = setInterval(() => {
                scanProgress += 20;
                progressSpan.textContent = `Scanning virtual nodes: [${"=".repeat(scanProgress / 5)}${".".repeat(20 - scanProgress / 5)}] ${scanProgress}%`;
                terminalScreen.scrollTop = terminalScreen.scrollHeight;
                playBeep(500 + scanProgress * 3, 'sine', 0.05, 0.02);

                if (scanProgress >= 100) {
                    clearInterval(scanTimer);
                    setTimeout(() => {
                        progressSpan.innerHTML = `
Sweep completed. All 5 simulated sub-routers mapped successfully:
  <span class="indicator-safe">🟢 SECURE</span> Node-Alpha (192.168.1.104) -> Latency: 12ms
  <span class="indicator-safe">🟢 SECURE</span> Node-Beta (10.0.8.21) -> Latency: 14ms
  <span class="indicator-safe">🟢 SECURE</span> Node-Gamma (172.16.254.1) -> Latency: 9ms
  <span class="indicator-safe">🟢 SECURE</span> Cluster-Auth-Service (auth-service-67f9fd) -> Latency: 15ms
  <span class="indicator-safe">🟢 SECURE</span> Database-Replica-0 (postgresql-ha-node) -> Latency: 8ms
`;
                        playSuccessNoise();
                        terminalScreen.scrollTop = terminalScreen.scrollHeight;
                    }, 200);
                }
            }, 250);
            return;
        }

        // 5. MATRIX command
        if (baseCmd === 'matrix') {
            toggleMatrixRain();
            const matrixMsg = isMatrixRainMode
                ? "Matrix Rain Mode <span class='indicator-safe'>ACTIVATED</span>. Visual digital canvas overlay prioritized."
                : "Matrix Rain Mode <span class='indicator-safe'>DEACTIVATED</span>. Default minimal grid rendering mode restored.";
            appendToHistory(cmdText, matrixMsg, true, 'success');
            playSuccessNoise();
            return;
        }

        // 6. DECRYPT command
        if (baseCmd === 'decrypt') {
            appendToHistory(cmdText, "Connecting to simulated hash register bypass...", false, 'warn');
            playBeep(220, 'sawtooth', 0.15);

            let decryptTicks = 0;
            const logRow = document.createElement('div');
            logRow.className = 'terminal-log-row';
            const progressSpan = document.createElement('div');
            progressSpan.className = 'terminal-output terminal-output-warn';
            logRow.appendChild(progressSpan);
            terminalHistory.appendChild(logRow);

            const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
            const targetToken = "ADE_SAI_F_I_RE_L_EA_SE_99_F48C";

            const decryptTimer = setInterval(() => {
                decryptTicks++;
                let randomizedText = "";
                for (let i = 0; i < targetToken.length; i++) {
                    if (i < decryptTicks) {
                        randomizedText += targetToken[i];
                    } else {
                        randomizedText += characters[Math.floor(Math.random() * characters.length)];
                    }
                }

                progressSpan.textContent = `Decrypting virtual token: [ ${randomizedText} ]`;
                terminalScreen.scrollTop = terminalScreen.scrollHeight;
                playBeep(800 - decryptTicks * 15, 'sine', 0.02, 0.02);

                if (decryptTicks >= targetToken.length) {
                    clearInterval(decryptTimer);
                    setTimeout(() => {
                        progressSpan.innerHTML = `
Decrypt bypass complete:
  - TARGET VALUE: <span class="highlight-cmd">${targetToken}</span>
  - DEC_ALGORITHM: AES-256-XTS GCM SHA512
  - STATUS: <span class="indicator-safe">SUCCESS</span>
  - DISCLAIMER: Decryption value is fictitious and generated live.
`;
                        playSuccessNoise();
                        terminalScreen.scrollTop = terminalScreen.scrollHeight;
                    }, 200);
                }
            }, 100);
            return;
        }

        // 7. ABOUT command
        if (baseCmd === 'about') {
            const aboutStr = `
ABOUT THIS SIMULATOR:
  - CODENAME: Cybernetic Terminal Suite
  - VERSION: v4.9.0
  - ARCHITECT: Adeeb Saifi (Elite Systems & Design Craftsman)
  - DESIGN CONTEXT: Built as a premium Easter Egg demonstration page. Fuses
    cinematic movie hacker styling with reliable interactive modules.
  - SPECIAL PHILOSOPHY: Standard premium dark glassmorphism styling, zero external
    frameworks, 100% vanilla Web Audio / Canvas logic, fully optimized.
`;
            appendToHistory(cmdText, aboutStr, true, 'accent');
            playSuccessNoise();
            return;
        }

        // 8. VERSION command
        if (baseCmd === 'version') {
            appendToHistory(cmdText, "CYBER_TERMINAL_EMU Engine v4.9.0-RELEASE (Fictitious Build 0x9AF48C)", true, 'success');
            playSuccessNoise();
            return;
        }

        // 9. RESTART command
        if (baseCmd === 'restart') {
            appendToHistory(cmdText, "Re-initializing terminal sandbox context...", false, 'alert');
            setTimeout(() => {
                startBootSequence();
            }, 600);
            return;
        }

        // 10. THEME command
        if (baseCmd === 'theme') {
            if (args.length === 0) {
                const themeList = themes.map((t, idx) => `  [${idx}] ${t.name}`).join('\n');
                appendToHistory(cmdText, `Usage: theme [index / name]\nAvailable Themes:\n${themeList}`, false, 'accent');
                playSuccessNoise();
                return;
            }

            const targetThemeInput = args[0].toUpperCase();
            let matchedTheme = null;

            // Check if input is a number index
            const index = parseInt(targetThemeInput);
            if (!isNaN(index) && index >= 0 && index < themes.length) {
                matchedTheme = themes[index];
            } else {
                // Check name string matches
                matchedTheme = themes.find(t => t.name.includes(targetThemeInput) || targetThemeInput.includes(t.name));
            }

            if (matchedTheme) {
                switchTheme(matchedTheme);
                appendToHistory(cmdText, `Theme altered successfully: <span class="highlight-cmd">${matchedTheme.name}</span>`, true, 'success');
                playSuccessNoise();
            } else {
                appendToHistory(cmdText, `Error: Theme option "${args[0]}" not found in available registers.`, false, 'alert');
                playErrorNoise();
            }
            return;
        }

        // 11. STATS command
        if (baseCmd === 'stats') {
            const telemetrySummaries = `
CLUSTER HEALTH METRICS [SYNTHETIC COMPUTE]:
  - WORKER CLUSTERS: 12 Active Nodes
  - DISPATCHED TASKS: 8,421,902 Total Since Epoch
  - AVERAGE LATENCY: 11.2 ms
  - NETWORK PACKETS PROCESSED: 29.1 GB/Hour (Simulated)
  - ERROR EVENT RATIO: 0.000%
  - AUDIT POLICY Compliance: 100.00% SECURE
`;
            appendToHistory(cmdText, telemetrySummaries, true, 'success');
            playSuccessNoise();
            return;
        }

        // 12. ASCII command
        if (baseCmd === 'ascii') {
            const artChoice = Math.floor(Math.random() * 3);
            let artStr = "";
            if (artChoice === 0) {
                artStr = `
    .---.     .---.
   (     )   (     )
    \\   /     \\   /
     \\ /       \\ /
      X         X
     / \\       / \\
    /   \\     /   \\
   (     )   (     )
    '---'     '---'
  :: DNA_DOUBLE_HELIX_SIM ::
`;
            } else if (artChoice === 1) {
                artStr = `
        .---.
       /     \\
      \\       /
    .---|   |---.
   /    |   |    \\
  |     |   |     |
   \\    |   |    /
    '---|   |---'
      /       \\
     /  CORE   \\
    '-----------'
 :: CODENAME: QUANTUM_CORE ::
`;
            } else {
                artStr = `
       /\\
      /  \\
     / /\\ \\
    / /  \\ \\
   / /    \\ \\
  / /======\\ \\
 /_ /______\\ _\\
 :: COMPLIANCE_TRIAD ::
`;
            }
            appendToHistory(cmdText, artStr, true, 'accent');
            playSuccessNoise();
            return;
        }

        // Unknown command handler
        appendToHistory(cmdText, `Command not recognized: "${escapeHTML(baseCmd)}". Type <span class="highlight-cmd">help</span> to view available registers.`, false, 'alert');
        playErrorNoise();
    }


    /* ==========================================
       THEME CONTROLLER & SWITCHER
       ========================================== */
    function switchTheme(themeObj) {
        // Remove all theme classes from body
        themes.forEach(t => document.body.classList.remove(t.class));
        document.body.classList.remove('theme-secret');

        // Add matching class
        document.body.classList.add(themeObj.class);

        // Update indicators
        const currentThemeLabel = document.getElementById('current-theme-label');
        if (currentThemeLabel) {
            currentThemeLabel.textContent = `THEME: ${themeObj.name}`;
        }
    }


    /* ==========================================
       MUTE AUDIO BUTTON CONTROL
       ========================================== */
    const muteBtn = document.getElementById('mute-btn');
    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            isMuted = !isMuted;
            if (isMuted) {
                muteBtn.textContent = "🔇 AUDIO_OFF";
                muteBtn.style.color = "var(--color-alert)";
                muteBtn.style.borderColor = "var(--color-alert)";
            } else {
                muteBtn.textContent = "🔊 AUDIO_ON";
                muteBtn.style.color = "var(--color-primary)";
                muteBtn.style.borderColor = "var(--panel-border)";
                playSuccessNoise();
            }
        });
    }


    /* ==========================================
       EASTER EGGS: KONAMI CODE & SECRET THEME
       ========================================== */
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;

    document.addEventListener("keydown", (e) => {
        if (e.key === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                activateSecretSystemTheme();
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });

    function activateSecretSystemTheme() {
        // Switch to special Golden Neon Cyber theme
        document.body.className = "theme-secret";
        const currentThemeLabel = document.getElementById('current-theme-label');
        if (currentThemeLabel) {
            currentThemeLabel.textContent = "THEME: AMBER_SECRET";
        }

        // Add fake logs to history
        appendToHistory('', `
*****************************************************************
🎉 GOLDEN AMBER ARCHITECTURE MODE ACTIVATED [EASTER EGG TRIGGERS] 🎉
CODENAME: SAIFI SUPREME SYSTEM MODE
Enjoy premium cinema design aesthetics.
*****************************************************************
`, true, 'accent');

        // Intense Success chimes
        try {
            const context = new (window.AudioContext || window.webkitAudioContext)();
            const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C Major scale sweep
            notes.forEach((freq, idx) => {
                setTimeout(() => {
                    playBeep(freq, 'sine', 0.15, 0.05);
                }, idx * 100);
            });
        } catch (e) {}

        // Explode decorative terminal particles
        triggerParticleExplosion();
    }


    /* ==========================================
       PARTICLE DECORATIVE GENERATOR
       ========================================== */
    const particleContainer = document.getElementById('particle-container');

    function triggerParticleExplosion() {
        if (!particleContainer) return;
        particleContainer.innerHTML = '';

        for (let i = 0; i < 40; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = `${Math.random() * 4 + 2}px`;
            particle.style.height = particle.style.width;

            const themeColor = getComputedStyle(document.body).getPropertyValue('--color-primary').trim() || '#f59e0b';
            particle.style.background = themeColor;
            particle.style.borderRadius = '50%';

            // Random start coordinates at center of terminal
            particle.style.top = '50%';
            particle.style.left = '50%';

            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 200 + 50;
            const destX = Math.cos(angle) * distance;
            const destY = Math.sin(angle) * distance;

            particle.style.transition = 'all 1.5s cubic-bezier(0.1, 0.8, 0.3, 1)';
            particle.style.transform = 'translate(-50%, -50%)';
            particle.style.opacity = '1';
            particle.style.boxShadow = `0 0 8px ${themeColor}`;

            particleContainer.appendChild(particle);

            requestAnimationFrame(() => {
                particle.style.transform = `translate(calc(-50% + ${destX}px), calc(-50% + ${destY}px)) scale(0)`;
                particle.style.opacity = '0';
            });
        }
    }


    /* ==========================================
       THEME AUTO-SCHEDULER TIMER (Fictional feature)
       ========================================== */
    // Automatically switch themes smoothly every 45 seconds to keep simulation fresh
    setInterval(() => {
        // Do not auto-switch if secret theme is running
        if (document.body.classList.contains('theme-secret')) return;

        currentThemeIndex = (currentThemeIndex + 1) % themes.length;
        switchTheme(themes[currentThemeIndex]);
    }, 45000);


    /* ==========================================
       INITIALIZE POSITIONING ON INPUT
       ========================================== */
    setTimeout(() => {
        syncCursorPosition();
    }, 100);

})();
