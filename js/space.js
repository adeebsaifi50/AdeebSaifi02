/* ==========================================================================
   SPACE MISSION CONTROL SIMULATION ENGINE — HIGH FIDELITY CORE v3.0 PART 2
   ========================================================================== */

// Global Campaign Missions list (Part 2)
const CampaignMissions = [
    { id: "01", name: "FIRST LAUNCH", objective: "Launch spacecraft and cross atmospheric Max-Q.", reward: "Booster Badge", threshold: 15.0, progress: 0, status: "READY" },
    { id: "02", name: "ORBIT INSERTION", objective: "Climb above LEO boundary (160km) and reach circularization velocity.", reward: "Orbit Badge", threshold: 160.0, progress: 0, status: "LOCKED" },
    { id: "03", name: "SATELLITE DEPLOYMENT", objective: "Unlock satellite systems and circularize orbital path.", reward: "Commander Badge", threshold: 240.0, progress: 0, status: "LOCKED" },
    { id: "04", name: "MOON FLYBY", objective: "Extend trajectory to execute a high flyby around the lunar sphere.", reward: "Moon Pilot Badge", threshold: 350.0, progress: 0, status: "LOCKED" },
    { id: "05", name: "DEEP SPACE", objective: "Trigger propulsion to achieve Earth escape velocity (38,000 km/h).", reward: "Pioneer Badge", threshold: 38000.0, progress: 0, status: "LOCKED" },
    { id: "06", name: "PLANET EXPLORATION", objective: "Navigate coordinate matrices to select and explore fictional planets.", reward: "Galaxy Explorer Medal", threshold: 100.0, progress: 0, status: "LOCKED" }
];

// Fictional Satellites
const SatelliteAssets = [
    { id: "0", name: "ADEEB-SAT 01", orbit: "LOW EARTH ORBIT (LEO)", alt: 320.0, speed: 27500, battery: 100.0, signal: 100.0, temp: 15.0, status: "NOMINAL", deployMode: false },
    { id: "1", name: "ADEEB-SAT 02", orbit: "MID EARTH ORBIT (MEO)", alt: 850.0, speed: 22100, battery: 90.0, signal: 94.0, temp: 12.0, status: "NOMINAL", deployMode: true },
    { id: "2", name: "ADEEB-SAT 03", orbit: "GEOSTATIONARY (GEO)", alt: 35780.0, speed: 11050, battery: 100.0, signal: 88.0, temp: 8.0, status: "NOMINAL", deployMode: false }
];

// Fictional Planets
const PlanetAssets = [
    { id: "0", name: "AURELIA", dist: "3.4 AU", gravity: "0.88 G", temp: "-14.0°C", atmosphere: "N2/CO2 Dense", resources: "Helium-3, Water", exploration: 14 },
    { id: "1", name: "VYRON", dist: "7.1 AU", gravity: "1.42 G", temp: "155.0°C", atmosphere: "Methane Cloud", resources: "Heavy Metals, Quartz", exploration: 0 },
    { id: "2", name: "NOVA-7", dist: "15.9 AU", gravity: "0.15 G", temp: "-225.0°C", atmosphere: "Vacuum", resources: "Frozen Neon, Xenon", exploration: 0 }
];

// Fictional Achievements
const AchievementsList = [
    { key: "first_launch", title: "🏆 First Launch", desc: "Initiate engine liftoff sequence", unlocked: false },
    { key: "orbit_achieved", title: "🏆 Orbit Achieved", desc: "Cross the circular low Earth boundary", unlocked: false },
    { key: "sat_commander", title: "🏆 Satellite Commander", desc: "Deploy solar arrays or adjust orbits", unlocked: false },
    { key: "moon_explorer", title: "🏆 Moon Explorer", desc: "Reach lunar transit distances", unlocked: false },
    { key: "deep_space_pioneer", title: "🏆 Deep Space Pioneer", desc: "Cruising into Deep Space Mode", unlocked: false },
    { key: "perfect_mission", title: "🏆 Perfect Mission", desc: "No critical warnings logged", unlocked: false },
    { key: "crisis_manager", title: "🏆 Crisis Manager", desc: "Recover from random system warnings", unlocked: false }
];

// Global state container
const SpaceState = {
    // Current Active Workspace Tab
    activeWorkspace: "mission", // mission, satellite, planet, archives, freeplay

    // Campaign Details
    currentMissionIndex: 0,
    activeSatIndex: 0,
    activePlanetIndex: 0,
    decisionsCount: 0,
    warningsCount: 0,
    isFreePlay: false,

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
    trajectoryAngle: 0, // degrees deviation (0 is vertical, positive is right/east)
    throttle: 0, // 0 to 100 percentage
    engineIgnited: false,
    commActive: true,
    stageSeparated: false,
    solarArraysDeployed: false,

    // Detailed manual calibrators sliders (Part 2)
    calibrators: {
        throttle: 0,
        power: 100,
        comm: 100,
        nav: 50,
        cooling: 30
    },

    // Space Weather Metrics (Part 2)
    spaceWeather: "SUN NOMINAL", // SUN NOMINAL, SOLAR STIMULUS, METEOR SHOWER, SOLAR FLARE, RADIATION SPIKE

    // Graphics, Selected Views & Preferences
    cameraMode: "mission", // mission, rocket, orbit, satellite, moon, deep, planet, cinematic
    currentScale: 0.85, // for smooth camera transitions
    currentCameraY: 290, // for smooth camera transitions
    currentCameraX: 400, // for smooth camera transitions
    quality: "high", // high, medium, low, auto
    soundMuted: false,
    activeTab: "altitude", // altitude, velocity, fuel, temperature, signal

    // Telemetry History (for charts)
    history: {
        time: [],
        altitude: [],
        velocity: [],
        fuel: [],
        temp: [],
        signal: []
    }
};

// Simulation Constants
const PhysicsConstants = {
    g0: 9.81, // Standard Earth gravity m/s²
    re: 6371.0, // Earth radius in km
    atmScaleHeight: 8.5, // Atmospheric scale height in km
    rocketMassDry: 12000, // kg
    rocketMassWet: 85000, // kg
    maxThrust: 18.5, // m/s² acceleration at 100% throttle
    burnRate: 0.15, // % fuel burn per second at 100% throttle
    maxTemp: 1800, // °C
    coolingRate: 0.8, // °C cooled per second
    solarChargeRate: 0.05, // % battery gain per second in orbit
    batteryDrainRate: 0.02, // % battery drain per second
};

// Sequence stages metadata
const FlightStages = [
    { id: "PRE-LAUNCH", name: "Pre-Launch", desc: "System checks nominal. Target satellite on launchpad." },
    { id: "COUNTDOWN", name: "Countdown Sequence", desc: "Terminal countdown in progress." },
    { id: "ENGINE IGNITION", name: "Engine Ignition", desc: "Main engine core ignition." },
    { id: "LIFTOFF", name: "Liftoff", desc: "Successful tower clearance achieved." },
    { id: "ASCENT", name: "Ascent Phase", desc: "Gravity turn initiated. Ascending lower atmosphere." },
    { id: "ATMOSPHERIC FLIGHT", name: "Atmospheric Max-Q", desc: "Maximum aerodynamic pressure." },
    { id: "STAGE SEPARATION", name: "Stage Separation", desc: "Booster separation. Second stage active." },
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

        // Deep heavy engine rumble synthesizer
        engineOsc = audioCtx.createOscillator();
        engineGain = audioCtx.createGain();

        engineOsc.type = "sawtooth";
        engineOsc.frequency.setValueAtTime(45, audioCtx.currentTime);

        const lpFilter = audioCtx.createBiquadFilter();
        lpFilter.type = "lowpass";
        lpFilter.frequency.setValueAtTime(95, audioCtx.currentTime);

        engineOsc.connect(lpFilter);
        lpFilter.connect(engineGain);
        engineGain.connect(audioCtx.destination);

        engineGain.gain.setValueAtTime(0, audioCtx.currentTime);
        engineOsc.start();

        // Background white noise generator representing solar-radiation/interstellar static
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
        staticGain.gain.setValueAtTime(0.005, audioCtx.currentTime);

        staticNode.connect(staticGain);
        staticGain.connect(audioCtx.destination);
        staticNode.start();

    } catch (e) {
        console.error("Audio Context initialization failed:", e);
    }
}

// Procedural Web Audio Beeps
function playSynthBeep(freq, duration, type = "sine", gainVal = 0.08) {
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
            const density = Math.exp(-SpaceState.altitude / PhysicsConstants.atmScaleHeight);
            const volumeFactor = 0.25 + 0.75 * density;
            const targetGain = (SpaceState.throttle / 100) * 0.15 * volumeFactor;
            engineGain.gain.setTargetAtTime(targetGain, audioCtx.currentTime, 0.1);

            const targetFreq = 40 + (SpaceState.throttle / 100) * 35;
            engineOsc.frequency.setTargetAtTime(targetFreq, audioCtx.currentTime, 0.2);
        } else {
            engineGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.15);
        }

        if (SpaceState.commActive) {
            const staticVolume = 0.002 + (1.0 - (SpaceState.signal / 100)) * 0.015;
            staticGain.gain.setTargetAtTime(staticVolume, audioCtx.currentTime, 0.5);
        } else {
            staticGain.gain.setTargetAtTime(0.035, audioCtx.currentTime, 0.1);
        }
    } catch (e) {}
}

/* ==========================================================================
   LIVE EVENT LOGGER & CHAT FLUID COMPONENT
   ========================================================================== */

function logEvent(msg, type = "system") {
    const logBox = document.getElementById("event-stream-logs");
    if (!logBox) return;

    const entry = document.createElement("div");
    entry.className = `log-entry ${type}`;

    // UTC/sim timestamp format
    const timeStr = formatTimeSpan(SpaceState.missionTime);
    entry.innerHTML = `<span class="log-time">[${timeStr}]</span> ${msg}`;

    logBox.appendChild(entry);
    logBox.scrollTop = logBox.scrollHeight;

    // Prune entries to keep history light
    const entries = logBox.getElementsByClassName("log-entry");
    if (entries.length > 50) {
        logBox.removeChild(entries[0]);
    }
}

// AI Message sequence dispatcher
function triggerAIOfficerMessage(msg) {
    const textEl = document.getElementById("ai-officer-text");
    if (textEl) {
        textEl.style.opacity = 0;
        setTimeout(() => {
            textEl.innerText = msg;
            textEl.style.opacity = 1;
        }, 200);
    }
}

/* ==========================================================================
   STATE STAGE CONTROL
   ========================================================================== */

