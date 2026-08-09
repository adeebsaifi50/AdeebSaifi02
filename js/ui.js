/**
 * Metropolis Directive - UI Controller Module (js/ui.js)
 *
 * Binds DOM buttons, updates real-time hardware meter charts,
 * manages responsive touch virtual joysticks, and routes telemetry.
 */

class UIController {
    constructor(engine) {
        this.engine = engine;

        // Cache elements
        this.dom = {
            gameTime: document.getElementById('game-time-display'),
            gameDay: document.getElementById('game-day-display'),
            playerCoords: document.getElementById('hud-player-coords'),
            playerSpeed: document.getElementById('hud-player-speed'),
            playerZone: document.getElementById('hud-player-zone'),
            fpsStatus: document.getElementById('hud-engine-status'),
            terminalLogger: document.getElementById('terminal-city-logger'),
            btnClearLogs: document.getElementById('btn-clear-logs'),
            teleTheme: document.getElementById('tele-active-theme'),
            teleWeather: document.getElementById('tele-active-weather'),
            teleCars: document.getElementById('tele-active-cars'),
            teleWind: document.getElementById('tele-wind-speed'),

            // Quick controls
            btnWeatherClear: document.getElementById('weather-clear-btn'),
            btnWeatherRain: document.getElementById('weather-rain-btn'),
            btnWeatherFog: document.getElementById('weather-fog-btn'),
            btnTimeDay: document.getElementById('time-day-btn'),
            btnTimeSunset: document.getElementById('time-sunset-btn'),
            btnTimeNight: document.getElementById('time-night-btn'),
            btnTimeAuto: document.getElementById('time-auto-btn'),

            // Load Indicators
            loadValGrid: document.getElementById('load-val-grid'),
            loadValEntities: document.getElementById('load-val-entities'),
            loadValParticles: document.getElementById('load-val-particles'),
            loadFillGrid: document.getElementById('load-fill-grid'),
            loadFillEntities: document.getElementById('load-fill-entities'),
            loadFillParticles: document.getElementById('load-fill-particles'),

            // Joystick boundary & knob
            joystickBoundary: document.getElementById('joystick-boundary'),
            joystickKnob: document.getElementById('joystick-knob'),
            btnSprint: document.getElementById('mobile-btn-sprint'),
            btnAction: document.getElementById('mobile-btn-action')
        };

        this.initListeners();
        this.initMobileControls();

        // Push startup logs
        this.logMessage('METROPOLIS CORE INITIALIZED', 'system');
        this.logMessage('Vector Map: 4000x4000 grid operational', 'system');
        this.logMessage('Autonomous vehicle traffic lines synced', 'action');
    }

    initListeners() {
        const d = this.dom;

        // Clear terminal logger
        d.btnClearLogs.addEventListener('click', () => {
            d.terminalLogger.innerHTML = '';
        });

        // Weather toggle buttons
        d.btnWeatherClear.addEventListener('click', () => this.setWeatherUI('clear'));
        d.btnWeatherRain.addEventListener('click', () => this.setWeatherUI('rain'));
        d.btnWeatherFog.addEventListener('click', () => this.setWeatherUI('fog'));

        // Time toggle buttons
        d.btnTimeDay.addEventListener('click', () => {
            this.engine.dayNight.setTimeOfDay('day');
            this.logMessage('Environment override: Solar Noon Phase', 'weather');
            this.toggleActiveTimeBtn(d.btnTimeDay);
        });
        d.btnTimeSunset.addEventListener('click', () => {
            this.engine.dayNight.setTimeOfDay('sunset');
            this.logMessage('Environment override: Sunset Golden hour', 'weather');
            this.toggleActiveTimeBtn(d.btnTimeSunset);
        });
        d.btnTimeNight.addEventListener('click', () => {
            this.engine.dayNight.setTimeOfDay('night');
            this.logMessage('Environment override: Deep Solar Cover', 'weather');
            this.toggleActiveTimeBtn(d.btnTimeNight);
        });
        d.btnTimeAuto.addEventListener('click', () => {
            this.engine.dayNight.isAutoCycle = true;
            this.logMessage('Environment auto-cycle re-enabled', 'action');
            this.toggleActiveTimeBtn(d.btnTimeAuto);
        });

        // Camera control zoom-in / rotate
        document.getElementById('cam-zoom-in').addEventListener('click', () => {
            this.engine.camera.adjustZoom(0.15);
            this.logMessage('Camera focus adjusted: ZOOM IN', 'system');
        });
        document.getElementById('cam-zoom-out').addEventListener('click', () => {
            this.engine.camera.adjustZoom(-0.15);
            this.logMessage('Camera focus adjusted: ZOOM OUT', 'system');
        });
        document.getElementById('cam-rotate-left').addEventListener('click', () => {
            this.engine.camera.rotate(-Math.PI / 8);
            this.logMessage('Camera rotation offset adjusted CCW', 'system');
        });
        document.getElementById('cam-rotate-right').addEventListener('click', () => {
            this.engine.camera.rotate(Math.PI / 8);
            this.logMessage('Camera rotation offset adjusted CW', 'system');
        });
    }

