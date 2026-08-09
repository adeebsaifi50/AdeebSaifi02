/* ==========================================================================
   SPACE MISSION CONTROL SIMULATION ENGINE — CORE ARCHITECTURE
   ========================================================================== */

// Global state container
const SpaceState = {
    // Mission profile details
    missionName: "ADEEB-01",
    missionId: "COSMO-760228",
    status: "PRE-LAUNCH", // PRE-LAUNCH, COUNTDOWN, ENGINE IGNITION, LIFTOFF, ASCENT, ATMOSPHERIC FLIGHT, STAGE SEPARATION, ORBIT INSERTION, ORBIT, DEEP SPACE, MISSION COMPLETE, ABORTED
    missionTime: 0, // seconds since liftoff
    countdown: 10.0, // T-minus seconds
    isCountdownActive: false,
    isPaused: false,
    hasAborted: false,

    // Real-time Flight Physics Metrics
    altitude: 0, // in km
    velocity: 0, // in km/h
    acceleration: 0, // in m/s²
    gForce: 1.0, // in G
    fuel: 100.0, // percentage remaining
    temp: 24.0, // core engine temp in °C
    cabinPressure: 101.32, // in kPa
    battery: 100.0, // percentage remaining
    signal: 100.0, // comm signal %
    distance: 0, // in km from launch site
    trajectoryAngle: 0, // degrees deviation (0 is straight up, positive is right/east)
    throttle: 0, // 0 to 100 percentage
    engineIgnited: false,
    commActive: true,
    stageSeparated: false,
    solarArraysDeployed: false,

    // Graphics & Preferences
    cameraMode: "follow", // follow, orbit, drone, free
    quality: "high", // high, medium, low, auto
    soundMuted: false,

    // Telemetry History (for charts)
    history: {
        time: [],
        altitude: [],
        velocity: [],
        fuel: [],
        temp: []
    }
};

// Simulation Constants
const PhysicsConstants = {
    g0: 9.81, // Standard Earth gravity m/s²
    re: 6371.0, // Earth radius in km
    atmScaleHeight: 8.5, // Atmospheric scale height in km
    rocketMassDry: 12000, // kg
    rocketMassWet: 85000, // kg (total fuel = 73000 kg)
    maxThrust: 18.5, // m/s² acceleration at 100% throttle with full wet mass
    burnRate: 0.15, // % fuel burn per second at 100% throttle
    maxTemp: 1800, // °C
    coolingRate: 0.8, // °C cooled per second when throttle is 0
    heatingFactor: 1.2, // °C rise per unit of drag heating
    solarChargeRate: 0.05, // % battery gain per second in orbit
    batteryDrainRate: 0.02, // % battery drain per second
};

// Sequence stages metadata
const FlightStages = [
    { id: "PRE-LAUNCH", name: "Pre-Launch", desc: "System checks nominal. Rocket on launchpad." },
    { id: "COUNTDOWN", name: "Countdown Sequence", desc: "Terminal countdown in progress." },
    { id: "ENGINE IGNITION", name: "Engine Ignition", desc: "Main engine core ignition." },
    { id: "LIFTOFF", name: "Liftoff", desc: "Successful tower clearance achieved." },
    { id: "ASCENT", name: "Ascent Phase", desc: "Gravity turn initiated. Ascending lower atmosphere." },
    { id: "ATMOSPHERIC FLIGHT", name: "Atmospheric Max-Q", desc: "Maximum aerodynamic pressure." },
    { id: "STAGE SEPARATION", name: "Stage Separation", desc: "Booster separation. Second stage ignited." },
    { id: "ORBIT INSERTION", name: "Orbit Insertion", desc: "Horizontal burns to achieve circularization." },
    { id: "ORBIT", name: "Orbit Achieved", desc: "Stable circular orbit around Earth." },
    { id: "DEEP SPACE", name: "Deep Space Cruise", desc: "Escaping Earth sphere. Direct lunar transit." },
    { id: "MISSION COMPLETE", name: "Mission Complete", desc: "Payload successfully delivered to coordinates." }
];

// Audio Synth Manager (Web Audio API)
let audioCtx = null;
let engineOsc = null;
let engineGain = null;
let staticNode = null;
let staticGain = null;

function initAudio() {
    if (audioCtx) return;
    try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContextClass();

        // Create engine rumbly noise
        engineOsc = audioCtx.createOscillator();
        engineGain = audioCtx.createGain();

        // Low frequency sawtooth oscillator representing heavy booster rumbles
        engineOsc.type = "sawtooth";
        engineOsc.frequency.setValueAtTime(45, audioCtx.currentTime);

        // Filter to remove high-frequency screech from sawtooth, making it deep
        const lpFilter = audioCtx.createBiquadFilter();
        lpFilter.type = "lowpass";
        lpFilter.frequency.setValueAtTime(100, audioCtx.currentTime);

        engineOsc.connect(lpFilter);
        lpFilter.connect(engineGain);
        engineGain.connect(audioCtx.destination);

        engineGain.gain.setValueAtTime(0, audioCtx.currentTime);
        engineOsc.start();

        // Create white noise for background signal static
        const bufferSize = audioCtx.sampleRate * 2;
        const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        staticNode = audioCtx.createBufferSource();
        staticNode.buffer = noiseBuffer;
        staticNode.loop = true;

        staticGain = audioCtx.createGain();
        staticGain.gain.setValueAtTime(0.005, audioCtx.currentTime); // Low static hum

        staticNode.connect(staticGain);
        staticGain.connect(audioCtx.destination);
        staticNode.start();

    } catch (e) {
        console.error("Audio Context initialization failed: ", e);
    }
}

// Procedural synthesizer helper sounds
function playSynthBeep(freq, duration, type = "sine", gainVal = 0.1) {
    if (SpaceState.soundMuted || !audioCtx) return;
    try {
        if (audioCtx.state === "suspended") {
            audioCtx.resume();
        }
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
}

function updateEngineSound() {
    if (!audioCtx || SpaceState.soundMuted) return;
    try {
        if (audioCtx.state === "suspended") {
            audioCtx.resume();
        }
        if (SpaceState.engineIgnited && SpaceState.throttle > 0 && !SpaceState.isPaused) {
            // Volume depends on throttle and atmospheric density
            const density = Math.exp(-SpaceState.altitude / PhysicsConstants.atmScaleHeight);
            // Even in vacuum, structural vibration is heard (minimum 25%)
            const volumeFactor = 0.25 + 0.75 * density;
            const targetGain = (SpaceState.throttle / 100) * 0.18 * volumeFactor;
            engineGain.gain.setTargetAtTime(targetGain, audioCtx.currentTime, 0.1);

            // Frequency pitches up slightly with higher throttle
            const targetFreq = 40 + (SpaceState.throttle / 100) * 35;
            engineOsc.frequency.setTargetAtTime(targetFreq, audioCtx.currentTime, 0.2);
        } else {
            engineGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.15);
        }

        // Fluctuate signal static hum based on distance and signal strength
        if (SpaceState.commActive) {
            const staticVolume = 0.002 + (1.0 - (SpaceState.signal / 100)) * 0.02;
            staticGain.gain.setTargetAtTime(staticVolume, audioCtx.currentTime, 0.5);
        } else {
            staticGain.gain.setTargetAtTime(0.04, audioCtx.currentTime, 0.1); // High static when comm is disconnected
        }
    } catch (e) {}
}

