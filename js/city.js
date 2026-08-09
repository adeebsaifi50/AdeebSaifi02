/**
 * Metropolis Directive - Central Game Engine (js/city.js)
 *
 * Central orchestrator. Coordinates canvas sizing, initializes rendering context loops,
 * maintains frame timing updates, and loads/restores configuration states from LocalStorage.
 */

class SimulationEngine {
    constructor() {
        this.canvas = document.getElementById('city-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Clock tracking
        this.lastTime = performance.now();
        this.frameCount = 0;
        this.fps = 60;
        this.fpsTimer = 0;

        // Core component structures
        this.world = new WorldMap();
        this.player = new PlayerEntity(this.world);
        this.camera = new CameraController();
        this.traffic = new TrafficManager(this.world);
        this.weather = new WeatherController(this.world);
        this.dayNight = new DayNightCycle();
        this.ui = new UIController(this);

        this.initCanvasSize();
        this.loadSettings();

        // Bind animation loops
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    initCanvasSize() {
        const container = document.getElementById('canvas-container-box');
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;

        window.addEventListener('resize', () => {
            this.canvas.width = container.clientWidth;
            this.canvas.height = container.clientHeight;
        });
    }

    // Load state settings from LocalStorage
    loadSettings() {
        try {
            const savedWeather = localStorage.getItem('metropolis_weather');
            const savedTime = localStorage.getItem('metropolis_time_hour');
            const savedPosX = localStorage.getItem('metropolis_player_x');
            const savedPosY = localStorage.getItem('metropolis_player_y');

            if (savedWeather) {
                this.weather.setWeather(savedWeather);
                this.ui.setWeatherUI(savedWeather);
            }
            if (savedTime) {
                this.dayNight.timeInHours = parseFloat(savedTime);
            }
            if (savedPosX && savedPosY) {
                this.player.setPosition(parseFloat(savedPosX), parseFloat(savedPosY));
            }
        } catch (err) {
            console.warn('LocalStorage preferences loading failed:', err);
        }
    }

    // Save state settings to LocalStorage
    saveSettings() {
        try {
            localStorage.setItem('metropolis_weather', this.weather.activeWeather);
            localStorage.setItem('metropolis_time_hour', this.dayNight.timeInHours.toString());
            localStorage.setItem('metropolis_player_x', this.player.x.toString());
            localStorage.setItem('metropolis_player_y', this.player.y.toString());
        } catch (err) {
            console.warn('LocalStorage write failed:', err);
        }
    }

    animate(now) {
        // Frame pacing
        let dt = now - this.lastTime;
        if (dt > 100) dt = 16.67; // Safeguard tab focal pause gaps
        this.lastTime = now;

        // FPS Calculations
        this.frameCount++;
        this.fpsTimer += dt;
        if (this.fpsTimer >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsTimer = 0;

            // Autosave positions and state every second
            this.saveSettings();
        }

        this.update(dt);
        this.draw();

        requestAnimationFrame(this.animate);
    }

    update(dt) {
        this.world.update(dt);
        this.player.update();
        this.traffic.update(dt);
        this.weather.update(dt);
        this.dayNight.update(dt);
        this.camera.update(this.player.x, this.player.y, this.canvas.width, this.canvas.height);
        this.ui.update(this.fps);
    }

    draw() {
        // Clear canvas frame
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();

        // Translate visual matrix context around smooth lerp camera
        this.camera.applyTransforms(this.ctx, this.canvas.width, this.canvas.height);

        // 1. Draw static grid grass roads
        this.world.draw(this.ctx, this.dayNight.isNight);

        // 2. Draw dynamic shadow vectors stretching corresponding to sun angles
        this.dayNight.drawDynamicShadows(this.ctx, this.world, this.player);

        // 3. Draw automated lane-traffic cars, buses, and trucks
        this.traffic.draw(this.ctx, this.dayNight.isNight);

        // 4. Draw player entity
        this.player.draw(this.ctx, this.dayNight.isNight);

        // 5. If night phases, overlay street light radial illumination gradients
        if (this.dayNight.isNight) {
            this.world.drawStreetLightGlows(this.ctx);
        }

        // 6. Draw floating wind clouds, flock birds, and slanted rain raindrops
        this.weather.draw(this.ctx);

        this.ctx.restore();

        // 7. Render screen ambient lighting filters corresponding to sunrise, noon, sunset, night
        this.dayNight.drawAmbientFilter(this.ctx, this.canvas.width, this.canvas.height);
    }
}

// Instantiate engine when document loading is fully done
window.addEventListener('DOMContentLoaded', () => {
    window.CitySimulation = new SimulationEngine();
});