    setWeatherUI(type) {
        this.engine.weather.setWeather(type);
        this.logMessage(`Meteorological conditions altered to: ${type.toUpperCase()}`, 'weather');

        // Active states toggling
        const d = this.dom;
        d.btnWeatherClear.classList.remove('active');
        d.btnWeatherRain.classList.remove('active');
        d.btnWeatherFog.classList.remove('active');

        if (type === 'clear') d.btnWeatherClear.classList.add('active');
        if (type === 'rain') d.btnWeatherRain.classList.add('active');
        if (type === 'fog') d.btnWeatherFog.classList.add('active');
    }

    toggleActiveTimeBtn(activeBtn) {
        const d = this.dom;
        d.btnTimeDay.classList.remove('active');
        d.btnTimeSunset.classList.remove('active');
        d.btnTimeNight.classList.remove('active');
        d.btnTimeAuto.classList.remove('active');
        activeBtn.classList.add('active');
    }

    // Interactive Virtual Joystick support for Mobile/Touch
    initMobileControls() {
        const d = this.dom;
        if (!d.joystickBoundary) return;

        let activeTouchId = null;
        const boundaryRadius = 55; // 110px diameter / 2
        const originX = boundaryRadius;
        const originY = boundaryRadius;

        // Joystick Move calculations
        const handleJoystickMove = (clientX, clientY) => {
            const rect = d.joystickBoundary.getBoundingClientRect();
            const touchX = clientX - rect.left;
            const touchY = clientY - rect.top;

            // Calculate angle and displacement from boundary center
            const dx = touchX - originX;
            const dy = touchY - originY;
            const distance = Math.hypot(dx, dy);

            // Angle of rotation
            const angle = Math.atan2(dy, dx);
            const clampDistance = Math.min(distance, boundaryRadius - 10);

            // Position visual joystick knob
            const knobX = Math.cos(angle) * clampDistance;
            const knobY = Math.sin(angle) * clampDistance;

            d.joystickKnob.style.transform = `translate(${knobX}px, ${knobY}px)`;

            // Inject player input coordinates triggers
            const player = this.engine.player;
            if (clampDistance > 10) {
                // Determine direction based on segment sectors
                player.keys.up = knobY < -15;
                player.keys.down = knobY > 15;
                player.keys.left = knobX < -15;
                player.keys.right = knobX > 15;
            } else {
                player.keys.up = player.keys.down = player.keys.left = player.keys.right = false;
            }
        };

        // Touch Listeners
        d.joystickBoundary.addEventListener('touchstart', e => {
            if (activeTouchId !== null) return;
            const touch = e.changedTouches[0];
            activeTouchId = touch.identifier;
            handleJoystickMove(touch.clientX, touch.clientY);
        });

        d.joystickBoundary.addEventListener('touchmove', e => {
            if (activeTouchId === null) return;
            for (let touch of e.touches) {
                if (touch.identifier === activeTouchId) {
                    handleJoystickMove(touch.clientX, touch.clientY);
                    break;
                }
            }
        });

        const resetJoystick = () => {
            activeTouchId = null;
            d.joystickKnob.style.transform = 'translate(0px, 0px)';
            const player = this.engine.player;
            player.keys.up = player.keys.down = player.keys.left = player.keys.right = false;
        };

        d.joystickBoundary.addEventListener('touchend', resetJoystick);
        d.joystickBoundary.addEventListener('touchcancel', resetJoystick);

        // Mobile Buttons Events
        d.btnSprint.addEventListener('touchstart', () => {
            this.engine.player.isSprinting = true;
            this.logMessage('Mobile sprint activated', 'action');
        });
        d.btnSprint.addEventListener('touchend', () => {
            this.engine.player.isSprinting = false;
        });

        d.btnAction.addEventListener('touchstart', () => {
            this.logMessage('Interactive trigger: Scanning nearby blocks...', 'action');
            this.engine.camera.adjustZoom(0.05);
        });
    }

