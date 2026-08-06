/**
 * ==========================================================================
 * FUTURISTIC NOC GLOBAL NETWORK SIMULATOR ENGINE
 * ==========================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    // Active simulation statuses
    let isRunning = true;
    let updateIntervalId = null;
    let logIntervalId = null;

    // Server locations coordinates mapping (normalized relative x, y coordinates [0, 1] mapped to canvas width/height)
    const serverLocations = [
        { name: "USA (Virginia)", x: 0.25, y: 0.38 },
        { name: "United Kingdom (London)", x: 0.48, y: 0.30 },
        { name: "Germany (Frankfurt)", x: 0.52, y: 0.32 },
        { name: "UAE (Dubai)", x: 0.62, y: 0.45 },
        { name: "India (Mumbai)", x: 0.68, y: 0.50 },
        { name: "Singapore", x: 0.74, y: 0.60 },
        { name: "Japan (Tokyo)", x: 0.83, y: 0.36 },
        { name: "Australia (Sydney)", x: 0.88, y: 0.80 },
        { name: "Brazil (São Paulo)", x: 0.36, y: 0.72 },
        { name: "Canada (Toronto)", x: 0.24, y: 0.34 }
    ];

    // Languages dataset setup (19 languages)
    const languages = [
        { name: "HTML", tasks: 12, speed: "1.2 ms", success: "100%", mem: "1.4 MB", progress: 100, status: "SUCCESS" },
        { name: "CSS", tasks: 8, speed: "2.4 ms", success: "100%", mem: "0.8 MB", progress: 100, status: "SUCCESS" },
        { name: "JavaScript", tasks: 84, speed: "0.4 ms", success: "99.8%", mem: "142 MB", progress: 42, status: "COMPILING" },
        { name: "TypeScript", tasks: 62, speed: "0.8 ms", success: "99.9%", mem: "210 MB", progress: 78, status: "COMPILING" },
        { name: "Python", tasks: 45, speed: "1.6 ms", success: "99.4%", mem: "84 MB", progress: 95, status: "COMPILING" },
        { name: "Java", tasks: 38, speed: "3.2 ms", success: "98.9%", mem: "512 MB", progress: 12, status: "COMPILING" },
        { name: "C", tasks: 14, speed: "0.1 ms", success: "99.7%", mem: "8 MB", progress: 100, status: "IDLE" },
        { name: "C++", tasks: 22, speed: "0.2 ms", success: "99.4%", mem: "24 MB", progress: 100, status: "IDLE" },
        { name: "C#", tasks: 29, speed: "1.8 ms", success: "99.1%", mem: "112 MB", progress: 85, status: "COMPILING" },
        { name: "Go", tasks: 51, speed: "0.3 ms", success: "99.9%", mem: "18 MB", progress: 34, status: "COMPILING" },
        { name: "Rust", tasks: 33, speed: "0.2 ms", success: "100%", mem: "12 MB", progress: 100, status: "IDLE" },
        { name: "PHP", tasks: 19, speed: "2.8 ms", success: "97.2%", mem: "64 MB", progress: 100, status: "SUCCESS" },
        { name: "Ruby", tasks: 11, speed: "3.5 ms", success: "98.1%", mem: "48 MB", progress: 60, status: "COMPILING" },
        { name: "Swift", tasks: 15, speed: "1.4 ms", success: "99.5%", mem: "32 MB", progress: 100, status: "IDLE" },
        { name: "Kotlin", tasks: 26, speed: "1.9 ms", success: "99.2%", mem: "135 MB", progress: 100, status: "SUCCESS" },
        { name: "Dart", tasks: 18, speed: "2.1 ms", success: "99.0%", mem: "44 MB", progress: 50, status: "COMPILING" },
        { name: "SQL", tasks: 72, speed: "0.5 ms", success: "99.9%", mem: "128 MB", progress: 99, status: "COMPILING" },
        { name: "Bash", tasks: 41, speed: "0.3 ms", success: "99.8%", mem: "4 MB", progress: 100, status: "IDLE" },
        { name: "PowerShell", tasks: 16, speed: "0.9 ms", success: "99.1%", mem: "16 MB", progress: 100, status: "SUCCESS" }
    ];

    const logTemplates = [
        "Loading Node...", "Deploy Complete...", "Build Passed...", "Synchronizing...",
        "Route Optimized...", "Cache Updated...", "Traffic Balanced...", "Backup Created...",
        "Monitoring Services...", "Buffer Overrun Blocked...", "Socket Connection bound...",
        "TCP Protocol acknowledged...", "CDN edge synced...", "SSL handshake complete...",
        "DNS Cluster responsive...", "Sub-millisecond page layout render complete...",
        "Heartbeat signal ping ok...", "Gateway packet load optimized...", "DB index reorganized..."
    ];

    const logTypes = ["info", "debug", "success", "warning"];

    // DOM caches
    const btnStart = document.getElementById("btn-start");
    const btnPause = document.getElementById("btn-pause");
    const btnResume = document.getElementById("btn-resume");
    const btnReset = document.getElementById("btn-reset");
    const btnFullscreen = document.getElementById("btn-fullscreen");
    const themeSelector = document.getElementById("theme-selector");

    const statConnections = document.getElementById("stat-connections");
    const statServers = document.getElementById("stat-servers");
    const statTraffic = document.getElementById("stat-traffic");
    const statLatency = document.getElementById("stat-latency");
    const statPackets = document.getElementById("stat-packets");
    const statApi = document.getElementById("stat-api");
    const statUsers = document.getElementById("stat-users");
    const statUptime = document.getElementById("stat-uptime");

    const meterCpu = document.getElementById("meter-cpu");
    const cpuFill = document.getElementById("cpu-fill");
    const meterRam = document.getElementById("meter-ram");
    const ramFill = document.getElementById("ram-fill");
    const meterDisk = document.getElementById("meter-disk");
    const diskFill = document.getElementById("disk-fill");

    const languagesContainer = document.getElementById("languages-grid-container");
    const logsContainer = document.getElementById("logs-container-feed");
    const canvas = document.getElementById("map-canvas");
    const ctx = canvas.getContext("2d");

    let packets = [];
    let backgroundGridOffset = 0;

    /**
     * TOAST NOTIFICATION
     */
    function showToast(message) {
        // Remove existing if any
        const oldToast = document.querySelector(".noc-secret-toast");
        if (oldToast) oldToast.remove();

        const toast = document.createElement("div");
        toast.className = "noc-secret-toast";
        toast.style.position = "fixed";
        toast.style.bottom = "12%";
        toast.style.left = "50%";
        toast.style.transform = "translateX(-50%) translateY(30px)";
        toast.style.background = "rgba(2, 2, 5, 0.96)";
        toast.style.border = "2px solid var(--noc-theme-color, #3b82f6)";
        toast.style.borderRadius = "12px";
        toast.style.padding = "1rem 2rem";
        toast.style.color = "var(--noc-theme-color, #3b82f6)";
        toast.style.fontFamily = "ui-monospace, SFMono-Regular, SF Pro Mono, Menlo, monospace";
        toast.style.fontSize = "1.1rem";
        toast.style.fontWeight = "bold";
        toast.style.textAlign = "center";
        toast.style.boxShadow = "0 0 30px var(--noc-theme-glow)";
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

        setTimeout(() => {
            toast.style.transform = "translateX(-50%) translateY(-20px)";
            toast.style.opacity = "0";
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    /**
     * SYSTEM STATS OSCILLATOR HANDLERS
     */
    let systemTimeSeconds = 1234500;

    function updateTelemetryAndMeters() {
        if (!isRunning) return;

        // Connections slightly oscillation
        const connections = Math.floor(14250000 + Math.sin(Date.now() / 2000) * 12500);
        statConnections.innerText = connections.toLocaleString();

        const traffic = (412.5 + Math.sin(Date.now() / 3000) * 12.4).toFixed(1);
        statTraffic.innerText = `${traffic} Gbps`;

        const latency = Math.floor(10 + Math.random() * 5);
        statLatency.innerText = `${latency} ms`;

        const packetsRate = Math.floor(1420100 + Math.sin(Date.now() / 1500) * 8500);
        statPackets.innerText = `${packetsRate.toLocaleString()} p/s`;

        const apiRequests = Math.floor(45100 + Math.random() * 120);
        statApi.innerText = `${apiRequests.toLocaleString()} /s`;

        const users = Math.floor(894200 + Math.sin(Date.now() / 4000) * 1500);
        statUsers.innerText = users.toLocaleString();

        // Uptime increment
        systemTimeSeconds++;
        const days = Math.floor(systemTimeSeconds / 86400);
        const hours = Math.floor((systemTimeSeconds % 86400) / 3600);
        const mins = Math.floor((systemTimeSeconds % 3600) / 60);
        statUptime.innerText = `${days}d ${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m`;

        // Hardware oscillation
        const cpu = Math.floor(20 + Math.random() * 15);
        meterCpu.innerText = `${cpu}%`;
        cpuFill.style.width = `${cpu}%`;

        const ramVal = (8.2 + Math.random() * 0.4).toFixed(1);
        meterRam.innerText = `${ramVal} GB`;
        ramFill.style.width = `${(parseFloat(ramVal) / 16) * 100}%`;

        const disk = Math.floor(30 + Math.random() * 3);
        meterDisk.innerText = `${disk}%`;
        diskFill.style.width = `${disk}%`;

        // Periodic language matrix changes
        languages.forEach(lang => {
            if (lang.status === "COMPILING") {
                lang.progress += Math.floor(Math.random() * 12);
                if (lang.progress >= 100) {
                    lang.progress = 100;
                    lang.status = Math.random() > 0.9 ? "IDLE" : "SUCCESS";
                }
            } else if (lang.status === "IDLE" || lang.status === "SUCCESS") {
                if (Math.random() > 0.85) {
                    lang.status = "COMPILING";
                    lang.progress = Math.floor(Math.random() * 20);
                }
            }
        });
        renderLanguages();
    }

    /**
     * LANGUAGES ACTIVITY RENDERER
     */
    function renderLanguages() {
        languagesContainer.innerHTML = "";
        languages.forEach(lang => {
            const card = document.createElement("div");
            card.className = "lang-card";

            let tagClass = "tag-idle";
            if (lang.status === "SUCCESS") tagClass = "tag-success";
            if (lang.status === "COMPILING") tagClass = "tag-compiling";

            card.innerHTML = `
                <div class="lang-title-row">
                    <span class="lang-name">${lang.name}</span>
                    <span class="lang-status-tag ${tagClass}">${lang.status}</span>
                </div>
                <div class="lang-progress-track">
                    <div class="lang-progress-fill" style="width: ${lang.progress}%"></div>
                </div>
                <div class="lang-details">
                    <div><span>Tasks:</span><span class="val">${lang.tasks}</span></div>
                    <div><span>Speed:</span><span class="val">${lang.speed}</span></div>
                    <div><span>Memory:</span><span class="val">${lang.mem}</span></div>
                    <div><span>Success:</span><span class="val">${lang.success}</span></div>
                </div>
            `;
            languagesContainer.appendChild(card);
        });
    }

    /**
     * SCROLLING LOGS GENERATOR
     */
    function triggerRandomLog() {
        if (!isRunning) return;

        const timestamp = new Date().toLocaleTimeString();
        const type = logTypes[Math.floor(Math.random() * logTypes.length)];
        const template = logTemplates[Math.floor(Math.random() * logTemplates.length)];

        const line = document.createElement("div");
        line.className = `log-line ${type}`;
        line.innerHTML = `
            <span style="color: #6b7280;">[${timestamp}]</span>
            <strong>[${type.toUpperCase()}]</strong>
            <span>${template}</span>
        `;

        logsContainer.appendChild(line);
        logsContainer.scrollTop = logsContainer.scrollHeight;

        if (logsContainer.children.length > 30) {
            logsContainer.removeChild(logsContainer.firstElementChild);
        }
    }

    /**
     * 2D CANVAS GEOPOLITICAL TRANSIT GRID
     */
    function resizeCanvas() {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Spawn packets dynamically traveling between server coordinates
    function triggerPacketTransfer() {
        if (!isRunning) return;
        if (serverLocations.length < 2) return;

        // Choose random source & target
        const srcIndex = Math.floor(Math.random() * serverLocations.length);
        let dstIndex = Math.floor(Math.random() * serverLocations.length);
        while (srcIndex === dstIndex) {
            dstIndex = Math.floor(Math.random() * serverLocations.length);
        }

        const src = serverLocations[srcIndex];
        const dst = serverLocations[dstIndex];

        packets.push({
            sx: src.x,
            sy: src.y,
            dx: dst.x,
            dy: dst.y,
            progress: 0,
            speed: 0.005 + Math.random() * 0.01
        });
    }

    function drawMapFrame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Draw matrix background grid lines
        ctx.strokeStyle = "rgba(255, 255, 255, 0.015)";
        ctx.lineWidth = 1;

        backgroundGridOffset = (backgroundGridOffset + 0.2) % 40;
        for (let x = backgroundGridOffset; x < canvas.width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = backgroundGridOffset; y < canvas.height; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        // 2. Draw fictional outlines of continents as grid nodes
        // (Render procedural tech dots to look highly futuristic and aesthetic)
        ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
        for (let x = 20; x < canvas.width; x += 30) {
            for (let y = 20; y < canvas.height; y += 30) {
                // Slightly shape outline density
                const isLand = (y > canvas.height * 0.2 && y < canvas.height * 0.8) &&
                               ((x > canvas.width * 0.1 && x < canvas.width * 0.4) || // Americas
                                (x > canvas.width * 0.45 && x < canvas.width * 0.9)); // Eurasia/Africa/Aussie
                if (isLand) {
                    ctx.beginPath();
                    ctx.arc(x, y, 1.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        // 3. Draw connection arcs between coordinates
        ctx.lineWidth = 1;
        serverLocations.forEach((src) => {
            serverLocations.forEach((dst) => {
                if (src !== dst) {
                    const startX = src.x * canvas.width;
                    const startY = src.y * canvas.height;
                    const endX = dst.x * canvas.width;
                    const endY = dst.y * canvas.height;

                    ctx.strokeStyle = "rgba(255, 255, 255, 0.012)";
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);

                    // Bezier curves for beautiful arcs
                    const cpX = (startX + endX) / 2;
                    const cpY = Math.min(startY, endY) - 50;
                    ctx.quadraticCurveTo(cpX, cpY, endX, endY);
                    ctx.stroke();
                }
            });
        });

        // 4. Update and Draw active packets
        for (let i = packets.length - 1; i >= 0; i--) {
            let p = packets[i];
            if (isRunning) {
                p.progress += p.speed;
            }

            if (p.progress >= 1.0) {
                packets.splice(i, 1);
                continue;
            }

            // Calc quadratic bezier point coordinates
            const startX = p.sx * canvas.width;
            const startY = p.sy * canvas.height;
            const endX = p.dx * canvas.width;
            const endY = p.dy * canvas.height;
            const cpX = (startX + endX) / 2;
            const cpY = Math.min(startY, endY) - 50;

            const t = p.progress;
            const px = (1-t)*(1-t)*startX + 2*(1-t)*t*cpX + t*t*endX;
            const py = (1-t)*(1-t)*startY + 2*(1-t)*t*cpY + t*t*endY;

            // Draw glowing packet dot
            const themeColor = getComputedStyle(document.body).getPropertyValue('--noc-theme-color').trim();
            const accentColor = getComputedStyle(document.body).getPropertyValue('--noc-theme-accent').trim();

            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fillStyle = accentColor || "#00ffff";
            ctx.shadowColor = accentColor || "#00ffff";
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.shadowBlur = 0; // reset
        }

        // 5. Draw server node markers
        serverLocations.forEach(node => {
            const px = node.x * canvas.width;
            const py = node.y * canvas.height;

            const themeColor = getComputedStyle(document.body).getPropertyValue('--noc-theme-color').trim();

            // Pulse outer rings
            const pulseSize = 8 + (Math.sin(Date.now() / 250) * 4);
            ctx.strokeStyle = themeColor || "#3b82f6";
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.25;
            ctx.beginPath();
            ctx.arc(px, py, pulseSize, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1.0;

            // Inner coordinate node
            ctx.beginPath();
            ctx.arc(px, py, 4, 0, Math.PI * 2);
            ctx.fillStyle = themeColor || "#3b82f6";
            ctx.shadowColor = themeColor || "#3b82f6";
            ctx.shadowBlur = 6;
            ctx.fill();
            ctx.shadowBlur = 0;

            // Coordinate label tags
            ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
            ctx.font = "8px 'JetBrains Mono'";
            ctx.fillText(node.name, px + 8, py + 3);
        });

        // Trigger continuous packet spawns on standard interval frame
        if (Math.random() > 0.94) {
            triggerPacketTransfer();
        }

        requestAnimationFrame(drawMapFrame);
    }

    drawMapFrame();

    /**
     * CONTROLS ACTION HANDLERS
     */
    // Theme switching dropdown listener
    themeSelector.addEventListener("change", (e) => {
        const theme = e.target.value;
        document.body.className = `network-body theme-${theme}`;
        showToast(`Theme updated to ${theme.replace('-', ' ').toUpperCase()}`);
    });

    // Start Simulation
    btnStart.addEventListener("click", () => {
        isRunning = true;
        showToast("GLOBAL NETWORK TRANSMISSION INITIALIZED");
    });

    // Pause Simulation
    btnPause.addEventListener("click", () => {
        isRunning = false;
        showToast("GLOBAL NETWORK TRANSMISSION PAUSED");
    });

    // Resume Simulation
    btnResume.addEventListener("click", () => {
        isRunning = true;
        showToast("GLOBAL NETWORK TRANSMISSION RESUMED");
    });

    // Reset Simulation
    btnReset.addEventListener("click", () => {
        packets = [];
        logsContainer.innerHTML = "";
        showToast("GLOBAL NOC DATABANK RESET");
    });

    // Fullscreen API toggle
    btnFullscreen.addEventListener("click", () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                showToast("Fullscreen request blocked by system parameters");
            });
        } else {
            document.exitFullscreen();
        }
    });

    // Fire timers
    updateIntervalId = setInterval(updateTelemetryAndMeters, 1000);

    // Log generators
    function logScheduler() {
        triggerRandomLog();
        setTimeout(logScheduler, 600 + Math.random() * 1400);
    }
    logScheduler();

    // Trigger toast on load
    showToast("Global Network Simulation Activated");
});
