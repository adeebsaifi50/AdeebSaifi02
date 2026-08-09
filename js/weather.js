/**
 * Metropolis Directive - Meteorological Weather Module (js/weather.js)
 *
 * Manages atmospheric particle elements: Wind sway vectors, Rain droplets
 * with splashing collisions, drifting clouds across map, and fog coefficients.
 */

class WeatherController {
    constructor(world) {
        this.world = world;
        this.activeWeather = 'clear'; // clear, rain, fog

        // Rain parameters
        this.rainDrops = [];
        this.maxRainDrops = 400;

        // Clouds parameters
        this.clouds = [];
        this.maxClouds = 12;

        // Birds parameters
        this.birds = [];
        this.maxBirds = 15;

        // Wind speed coefficients
        this.windSpeed = 2.5; // moves cloud sheets and alters rain angles
        this.windAngle = Math.PI / 6;

        this.initAtmosphere();
    }

    initAtmosphere() {
        // Spawn drifting cloud sheets
        for (let i = 0; i < this.maxClouds; i++) {
            this.clouds.push({
                x: Math.random() * this.world.width,
                y: Math.random() * this.world.height,
                w: Math.random() * 250 + 150,
                h: Math.random() * 120 + 80,
                speed: Math.random() * 0.4 + 0.1,
                opacity: Math.random() * 0.2 + 0.05
            });
        }

        // Spawn flying birds
        for (let i = 0; i < this.maxBirds; i++) {
            this.birds.push({
                x: Math.random() * this.world.width,
                y: Math.random() * this.world.height,
                vx: Math.random() * 1.5 + 1.0,
                vy: (Math.random() - 0.5) * 0.5,
                wingCycle: Math.random() * Math.PI * 2
            });
        }
    }

    setWeather(type) {
        this.activeWeather = type;
        if (type === 'rain') {
            // Instantiate drop pool arrays
            this.rainDrops = [];
            for (let i = 0; i < this.maxRainDrops; i++) {
                this.spawnRaindrop(true);
            }
        }
    }

    spawnRaindrop(randomY = false) {
        this.rainDrops.push({
            x: Math.random() * this.world.width,
            y: randomY ? Math.random() * this.world.height : -20,
            z: Math.random() * 100 + 50, // Height ceiling
            speed: Math.random() * 18 + 12,
            length: Math.random() * 15 + 10
        });
    }

    update(dt) {
        // Update clouds
        this.clouds.forEach(cloud => {
            cloud.x += cloud.speed * this.windSpeed;
            if (cloud.x > this.world.width + cloud.w) {
                cloud.x = -cloud.w;
                cloud.y = Math.random() * this.world.height;
            }
        });

        // Update birds
        this.birds.forEach(bird => {
            bird.x += bird.vx;
            bird.y += bird.vy;
            bird.wingCycle += 0.15;

            // Screen wrapping birds
            if (bird.x > this.world.width + 50) {
                bird.x = -50;
                bird.y = Math.random() * this.world.height;
            }
        });

        // Update rain particles
        if (this.activeWeather === 'rain') {
            this.rainDrops.forEach((drop, idx) => {
                // Descend coordinates
                drop.y += drop.speed;
                drop.x += Math.sin(this.windAngle) * this.windSpeed;

                // Ground landing check
                if (drop.y > this.world.height + 20) {
                    this.rainDrops.splice(idx, 1);
                    this.spawnRaindrop(false);
                }
            });
        }
    }

    draw(ctx) {
        // Draw birds flying in sky
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1.5;
        this.birds.forEach(bird => {
            ctx.beginPath();
            const wingY = Math.sin(bird.wingCycle) * 6;
            ctx.moveTo(bird.x - 8, bird.y + wingY);
            ctx.lineTo(bird.x, bird.y);
            ctx.lineTo(bird.x + 8, bird.y + wingY);
            ctx.stroke();
        });

        // Draw cloud cover sheets
        ctx.fillStyle = '#ffffff';
        this.clouds.forEach(cloud => {
            ctx.save();
            ctx.globalAlpha = cloud.opacity;
            ctx.beginPath();
            ctx.ellipse(cloud.x, cloud.y, cloud.w, cloud.h, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // Draw Rain streaks
        if (this.activeWeather === 'rain') {
            ctx.strokeStyle = 'rgba(156, 163, 175, 0.45)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            this.rainDrops.forEach(drop => {
                const rx_end = drop.x + Math.sin(this.windAngle) * drop.length;
                ctx.moveTo(drop.x, drop.y);
                ctx.lineTo(rx_end, drop.y + drop.length);
            });
            ctx.stroke();
        }

        // Draw fog atmospheric visibility filter overlay
        if (this.activeWeather === 'fog') {
            ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
            ctx.fillRect(0, 0, this.world.width, this.world.height);
        }
    }
}

// Export class globally
window.WeatherController = WeatherController;
