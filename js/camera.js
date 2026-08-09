/**
 * Metropolis Directive - Camera Module (js/camera.js)
 *
 * Camera module supporting smooth interpolation tracking (lerping),
 * custom zoom scaling, viewport rotation, and viewport transformations.
 */

class CameraController {
    constructor() {
        this.x = 0;
        this.y = 0;

        // Lens properties
        this.zoom = 1.0;
        this.minZoom = 0.35;
        this.maxZoom = 2.0;

        this.rotation = 0; // Viewport rotation in radians

        // Elastic interpolation coefficient
        this.lerpFactor = 0.08;

        // Mode system: 'follow', 'free', 'drone'
        this.mode = 'follow';

        // Drone attributes
        this.altitude = 120; // 120m to 500m
        this.droneWave = 0;
        this.originalZoom = 1.0;

        // Free mode coords
        this.freeX = 800;
        this.freeY = 450;
        this.freeSpeed = 8;

        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false
        };

        this.initFreeControls();
    }

    initFreeControls() {
        window.addEventListener('keydown', e => {
            if (this.mode !== 'free') return;
            const k = e.key.toLowerCase();
            if (k === 'w' || e.key === 'ArrowUp') this.keys.up = true;
            if (k === 's' || e.key === 'ArrowDown') this.keys.down = true;
            if (k === 'a' || e.key === 'ArrowLeft') this.keys.left = true;
            if (k === 'd' || e.key === 'ArrowRight') this.keys.right = true;
        });

        window.addEventListener('keyup', e => {
            const k = e.key.toLowerCase();
            if (k === 'w' || e.key === 'ArrowUp') this.keys.up = false;
            if (k === 's' || e.key === 'ArrowDown') this.keys.down = false;
            if (k === 'a' || e.key === 'ArrowLeft') this.keys.left = false;
            if (k === 'd' || e.key === 'ArrowRight') this.keys.right = false;
        });
    }

    setMode(newMode) {
        this.mode = newMode;
        if (newMode === 'free') {
            // Seed free coordinate from current camera position
            this.freeX = this.x + 400; // approximation of focus point
            this.freeY = this.y + 260;
        } else if (newMode === 'drone') {
            this.altitude = 250;
            this.zoom = 0.65;
            this.rotation = 0.03; // slight angle offset for cyberpunk drone feeds
        } else {
            this.zoom = 1.0;
            this.rotation = 0;
            this.altitude = 120;
        }
    }

    // Attach tracking system to standard canvas width/height
    update(playerX, playerY, viewW, viewH) {
        let targetX = 0;
        let targetY = 0;

        if (this.mode === 'free') {
            // Translate camera independent of player entity
            let dx = 0;
            let dy = 0;
            if (this.keys.up) dy -= 1;
            if (this.keys.down) dy += 1;
            if (this.keys.left) dx -= 1;
            if (this.keys.right) dx += 1;

            const mag = Math.hypot(dx, dy);
            if (mag > 0) {
                this.freeX += (dx / mag) * this.freeSpeed;
                this.freeY += (dy / mag) * this.freeSpeed;
            }

            // Keep within world bounds
            this.freeX = Math.max(0, Math.min(4000, this.freeX));
            this.freeY = Math.max(0, Math.min(4000, this.freeY));

            targetX = this.freeX - (viewW / 2) / this.zoom;
            targetY = this.freeY - (viewH / 2) / this.zoom;

            // Follow free position quickly
            this.x += (targetX - this.x) * 0.15;
            this.y += (targetY - this.y) * 0.15;

        } else if (this.mode === 'drone') {
            // Apply drone high-altitude oscillating waves
            this.droneWave += 0.015;
            const swayX = Math.sin(this.droneWave) * 15;
            const swayY = Math.cos(this.droneWave * 0.7) * 15;

            // Slight sway rotation
            this.rotation = 0.02 * Math.sin(this.droneWave * 0.5);

            // Dynamic zoom matching altitude
            this.zoom = Math.max(0.35, 1.2 - (this.altitude / 500));

            targetX = (playerX + swayX) - (viewW / 2) / this.zoom;
            targetY = (playerY + swayY) - (viewH / 2) / this.zoom;

            this.x += (targetX - this.x) * this.lerpFactor;
            this.y += (targetY - this.y) * this.lerpFactor;

        } else {
            // Standard Follow tracking
            this.rotation = 0;
            targetX = playerX - (viewW / 2) / this.zoom;
            targetY = playerY - (viewH / 2) / this.zoom;

            this.x += (targetX - this.x) * this.lerpFactor;
            this.y += (targetY - this.y) * this.lerpFactor;
        }
    }

    // Apply scaling translation matrix rotations
    applyTransforms(ctx, viewW, viewH) {
        // Translate to screen center, rotate, zoom, and translate back
        ctx.translate(viewW / 2, viewH / 2);
        ctx.rotate(this.rotation);
        ctx.scale(this.zoom, this.zoom);
        ctx.translate(-viewW / 2, -viewH / 2);

        // Standard camera viewport offsets translation
        ctx.translate(-this.x, -this.y);
    }

    adjustZoom(amount) {
        this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom + amount));
    }

    rotate(amount) {
        this.rotation += amount;
    }

    resetRotation() {
        this.rotation = 0;
    }
}

// Export class globally
window.CameraController = CameraController;
