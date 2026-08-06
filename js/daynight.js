/**
 * Metropolis Directive - Diurnal Cycle Module (js/daynight.js)
 *
 * Dynamically updates simulation clocks and maps environmental lighting filters
 * (Sunrise, Noon, Sunset, Night). Synthesizes and rotates shadow projection vectors
 * corresponding to changing sun positioning coordinates.
 */

class DayNightCycle {
    constructor() {
        // Clock variables
        this.timeInHours = 8.0; // Starts at 08:00 AM
        this.cycleSpeed = 0.005; // Game hours elapsed per frame loop update
        this.isAutoCycle = true;

        // Visual overlays hex filters corresponding to time
        this.ambientColors = {
            day: 'rgba(0, 0, 0, 0)',
            sunrise: 'rgba(249, 115, 22, 0.18)', // Orange warmth
            sunset: 'rgba(157, 23, 77, 0.22)',   // Purple deep glow
            night: 'rgba(3, 3, 10, 0.65)'        // Deep night mask
        };

        this.currentAmbientFilter = this.ambientColors.day;
        this.isNight = false;

        // Sun vector coordinate angles for casting dynamic shadows
        this.shadowAngle = 0;
        this.shadowLengthFactor = 0;
    }

    update(dt) {
        if (this.isAutoCycle) {
            this.timeInHours += this.cycleSpeed;
            if (this.timeInHours >= 24.0) {
                this.timeInHours = 0.0;
            }
        }

        this.calculateLighting();
    }

    setTimeOfDay(phase) {
        this.isAutoCycle = false;
        if (phase === 'day') this.timeInHours = 12.0;
        else if (phase === 'sunset') this.timeInHours = 18.5;
        else if (phase === 'night') this.timeInHours = 22.0;
    }

    calculateLighting() {
        const hour = this.timeInHours;
        this.isNight = (hour >= 19.5 || hour < 5.5);

        // Map colors & shadows based on timeline
        if (hour >= 5.5 && hour < 8.0) {
            // Sunrise transitions
            this.currentAmbientFilter = this.ambientColors.sunrise;
            this.shadowLengthFactor = 1.4 - ((hour - 5.5) / 2.5);
            this.shadowAngle = Math.PI * 0.9;
        } else if (hour >= 8.0 && hour < 17.0) {
            // Day bright, minimal shadow stretches
            this.currentAmbientFilter = this.ambientColors.day;
            this.shadowLengthFactor = 0.25;
            this.shadowAngle = Math.PI * 0.5;
        } else if (hour >= 17.0 && hour < 19.5) {
            // Sunset transition
            this.currentAmbientFilter = this.ambientColors.sunset;
            this.shadowLengthFactor = ((hour - 17.0) / 2.5) * 1.5;
            this.shadowAngle = Math.PI * 0.1;
        } else {
            // Night covers
            this.currentAmbientFilter = this.ambientColors.night;
            this.shadowLengthFactor = 0.8; // moon shadow factor
            this.shadowAngle = Math.PI * 1.25;
        }
    }

    // Shadow projections drawn before structure layouts
    drawDynamicShadows(ctx, world, player) {
        const length = this.shadowLengthFactor;
        const angle = this.shadowAngle;
        const dx = Math.cos(angle) * length;
        const dy = Math.sin(angle) * length;

        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)'; // Semi-transparent black shadow

        // 1. Draw Player Shadow
        ctx.beginPath();
        ctx.ellipse(player.x + dx * 10, player.y + dy * 10, player.radius, player.radius * 0.5, angle, 0, Math.PI * 2);
        ctx.fill();

        // 2. Draw Buildings Shadows stretching outwards
        world.buildings.forEach(b => {
            ctx.beginPath();
            // Projecting the 4 roof points down on map
            const x1 = b.x; const y1 = b.y;
            const x2 = b.x + b.w; const y2 = b.y;
            const x3 = b.x + b.w; const y3 = b.y + b.h;
            const x4 = b.x; const y4 = b.y + b.h;

            // Project offsets based on sun angle height factor
            const px1 = x1 + dx * 60; const py1 = y1 + dy * 60;
            const px2 = x2 + dx * 60; const py2 = y2 + dy * 60;
            const px3 = x3 + dx * 60; const py3 = y3 + dy * 60;
            const px4 = x4 + dx * 60; const py4 = y4 + dy * 60;

            ctx.moveTo(x1, y1);
            ctx.lineTo(px1, py1);
            ctx.lineTo(px2, py2);
            ctx.lineTo(px3, py3);
            ctx.lineTo(px4, py4);
            ctx.lineTo(x4, y4);
            ctx.closePath();
            ctx.fill();
        });

        // 3. Draw Foliage trees shadows
        world.scenery.forEach(item => {
            if (item.type === 'tree') {
                ctx.beginPath();
                ctx.ellipse(item.x + dx * 15, item.y + dy * 15, item.size, item.size * 0.4, angle, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        ctx.restore();
    }

    // Ambient overlay drawn over viewport camera coordinates
    drawAmbientFilter(ctx, width, height) {
        if (this.currentAmbientFilter !== this.ambientColors.day) {
            ctx.fillStyle = this.currentAmbientFilter;
            ctx.fillRect(0, 0, width, height);
        }
    }

    // Get time string format
    getTimeString() {
        const hour = Math.floor(this.timeInHours);
        const mins = Math.floor((this.timeInHours % 1) * 60).toString().padStart(2, '0');
        const amp = hour >= 12 ? 'PM' : 'AM';
        const dispHour = (hour % 12 || 12).toString().padStart(2, '0');
        return `${dispHour}:${mins} ${amp}`;
    }
}

// Export class globally
window.DayNightCycle = DayNightCycle;