function setFlightStage(stageId) {
    if (FlightStages.findIndex(s => s.id === stageId) === -1 && stageId !== "ABORTED") return;
    SpaceState.status = stageId;

    // Render updates
    renderStagesTimeline();
    updateStatusBadge();

    // Trigger AI message & Audio Chime Alerts
    if (stageId === "PRE-LAUNCH") {
        triggerAIOfficerMessage("SYSTEMS Nominal. WAITING FOR TERMINAL COUNTDOWN START COMMAND.");
        logEvent("PRE-LAUNCH checks complete. Launch vehicle ready.", "nominal");
    } else if (stageId === "COUNTDOWN") {
        triggerAIOfficerMessage("COUNTDOWN INITIATED. CORE IGNITION MATRIX IS ON AUTO-STANDBY.");
        logEvent("Terminal countdown sequence initiated.", "system");
    } else if (stageId === "ENGINE IGNITION") {
        playSynthBeep(180, 1.2, "sawtooth", 0.15);
        triggerAIOfficerMessage("BOOSTER IGNITION SEQUENCE CONFIRMED. STEERING GIMBAL ALIGNING.");
        logEvent("Booster engine ignition sequence nominal.", "nominal");
    } else if (stageId === "LIFTOFF") {
        unlockAchievement("first_launch");
        playSynthBeep(440, 1.0, "sine", 0.2);
        playSynthBeep(880, 0.5, "sine", 0.1);
        triggerAIOfficerMessage("LIFTOFF! WE HAVE A LIFTOFF OF THE COSMO SATELLITE ORBITER.");
        logEvent("LIFTOFF confirmed. Main tower cleared.", "nominal");
    } else if (stageId === "ASCENT") {
        triggerAIOfficerMessage("ASCENDING LOWER STRATOSPHERE. INITIATING BALLISTIC GRAVITY TURN.");
        logEvent("Entering lower stratosphere. Pitch deviation tracking nominal.", "system");
    } else if (stageId === "ATMOSPHERIC FLIGHT") {
        triggerAIOfficerMessage("WARNING: ENTERING HIGH AERODYNAMIC DRAG REGION. MONITOR G-FORCE.");
        logEvent("Atmospheric Max-Q threshold encountered.", "warning");
    } else if (stageId === "STAGE SEPARATION") {
        playSynthBeep(600, 0.8, "triangle", 0.12);
        triggerAIOfficerMessage("BOOSTER DECOUPLING SECURED. UPPER STAGE VACUUM ENGINE START.");
        logEvent("First-stage booster decoupled. Second stage operational.", "nominal");
    } else if (stageId === "ORBIT INSERTION") {
        triggerAIOfficerMessage("ENTERING VACUUM ORBIT PATH. STEERING APOGEE CIRCULARIZATION.");
        logEvent("Approaching transfer orbital apogee.", "system");
    } else if (stageId === "ORBIT") {
        unlockAchievement("orbit_achieved");
        playSynthBeep(523.25, 0.4, "sine", 0.12);
        setTimeout(() => playSynthBeep(659.25, 0.4, "sine", 0.12), 150);
        setTimeout(() => playSynthBeep(783.99, 0.7, "sine", 0.12), 300);
        triggerAIOfficerMessage("STABLE EARTH ORBIT ACHIEVED! DEPLOYING SOLAR MATRIX ANTENNAS.");
        logEvent("Stable orbit established. Solar tracking array deployed.", "nominal");
    } else if (stageId === "DEEP SPACE") {
        unlockAchievement("deep_space_pioneer");
        triggerAIOfficerMessage("ESCAPING LOW EARTH ORBIT. DEEP SPACE CRUISE ENGAGED.");
        logEvent("Earth escape velocity achieved. Cruising deep-space telemetry plot.", "nominal");
    } else if (stageId === "MISSION COMPLETE") {
        const chime = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50];
        chime.forEach((f, idx) => {
            setTimeout(() => playSynthBeep(f, 0.35, "sine", 0.1), idx * 110);
        });
        triggerAIOfficerMessage("COSMO-760228 PAYLOAD HAS BEEN DELIVERED. MISSION COMPLETED!");
        logEvent("Payload deployment fully secured. All systems green.", "nominal");

        // Open Statistics Dialog Modal (Part 2)
        showMissionStatsDialog();
    }

    const stageBtn = document.getElementById("btn-manual-stage");
    if (stageBtn) {
        stageBtn.disabled = !(stageId === "ASCENT" || stageId === "ATMOSPHERIC FLIGHT");
    }
}

function updateStatusBadge() {
    const badge = document.getElementById("mission-status-badge");
    if (!badge) return;

    badge.className = "status-badge";
    if (SpaceState.hasAborted) {
        badge.innerText = "🚨 ABORT SEQUENCE INITIATED";
        badge.className = "status-badge glow-red";
    } else if (SpaceState.temp > 1200 || SpaceState.fuel < 10) {
        badge.innerText = "🔴 CRITICAL WARNING";
        badge.className = "status-badge glow-red";
    } else if (SpaceState.temp > 800 || SpaceState.battery < 20 || SpaceState.signal < 30) {
        badge.innerText = "🟡 WARNING - MONITOR TELEMETRY";
        badge.className = "status-badge glow-orange";
    } else {
        badge.innerText = "🟢 SYSTEMS NOMINAL";
        badge.className = "status-badge glow-green";
    }
}

/* ==========================================================================
   PHYSICS STATE ENGINE
   ========================================================================== */