    // Appending items in visual scrolling Terminal widget
    logMessage(text, category = 'system') {
        const time = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = 'terminal-row';

        let catClass = 'log-system';
        if (category === 'weather') catClass = 'log-weather';
        if (category === 'action') catClass = 'log-action';

        logEntry.innerHTML = `
            <span class="log-entry log-time">[${time}]</span>
            <span class="log-entry ${catClass}">[${category.toUpperCase()}]</span>
            <span class="log-entry">${text}</span>
        `;

        const d = this.dom;
        d.terminalLogger.appendChild(logEntry);
        d.terminalLogger.scrollTop = d.terminalLogger.scrollHeight;
    }

    update(fps) {
        const d = this.dom;
        const player = this.engine.player;
        const world = this.engine.world;
        const cycle = this.engine.dayNight;

        // Time updates
        d.gameTime.innerText = cycle.getTimeString();
        d.gameDay.innerText = `CYCLE HOUR: ${Math.floor(cycle.timeInHours).toString().padStart(2, '0')}`;

        // Coordinates speed metrics
        d.playerCoords.innerText = `X: ${player.x.toFixed(1)}, Y: ${player.y.toFixed(1)}`;
        d.playerSpeed.innerText = `${(player.speed * 6.5).toFixed(1)} km/h`;
        d.playerZone.innerText = player.currentZoneName;

        // Engines frames tracker
        d.fpsStatus.innerText = `FPS: ${fps} // WEB_AUDIO_SYNTH_UP`;

        // Telemetry details syncs
        d.teleTheme.innerText = cycle.isNight ? 'Dark Solar Phase' : 'Daylight Platform';
        d.teleWeather.innerText = this.engine.weather.activeWeather.toUpperCase();
        d.teleCars.innerText = `${this.engine.traffic.vehicles.length} Autos / 1 Train`;
        d.teleWind.innerText = `${(this.engine.weather.windSpeed * 8.5).toFixed(1)} km/h NW`;

        // Animate simulation hardware resources graphs (random fluctuated telemetry values)
        const loadGrid = Math.floor(20 + Math.sin(Date.now() / 1500) * 8 + Math.random() * 3);
        const loadEntities = Math.floor(15 + Math.cos(Date.now() / 2000) * 4 + Math.random() * 2);
        const loadParticles = this.engine.weather.activeWeather === 'rain' ? 44 : 12;

        d.loadValGrid.innerText = `${loadGrid}%`;
        d.loadValEntities.innerText = `${loadEntities}%`;
        d.loadValParticles.innerText = `${loadParticles}%`;

        d.loadFillGrid.style.width = `${loadGrid}%`;
        d.loadFillEntities.style.width = `${loadEntities}%`;
        d.loadFillParticles.style.width = `${loadParticles}%`;
    }
}

// Export class globally
window.UIController = UIController;