/* ==========================================================================
   STATE STAGE MANAGEMENT
   ========================================================================== */

function setFlightStage(stageId) {
    if (FlightStages.findIndex(s => s.id === stageId) === -1 && stageId !== "ABORTED") return;
    SpaceState.status = stageId;

    // Trigger visual highlights
    renderStagesTimeline();

    // Status warning calculation depending on stage
    updateStatusBadge();

    // Trigger sound alerts depending on stage
    if (stageId === "ENGINE IGNITION") {
        playSynthBeep(180, 1.2, "sawtooth", 0.15);
    } else if (stageId === "LIFTOFF") {
        playSynthBeep(440, 1.0, "sine", 0.2);
        playSynthBeep(880, 0.5, "sine", 0.1);
    } else if (stageId === "STAGE SEPARATION") {
        playSynthBeep(600, 0.8, "triangle", 0.12);
    } else if (stageId === "ORBIT") {
        playSynthBeep(523.25, 0.4, "sine", 0.15); // C5 note beep
        setTimeout(() => playSynthBeep(659.25, 0.4, "sine", 0.15), 150); // E5
        setTimeout(() => playSynthBeep(783.99, 0.8, "sine", 0.15), 300); // G5
    } else if (stageId === "MISSION COMPLETE") {
        // High-pitched victory chime
        const chime = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50];
        chime.forEach((f, idx) => {
            setTimeout(() => playSynthBeep(f, 0.3, "sine", 0.12), idx * 120);
        });
    }

    // Adjust specific controls based on stage
    const stageBtn = document.getElementById("btn-manual-stage");
    if (stageBtn) {
        if (stageId === "ASCENT" || stageId === "ATMOSPHERIC FLIGHT") {
            stageBtn.disabled = false;
        } else {
            stageBtn.disabled = true;
        }
    }

    console.log(`Flight Stage updated to: ${stageId}`);
}

function updateStatusBadge() {
    const badge = document.getElementById("mission-status-badge");
    if (!badge) return;

    badge.className = "status-badge";
    if (SpaceState.hasAborted) {
        badge.innerText = "🚨 ABORT SEQUENCE INITIATED";
        badge.classList.add("glow-red");
    } else if (SpaceState.temp > 1200 || SpaceState.fuel < 10) {
        badge.innerText = "🔴 CRITICAL WARNING";
        badge.classList.add("glow-red");
    } else if (SpaceState.temp > 800 || SpaceState.battery < 20 || SpaceState.signal < 30) {
        badge.innerText = "🟡 WARNING - MONITOR TELEMETRY";
        badge.classList.add("glow-orange");
    } else {
        badge.innerText = "🟢 SYSTEMS NOMINAL";
        badge.classList.add("glow-green");
    }
}

/* ==========================================================================
   PHYSICS STATE UPDATE SIMULATOR
   ========================================================================== */