function updatePhysics(dT) {
    if (SpaceState.isPaused || SpaceState.status === "PRE-LAUNCH" || SpaceState.status === "ABORTED") {
        return;
    }

    // 1. Manage countdown terminal sequence
    if (SpaceState.status === "COUNTDOWN") {
        const prevSecond = Math.ceil(SpaceState.countdown);
        SpaceState.countdown -= dT;
        const currentSecond = Math.ceil(SpaceState.countdown);

        // Audio tick beeps
        if (currentSecond < prevSecond && currentSecond > 0) {
            playSynthBeep(880, 0.1, "sine", 0.12);
            logEvent(`T-Minus ${currentSecond}...`, "system");
        }

        if (SpaceState.countdown <= 3.0 && !SpaceState.engineIgnited) {
            SpaceState.engineIgnited = true;
            SpaceState.throttle = 15;
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

    // Incremental clock time
    SpaceState.missionTime += dT;

    // Sub-system calibrators affects (Part 2)
    const effectiveThrottle = Math.max(SpaceState.throttle, SpaceState.calibrators.throttle);

    // Fuel usage mechanics
    let currentMass = PhysicsConstants.rocketMassDry;
    if (SpaceState.fuel > 0) {
        const fuelUsed = PhysicsConstants.burnRate * (effectiveThrottle / 100) * dT;
        SpaceState.fuel = Math.max(0.0, SpaceState.fuel - fuelUsed);
        currentMass += (PhysicsConstants.rocketMassWet - PhysicsConstants.rocketMassDry) * (SpaceState.fuel / 100);
    } else {
        if (SpaceState.throttle > 0) {
            SpaceState.throttle = 0;
            SpaceState.engineIgnited = false;
            logEvent("CRITICAL: Fuel starvation encountered. Booster shutdown.", "critical");
            triggerAIOfficerMessage("CRITICAL ERROR: PROPULSION DEPLETED. POWER LOSS.");
        }
    }

    // Thrust vector calculation
    let thrustAccel = 0;
    if (SpaceState.engineIgnited && effectiveThrottle > 0 && SpaceState.fuel > 0) {
        thrustAccel = (effectiveThrottle / 100) * PhysicsConstants.maxThrust * (PhysicsConstants.rocketMassWet / currentMass);
    }

    const currentGravity = PhysicsConstants.g0 * Math.pow(PhysicsConstants.re / (PhysicsConstants.re + SpaceState.altitude), 2);
    const airDensity = 1.225 * Math.exp(-SpaceState.altitude / PhysicsConstants.atmScaleHeight);
    const dragCoeff = SpaceState.stageSeparated ? 0.12 : 0.25;
    const dragForceFactor = 0.0000045 * airDensity * dragCoeff;
    const dragAccel = dragForceFactor * Math.pow(SpaceState.velocity, 2);

    // Resolve vector angle components
    const angleRad = (SpaceState.trajectoryAngle * Math.PI) / 180.0;
    const accelVertical = thrustAccel * Math.cos(angleRad) - currentGravity - (dragAccel * Math.cos(angleRad));
    const accelHorizontal = thrustAccel * Math.sin(angleRad) - (dragAccel * Math.sin(angleRad));

    const netAccel = Math.sqrt(accelVertical * accelVertical + accelHorizontal * accelHorizontal);
    SpaceState.acceleration = accelVertical >= 0 || SpaceState.velocity > 0 ? accelVertical : 0;
    SpaceState.gForce = 1.0 + (netAccel / PhysicsConstants.g0);

    const prevVelocityKmS = (SpaceState.velocity) / 3600.0;
    let velVertKmH = prevVelocityKmS * Math.cos(angleRad) * 3600.0 + (accelVertical * dT * 3.6);
    let velHorizKmH = prevVelocityKmS * Math.sin(angleRad) * 3600.0 + (accelHorizontal * dT * 3.6);

    // Sitting on launchpad lock
    if (SpaceState.altitude === 0 && accelVertical <= 0) {
        velVertKmH = 0;
        velHorizKmH = 0;
        SpaceState.acceleration = 0;
        SpaceState.gForce = 1.0;
    }

    SpaceState.velocity = Math.max(0, Math.sqrt(velVertKmH * velVertKmH + velHorizKmH * velHorizKmH));
    const altitudeGain = (velVertKmH / 3600.0) * dT;
    SpaceState.altitude = Math.max(0.0, SpaceState.altitude + altitudeGain);

    const distanceGain = Math.abs(velHorizKmH / 3600.0) * dT;
    SpaceState.distance += Math.sqrt(altitudeGain * altitudeGain + distanceGain * distanceGain);

    // Thermal limits modified by Cooling regulator (Part 2)
    const coolingFactor = SpaceState.calibrators.cooling / 30.0;
    const targetTemp = 24.0 + (effectiveThrottle / 100) * 1150 + (airDensity * Math.pow(SpaceState.velocity / 1000, 2) * 75);
    if (SpaceState.temp < targetTemp) {
        SpaceState.temp = Math.min(PhysicsConstants.maxTemp, SpaceState.temp + (130 * dT / coolingFactor));
    } else {
        SpaceState.temp = Math.max(24.0, SpaceState.temp - (PhysicsConstants.coolingRate * dT * coolingFactor));
    }

    // Space weather impacts on Telemetry (Part 2)
    if (SpaceState.spaceWeather === "SOLAR FLARE") {
        SpaceState.temp = Math.min(PhysicsConstants.maxTemp, SpaceState.temp + (15 * dT));
        SpaceState.signal = Math.max(5, SpaceState.signal - (8 * dT));
    } else if (SpaceState.spaceWeather === "RADIATION SPIKE") {
        SpaceState.battery = Math.max(0, SpaceState.battery - (4 * dT));
        SpaceState.signal = Math.max(2, SpaceState.signal - (15 * dT));
    }

    // Warn of thermal warning threshold
    if (SpaceState.temp > 1200 && Math.random() < 0.01) {
        SpaceState.warningsCount++;
        logEvent("WARNING: Heavy compressional friction. Core thermal boundaries reached.", "critical");
    }

    SpaceState.cabinPressure = Math.max(0, 101.32 * Math.exp(-SpaceState.altitude / PhysicsConstants.atmScaleHeight));

    // Solar Arrays & battery matching Power Slider
    const powerLevelFactor = SpaceState.calibrators.power / 100.0;
    if (SpaceState.solarArraysDeployed) {
        SpaceState.battery = Math.min(100.0, SpaceState.battery + (PhysicsConstants.solarChargeRate * dT * powerLevelFactor));
    } else {
        SpaceState.battery = Math.max(0.0, SpaceState.battery - (PhysicsConstants.batteryDrainRate * dT / powerLevelFactor));
    }

    // Communication signal decay matching Comm Slider
    const commLevelFactor = SpaceState.calibrators.comm / 100.0;
    const signalLoss = (SpaceState.distance / 1500.0);
    SpaceState.signal = SpaceState.commActive ? Math.max(8, (100 - signalLoss) * commLevelFactor) : 0;

    // Automatic flight progression levels
    if (SpaceState.status === "LIFTOFF" && SpaceState.altitude > 0.5) {
        setFlightStage("ASCENT");
    } else if (SpaceState.status === "ASCENT" && SpaceState.altitude > 12.0) {
        setFlightStage("ATMOSPHERIC FLIGHT");
    } else if (SpaceState.status === "ATMOSPHERIC FLIGHT" && SpaceState.altitude > 45.0) {
        setFlightStage("STAGE SEPARATION");
        logEvent("ACTION REQUIRED: Booster fuel depleted. Trigger STAGE SEPARATION manually.", "warning");
    } else if (SpaceState.status === "STAGE SEPARATION" && SpaceState.stageSeparated && SpaceState.altitude > 100.0) {
        setFlightStage("ORBIT INSERTION");
    } else if (SpaceState.status === "ORBIT INSERTION" && SpaceState.velocity > 26500 && SpaceState.altitude > 180.0) {
        setFlightStage("ORBIT");
        SpaceState.solarArraysDeployed = true;
    } else if (SpaceState.status === "ORBIT" && SpaceState.velocity > 38000) {
        setFlightStage("DEEP SPACE");
    } else if (SpaceState.status === "DEEP SPACE" && SpaceState.distance > 3800.0) {
        setFlightStage("MISSION COMPLETE");
    }

    // Campaign Objectives Progress update (Part 2)
    if (!SpaceState.isFreePlay) {
        updateCampaignProgress();
    }

    // Local rule-based Mission AI recommendations (Part 2)
    updateAICoPilotDiagnostics();

    // Random failure injector (Part 2)
    if (Math.random() < 0.0015 && SpaceState.status !== "PRE-LAUNCH" && SpaceState.status !== "COUNTDOWN" && SpaceState.status !== "MISSION COMPLETE" && !SpaceState.isPaused) {
        triggerRandomSystemEvent();
    }

    updateEngineSound();
    saveHistoryStats();
}

/* ==========================================================================
   PART 2 CAMPAIGN OBJECTIVE PROGRESS UPDATES
   ========================================================================== */

function updateCampaignProgress() {
    const activeMission = CampaignMissions[SpaceState.currentMissionIndex];
    let rawProg = 0;

    if (SpaceState.currentMissionIndex === 0) {
        // FIRST LAUNCH: Cross atmospheric drag threshold
        rawProg = (SpaceState.altitude / activeMission.threshold) * 100;
    } else if (SpaceState.currentMissionIndex === 1) {
        // ORBIT INSERTION: Climb above 160km Low Earth Orbit
        rawProg = (SpaceState.altitude / activeMission.threshold) * 100;
    } else if (SpaceState.currentMissionIndex === 2) {
        // SATELLITE DEPLOYMENT: Cross 240km altitude apogee
        rawProg = (SpaceState.altitude / activeMission.threshold) * 100;
    } else if (SpaceState.currentMissionIndex === 3) {
        // MOON FLYBY: Cross 350km altitude
        rawProg = (SpaceState.altitude / activeMission.threshold) * 100;
    } else if (SpaceState.currentMissionIndex === 4) {
        // DEEP SPACE: Climb speed up to 38000 km/h
        rawProg = (SpaceState.velocity / activeMission.threshold) * 100;
    } else if (SpaceState.currentMissionIndex === 5) {
        // PLANET EXPLORATION: Scan Aurelia planet progress
        rawProg = PlanetAssets[0].exploration;
    }

    activeMission.progress = Math.min(100, Math.max(0, Math.floor(rawProg)));

    // Auto-advance unlock of next mission node
    if (activeMission.progress >= 100 && activeMission.status !== "COMPLETED") {
        activeMission.status = "COMPLETED";
        logEvent(`CAMPAIGN MISSION ${activeMission.id} SECURED! REWARD UNLOCKED: ${activeMission.reward}.`, "nominal");
        playSynthBeep(880, 0.4, "sine");

        // Unlock next campaign mission node
        if (SpaceState.currentMissionIndex + 1 < CampaignMissions.length) {
            CampaignMissions[SpaceState.currentMissionIndex + 1].status = "READY";
        }

        renderCampaignMissionsList();
    }

    // Draw progression variables on Left Panel
    const progBar = document.getElementById("active-objective-progress-bar");
    if (progBar) progBar.style.width = `${activeMission.progress}%`;
    const pctLbl = document.getElementById("active-objective-pct");
    if (pctLbl) pctLbl.innerText = `${activeMission.progress}%`;
}

function selectCampaignMissionNode(index) {
    if (CampaignMissions[index].status === "LOCKED") {
        playSynthBeep(220, 0.25, "sawtooth");
        logEvent("WARNING: Secure preceding campaign orbit tracks to unlock mission telemetry.", "warning");
        return;
    }

    SpaceState.currentMissionIndex = index;
    const mission = CampaignMissions[index];

    // Set UI displays
    document.getElementById("mission-name").innerText = `COSMO-${mission.id}`;
    document.getElementById("active-objective-text").innerText = mission.objective;
    document.getElementById("active-objective-reward").innerText = `REWARD: ${mission.reward}`;

    renderCampaignMissionsList();
    playSynthBeep(580, 0.1);
    logEvent(`Active orbital objective synchronized: ${mission.name}`, "system");
}

function renderCampaignMissionsList() {
    const container = document.getElementById("campaign-list-container");
    if (!container) return;

    container.innerHTML = "";
    CampaignMissions.forEach((m, idx) => {
        const node = document.createElement("button");
        node.className = `campaign-mission-node ${idx === SpaceState.currentMissionIndex ? "active" : ""} ${m.status === "COMPLETED" ? "completed" : ""} ${m.status === "LOCKED" ? "locked" : ""}`;

        let subText = "Locked Matrix";
        if (m.status === "COMPLETED") subText = "Objective Secured";
        else if (m.status === "READY") subText = `Objective Unlocked • ${m.progress}%`;

        node.innerHTML = `
            <span class="node-title">${m.id}. ${m.name}</span>
            <span class="node-status ${m.status.toLowerCase()}">${m.status}</span>
        `;

        if (m.status !== "LOCKED") {
            node.addEventListener("click", () => selectCampaignMissionNode(idx));
        }

        container.appendChild(node);
    });
}

/* ==========================================================================
   PART 2 LOCAL AI DIAGNOSTICS LOGIC
   ========================================================================== */

function updateAICoPilotDiagnostics() {
    const msgEl = document.getElementById("ai-recommendation-msg");
    if (!msgEl) return;

    let advice = "Simulation metrics nominal. Pitch deviation within safe vectors. Continue core burns.";

    if (SpaceState.hasAborted) {
        advice = "EMERGENCY: Escape towers active. Safe ground reset in progress.";
    } else if (SpaceState.temp > 1200) {
        advice = "CRITICAL: Engine core heating exponentially! Action: Drag down cooling regulator or throttle back power immediately!";
    } else if (SpaceState.fuel < 15 && SpaceState.status !== "MISSION COMPLETE") {
        advice = "ALERT: Propulsion fuel below emergency limits (15%). Thrust capability depleting.";
    } else if (SpaceState.gForce > 6.0) {
        advice = "WARNING: Aerodynamic G-force loads high! Recommend throttle power back to 60% for passenger integrity.";
    } else if (SpaceState.signal < 30 && SpaceState.commActive) {
        advice = "COMM DELAY: Direct telemetry signals weakening. Reroute power to backups or switch on backup Relays.";
    } else if (SpaceState.battery < 20) {
        advice = "POWER FLIGHT: Internal power low! Activate Solar Array Deployment Mode <kbd>D</kbd> instantly.";
    } else if (SpaceState.spaceWeather === "SOLAR FLARE") {
        advice = "WEATHER ALERT: Extreme solar flare active. Reroute backup Cooling cells to protect thermal boundaries.";
    } else if (SpaceState.status === "STAGE SEPARATION" && !SpaceState.stageSeparated) {
        advice = "SEQUENCE TRIGGER: Booster fuel spent. Activate Manual decoupling stage rocket trigger immediately!";
    } else if (SpaceState.status === "ORBIT") {
        advice = "ORBIT NOMINAL: Circular trajectories stable. Mission payloads deployment ready.";
    }

    msgEl.innerHTML = advice;
}

/* ==========================================================================
   PART 2 RANDOM EVENTS & SAFE FAILURE DECISION MAKER
   ========================================================================== */

const SimulatedFailures = [
    {
        title: "⚠️ ENGINE TEMPERATURE HIGH",
        desc: "Booster combustion core boundaries overheating rapidly! Danger of nozzle melt.",
        choices: [
            { text: "REDUCE THROTTLE POWER (60%)", outcome: "Nominal thermal decline. Minor climb delay.", effect: () => { SpaceState.throttle = Math.min(60, SpaceState.throttle); SpaceState.temp -= 250; } },
            { text: "ACTIVATE EMERGENCY COOLING CELLS", outcome: "Cooling system stabilized. Minor battery drain.", effect: () => { SpaceState.temp -= 400; SpaceState.battery = Math.max(10, SpaceState.battery - 15); } },
            { text: "IGNORE SYSTEM WARNING", outcome: "Core thermal limit breached. Minor structural leakage.", effect: () => { SpaceState.temp += 100; SpaceState.warningsCount++; } }
        ]
    },
    {
        title: "⚠️ COMMUNICATION LINE DELAY",
        desc: "Ionospheric solar winds are distorting direct ground telemetry. Command signals dropping.",
        choices: [
            { text: "RESTART CENTRAL ROUTER RELAYS", outcome: "Comm line recalibrated. Telemetry nominal.", effect: () => { SpaceState.signal = Math.min(100, SpaceState.signal + 25); } },
            { text: "SWITCH TO BACKUP FREQUENCY", outcome: "Frequency hop complete. Power grids loaded.", effect: () => { SpaceState.signal = Math.min(100, SpaceState.signal + 40); SpaceState.battery = Math.max(10, SpaceState.battery - 10); } },
            { text: "ABORT MISSION SEQUENCE", outcome: "Abort aborted. Signal remained unstable.", effect: () => { triggerAbortSequence(); } }
        ]
    },
    {
        title: "⚠️ POWER FLIGHT SYSTEM UNSTABLE",
        desc: "Main generator cells experienced transient grid faults. Auxiliary battery drain detected.",
        choices: [
            { text: "REROUTE SOLAR PANEL CORES", outcome: "Power grid bypass nominal. Minor comm interference.", effect: () => { SpaceState.battery = Math.min(100, SpaceState.battery + 20); SpaceState.signal = Math.max(10, SpaceState.signal - 15); } },
            { text: "CYCLE AUXILIARY BUS BREAKER", outcome: "Voltage transient secured.", effect: () => { SpaceState.battery = Math.min(100, SpaceState.battery + 10); } }
        ]
    }
];

function triggerRandomSystemEvent() {
    if (SpaceState.hasAborted || SpaceState.status === "MISSION COMPLETE") return;

    SpaceState.decisionsCount++;
    const idx = Math.floor(Math.random() * SimulatedFailures.length);
    const failure = SimulatedFailures[idx];

    const modal = document.getElementById("system-alert-modal");
    if (!modal) return;

    document.getElementById("alert-title").innerText = failure.title;
    document.getElementById("alert-description").innerText = failure.desc;

    const choiceContainer = document.getElementById("alert-choice-container");
    choiceContainer.innerHTML = "";

    failure.choices.forEach(c => {
        const btn = document.createElement("button");
        btn.className = "choice-btn";
        btn.innerHTML = `
            <span class="choice-label">${c.text}</span>
            <span class="choice-sub">PROBABLE EFFECT: ${c.outcome}</span>
        `;
        btn.addEventListener("click", () => {
            // Apply decision effects
            c.effect();
            modal.style.display = "none";
            logEvent(`DECISION EXECUTED: ${c.text}. Result: ${c.outcome}`, "nominal");
            playSynthBeep(440, 0.15);
            unlockAchievement("crisis_manager");
        });
        choiceContainer.appendChild(btn);
    });

    playSynthBeep(330, 0.8, "sawtooth", 0.15);
    modal.style.display = "flex";
}

/* ==========================================================================
   PART 2 SATELLITE ASSET MANAGER & ACTIONS
   ========================================================================== */

function selectSatelliteAsset(index) {
    SpaceState.activeSatIndex = index;
    const sat = SatelliteAssets[index];

    // Restore buttons active highlights
    for (let i = 0; i < 3; i++) {
        const btn = document.getElementById(`btn-sat-${i}`);
        if (btn) btn.classList.remove("active");
    }
    const activeBtn = document.getElementById(`btn-sat-${index}`);
    if (activeBtn) activeBtn.classList.add("active");

    // Sync Right Panel displays
    document.getElementById("sat-detail-name").innerText = sat.name;
    document.getElementById("sat-detail-orbit").innerText = sat.orbit;
    document.getElementById("sat-detail-alt").innerText = `${sat.alt.toFixed(2)} km`;
    document.getElementById("sat-detail-speed").innerText = `${sat.speed.toLocaleString()} km/h`;
    document.getElementById("sat-detail-battery").innerText = `${sat.battery.toFixed(0)}%`;
    document.getElementById("sat-detail-battery-bar").style.width = `${sat.battery}%`;
    document.getElementById("sat-detail-signal").innerText = `${sat.signal.toFixed(0)}%`;
    document.getElementById("sat-detail-temp").innerText = `${sat.temp.toFixed(1)}°C`;
    document.getElementById("sat-detail-status").innerText = sat.status;

    playSynthBeep(600, 0.08);
}

function adjustSatelliteOrbit(direction) {
    const sat = SatelliteAssets[SpaceState.activeSatIndex];
    if (direction === "up") {
        sat.alt += 45;
        sat.speed = Math.max(5000, sat.speed - 350);
        logEvent(`SATELLITE ACTUATOR: ${sat.name} circular orbit altitude elevated.`, "nominal");
    } else {
        sat.alt = Math.max(160, sat.alt - 45);
        sat.speed += 350;
        logEvent(`SATELLITE ACTUATOR: ${sat.name} orbital boundary declined.`, "warning");
    }
    selectSatelliteAsset(SpaceState.activeSatIndex);
    unlockAchievement("sat_commander");
}

function rotateSatellite() {
    const sat = SatelliteAssets[SpaceState.activeSatIndex];
    sat.temp = Math.min(85, sat.temp + 2.5);
    logEvent(`SATELLITE ACTUATOR: ${sat.name} reaction wheels rotated 15 deg East.`, "nominal");
    selectSatelliteAsset(SpaceState.activeSatIndex);
}

function toggleSatellitePower() {
    const sat = SatelliteAssets[SpaceState.activeSatIndex];
    sat.deployMode = !sat.deployMode;
    sat.battery = sat.deployMode ? Math.min(100, sat.battery + 10) : Math.max(10, sat.battery - 15);
    logEvent(`SATELLITE ACTUATOR: ${sat.name} solar core trackers toggled. Battery level: ${sat.battery.toFixed(0)}%`, "nominal");
    selectSatelliteAsset(SpaceState.activeSatIndex);
}

/* ==========================================================================
   PART 2 PLANET EXPLORATION COMPONENT
   ========================================================================== */

function selectPlanetAsset(index) {
    SpaceState.activePlanetIndex = index;
    const planet = PlanetAssets[index];

    // Highlight left panels buttons
    for (let i = 0; i < 3; i++) {
        const btn = document.getElementById(`btn-planet-${i}`);
        if (btn) btn.classList.remove("active");
    }
    const activeBtn = document.getElementById(`btn-planet-${index}`);
    if (activeBtn) activeBtn.classList.add("active");

    // Sync Right Panel displays
    document.getElementById("planet-detail-name").innerText = planet.name;
    document.getElementById("planet-detail-dist").innerText = planet.dist;
    document.getElementById("planet-detail-gravity").innerText = planet.gravity;
    document.getElementById("planet-detail-temp").innerText = planet.temp;
    document.getElementById("planet-detail-atmo").innerText = planet.atmosphere;
    document.getElementById("planet-detail-resources").innerText = planet.resources;
    document.getElementById("planet-detail-exploration").innerText = `${planet.exploration}%`;
    document.getElementById("planet-detail-exploration-bar").style.width = `${planet.exploration}%`;

    playSynthBeep(650, 0.08);
}

function scanPlanetSurface() {
    const planet = PlanetAssets[SpaceState.activePlanetIndex];
    if (planet.exploration >= 100) {
        logEvent(`PLANET SCANNER: Aurelia surface 100% catalogued. Resources archived.`, "nominal");
        return;
    }

    planet.exploration = Math.min(100, planet.exploration + 15);
    logEvent(`PLANET SCANNER: Mapping surface anomalies of ${planet.name}. Exploration at ${planet.exploration}%.`, "nominal");
    selectPlanetAsset(SpaceState.activePlanetIndex);
    playSynthBeep(880, 0.15, "triangle");
}

function deployPlanetRover() {
    const planet = PlanetAssets[SpaceState.activePlanetIndex];
    logEvent(`SURFACE ROVER: Landed crawler telemetry established on ${planet.name}. Surface coordinates latent.`, "nominal");
    playSynthBeep(520, 0.4, "sine");
}

/* ==========================================================================
   PART 2 ACHIEVEMENTS PERSISTENCE & POPULATION
   ========================================================================== */

function unlockAchievement(key) {
    const item = AchievementsList.find(a => a.key === key);
    if (item && !item.unlocked) {
        item.unlocked = true;
        logEvent(`🏆 ACHIEVEMENT SECURED: ${item.title}. ${item.desc}.`, "nominal");
        renderAchievementsGallery();
        saveMissionStateToDisk();
    }
}

function renderAchievementsGallery() {
    const container = document.getElementById("achievements-gallery-container");
    if (!container) return;

    container.innerHTML = "";
    AchievementsList.forEach(a => {
        const node = document.createElement("div");
        node.className = `achievement-node ${a.unlocked ? "unlocked" : ""}`;
        node.innerHTML = `
            <div class="badge-icon">${a.unlocked ? "⭐" : "🔒"}</div>
            <div class="badge-details">
                <span class="badge-title">${a.title}</span>
                <span class="badge-desc">${a.desc}</span>
            </div>
        `;
        container.appendChild(node);
    });
}

/* ==========================================================================
   PART 2 MISSION STATISTICS MODAL
   ========================================================================== */

function showMissionStatsDialog() {
    const modal = document.getElementById("mission-stats-modal");
    if (!modal) return;

    // Load statistics fields
    document.getElementById("stat-val-time").innerText = formatTimeSpan(SpaceState.missionTime);
    document.getElementById("stat-val-alt").innerText = `${SpaceState.altitude.toFixed(2)} km`;
    const maxV = Math.max(...(SpaceState.history.velocity.length > 0 ? SpaceState.history.velocity : [SpaceState.velocity]));
    document.getElementById("stat-val-vel").innerText = `${maxV.toFixed(1)} km/h`;

    const maxFuelUsed = 100.0 - SpaceState.fuel;
    document.getElementById("stat-val-fuel").innerText = `${maxFuelUsed.toFixed(1)}%`;
    document.getElementById("stat-val-dist").innerText = `${SpaceState.distance.toFixed(2)} km`;
    document.getElementById("stat-val-decisions").innerText = SpaceState.decisionsCount;

    // Commander Rating Formula
    let grade = "A+";
    if (SpaceState.warningsCount > 4) grade = "B-";
    else if (SpaceState.warningsCount > 2) grade = "B";
    else if (SpaceState.warningsCount > 0) grade = "A";

    if (SpaceState.warningsCount === 0 && maxFuelUsed < 80) {
        grade = "S (PERFECT)";
        unlockAchievement("perfect_mission");
    }

    document.getElementById("stat-val-rating").innerText = grade;

    // Append to Mission History archives log
    saveMissionToHistoryTable(grade);

    modal.style.display = "flex";
}

function saveMissionToHistoryTable(rating) {
    const tbody = document.getElementById("mission-history-tbody");
    if (!tbody) return;

    // Clear empty messages if any
    const emptyRow = tbody.querySelector(".empty-msg");
    if (emptyRow) tbody.innerHTML = "";

    const tr = document.createElement("tr");
    const mId = `COSMO-${Math.floor(Math.random() * 900000 + 100000)}`;
    tr.innerHTML = `
        <td>${mId}</td>
        <td>${formatTimeSpan(SpaceState.missionTime)}</td>
        <td>${SpaceState.altitude.toFixed(1)} km</td>
        <td style="color:#f59e0b;font-weight:bold;">${rating}</td>
        <td><button class="btn btn-secondary btn-xs" onclick="window.location.reload();">REPLAY</button></td>
    `;
    tbody.appendChild(tr);
}

/* ==========================================================================
   CHART HISTORY MANAGER
   ========================================================================== */

function saveHistoryStats() {
    const hist = SpaceState.history;
    const timeVal = SpaceState.missionTime;

    if (hist.time.length > 80) {
        hist.time.shift();
        hist.altitude.shift();
        hist.velocity.shift();
        hist.fuel.shift();
        hist.temp.shift();
        hist.signal.shift();
    }

    hist.time.push(timeVal);
    hist.altitude.push(SpaceState.altitude);
    hist.velocity.push(SpaceState.velocity);
    hist.fuel.push(SpaceState.fuel);
    hist.temp.push(SpaceState.temp);
    hist.signal.push(SpaceState.signal);
}

/* ==========================================================================
   TABBED CHART CANVAS GRAPH
   ========================================================================== */

function drawTelemetryGraphs() {
    const canvas = document.getElementById("chart-canvas-tabbed");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;

    // Reset chart frame background
    ctx.fillStyle = "#06060c";
    ctx.fillRect(0, 0, w, h);

    const hist = SpaceState.history;
    if (hist.time.length < 2) {
        ctx.font = "10px monospace";
        ctx.fillStyle = "rgba(255,255,255,0.25)";
        ctx.fillText("AWAITING FLIGHT INJECTOR LOGS...", w / 2 - 80, h / 2 + 3);
        return;
    }

    // Draw horizontal grid alignments
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
        const y = (h / 4) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
    }

    // Determine current graph data array & colors
    let data = [];
    let color = "#3b82f6";
    let suffix = "";

    if (SpaceState.activeTab === "altitude") {
        data = hist.altitude;
        color = "#3b82f6";
        suffix = " km";
    } else if (SpaceState.activeTab === "velocity") {
        data = hist.velocity;
        color = "#10b981";
        suffix = " km/h";
    } else if (SpaceState.activeTab === "fuel") {
        data = hist.fuel;
        color = "#f59e0b";
        suffix = "%";
    } else if (SpaceState.activeTab === "temperature") {
        data = hist.temp;
        color = "#ef4444";
        suffix = "°C";
    } else if (SpaceState.activeTab === "signal") {
        data = hist.signal;
        color = "#a855f7";
        suffix = "%";
    }

    const maxVal = Math.max(1, ...data);
    const minVal = Math.min(...data);
    const range = maxVal - minVal || 1;
    const len = data.length;

    // Gradient fill under the curves
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, color + "33"); // 20% opacity color
    gradient.addColorStop(1, color + "00"); // Transparent color

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0, h);

    for (let i = 0; i < len; i++) {
        const x = (w / (len - 1)) * i;
        const normY = (data[i] - minVal) / range;
        const y = h - 8 - normY * (h - 16);
        ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Actual stroke path
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < len; i++) {
        const x = (w / (len - 1)) * i;
        const normY = (data[i] - minVal) / range;
        const y = h - 8 - normY * (h - 16);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Render telemetry tags overlay
    ctx.font = "9px monospace";
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.fillText(`MAX: ${maxVal.toFixed(1)}${suffix}`, 10, 15);
    ctx.fillText(`MIN: ${minVal.toFixed(1)}${suffix}`, 10, h - 8);
    ctx.fillText(`LIVE: ${data[len - 1].toFixed(1)}${suffix}`, w - 100, 15);
}

/* ==========================================================================
   2D PROCEDURAL EARTH & ORBIT DOME DRAWING
   ========================================================================== */

let earthRotationAngle = 0;
const stars = [];
const satellitePaths = [];

function initStars() {
    for (let i = 0; i < 120; i++) {
        stars.push({
            x: Math.random() * 800,
            y: Math.random() * 480,
            size: Math.random() * 1.5 + 0.5,
            glow: Math.random() * 0.5 + 0.5
        });
    }

    // Establish simulated satellites in geo orbit loops
    satellitePaths.push({ angle: 0, radius: 240, speed: 0.002, color: "#a855f7" });
    satellitePaths.push({ angle: Math.PI / 3, radius: 290, speed: -0.0015, color: "#14b8a6" });
    satellitePaths.push({ angle: Math.PI / 1.5, radius: 335, speed: 0.001, color: "#f59e0b" });
}

function drawSpaceTheater(canvas, ctx) {
    if (!canvas || !ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Reset base dome space color
    ctx.fillStyle = "#010103";
    ctx.fillRect(0, 0, w, h);

    // Draw background stars
    ctx.fillStyle = "#ffffff";
    stars.forEach(star => {
        ctx.globalAlpha = star.glow * (0.55 + 0.45 * Math.sin(Date.now() / 400 + star.x));
        ctx.fillRect(star.x * (w / 800), star.y * (h / 480), star.size, star.size);
    });
    ctx.globalAlpha = 1.0;

    // Part 2 Deep Space Mode Gaseous Nebula Renderings
    if (SpaceState.altitude > 280.0 || SpaceState.status === "DEEP SPACE" || SpaceState.cameraMode === "deep") {
        drawNebulaCinematic(ctx, w, h);
    }

    // Handle viewport camera projections
    let targetScale = 1.0;
    let targetCameraX = w / 2;
    let targetCameraY = h / 2;

    const isShaking = SpaceState.engineIgnited && SpaceState.throttle > 0 && !SpaceState.isPaused;
    let shakeX = 0, shakeY = 0;
    if (isShaking) {
        const intensity = (SpaceState.throttle / 100) * (SpaceState.altitude < 40 ? 3.5 : 1.2);
        shakeX = (Math.random() - 0.5) * intensity;
        shakeY = (Math.random() - 0.5) * intensity;
    }

    // Dynamic viewport transformations depending on selecting camera Mode
    if (SpaceState.cameraMode === "mission") {
        targetScale = 0.85;
        targetCameraY = h / 2 + 50;
    } else if (SpaceState.cameraMode === "rocket") {
        targetScale = 2.2;
        const angleRad = (SpaceState.trajectoryAngle * Math.PI) / 180.0;
        const orbitalRadius = 170 + SpaceState.altitude;
        targetCameraX = w / 2 - (orbitalRadius * Math.sin(angleRad) * targetScale);
        targetCameraY = h / 2 - ((180 - orbitalRadius * Math.cos(angleRad)) * targetScale);
    } else if (SpaceState.cameraMode === "orbit") {
        targetScale = 0.48;
    } else if (SpaceState.cameraMode === "satellite") {
        targetScale = 0.65;
        targetCameraY = h / 2 + 20;
    } else if (SpaceState.cameraMode === "moon") {
        targetScale = 1.6;
        targetCameraX = w / 2 - 330 * targetScale;
        targetCameraY = h / 2 + 220 * targetScale;
    } else if (SpaceState.cameraMode === "deep") {
        targetScale = 0.32;
    } else if (SpaceState.cameraMode === "planet") {
        targetScale = 1.8;
        targetCameraY = h / 2 + 10;
    } else if (SpaceState.cameraMode === "cinematic") {
        // Smooth sine panning sweeps
        targetScale = 0.75 + Math.sin(Date.now() / 3000) * 0.15;
        targetCameraX = w / 2 + Math.cos(Date.now() / 4000) * 35;
    }

    // Smooth linear interpolation (lerp) for cinematic camera transitions
    if (SpaceState.currentScale === undefined) SpaceState.currentScale = targetScale;
    if (SpaceState.currentCameraX === undefined) SpaceState.currentCameraX = targetCameraX;
    if (SpaceState.currentCameraY === undefined) SpaceState.currentCameraY = targetCameraY;

    SpaceState.currentScale += (targetScale - SpaceState.currentScale) * 0.08;
    SpaceState.currentCameraX += (targetCameraX - SpaceState.currentCameraX) * 0.08;
    SpaceState.currentCameraY += (targetCameraY - SpaceState.currentCameraY) * 0.08;

    ctx.save();
    ctx.translate(SpaceState.currentCameraX + shakeX, SpaceState.currentCameraY + shakeY);
    ctx.scale(SpaceState.currentScale, SpaceState.currentScale);

    // Draw background orbital paths
    drawOrbitPaths(ctx);

    // Draw technical elements
    drawEarthProcedural(ctx, 0, 180, earthRotationAngle);
    drawMoonProcedural(ctx, 330, -220);
    drawSatelliteSystem(ctx);
    drawTrajectoryPath(ctx);
    drawSpacecraftPointer(ctx);

    ctx.restore();

    if (!SpaceState.isPaused) {
        earthRotationAngle += 0.00045;
        // Increment satellite orbit angles
        satellitePaths.forEach(sat => {
            sat.angle += sat.speed;
        });
    }
}

function drawNebulaCinematic(ctx, w, h) {
    ctx.save();
    const grad = ctx.createRadialGradient(w/2, h/2, 20, w/2, h/2, w);
    grad.addColorStop(0, "rgba(139, 92, 246, 0.05)");
    grad.addColorStop(0.5, "rgba(20, 184, 166, 0.03)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,w,h);
    ctx.restore();
}

function drawOrbitPaths(ctx) {
    ctx.save();
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 10]);

    // LEO Orbit (Low Earth Orbit)
    ctx.strokeStyle = "rgba(59, 130, 246, 0.15)";
    ctx.beginPath();
    ctx.arc(0, 180, 240, 0, Math.PI * 2);
    ctx.stroke();

    // MEO Orbit
    ctx.strokeStyle = "rgba(20, 184, 166, 0.15)";
    ctx.beginPath();
    ctx.arc(0, 180, 290, 0, Math.PI * 2);
    ctx.stroke();

    // GEO Orbit (Geostationary)
    ctx.strokeStyle = "rgba(168, 85, 247, 0.15)";
    ctx.beginPath();
    ctx.arc(0, 180, 335, 0, Math.PI * 2);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.restore();
}