function updatePhysics(dT) {
    if (SpaceState.isPaused || SpaceState.status === "PRE-LAUNCH" || SpaceState.status === "ABORTED") {
        return;
    }

    // 1. Manage Countdown Sequence
    if (SpaceState.status === "COUNTDOWN") {
        SpaceState.countdown -= dT;
        if (SpaceState.countdown <= 3.0 && !SpaceState.engineIgnited) {
            // Engine pre-ignition sequence
            SpaceState.engineIgnited = true;
            SpaceState.throttle = 15; // Auto idle throttle
            setFlightStage("ENGINE IGNITION");
        }
        if (SpaceState.countdown <= 0.0) {
            SpaceState.countdown = 0.0;
            SpaceState.isCountdownActive = false;
            setFlightStage("LIFTOFF");
        }
        updateEngineSound();
        return;
    }

    // 2. Clock & Distance Tracking
    SpaceState.missionTime += dT;

    // Fuel Consumption Physics
    let currentMass = PhysicsConstants.rocketMassDry;
    if (SpaceState.fuel > 0) {
        const fuelUsed = PhysicsConstants.burnRate * (SpaceState.throttle / 100) * dT;
        SpaceState.fuel = Math.max(0.0, SpaceState.fuel - fuelUsed);
        currentMass += (PhysicsConstants.rocketMassWet - PhysicsConstants.rocketMassDry) * (SpaceState.fuel / 100);
    } else {
        SpaceState.throttle = 0;
        SpaceState.engineIgnited = false;
    }

    // 3. Thrust Calculations
    let thrustAccel = 0;
    if (SpaceState.engineIgnited && SpaceState.throttle > 0 && SpaceState.fuel > 0) {
        thrustAccel = (SpaceState.throttle / 100) * PhysicsConstants.maxThrust * (PhysicsConstants.rocketMassWet / currentMass);
    }

    // Gravity calculation based on distance from earth's center (inverse square)
    const currentGravity = PhysicsConstants.g0 * Math.pow(PhysicsConstants.re / (PhysicsConstants.re + SpaceState.altitude), 2);

    // 4. Aerodynamic Drag Physics (Atmosphere drops exponentially)
    const airDensity = 1.225 * Math.exp(-SpaceState.altitude / PhysicsConstants.atmScaleHeight);
    const dragCoeff = SpaceState.stageSeparated ? 0.15 : 0.28; // stage separation reduces drag coefficient
    const dragForceFactor = 0.000005 * airDensity * dragCoeff;
    const dragAccel = dragForceFactor * Math.pow(SpaceState.velocity, 2);

    // 5. Angular components (Gravity turn)
    // Trajectory deviation angle relative to standard local vertical
    const angleRad = (SpaceState.trajectoryAngle * Math.PI) / 180.0;

    // Accelerations along local vertical and horizontal coordinates
    const accelVertical = thrustAccel * Math.cos(angleRad) - currentGravity - (dragAccel * Math.cos(angleRad));
    const accelHorizontal = thrustAccel * Math.sin(angleRad) - (dragAccel * Math.sin(angleRad));

    // Resolve net acceleration
    const netAccel = Math.sqrt(accelVertical * accelVertical + accelHorizontal * accelHorizontal);
    SpaceState.acceleration = accelVertical >= 0 || SpaceState.velocity > 0 ? accelVertical : 0; // standard display lock

    // G-Force calculation
    SpaceState.gForce = 1.0 + (netAccel / PhysicsConstants.g0);

    // 6. Integrate Velocity & Altitude (simple fictional integration Euler)
    const prevVelocityKmS = (SpaceState.velocity) / 3600.0;
    const velocityChangeVertical = accelVertical * dT;
    const velocityChangeHorizontal = accelHorizontal * dT;

    // Current vertical and horizontal speeds in km/h
    let velVertKmH = prevVelocityKmS * Math.cos(angleRad) * 3600.0 + (accelVertical * dT * 3.6);
    let velHorizKmH = prevVelocityKmS * Math.sin(angleRad) * 3600.0 + (accelHorizontal * dT * 3.6);

    // Filter lock for rocket sitting on launchpad
    if (SpaceState.altitude === 0 && accelVertical <= 0) {
        velVertKmH = 0;
        velHorizKmH = 0;
        SpaceState.acceleration = 0;
        SpaceState.gForce = 1.0;
    }

    // Combine velocities
    SpaceState.velocity = Math.sqrt(velVertKmH * velVertKmH + velHorizKmH * velHorizKmH);

    // Altitude increment based on vertical component
    const altitudeGain = (velVertKmH / 3600.0) * dT;
    SpaceState.altitude = Math.max(0.0, SpaceState.altitude + altitudeGain);

    // 7. Distance & Temp calculations
    // Horizontal tracking adds to distance covered from site
    const distanceGain = Math.abs(velHorizKmH / 3600.0) * dT;
    SpaceState.distance += Math.sqrt(altitudeGain * altitudeGain + distanceGain * distanceGain);

    // Thermal properties: Heat rises with throttle and atmospheric speed (compressional drag heating)
    const targetTemp = 24.0 + (SpaceState.throttle / 100) * 1100 + (airDensity * Math.pow(SpaceState.velocity / 1000, 2) * 80);
    if (SpaceState.temp < targetTemp) {
        SpaceState.temp = Math.min(PhysicsConstants.maxTemp, SpaceState.temp + (120 * dT));
    } else {
        SpaceState.temp = Math.max(24.0, SpaceState.temp - (PhysicsConstants.coolingRate * dT));
    }

    // Cabin Pressure decays into vacuum
    SpaceState.cabinPressure = Math.max(0, 101.32 * Math.exp(-SpaceState.altitude / PhysicsConstants.atmScaleHeight));

    // Battery system
    if (SpaceState.solarArraysDeployed) {
        SpaceState.battery = Math.min(100.0, SpaceState.battery + (PhysicsConstants.solarChargeRate * dT));
    } else {
        SpaceState.battery = Math.max(0.0, SpaceState.battery - (PhysicsConstants.batteryDrainRate * dT));
    }

    // Signal strength (decays into deep space, restored if high throttle comm is used)
    const signalLoss = (SpaceState.distance / 1200.0);
    SpaceState.signal = Math.max(5, 100 - signalLoss);

    // 8. Auto Flight Stage Progression based on physics boundaries
    if (SpaceState.status === "LIFTOFF" && SpaceState.altitude > 0.5) {
        setFlightStage("ASCENT");
    } else if (SpaceState.status === "ASCENT" && SpaceState.altitude > 12.0) {
        // High pressure atmospheric interface Max-Q
        setFlightStage("ATMOSPHERIC FLIGHT");
    } else if (SpaceState.status === "ATMOSPHERIC FLIGHT" && SpaceState.altitude > 45.0) {
        // Beyond densest atmosphere, prepare stage separation
        setFlightStage("STAGE SEPARATION");
        // Separation prompt helper:
        playSynthBeep(580, 0.4, "sine", 0.15);
    } else if (SpaceState.status === "STAGE SEPARATION" && SpaceState.stageSeparated && SpaceState.altitude > 100.0) {
        setFlightStage("ORBIT INSERTION");
    } else if (SpaceState.status === "ORBIT INSERTION" && SpaceState.velocity >  circularizationSpeed() && SpaceState.altitude > 180.0) {
        // Orbit speed circularized
        setFlightStage("ORBIT");
        SpaceState.solarArraysDeployed = true; // Deploy arrays in space
    } else if (SpaceState.status === "ORBIT" && SpaceState.velocity > 38000) {
        // Exceeded orbital escape velocity
        setFlightStage("DEEP SPACE");
    } else if (SpaceState.status === "DEEP SPACE" && SpaceState.distance > 3500.0) {
        setFlightStage("MISSION COMPLETE");
    }

    // Update dynamic sound effects
    updateEngineSound();

    // Track state history for live charts
    saveHistoryStats();
}

function circularizationSpeed() {
    return 27000;
}

/* ==========================================================================
   CHARTING & STATS RECORDERS
   ========================================================================== */

function saveHistoryStats() {
    const hist = SpaceState.history;
    const timeVal = SpaceState.missionTime;

    // Limit tracking capacity to prevent leak
    if (hist.time.length > 100) {
        hist.time.shift();
        hist.altitude.shift();
        hist.velocity.shift();
        hist.fuel.shift();
        hist.temp.shift();
    }

    hist.time.push(timeVal);
    hist.altitude.push(SpaceState.altitude);
    hist.velocity.push(SpaceState.velocity);
    hist.fuel.push(SpaceState.fuel);
    hist.temp.push(SpaceState.temp);
}

/* ==========================================================================
   2D PROCEDURAL CANVAS RENDERING ENGINE
   ========================================================================== */

let earthRotationAngle = 0;
const stars = [];

function initStars() {
    for (let i = 0; i < 150; i++) {
        stars.push({
            x: Math.random() * 800,
            y: Math.random() * 480,
            size: Math.random() * 1.5 + 0.5,
            glow: Math.random() * 0.5 + 0.5
        });
    }
}