function drawEarthProcedural(ctx, x, y, angle) {
    const radius = 170;

    // Glowing atmospheric layer
    ctx.save();
    const atmosGlow = ctx.createRadialGradient(x, y, radius - 8, x, y, radius + 22);
    atmosGlow.addColorStop(0, "rgba(59, 130, 246, 0.42)");
    atmosGlow.addColorStop(0.4, "rgba(139, 92, 246, 0.18)");
    atmosGlow.addColorStop(1, "rgba(139, 92, 246, 0)");
    ctx.fillStyle = atmosGlow;
    ctx.beginPath();
    ctx.arc(x, y, radius + 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Clip earth sphere to draw internal layers
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.clip();

    // Water layer
    ctx.fillStyle = "#111827"; // Very dark space ocean blue
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);

    // Procedural spinning landmass
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = "rgba(16, 185, 129, 0.22)"; // translucent tech green continents

    for (let i = 0; i < 4; i++) {
        const cx = Math.sin(i * 1.5) * 60;
        const cy = Math.cos(i * 1.5) * 60;
        ctx.beginPath();
        ctx.arc(cx, cy, 60, 0, Math.PI * 2);
        ctx.fill();
    }
    // Islands
    ctx.fillStyle = "rgba(20, 184, 166, 0.25)";
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(Math.cos(i * 1.8) * 100, Math.sin(i * 2.2) * 100, 20, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();

    // Procedural Floating cloud vectors
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle * 1.25); // clouds spin slightly faster
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.arc(Math.sin(i * 2) * 90, Math.cos(i * 1.5) * 90, 35, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();

    // Day/Night shade division mask (Light is located at upper right corner)
    ctx.save();
    const sunGlow = ctx.createLinearGradient(x + 120, y - 120, x - 120, y + 120);
    sunGlow.addColorStop(0, "rgba(255, 255, 255, 0.1)");
    sunGlow.addColorStop(0.55, "rgba(5, 5, 10, 0.35)");
    sunGlow.addColorStop(0.8, "rgba(2, 2, 5, 0.85)");
    sunGlow.addColorStop(1, "rgba(1, 1, 3, 0.98)");
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Glowing city-lights metropolitan center dots (rendered on the dark shaded night side)
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = "rgba(245, 158, 11, 0.8)"; // neon orange city light dot glow

    // Set static positions for metropolitan nodes
    const cityNodes = [
        { lat: 10, lng: -45 }, { lat: -25, lng: 30 },
        { lat: 40, lng: 110 }, { lat: 15, lng: -90 },
        { lat: -5, lng: -10 }, { lat: 50, lng: -5 }
    ];

    cityNodes.forEach(node => {
        const radLat = (node.lat * Math.PI) / 180;
        const radLng = (node.lng * Math.PI) / 180;
        const nodeX = (radius - 12) * Math.cos(radLat) * Math.sin(radLng);
        const nodeY = -(radius - 12) * Math.sin(radLat);

        // Render dot only if it is rotated into the night shading area
        // Compute current angle-rotated position to see if it is in the bottom-left quadrant (dark area)
        const currentRotatedLng = radLng + angle;
        const cosVal = Math.cos(radLat) * Math.sin(currentRotatedLng);

        if (cosVal < -0.15) {
            ctx.beginPath();
            ctx.arc(nodeX, nodeY, 2.5, 0, Math.PI * 2);
            ctx.fill();
            // Tiny city glow
            ctx.fillStyle = "rgba(245, 158, 11, 0.25)";
            ctx.beginPath();
            ctx.arc(nodeX, nodeY, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "rgba(245, 158, 11, 0.8)";
        }
    });
    ctx.restore();

    ctx.restore(); // end clip

    // Perimeter atmospheric neon-blue ring
    ctx.strokeStyle = "rgba(59, 130, 246, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
}

function drawMoonProcedural(ctx, x, y) {
    const radius = 25;

    // Outer moon shadow
    ctx.save();
    const glow = ctx.createRadialGradient(x, y, radius - 4, x, y, radius + 8);
    glow.addColorStop(0, "rgba(255, 255, 255, 0.1)");
    glow.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, radius + 8, 0, Math.PI * 2);
    ctx.fill();

    // Solid core
    ctx.fillStyle = "#374151";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Crater highlights
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.beginPath();
    ctx.arc(x - 5, y - 5, 5, 0, Math.PI * 2);
    ctx.arc(x + 8, y + 4, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawSatelliteSystem(ctx) {
    ctx.save();
    satellitePaths.forEach(sat => {
        // Calculate coordinate positions
        const sx = sat.radius * Math.sin(sat.angle);
        const sy = 180 - sat.radius * Math.cos(sat.angle);

        // Draw scanning telemetry sweep vectors
        ctx.strokeStyle = sat.color + "1a"; // 10% opacity
        ctx.fillStyle = sat.color + "08"; // 3% opacity

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(0, 180);
        ctx.stroke();

        // Draw scanning fan
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.arc(sx, sy, 40, sat.angle - Math.PI / 1.1, sat.angle - Math.PI / 0.9);
        ctx.closePath();
        ctx.fill();

        // Draw satellite dot marker
        ctx.fillStyle = sat.color;
        ctx.beginPath();
        ctx.arc(sx, sy, 3, 0, Math.PI * 2);
        ctx.fill();

        // Satellite core blink
        if (Math.sin(Date.now() / 150) > 0) {
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    ctx.restore();
}

function drawTrajectoryPath(ctx) {
    const earthCenterX = 0;
    const earthCenterY = 180;
    const earthRadius = 170;

    ctx.save();
    ctx.strokeStyle = "rgba(139, 92, 246, 0.45)";
    ctx.lineWidth = 2.5;
    ctx.setLineDash([4, 4]);

    ctx.beginPath();
    ctx.moveTo(earthCenterX, earthCenterY - earthRadius);

    const steps = 40;
    const maxTrajLength = Math.min(steps, 1 + Math.floor(SpaceState.altitude / 6.5));

    for (let i = 1; i <= maxTrajLength; i++) {
        const t = i / steps;
        const angle = (SpaceState.trajectoryAngle * t * Math.PI) / 180.0;
        const radius = earthRadius + (SpaceState.altitude * t);

        const currentX = earthCenterX + radius * Math.sin(angle);
        const currentY = earthCenterY - radius * Math.cos(angle);

        ctx.lineTo(currentX, currentY);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
}

function drawSpacecraftPointer(ctx) {
    const earthCenterX = 0;
    const earthCenterY = 180;
    const earthRadius = 170;

    const angleRad = (SpaceState.trajectoryAngle * Math.PI) / 180.0;
    const orbitalRadius = earthRadius + SpaceState.altitude;

    const rX = earthCenterX + orbitalRadius * Math.sin(angleRad);
    const rY = earthCenterY - orbitalRadius * Math.cos(angleRad);

    ctx.save();
    ctx.translate(rX, rY);
    ctx.rotate(angleRad);

    // Render modern tactical telemetry HUD pointer (No illustrative rocket body)
    // 1. Engine flare vector
    const effectiveThrottle = Math.max(SpaceState.throttle, SpaceState.calibrators.throttle);
    if (SpaceState.engineIgnited && effectiveThrottle > 0 && !SpaceState.isPaused) {
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, 5);
        ctx.lineTo(0, 5 + (effectiveThrottle / 100) * 15 + Math.random() * 5);
        ctx.stroke();

        // Thrust particle ring glows
        ctx.fillStyle = "rgba(239, 68, 68, 0.25)";
        ctx.beginPath();
        ctx.arc(0, 6, 4 + Math.random() * 4, 0, Math.PI * 2);
        ctx.fill();
    }

    // 2. Spacecraft point crosshair
    ctx.strokeStyle = "#10b981"; // neon green
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.stroke();

    // Crosshair ticks
    ctx.beginPath();
    ctx.moveTo(-9, 0); ctx.lineTo(-4, 0);
    ctx.moveTo(4, 0); ctx.lineTo(9, 0);
    ctx.moveTo(0, -9); ctx.lineTo(0, -4);
    ctx.moveTo(0, 4); ctx.lineTo(0, 9);
    ctx.stroke();

    // Center telemetry dot
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // 3. Mini label
    ctx.font = "bold 8px monospace";
    ctx.fillStyle = "rgba(16, 185, 129, 0.85)";
    ctx.fillText("ADEEB-01", 12, 3);

    ctx.restore();
}

/* ==========================================================================
   CIRCULAR METRIC GAUGES COMPONENT
   ========================================================================== */

function updateCircularGauges() {
    // 1. G-Force (Range 1.0 to 10.0 G)
    const gfPercent = Math.min(100, Math.max(0, ((SpaceState.gForce - 1) / 9) * 100));
    setGaugeStroke("gauge-gforce-fill", gfPercent);
    setGaugeValue("gauge-gforce-val", `${SpaceState.gForce.toFixed(1)}G`);

    // 2. Cabin Pressure (Range 0.0 to 120 kPa)
    const cpPercent = Math.min(100, Math.max(0, (SpaceState.cabinPressure / 120) * 100));
    setGaugeStroke("gauge-pressure-fill", cpPercent);
    setGaugeValue("gauge-pressure-val", `${SpaceState.cabinPressure.toFixed(0)}k`);

    // 3. Battery Buffer (Range 0 to 100%)
    setGaugeStroke("gauge-battery-fill", SpaceState.battery);
    setGaugeValue("gauge-battery-val", `${SpaceState.battery.toFixed(0)}%`);

    // 4. Signal strength (Range 0 to 100%)
    setGaugeStroke("gauge-signal-fill", SpaceState.signal);
    setGaugeValue("gauge-signal-val", `${SpaceState.signal.toFixed(0)}%`);
}

function setGaugeStroke(elementId, percent) {
    const el = document.getElementById(elementId);
    if (el) {
        // Circumference of radius 15.9155 is exactly 100
        el.setAttribute("stroke-dasharray", `${percent.toFixed(1)}, 100`);
    }
}

function setGaugeValue(elementId, value) {
    const el = document.getElementById(elementId);
    if (el) el.innerText = value;
}

/* ==========================================================================
   LOCALSTORAGE SYSTEM
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
            quality: SpaceState.quality,
            activeTab: SpaceState.activeTab,
            currentMissionIndex: SpaceState.currentMissionIndex,
            activeSatIndex: SpaceState.activeSatIndex,
            activePlanetIndex: SpaceState.activePlanetIndex,
            achievements: AchievementsList.map(a => ({ key: a.key, unlocked: a.unlocked })),
            campaign: CampaignMissions.map(m => ({ id: m.id, status: m.status, progress: m.progress }))
        };
        localStorage.setItem("COSMO_SAVE_STATE", JSON.stringify(payload));
    } catch (e) {}
}

function loadMissionStateFromDisk() {
    try {
        const raw = localStorage.getItem("COSMO_SAVE_STATE");
        if (!raw) {
            renderCampaignMissionsList();
            renderAchievementsGallery();
            return;
        }

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
        SpaceState.cameraMode = data.cameraMode || "mission";
        SpaceState.quality = data.quality || "high";
        SpaceState.activeTab = data.activeTab || "altitude";

        SpaceState.currentMissionIndex = data.currentMissionIndex || 0;
        SpaceState.activeSatIndex = data.activeSatIndex || 0;
        SpaceState.activePlanetIndex = data.activePlanetIndex || 0;

        // Restore achievements
        if (data.achievements) {
            data.achievements.forEach(saved => {
                const item = AchievementsList.find(a => a.key === saved.key);
                if (item) item.unlocked = saved.unlocked;
            });
        }

        // Restore Campaign levels
        if (data.campaign) {
            data.campaign.forEach(saved => {
                const item = CampaignMissions.find(m => m.id === saved.id);
                if (item) {
                    item.status = saved.status;
                    item.progress = saved.progress;
                }
            });
        }

        // Restore tab buttons active classes
        const tabs = ["alt", "vel", "fuel", "temp", "sig"];
        tabs.forEach(tabId => {
            const btn = document.getElementById(`tab-${tabId}`);
            if (btn) btn.classList.remove("active");
        });
        const activeMap = { altitude: "alt", velocity: "vel", fuel: "fuel", temperature: "temp", signal: "sig" };
        const activeBtn = document.getElementById(`tab-${activeMap[SpaceState.activeTab]}`);
        if (activeBtn) activeBtn.classList.add("active");

        // Sync visual UI elements
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
            const displayVal = document.getElementById("throttle-display-val");
            if (displayVal) displayVal.innerText = `${SpaceState.throttle}%`;
        }

        renderStagesTimeline();
        renderCampaignMissionsList();
        renderAchievementsGallery();
        selectSatelliteAsset(SpaceState.activeSatIndex);
        selectPlanetAsset(SpaceState.activePlanetIndex);

        // Update active objective details
        const activeMission = CampaignMissions[SpaceState.currentMissionIndex];
        document.getElementById("mission-name").innerText = `COSMO-${activeMission.id}`;
        document.getElementById("active-objective-text").innerText = activeMission.objective;
        document.getElementById("active-objective-reward").innerText = `REWARD: ${activeMission.reward}`;

        logEvent("COSMO-760228 telemetry save matrix restored from Disk.", "system");
    } catch (e) {}
}

/* ==========================================================================
   UI SYNCHRONIZATION
   ========================================================================== */

function updateTelemetryUI() {
    document.getElementById("mission-time").innerText = formatTimeSpan(SpaceState.missionTime);

    document.getElementById("tele-altitude").innerText = `${SpaceState.altitude.toFixed(2)} km`;
    document.getElementById("tele-velocity").innerText = `${SpaceState.velocity.toFixed(1)} km/h`;
    document.getElementById("tele-acceleration").innerText = `${SpaceState.acceleration.toFixed(2)} m/s²`;

    document.getElementById("tele-fuel").innerText = `${SpaceState.fuel.toFixed(2)}%`;
    const fBar = document.getElementById("tele-fuel-bar");
    if (fBar) fBar.style.width = `${SpaceState.fuel}%`;

    document.getElementById("tele-temp").innerText = `${SpaceState.temp.toFixed(1)}°C`;
    const tBar = document.getElementById("tele-temp-bar");
    if (tBar) tBar.style.width = `${Math.min(100, (SpaceState.temp / PhysicsConstants.maxTemp) * 100)}%`;

    document.getElementById("tele-distance").innerText = `${SpaceState.distance.toFixed(2)} km`;

    // Center HUD overlays
    const hudCamAlt = document.getElementById("hud-camera-altitude");
    if (hudCamAlt) hudCamAlt.innerText = `ALTITUDE: ${SpaceState.altitude.toFixed(2)} km`;
    const hudFlight = document.getElementById("hud-flight-path");
    if (hudFlight) hudFlight.innerText = `FLIGHT_PATH: ${SpaceState.status}`;
    const hudVib = document.getElementById("hud-vibration-factor");
    if (hudVib) hudVib.innerText = `VIBRATION_HZ: ${SpaceState.engineIgnited ? (12 + SpaceState.throttle / 4).toFixed(1) : "nominal"}`;

    const dirRead = document.getElementById("dir-deg-read");
    if (dirRead) dirRead.innerText = `${SpaceState.trajectoryAngle}°`;

    // Update gauges
    updateCircularGauges();
}

function renderStagesTimeline() {
    const container = document.getElementById("stages-timeline-container");
    if (!container) return;

    container.innerHTML = "";
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
   PART 2 CHARACTER-BASED PROGRESS SLIDER DRAWING
   ========================================================================== */

function setupCharacterSliders() {
    const keys = ["throttle", "power", "comm", "nav", "cooling"];
    keys.forEach(key => {
        const slider = document.getElementById(`slider-manual-${key}`);
        const text = document.getElementById(`char-progress-${key}`);
        if (slider && text) {
            slider.addEventListener("input", (e) => {
                const val = parseInt(e.target.value);
                SpaceState.calibrators[key] = val;

                // Generate character blocks [█████░░░░░]
                const blocksCount = Math.floor(val / 10);
                const solid = "█".repeat(blocksCount);
                const empty = "░".repeat(10 - blocksCount);
                text.innerText = `[${solid}${empty}] ${val}%`;

                // Handle actual physics couplings
                if (key === "throttle") {
                    SpaceState.throttle = val;
                    if (val > 0 && !SpaceState.engineIgnited) {
                        SpaceState.engineIgnited = true;
                    } else if (val === 0) {
                        SpaceState.engineIgnited = false;
                    }
                    const mainSlider = document.getElementById("throttle-input");
                    if (mainSlider) mainSlider.value = val;
                    const mainLbl = document.getElementById("throttle-display-val");
                    if (mainLbl) mainLbl.innerText = `${val}%`;
                    updateEngineSound();
                }

                playSynthBeep(600 + val, 0.05);
            });
        }
    });
}

/* ==========================================================================
   INPUTS BINDINGS SETUP
   ========================================================================== */

function setupInputs() {
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
            if (btnPause) {
                btnPause.style.display = "block";
                btnPause.disabled = false;
            }
            playSynthBeep(440, 0.2);
        });
    }

    if (btnPause) {
        btnPause.addEventListener("click", () => {
            SpaceState.isPaused = true;
            btnPause.style.display = "none";
            if (btnResume) btnResume.style.display = "block";
            playSynthBeep(330, 0.2);
            logEvent("Simulation track paused by Ground Control.", "warning");
        });
    }

    if (btnResume) {
        btnResume.addEventListener("click", () => {
            SpaceState.isPaused = false;
            btnResume.style.display = "none";
            if (btnPause) btnPause.style.display = "block";
            playSynthBeep(440, 0.2);
            logEvent("Simulation track resumed.", "system");
        });
    }

    if (btnReset) {
        btnReset.addEventListener("click", () => {
            performFullReset();
        });
    }

    // Interactive Tabbed graph switches
    const tabMap = { alt: "altitude", vel: "velocity", fuel: "fuel", temp: "temperature", sig: "signal" };
    Object.keys(tabMap).forEach(tabId => {
        const btn = document.getElementById(`tab-${tabId}`);
        if (btn) {
            btn.addEventListener("click", () => {
                // Toggle tab active classes
                Object.keys(tabMap).forEach(id => {
                    const el = document.getElementById(`tab-${id}`);
                    if (el) el.classList.remove("active");
                });
                btn.classList.add("active");
                SpaceState.activeTab = tabMap[tabId];
                playSynthBeep(650, 0.08);
            });
        }
    });

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
                logEvent("Core engine ignition forced.", "nominal");
            } else {
                logEvent("Core engine shutdown forced.", "warning");
            }
            updateEngineSound();
            playSynthBeep(SpaceState.engineIgnited ? 220 : 140, 0.4, "triangle");
        });
    }

    if (btnComm) {
        btnComm.addEventListener("click", () => {
            SpaceState.commActive = !SpaceState.commActive;
            playSynthBeep(SpaceState.commActive ? 600 : 300, 0.1);
            logEvent(`Ground telemetry link: ${SpaceState.commActive ? "RE-ESTABLISHED" : "DISCONNECTED"}`, SpaceState.commActive ? "nominal" : "warning");
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
            playSynthBeep(520, 0.08);
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
            playSynthBeep(380, 0.08);
        });
    }

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

    const btnAbort = document.getElementById("btn-manual-abort");
    if (btnAbort) {
        btnAbort.addEventListener("click", () => {
            triggerAbortSequence();
        });
    }

    const cameraSelect = document.getElementById("camera-select");
    if (cameraSelect) {
        cameraSelect.addEventListener("change", (e) => {
            SpaceState.cameraMode = e.target.value;
            playSynthBeep(500, 0.1);
            logEvent(`HUD Viewport camera angle adjusted: ${SpaceState.cameraMode.toUpperCase()}`, "system");
        });
    }

    const graphicsSelect = document.getElementById("graphics-select");
    if (graphicsSelect) {
        graphicsSelect.addEventListener("change", (e) => {
            SpaceState.quality = e.target.value;
            playSynthBeep(500, 0.1);
        });
    }

    const btnSound = document.getElementById("btn-sound-toggle");
    if (btnSound) {
        btnSound.addEventListener("click", () => {
            SpaceState.soundMuted = !SpaceState.soundMuted;
            if (SpaceState.soundMuted) {
                btnSound.innerHTML = "<span>🔇</span> AUDIO OFF";
                if (engineGain) engineGain.gain.setValueAtTime(0, audioCtx.currentTime);
                if (staticGain) staticGain.gain.setValueAtTime(0, audioCtx.currentTime);
            } else {
                btnSound.innerHTML = "<span>🔊</span> AUDIO ON";
                initAudio();
                updateEngineSound();
            }
        });
    }

    // Part 2 Workspaces switcher navigation
    const wsButtons = ["mission", "satellite", "planet", "archives", "freeplay"];
    wsButtons.forEach(wsId => {
        const btn = document.getElementById(`tab-ws-${wsId}`);
        if (btn) {
            btn.addEventListener("click", () => {
                // Remove active classes
                wsButtons.forEach(id => {
                    const b = document.getElementById(`tab-ws-${id}`);
                    if (b) b.classList.remove("active");
                });
                btn.classList.add("active");
                SpaceState.activeWorkspace = wsId;
                SpaceState.isFreePlay = (wsId === "freeplay");

                // Toggle visibility in DOM depending on selected workspace
                const cards = document.querySelectorAll(".card");
                cards.forEach(card => {
                    const wsAttr = card.getAttribute("data-ws");
                    if (wsAttr) {
                        const targets = wsAttr.split(" ");
                        if (targets.includes(wsId)) {
                            card.style.display = "block";
                        } else {
                            card.style.display = "none";
                        }
                    }
                });

                // Toggle Bottom Manual Sub-system slider deck (Part 2)
                const charSlidersDeck = document.querySelector(".detailed-sliders-deck");
                const defaultThrottleDeck = document.querySelector(".throttle-deck");
                if (wsId === "satellite" || wsId === "planet" || wsId === "freeplay") {
                    if (charSlidersDeck) charSlidersDeck.style.display = "block";
                    if (defaultThrottleDeck) defaultThrottleDeck.style.display = "none";
                } else {
                    if (charSlidersDeck) charSlidersDeck.style.display = "none";
                    if (defaultThrottleDeck) defaultThrottleDeck.style.display = "block";
                }

                playSynthBeep(700, 0.1);
                logEvent(`Aerospace Ground Console Workspace changed: ${wsId.toUpperCase()}`, "system");
            });
        }
    });

    // Part 2 Satellite click handlers
    for (let i = 0; i < 3; i++) {
        const btn = document.getElementById(`btn-sat-${i}`);
        if (btn) {
            btn.addEventListener("click", () => selectSatelliteAsset(i));
        }
    }

    // Part 2 Satellites actions
    const sOrbitUp = document.getElementById("btn-sat-orbit-up");
    const sOrbitDn = document.getElementById("btn-sat-orbit-dn");
    const sRotateL = document.getElementById("btn-sat-rotate-l");
    const sRotateR = document.getElementById("btn-sat-rotate-r");
    const sPower = document.getElementById("btn-sat-power");
    const sComm = document.getElementById("btn-sat-comm");
    const sDeploy = document.getElementById("btn-sat-deploy");

    if (sOrbitUp) sOrbitUp.addEventListener("click", () => adjustSatelliteOrbit("up"));
    if (sOrbitDn) sOrbitDn.addEventListener("click", () => adjustSatelliteOrbit("down"));
    if (sRotateL || sRotateR) {
        const handler = () => rotateSatellite();
        if (sRotateL) sRotateL.addEventListener("click", handler);
        if (sRotateR) sRotateR.addEventListener("click", handler);
    }
    if (sPower) sPower.addEventListener("click", () => toggleSatellitePower());
    if (sComm) {
        sComm.addEventListener("click", () => {
            logEvent("SATELLITE ACTUATOR: Satellite data packets successfully relayed to ground core.", "nominal");
            playSynthBeep(920, 0.1, "sine");
        });
    }
    if (sDeploy) {
        sDeploy.addEventListener("click", () => {
            const sat = SatelliteAssets[SpaceState.activeSatIndex];
            sat.deployMode = !sat.deployMode;
            logEvent(`SATELLITE ACTUATOR: Solar array deploy mode: ${sat.deployMode ? "DEPLOYED" : "STOWED"} on ${sat.name}.`, "nominal");
            selectSatelliteAsset(SpaceState.activeSatIndex);
        });
    }

    // Part 2 Planet click handlers
    for (let i = 0; i < 3; i++) {
        const btn = document.getElementById(`btn-planet-${i}`);
        if (btn) {
            btn.addEventListener("click", () => selectPlanetAsset(i));
        }
    }

    // Part 2 Planet scan/rover action listeners
    const btnPlanetScan = document.getElementById("btn-planet-scan");
    const btnPlanetLand = document.getElementById("btn-planet-land");
    if (btnPlanetScan) btnPlanetScan.addEventListener("click", () => scanPlanetSurface());
    if (btnPlanetLand) btnPlanetLand.addEventListener("click", () => deployPlanetRover());

    // Part 2 Archives action buttons
    const btnSaveDisk = document.getElementById("btn-save-mission");
    const btnResumeDisk = document.getElementById("btn-resume-mission");
    const btnNewCam = document.getElementById("btn-new-mission");
    const btnResetDisk = document.getElementById("btn-reset-data");

    if (btnSaveDisk) {
        btnSaveDisk.addEventListener("click", () => {
            saveMissionStateToDisk();
            playSynthBeep(880, 0.2);
            logEvent("Fictional system flight state successfully written to LocalStorage matrix.", "nominal");
        });
    }
    if (btnResumeDisk) {
        btnResumeDisk.addEventListener("click", () => {
            loadMissionStateFromDisk();
            playSynthBeep(880, 0.2);
        });
    }
    if (btnNewCam) {
        btnNewCam.addEventListener("click", () => {
            performFullReset();
            SpaceState.currentMissionIndex = 0;
            CampaignMissions.forEach((m, idx) => {
                m.status = idx === 0 ? "READY" : "LOCKED";
                m.progress = 0;
            });
            renderCampaignMissionsList();
            logEvent("New Campaign initiated. Ready for launch.", "nominal");
        });
    }
    if (btnResetDisk) {
        btnResetDisk.addEventListener("click", () => {
            const conf = confirm("WARNING: Confirming will securely wipe all Achievements, saves, and Campaign tracks. Proceed?");
            if (conf) {
                localStorage.clear();
                window.location.reload();
            }
        });
    }

    // Part 2 Free Play space weather and manual overrides triggers
    const wSolar = document.getElementById("btn-weather-solar");
    const wMeteor = document.getElementById("btn-weather-meteor");
    const wFlare = document.getElementById("btn-weather-flare");
    const wRad = document.getElementById("btn-weather-radiation");

    const applyWeather = (weatherType) => {
        SpaceState.spaceWeather = weatherType;
        playSynthBeep(320, 0.4, "triangle");
        logEvent(`SPACE ENVIRONMENT UPDATE: Atmospheric and radiation parameters altered. Weather: ${weatherType}.`, "warning");
    };

    if (wSolar) wSolar.addEventListener("click", () => applyWeather("SUN NOMINAL"));
    if (wMeteor) wMeteor.addEventListener("click", () => applyWeather("METEOR SHOWER"));
    if (wFlare) wFlare.addEventListener("click", () => applyWeather("SOLAR FLARE"));
    if (wRad) wRad.addEventListener("click", () => applyWeather("RADIATION SPIKE"));

    // Part 2 manual simulated failures triggers
    const fEngine = document.getElementById("btn-fail-engine");
    const fComm = document.getElementById("btn-fail-comm");
    const fPower = document.getElementById("btn-fail-power");
    const fFuel = document.getElementById("btn-fail-fuel");
    const fNav = document.getElementById("btn-fail-nav");
    const fThermal = document.getElementById("btn-fail-thermal");

    const injectFailure = (title, desc, actionText) => {
        SpaceState.warningsCount++;
        const modal = document.getElementById("system-alert-modal");
        if (!modal) return;
        document.getElementById("alert-title").innerText = title;
        document.getElementById("alert-description").innerText = desc;
        const choiceContainer = document.getElementById("alert-choice-container");
        choiceContainer.innerHTML = `
            <button class="choice-btn" id="btn-modal-recover">
                <span class="choice-label">${actionText}</span>
                <span class="choice-sub">PROBABLE EFFECT: Re-establish nominal parameters</span>
            </button>
        `;
        document.getElementById("btn-modal-recover").addEventListener("click", () => {
            modal.style.display = "none";
            logEvent(`SYSTEM FAIL RECOVERY SECURED: ${actionText}`, "nominal");
            playSynthBeep(880, 0.1);
        });
        modal.style.display = "flex";
        playSynthBeep(180, 0.8, "sawtooth");
    };

    if (fEngine) fEngine.addEventListener("click", () => injectFailure("🚨 ENGINE OVERHEAT WARNING", "Booster nozzle core bounds melting! Danger of combustion blowout.", "REROUTE HYDRAULICS & REDUCE THROTTLE"));
    if (fComm) fComm.addEventListener("click", () => injectFailure("🚨 TELEMETRY DISRUPTION", "Signal carriers dropped completely. Telemetry link offline.", "CYCLE ANTENNA TRANSCIEVER"));
    if (fPower) fPower.addEventListener("click", () => injectFailure("🚨 GRID TRANSIENT TRIP", "Auxiliary power grid bypassed. High solar cell failures.", "BREAKER TRIP CORRECTION CYCLE"));
    if (fFuel) fFuel.addEventListener("click", () => injectFailure("🚨 FUEL LEVEL FAILURE", "Nitrogen pressure valves experienced pressure decays.", "TRIGGER PRESSURE COMPENSATOR VALVE"));
    if (fNav) fNav.addEventListener("click", () => injectFailure("🚨 NAVIGATION ANOMALY", "Inertial gyros drifted. Path angle matrix offset.", "CALIBRATE INERTIAL STARS SENSORS"));
    if (fThermal) fThermal.addEventListener("click", () => injectFailure("🚨 CRYOGENIC TEMPERATURE LEAK", "Thermodynamic heat pipes freezing auxiliary grids.", "SWITCH ON INTERSTAGED THERMAL DUCTS"));

    // Dismiss stats modal
    const statsDismiss = document.getElementById("btn-stats-dismiss");
    if (statsDismiss) {
        statsDismiss.addEventListener("click", () => {
            document.getElementById("mission-stats-modal").style.display = "none";
        });
    }

    // Mobile buttons mapping
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
            logEvent("Simulation track paused via mobile console.", "warning");
        });
    }
    if (mResume) {
        mResume.addEventListener("click", () => {
            SpaceState.isPaused = false;
            mResume.style.display = "none";
            if (mPause) mPause.style.display = "block";
            logEvent("Simulation track resumed via mobile.", "system");
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

    // Keyboard global listener
    document.addEventListener("keydown", (e) => {
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;

        switch (e.key.toLowerCase()) {
            case " ":
                e.preventDefault();
                initAudio();
                if (SpaceState.status === "PRE-LAUNCH") {
                    if (btnStart) btnStart.click();
                } else {
                    SpaceState.isPaused = !SpaceState.isPaused;
                    logEvent(`Simulation track ${SpaceState.isPaused ? "PAUSED" : "RESUMED"} by shortcut`, "system");
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
            case "d":
                SpaceState.solarArraysDeployed = !SpaceState.solarArraysDeployed;
                playSynthBeep(600, 0.2);
                logEvent(`Solar Array tracker arrays manually ${SpaceState.solarArraysDeployed ? "DEPLOYED" : "STOWED"}`, "system");
                break;
        }
    });
}

function triggerStageSeparation() {
    if (SpaceState.stageSeparated) return;
    SpaceState.stageSeparated = true;
    playSynthBeep(300, 0.6, "sawtooth", 0.15);

    // Dynamic trajectory change
    SpaceState.velocity = Math.max(0, SpaceState.velocity - 250);
    SpaceState.fuel = 100.0;

    PhysicsConstants.rocketMassDry = 6000;
    PhysicsConstants.rocketMassWet = 40000;

    setFlightStage("STAGE SEPARATION");
}

function triggerAbortSequence() {
    if (SpaceState.hasAborted) return;
    SpaceState.hasAborted = true;

    playSynthBeep(120, 1.5, "sawtooth", 0.3);
    logEvent("CRITICAL: ABORT CMD CONFIRMED BY GROUND CONTROLLER.", "critical");

    const overlay = document.getElementById("abort-warning-overlay");
    if (overlay) overlay.style.display = "flex";

    setFlightStage("ABORTED");

    SpaceState.throttle = 0;
    SpaceState.engineIgnited = false;
    updateEngineSound();
    SpaceState.isCountdownActive = false;

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

    const slider = document.getElementById("throttle-input");
    if (slider) slider.value = 0;
    const label = document.getElementById("throttle-display-val");
    if (label) label.innerText = "0%";

    const btnStart = document.getElementById("btn-count-start");
    if (btnStart) btnStart.style.display = "block";
    const btnPause = document.getElementById("btn-count-pause");
    if (btnPause) btnPause.style.display = "none";
    const btnResume = document.getElementById("btn-count-resume");
    if (btnResume) btnResume.style.display = "none";

    renderStagesTimeline();
    updateTelemetryUI();
    updateEngineSound();

    SpaceState.history = {
        time: [],
        altitude: [],
        velocity: [],
        fuel: [],
        temp: [],
        signal: []
    };

    localStorage.removeItem("COSMO_SAVE_STATE");
    logEvent("Space Mission Control telemetry tracking cleared. Launch Ready.", "system");
    triggerAIOfficerMessage("SYSTEMS Nominal. WAITING FOR TERMINAL COUNTDOWN START COMMAND.");

    playSynthBeep(440, 0.5, "sine", 0.1);
}

/* ==========================================================================
   INITIALIZATION & LOOP BINDINGS
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    if (window.__spaceSimulatorInitialized) return;
    window.__spaceSimulatorInitialized = true;

    setupInputs();
    setupCharacterSliders();
    initStars();

    const canvas = document.getElementById("space-canvas");
    let ctx = null;
    if (canvas) {
        ctx = canvas.getContext("2d");
        const resize = () => {
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = canvas.parentElement.clientHeight || 480;
        };
        resize();
        window.addEventListener("resize", resize);
    }

    loadMissionStateFromDisk();

    // UTC Digital clock updates
    setInterval(() => {
        const clk = document.getElementById("digital-clock");
        if (clk) {
            const now = new Date();
            clk.innerText = now.toUTCString().slice(17, 25);
        }
    }, 1000);

    let lastTime = performance.now();
    function loop(now) {
        const dT = Math.min(0.1, (now - lastTime) / 1000.0);
        lastTime = now;

        if (!document.hidden) {
            updatePhysics(dT);
            updateTelemetryUI();

            if (canvas && ctx) {
                drawSpaceTheater(canvas, ctx);
            }
            drawTelemetryGraphs();
        }

        if (Math.random() < 0.004) {
            saveMissionStateToDisk();
        }

        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
});