function drawSpaceTheater(canvas, ctx) {
    if (!canvas || !ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Draw dark space grid background
    ctx.fillStyle = "#020204";
    ctx.fillRect(0, 0, w, h);

    // Render stars
    ctx.fillStyle = "#ffffff";
    stars.forEach(star => {
        ctx.globalAlpha = star.glow * (0.6 + 0.4 * Math.sin(Date.now() / 300 + star.x));
        ctx.fillRect(star.x * (w / 800), star.y * (h / 480), star.size, star.size);
    });
    ctx.globalAlpha = 1.0;

    // Compute camera coordinates/zoom depending on select mode
    let scale = 1.0;
    let cameraX = w / 2;
    let cameraY = h / 2;

    const isShaking = SpaceState.engineIgnited && SpaceState.throttle > 0 && !SpaceState.isPaused;
    let shakeX = 0;
    let shakeY = 0;
    if (isShaking) {
        // High vibration factor during liftoff & Max-Q
        const intensity = (SpaceState.throttle / 100) * (SpaceState.altitude < 40 ? 4 : 1.5);
        shakeX = (Math.random() - 0.5) * intensity;
        shakeY = (Math.random() - 0.5) * intensity;
    }

    // Apply Camera Modes
    if (SpaceState.cameraMode === "follow") {
        // Camera tracks the rocket altitude
        scale = 0.8;
    } else if (SpaceState.cameraMode === "orbit") {
        // Earth circular telemetry overview
        scale = 0.35;
    } else if (SpaceState.cameraMode === "drone") {
        // Tracking sweep from launchtower
        scale = 1.5;
    }

    ctx.save();
    ctx.translate(cameraX + shakeX, cameraY + shakeY);
    ctx.scale(scale, scale);

    // Draw reference orbital elements
    drawEarthProcedural(ctx, 0, 380, earthRotationAngle);
    drawMoonProcedural(ctx, 350, -200);
    drawTrajectoryPath(ctx);
    drawRocketGraphic(ctx);

    ctx.restore();

    // Increment earth rotation vector over frames
    if (!SpaceState.isPaused) {
        earthRotationAngle += 0.0003;
    }
}

function drawEarthProcedural(ctx, x, y, angle) {
    const radius = 220;

    // Glow effects atmosphere
    ctx.save();
    const atmosGlow = ctx.createRadialGradient(x, y, radius - 10, x, y, radius + 25);
    atmosGlow.addColorStop(0, "rgba(59, 130, 246, 0.4)");
    atmosGlow.addColorStop(0.5, "rgba(139, 92, 246, 0.15)");
    atmosGlow.addColorStop(1, "rgba(139, 92, 246, 0)");
    ctx.fillStyle = atmosGlow;
    ctx.beginPath();
    ctx.arc(x, y, radius + 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Base deep water circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = "#1e3a8a"; // Ocean blue
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);

    // Procedural Landmass mapping
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = "#10b981"; // Continents green

    // Draw fictional continent clusters
    for (let i = 0; i < 4; i++) {
        const cx = Math.sin(i * 1.5) * 80;
        const cy = Math.cos(i * 1.5) * 80;
        ctx.beginPath();
        ctx.arc(cx, cy, 75, 0, Math.PI * 2);
        ctx.fill();
    }
    // Draw smaller islands
    ctx.fillStyle = "#059669";
    for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.arc(Math.cos(i * 2) * 120, Math.sin(i * 2.5) * 120, 25, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();

    // Shadow of night side
    const nightGlow = ctx.createRadialGradient(x + 100, y - 100, radius, x - 100, y + 100, radius * 1.5);
    nightGlow.addColorStop(0, "rgba(0,0,0,0)");
    nightGlow.addColorStop(0.8, "rgba(5, 5, 8, 0.85)");
    nightGlow.addColorStop(1, "rgba(5, 5, 8, 0.98)");
    ctx.fillStyle = nightGlow;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Atmosphere outline ring
    ctx.strokeStyle = "rgba(147, 197, 253, 0.25)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw safe circular orbit reference line
    ctx.strokeStyle = "rgba(139, 92, 246, 0.12)";
    ctx.setLineDash([4, 8]);
    ctx.beginPath();
    ctx.arc(x, y, radius + 110, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.restore();
}

function drawMoonProcedural(ctx, x, y) {
    const radius = 35;

    // Glow
    ctx.save();
    const glow = ctx.createRadialGradient(x, y, radius - 5, x, y, radius + 10);
    glow.addColorStop(0, "rgba(255, 255, 255, 0.15)");
    glow.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, radius + 10, 0, Math.PI * 2);
    ctx.fill();

    // Core
    ctx.fillStyle = "#9ca3af";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Craters
    ctx.fillStyle = "#4b5563";
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(x - 12 + i * 8, y - 8 + (i % 2) * 12, 5 + i, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

function drawTrajectoryPath(ctx) {
    // Current flight trajectory representation
    const earthCenterX = 0;
    const earthCenterY = 380;
    const startAltitudeRadius = 220; // Earth surface

    ctx.save();
    ctx.strokeStyle = "rgba(139, 92, 246, 0.4)";
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);

    // Compute trajectory curve based on flight statistics
    ctx.beginPath();
    ctx.moveTo(earthCenterX, earthCenterY - startAltitudeRadius);

    const steps = 30;
    const maxTrajLength = Math.min(steps, 1 + Math.floor(SpaceState.altitude / 8));

    let currentX = earthCenterX;
    let currentY = earthCenterY - startAltitudeRadius;

    for (let i = 1; i <= maxTrajLength; i++) {
        // Simulating curve reflecting heading angle
        const t = i / steps;
        const angle = (SpaceState.trajectoryAngle * t * Math.PI) / 180.0;
        const radius = startAltitudeRadius + (SpaceState.altitude * t);

        currentX = earthCenterX + radius * Math.sin(angle);
        currentY = earthCenterY - radius * Math.cos(angle);

        ctx.lineTo(currentX, currentY);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
}

function drawRocketGraphic(ctx) {
    const earthCenterX = 0;
    const earthCenterY = 380;
    const earthRadius = 220;

    // Determine current coordinates of rocket
    const angleRad = (SpaceState.trajectoryAngle * Math.PI) / 180.0;
    const orbitalRadius = earthRadius + SpaceState.altitude;

    const rX = earthCenterX + orbitalRadius * Math.sin(angleRad);
    const rY = earthCenterY - orbitalRadius * Math.cos(angleRad);

    ctx.save();
    ctx.translate(rX, rY);
    // Align rocket along thrust vector angle
    ctx.rotate(angleRad);

    // Render original vector fictional rocket
    // 1. Boost flames
    if (SpaceState.engineIgnited && SpaceState.throttle > 0 && !SpaceState.isPaused) {
        ctx.fillStyle = "#ff5500";
        ctx.beginPath();
        ctx.moveTo(-6, 20);
        ctx.lineTo(0, 20 + (SpaceState.throttle / 100) * 22 + Math.random() * 8);
        ctx.lineTo(6, 20);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#ffaa00";
        ctx.beginPath();
        ctx.moveTo(-4, 20);
        ctx.lineTo(0, 20 + (SpaceState.throttle / 100) * 14 + Math.random() * 4);
        ctx.lineTo(4, 20);
        ctx.closePath();
        ctx.fill();

        // Exhaust smoke particles
        ctx.fillStyle = "rgba(156, 163, 175, 0.15)";
        ctx.beginPath();
        ctx.arc((Math.random() - 0.5) * 8, 22 + Math.random() * 15, 6 + Math.random() * 6, 0, Math.PI * 2);
        ctx.fill();
    }

    // 2. Main cylindrical body
    ctx.fillStyle = "#e5e7eb"; // Silver-white hull
    ctx.beginPath();
    ctx.rect(-6, -18, 12, 36);
    ctx.fill();

    // 3. Nose cone (triangle cap)
    ctx.fillStyle = "#3b82f6"; // Blue composite shield
    ctx.beginPath();
    ctx.moveTo(-6, -18);
    ctx.lineTo(0, -32);
    ctx.lineTo(6, -18);
    ctx.closePath();
    ctx.fill();

    // 4. Side fins
    ctx.fillStyle = "#1e3a8a";
    // Left fin
    ctx.beginPath();
    ctx.moveTo(-6, 8);
    ctx.lineTo(-12, 18);
    ctx.lineTo(-6, 18);
    ctx.closePath();
    ctx.fill();
    // Right fin
    ctx.beginPath();
    ctx.moveTo(6, 8);
    ctx.lineTo(12, 18);
    ctx.lineTo(6, 18);
    ctx.closePath();
    ctx.fill();

    // 5. Cabin Window
    ctx.fillStyle = "#93c5fd";
    ctx.beginPath();
    ctx.arc(0, -6, 3, 0, Math.PI * 2);
    ctx.fill();

    // 6. Solar panel wings (deploy only in ORBIT)
    if (SpaceState.solarArraysDeployed) {
        ctx.fillStyle = "#1e40af";
        ctx.strokeStyle = "#60a5fa";
        ctx.lineWidth = 1;
        // Left Panel
        ctx.fillRect(-32, -4, 26, 8);
        ctx.strokeRect(-32, -4, 26, 8);
        // Right Panel
        ctx.fillRect(6, -4, 26, 8);
        ctx.strokeRect(6, -4, 26, 8);
    }

    ctx.restore();
}

/* ==========================================================================
   TELEMETRY REAL-TIME GRAPHS
   ========================================================================== */

function drawTelemetryGraphs() {
    const canvas1 = document.getElementById("chart-canvas-alt-vel");
    const canvas2 = document.getElementById("chart-canvas-fuel-temp");

    if (!canvas1 || !canvas2) return;

    drawSingleGraph(canvas1, SpaceState.history.altitude, SpaceState.history.velocity, "#3b82f6", "#10b981", "ALT", "VEL");
    drawSingleGraph(canvas2, SpaceState.history.fuel, SpaceState.history.temp, "#f59e0b", "#ef4444", "FUEL", "TEMP");
}

function drawSingleGraph(canvas, dataSeries1, dataSeries2, color1, color2, label1, label2) {
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = "#0a0a0f";
    ctx.fillRect(0, 0, w, h);

    if (dataSeries1.length < 2) {
        ctx.font = "10px monospace";
        ctx.fillStyle = "rgba(255,255,255,0.25)";
        ctx.fillText("AWAITING FLIGHT DATA...", w / 2 - 60, h / 2 + 3);
        return;
    }

    // Grid guide lines
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
        const y = (h / 4) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
    }

    // Determine scale limits
    const maxVal1 = Math.max(1, ...dataSeries1);
    const minVal1 = Math.min(...dataSeries1);
    const range1 = maxVal1 - minVal1 || 1;

    const maxVal2 = Math.max(1, ...dataSeries2);
    const minVal2 = Math.min(...dataSeries2);
    const range2 = maxVal2 - minVal2 || 1;

    const len = dataSeries1.length;

    // Plot Series 1
    ctx.strokeStyle = color1;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < len; i++) {
        const x = (w / (len - 1)) * i;
        const normY = (dataSeries1[i] - minVal1) / range1;
        const y = h - 5 - normY * (h - 10);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Plot Series 2
    ctx.strokeStyle = color2;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < len; i++) {
        const x = (w / (len - 1)) * i;
        const normY = (dataSeries2[i] - minVal2) / range2;
        const y = h - 5 - normY * (h - 10);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
}

/* ==========================================================================
   LOCALSTORAGE PREFERENCES MANAGER
   ========================================================================== */

function saveMissionStateToDisk() {
    try {
        const payload = {
            status: SpaceState.status,
            altitude: SpaceState.altitude,
            velocity: SpaceState.velocity,
            fuel: SpaceState.fuel,
            trajectoryAngle: SpaceState.trajectoryAngle,
            missionTime: SpaceState.missionTime,
            stageSeparated: SpaceState.stageSeparated,
            solarArraysDeployed: SpaceState.solarArraysDeployed,
            soundMuted: SpaceState.soundMuted,
            cameraMode: SpaceState.cameraMode,
            quality: SpaceState.quality
        };
        localStorage.setItem("COSMO_SAVE_STATE", JSON.stringify(payload));
    } catch (e) {}
}

function loadMissionStateFromDisk() {
    try {
        const raw = localStorage.getItem("COSMO_SAVE_STATE");
        if (!raw) return;

        const data = JSON.parse(raw);
        SpaceState.status = data.status || "PRE-LAUNCH";
        SpaceState.altitude = data.altitude || 0;
        SpaceState.velocity = data.velocity || 0;
        SpaceState.fuel = data.fuel !== undefined ? data.fuel : 100;
        SpaceState.trajectoryAngle = data.trajectoryAngle || 0;
        SpaceState.missionTime = data.missionTime || 0;
        SpaceState.stageSeparated = !!data.stageSeparated;
        SpaceState.solarArraysDeployed = !!data.solarArraysDeployed;
        SpaceState.soundMuted = !!data.soundMuted;
        SpaceState.cameraMode = data.cameraMode || "follow";
        SpaceState.quality = data.quality || "high";

        // Update UI switches
        const muteBtn = document.getElementById("btn-sound-toggle");
        if (muteBtn) {
            muteBtn.innerHTML = SpaceState.soundMuted ? "<span>🔇</span> SOUND OFF" : "<span>🔊</span> SOUND ON";
        }
        const cameraSelect = document.getElementById("camera-select");
        if (cameraSelect) cameraSelect.value = SpaceState.cameraMode;

        const graphicsSelect = document.getElementById("graphics-select");
        if (graphicsSelect) graphicsSelect.value = SpaceState.quality;

        const throttleSlider = document.getElementById("throttle-input");
        if (throttleSlider) {
            SpaceState.throttle = SpaceState.status === "ENGINE IGNITION" ? 15 : 0;
            throttleSlider.value = SpaceState.throttle;
            document.getElementById("throttle-display-val").innerText = `${SpaceState.throttle}%`;
        }

        renderStagesTimeline();
        console.log("Space state restored successfully.");
    } catch (e) {}
}

/* ==========================================================================
   UI UPDATER & RENDERING LOOPS
   ========================================================================== */

function updateTelemetryUI() {
    // Left column stats
    document.getElementById("mission-time").innerText = formatTimeSpan(SpaceState.missionTime);

    // Right column stats
    document.getElementById("tele-altitude").innerText = `${SpaceState.altitude.toFixed(2)} km`;
    document.getElementById("tele-velocity").innerText = `${SpaceState.velocity.toFixed(1)} km/h`;
    document.getElementById("tele-acceleration").innerText = `${SpaceState.acceleration.toFixed(2)} m/s²`;
    document.getElementById("tele-gforce").innerText = `${SpaceState.gForce.toFixed(2)} G`;

    document.getElementById("tele-fuel").innerText = `${SpaceState.fuel.toFixed(2)}%`;
    document.getElementById("tele-fuel-bar").style.width = `${SpaceState.fuel}%`;

    document.getElementById("tele-temp").innerText = `${SpaceState.temp.toFixed(1)}°C`;
    document.getElementById("tele-temp-bar").style.width = `${Math.min(100, (SpaceState.temp / PhysicsConstants.maxTemp) * 100)}%`;

    document.getElementById("tele-pressure").innerText = `${SpaceState.cabinPressure.toFixed(2)} kPa`;
    document.getElementById("tele-battery").innerText = `${SpaceState.battery.toFixed(2)}%`;
    document.getElementById("tele-signal").innerText = `${Math.round(SpaceState.signal)}%`;
    document.getElementById("tele-distance").innerText = `${SpaceState.distance.toFixed(2)} km`;

    // Center HUD lines
    document.getElementById("hud-camera-altitude").innerText = `ALTITUDE: ${SpaceState.altitude.toFixed(2)} km`;
    document.getElementById("hud-flight-path").innerText = `FLIGHT_PATH: ${SpaceState.status}`;
    document.getElementById("hud-vibration-factor").innerText = `VIBRATION_HZ: ${SpaceState.engineIgnited ? (12 + SpaceState.throttle / 4).toFixed(1) : "nominal"}`;

    // Angle read-out
    document.getElementById("dir-deg-read").innerText = `${SpaceState.trajectoryAngle}°`;
}

function renderStagesTimeline() {
    const container = document.getElementById("stages-timeline-container");
    if (!container) return;

    container.innerHTML = "";

    // Determine numerical level of active stage
    const activeIdx = FlightStages.findIndex(s => s.id === SpaceState.status);

    FlightStages.forEach((stage, idx) => {
        let nodeClass = "stage-node upcoming";
        if (SpaceState.status === "ABORTED") {
            nodeClass = "stage-node upcoming";
        } else if (idx < activeIdx) {
            nodeClass = "stage-node completed";
        } else if (idx === activeIdx) {
            nodeClass = "stage-node active";
        }

        const node = document.createElement("div");
        node.className = nodeClass;
        node.innerHTML = `
            <div class="stage-indicator"></div>
            <div class="stage-info">
                <span class="stage-name">${stage.name}</span>
                <span class="stage-desc">${stage.desc}</span>
            </div>
        `;
        container.appendChild(node);
    });
}

function formatTimeSpan(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/* ==========================================================================
   INPUTS CONTROLLERS BINDING
   ========================================================================== */

function setupInputs() {
    // 1. Controls Panel Countdowns
    const btnStart = document.getElementById("btn-count-start");
    const btnPause = document.getElementById("btn-count-pause");
    const btnResume = document.getElementById("btn-count-resume");
    const btnReset = document.getElementById("btn-count-reset");

    if (btnStart) {
        btnStart.addEventListener("click", () => {
            if (SpaceState.status !== "PRE-LAUNCH") return;
            initAudio();
            setFlightStage("COUNTDOWN");
            SpaceState.isCountdownActive = true;
            btnStart.style.display = "none";
            btnPause.style.display = "block";
            btnPause.disabled = false;
            playSynthBeep(440, 0.2);
        });
    }

    if (btnPause) {
        btnPause.addEventListener("click", () => {
            SpaceState.isPaused = true;
            btnPause.style.display = "none";
            btnResume.style.display = "block";
            playSynthBeep(330, 0.2);
        });
    }

    if (btnResume) {
        btnResume.addEventListener("click", () => {
            SpaceState.isPaused = false;
            btnResume.style.display = "none";
            btnPause.style.display = "block";
            playSynthBeep(440, 0.2);
        });
    }

    if (btnReset) {
        btnReset.addEventListener("click", () => {
            performFullReset();
        });
    }

    // 2. Flight Panel manual controls
    const btnEngine = document.getElementById("btn-manual-engine");
    const btnComm = document.getElementById("btn-manual-comm");
    const btnStage = document.getElementById("btn-manual-stage");
    const btnResetMatrix = document.getElementById("btn-manual-reset");

    if (btnEngine) {
        btnEngine.addEventListener("click", () => {
            initAudio();
            SpaceState.engineIgnited = !SpaceState.engineIgnited;
            if (SpaceState.engineIgnited) {
                if (SpaceState.throttle === 0) SpaceState.throttle = 15;
                playSynthBeep(180, 0.5);
            } else {
                playSynthBeep(120, 0.5);
            }
            updateEngineSound();
        });
    }

    if (btnComm) {
        btnComm.addEventListener("click", () => {
            SpaceState.commActive = !SpaceState.commActive;
            playSynthBeep(SpaceState.commActive ? 600 : 300, 0.1);
        });
    }

    if (btnStage) {
        btnStage.addEventListener("click", () => {
            triggerStageSeparation();
        });
    }

    if (btnResetMatrix) {
        btnResetMatrix.addEventListener("click", () => {
            performFullReset();
        });
    }

    // Throttle range slider
    const slider = document.getElementById("throttle-input");
    const label = document.getElementById("throttle-display-val");
    if (slider) {
        slider.addEventListener("input", (e) => {
            initAudio();
            SpaceState.throttle = parseInt(e.target.value);
            if (SpaceState.throttle > 0 && !SpaceState.engineIgnited) {
                SpaceState.engineIgnited = true;
            } else if (SpaceState.throttle === 0) {
                SpaceState.engineIgnited = false;
            }
            if (label) label.innerText = `${SpaceState.throttle}%`;
            updateEngineSound();
        });
    }

    // Throttle Step triggers
    const btnThrotUp = document.getElementById("btn-throttle-up");
    const btnThrotDn = document.getElementById("btn-throttle-down");

    if (btnThrotUp) {
        btnThrotUp.addEventListener("click", () => {
            initAudio();
            SpaceState.throttle = Math.min(100, SpaceState.throttle + 10);
            if (slider) slider.value = SpaceState.throttle;
            if (label) label.innerText = `${SpaceState.throttle}%`;
            if (SpaceState.throttle > 0) SpaceState.engineIgnited = true;
            updateEngineSound();
            playSynthBeep(500, 0.1);
        });
    }

    if (btnThrotDn) {
        btnThrotDn.addEventListener("click", () => {
            initAudio();
            SpaceState.throttle = Math.max(0, SpaceState.throttle - 10);
            if (slider) slider.value = SpaceState.throttle;
            if (label) label.innerText = `${SpaceState.throttle}%`;
            if (SpaceState.throttle === 0) SpaceState.engineIgnited = false;
            updateEngineSound();
            playSynthBeep(400, 0.1);
        });
    }

    // Trajectory steering triggers
    const btnDirL = document.getElementById("btn-dir-left");
    const btnDirR = document.getElementById("btn-dir-right");
    const btnDirU = document.getElementById("btn-dir-up");
    const btnDirD = document.getElementById("btn-dir-down");

    if (btnDirL) {
        btnDirL.addEventListener("click", () => {
            SpaceState.trajectoryAngle = Math.max(-180, SpaceState.trajectoryAngle - 5);
            playSynthBeep(440, 0.05);
        });
    }
    if (btnDirR) {
        btnDirR.addEventListener("click", () => {
            SpaceState.trajectoryAngle = Math.min(180, SpaceState.trajectoryAngle + 5);
            playSynthBeep(440, 0.05);
        });
    }
    if (btnDirU) {
        btnDirU.addEventListener("click", () => {
            SpaceState.trajectoryAngle = Math.min(180, SpaceState.trajectoryAngle + 5);
            playSynthBeep(440, 0.05);
        });
    }
    if (btnDirD) {
        btnDirD.addEventListener("click", () => {
            SpaceState.trajectoryAngle = Math.max(-180, SpaceState.trajectoryAngle - 5);
            playSynthBeep(440, 0.05);
        });
    }

    // Abort triggers
    const btnAbort = document.getElementById("btn-manual-abort");
    if (btnAbort) {
        btnAbort.addEventListener("click", () => {
            triggerAbortSequence();
        });
    }

    // Camera & Quality selector bindings
    const cameraSelect = document.getElementById("camera-select");
    if (cameraSelect) {
        cameraSelect.addEventListener("change", (e) => {
            SpaceState.cameraMode = e.target.value;
            playSynthBeep(500, 0.1);
        });
    }

    const graphicsSelect = document.getElementById("graphics-select");
    if (graphicsSelect) {
        graphicsSelect.addEventListener("change", (e) => {
            SpaceState.quality = e.target.value;
            playSynthBeep(500, 0.1);
        });
    }

    // Sound toggle buttons
    const btnSound = document.getElementById("btn-sound-toggle");
    if (btnSound) {
        btnSound.addEventListener("click", () => {
            SpaceState.soundMuted = !SpaceState.soundMuted;
            if (SpaceState.soundMuted) {
                btnSound.innerHTML = "<span>🔇</span> SOUND OFF";
                if (engineGain) engineGain.gain.setValueAtTime(0, audioCtx.currentTime);
                if (staticGain) staticGain.gain.setValueAtTime(0, audioCtx.currentTime);
            } else {
                btnSound.innerHTML = "<span>🔊</span> SOUND ON";
                initAudio();
                updateEngineSound();
            }
        });
    }

    // Mobile specific triggers
    const mLaunch = document.getElementById("mobile-btn-launch");
    const mPause = document.getElementById("mobile-btn-pause");
    const mResume = document.getElementById("mobile-btn-resume");
    const mEngine = document.getElementById("mobile-btn-engine");
    const mComm = document.getElementById("mobile-btn-comm");
    const mStage = document.getElementById("mobile-btn-stage");
    const mTUp = document.getElementById("mobile-btn-tup");
    const mTDn = document.getElementById("mobile-btn-tdown");
    const mLeft = document.getElementById("mobile-btn-left");
    const mRight = document.getElementById("mobile-btn-right");
    const mAbort = document.getElementById("mobile-btn-abort");

    if (mLaunch) {
        mLaunch.addEventListener("click", () => {
            if (btnStart) btnStart.click();
        });
    }
    if (mPause) {
        mPause.addEventListener("click", () => {
            SpaceState.isPaused = true;
            mPause.style.display = "none";
            if (mResume) mResume.style.display = "block";
        });
    }
    if (mResume) {
        mResume.addEventListener("click", () => {
            SpaceState.isPaused = false;
            mResume.style.display = "none";
            if (mPause) mPause.style.display = "block";
        });
    }
    if (mEngine) {
        mEngine.addEventListener("click", () => {
            if (btnEngine) btnEngine.click();
        });
    }
    if (mComm) {
        mComm.addEventListener("click", () => {
            if (btnComm) btnComm.click();
        });
    }
    if (mStage) {
        mStage.addEventListener("click", () => {
            if (btnStage) btnStage.click();
        });
    }
    if (mTUp) {
        mTUp.addEventListener("click", () => {
            if (btnThrotUp) btnThrotUp.click();
        });
    }
    if (mTDn) {
        mTDn.addEventListener("click", () => {
            if (btnThrotDn) btnThrotDn.click();
        });
    }
    if (mLeft) {
        mLeft.addEventListener("click", () => {
            if (btnDirL) btnDirL.click();
        });
    }
    if (mRight) {
        mRight.addEventListener("click", () => {
            if (btnDirR) btnDirR.click();
        });
    }
    if (mAbort) {
        mAbort.addEventListener("click", () => {
            triggerAbortSequence();
        });
    }

    // Keyboard bindings listener
    document.addEventListener("keydown", (e) => {
        // Prevent action inside inputs
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;

        switch (e.key.toLowerCase()) {
            case " ":
                e.preventDefault();
                initAudio();
                if (SpaceState.status === "PRE-LAUNCH") {
                    if (btnStart) btnStart.click();
                } else {
                    SpaceState.isPaused = !SpaceState.isPaused;
                    if (SpaceState.isPaused) {
                        if (btnPause) btnPause.style.display = "none";
                        if (btnResume) btnResume.style.display = "block";
                    } else {
                        if (btnResume) btnResume.style.display = "none";
                        if (btnPause) btnPause.style.display = "block";
                    }
                }
                playSynthBeep(440, 0.1);
                break;
            case "arrowup":
                e.preventDefault();
                if (btnThrotUp) btnThrotUp.click();
                break;
            case "arrowdown":
                e.preventDefault();
                if (btnThrotDn) btnThrotDn.click();
                break;
            case "arrowleft":
                e.preventDefault();
                if (btnDirL) btnDirL.click();
                break;
            case "arrowright":
                e.preventDefault();
                if (btnDirR) btnDirR.click();
                break;
            case "e":
                if (btnEngine) btnEngine.click();
                break;
            case "c":
                if (btnComm) btnComm.click();
                break;
            case "a":
                triggerAbortSequence();
                break;
            case "m":
                // Set default Orbit view
                if (cameraSelect) {
                    cameraSelect.value = "orbit";
                    SpaceState.cameraMode = "orbit";
                }
                break;
            case "d":
                // Toggle solar panel
                SpaceState.solarArraysDeployed = !SpaceState.solarArraysDeployed;
                playSynthBeep(600, 0.2);
                break;
        }
    });
}

function triggerStageSeparation() {
    if (SpaceState.stageSeparated) return;
    SpaceState.stageSeparated = true;
    playSynthBeep(300, 0.6, "sawtooth", 0.15);

    // Minor physics drop during staging
    SpaceState.velocity = Math.max(0, SpaceState.velocity - 200);

    // Refill minor fuel for next booster stage
    SpaceState.fuel = 100.0;

    // Drop total structural dry mass (booster casing)
    PhysicsConstants.rocketMassDry = 6000;
    PhysicsConstants.rocketMassWet = 40000;

    // Transition state
    setFlightStage("STAGE SEPARATION");
}

function triggerAbortSequence() {
    if (SpaceState.hasAborted) return;
    SpaceState.hasAborted = true;

    // Trigger sound alerts
    playSynthBeep(120, 1.5, "sawtooth", 0.3);

    // Display overlay
    const overlay = document.getElementById("abort-warning-overlay");
    if (overlay) overlay.style.display = "flex";

    // Set stage
    setFlightStage("ABORTED");

    // Decouple physics
    SpaceState.throttle = 0;
    SpaceState.engineIgnited = false;
    updateEngineSound();

    // Reset countdown states
    SpaceState.isCountdownActive = false;

    // Reset loop safely after 4 seconds
    setTimeout(() => {
        performFullReset();
        if (overlay) overlay.style.display = "none";
    }, 4500);
}

function performFullReset() {
    SpaceState.status = "PRE-LAUNCH";
    SpaceState.missionTime = 0;
    SpaceState.countdown = 10.0;
    SpaceState.isCountdownActive = false;
    SpaceState.isPaused = false;
    SpaceState.hasAborted = false;

    SpaceState.altitude = 0;
    SpaceState.velocity = 0;
    SpaceState.acceleration = 0;
    SpaceState.gForce = 1.0;
    SpaceState.fuel = 100.0;
    SpaceState.temp = 24.0;
    SpaceState.cabinPressure = 101.32;
    SpaceState.battery = 100.0;
    SpaceState.signal = 100.0;
    SpaceState.distance = 0;
    SpaceState.trajectoryAngle = 0;
    SpaceState.throttle = 0;
    SpaceState.engineIgnited = false;
    SpaceState.stageSeparated = false;
    SpaceState.solarArraysDeployed = false;

    // Reset sliders
    const slider = document.getElementById("throttle-input");
    if (slider) slider.value = 0;
    const label = document.getElementById("throttle-display-val");
    if (label) label.innerText = "0%";

    // Reset buttons
    const btnStart = document.getElementById("btn-count-start");
    if (btnStart) btnStart.style.display = "block";
    const btnPause = document.getElementById("btn-count-pause");
    if (btnPause) btnPause.style.display = "none";
    const btnResume = document.getElementById("btn-count-resume");
    if (btnResume) btnResume.style.display = "none";

    // Reset timeline
    renderStagesTimeline();
    updateTelemetryUI();
    updateEngineSound();

    // Wipe charts history
    SpaceState.history = {
        time: [],
        altitude: [],
        velocity: [],
        fuel: [],
        temp: []
    };

    localStorage.removeItem("COSMO_SAVE_STATE");

    playSynthBeep(440, 0.5, "sine", 0.1);
}

/* ==========================================================================
   INITIALIZATION & MAIN RAF LOOP
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // Avoid double instantiation in iframe/PWA wrappers
    if (window.__spaceSimulatorInitialized) return;
    window.__spaceSimulatorInitialized = true;

    // 1. Core inputs binding
    setupInputs();

    // 2. Stars init
    initStars();

    // 3. Canvas element setup
    const canvas = document.getElementById("space-canvas");
    let ctx = null;
    if (canvas) {
        ctx = canvas.getContext("2d");

        // Resize Handler
        const resizeCanvas = () => {
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = canvas.parentElement.clientHeight || 480;
        };
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
    }

    // 4. State restores from LocalStorage
    loadMissionStateFromDisk();

    // 5. Main loop
    let lastTime = performance.now();

    function loop(now) {
        const dT = Math.min(0.1, (now - lastTime) / 1000.0); // Limit maximum frame skip delta
        lastTime = now;

        // Perform simulation updates if document is active (respect performance rules)
        if (!document.hidden) {
            updatePhysics(dT);
            updateTelemetryUI();

            if (canvas && ctx) {
                drawSpaceTheater(canvas, ctx);
            }
            drawTelemetryGraphs();
        }

        // Periodically write to disk for save states
        if (Math.random() < 0.005) {
            saveMissionStateToDisk();
        }

        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
});